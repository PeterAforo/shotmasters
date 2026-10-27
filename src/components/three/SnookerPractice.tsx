'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  makeTable, rackBalls, step, allStopped, cueRespawnSpot,
  type BallBody, type TableConfig,
} from '@/lib/snooker/physics'

const STEP = 1 / 120
const MAX_SPEED = 4.5
const CUE_BALL_Y = (cfg: TableConfig) => cfg.ballR

type Phase = 'ready' | 'aiming' | 'charging' | 'rolling'

type Sim = {
  balls: BallBody[]
  meshes: (THREE.Mesh | null)[]
  phase: Phase
  aim: THREE.Vector2 // unit dir
  power: number // 0..1
  shots: number
  pottedCount: number
}

/* ---------- pointer → table-plane coordinates ---------- */
function pointerToTable(state: { pointer: THREE.Vector2; camera: THREE.Camera }, out: THREE.Vector3) {
  const v = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
  const dir = v.sub(state.camera.position).normalize()
  const t = -state.camera.position.y / dir.y // y=0 table plane
  out.copy(state.camera.position).addScaledVector(dir, t)
  return out
}

function SimStep({ sim, cfg, onEvents }: { sim: React.MutableRefObject<Sim>; cfg: TableConfig; onEvents: (p: number[]) => void }) {
  const acc = useRef(0)
  useFrame((_, dt) => {
    const s = sim.current
    if (s.phase !== 'rolling') return
    acc.current = Math.min(acc.current + Math.min(dt, 0.1), 0.5)
    const potted: number[] = []
    while (acc.current >= STEP) {
      potted.push(...step(s.balls, cfg, STEP))
      acc.current -= STEP
    }
    // positions → meshes
    for (const b of s.balls) {
      const m = s.meshes[b.id]
      if (m && !b.potted) m.position.set(b.x, cfg.ballR, b.z)
    }
    const cue = s.balls[0]
    if (cue.potted) {
      // scratch — respawn once everything settles
      if (allStopped(s.balls)) {
        const spot = cueRespawnSpot(s.balls, cfg)
        cue.potted = false; cue.x = spot.x; cue.z = spot.z; cue.vx = cue.vz = 0
        const m = s.meshes[0]
        if (m) { m.visible = true; m.position.set(spot.x, cfg.ballR, spot.z) }
        s.phase = 'ready'
        onEvents(potted)
      } else onEvents(potted)
      return
    }
    if (allStopped(s.balls)) {
      acc.current = 0
      s.phase = 'ready'
      onEvents(potted)
    } else if (potted.length) onEvents(potted)
  })
  return null
}

function BallMesh({ ball, sim }: { ball: BallBody; sim: React.MutableRefObject<Sim> }) {
  const ref = useRef<THREE.Mesh>(null)
  useEffect(() => {
    sim.current.meshes[ball.id] = ref.current
    return () => { sim.current.meshes[ball.id] = null }
  }, [ball.id, sim])
  return (
    <mesh ref={ref} position={[ball.x, ball.r, ball.z]} castShadow>
      <sphereGeometry args={[ball.r, 24, 24]} />
      <meshPhysicalMaterial color={ball.color} roughness={0.15} clearcoat={1} clearcoatRoughness={0.08} />
    </mesh>
  )
}

function AimLine({ sim, cfg }: { sim: React.MutableRefObject<Sim>; cfg: TableConfig }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const s = sim.current
    const m = mesh.current
    if (!m) return
    const cue = s.balls[0]
    const visible = (s.phase === 'aiming' || s.phase === 'charging') && !cue.potted
    m.visible = visible
    if (!visible) return
    const L = 0.9
    m.position.set(cue.x + s.aim.x * (L / 2 + cue.r), cfg.ballR * 0.5, cue.z + s.aim.y * (L / 2 + cue.r))
    m.rotation.y = -Math.atan2(s.aim.y, s.aim.x)
  })
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.9, 0.003, 0.008]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.45} />
    </mesh>
  )
}

function Cue({ sim, cfg }: { sim: React.MutableRefObject<Sim>; cfg: TableConfig }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    const s = sim.current
    const g = group.current
    if (!g) return
    const cue = s.balls[0]
    const visible = (s.phase === 'aiming' || s.phase === 'charging') && !cue.potted
    g.visible = visible
    if (!visible) return
    const pull = 0.25 + s.power * 0.9
    g.position.set(cue.x - s.aim.x * pull, cfg.ballR, cue.z - s.aim.y * pull)
    g.lookAt(cue.x, cfg.ballR, cue.z)
  })
  return (
    <group ref={group}>
      {/* shaft points along +z toward the ball */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.008, 0.016, 1.6, 10]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <sphereGeometry args={[0.011, 8, 8]} />
        <meshStandardMaterial color="#2456c8" />
      </mesh>
    </group>
  )
}

function TableMesh({ cfg }: { cfg: TableConfig }) {
  const W = cfg.maxX - cfg.minX, H = cfg.maxZ - cfg.minZ
  const rail = 0.12
  return (
    <group>
      {/* cloth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#0e5c3f" roughness={0.95} />
      </mesh>
      {/* wooden surround */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[W + rail * 2 + 0.12, H + rail * 2 + 0.12]} />
        <meshStandardMaterial color="#3d2417" roughness={0.6} />
      </mesh>
      {/* rails */}
      {[
        { w: W + rail * 2, d: rail, x: 0, z: cfg.minZ - rail / 2 },
        { w: W + rail * 2, d: rail, x: 0, z: cfg.maxZ + rail / 2 },
        { w: rail, d: H, x: cfg.minX - rail / 2, z: 0 },
        { w: rail, d: H, x: cfg.maxX + rail / 2, z: 0 },
      ].map((r, i) => (
        <mesh key={i} position={[r.x, 0.018, r.z]}>
          <boxGeometry args={[r.w, 0.036, r.d]} />
          <meshStandardMaterial color="#0a4a32" roughness={0.8} />
        </mesh>
      ))}
      {/* pockets */}
      {cfg.pockets.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p.x, 0.002, p.z]}>
          <circleGeometry args={[cfg.pocketR, 24]} />
          <meshStandardMaterial color="#05080c" roughness={1} />
        </mesh>
      ))}
      {/* baulk line + D hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cfg.baulkX, 0.001, 0]}>
        <planeGeometry args={[0.006, H]} />
        <meshStandardMaterial color="#0a4a32" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[cfg.baulkX, 0.001, 0]}>
        <ringGeometry args={[cfg.dRadius - 0.004, cfg.dRadius, 48, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#0a4a32" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function PointerController({
  sim, cfg, canvasEl, onPhase,
}: {
  sim: React.MutableRefObject<Sim>
  cfg: TableConfig
  canvasEl: React.RefObject<HTMLDivElement | null>
  onPhase: (p: Phase) => void
}) {
  const { camera } = useThree()
  const dragStart = useRef<THREE.Vector2 | null>(null)
  const world = useRef(new THREE.Vector3())

  const setPhase = (p: Phase) => { sim.current.phase = p; onPhase(p) }
  const startWorld = useRef(new THREE.Vector3())
  const curWorld = useRef(new THREE.Vector3())

  const clientToWorld = useCallback(
    (clientX: number, clientY: number, out: THREE.Vector3) => {
      const el = canvasEl.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1)
      const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera)
      const dir = v.sub(camera.position).normalize()
      const t = -camera.position.y / dir.y
      return out.copy(camera.position).addScaledVector(dir, t)
    },
    [camera, canvasEl],
  )

  const aimAt = useCallback(
    (clientX: number, clientY: number) => {
      const s = sim.current
      const cue = s.balls[0]
      if (cue.potted || !clientToWorld(clientX, clientY, world.current)) return
      const dx = world.current.x - cue.x, dz = world.current.z - cue.z
      const len = Math.hypot(dx, dz)
      if (len > 0.01) s.aim.set(dx / len, dz / len)
    },
    [clientToWorld, sim],
  )

  useEffect(() => {
    const el = canvasEl.current
    if (!el) return
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      const s = sim.current
      if (s.phase === 'rolling') return
      el.setPointerCapture(e.pointerId)
      clientToWorld(e.clientX, e.clientY, startWorld.current)
      dragStart.current = new THREE.Vector2(e.clientX, e.clientY)
      setPhase('charging')
    }
    const move = (e: PointerEvent) => {
      const s = sim.current
      if (s.phase === 'charging' && dragStart.current) {
        // pull back → fire the opposite direction, like a real cue
        if (clientToWorld(e.clientX, e.clientY, curWorld.current)) {
          const cue = s.balls[0]
          const dx = startWorld.current.x - curWorld.current.x
          const dz = startWorld.current.z - curWorld.current.z
          const len = Math.hypot(dx, dz)
          if (len > 0.02) s.aim.set(dx / len, dz / len)
          // len is in world units (table ≈3.6 wide) — 1.4 units of pull = full power
          s.power = Math.min(1, len / 1.4)
        }
      } else if (s.phase === 'ready' || s.phase === 'aiming') {
        aimAt(e.clientX, e.clientY)
        if (s.phase === 'ready') setPhase('aiming')
      }
    }
    const up = (e: PointerEvent) => {
      const s = sim.current
      if (s.phase !== 'charging' || !dragStart.current) return
      dragStart.current = null
      const cue = s.balls[0]
      if (s.power > 0.04 && !cue.potted) {
        cue.vx = s.aim.x * s.power * MAX_SPEED
        cue.vz = s.aim.y * s.power * MAX_SPEED
        s.shots += 1
        s.power = 0
        setPhase('rolling')
      } else {
        s.power = 0
        setPhase('aiming')
      }
    }
    const cancel = () => { sim.current.power = 0; dragStart.current = null; if (sim.current.phase === 'charging') setPhase('aiming') }
    const key = (e: KeyboardEvent) => {
      const s = sim.current
      if (e.key === 'Escape') { cancel(); return }
      if (s.phase !== 'aiming' && s.phase !== 'ready') return
      const rot = (a: number) => { const c = Math.cos(a), sn = Math.sin(a); const { x, y } = s.aim; s.aim.set(x * c - y * sn, x * sn + y * c) }
      if (e.key === 'ArrowLeft') { rot(0.06); if (s.phase === 'ready') setPhase('aiming') }
      if (e.key === 'ArrowRight') { rot(-0.06); if (s.phase === 'ready') setPhase('aiming') }
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', cancel)
    el.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', cancel)
      el.removeEventListener('keydown', key)
    }
  }, [canvasEl, sim, aimAt, onPhase])

  return null
}

export function SnookerPractice() {
  const cfg = useMemo(makeTable, [])
  const wrap = useRef<HTMLDivElement>(null)
  const sim = useRef<Sim>({
    balls: rackBalls(cfg),
    meshes: new Array(22).fill(null),
    phase: 'ready',
    aim: new THREE.Vector2(1, 0),
    power: 0,
    shots: 0,
    pottedCount: 0,
  })
  const [phase, setPhase] = useState<Phase>('ready')
  const [stats, setStats] = useState({ shots: 0, potted: 0 })
  const [status, setStatus] = useState('Aim with your cursor, drag back to charge, release to shoot.')
  const [failed, setFailed] = useState(false)

  const onEvents = useCallback((potted: number[]) => {
    const s = sim.current
    s.pottedCount += potted.filter((id) => id !== 0).length
    setStats({ shots: s.shots, potted: s.pottedCount })
    if (s.balls[0].potted) setStatus('Cue ball potted — respotted in the D.')
    else if (potted.length) setStatus(`${s.pottedCount} ball${s.pottedCount > 1 ? 's' : ''} down.`)
    else if (s.phase === 'ready') setStatus('All settled — your shot.')
    setPhase(s.phase)
  }, [])

  const reset = () => {
    const s = sim.current
    s.balls = rackBalls(cfg)
    s.shots = 0; s.pottedCount = 0; s.power = 0
    s.meshes.forEach((m, i) => {
      const b = s.balls[i]
      if (m && b) { m.visible = true; m.position.set(b.x, b.r, b.z) }
    })
    s.phase = 'ready'
    setPhase('ready')
    setStats({ shots: 0, potted: 0 })
    setStatus('Rack reset. Aim with your cursor, drag back to charge, release to shoot.')
  }

  const shoot = () => {
    const s = sim.current
    const cue = s.balls[0]
    if (s.phase === 'rolling' || cue.potted || s.power <= 0.04) return
    cue.vx = s.aim.x * s.power * MAX_SPEED
    cue.vz = s.aim.y * s.power * MAX_SPEED
    s.shots += 1; s.power = 0
    s.phase = 'rolling'
    setPhase('rolling')
    setStats((st) => ({ ...st, shots: s.shots }))
  }

  const rotating = (a: number) => {
    const s = sim.current
    if (s.phase === 'rolling') return
    const c = Math.cos(a), sn = Math.sin(a)
    const { x, y } = s.aim
    s.aim.set(x * c - y * sn, x * sn + y * c)
    if (s.phase === 'ready') { s.phase = 'aiming'; setPhase('aiming') }
  }

  return (
    <div className="relative h-full w-full">
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0a1f16]">
          <div className="h-40 w-72 rounded-lg border-8 border-[#3d2417] bg-felt" />
          <p className="text-sm text-white/60">3D unavailable — book a real table instead.</p>
        </div>
      ) : (
        <div
          ref={wrap}
          className="absolute inset-0 touch-none cursor-crosshair outline-none"
          tabIndex={0}
          role="application"
          aria-label="Interactive snooker table. Move pointer to aim, drag back to charge, release to shoot."
        >
          <Canvas
            shadows
            camera={{ position: [0, 4.1, 0.001], up: [0, 0, -1], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true }}
            onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', () => setFailed(true)) }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 6, 2]} intensity={1.4} color="#ffffff" castShadow />
              <pointLight position={[-4, 3, 2]} intensity={20} color="#22d3ee" />
              <pointLight position={[4, 3, -2]} intensity={20} color="#f472b6" />
              <TableMesh cfg={cfg} />
              {sim.current.balls.map((b) => (
                <BallMesh key={b.id} ball={b} sim={sim} />
              ))}
              <Cue sim={sim} cfg={cfg} />
              <AimLine sim={sim} cfg={cfg} />
              <SimStep sim={sim} cfg={cfg} onEvents={onEvents} />
              <PointerController sim={sim} cfg={cfg} canvasEl={wrap} onPhase={setPhase} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex items-start justify-between px-4">
        <div className="flex gap-4 rounded-full bg-black/45 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/85 backdrop-blur">
          <span>Shots <span className="text-cyan-neon">{stats.shots}</span></span>
          <span>Potted <span className="text-pink-neon">{stats.potted}</span></span>
        </div>
        <button
          onClick={reset}
          className="pointer-events-auto rounded-full border border-white/25 bg-black/45 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur transition-colors hover:border-cyan-neon hover:text-cyan-neon"
        >
          Reset Rack
        </button>
      </div>

      {/* touch/keyboard controls */}
      <div className="absolute inset-x-0 bottom-3 flex items-end justify-between gap-4 px-4 sm:items-center">
        <div className="flex gap-2">
          <button onClick={() => rotating(0.12)} aria-label="Aim left" className="rounded-full border border-white/25 bg-black/45 px-3 py-2 text-white backdrop-blur hover:border-cyan-neon">↺</button>
          <button onClick={() => rotating(-0.12)} aria-label="Aim right" className="rounded-full border border-white/25 bg-black/45 px-3 py-2 text-white backdrop-blur hover:border-cyan-neon">↻</button>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-black/45 px-4 py-2 backdrop-blur">
          <label htmlFor="cue-power" className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Power</label>
          <input
            id="cue-power"
            type="range" min={0} max={100} step={1}
            value={Math.round(sim.current.power * 100)}
            onChange={(e) => { sim.current.power = Number(e.target.value) / 100 }}
            className="w-28 accent-cyan-neon sm:w-40"
          />
          <button
            onClick={shoot}
            disabled={phase === 'rolling'}
            className="rounded-full bg-cyan-neon px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-40"
          >
            Shoot
          </button>
        </div>
      </div>

      {/* charging power bar */}
      {phase === 'charging' && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-48 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-linear-to-r from-green-neon via-gold to-pink-neon" style={{ width: `${sim.current.power * 100}%` }} />
        </div>
      )}

      <p aria-live="polite" className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-4 py-1 text-[11px] text-white/80 backdrop-blur">
        {status}
      </p>
    </div>
  )
}
