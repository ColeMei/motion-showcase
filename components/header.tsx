'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/mesh-gradient', label: 'Mesh Gradient' },
  { href: '/time-machine', label: 'Time Machine' },
  { href: '/music-visualizer', label: 'Music Visualizer' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#101010]">
      <Link
        href="/"
        className={cn(
          'text-white font-medium tracking-tight transition-opacity',
          pathname === '/' ? 'opacity-100' : 'hover:opacity-70'
        )}
      >
        Showcase
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors',
                isActive
                  ? 'text-white font-medium'
                  : 'text-white/50 hover:text-white/80'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
