import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Showcase',
  description: 'A collection of interactive components',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} antialiased`}>
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#101010]">
          <Link href="/" className="text-white font-medium tracking-tight hover:opacity-70 transition-opacity">
            Showcase
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/mesh-gradient" className="hover:text-white transition-colors">Mesh Gradient</Link>
            <Link href="/time-machine" className="hover:text-white transition-colors">Time Machine</Link>
            <Link href="/music-visualizer" className="hover:text-white transition-colors">Music Visualizer</Link>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
