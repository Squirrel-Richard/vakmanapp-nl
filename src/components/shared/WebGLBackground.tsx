'use client'

import { useEffect, useRef } from 'react'

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
}

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const orbsRef = useRef<Orb[]>([])
  const animFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = [
      'rgba(99,102,241',   // indigo
      'rgba(139,92,246',   // violet
      'rgba(20,184,166',   // teal
      'rgba(249,115,22',   // orange (accent)
    ]

    // Initialize orbs
    orbsRef.current = [
      { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3, vx: 0.15, vy: 0.1, radius: 350, color: colors[0], opacity: 0.08 },
      { x: window.innerWidth * 0.8, y: window.innerHeight * 0.2, vx: -0.1, vy: 0.15, radius: 300, color: colors[1], opacity: 0.07 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.8, vx: 0.12, vy: -0.08, radius: 400, color: colors[2], opacity: 0.05 },
      { x: window.innerWidth * 0.9, y: window.innerHeight * 0.7, vx: -0.08, vy: -0.12, radius: 250, color: colors[3], opacity: 0.04 },
    ]

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    let time = 0

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Deep space background
      ctx.fillStyle = '#06060f'
      ctx.fillRect(0, 0, width, height)

      // Star field (static noise)
      ctx.save()
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 1.7 + 3) * 0.5 + 0.5) * width
        const sy = (Math.cos(i * 2.3 + 1) * 0.5 + 0.5) * height
        const alpha = 0.1 + Math.sin(time * 0.02 + i) * 0.05
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Draw orbs
      orbsRef.current.forEach((orb, i) => {
        // Mouse attraction
        const dx = mouseRef.current.x - orb.x
        const dy = mouseRef.current.y - orb.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const attraction = 0.0005

        orb.vx += (dx / dist) * attraction
        orb.vy += (dy / dist) * attraction

        // Damping
        orb.vx *= 0.995
        orb.vy *= 0.995

        // Boundary bounce
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < -orb.radius) orb.x = width + orb.radius
        if (orb.x > width + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = height + orb.radius
        if (orb.y > height + orb.radius) orb.y = -orb.radius

        // Breathing opacity
        const breathe = orb.opacity + Math.sin(time * 0.01 + i) * 0.015

        // Draw gradient orb
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        )
        gradient.addColorStop(0, `${orb.color},${breathe})`)
        gradient.addColorStop(0.4, `${orb.color},${breathe * 0.6})`)
        gradient.addColorStop(1, `${orb.color},0)`)

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Subtle grid overlay
      ctx.save()
      ctx.strokeStyle = 'rgba(99,102,241,0.025)'
      ctx.lineWidth = 0.5
      const gridSize = 80
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.restore()

      time++
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
