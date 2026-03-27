"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Geist_Mono } from "next/font/google"
import { Upload } from "lucide-react"

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
})

export default function Component() {
  const prefersReducedMotion = useReducedMotion()
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioData, setAudioData] = useState<number[]>(new Array(80).fill(0.01))
  const [currentTrack, setCurrentTrack] = useState<string>("~/ 2 Million")
  const [hasAudio, setHasAudio] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showInitialAnimation, setShowInitialAnimation] = useState(false)

  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load default audio on mount
  useEffect(() => {
    if (audioRef.current && !audioRef.current.src) {
      audioRef.current.src = "https://raw.githubusercontent.com/Railly/drive/main/2_Million.mp3"
      audioRef.current.load()
    }
  }, [])

  const initializeAudioContext = async () => {
    if (!audioRef.current || isInitialized) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 1024
      analyserRef.current.smoothingTimeConstant = 0.2

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)

      // source -> analyser -> destination
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)

      setIsInitialized(true)
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }
  }

  // Smooth neighboring bars to create a wave effect
  const smoothData = (data: number[]) => {
    const smoothed = [...data]

    for (let i = 1; i < smoothed.length - 1; i++) {
      smoothed[i] = (data[i - 1] + data[i] * 2 + data[i + 1]) / 4
    }

    return smoothed
  }

  // Update bar heights from FFT data with synthetic wave symmetry
  const updateAudioData = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    analyserRef.current.getByteFrequencyData(dataArray)

    const bars = 80
    const rawData = []
    const usefulFreqRange = Math.floor(bufferLength * 0.3)

    // Compute average energy to gate silent frames
    let totalEnergy = 0
    for (let i = 0; i < usefulFreqRange; i++) {
      totalEnergy += dataArray[i]
    }
    const averageEnergy = totalEnergy / usefulFreqRange
    const energyThreshold = 50

    for (let i = 0; i < bars; i++) {
      let value = 0

      if (i < 40) {
        // Left side: real FFT data with slight synthetic variation
        const freqIndex = Math.floor((i / 40) * usefulFreqRange)
        const baseValue = dataArray[freqIndex] || 0

        const timeOffset = Date.now() * 0.006 + i * 0.12
        const synthetic = Math.sin(timeOffset) * 0.25 + Math.cos(timeOffset * 1.5) * 0.15
        value = baseValue * (0.8 + synthetic)
      } else {
        // Right side: mirrored with independent synthetic variation
        const mirrorIndex = 79 - i
        const baseIndex = Math.floor((mirrorIndex / 40) * usefulFreqRange)
        const baseValue = dataArray[baseIndex] || 0

        const timeOffset = Date.now() * 0.008 + i * 0.15
        const synthetic = Math.sin(timeOffset) * 0.3 + Math.cos(timeOffset * 1.2) * 0.2
        value = baseValue * (0.7 + synthetic)
      }

      let normalized = value / 255

      if (averageEnergy < energyThreshold) {
        normalized = 0.01
      } else {
        // Position-based amplification for wave shape
        if (i < 20) {
          normalized *= 1.5
        } else if (i < 40) {
          normalized *= 1.2
        } else if (i < 60) {
          normalized *= 1.05
        } else {
          normalized *= 0.9
        }

        normalized = Math.pow(Math.max(0, normalized), 0.4)

        // Level system for high contrast between silent and loud bars
        if (normalized > 0.8) {
          normalized = Math.pow(normalized, 0.15) * 1.8
        } else if (normalized > 0.7) {
          normalized = Math.pow(normalized, 0.3) * 0.9
        } else if (normalized > 0.5) {
          normalized = Math.pow(normalized, 0.8) * 0.1
        } else if (normalized > 0.45) {
          normalized = 0.01
        } else {
          normalized = 0.01
        }

        if (normalized < 0.45) {
          normalized = 0.01
        }
      }

      const final = Math.max(0, Math.min(1.2, normalized))
      rawData.push(final)
    }

    const smoothedData = smoothData(rawData)
    const extraSmoothed = smoothData(smoothedData)

    setAudioData(extraSmoothed)
  }

  // Visualization loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return

    let rafId: number

    const loop = () => {
      updateAudioData()
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isInitialized])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      alert("Please select an audio file")
      return
    }

    try {
      const audioUrl = URL.createObjectURL(file)

      if (audioRef.current) {
        // Stop current playback
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        }

        // Reset initialization
        setIsInitialized(false)

        // Set new source
        audioRef.current.src = audioUrl
        audioRef.current.load()

        setCurrentTrack(`~/ ${file.name.replace(/\.[^/.]+$/, "")}`)
        setHasAudio(true)

        // Trigger initial animation
        setShowInitialAnimation(true)
        setTimeout(() => setShowInitialAnimation(false), 2000)

      }
    } catch (error) {
      console.error("Error loading audio file:", error)
    }
  }

  const togglePlayback = async () => {
    if (!audioRef.current) return

    try {
      if (!isInitialized) {
        await initializeAudioContext()
      }

      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume()
      }

      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }

      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error("Error toggling playback:", error)
    }
  }

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => {
      if (!isInitialized) {
        initializeAudioContext()
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      console.error("Audio error:", e)
      setIsPlaying(false)
    }

    audio.addEventListener("canplaythrough", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [hasAudio, isInitialized])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlayback()
          break
        case 'o':
        case 'u':
          e.preventDefault()
          fileInputRef.current?.click()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isInitialized])

  return (
    <div className={`min-h-screen bg-[#101010] flex flex-col items-center justify-center p-8 ${geistMono.className}`}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />

      {/* Audio element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
      />

      {/* Upload button - SIEMPRE VISIBLE */}
      <motion.button
        className="absolute top-20 right-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200"
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Upload size={16} />
        <span className="text-sm">Upload MP3</span>
      </motion.button>

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-20 left-8 text-white/30 text-xs font-mono space-y-1">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Space</kbd>
          <span>Play / Pause</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">O</kbd>
          <span>Open file</span>
        </div>
      </div>

      {/* Audio Visualizer - EFECTO OLA */}
      <div className="flex items-end justify-center gap-1 mb-16 h-80 w-full max-w-6xl">
        {audioData.map((height, index) => (
          <motion.div
            key={index}
            className="bg-white"
            style={{
              width: "8px",
              opacity: height > 0 ? 1 : 0,
            }}
            initial={{ scaleX: 0 }}
            animate={{
              height: `${height * 150}px`,
              opacity: height > 0 ? 1 : 0,
              scaleX: showInitialAnimation ? 1 : 1,
            }}
            transition={prefersReducedMotion ? { duration: 0 } : {
              height: {
                type: "spring",
                stiffness: height > 0 ? 400 : 200,
                damping: height > 0 ? 25 : 35,
                mass: 0.2,
              },
              opacity: {
                duration: height > 0 ? 0.1 : 0.8,
                ease: "easeOut",
              },
              scaleX: {
                duration: 2,
                delay: Math.abs(index - 40) * 0.015,
                ease: "easeOut",
              },
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 text-white">
        <motion.button
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex items-center justify-center w-12 h-12 rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <motion.path
              d={isPlaying ? "M6 4h4v16H6V4zm8 0h4v16h-4V4z" : "M8 5v14l11-7z"}
              fill="currentColor"
              animate={{
                d: isPlaying ? "M6 4h4v16H6V4zm8 0h4v16h-4V4z" : "M8 5v14l11-7z",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </svg>
        </motion.button>

        <motion.div
          className="text-2xl font-light tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {currentTrack}
        </motion.div>
      </div>
    </div>
  )
}
