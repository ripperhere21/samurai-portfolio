"use client";

import React, { useEffect, useState, useRef, memo } from "react";
import { motion } from "framer-motion";

interface GoldParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

export const KatanaScrollbar = memo(function KatanaScrollbar() {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [shimmerTrigger, setShimmerTrigger] = useState(false);

  const currentProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const particlesRef = useRef<GoldParticle[]>([]);
  const nextParticleIdRef = useRef(0);
  const hasTriggeredBottomRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track page scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollHeight = docHeight - winHeight;
      if (scrollHeight <= 0) return;
      currentProgressRef.current = window.scrollY / scrollHeight;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update loop for scroll progress and canvas gold dust particles
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const tick = () => {
      // 1. Interpolate progress with lerp for smooth scrollbar tracking
      const diff = currentProgressRef.current - smoothProgressRef.current;
      if (Math.abs(diff) > 0.0005) {
        smoothProgressRef.current += diff * 0.28;
        setProgress(smoothProgressRef.current);
      }

      // 2. Check if reached bottom (98%+) to trigger gold shimmer
      if (smoothProgressRef.current > 0.98) {
        if (!hasTriggeredBottomRef.current) {
          hasTriggeredBottomRef.current = true;
          setShimmerTrigger(true);
          spawnGoldDust();
          setTimeout(() => setShimmerTrigger(false), 1200);
        }
      } else if (smoothProgressRef.current < 0.92) {
        hasTriggeredBottomRef.current = false;
      }

      // 3. Render gold particles onto overlay canvas without triggering 60 React re-renders per second
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (particlesRef.current.length > 0) {
          particlesRef.current = particlesRef.current
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy - 0.05,
              life: p.life - 0.02,
              alpha: Math.max(0, p.life),
            }))
            .filter((p) => p.life > 0);

          particlesRef.current.forEach((p) => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(191, 161, 95, ${p.alpha * 0.85})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    const spawnGoldDust = () => {
      const newParticles: GoldParticle[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = Math.PI * 1.2 + Math.random() * Math.PI * 0.6;
        const speed = 0.5 + Math.random() * 1.5;
        newParticles.push({
          id: nextParticleIdRef.current++,
          x: 28 + (Math.random() - 0.5) * 8,
          y: 230 + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: 1.2 + Math.random() * 2.0,
          alpha: 1.0,
          life: 1.0,
        });
      }
      particlesRef.current = [...particlesRef.current, ...newParticles];
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const maxTravel = 150;
  const drawOffsetY = -progress * maxTravel;

  return (
    <div className="fixed right-2 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 z-50 pointer-events-none select-none flex items-center justify-center h-[400px] w-14">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="pointer-events-auto cursor-pointer transition-all duration-500 relative"
        style={{
          filter: isHovered
            ? "drop-shadow(0 0 12px rgba(191, 161, 95, 0.35)) brightness(1.2)"
            : "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))",
        }}
      >
        {/* Canvas for particle dust */}
        <canvas
          ref={canvasRef}
          width={60}
          height={390}
          className="absolute inset-0 pointer-events-none z-10"
        />

        <svg
          width="60"
          height="390"
          viewBox="0 0 60 390"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-[390px]"
        >
          <defs>
            {/* Blade Metal Gradient */}
            <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a4d50" />
              <stop offset="35%" stopColor="#d2d5d8" />
              <stop offset="55%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#696d71" />
              <stop offset="100%" stopColor="#2c2e30" />
            </linearGradient>

            {/* Blade Glow Filter */}
            <filter id="blade-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <clipPath id="blade-clip">
              <rect x="0" y="0" width="60" height="234" />
            </clipPath>
          </defs>

          {/* 1. Stationary Scabbard (Saya) - y = 234 to 390 */}
          <rect
            x="26.5"
            y="234"
            width="7"
            height="150"
            rx="3.5"
            fill="#8d1c1d"
            stroke="#400b0c"
            strokeWidth="0.8"
          />
          <rect x="26.5" y="269" width="7" height="1.5" fill="#bfa15f" opacity="0.75" />
          <rect x="26.5" y="319" width="7" height="1.5" fill="#bfa15f" opacity="0.75" />
          <rect x="26.5" y="369" width="7" height="1.5" fill="#bfa15f" opacity="0.75" />

          <rect x="26.2" y="246" width="7.6" height="10" rx="1" fill="#d35400" />
          <path d="M 26.5 248 L 33.5 252 M 26.5 252 L 33.5 248" stroke="#8d1c1d" strokeWidth="1" />

          <rect
            x="26"
            y="234"
            width="8"
            height="4"
            rx="1"
            fill="#bfa15f"
            stroke="#8c6a38"
            strokeWidth="0.5"
          />

          {/* 2. Unsheathing Blade Group */}
          <g clipPath="url(#blade-clip)">
            <g style={{ transform: `translateY(${drawOffsetY}px)` }}>
              <path
                d="M 27.5 234 L 27.5 374 Q 27.5 382 29.5 384 Q 31.5 382 31.5 374 L 31.5 234 Z"
                fill="none"
                stroke="#bfa15f"
                strokeWidth="4"
                filter="url(#blade-glow)"
                opacity="0.4"
                className="animate-pulse"
                style={{ mixBlendMode: "color-dodge", animationDuration: "3s" }}
              />

              <path
                d="M 27.5 234 L 27.5 374 Q 27.5 382 29.5 384 Q 31.5 382 31.5 374 L 31.5 234 Z"
                fill="url(#blade-grad)"
              />

              <path d="M 27.8 234 L 27.8 374 Q 27.8 380 29.5 382.5" stroke="#ffffff" strokeWidth="0.4" opacity="0.7" />

              <path
                d="M 28.5 234 Q 29.2 244 28.2 254 T 29.2 274 T 28.2 294 T 29.2 314 T 28.2 334 T 29.2 354 Q 29.2 369 29.5 382"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="0.6"
                fill="none"
              />

              <rect
                x="27.5"
                y="234"
                width="4"
                height="150"
                fill="url(#blade-grad)"
                style={{ mixBlendMode: "overlay", opacity: 0.8 }}
              />

              {shimmerTrigger && (
                <motion.rect
                  x="27"
                  y="234"
                  width="6"
                  height="150"
                  fill="#bfa15f"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{ duration: 1.0 }}
                  style={{ mixBlendMode: "color-dodge" }}
                />
              )}
            </g>
          </g>

          {/* 3. Handle & Guard Draw Group */}
          <g style={{ transform: `translateY(${drawOffsetY}px)` }}>
            <rect x="26.5" y="228" width="7" height="6" fill="#bfa15f" stroke="#8c6a38" strokeWidth="0.5" />
            <ellipse cx="30" cy="225" rx="15" ry="5.5" fill="#8c6a38" stroke="#543c17" strokeWidth="1" />
            <ellipse cx="30" cy="225" rx="10" ry="3" stroke="#bfa15f" strokeWidth="0.5" opacity="0.4" fill="none" />

            <rect x="26" y="174" width="8" height="48" fill="#ebdcb9" />

            <g stroke="#1c1917" strokeWidth="1.5" opacity="0.85">
              <line x1="26" y1="180" x2="34" y2="188" />
              <line x1="26" y1="192" x2="34" y2="200" />
              <line x1="26" y1="204" x2="34" y2="212" />
              <line x1="26" y1="214" x2="34" y2="222" />
              <line x1="34" y1="180" x2="26" y2="188" />
              <line x1="34" y1="192" x2="26" y2="200" />
              <line x1="34" y1="204" x2="26" y2="212" />
              <line x1="34" y1="214" x2="26" y2="222" />
            </g>

            <g fill="#8d1c1d">
              <rect x="29" y="183" width="2" height="2" transform="rotate(45 30 184)" />
              <rect x="29" y="195" width="2" height="2" transform="rotate(45 30 196)" />
              <rect x="29" y="207" width="2" height="2" transform="rotate(45 30 208)" />
              <rect x="29" y="217" width="2" height="2" transform="rotate(45 30 218)" />
            </g>

            <path d="M 26 174 Q 30 170 34 174 L 34 176 L 26 176 Z" fill="#8c6a38" stroke="#543c17" strokeWidth="0.5" />
            <rect x="25.8" y="219" width="8.4" height="3" fill="#bfa15f" stroke="#8c6a38" strokeWidth="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
});
