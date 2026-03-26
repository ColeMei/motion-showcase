'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const components = [
  {
    href: '/mesh-gradient',
    title: 'Mesh Gradient',
    description: 'An interactive animated character with mesh gradient effects. Move your mouse — the eyes follow.',
    tag: 'SVG · Framer Motion',
  },
  {
    href: '/time-machine',
    title: 'Time Machine',
    description: 'A stacked image carousel. Scroll, swipe, or use arrow keys to navigate through frames.',
    tag: 'Carousel · Touch · Keyboard',
  },
  {
    href: '/music-visualizer',
    title: 'Music Visualizer',
    description: 'Real-time audio frequency visualizer. Play the default track or upload your own MP3.',
    tag: 'Web Audio API · 80 bars',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center p-8">
      <motion.div
        className="max-w-3xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-white text-4xl font-medium tracking-tight mb-2"
          variants={itemVariants}
        >
          Showcase
        </motion.h1>
        <motion.p
          className="text-white/40 mb-12"
          variants={itemVariants}
        >
          Three components. Pick one.
        </motion.p>
        <div className="grid gap-4 sm:grid-cols-3">
          {components.map((c) => (
            <motion.div key={c.href} variants={cardVariants}>
              <Link
                href={c.href}
                className="group block h-full p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 transition-all duration-300"
              >
                <div className="text-white/30 text-xs font-mono mb-4">{c.tag}</div>
                <h2 className="text-white font-medium mb-2 group-hover:text-white/90 transition-colors">{c.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed">{c.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
