'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useTexture, Line } from '@react-three/drei'
import * as THREE from 'three'

// Generate random points on sphere surface
function generatePoints(count: number, radius: number) {
  const points: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)
    
    points.push(new THREE.Vector3(x, y, z))
  }
  return points
}

// Generate arc between two points on sphere
function generateArc(start: THREE.Vector3, end: THREE.Vector3, segments: number = 50) {
  const points: THREE.Vector3[] = []
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    
    // Spherical interpolation
    const point = new THREE.Vector3().lerpVectors(start, end, t)
    
    // Add height based on arc
    const arcHeight = Math.sin(t * Math.PI) * 0.3
    point.normalize().multiplyScalar(start.length() + arcHeight)
    
    points.push(point)
  }
  
  return points
}

// Connection arc component
function ConnectionArc({ start, end, color, delay }: { 
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  delay: number 
}) {
  const points = useMemo(() => generateArc(start, end), [start, end])
  const lineRef = useRef<THREE.Line>(null)
  const [progress, setProgress] = useState(0)
  
  useFrame((_, delta) => {
    setProgress(prev => {
      const newProgress = prev + delta * 0.3
      return newProgress > 1 + delay ? -delay : newProgress
    })
  })
  
  const visiblePoints = useMemo(() => {
    if (progress < 0) return []
    const endIndex = Math.min(Math.floor(progress * points.length), points.length)
    const startIndex = Math.max(0, endIndex - 20)
    return points.slice(startIndex, endIndex)
  }, [progress, points])
  
  if (visiblePoints.length < 2) return null
  
  return (
    <Line
      points={visiblePoints}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.6}
    />
  )
}

// Data point on globe
function DataPoint({ position, color, pulse }: { 
  position: THREE.Vector3
  color: string
  pulse: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [scale, setScale] = useState(1)
  
  useFrame((_, delta) => {
    if (pulse) {
      setScale(prev => {
        const newScale = prev + delta * 2
        return newScale > 2 ? 1 : newScale
      })
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial color={color} />
      {pulse && (
        <mesh scale={scale}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3 / scale} />
        </mesh>
      )}
    </mesh>
  )
}

// Main globe mesh
function Globe() {
  const globeRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const texture = useTexture('/assets/3d/texture_earth.jpg')
  
  // Slow auto-rotation
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.05
    }
  })
  
  // Generate connection points
  const points = useMemo(() => generatePoints(12, 1.01), [])
  
  // Generate connections between random points
  const connections = useMemo(() => {
    const conns: { start: THREE.Vector3; end: THREE.Vector3; delay: number }[] = []
    for (let i = 0; i < 8; i++) {
      const startIdx = Math.floor(Math.random() * points.length)
      let endIdx = Math.floor(Math.random() * points.length)
      while (endIdx === startIdx) {
        endIdx = Math.floor(Math.random() * points.length)
      }
      conns.push({
        start: points[startIdx],
        end: points[endIdx],
        delay: Math.random() * 2
      })
    }
    return conns
  }, [points])
  
  return (
    <group>
      {/* Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Data points */}
      {points.map((point, i) => (
        <DataPoint
          key={i}
          position={point}
          color={i % 3 === 0 ? '#ff6b6b' : i % 3 === 1 ? '#4ecdc4' : '#ffe66d'}
          pulse={i % 4 === 0}
        />
      ))}
      
      {/* Connection arcs */}
      {connections.map((conn, i) => (
        <ConnectionArc
          key={i}
          start={conn.start}
          end={conn.end}
          color={i % 2 === 0 ? '#4ecdc4' : '#ff6b6b'}
          delay={conn.delay}
        />
      ))}
    </group>
  )
}

// Scene with camera controls
function Scene() {
  const { camera } = useThree()
  
  // Set initial camera position
  useMemo(() => {
    camera.position.set(0, 0, 2.5)
  }, [camera])
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <Globe />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        autoRotate={false}
        rotateSpeed={0.5}
      />
    </>
  )
}

export default function InteractiveGlobe() {
  return (
    <div className="w-full h-full bg-[#101010]">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#101010']} />
        <Scene />
      </Canvas>
      
      {/* Keyboard hints */}
      <div className="absolute bottom-8 left-8 text-white/30 text-xs font-mono space-y-1">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Drag</kbd>
          <span>Rotate globe</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Scroll</kbd>
          <span>Zoom in/out</span>
        </div>
      </div>
    </div>
  )
}
