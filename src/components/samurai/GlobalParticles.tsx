"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  spin: number;
  color: string;
  type: "sakura" | "ink";
  opacity: number;
}

export function GlobalParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const maxParticles = 40;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    function createParticle(randomY = false): Particle {
      const isSakura = Math.random() > 0.4;
      const size = isSakura ? 4 + Math.random() * 6 : 2 + Math.random() * 4;
      return {
        x: Math.random() * window.innerWidth,
        y: randomY ? Math.random() * window.innerHeight : -20,
        size,
        speedY: isSakura ? 0.6 + Math.random() * 0.8 : 0.4 + Math.random() * 0.6,
        speedX: -0.3 + Math.random() * 0.6,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.015,
        color: isSakura ? "rgba(252, 228, 236, 0.35)" : "rgba(28, 26, 25, 0.06)",
        type: isSakura ? "sakura" : "ink",
        opacity: isSakura ? 0.25 + Math.random() * 0.25 : 0.04 + Math.random() * 0.05,
      };
    }

    let animId: number;

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Read Lenis scroll velocity to affect particle motion
      const lenis = (window as any).lenisInstance;
      const scrollVelocity = lenis ? lenis.velocity || 0 : 0;
      // Map scroll velocity to vertical speed multiplier and horizontal slant
      const velocityOffset = Math.min(6, Math.abs(scrollVelocity) * 0.08);
      const directionOffset = scrollVelocity * -0.015;

      particles.forEach((p, idx) => {
        // Adjust motion based on velocity
        const curSpeedY = p.speedY + velocityOffset * (p.type === "sakura" ? 1.2 : 0.8);
        const curSpeedX = p.speedX + directionOffset;

        p.y += curSpeedY;
        p.x += curSpeedX;
        p.angle += p.spin + (scrollVelocity * 0.002);

        // Wrap around bounds
        if (p.y > h + 20 || p.x < -20 || p.x > w + 20) {
          particles[idx] = createParticle(false);
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.type === "sakura") {
          // Draw traditional cherry blossom petal shape
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Little fold line in petal center
          ctx.beginPath();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 0.5;
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
        } else {
          // Draw sumi-e ink droplet (softer, rounder, fuzzy edges)
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
