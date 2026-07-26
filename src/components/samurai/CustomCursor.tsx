"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

interface InkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  opacity: number;
  color: string;
}

export function CustomCursor() {
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  
  // Sync theme to a ref so the continuous animation loop can access it
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const particlesRef = useRef<InkParticle[]>([]);
  const isClickedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return; // Disable custom cursor on touch devices

    setIsVisible(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      mouse.vx = mouse.x - mouse.lastX;
      mouse.vy = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      if (speed > 1.5 && Math.random() > 0.25) {
        const angle = Math.random() * Math.PI * 2;
        const offset = Math.random() * 4;
        const particleSpeed = Math.random() * 0.6;

        particlesRef.current.push({
          x: mouse.x + Math.cos(angle) * offset,
          y: mouse.y + Math.sin(angle) * offset,
          vx: (mouse.vx * -0.12) + Math.cos(angle) * particleSpeed,
          vy: (mouse.vy * -0.12) + Math.sin(angle) * particleSpeed,
          size: Math.random() * 2 + 1,
          maxSize: Math.random() * 6 + 4,
          opacity: 0.8,
          color: Math.random() > 0.6 ? "#bfa15f" : "#9e2a2b" // Samurai gold or red
        });
      }
    };

    const handleMouseDown = () => {
      isClickedRef.current = true;
      const mouse = mouseRef.current;

      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        particlesRef.current.push({
          x: mouse.x,
          y: mouse.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          maxSize: Math.random() * 10 + 6,
          opacity: 0.95,
          color: Math.random() > 0.5 ? "#bfa15f" : "#9e2a2b"
        });
      }
    };

    const handleMouseUp = () => {
      isClickedRef.current = false;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -100;
      mouseRef.current.y = -100;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      // Update & Draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.size += (p.maxSize - p.size) * 0.08;
        p.opacity -= 0.022;

        if (p.opacity <= 0 || p.size <= 0.1) {
          particles.splice(i, 1);
          continue;
        }

        // Samurai Mode: Calligraphy fuzzy ink spots
        ctx.beginPath();
        const radGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        radGrd.addColorStop(0, p.color === "#bfa15f" ? `rgba(191, 161, 95, ${p.opacity})` : `rgba(158, 42, 43, ${p.opacity})`);
        radGrd.addColorStop(0.5, p.color === "#bfa15f" ? `rgba(191, 161, 95, ${p.opacity * 0.4})` : `rgba(158, 42, 43, ${p.opacity * 0.4})`);
        radGrd.addColorStop(1, "rgba(18, 17, 16, 0)");
        ctx.fillStyle = radGrd;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Main Cursor Tip
      if (mouse.x >= 0 && mouse.y >= 0) {
        // Samurai Calligraphy Brush
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        
        const targetAngle = Math.atan2(mouse.vy, mouse.vx);
        const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        const scaleY = Math.max(0.6, 1 - speed * 0.025);
        const scaleX = Math.min(1.5, 1 + speed * 0.035);

        ctx.rotate(targetAngle);
        
        const brushSize = isClickedRef.current ? 11 : 7.5;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-brushSize * scaleX, -brushSize * 0.4 * scaleY, -brushSize * 1.5 * scaleX, -brushSize * 0.8 * scaleY, -brushSize * 2 * scaleX, 0);
        ctx.bezierCurveTo(-brushSize * 1.5 * scaleX, brushSize * 0.8 * scaleY, -brushSize * scaleX, brushSize * 0.4 * scaleY, 0, 0);

        ctx.fillStyle = isClickedRef.current ? "#9e2a2b" : "#ebdcb9";
        ctx.shadowColor = isClickedRef.current ? "rgba(158, 42, 43, 0.6)" : "rgba(191, 161, 95, 0.4)";
        ctx.shadowBlur = 6;
        ctx.fill();

        ctx.strokeStyle = "#bfa15f";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none z-[99999] ${isVisible ? "block" : "hidden"}`}
    />
  );
}
