"use client";

import React, { useEffect, useRef, useState, memo } from "react";

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

export const CustomCursor = memo(function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -100, y: -100, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const particlesRef = useRef<InkParticle[]>([]);
  const isClickedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable custom cursor on touch devices to improve mobile UX and save power
    const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    if (isTouch) return;

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
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      mouse.vx = mouse.x - mouse.lastX;
      mouse.vy = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      if (speed > 1.5 && Math.random() > 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const offset = Math.random() * 4;
        const particleSpeed = Math.random() * 0.5;

        particlesRef.current.push({
          x: mouse.x + Math.cos(angle) * offset,
          y: mouse.y + Math.sin(angle) * offset,
          vx: mouse.vx * -0.1 + Math.cos(angle) * particleSpeed,
          vy: mouse.vy * -0.1 + Math.sin(angle) * particleSpeed,
          size: Math.random() * 2 + 1,
          maxSize: Math.random() * 5 + 3,
          opacity: 0.75,
          color: Math.random() > 0.6 ? "#bfa15f" : "#9e2a2b",
        });
      }
    };

    const handleMouseDown = () => {
      isClickedRef.current = true;
      const mouse = mouseRef.current;

      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        particlesRef.current.push({
          x: mouse.x,
          y: mouse.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          maxSize: Math.random() * 8 + 4,
          opacity: 0.9,
          color: Math.random() > 0.5 ? "#bfa15f" : "#9e2a2b",
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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;
    let isTabActive = true;

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isTabActive) {
        animationId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      // Update & Draw ink particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.size += (p.maxSize - p.size) * 0.08;
        p.opacity -= 0.025;

        if (p.opacity <= 0 || p.size <= 0.1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        const radGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        radGrd.addColorStop(0, p.color === "#bfa15f" ? `rgba(191, 161, 95, ${p.opacity})` : `rgba(158, 42, 43, ${p.opacity})`);
        radGrd.addColorStop(0.5, p.color === "#bfa15f" ? `rgba(191, 161, 95, ${p.opacity * 0.4})` : `rgba(158, 42, 43, ${p.opacity * 0.4})`);
        radGrd.addColorStop(1, "rgba(18, 17, 16, 0)");
        ctx.fillStyle = radGrd;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Calligraphy Brush Cursor Tip
      if (mouse.x >= 0 && mouse.y >= 0) {
        ctx.save();
        ctx.translate(mouse.x, mouse.y);

        const targetAngle = Math.atan2(mouse.vy, mouse.vx);
        const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        const scaleY = Math.max(0.6, 1 - speed * 0.025);
        const scaleX = Math.min(1.5, 1 + speed * 0.035);

        ctx.rotate(targetAngle);

        const brushSize = isClickedRef.current ? 10 : 7;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-brushSize * scaleX, -brushSize * 0.4 * scaleY, -brushSize * 1.5 * scaleX, -brushSize * 0.8 * scaleY, -brushSize * 2 * scaleX, 0);
        ctx.bezierCurveTo(-brushSize * 1.5 * scaleX, brushSize * 0.8 * scaleY, -brushSize * scaleX, brushSize * 0.4 * scaleY, 0, 0);

        ctx.fillStyle = isClickedRef.current ? "#9e2a2b" : "#ebdcb9";
        ctx.shadowColor = isClickedRef.current ? "rgba(158, 42, 43, 0.6)" : "rgba(191, 161, 95, 0.4)";
        ctx.shadowBlur = 5;
        ctx.fill();

        ctx.strokeStyle = "#bfa15f";
        ctx.lineWidth = 1.2;
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
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none z-[99999] ${isVisible ? "block" : "hidden"}`}
    />
  );
});
