"use client"

import { useEffect, useRef } from "react"

export function clamp(value: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(value, min), max)
}

export function useShortcuts(shortcuts: Record<string, () => void>) {
  const shortcutsRef = useRef(shortcuts)

  // Keep the ref current without triggering re-registration
  useEffect(() => {
    shortcutsRef.current = shortcuts
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = shortcutsRef.current[e.key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, []) // Register once — handlers stay fresh via ref
}
