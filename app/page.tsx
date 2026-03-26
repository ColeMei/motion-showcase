'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const works = [
  {
    href: '/mesh-gradient',
    title: 'Mesh Gradient',
    description: 'Interactive character with eyes that follow.',
  },
  {
    href: '/time-machine',
    title: 'Time Machine',
    description: 'A stacked image carousel through frames.',
  },
  {
    href: '/music-visualizer',
    title: 'Music Visualizer',
    description: 'Real-time audio frequency visualization.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#101010] flex flex-col justify-center px-8 py-24 md:px-16 lg:px-24">
      <motion.div
        className="max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Name */}
        <motion.h1
          className="text-white text-4xl md:text-5xl font-medium tracking-tight mb-8"
          variants={itemVariants}
        >
          Cole Mei
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-white/50 text-lg md:text-xl leading-relaxed mb-16 max-w-lg"
          variants={itemVariants}
        >
          <span className="text-white/80 italic">Crafting interfaces.</span>{' '}
          Building polished software and web experiences. Experimenting with magical details in user interfaces.
        </motion.p>

        {/* Works */}
        <motion.div variants={itemVariants}>
          <h2 className="text-white/40 text-sm tracking-wide uppercase mb-6">
            Works
          </h2>
          <div className="space-y-4">
            {works.map((work) => (
              <motion.div key={work.href} variants={itemVariants}>
                <Link
                  href={work.href}
                  className="group flex items-baseline gap-4 py-2 -mx-2 px-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  <span className="text-white font-medium group-hover:underline underline-offset-4 decoration-white/40">
                    {work.title}
                  </span>
                  <span className="text-white/30 text-sm hidden sm:inline">
                    {work.description}
                  </span>
                  <span className="text-white/20 group-hover:text-white/50 transition-colors ml-auto">
                    ↗
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
