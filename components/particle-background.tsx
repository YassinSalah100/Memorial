"use client"

import { useEffect, useRef } from "react"
import { useMobile } from "@/hooks/use-mobile"

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Particle properties - reduce count on mobile
    const particleCount = isMobile ? 50 : 100
    const particles: {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }[] = []

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (isMobile ? 1.5 : 2) + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        color: i % 5 === 0 ? "#FFD700" : "#FFFFFF",
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Reset position if out of bounds
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.x = Math.random() * canvas.width
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.y = Math.random() * canvas.height
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [isMobile])

  return (
    <>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0E0F1A] via-[#131642] to-[#0E0F1A] opacity-80 z-0"></div>
    </>
  )
}
