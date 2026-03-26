import Link from 'next/link'

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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-white text-4xl font-medium tracking-tight mb-2">Showcase</h1>
        <p className="text-white/40 mb-12">Three components. Pick one.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {components.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group block p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="text-white/30 text-xs font-mono mb-4">{c.tag}</div>
              <h2 className="text-white font-medium mb-2 group-hover:opacity-80 transition-opacity">{c.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
