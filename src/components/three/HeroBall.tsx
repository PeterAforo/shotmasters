'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

/* ---------- number badge texture (white circle + number, pool-ball style) ---------- */
const badgeCache = new Map<number, THREE.CanvasTexture>()
function numberTexture(n: number) {
  const hit = badgeCache.get(n)
  if (hit) return hit
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2)
  ctx.fillStyle = '#f8f6ef'
  ctx.fill()
  ctx.fillStyle = '#101528'
  ctx.font = `bold ${size * 0.52}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(n), size / 2, size / 2 + 3)
  const tex = new THREE.CanvasTexture(c)
  badgeCache.set(n, tex)
  return tex
}

/* ---------- ball defs: authentic pool colors ---------- */
type BallDef = {
  n: number
  color: string
  home: [number, number, number]
  r: number
  mass: number
}
const BALLS: BallDef[] = [
  { n: 8, color: '#10131f', home: [0, 0, 0], r: 1.55, mass: 8 }, // the big one
  { n: 1, color: '#f2c230', home: [-3.1, 1.1, 0.2], r: 0.34, mass: 1 },
  { n: 2, color: '#2456c8', home: [3.4, -0.9, 0], r: 0.34, mass: 1 },
  { n: 3, color: '#d62f3c', home: [-2.8, -1.5, 0.4], r: 0.34, mass: 1 },
  { n: 5, color: '#f0641e', home: [2.7, 1.7, -0.4], r: 0.34, mass: 1 },
  { n: 4, color: '#7b2fbe', home: [0.6, -2.3, -0.2], r: 0.34, mass: 1 },
  { n: 7, color: '#8a4a1d', home: [-4.2, 0.2, -0.6], r: 0.34, mass: 1 },
  { n: 11, color: '#e2543e', home: [4.4, 1.0, -0.8], r: 0.34, mass: 1 }, // striped look via lighter shade
]

type Body = {
  def: BallDef
  pos: THREE.Vector3
  vel: THREE.Vector3
  home: THREE.Vector3
  mesh: React.RefObject<THREE.Group | null>
}

const BOUNDS = { x: 5.6, yMin: -2.9, yMax: 3.3 }

function useBallBodies() {
  return useRef<Body[]>(
    BALLS.map((def) => ({
      def,
      pos: new THREE.Vector3(...def.home),
      vel: new THREE.Vector3(),
      home: new THREE.Vector3(...def.home),
      mesh: { current: null },
    })),
  ).current
}

const mouseWorld = new THREE.Vector3()
const tmpV = new THREE.Vector3()
const tmpPrev = new THREE.Vector3()

function PhysicsStep({ bodies }: { bodies: Body[] }) {
  const prevMouse = useRef(new THREE.Vector3())
  const mouseVel = useRef(new THREE.Vector3())
  const mouseInside = useRef(false)

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.033)

    // unproject pointer to the z≈0 plane the balls live on
    const cam = state.camera
    tmpV.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam)
    const dir = tmpV.sub(cam.position).normalize()
    const t = -cam.position.z / dir.z
    mouseWorld.copy(cam.position).addScaledVector(dir, t)

    mouseVel.current.copy(mouseWorld).sub(tmpPrev.copy(prevMouse.current))
    tmpPrev.copy(mouseWorld)
    // normalize velocity to per-second scale
    mouseVel.current.divideScalar(Math.max(delta, 1 / 240))
    const hasPointer = state.pointer.x !== 0 || state.pointer.y !== 0
    if (hasPointer && !mouseInside.current) mouseVel.current.set(0, 0, 0)
    mouseInside.current = hasPointer

    for (const b of bodies) {
      // spring back toward home
      tmpV.copy(b.home).sub(b.pos)
      b.vel.addScaledVector(tmpV, 2.4 * delta)

      // cursor cue: push away when cursor is near, scaled by pointer speed
      if (hasPointer) {
        const dist = tmpV.copy(b.pos).sub(mouseWorld).length()
        const hitR = b.def.r + 0.55
        if (dist < hitR) {
          const dir2 = tmpV.copy(b.pos).sub(mouseWorld).normalize()
          const speed = Math.min(mouseVel.current.length() * 0.9, 14)
          const kick = (1 - dist / hitR) * speed * 2.2 + 2.4
          b.vel.addScaledVector(dir2, (kick / b.def.mass) * delta * 60)
        }
      }

      b.vel.multiplyScalar(Math.exp(-2.2 * delta)) // damping
      b.pos.addScaledVector(b.vel, delta)

      // soft walls
      const r = b.def.r
      if (b.pos.x < -BOUNDS.x + r) { b.pos.x = -BOUNDS.x + r; b.vel.x = Math.abs(b.vel.x) * 0.7 }
      if (b.pos.x > BOUNDS.x - r) { b.pos.x = BOUNDS.x - r; b.vel.x = -Math.abs(b.vel.x) * 0.7 }
      if (b.pos.y < BOUNDS.yMin + r) { b.pos.y = BOUNDS.yMin + r; b.vel.y = Math.abs(b.vel.y) * 0.7 }
      if (b.pos.y > BOUNDS.yMax - r) { b.pos.y = BOUNDS.yMax - r; b.vel.y = -Math.abs(b.vel.y) * 0.7 }
    }

    // pairwise elastic collisions
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]
        const b = bodies[j]
        tmpV.copy(b.pos).sub(a.pos)
        const dist = tmpV.length()
        const minD = a.def.r + b.def.r
        if (dist > 0.0001 && dist < minD) {
          const n = tmpV.divideScalar(dist)
          const overlap = minD - dist
          const totalMass = a.def.mass + b.def.mass
          a.pos.addScaledVector(n, (-overlap * b.def.mass) / totalMass)
          b.pos.addScaledVector(n, (overlap * a.def.mass) / totalMass)
          const relVel = tmpPrev.copy(b.vel).sub(a.vel).dot(n)
          if (relVel < 0) {
            const impulse = (-(1 + 0.85) * relVel) / (1 / a.def.mass + 1 / b.def.mass)
            a.vel.addScaledVector(n, -impulse / a.def.mass)
            b.vel.addScaledVector(n, impulse / b.def.mass)
          }
        }
      }
    }

    // apply to meshes + roll rotation
    for (const b of bodies) {
      const g = b.mesh.current
      if (!g) continue
      g.position.copy(b.pos)
      const speed = b.vel.length()
      if (speed > 0.001) {
        tmpV.set(b.vel.y, -b.vel.x, 0).normalize()
        g.rotateOnWorldAxis(tmpV, (speed * delta) / b.def.r)
      }
    }
  })
  return null
}

function Ball({ body }: { body: Body }) {
  const { def } = body
  const tex = useMemo(() => numberTexture(def.n), [def.n])
  return (
    <group ref={body.mesh} position={def.home}>
      <mesh>
        <sphereGeometry args={[def.r, 48, 48]} />
        <meshPhysicalMaterial
          color={def.color}
          roughness={0.16}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.2}
        />
      </mesh>
      <Billboard>
        <mesh position={[0, 0, def.r * 0.99]}>
          <planeGeometry args={[def.r * 0.85, def.r * 0.85]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

function Scene() {
  const bodies = useBallBodies()
  return (
    <>
      <ambientLight intensity={0.55} />
      {/* vivid rim lighting on light theme */}
      <pointLight position={[-6, 2, 3]} intensity={45} color="#0891b2" />
      <pointLight position={[6, -1, 2]} intensity={45} color="#db2777" />
      <pointLight position={[0, 6, -2]} intensity={35} color="#eab308" />
      <directionalLight position={[2, 6, 6]} intensity={1.6} color="#ffffff" />

      <PhysicsStep bodies={bodies} />
      {bodies.map((b) => (
        <Ball key={b.def.n} body={b} />
      ))}

      {/* felt floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0e5c3f" roughness={0.95} />
      </mesh>
    </>
  )
}

export function HeroBall() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
