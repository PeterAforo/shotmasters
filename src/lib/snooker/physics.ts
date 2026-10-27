/* Pure planar snooker practice physics — no React/three dependencies. */

export type Vec2 = { x: number; z: number }

export interface CushionSegment { ax: number; az: number; bx: number; bz: number }

export interface TableConfig {
  minX: number; maxX: number
  minZ: number; maxZ: number
  ballR: number
  pocketR: number
  pockets: Vec2[]
  cushions: CushionSegment[]
  baulkX: number
  dRadius: number
}

export interface BallBody {
  id: number
  color: string
  x: number
  z: number
  vx: number
  vz: number
  r: number
  potted: boolean
  isCue: boolean
}

export const SNOOKER_COLORS = {
  cue: '#f6f2e8',
  red: '#c1282d',
  yellow: '#e8b91e',
  green: '#1f7a3a',
  brown: '#6b3a1e',
  blue: '#2456c8',
  pink: '#e26a9a',
  black: '#10131f',
} as const

/** Playing-surface dims in world units (~2:1 snooker proportions). */
export function makeTable(): TableConfig {
  const W = 3.6, H = 1.8
  const minX = -W / 2, maxX = W / 2, minZ = -H / 2, maxZ = H / 2
  const ballR = 0.034, pocketR = 0.09
  // mouth half-width — cushions stop short of pockets so balls can fall in
  const mouth = pocketR * 1.05

  const pockets: Vec2[] = [
    { x: minX, z: minZ }, { x: maxX, z: minZ },
    { x: minX, z: maxZ }, { x: maxX, z: maxZ },
    { x: 0, z: minZ }, { x: 0, z: maxZ },
  ]

  // Top/bottom long rails are split by the middle pockets; ends split by corners.
  const cushions: CushionSegment[] = [
    { ax: minX + mouth, az: minZ, bx: -mouth, bz: minZ },            // bottom-left
    { ax: mouth, az: minZ, bx: maxX - mouth, bz: minZ },             // bottom-right
    { ax: minX + mouth, az: maxZ, bx: -mouth, bz: maxZ },            // top-left
    { ax: mouth, az: maxZ, bx: maxX - mouth, bz: maxZ },             // top-right
    { ax: minX, az: minZ + mouth, bx: minX, bz: maxZ - mouth },      // left end
    { ax: maxX, az: minZ + mouth, bx: maxX, bz: maxZ - mouth },      // right end
  ]

  const baulkX = minX + W * 0.22
  const dRadius = H * 0.22
  return { minX, maxX, minZ, maxZ, ballR, pocketR, pockets, cushions, baulkX, dRadius }
}

const SPOTS = (cfg: TableConfig) => ({
  yellow: { x: cfg.baulkX, z: -cfg.dRadius },
  green: { x: cfg.baulkX, z: cfg.dRadius },
  brown: { x: cfg.baulkX, z: 0 },
  blue: { x: 0, z: 0 },
  pink: { x: cfg.minX + (cfg.maxX - cfg.minX) * 0.75, z: 0 },
  black: { x: cfg.maxX - (cfg.maxX - cfg.minX) * 0.08, z: 0 },
})

/** Standard opening layout: cue ball in the D, colours on spots, reds triangle. */
export function rackBalls(cfg: TableConfig): BallBody[] {
  const spots = SPOTS(cfg)
  const r = cfg.ballR
  const balls: BallBody[] = [
    { id: 0, color: SNOOKER_COLORS.cue, isCue: true, x: cfg.baulkX - cfg.dRadius * 0.4, z: -cfg.dRadius * 0.35, vx: 0, vz: 0, r, potted: false },
    { id: 1, color: SNOOKER_COLORS.yellow, isCue: false, x: spots.yellow.x, z: spots.yellow.z, vx: 0, vz: 0, r, potted: false },
    { id: 2, color: SNOOKER_COLORS.green, isCue: false, x: spots.green.x, z: spots.green.z, vx: 0, vz: 0, r, potted: false },
    { id: 3, color: SNOOKER_COLORS.brown, isCue: false, x: spots.brown.x, z: spots.brown.z, vx: 0, vz: 0, r, potted: false },
    { id: 4, color: SNOOKER_COLORS.blue, isCue: false, x: spots.blue.x, z: spots.blue.z, vx: 0, vz: 0, r, potted: false },
    { id: 5, color: SNOOKER_COLORS.pink, isCue: false, x: spots.pink.x, z: spots.pink.z, vx: 0, vz: 0, r, potted: false },
    { id: 6, color: SNOOKER_COLORS.black, isCue: false, x: spots.black.x, z: spots.black.z, vx: 0, vz: 0, r, potted: false },
  ]
  // 15 reds — triangle apex toward baulk, just behind pink spot
  let id = 7
  const apexX = spots.pink.x + r * 2.4
  const rowGap = r * 2.05
  const colGap = r * 1.79
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i <= row; i++) {
      balls.push({
        id: id++, color: SNOOKER_COLORS.red, isCue: false,
        x: apexX + row * rowGap, z: -row * colGap + i * colGap * 2,
        vx: 0, vz: 0, r, potted: false,
      })
    }
  }
  return balls
}

export function allStopped(balls: BallBody[], eps = 0.004): boolean {
  return balls.every((b) => b.potted || (Math.abs(b.vx) < eps && Math.abs(b.vz) < eps))
}

const FRICTION = 0.6      // exponential rolling drag
const CUSHION_REST = 0.72
const BALL_REST = 0.96

/** Advance the sim by dt seconds (call with a fixed small step). Returns potted ball ids. */
export function step(balls: BallBody[], cfg: TableConfig, dt: number): number[] {
  const potted: number[] = []
  const live = balls.filter((b) => !b.potted)

  for (const b of live) {
    b.x += b.vx * dt
    b.z += b.vz * dt
    const damp = Math.exp(-FRICTION * dt)
    b.vx *= damp
    b.vz *= damp
    if (Math.abs(b.vx) < 0.003) b.vx = 0
    if (Math.abs(b.vz) < 0.003) b.vz = 0
  }

  // pockets first — ball is captured before rails can reflect it
  for (const b of live) {
    for (const p of cfg.pockets) {
      const dx = b.x - p.x, dz = b.z - p.z
      if (dx * dx + dz * dz < cfg.pocketR * cfg.pocketR) {
        b.potted = true
        b.vx = b.vz = 0
        potted.push(b.id)
        break
      }
    }
  }
  const inPlay = balls.filter((b) => !b.potted)

  // cushions — reflect off segment normals
  for (const b of inPlay) {
    for (const c of cfg.cushions) {
      const ex = c.bx - c.ax, ez = c.bz - c.az
      const len2 = ex * ex + ez * ez
      const t = Math.max(0, Math.min(1, ((b.x - c.ax) * ex + (b.z - c.az) * ez) / len2))
      const cx = c.ax + ex * t, cz = c.az + ez * t
      const nx = b.x - cx, nz = b.z - cz
      const d2 = nx * nx + nz * nz
      if (d2 < b.r * b.r && d2 > 1e-9) {
        const d = Math.sqrt(d2)
        const ux = nx / d, uz = nz / d
        b.x = cx + ux * b.r
        b.z = cz + uz * b.r
        const vn = b.vx * ux + b.vz * uz
        if (vn < 0) {
          b.vx -= (1 + CUSHION_REST) * vn * ux
          b.vz -= (1 + CUSHION_REST) * vn * uz
        }
      }
    }
  }

  // equal-mass ball collisions
  for (let i = 0; i < inPlay.length; i++) {
    for (let j = i + 1; j < inPlay.length; j++) {
      const a = inPlay[i], b = inPlay[j]
      const dx = b.x - a.x, dz = b.z - a.z
      const min = a.r + b.r
      const d2 = dx * dx + dz * dz
      if (d2 < min * min && d2 > 1e-9) {
        const d = Math.sqrt(d2)
        const nx = dx / d, nz = dz / d
        const overlap = (min - d) / 2
        a.x -= nx * overlap; a.z -= nz * overlap
        b.x += nx * overlap; b.z += nz * overlap
        const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz
        if (rel < 0) {
          const impulse = (-(1 + BALL_REST) * rel) / 2
          a.vx -= impulse * nx; a.vz -= impulse * nz
          b.vx += impulse * nx; b.vz += impulse * nz
        }
      }
    }
  }

  return potted
}

/** First free spot in the D (respawn after a scratch). */
export function cueRespawnSpot(balls: BallBody[], cfg: TableConfig): Vec2 {
  const cx = cfg.baulkX, cz = 0
  const free = (x: number, z: number) =>
    balls.every((b) => b.potted || ((b.x - x) ** 2 + (b.z - z) ** 2) >= (b.r + cfg.ballR) ** 2)
  if (free(cx, cz - cfg.dRadius * 0.4)) return { x: cx, z: cz - cfg.dRadius * 0.4 }
  const ring = cfg.ballR * 2.4
  for (let radius = ring; radius <= cfg.dRadius; radius += ring) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      const x = cx + Math.cos(a) * radius, z = cz + Math.sin(a) * radius
      if (z >= cfg.minZ + cfg.ballR && z <= cfg.maxZ - cfg.ballR && free(x, z)) return { x, z }
    }
  }
  return { x: cx, z: cz }
}
