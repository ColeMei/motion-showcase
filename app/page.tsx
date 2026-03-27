'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion'
import { Instrument_Serif } from 'next/font/google'

const instrumentSerif = Instrument_Serif({ 
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic']
})

export default function Home() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [particles, setParticles] = useState<Array<{
    initial: { x: number; y: number }
    frames: { x: number[]; y: number[] }
  }>>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 6 }, () => ({
        initial: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
        frames: {
          x: Array.from({ length: 3 }, () => Math.random() * 400 - 200),
          y: Array.from({ length: 3 }, () => Math.random() * 400 - 200),
        },
      }))
    )
  }, [])
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Smooth spring physics for each letter's offset
  const springConfig = { damping: 25, stiffness: 150 }
  
  const letterOffsets = [
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
    { x: useSpring(0, springConfig), y: useSpring(0, springConfig) },
  ]

  const letters = ['C', 'o', 'l', 'e', 'M', 'e', 'i']

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      
      mouseX.set(deltaX)
      mouseY.set(deltaY)
      
      // Each letter reacts differently based on position
      if (!prefersReducedMotion) {
        letterOffsets.forEach((offset, i) => {
          const factor = (i - 3.5) * 0.08 // Letters spread from center
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const intensity = Math.min(distance / 400, 1)

          offset.x.set(deltaX * factor * intensity * 0.3)
          offset.y.set(deltaY * factor * intensity * 0.15)
        })
      }
    }

    const handleMouseLeave = () => {
      letterOffsets.forEach((offset) => {
        offset.x.set(0)
        offset.y.set(0)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  // letterOffsets holds stable Framer Motion spring values — safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-[#101010] flex items-center justify-center overflow-hidden cursor-default fixed inset-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Subtle gradient glow behind text */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Name */}
      <motion.div
        className={`relative flex items-baseline select-none ${instrumentSerif.className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* First name: Cole */}
        <div className="flex">
          {letters.slice(0, 4).map((letter, i) => (
            <motion.span
              key={i}
              className="text-white text-[15vw] md:text-[12vw] lg:text-[10vw] tracking-tight"
              style={{
                x: letterOffsets[i].x,
                y: letterOffsets[i].y,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Space between names */}
        <div className="w-[3vw]" />

        {/* Last name: Mei */}
        <div className="flex">
          {letters.slice(4).map((letter, i) => (
            <motion.span
              key={i + 4}
              className="text-white text-[15vw] md:text-[12vw] lg:text-[10vw] tracking-tight"
              style={{
                x: letterOffsets[i + 4].x,
                y: letterOffsets[i + 4].y,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Floating particles — rendered only after hydration to avoid SSR/client mismatch */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full pointer-events-none"
          initial={{ x: p.initial.x, y: p.initial.y, opacity: 0 }}
          animate={{
            x: p.frames.x,
            y: p.frames.y,
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  )
}
