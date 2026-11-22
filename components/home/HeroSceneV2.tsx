'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import type { BufferAttribute, PerspectiveCamera, Vector3 } from 'three'
import GenerativeArt from './GenerativeArt'
import {
  AGENT_SLOW_RATE,
  INFERENCE_SPECS,
  NEIGHBOR_COUNT,
  PIN_LIMIT,
  PULSE_LENGTH,
  PULSE_PERIOD_MS,
  STATE_COLORS,
  STATE_COLOR_MS,
  advanceInferenceMachine,
  createInferenceMachine,
  streamingRate,
  type InferenceEdge,
  type InferenceSpec,
  type NodeState,
} from '@/data/inferenceSpecs'

const BG = '#080f13'
const POINT_LIMIT = 19
const ZOOM_START = 1.45
const ZOOM_SPARSE = 1.16
const ZOOM_MIN = 1.0
const ZOOM_MAX = 1.9
const HOVER_SCALE = 1.35
const POINT_PADDING = Math.ceil((POINT_LIMIT * HOVER_SCALE) / 2)
const MAX_NODES = Math.max(...INFERENCE_SPECS.map(({ nodes }) => nodes.length))
const MAX_SEGMENTS = Math.max(
  (PIN_LIMIT + 2) * NEIGHBOR_COUNT,
  ...INFERENCE_SPECS.map(({ edges }) => edges.reduce((n, edge) => n + edge.path.length - 1, 0))
)
const AZIMUTH = Math.atan2(0.55, 0.68)
const ELEVATION = (38 * Math.PI) / 180
const ORBIT_STEP = Math.PI / 12

const pointVertex = `
  attribute vec4 aVisual;
  attribute float aRadius;
  uniform float uPixelRatio;
  uniform float uHeight;
  varying vec4 vVisual;
  varying float vDepth;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vVisual = vec4(aVisual.rgb, abs(aVisual.a));
    vDepth = -view.z;
    float diameter = aRadius * projectionMatrix[1][1] * uHeight / vDepth;
    float hover = aVisual.a < 0.0 ? ${HOVER_SCALE} : 1.0;
    gl_PointSize = clamp(diameter, 4.0, ${POINT_LIMIT.toFixed(1)}) * hover * uPixelRatio;
    gl_Position = projectionMatrix * view;
  }
`

const fog = `
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vDepth;
  float transmission() {
    return mix(1.0, 0.7, smoothstep(uFogNear, uFogFar, vDepth));
  }
`

const pointFragment = `
  uniform float uRingWidth;
  varying vec4 vVisual;
  ${fog}
  void main() {
    float r = length(gl_PointCoord * 2.0 - 1.0);
    if (r > 1.0) discard;
    float inner = 1.0 - uRingWidth;
    float rim = smoothstep(inner - 0.05, inner, r) * (1.0 - smoothstep(0.94, 1.0, r));
    float center = 1.0 - smoothstep(0.12, 0.29, r);
    float disc = 1.0 - smoothstep(0.64, 1.0, r);
    float mask = uRingWidth > 0.0 ? max(rim, center * 0.85) : disc;
    gl_FragColor = vec4(vVisual.rgb * transmission(), mask * vVisual.a);
    #include <colorspace_fragment>
  }
`

const lineVertex = `
  attribute vec4 aEdge;
  attribute float aParam;
  varying vec4 vEdge;
  varying float vParam;
  varying float vDepth;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vEdge = aEdge;
    vParam = aParam;
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
  }
`

const lineFragment = `
  uniform float uTime;
  uniform float uPulsePeriod;
  uniform float uPulseLength;
  uniform float uSlowRate;
  uniform bool uMotion;
  uniform bool uDoublePulse;
  uniform vec3 uEdgeColor;
  uniform vec3 uPulseColor;
  varying vec4 vEdge;
  varying float vParam;
  ${fog}
  float band(float clock) {
    float head = fract(clock / uPulsePeriod) * (1.0 + uPulseLength);
    float tail = head - vParam;
    return smoothstep(0.0, 0.035, tail) * (1.0 - smoothstep(uPulseLength * 0.6, uPulseLength, tail));
  }
  void main() {
    float signal = 0.0;
    float age = uTime - vEdge.z - vEdge.w;
    if (uMotion && vEdge.z >= 0.0 && age >= 0.0) {
      signal = band(age);
      if (uDoublePulse) signal = max(signal, 0.72 * band(age * uSlowRate + uPulsePeriod * 0.36));
    }
    float opacity = vEdge.x > 1.0 ? 1.0 : mix(0.35, 0.9, vEdge.x);
    gl_FragColor = vec4(
      mix(uEdgeColor, uPulseColor, signal) * transmission(),
      min(1.0, opacity + signal * 0.35) * vEdge.y
    );
    #include <colorspace_fragment>
  }
`

type Hud = {
  state: NodeState
  role: string
  tokens: number
  tokenLimit: number
  retry: number
  nodeRetry: number
  nodeState: NodeState
  fps: number
  drawCalls: number
  edges: number
  selected: number
  pins: number
  tooltip: string
  throughput: number
  backpressure: number
}

type Group = { node: number; at: number; from: number; target: number }
type VisibleEdge = { edge: InferenceEdge; progress: number; pinned: boolean }
type ScreenPoint = { x: number; y: number; depth: number }
type Segment = { a: ScreenPoint; b: ScreenPoint; edge: InferenceEdge }
type Three = typeof import('three')

function updateAttributes(...attributes: BufferAttribute[]) {
  for (const attribute of attributes) attribute.needsUpdate = true
}

function fitCamera(
  camera: PerspectiveCamera,
  corners: Vector3[],
  center: Vector3,
  direction: Vector3,
  right: Vector3,
  up: Vector3,
  width: number,
  height: number,
  zoom: number
) {
  const xLimit = Math.min(0.72, Math.max(0.02, 1 - (2 * (16 + POINT_PADDING)) / width))
  const yLimit = Math.min(0.78, Math.max(0.02, 1 - (2 * (16 + POINT_PADDING)) / height))
  const tan = Math.tan((camera.fov * Math.PI) / 360)
  // Solve the perspective inequality against all eight corners in camera space.
  let distance = 0
  let nearDistance = -Infinity
  for (const corner of corners) {
    const z = corner.dot(direction)
    nearDistance = Math.max(nearDistance, z + camera.near + 0.03)
    distance = Math.max(
      distance,
      z + Math.abs(corner.dot(right)) / (tan * camera.aspect * xLimit),
      z + Math.abs(corner.dot(up)) / (tan * yLimit)
    )
  }
  const actualDistance = Math.max(nearDistance, distance / zoom)
  camera.position.copy(center).addScaledVector(direction, actualDistance)
  camera.lookAt(center)
  camera.updateMatrixWorld()
  return actualDistance
}

function createScene(
  THREE: Three,
  canvas: HTMLCanvasElement,
  context: WebGL2RenderingContext,
  publish: (hud: Hud) => void,
  onFirstFrame: () => void,
  onLost: () => void
) {
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false })
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(BG)
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200)
  const colors = Object.fromEntries(
    Object.entries(STATE_COLORS).map(([state, color]) => [state, new THREE.Color(color)])
  ) as Record<NodeState, InstanceType<Three['Color']>>
  const color = new THREE.Color()

  const fogUniforms = { uFogNear: { value: 0 }, uFogFar: { value: 1 } }
  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...fogUniforms,
      uPixelRatio: { value: 1 },
      uHeight: { value: 1 },
      uRingWidth: { value: 0 },
    },
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
  })
  const lineMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...fogUniforms,
      uTime: { value: 0 },
      uMotion: { value: true },
      uDoublePulse: { value: false },
      uPulsePeriod: { value: PULSE_PERIOD_MS / 1000 },
      uPulseLength: { value: PULSE_LENGTH },
      uSlowRate: { value: AGENT_SLOW_RATE },
      uEdgeColor: { value: colors.streaming },
      uPulseColor: { value: colors.committed },
    },
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
    transparent: true,
    depthWrite: false,
  })

  const attribute = (count: number, size: number) =>
    new THREE.BufferAttribute(new Float32Array(count * size), size).setUsage(THREE.DynamicDrawUsage)
  const pointPosition = attribute(MAX_NODES, 3)
  const pointRadius = attribute(MAX_NODES, 1)
  const pointVisual = attribute(MAX_NODES, 4)
  const pointsGeometry = new THREE.BufferGeometry()
    .setAttribute('position', pointPosition)
    .setAttribute('aRadius', pointRadius)
    .setAttribute('aVisual', pointVisual)
  const points = new THREE.Points(pointsGeometry, pointMaterial)
  points.frustumCulled = false
  points.renderOrder = 2

  const linePosition = attribute(MAX_SEGMENTS * 2, 3)
  const lineParams = attribute(MAX_SEGMENTS * 2, 1)
  const lineVisual = attribute(MAX_SEGMENTS * 2, 4)
  const lineGeometry = new THREE.BufferGeometry()
    .setAttribute('position', linePosition)
    .setAttribute('aParam', lineParams)
    .setAttribute('aEdge', lineVisual)
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
  lines.frustumCulled = false
  lines.renderOrder = 1

  const plateGeometry = new THREE.BoxGeometry()
  const plateMaterial = new THREE.MeshBasicMaterial({
    color: '#12303a',
    opacity: 0.16,
    transparent: true,
    depthWrite: false,
  })
  const plates = new THREE.InstancedMesh(plateGeometry, plateMaterial, 4)
  plates.frustumCulled = false
  scene.add(plates, lines, points)

  const center = new THREE.Vector3()
  const direction = new THREE.Vector3()
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  const position = new THREE.Vector3()
  const start = new THREE.Vector3()
  const end = new THREE.Vector3()
  const bounds = new THREE.Box3()
  const corners: Vector3[] = []
  const plateTransform = new THREE.Object3D()
  const screenNodes: ScreenPoint[] = Array.from({ length: MAX_NODES }, () => ({
    x: 0,
    y: 0,
    depth: 0,
  }))
  const segments: Segment[] = []
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pins = new Set<number>()
  let spec = INFERENCE_SPECS[0]
  let machine = createInferenceMachine(spec)
  let staticEdges: VisibleEdge[] = []
  let cameraDirty = true
  let boundsRadius = 1
  let width = 1
  let height = 1
  let azimuth = AZIMUTH
  let elevation = ELEVATION
  let zoom = ZOOM_START
  let sceneZoomStart = ZOOM_START
  let velocityX = 0
  let velocityY = 0
  let releasedAt = 0
  let pointer: { x: number; y: number } | null = null
  let drag: {
    id: number
    x: number
    y: number
    startX: number
    startY: number
    at: number
    moved: boolean
  } | null = null
  let preview: Group | null = null
  let retiring: Group | null = null
  let selected = -1
  let hover = -1
  let tooltip = ''
  let time = 0
  let lastFrame: number | null = null
  let raf = 0
  let visible = true
  let available = true
  let ready = false
  let frames = 0
  let fps = 0
  let fpsAt = 0
  let lastHudAt = -Infinity

  function screenPoint(vector: Vector3, result: ScreenPoint) {
    result.depth = -position.copy(vector).applyMatrix4(camera.matrixWorldInverse).z
    position.copy(vector).project(camera)
    result.x = (position.x * 0.5 + 0.5) * width
    result.y = (0.5 - position.y * 0.5) * height
  }

  function updateCamera() {
    direction.set(
      Math.sin(azimuth) * Math.cos(elevation),
      Math.sin(elevation),
      Math.cos(azimuth) * Math.cos(elevation)
    )
    right.set(direction.z, 0, -direction.x).normalize()
    up.crossVectors(direction, right)
    const distance = fitCamera(camera, corners, center, direction, right, up, width, height, zoom)
    fogUniforms.uFogNear.value = distance - boundsRadius
    fogUniforms.uFogFar.value = distance + boundsRadius
    for (const [index, node] of spec.nodes.entries()) {
      screenPoint(start.fromArray(node.position), screenNodes[index])
    }
    let fitX = 0
    let fitY = 0
    for (const corner of corners) {
      position.copy(center).add(corner).project(camera)
      fitX = Math.max(fitX, Math.abs(position.x))
      fitY = Math.max(fitY, Math.abs(position.y))
    }
    canvas.dataset.ndcX = fitX.toFixed(4)
    canvas.dataset.ndcY = fitY.toFixed(4)
    canvas.dataset.zoom = zoom.toFixed(2)
    cameraDirty = false
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    pointMaterial.uniforms.uHeight.value = height
    pointMaterial.uniforms.uPixelRatio.value = pixelRatio
    cameraDirty = true
  }

  function resetCamera() {
    azimuth = AZIMUTH
    elevation = ELEVATION
    zoom = sceneZoomStart
    velocityX = 0
    velocityY = 0
    cameraDirty = true
  }

  function setScene(index: number) {
    spec = INFERENCE_SPECS[index]
    sceneZoomStart = spec.nodes.length >= 20 ? ZOOM_START : ZOOM_SPARSE
    machine = createInferenceMachine(spec)
    staticEdges = spec.edges.map((edge) => ({ edge, progress: 1, pinned: false }))
    time = 0
    lastFrame = null
    lastHudAt = -Infinity
    fpsAt = 0
    frames = 0
    fps = 0
    selected = -1
    hover = -1
    tooltip = ''
    pointer = null
    preview = null
    retiring = null
    pins.clear()
    resetCamera()
    bounds.makeEmpty()
    for (const [i, node] of spec.nodes.entries()) {
      pointPosition.setXYZ(i, ...node.position)
      pointRadius.setX(i, node.radius)
      bounds.expandByPoint(position.fromArray(node.position))
    }
    pointMaterial.uniforms.uRingWidth.value = (spec.ringTube ?? 0) / spec.nodes[0].radius
    lineMaterial.uniforms.uDoublePulse.value = spec.id === 'agent'
    lineMaterial.uniforms.uTime.value = 0
    pointsGeometry.setDrawRange(0, spec.nodes.length)
    updateAttributes(pointPosition, pointRadius)
    for (const edge of spec.edges) {
      for (const sample of edge.path) bounds.expandByPoint(position.fromArray(sample))
    }
    for (const [i, plate] of spec.plates.entries()) {
      plateTransform.position.fromArray(plate.position)
      plateTransform.scale.fromArray(plate.size)
      plateTransform.updateMatrix()
      plates.setMatrixAt(i, plateTransform.matrix)
      const half = end.fromArray(plate.size).multiplyScalar(0.5)
      bounds.expandByPoint(position.fromArray(plate.position).sub(half))
      bounds.expandByPoint(position.fromArray(plate.position).add(half))
    }
    plates.count = spec.plates.length
    plates.visible = plates.count > 0
    plates.instanceMatrix.needsUpdate = true
    bounds.getCenter(center)
    boundsRadius = bounds.getSize(position).length() / 2
    corners.length = 0
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          corners.push(new THREE.Vector3(x, y, z).sub(center))
        }
      }
    }
  }

  function growth(group: Group) {
    const duration = group.target === 1 ? 220 : 320
    const t = motion.matches ? 1 : Math.min(1, (time - group.at) / duration)
    return THREE.MathUtils.lerp(group.from, group.target, t)
  }

  function setHover(node: number) {
    if (hover === node) return
    hover = node
    if (!spec.connections) return
    if (preview) {
      retiring = { node: preview.node, at: time, from: growth(preview), target: 0 }
    }
    preview = null
    if (node >= 0 && !pins.has(node)) {
      const from = retiring?.node === node ? growth(retiring) : 0
      if (retiring?.node === node) retiring = null
      preview = { node, at: time, from, target: 1 }
    }
  }

  function visibleEdges() {
    if (!spec.connections) return staticEdges
    const edges: VisibleEdge[] = []
    for (const pin of pins) {
      for (const edge of spec.connections[pin]) edges.push({ edge, progress: 1, pinned: true })
    }
    for (const group of [retiring, preview]) {
      if (!group || pins.has(group.node)) continue
      const progress = growth(group)
      if (progress > 0) {
        for (const edge of spec.connections[group.node])
          edges.push({ edge, progress, pinned: false })
      } else if (group === retiring) {
        retiring = null
      }
    }
    return edges
  }

  function writePoints() {
    machine.nodes.forEach((node, i) => {
      const fraction = Math.min(1, (time - node.changedAt) / STATE_COLOR_MS)
      color.copy(colors[node.previous]).lerp(colors[node.state], fraction)
      const opacity = selected < 0 || i === selected ? 1 : 0.3
      pointVisual.setXYZW(i, color.r, color.g, color.b, hover === i ? -opacity : opacity)
    })
    pointVisual.needsUpdate = true
  }

  function writeLines(edges: VisibleEdge[]) {
    let vertex = 0
    const pickable = pointer !== null && !drag
    for (const { edge, progress, pinned } of edges) {
      const attention = spec.id === 'latent' && hover >= 0
      const incident = edge.from === hover || edge.to === hover
      const emphasis = attention ? (incident ? 1 : 0.25) : 1
      const fade = (selected < 0 ? 1 : 0.3) * emphasis
      const receiver = machine.nodes[edge.to]
      const streamingSince = receiver.state === 'streaming' ? receiver.changedAt / 1000 : -1
      const count = edge.path.length - 1
      for (let i = 0; i < count; i++) {
        const t0 = i / count
        if (t0 >= progress) break
        const t1 = Math.min((i + 1) / count, progress)
        start.fromArray(edge.path[i])
        end.fromArray(edge.path[i + 1])
        end.lerp(start, 1 - (t1 - t0) * count)
        if (pickable) {
          const index = vertex / 2
          segments[index] ??= {
            a: { x: 0, y: 0, depth: 0 },
            b: { x: 0, y: 0, depth: 0 },
            edge,
          }
          segments[index].edge = edge
          screenPoint(start, segments[index].a)
          screenPoint(end, segments[index].b)
        }
        // Attention can reach full opacity while preserving the weight in the base view.
        const weight = (attention && incident) || pinned ? 2 : edge.weight
        linePosition.setXYZ(vertex, start.x, start.y, start.z)
        linePosition.setXYZ(vertex + 1, end.x, end.y, end.z)
        lineParams.setX(vertex, t0)
        lineParams.setX(vertex + 1, t1)
        lineVisual.setXYZW(vertex, weight, fade, streamingSince, edge.phaseMs / 1000)
        lineVisual.setXYZW(vertex + 1, weight, fade, streamingSince, edge.phaseMs / 1000)
        vertex += 2
      }
    }
    lines.visible = vertex > 0
    lineGeometry.setDrawRange(0, vertex)
    updateAttributes(linePosition, lineParams, lineVisual)
    return pickable ? vertex / 2 : 0
  }

  function pickNode(x: number, y: number) {
    let closest = -1
    let bestScore = Infinity
    for (const [index, node] of spec.nodes.entries()) {
      const point = screenNodes[index]
      if (point.depth <= camera.near) continue
      const diameter = THREE.MathUtils.clamp(
        (node.radius * camera.projectionMatrix.elements[5] * height) / point.depth,
        4,
        POINT_LIMIT
      )
      const radius = Math.max(9, (diameter * (index === hover ? HOVER_SCALE : 1)) / 2 + 4)
      const distance = Math.hypot(x - point.x, y - point.y)
      const score = distance / radius + point.depth * 0.0001
      if (distance <= radius && score < bestScore) {
        closest = index
        bestScore = score
      }
    }
    return closest
  }

  function edgeTooltip(x: number, y: number, count: number) {
    let nearest = 6
    let hit: InferenceEdge | undefined
    for (let index = 0; index < count; index++) {
      const { a, b, edge } = segments[index]
      if (a.depth <= camera.near || b.depth <= camera.near) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const progress = THREE.MathUtils.clamp(
        ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1),
        0,
        1
      )
      const distance = Math.hypot(x - (a.x + dx * progress), y - (a.y + dy * progress))
      if (distance < nearest) {
        hit = edge
        nearest = distance
      }
    }
    return hit ? '连线权重 ' + hit.weight.toFixed(2) : ''
  }

  function rotate(dx: number, dy: number) {
    azimuth -= dx
    elevation = THREE.MathUtils.clamp(elevation + dy, -1.42, 1.42)
    cameraDirty = true
  }

  function setZoom(factor: number) {
    zoom = THREE.MathUtils.clamp(zoom * factor, ZOOM_MIN, ZOOM_MAX)
    cameraDirty = true
  }

  function frame(now: number) {
    raf = 0
    const elapsed = lastFrame === null ? 0 : now - lastFrame
    lastFrame = now
    time += elapsed
    if (!drag && !motion.matches && now - releasedAt < 400 && (velocityX || velocityY)) {
      const decay = Math.exp(-(now - releasedAt) / 78)
      rotate(velocityX * Math.min(elapsed, 33) * decay, velocityY * Math.min(elapsed, 33) * decay)
    }
    if (cameraDirty) updateCamera()
    const previousStage = machine.nodes[machine.stage]
    const previousState = previousStage.state
    const previousRetry = machine.retry
    advanceInferenceMachine(spec, machine, time)

    const hoverBefore = hover
    const nextHover = pointer && !drag?.moved ? pickNode(pointer.x, pointer.y) : -1
    setHover(nextHover)
    writePoints()
    const edges = visibleEdges()
    const screenSegments = writeLines(edges)
    const nextTooltip =
      nextHover >= 0
        ? '层 ' + spec.nodes[nextHover].layer + ' · 节点 ' + String(nextHover + 1).padStart(2, '0')
        : pointer && !drag
          ? edgeTooltip(pointer.x, pointer.y, screenSegments)
          : ''
    const tooltipChanged = nextTooltip !== tooltip
    tooltip = nextTooltip
    canvas.style.cursor = drag?.moved ? 'grabbing' : tooltip ? 'pointer' : 'grab'
    lineMaterial.uniforms.uTime.value = time / 1000
    lineMaterial.uniforms.uMotion.value = !motion.matches
    plateMaterial.opacity = 0.16 * (selected < 0 ? 1 : 0.3)
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      onFirstFrame()
    }

    frames++
    if (time - fpsAt >= 500) {
      fps = Math.round((frames * 1000) / (time - fpsAt))
      fpsAt = time
      frames = 0
    }
    const stage = machine.nodes[machine.stage]
    const stageSpec = spec.nodes[machine.stage]
    const focused = machine.nodes[selected]
    if (
      time - lastHudAt >= 100 ||
      stage !== previousStage ||
      stage.state !== previousState ||
      machine.retry !== previousRetry ||
      hover !== hoverBefore ||
      tooltipChanged
    ) {
      lastHudAt = time
      publish({
        state: stage.state,
        role: stageSpec.role,
        tokens: stage.tokens,
        tokenLimit: stageSpec.tokenLimit,
        retry: machine.retry,
        selected,
        nodeRetry: focused?.retry ?? 0,
        nodeState: focused?.state ?? 'idle',
        fps,
        drawCalls: renderer.info.render.calls,
        edges: edges.length,
        pins: pins.size,
        tooltip,
        throughput: stage.state === 'streaming' ? streamingRate(spec, machine.stage) : 0,
        backpressure: stage.state === 'streaming' ? 1 - AGENT_SLOW_RATE : 0,
      })
    }
    schedule()
  }

  function schedule() {
    if (available && visible && !document.hidden) {
      if (!raf) raf = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(raf)
      raf = 0
      lastFrame = null
    }
  }

  function localPointer(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function pointerDown(event: PointerEvent) {
    if (drag || event.button !== 0) return
    canvas.focus({ preventScroll: true })
    canvas.setPointerCapture(event.pointerId)
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      at: event.timeStamp,
      moved: false,
    }
    velocityX = 0
    velocityY = 0
  }

  function pointerMove(event: PointerEvent) {
    if (!drag) {
      if (event.pointerType !== 'touch') pointer = localPointer(event)
      return
    }
    if (event.pointerId !== drag.id) return
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) drag.moved = true
    if (!drag.moved) return
    const dx = (event.clientX - drag.x) * 0.008
    const dy = (event.clientY - drag.y) * 0.008
    const duration = Math.max(8, event.timeStamp - drag.at)
    velocityX = dx / duration
    velocityY = dy / duration
    rotate(dx, dy)
    drag.x = event.clientX
    drag.y = event.clientY
    drag.at = event.timeStamp
  }

  function select(node: number) {
    selected = node
    if (node >= 0 && spec.connections) {
      if (pins.delete(node)) {
        if (pointer) preview = { node, at: time, from: 1, target: 1 }
      } else {
        if (pins.size === PIN_LIMIT) pins.delete(pins.values().next().value!)
        pins.add(node)
        if (preview?.node === node) preview = null
        if (retiring?.node === node) retiring = null
      }
    }
    lastHudAt = -Infinity
  }

  function pointerUp(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return
    const { moved, at } = drag
    const local = localPointer(event)
    drag = null
    pointer =
      event.pointerType !== 'touch' &&
      local.x >= 0 &&
      local.x <= width &&
      local.y >= 0 &&
      local.y <= height
        ? local
        : null
    if (!moved) {
      if (cameraDirty) updateCamera()
      select(pickNode(local.x, local.y))
    }
    if (event.timeStamp - at > 70) {
      velocityX = 0
      velocityY = 0
    }
    releasedAt = performance.now()
  }

  function cancelDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return
    drag = null
    pointer = null
    velocityX = 0
    velocityY = 0
  }

  function pointerLeave() {
    pointer = null
  }

  function wheel(event: WheelEvent) {
    event.preventDefault()
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1
    setZoom(Math.exp(-event.deltaY * scale * 0.002))
  }

  function keyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        rotate(ORBIT_STEP, 0)
        break
      case 'ArrowRight':
        rotate(-ORBIT_STEP, 0)
        break
      case 'ArrowUp':
        rotate(0, ORBIT_STEP)
        break
      case 'ArrowDown':
        rotate(0, -ORBIT_STEP)
        break
      case '+':
      case '=':
        setZoom(1.12)
        break
      case '-':
        setZoom(1 / 1.12)
        break
      case 'Home':
        resetCamera()
        break
      case 'Escape':
        select(-1)
        break
      default:
        return
    }
    event.preventDefault()
  }

  function contextLost(event: Event) {
    event.preventDefault()
    available = false
    schedule()
    onLost()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    schedule()
  })
  visibilityObserver.observe(canvas)
  const events = new AbortController()
  const { signal } = events
  canvas.addEventListener('contextmenu', (event) => event.preventDefault(), { signal })
  canvas.addEventListener('pointerdown', pointerDown, { signal })
  canvas.addEventListener('pointermove', pointerMove, { signal })
  canvas.addEventListener('pointerup', pointerUp, { signal })
  canvas.addEventListener('pointercancel', cancelDrag, { signal })
  canvas.addEventListener('lostpointercapture', cancelDrag, { signal })
  canvas.addEventListener('pointerleave', pointerLeave, { signal })
  canvas.addEventListener('dblclick', resetCamera, { signal })
  canvas.addEventListener('wheel', wheel, { signal, passive: false })
  canvas.addEventListener('keydown', keyDown, { signal })
  canvas.addEventListener('webglcontextlost', contextLost, { signal })
  document.addEventListener('visibilitychange', schedule, { signal })
  setScene(0)
  resize()
  schedule()

  return {
    setScene,
    resetCamera,
    dispose() {
      available = false
      schedule()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      events.abort()
      pointsGeometry.dispose()
      lineGeometry.dispose()
      plateGeometry.dispose()
      pointMaterial.dispose()
      lineMaterial.dispose()
      plateMaterial.dispose()
      plates.dispose()
      renderer.dispose()
    },
  }
}

const PIPELINE = [
  ['spec', '本页把 3 套场景的节点、边和状态规则放进同一份 Inference Spec。'],
  ['code', '流程规则和 WebGL 绘制分在 2 个文件，3 套场景共用缓冲与着色器。'],
  ['render', '四层推理使用 4 个层板实例、1 组点和 1 组线段，共 3 次绘制。'],
  ['ship', '在线 OCR 演示由 systemd 托管，门禁口令有效期 1 小时。'],
] as const

export function HeroSceneVersion({ v1, v2 }: { v1: ReactNode; v2: ReactNode }) {
  return useSearchParams()?.get('hero') === 'v1' ? v1 : v2
}

export function HeroScenePoster() {
  return (
    <div className="hero2-panel">
      <div className="hero2-caption">Inference Field · SVG</div>
      <div className="hero2-stage">
        <div className="hero2-poster">
          <GenerativeArt />
        </div>
      </div>
    </div>
  )
}

export default function HeroSceneV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ReturnType<typeof createScene> | null>(null)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [hud, setHud] = useState<Hud | null>(null)
  const [hinted, setHinted] = useState(true)
  const [panel, setPanel] = useState<number | 'why' | null>(null)
  const spec = INFERENCE_SPECS[index]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || navigator.hardwareConcurrency <= 4) {
      setFallback(true)
      return
    }
    let active = true
    let engine: ReturnType<typeof createScene> | undefined
    void import('three')
      .then((THREE) => {
        if (!active) return
        // Three's renderer requires WebGL2. Probe the same canvas it will render into.
        const context = canvas.getContext('webgl2', { antialias: true, alpha: false })
        if (!context) {
          setFallback(true)
          return
        }
        engine = createScene(
          THREE,
          canvas,
          context,
          setHud,
          () => setReady(true),
          () => setFallback(true)
        )
        engineRef.current = engine
      })
      .catch(() => {
        if (active) setFallback(true)
      })
    return () => {
      active = false
      engine?.dispose()
      engineRef.current = null
    }
  }, [])

  function switchScene() {
    const next = (index + 1) % INFERENCE_SPECS.length
    engineRef.current?.setScene(next)
    setIndex(next)
    setHud(null)
    setHinted(true)
  }

  function togglePanel(next: typeof panel) {
    setPanel(panel === next ? null : next)
  }

  const node = spec.nodes[hud?.selected ?? -1]
  const state = hud?.state
  const retry = hud?.retry

  return (
    <section className="hero2-panel" aria-label="Inference Field 推理场" data-scene={spec.id}>
      <div className="hero2-toolbar">
        <div className="hero2-pipeline" aria-label="设计到交付">
          {PIPELINE.map(([step], i) => (
            <div className="hero2-step" key={step}>
              {i > 0 && <span aria-hidden="true">→</span>}
              <button type="button" onClick={() => togglePanel(i)} aria-expanded={panel === i}>
                {step} ✓
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => togglePanel('why')} aria-expanded={panel === 'why'}>
          why this
        </button>
        {!fallback && (
          <button type="button" onClick={switchScene} disabled={!ready} aria-label="切换推理场景">
            换一版
          </button>
        )}
      </div>
      {panel !== null && (
        <div className="hero2-explanation">
          {panel === 'why' ? (
            <>
              <p>线条把信号、权重和阶段间的方向画出来。</p>
              <p>一份线段几何批量绘制，脉冲由 shader 沿途计算。</p>
              <p>三套规格共用 Points 与 LineSegments，切换时复用几何缓冲。</p>
            </>
          ) : (
            <p>{PIPELINE[panel][1]}</p>
          )}
        </div>
      )}
      <div className="hero2-caption">
        <span>Inference Field · {fallback ? 'SVG' : spec.id}</span>
        {!fallback && (
          <span>
            {spec.label}
            {spec.connections && hud ? ' · 固定 ' + hud.pins + '/' + PIN_LIMIT : ''}
          </span>
        )}
      </div>
      {!fallback && spec.id === 'agent' && (
        <p className="hero2-flow">
          throughput {hud ? hud.throughput.toFixed(1) + '/s' : '—'} · backpressure{' '}
          {hud ? hud.backpressure.toFixed(2) : '—'} · 示意数据
        </p>
      )}
      <div className="hero2-stage">
        {(!ready || fallback) && (
          <div className="hero2-poster">
            <GenerativeArt />
          </div>
        )}
        {!fallback && ready && hinted && (
          <span className="hero2-gesture">滚轮缩放 · 拖拽旋转 · 点节点看参数</span>
        )}
        {!fallback && ready && (
          <button
            type="button"
            className="hero2-reset"
            onClick={() => {
              engineRef.current?.resetCamera()
              setHinted(true)
            }}
            aria-label="复位视角"
          >
            复位
          </button>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={() => setHinted(false)}
          onWheel={() => setHinted(false)}
          className="hero2-canvas"
          data-ready={ready && !fallback}
          aria-hidden={!ready || fallback}
          tabIndex={ready && !fallback ? 0 : -1}
          aria-label={spec.label + '。方向键旋转，正负键缩放，Home 复位，Escape 取消聚焦。'}
        />
        {!fallback && hud?.tooltip && (
          <span className="hero2-tooltip" role="tooltip">
            {hud.tooltip}
          </span>
        )}
      </div>
      <div className="hero2-hud">
        <p>
          {fallback ? (
            'SVG 备用视图'
          ) : (
            <>
              fps {hud?.fps || '—'} · draw calls {hud?.drawCalls ?? '—'} · nodes {spec.nodes.length}{' '}
              · edges {hud?.edges ?? '—'}
            </>
          )}
        </p>
        {!fallback && (
          <>
            <p
              className="hero2-state"
              style={{ borderColor: state ? STATE_COLORS[state] : undefined }}
            >
              state {state ?? '—'} · stage {hud?.role ?? '—'} · token{' '}
              {hud ? hud.tokens + '/' + hud.tokenLimit : '—'} · retry {retry ?? '—'}
            </p>
            <p className="sr-only" aria-live="polite">
              {state === 'failed' ? '推理失败，等待重试' : retry ? '已重试 ' + retry + ' 次' : ''}
            </p>
            {node && hud && (
              <p className="hero2-node">
                {node.id} · role={node.role} · layer={node.layer} · w={node.weight.toFixed(2)} ·
                state={hud.nodeState} · retry={hud.nodeRetry}
                {node.latencyMs !== undefined && ' · latency=' + node.latencyMs + 'ms'} · 来自 Spec{' '}
                {spec.id}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
