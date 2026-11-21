'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react'
import GenerativeArt from './GenerativeArt'
import { scenes, type Scene, type SceneBlock } from '@/data/sceneSpecs'

type ThreeModule = typeof import('three')
type ThreeRenderer = import('three').WebGLRenderer
type ThreeCamera = import('three').PerspectiveCamera
type ThreeScene = import('three').Scene
type ThreeMesh = import('three').InstancedMesh
type ThreeGround = import('three').Mesh
type ThreeMaterial = import('three').ShaderMaterial
type ThreeGeometry = import('three').BufferGeometry
type ThreeLine = import('three').LineSegments

const MAX_BLOCKS = 20
const MAX_HEIGHT = 4.2
const TRANSITION_MS = 600

const vertexShader = [
  'attribute float aTone;',
  'attribute float aHero;',
  'attribute float aInstanceId;',
  'varying vec3 vWorldPosition;',
  'varying vec3 vWorldNormal;',
  'varying vec3 vViewDirection;',
  'varying float vTone;',
  'varying float vHero;',
  'varying float vInstanceId;',
  'void main() {',
  '  vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);',
  '  vWorldPosition = worldPosition.xyz;',
  '  vWorldNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);',
  '  vViewDirection = normalize(cameraPosition - worldPosition.xyz);',
  '  vTone = aTone;',
  '  vHero = aHero;',
  '  vInstanceId = aInstanceId;',
  '  gl_Position = projectionMatrix * viewMatrix * worldPosition;',
  '}',
].join('\n')

const fragmentShader = [
  'uniform float uTime;',
  'uniform float uScanY;',
  'uniform float uScanWidth;',
  'uniform float uHoverIndex;',
  'uniform float uFocusIndex;',
  'uniform float uFocusActive;',
  'uniform vec3 uBaseColor;',
  'uniform vec3 uAccentColor;',
  'uniform vec3 uMutedColor;',
  'uniform vec3 uFogColor;',
  'uniform float uFogNear;',
  'uniform float uFogFar;',
  'varying vec3 vWorldPosition;',
  'varying vec3 vWorldNormal;',
  'varying vec3 vViewDirection;',
  'varying float vTone;',
  'varying float vHero;',
  'varying float vInstanceId;',
  'float hash(vec3 point) {',
  '  return fract(sin(dot(point, vec3(12.9898, 78.233, 37.719))) * 43758.5453);',
  '}',
  'void main() {',
  '  vec3 sourceColor = vTone > 1.5 ? uMutedColor : (vTone > 0.5 ? uAccentColor : uBaseColor);',
  '  float topLight = smoothstep(0.25, 0.92, vWorldNormal.y);',
  '  float sideLight = smoothstep(-0.2, 0.85, vWorldNormal.x * 0.45 + vWorldNormal.z * 0.55);',
  '  float faceShade = mix(0.76, 1.08, topLight) * mix(0.9, 1.0, sideLight);',
  '  float surfaceNoise = (hash(floor(vWorldPosition * 5.0) + uTime * 0.025) - 0.5) * 0.05;',
  '  float scan = 1.0 - smoothstep(0.0, uScanWidth, abs(vWorldPosition.y - uScanY));',
  '  float fresnel = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0), 5.0);',
  '  float hover = abs(vInstanceId - uHoverIndex) < 0.5 ? 1.0 : 0.0;',
  '  float heroGlow = vHero * 0.08;',
  '  float focusAlpha = uFocusActive > 0.5 && abs(vInstanceId - uFocusIndex) > 0.5 ? 0.35 : 1.0;',
  '  vec3 color = sourceColor * (faceShade + surfaceNoise);',
  '  color += vTone < 0.5 ? uBaseColor * 0.12 : vec3(0.0);',
  '  float accentAdd = min(fresnel * 0.16 + scan * 0.12 + hover * 0.08 + heroGlow, 0.42);',
  '  color += uAccentColor * accentAdd;',
  '  color = mix(color, uAccentColor, min(scan * topLight * 0.12, 0.08));',
  '  float cameraDistance = length(cameraPosition - vWorldPosition);',
  '  float fogAmount = smoothstep(uFogNear, uFogFar, cameraDistance);',
  '  color = mix(color, uFogColor, fogAmount * 0.42);',
  '  color = vec3(1.0) - exp(-color * 1.15);',
  '  gl_FragColor = vec4(color, focusAlpha);',
  '}',
].join('\n')

type HudStats = { fps: number; drawCalls: number }
type SelectedBlock = { block: SceneBlock; index: number; sceneIndex: number }

function toneValue(tone: SceneBlock['tone']) {
  return tone === 'accent' ? 1 : tone === 'muted' ? 2 : 0
}

function colorValue(value: string, fallback: string) {
  const match = value.match(/^#?([0-9a-f]{6})$/i)
  return match ? '#' + match[1] : fallback
}

function sceneColor(scene: Scene, key: 'blockTop' | 'accentTop' | 'mutedTop') {
  return colorValue(scene.palette[key], key === 'accentTop' ? '#5be1c9' : '#3d4a56')
}

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function blockId(index: number) {
  return 'block-' + String(index + 1).padStart(2, '0')
}

export default function HeroScene() {
  const shellRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const threeRef = useRef<ThreeModule | null>(null)
  const rendererRef = useRef<ThreeRenderer | null>(null)
  const sceneRef = useRef<ThreeScene | null>(null)
  const cameraRef = useRef<ThreeCamera | null>(null)
  const meshRef = useRef<ThreeMesh | null>(null)
  const groundRef = useRef<ThreeGround | null>(null)
  const materialRef = useRef<ThreeMaterial | null>(null)
  const geometryRef = useRef<ThreeGeometry | null>(null)
  const gridRef = useRef<ThreeLine | null>(null)
  const raycasterRef = useRef<import('three').Raycaster | null>(null)
  const dummyRef = useRef<import('three').Object3D | null>(null)
  const cameraTargetRef = useRef<import('three').Vector3 | null>(null)
  const cameraPositionRef = useRef<import('three').Vector3 | null>(null)
  const rafRef = useRef<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const mountedRef = useRef(false)
  const visibleRef = useRef(true)
  const documentVisibleRef = useRef(true)
  const sceneIndexRef = useRef(0)
  const hoveredIndexRef = useRef(-1)
  const draggingRef = useRef(false)
  const draggedRef = useRef(false)
  const pointerDownRef = useRef({ x: 0, y: 0 })
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const pointerNdcRef = useRef<import('three').Vector2 | null>(null)
  const rotationRef = useRef({ x: -0.12, y: -0.4 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const zoomRef = useRef(1)
  const lastInteractionRef = useRef(0)
  const frameTimeRef = useRef(0)
  const fpsWindowStartRef = useRef(0)
  const fpsFrameCountRef = useRef(0)
  const currentHeightsRef = useRef(new Float32Array(MAX_BLOCKS))
  const fromHeightsRef = useRef(new Float32Array(MAX_BLOCKS))
  const targetHeightsRef = useRef(new Float32Array(MAX_BLOCKS))
  const transitionStartRef = useRef(0)
  const transitioningRef = useRef(false)

  const [threeReady, setThreeReady] = useState(false)
  const [threeVisible, setThreeVisible] = useState(false)
  const [fallbackOnly, setFallbackOnly] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null)
  const [stats, setStats] = useState<HudStats>({ fps: 0, drawCalls: 0 })
  const [whyOpen, setWhyOpen] = useState(false)
  const [pipeline, setPipeline] = useState([true, true, false, false])

  const activeScene = scenes[sceneIndex]

  const markRender = useCallback(() => {
    setPipeline((current) => [current[0], current[1], true, current[3]])
  }, [])

  const markShip = useCallback(() => {
    setPipeline((current) => [current[0], current[1], true, true])
  }, [])

  const updateGround = useCallback((value: Scene) => {
    const grid = gridRef.current
    const ground = groundRef.current
    const THREE = threeRef.current
    if (!grid || !ground || !THREE || value.blocks.length === 0) return

    const bounds = value.blocks.reduce(
      (result, block) => ({
        minX: Math.min(result.minX, block.x),
        maxX: Math.max(result.maxX, block.x + block.w),
        minZ: Math.min(result.minZ, block.y),
        maxZ: Math.max(result.maxZ, block.y + block.d),
      }),
      { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
    )
    const width = bounds.maxX - bounds.minX
    const depth = bounds.maxZ - bounds.minZ
    const minX = bounds.minX - width * 0.25
    const maxX = bounds.maxX + width * 0.25
    const minZ = bounds.minZ - depth * 0.25
    const maxZ = bounds.maxZ + depth * 0.25
    const positions: number[] = []

    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += 1) {
      positions.push(x - 5, -0.045, minZ - 5, x - 5, -0.045, maxZ - 5)
    }
    for (let z = Math.floor(minZ); z <= Math.ceil(maxZ); z += 1) {
      positions.push(minX - 5, -0.045, z - 5, maxX - 5, -0.045, z - 5)
    }

    const gridGeometry = grid.geometry as import('three').BufferGeometry
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    gridGeometry.computeBoundingSphere()
    ground.position.set((minX + maxX) / 2 - 5, -0.055, (minZ + maxZ) / 2 - 5)
    ground.scale.set(maxX - minX, maxZ - minZ, 1)
  }, [])

  const fitCameraToBlocks = useCallback(
    (value: Scene) => {
      const shell = shellRef.current
      const camera = cameraRef.current
      const target = cameraTargetRef.current
      const position = cameraPositionRef.current
      const THREE = threeRef.current
      if (!shell || !camera || !target || !position || !THREE || value.blocks.length === 0) return

      const bounds = value.blocks.reduce(
        (result, block) => ({
          minX: Math.min(result.minX, block.x),
          maxX: Math.max(result.maxX, block.x + block.w),
          minZ: Math.min(result.minZ, block.y),
          maxZ: Math.max(result.maxZ, block.y + block.d),
          maxH: Math.max(result.maxH, block.h),
        }),
        { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, maxH: 0 }
      )
      const width = bounds.maxX - bounds.minX
      const depth = bounds.maxZ - bounds.minZ
      const radius = Math.sqrt((width / 2) ** 2 + (depth / 2) ** 2 + (bounds.maxH / 2) ** 2)
      const aspect = Math.max(shell.clientWidth / Math.max(shell.clientHeight, 1), 0.5)
      const fovY = THREE.MathUtils.degToRad(camera.fov)
      const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect)
      const verticalDistance = radius / Math.tan(fovY / 2) / 0.8
      const horizontalDistance = radius / Math.tan(fovX / 2) / 0.74
      const distance = Math.max(verticalDistance, horizontalDistance) * 1.12
      const direction = new THREE.Vector3(9, 7.5, 10.5).normalize()

      target.set(
        (bounds.minX + bounds.maxX) / 2 - 5,
        bounds.maxH * 0.55,
        (bounds.minZ + bounds.maxZ) / 2 - 5
      )
      position.copy(target).add(direction.multiplyScalar(distance))
      camera.near = 0.1
      camera.far = Math.max(60, distance + radius * 5)
      camera.updateProjectionMatrix()
      updateGround(value)
    },
    [updateGround]
  )

  const resize = useCallback(() => {
    const shell = shellRef.current
    const renderer = rendererRef.current
    const camera = cameraRef.current
    if (!shell || !renderer || !camera) return
    const width = Math.max(shell.clientWidth, 1)
    const height = Math.max(shell.clientHeight, 1)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    fitCameraToBlocks(scenes[sceneIndexRef.current])
  }, [fitCameraToBlocks])

  const refreshScene = useCallback((value: Scene) => {
    const material = materialRef.current
    const grid = gridRef.current
    const geometry = geometryRef.current
    if (!material || !grid || !geometry) return
    material.uniforms.uBaseColor.value.set(sceneColor(value, 'blockTop'))
    material.uniforms.uAccentColor.value.set(sceneColor(value, 'accentTop'))
    material.uniforms.uMutedColor.value.set(sceneColor(value, 'mutedTop'))
    const gridMaterial = grid.material as import('three').LineBasicMaterial
    gridMaterial.color.set(sceneColor(value, 'accentTop'))

    const tones = geometry.getAttribute('aTone') as import('three').InstancedBufferAttribute
    const heroes = geometry.getAttribute('aHero') as import('three').InstancedBufferAttribute
    const heroIndex = value.blocks.reduce(
      (best, block, index) => (block.h > value.blocks[best]?.h ? index : best),
      0
    )
    for (let index = 0; index < MAX_BLOCKS; index += 1) {
      tones.setX(index, value.blocks[index] ? toneValue(value.blocks[index].tone) : 0)
      heroes.setX(index, index === heroIndex ? 1 : 0)
    }
    tones.needsUpdate = true
    heroes.needsUpdate = true
  }, [])

  const writeInstances = useCallback((value: Scene, heights: Float32Array) => {
    const mesh = meshRef.current
    const dummy = dummyRef.current
    if (!mesh || !dummy) return
    for (let index = 0; index < MAX_BLOCKS; index += 1) {
      const block = value.blocks[index]
      const height = heights[index] || 0
      if (!block || height <= 0.001) {
        dummy.position.set(0, -100, 0)
        dummy.scale.set(0, 0, 0)
      } else {
        const hoverLift = index === hoveredIndexRef.current ? 0.02 : 0
        dummy.position.set(
          block.x + block.w / 2 - 5,
          height / 2 - 0.02 + hoverLift,
          block.y + block.d / 2 - 5
        )
        dummy.scale.set(block.w, height, block.d)
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  const interpolateHeight = useCallback((index: number, now: number) => {
    if (!transitioningRef.current) return targetHeightsRef.current[index] || 0
    const progress = Math.min((now - transitionStartRef.current) / TRANSITION_MS, 1)
    const eased = progress * progress * (3 - 2 * progress)
    return (
      fromHeightsRef.current[index] +
      (targetHeightsRef.current[index] - fromHeightsRef.current[index]) * eased
    )
  }, [])

  const updateTransition = useCallback(
    (now: number) => {
      const value = scenes[sceneIndexRef.current]
      const heights = currentHeightsRef.current
      for (let index = 0; index < MAX_BLOCKS; index += 1)
        heights[index] = interpolateHeight(index, now)
      writeInstances(value, heights)
      if (transitioningRef.current && now - transitionStartRef.current >= TRANSITION_MS) {
        transitioningRef.current = false
        for (let index = 0; index < MAX_BLOCKS; index += 1)
          heights[index] = targetHeightsRef.current[index]
        writeInstances(value, heights)
        markShip()
      }
    },
    [interpolateHeight, markShip, writeInstances]
  )

  const updateCamera = useCallback(() => {
    const camera = cameraRef.current
    const target = cameraTargetRef.current
    const position = cameraPositionRef.current
    if (!camera || !target || !position) return
    const zoom = zoomRef.current
    position.set(9 * zoom, 7.5 * zoom, 10.5 * zoom)
    camera.position.lerp(position, 0.16)
    camera.lookAt(target)
  }, [])

  const setPointer = useCallback(
    (event: PointerEvent<HTMLCanvasElement> | WheelEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (!pointerNdcRef.current) return
      pointerNdcRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerNdcRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    },
    []
  )

  const pick = useCallback(() => {
    const raycaster = raycasterRef.current
    const camera = cameraRef.current
    const mesh = meshRef.current
    if (!raycaster || !camera || !mesh || !pointerNdcRef.current) return -1
    raycaster.setFromCamera(pointerNdcRef.current, camera)
    const hit = raycaster.intersectObject(mesh, false)[0]
    return hit?.instanceId ?? -1
  }, [])

  const updateHover = useCallback(() => {
    const index = pick()
    if (index === hoveredIndexRef.current) return
    hoveredIndexRef.current = index
    setHoveredIndex(index)
    if (materialRef.current) materialRef.current.uniforms.uHoverIndex.value = index
  }, [pick])

  const clearFocus = useCallback(() => {
    setSelectedBlock(null)
    if (materialRef.current) {
      materialRef.current.uniforms.uFocusIndex.value = -1
      materialRef.current.uniforms.uFocusActive.value = 0
    }
  }, [])

  const focus = useCallback(
    (index: number) => {
      const block = scenes[sceneIndexRef.current].blocks[index]
      if (!block) {
        clearFocus()
        return
      }
      setSelectedBlock({ block, index, sceneIndex: sceneIndexRef.current })
      if (materialRef.current) {
        materialRef.current.uniforms.uFocusIndex.value = index
        materialRef.current.uniforms.uFocusActive.value = 1
      }
      markRender()
    },
    [clearFocus, markRender]
  )

  const switchScene = useCallback(
    (nextIndex: number) => {
      const safeIndex = (nextIndex + scenes.length) % scenes.length
      const now = performance.now()
      for (let index = 0; index < MAX_BLOCKS; index += 1) {
        const current = interpolateHeight(index, now)
        fromHeightsRef.current[index] = current
        currentHeightsRef.current[index] = current
        targetHeightsRef.current[index] = scenes[safeIndex].blocks[index]?.h || 0
      }
      sceneIndexRef.current = safeIndex
      setSceneIndex(safeIndex)
      clearFocus()
      refreshScene(scenes[safeIndex])
      fitCameraToBlocks(scenes[safeIndex])
      transitionStartRef.current = now
      transitioningRef.current = true
      lastInteractionRef.current = now
      markRender()
    },
    [clearFocus, fitCameraToBlocks, interpolateHeight, markRender, refreshScene]
  )

  const onPointerDown = useCallback((event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerDownRef.current = { x: event.clientX, y: event.clientY }
    lastPointerRef.current = { x: event.clientX, y: event.clientY }
    draggingRef.current = true
    draggedRef.current = false
    velocityRef.current = { x: 0, y: 0 }
    lastInteractionRef.current = performance.now()
  }, [])

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      setPointer(event)
      if (draggingRef.current) {
        const dx = event.clientX - lastPointerRef.current.x
        const dy = event.clientY - lastPointerRef.current.y
        if (
          Math.abs(event.clientX - pointerDownRef.current.x) +
            Math.abs(event.clientY - pointerDownRef.current.y) >
          4
        )
          draggedRef.current = true
        rotationRef.current.y += dx * 0.008
        rotationRef.current.x = Math.max(-0.21, Math.min(0.21, rotationRef.current.x + dy * 0.005))
        velocityRef.current.y = dx * 0.0008
        velocityRef.current.x = dy * 0.0005
        lastPointerRef.current = { x: event.clientX, y: event.clientY }
        lastInteractionRef.current = performance.now()
        markRender()
        return
      }
      updateHover()
    },
    [markRender, setPointer, updateHover]
  )

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      draggingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
      if (!draggedRef.current) {
        const index = pick()
        if (index >= 0) focus(index)
        else clearFocus()
      }
    },
    [clearFocus, focus, pick]
  )

  const onPointerLeave = useCallback(() => {
    if (draggingRef.current) return
    hoveredIndexRef.current = -1
    setHoveredIndex(-1)
    if (materialRef.current) materialRef.current.uniforms.uHoverIndex.value = -1
  }, [])

  const onWheel = useCallback(
    (event: WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      zoomRef.current = Math.max(0.75, Math.min(1.6, zoomRef.current + event.deltaY * 0.001))
      lastInteractionRef.current = performance.now()
      markRender()
    },
    [markRender]
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLCanvasElement>) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        rotationRef.current.y += event.key === 'ArrowLeft' ? -0.12 : 0.12
        markRender()
      } else if (event.key === ' ') {
        event.preventDefault()
        switchScene(sceneIndexRef.current + 1)
      }
    },
    [markRender, switchScene]
  )

  useEffect(() => {
    mountedRef.current = true
    const shell = shellRef.current
    const canvas = canvasRef.current
    if (!shell || !canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowEndMobile = window.innerWidth < 768 && (navigator.hardwareConcurrency || 8) <= 4
    if (reduced || lowEndMobile || !webglAvailable()) {
      setFallbackOnly(true)
      return () => {
        mountedRef.current = false
      }
    }

    let cancelled = false
    let cleanup: (() => void) | undefined

    const loadThree = async () => {
      try {
        const THREE = await import('three')
        if (cancelled || !mountedRef.current) return
        threeRef.current = THREE

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        })
        const maxPixelRatio = Math.min(window.devicePixelRatio, 2)
        renderer.setPixelRatio(maxPixelRatio)
        renderer.setClearColor(0x0a1116, 0)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        scene.fog = new THREE.Fog(0x0a1116, 12, 30)

        const geometry = new THREE.BoxGeometry(1, 1, 1)
        geometry.setAttribute(
          'aTone',
          new THREE.InstancedBufferAttribute(new Float32Array(MAX_BLOCKS), 1)
        )
        geometry.setAttribute(
          'aHero',
          new THREE.InstancedBufferAttribute(new Float32Array(MAX_BLOCKS), 1)
        )
        geometry.setAttribute(
          'aInstanceId',
          new THREE.InstancedBufferAttribute(
            new Float32Array(Array.from({ length: MAX_BLOCKS }, (_, index) => index)),
            1
          )
        )

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uScanY: { value: 0 },
            uScanWidth: { value: 0.55 },
            uHoverIndex: { value: -1 },
            uFocusIndex: { value: -1 },
            uFocusActive: { value: 0 },
            uBaseColor: { value: new THREE.Color() },
            uAccentColor: { value: new THREE.Color() },
            uMutedColor: { value: new THREE.Color() },
            uFogColor: { value: new THREE.Color(0x0a1116) },
            uFogNear: { value: 8 },
            uFogFar: { value: 23 },
          },
        })
        const mesh = new THREE.InstancedMesh(geometry, material, MAX_BLOCKS)
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        mesh.frustumCulled = false

        const positions: number[] = []
        for (let index = 0; index <= 10; index += 1) {
          const offset = index - 5
          positions.push(-5, 0, offset, 5, 0, offset)
          positions.push(offset, 0, -5, offset, 0, 5)
        }
        const gridGeometry = new THREE.BufferGeometry()
        gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        const gridMaterial = new THREE.LineBasicMaterial({
          color: 0x5be1c9,
          transparent: true,
          opacity: 0.18,
        })
        const grid = new THREE.LineSegments(gridGeometry, gridMaterial)
        const groundGeometry = new THREE.PlaneGeometry(1, 1)
        const groundMaterial = new THREE.MeshBasicMaterial({
          color: 0x0d1519,
          transparent: true,
          opacity: 0.94,
          depthWrite: false,
        })
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.renderOrder = -1
        const world = new THREE.Group()
        world.add(ground, grid, mesh)
        scene.add(world)

        rendererRef.current = renderer
        sceneRef.current = scene
        cameraRef.current = camera
        meshRef.current = mesh
        groundRef.current = ground
        materialRef.current = material
        geometryRef.current = geometry
        gridRef.current = grid
        dummyRef.current = new THREE.Object3D()
        pointerNdcRef.current = new THREE.Vector2()
        raycasterRef.current = new THREE.Raycaster()
        cameraTargetRef.current = new THREE.Vector3(0, 1, 0)
        cameraPositionRef.current = new THREE.Vector3(9, 7.5, 10.5)

        for (let index = 0; index < MAX_BLOCKS; index += 1) {
          const height = scenes[0].blocks[index]?.h || 0
          currentHeightsRef.current[index] = height
          fromHeightsRef.current[index] = height
          targetHeightsRef.current[index] = height
        }
        refreshScene(scenes[0])
        writeInstances(scenes[0], currentHeightsRef.current)
        fitCameraToBlocks(scenes[0])
        resize()
        setThreeReady(true)
        window.setTimeout(() => {
          if (mountedRef.current) setThreeVisible(true)
        }, 200)

        const stop = () => {
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
          }
        }
        const start = () => {
          if (rafRef.current === null && visibleRef.current && documentVisibleRef.current) {
            rafRef.current = requestAnimationFrame(renderFrame)
          }
        }
        const onVisibility = () => {
          documentVisibleRef.current = !document.hidden
          if (documentVisibleRef.current) start()
          else stop()
        }
        document.addEventListener('visibilitychange', onVisibility)

        const onContextLost = (event: Event) => {
          event.preventDefault()
          setFallbackOnly(true)
          stop()
        }
        canvas.addEventListener('webglcontextlost', onContextLost)

        const observer = new IntersectionObserver(
          ([entry]) => {
            visibleRef.current = Boolean(entry?.isIntersecting)
            if (visibleRef.current) start()
            else stop()
          },
          { threshold: 0.05 }
        )
        observer.observe(shell)
        observerRef.current = observer
        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(shell)
        resizeObserverRef.current = resizeObserver

        const renderFrame = (time: number) => {
          if (!mountedRef.current || !visibleRef.current || !documentVisibleRef.current) {
            stop()
            return
          }
          rafRef.current = requestAnimationFrame(renderFrame)
          const previous = frameTimeRef.current || time
          const delta = Math.min((time - previous) / 1000, 0.1)
          frameTimeRef.current = time
          fpsFrameCountRef.current += 1
          if (!fpsWindowStartRef.current) fpsWindowStartRef.current = time

          if (!draggingRef.current && time - lastInteractionRef.current > 2000) {
            rotationRef.current.y += delta * 0.08
          } else if (!draggingRef.current) {
            rotationRef.current.y += velocityRef.current.y
            rotationRef.current.x += velocityRef.current.x
            velocityRef.current.x *= 0.93
            velocityRef.current.y *= 0.93
          }
          rotationRef.current.x = Math.max(-0.21, Math.min(0.21, rotationRef.current.x))
          world.rotation.x = rotationRef.current.x
          world.rotation.y = rotationRef.current.y
          updateCamera()
          updateTransition(time)

          material.uniforms.uTime.value = time * 0.001
          material.uniforms.uScanY.value = (time * 0.001 * 1.6) % MAX_HEIGHT
          renderer.render(scene, camera)

          if (time - fpsWindowStartRef.current >= 500) {
            const fps = Math.round(
              (fpsFrameCountRef.current * 1000) / (time - fpsWindowStartRef.current)
            )
            setStats({ fps, drawCalls: renderer.info.render.calls })
            renderer.setPixelRatio(fps < 40 ? 1 : maxPixelRatio)
            fpsFrameCountRef.current = 0
            fpsWindowStartRef.current = time
          }
        }

        lastInteractionRef.current = performance.now()
        start()

        cleanup = () => {
          stop()
          document.removeEventListener('visibilitychange', onVisibility)
          canvas.removeEventListener('webglcontextlost', onContextLost)
          observer.disconnect()
          resizeObserver.disconnect()
          observerRef.current = null
          resizeObserverRef.current = null
          geometry.dispose()
          material.dispose()
          groundGeometry.dispose()
          groundMaterial.dispose()
          gridGeometry.dispose()
          gridMaterial.dispose()
          renderer.dispose()
          renderer.forceContextLoss()
          rendererRef.current = null
          sceneRef.current = null
          cameraRef.current = null
          meshRef.current = null
          groundRef.current = null
          materialRef.current = null
          geometryRef.current = null
          gridRef.current = null
          raycasterRef.current = null
          dummyRef.current = null
          cameraTargetRef.current = null
          cameraPositionRef.current = null
          threeRef.current = null
        }
      } catch {
        if (!cancelled && mountedRef.current) setFallbackOnly(true)
      }
    }

    void loadThree()
    return () => {
      cancelled = true
      mountedRef.current = false
      cleanup?.()
    }
  }, [fitCameraToBlocks, refreshScene, resize, updateCamera, updateTransition, writeInstances])

  useEffect(() => {
    if (materialRef.current) materialRef.current.uniforms.uHoverIndex.value = hoveredIndex
  }, [hoveredIndex])

  return (
    <div
      ref={shellRef}
      className="hero-three-shell bg-ink-950/60 relative h-[210px] w-full overflow-hidden rounded-2xl border border-white/10 md:h-[480px]"
    >
      <div
        className="hero-three-poster absolute inset-0 transition-opacity duration-200"
        style={{ opacity: threeVisible && !fallbackOnly ? 0 : 1 }}
      >
        <GenerativeArt />
      </div>
      <canvas
        ref={canvasRef}
        className="hero-three-canvas absolute inset-0 h-full w-full transition-opacity duration-200"
        style={{ opacity: threeVisible && !fallbackOnly ? 1 : 0 }}
        role="img"
        aria-label={
          '可交互 Three.js 2.5D 体块场景，当前 ' +
          activeScene.name +
          '，' +
          activeScene.blocks.length +
          ' 个体块'
        }
        tabIndex={0}
        onPointerDown={threeReady ? onPointerDown : undefined}
        onPointerMove={threeReady ? onPointerMove : undefined}
        onPointerUp={threeReady ? onPointerUp : undefined}
        onPointerLeave={threeReady ? onPointerLeave : undefined}
        onWheel={threeReady ? onWheel : undefined}
        onKeyDown={threeReady ? onKeyDown : undefined}
      />

      {!fallbackOnly && (
        <div className="hero-three-hud pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute top-3 right-3 flex max-w-[92%] flex-wrap items-center justify-end gap-2">
            <span className="text-mist-400 text-[11px] tracking-wide">
              示意动画 · 场景 {activeScene.name}
            </span>
            <button
              type="button"
              onClick={() => switchScene(sceneIndex + 1)}
              className="text-mist-300 hover:border-accent-500 hover:text-accent-400 rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium transition-colors"
            >
              换一版
            </button>
            <div className="hero-three-pipeline text-mist-400 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] backdrop-blur-sm">
              {['spec', 'code', 'render', 'ship'].map((label, index) => (
                <span key={label} className={pipeline[index] ? 'text-accent-400' : 'text-mist-600'}>
                  {label} {pipeline[index] ? '✓' : '·'}
                  {index < 3 && <span className="text-mist-600 px-1">→</span>}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setWhyOpen((open) => !open)}
              className="text-mist-400 hover:text-mist-200 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] backdrop-blur-sm"
              aria-expanded={whyOpen}
            >
              why this {whyOpen ? '−' : '+'}
            </button>
          </div>
          {whyOpen && (
            <div className="bg-ink-950/95 text-mist-400 pointer-events-auto absolute top-11 right-3 w-[min(290px,calc(100%-24px))] rounded-md border border-white/10 p-2.5 font-mono text-[10px] leading-5 shadow-lg">
              <p>instanced · {activeScene.blocks.length} blocks → 1 block draw call</p>
              <p>shader over postprocessing · 0 postprocess passes</p>
              <p>svg fallback · 无 WebGL 也有画面</p>
            </div>
          )}

          <div className="hero-three-hud-card absolute right-3 bottom-3 flex max-w-[82%] flex-col items-end gap-1 text-right">
            {hoveredIndex >= 0 && !selectedBlock && (
              <span className="hero-three-tooltip border-accent-500/30 text-accent-300 rounded-md border px-2 py-1 font-mono text-[10px] backdrop-blur-sm">
                块 {String(hoveredIndex + 1).padStart(2, '0')} · h=
                {activeScene.blocks[hoveredIndex]?.h.toFixed(1)}
              </span>
            )}
            {selectedBlock && (
              <button
                type="button"
                onClick={clearFocus}
                className="hero-three-tooltip border-accent-500/30 text-accent-300 pointer-events-auto rounded-md border px-2 py-1 text-right font-mono text-[10px] leading-5 backdrop-blur-sm"
              >
                {blockId(selectedBlock.index)} · x={selectedBlock.block.x.toFixed(1)} y=
                {selectedBlock.block.y.toFixed(1)} h={selectedBlock.block.h.toFixed(1)} tone=
                {selectedBlock.block.tone}
                <br />
                来自 SceneSpec #{String(selectedBlock.sceneIndex + 1).padStart(2, '0')} · 点击复原
              </button>
            )}
            <span className="hero-three-stats text-mist-500 font-mono text-[10px]">
              fps {stats.fps || '—'} · blocks {activeScene.blocks.length} · draw calls{' '}
              {stats.drawCalls || 2}
            </span>
            <span className="hero-three-help text-mist-600 text-[11px]">
              拖拽旋转 · 滚轮缩放 · 点块聚焦
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
