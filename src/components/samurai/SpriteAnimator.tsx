"use client";

import React, { useEffect, useRef } from "react";

interface SpriteAnimatorProps {
  images: HTMLImageElement[];
  fps: number;
  playing: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SpriteAnimator({
  images,
  fps,
  playing,
  className,
  style,
}: SpriteAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      // Use high-DPI scaling for crisp rendering
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const totalFrames = images.length;
    lastFrameTimeRef.current = performance.now();

    const drawFrame = () => {
      if (!ctx || !canvas) return;

      const img = images[frameIndexRef.current];
      if (!img) return;

      const sw = img.naturalWidth;
      const sh = img.naturalHeight;
      if (sw === 0 || sh === 0) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Aspect ratio fitting (contain style) to avoid stretching
      const imgAspect = sw / sh;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawW = canvasWidth;
      let drawH = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > imgAspect) {
        // Canvas is wider than frame
        drawW = canvasHeight * imgAspect;
        offsetX = (canvasWidth - drawW) / 2;
      } else {
        // Canvas is taller than frame
        drawH = canvasWidth / imgAspect;
        offsetY = (canvasHeight - drawH) / 2;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Preserve crisp feather details and original anime artwork exactly
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    const tick = (now: number) => {
      if (!playing) {
        drawFrame();
        animationFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - lastFrameTimeRef.current;
      const currentFrameDuration = 1000 / fps;

      if (elapsed >= currentFrameDuration) {
        // Never skip frames: advance by exactly 1 frame at a time
        frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
        lastFrameTimeRef.current = now - (elapsed % currentFrameDuration);
        drawFrame();
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [images, fps, playing]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: "auto",
        display: "block",
        background: "transparent",
        ...style,
      }}
    />
  );
}
