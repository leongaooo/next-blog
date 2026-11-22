'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import Lion2 from '@/data/lion2.png'
import { lionSilhouette } from '@/data/lionSilhouette'

const SIZE = 96
const DEG = Math.PI / 180
const SCAN_PERIOD = 4.2

const PALETTES = {
  light: {
    color: '#0f3d45',
    emissive: '#0f5a66',
    idleIntensity: 0.12,
    hoverIntensity: 0.42,
    scanColor: '#0f5a66',
    shadowColor: '#b8d8d3',
    shadowOpacity: 0.18,
    shadowZ: -0.06,
  },
  dark: {
    color: '#5be1c9',
    emissive: '#2ad6b8',
    idleIntensity: 0.55,
    hoverIntensity: 0.85,
    scanColor: '#a9f0e0',
    shadowColor: '#2a4a52',
    shadowOpacity: 0.35,
    shadowZ: -0.05,
  },
}

export default function LionMark() {
  const shellRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hovered = useRef(false)
  const reset = useRef(false)
  const [showCanvas, setShowCanvas] = useState(false)

  useEffect(() => {
    const shell = shellRef.current
    const canvas = canvasRef.current
    if (!shell || !canvas || (navigator.hardwareConcurrency || 8) <= 4) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const homeLink = shell.closest('a')
    const onLinkClick = (event: MouseEvent) => {
      if (event.detail === 0 || shell.contains(event.target as Node)) {
        hovered.current = false
        reset.current = true
      }
    }
    let disposed = false
    let setupStarted = false
    let syncDisplay: (() => void) | undefined
    let disposeScene: (() => void) | undefined

    const setup = async () => {
      const THREE = await import('three')
      if (disposed) return

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      disposeScene = () => renderer.dispose()
      renderer.setClearAlpha(0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(SIZE, SIZE, false)

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10)
      camera.position.z = 2.6
      // Frame one world unit in the 96px viewport at the silhouette's center.
      camera.zoom = 2 * camera.position.z * Math.tan((camera.fov * DEG) / 2)
      camera.updateProjectionMatrix()

      const points = lionSilhouette.map(([x, y]) => new THREE.Vector3(x - 0.5, 0.5 - y, 0))
      const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal')
      const outlineGeometry = new THREE.TubeGeometry(curve, 240, 0.0105, 5, true)
      const shadowGeometry = new THREE.TubeGeometry(curve, 240, 0.0118, 5, true)

      const root = document.documentElement
      const readPalette = () => (root.classList.contains('dark') ? PALETTES.dark : PALETTES.light)
      let palette = readPalette()
      const outlineMaterial = new THREE.MeshStandardMaterial({
        color: palette.color,
        emissive: palette.emissive,
        emissiveIntensity: palette.idleIntensity,
        metalness: 0.1,
        roughness: 0.35,
      })
      const scanCenter = { value: 0 }
      const scanColor = { value: new THREE.Color(palette.scanColor) }
      const scanIntensity = { value: 1 }
      outlineMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.lionScanCenter = scanCenter
        shader.uniforms.lionScanColor = scanColor
        shader.uniforms.lionScanIntensity = scanIntensity
        shader.vertexShader =
          'varying float vLionU;\n' +
          shader.vertexShader.replace(
            '#include <uv_vertex>',
            '#include <uv_vertex>\n  vLionU = uv.x;'
          )
        shader.fragmentShader =
          'varying float vLionU;\nuniform float lionScanCenter;\n' +
          'uniform vec3 lionScanColor;\nuniform float lionScanIntensity;\n' +
          shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
            float lionDistance = abs(fract(vLionU - lionScanCenter + 0.5) - 0.5);
            float lionBand = 1.0 - smoothstep(0.0, 0.09, lionDistance);
            totalEmissiveRadiance = mix(totalEmissiveRadiance, lionScanColor * lionScanIntensity, lionBand);`
          )
      }

      const shadowMaterial = new THREE.MeshBasicMaterial({
        color: palette.shadowColor,
        transparent: true,
        opacity: palette.shadowOpacity,
        depthWrite: false,
      })
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial)
      shadow.position.z = palette.shadowZ

      const themeObserver = new MutationObserver(() => {
        const nextPalette = readPalette()
        if (nextPalette === palette) return

        palette = nextPalette
        outlineMaterial.color.set(palette.color)
        outlineMaterial.emissive.set(palette.emissive)
        scanColor.value.set(palette.scanColor)
        shadowMaterial.color.set(palette.shadowColor)
        shadowMaterial.opacity = palette.shadowOpacity
        shadow.position.z = palette.shadowZ
      })

      const tilt = new THREE.Group()
      tilt.rotation.set(3 * DEG, -8 * DEG, 0)
      const mark = new THREE.Group()
      mark.add(new THREE.Mesh(outlineGeometry, outlineMaterial), shadow)
      tilt.add(mark)

      const key = new THREE.DirectionalLight(0xffffff, 0.8)
      key.position.set(-2, 3, 2)
      const rim = new THREE.DirectionalLight('#a9f0e0', 0.3)
      rim.position.set(0, -1, -3)
      const scene = new THREE.Scene()
      scene.add(tilt, new THREE.AmbientLight(0xffffff, 0.35), key, rim)

      let frame: number | undefined
      let lastTime: number | undefined
      let elapsed = 0
      let sampleStart = 0
      let sampleFrames = 0
      let intersecting = true
      let contextLost = false

      const renderFrame = (time: number) => {
        const hover = hovered.current
        const delta = lastTime === undefined ? 0 : (time - lastTime) / 1000
        lastTime = time
        if (reset.current) {
          elapsed = 0
          scanCenter.value = 0
          reset.current = false
        } else {
          elapsed += delta
          scanCenter.value = (scanCenter.value + (delta * (hover ? 1.6 : 1)) / SCAN_PERIOD) % 1
        }

        const emissive = hover ? palette.hoverIntensity : palette.idleIntensity
        mark.rotation.z = (Math.sin((elapsed * 2 * Math.PI) / 4.4) * 1.2 + (hover ? 1 : 0)) * DEG
        const breath = 1 + Math.sin((elapsed * 2 * Math.PI) / 3.2 + Math.PI / 2) * 0.006
        mark.scale.setScalar(hover ? 1.04 : breath)
        outlineMaterial.emissiveIntensity = emissive
        scanIntensity.value = palette === PALETTES.light ? emissive + 0.25 : 1
        renderer.render(scene, camera)

        if (shell.dataset.lionEmissive !== String(emissive)) {
          shell.dataset.lionEmissive = String(emissive)
          shell.dataset.lionDrawCalls = String(renderer.info.render.calls)
          shell.dataset.lionTriangles = String(renderer.info.render.triangles)
        }
        sampleFrames++
        if (time - sampleStart >= 1000) {
          shell.dataset.lionFps = String(Math.round((sampleFrames * 1000) / (time - sampleStart)))
          sampleStart = time
          sampleFrames = 0
        }
        frame = requestAnimationFrame(renderFrame)
      }

      const stop = () => {
        if (frame !== undefined) cancelAnimationFrame(frame)
        frame = undefined
        lastTime = undefined
        delete shell.dataset.lionFps
      }

      syncDisplay = () => {
        const canRender = !document.hidden && !motion.matches && !contextLost
        if (canRender && intersecting) {
          if (frame === undefined) {
            sampleStart = performance.now()
            sampleFrames = 0
            renderFrame(sampleStart)
          }
        } else {
          stop()
        }
        setShowCanvas(canRender)
      }

      const onContextLost = (event: Event) => {
        event.preventDefault()
        contextLost = true
        syncDisplay?.()
      }
      const onContextRestored = () => {
        contextLost = false
        syncDisplay?.()
      }
      const observer = new IntersectionObserver(([entry]) => {
        intersecting = entry.isIntersecting
        syncDisplay?.()
      })

      disposeScene = () => {
        stop()
        observer.disconnect()
        themeObserver.disconnect()
        canvas.removeEventListener('webglcontextlost', onContextLost)
        canvas.removeEventListener('webglcontextrestored', onContextRestored)
        outlineGeometry.dispose()
        shadowGeometry.dispose()
        outlineMaterial.dispose()
        shadowMaterial.dispose()
        renderer.dispose()
      }

      observer.observe(shell)
      themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })
      canvas.addEventListener('webglcontextlost', onContextLost)
      canvas.addEventListener('webglcontextrestored', onContextRestored)
      syncDisplay()
    }

    const onDisplayChange = () => {
      if (syncDisplay) {
        syncDisplay()
        return
      }
      if (setupStarted || motion.matches || document.hidden) return

      setupStarted = true
      void setup().catch(() => {
        disposeScene?.()
        disposeScene = undefined
        syncDisplay = undefined
        if (!disposed) setShowCanvas(false)
      })
    }
    motion.addEventListener('change', onDisplayChange)
    document.addEventListener('visibilitychange', onDisplayChange)
    homeLink?.addEventListener('click', onLinkClick)
    onDisplayChange()

    return () => {
      disposed = true
      motion.removeEventListener('change', onDisplayChange)
      document.removeEventListener('visibilitychange', onDisplayChange)
      homeLink?.removeEventListener('click', onLinkClick)
      disposeScene?.()
    }
  }, [])

  return (
    <div
      ref={shellRef}
      className="lion-mark relative h-[96px] w-[96px]"
      onPointerEnter={(event) => {
        hovered.current = event.pointerType !== 'touch'
      }}
      onPointerLeave={() => {
        hovered.current = false
      }}
    >
      <Image
        src={Lion2}
        alt="LeonGao 狮子标志"
        width={SIZE}
        height={SIZE}
        className="lion-fallback absolute inset-0 h-[96px] w-[96px] object-contain"
        style={{ opacity: showCanvas ? 0 : 1 }}
        aria-hidden={showCanvas}
      />
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="lion-canvas absolute inset-0 h-[96px] w-[96px]"
        style={{ opacity: showCanvas ? 1 : 0 }}
        role="img"
        aria-label="LeonGao 狮子标志"
        aria-hidden={!showCanvas}
      />
    </div>
  )
}
