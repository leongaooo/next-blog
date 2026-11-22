export const STATE_COLORS = {
  idle: '#2a4a52',
  pending: '#6a7d84',
  streaming: '#5be1c9',
  partial: '#a9f0e0',
  committed: '#f5f0c8',
  failed: '#e2695b',
} as const

export type NodeState = keyof typeof STATE_COLORS
export type Position = [number, number, number]

/** 推理场两套配色：暗色是默认的夜场，亮色是跟 Lite 主题走的纸面版 */
export const SCENE_PALETTES = {
  dark: {
    bg: '#080f13',
    fog: '#080f13',
    idle: '#2a4a52',
    pending: '#6a7d84',
    streaming: '#5be1c9',
    partial: '#a9f0e0',
    committed: '#f5f0c8',
    failed: '#e2695b',
  },
  light: {
    bg: '#f4f8f7',
    fog: '#e8f1ee',
    idle: '#93a9a2',
    pending: '#4d6a63',
    streaming: '#0b6156',
    partial: '#1f8d7f',
    committed: '#7d5a10',
    failed: '#b5432c',
  },
} as const

export type ScenePalette = {
  bg: string
  fog: string
  idle: string
  pending: string
  streaming: string
  partial: string
  committed: string
  failed: string
}

export const STATE_COLOR_MS = 180
export const FAILURE_INTERVAL_MS = 12_000
export const PULSE_PERIOD_MS = 900
export const PULSE_LENGTH = 0.22
export const AGENT_SLOW_RATE = 0.55
export const NEIGHBOR_COUNT = 5
export const PIN_LIMIT = 3

export const TRANSITIONS = {
  enqueue: { from: 'idle', to: 'pending', event: 'enqueue', ms: 180 },
  start: { from: 'pending', to: 'streaming', event: 'start', ms: 360 },
  token: { from: 'streaming', to: 'partial', event: 'token', ms: 1800 },
  flush: { from: 'partial', to: 'committed', event: 'flush', ms: 460 },
  error: { from: 'streaming', to: 'failed', event: 'error', ms: FAILURE_INTERVAL_MS },
  retry: { from: 'failed', to: 'pending', event: 'retry', ms: 680 },
  reset: { from: 'committed', to: 'idle', event: 'reset', ms: 0 },
} as const satisfies Record<string, { from: NodeState; to: NodeState; event: string; ms: number }>

type Transition = (typeof TRANSITIONS)[keyof typeof TRANSITIONS]

type MachineNode = {
  id: string
  role: string
  layer: number
  weight: number
  state: NodeState
  position: Position
  radius: number
  offsetMs: number
  tokenLimit: number
  latencyMs?: number
}

export type InferenceEdge = {
  from: number
  to: number
  weight: number
  path: Position[]
  phaseMs: number
}

type Plate = { position: Position; size: Position }

export type InferenceSpec = {
  id: 'latent' | 'agent' | 'constellation'
  label: string
  nodes: MachineNode[]
  edges: InferenceEdge[]
  plates: Plate[]
  ringTube?: number
  transitions: typeof TRANSITIONS
  failureNode: number
  connections?: InferenceEdge[][]
}

function seeded(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function line(nodes: MachineNode[], from: number, to: number, weight: number, phaseMs = 0) {
  return { from, to, weight, path: [nodes[from].position, nodes[to].position], phaseMs }
}

function latent(): InferenceSpec {
  const random = seeded(103)
  const roles = ['spec', 'code', 'render', 'ship']
  const nodes = Array.from({ length: 24 }, (_, index): MachineNode => {
    const layer = Math.floor(index / 6)
    return {
      id: 'node-' + String(index + 1).padStart(2, '0'),
      role: layer === 2 && index % 6 === 0 ? 'renderer' : roles[layer],
      layer: layer + 1,
      weight: 0.2 + 0.8 * random(),
      state: 'idle',
      position: [
        ((index % 2) - 0.5) * 1.62 + (random() - 0.5) * 0.16,
        (1 - (Math.floor(index / 2) % 3)) * 0.88 + (random() - 0.5) * 0.16,
        (layer - 1.5) * 1.6,
      ],
      radius: 0.06,
      offsetMs: layer * PULSE_PERIOD_MS,
      tokenLimit: 120,
    }
  })
  const edges = roles.slice(0, -1).flatMap((_, layer) => {
    const start = layer * 6
    const next = start + 6
    const shift = 1 + Math.floor(random() * 5)
    return Array.from({ length: 8 }, (_, index) =>
      line(
        nodes,
        start + (index % 6),
        next + ((index + shift + (index >= 6 ? 2 : 0)) % 6),
        0.2 + 0.8 * random(),
        (index % 3) * 250
      )
    )
  })
  return {
    id: 'latent',
    label: '四层推理',
    nodes,
    edges,
    plates: roles.map((_, layer) => ({
      position: [0, 0, (layer - 1.5) * 1.6],
      size: [2.55, 2.8, 0.06],
    })),
    transitions: TRANSITIONS,
    failureNode: 12,
  }
}

function agent(): InferenceSpec {
  const roles = ['source', 'tokenizer', 'planner', 'tool', 'renderer', 'gate', 'ship']
  const positions: Position[] = [
    [-1.92, 1.52, 0.3],
    [-0.78, 1.75, -0.75],
    [0.83, 1.12, -0.58],
    [1.04, 0.04, 0.05],
    [-0.58, -0.48, 0.81],
    [-0.98, -1.49, 0.1],
    [1.15, -1.65, -0.5],
  ]
  const weights = [0.45, 0.54, 0.62, 0.71, 0.9, 0.58, 0.79]
  const latencies = [46, 84, 182, 245, 216, 97, 61]
  const nodes = roles.map(
    (role, index): MachineNode => ({
      id: 'node-' + role,
      role,
      layer: [1, 1, 2, 2, 3, 3, 4][index],
      weight: weights[index],
      state: 'idle',
      position: positions[index],
      radius: 0.09,
      offsetMs: index * 560,
      tokenLimit: 120,
      latencyMs: latencies[index],
    })
  )
  const edges = nodes.slice(1).map((node, from) => {
    const a = nodes[from].position
    const b = node.position
    const control: Position = [
      (a[0] + b[0]) / 2 + (from % 3 === 2 ? 0.45 : -0.1),
      (a[1] + b[1]) / 2 + (from % 2 === 0 ? 0.44 : -0.44),
      (a[2] + b[2]) / 2 + (from % 2 === 0 ? -0.28 : 0.28),
    ]
    const path = Array.from({ length: 13 }, (_, step) => {
      const t = step / 12
      return a.map(
        (value, axis) => (1 - t) ** 2 * value + 2 * t * (1 - t) * control[axis] + t ** 2 * b[axis]
      ) as Position
    })
    return { from, to: from + 1, weight: node.weight, phaseMs: 0, path }
  })
  return {
    id: 'agent',
    label: '流式工作流',
    ringTube: 0.012,
    nodes,
    edges,
    plates: [],
    transitions: TRANSITIONS,
    failureNode: roles.indexOf('renderer'),
  }
}

function constellation(): InferenceSpec {
  const random = seeded(1291)
  const nodes = Array.from({ length: 32 }, (_, index): MachineNode => {
    const z = random() * 2 - 1
    const angle = random() * 2 * Math.PI
    const radius = Math.cbrt(random()) * 2.4
    const radial = Math.sqrt(1 - z * z)
    return {
      id: 'star-' + String(index + 1).padStart(2, '0'),
      role: index === 16 ? 'renderer' : 'association',
      layer: Math.floor(index / 8) + 1,
      weight: 0.2 + 0.8 * random(),
      state: 'idle',
      position: [radius * radial * Math.cos(angle), radius * radial * Math.sin(angle), radius * z],
      radius: 0.06,
      offsetMs: Math.floor(index / 8) * 680,
      tokenLimit: 120,
    }
  })
  const connections = nodes.map((node, from) =>
    nodes
      .map((candidate, to) => ({
        to,
        distance: Math.hypot(
          candidate.position[0] - node.position[0],
          candidate.position[1] - node.position[1],
          candidate.position[2] - node.position[2]
        ),
      }))
      .filter(({ to }) => to !== from)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, NEIGHBOR_COUNT)
      .map(({ to, distance }) => line(nodes, from, to, 1 - (0.8 * distance) / 4.8))
  )
  return {
    id: 'constellation',
    label: '灵感连接',
    nodes,
    edges: [],
    plates: [],
    connections,
    transitions: TRANSITIONS,
    failureNode: 16,
  }
}

export const INFERENCE_SPECS = [latent(), agent(), constellation()]

export type RuntimeNode = {
  state: NodeState
  previous: NodeState
  changedAt: number
  tokens: number
  retry: number
}

export function createInferenceMachine(spec: InferenceSpec) {
  return {
    nodes: spec.nodes.map(
      ({ state }): RuntimeNode => ({ state, previous: state, changedAt: 0, tokens: 0, retry: 0 })
    ),
    stage: 0,
    retry: 0,
    runAt: 0,
    nextFailureAt: spec.transitions.error.ms,
  }
}

const PARTIAL_TOKEN_SHARE = 0.8

function tokenCount(
  node: RuntimeNode,
  limit: number,
  elapsed: number,
  transitions: typeof TRANSITIONS
) {
  if (node.state === 'committed') return limit
  if (node.state === 'failed') return node.tokens
  if (node.state === 'streaming')
    return Math.floor(limit * PARTIAL_TOKEN_SHARE * Math.min(1, elapsed / transitions.token.ms))
  if (node.state === 'partial')
    return Math.floor(
      limit *
        (PARTIAL_TOKEN_SHARE +
          (1 - PARTIAL_TOKEN_SHARE) * Math.min(1, elapsed / transitions.flush.ms))
    )
  return 0
}

export function advanceInferenceMachine(
  spec: InferenceSpec,
  machine: ReturnType<typeof createInferenceMachine>,
  time: number
) {
  const rule = spec.transitions
  const nextByState = {
    idle: rule.enqueue,
    pending: rule.start,
    streaming: rule.token,
    partial: rule.flush,
    failed: rule.retry,
  }

  function advanceNodes(until: number) {
    machine.nodes.forEach((node, index) => {
      const { offsetMs, tokenLimit } = spec.nodes[index]
      while (node.state !== 'committed') {
        let transition: Transition = nextByState[node.state]
        let at = (node.state === 'idle' ? machine.runAt + offsetMs : node.changedAt) + transition.ms
        if (
          index === spec.failureNode &&
          node.state === rule.error.from &&
          machine.nextFailureAt >= node.changedAt &&
          machine.nextFailureAt < at
        ) {
          transition = rule.error
          at = machine.nextFailureAt
        }
        if (at > until) break
        node.tokens = tokenCount(node, tokenLimit, at - node.changedAt, rule)
        node.previous = node.state
        node.state = transition.to
        node.changedAt = at
        if (transition.event === 'retry') {
          node.retry++
          machine.retry++
        }
      }
      node.tokens = tokenCount(node, tokenLimit, until - node.changedAt, rule)
    })
  }

  // Place the designated node 600 ms into streaming at every 12-second fault.
  const failureLead = spec.nodes[spec.failureNode].offsetMs + rule.enqueue.ms + rule.start.ms + 600
  while (time >= machine.nextFailureAt - failureLead) {
    const start = machine.nextFailureAt - failureLead
    if (machine.runAt < start) {
      advanceNodes(start)
      machine.runAt = start
      for (const node of machine.nodes) {
        node.previous = rule.reset.from
        node.state = rule.reset.to
        node.changedAt = start
        node.tokens = 0
      }
    }
    if (time < machine.nextFailureAt) break
    advanceNodes(machine.nextFailureAt)
    machine.nextFailureAt += rule.error.ms
  }
  advanceNodes(time)

  const fault = machine.nodes[spec.failureNode]
  if (fault.state === 'failed' || (fault.state === 'pending' && fault.previous === 'failed')) {
    machine.stage = spec.failureNode
  } else {
    machine.stage = machine.nodes.reduce((active, node, index) => {
      const current = machine.nodes[active]
      return node.state !== 'idle' &&
        (current.state === 'idle' || node.changedAt >= current.changedAt)
        ? index
        : active
    }, 0)
  }
}

export function streamingRate(spec: InferenceSpec, index: number) {
  return (spec.nodes[index].tokenLimit * PARTIAL_TOKEN_SHARE * 1000) / spec.transitions.token.ms
}
