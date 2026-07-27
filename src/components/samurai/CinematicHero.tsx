"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroProps {
  onScrollToProjects: () => void;
  onScrollToContact: () => void;
  audio: any; // Audio hooks for sound plays
}

interface MapleLeaf {
  x: number;
  y: number;
  size: number;
  angle: number;
  spin: number;
  speedX: number;
  speedY: number;
  swayAmp: number;
  swaySpeed: number;
  swayOffset: number;
  color: string;
}

interface FogLayer {
  x: number;
  y: number;
  r: number;
  vx: number;
  opacity: number;
}

export function CinematicHero({ onScrollToProjects, onScrollToContact, audio }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const leavesRef = useRef<MapleLeaf[]>([]);
  const fogRef = useRef<FogLayer[]>([]);

  // Frame preloading states
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Parallax mouse listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Preload the 192 upscaled WebP frames
  useEffect(() => {
    const totalFrames = 192;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const padded = String(i).padStart(4, "0");
      img.src = `/images/hero-frames/frame_${padded}.webp`;
      
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
        if (loadedCount === totalFrames) {
          setIsPreloaded(true);
        }
      };
      
      img.onerror = () => {
        // Continue loading on error to not block page
        loadedCount++;
        if (loadedCount === totalFrames) {
          setIsPreloaded(true);
        }
      };

      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Initialize leaf particles & fog, and run anim loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      // Cap device pixel ratio to 1.25 to prevent extreme rendering slowdown on 4k/retina screens
      const dpr = Math.min(1.25, window.devicePixelRatio || 1);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize red maple leaves (falling/drifting over frames)
    const colors = ["#8d1c1d", "#a8201a", "#9e2a2b", "#b23a22", "#bfa15f"];
    const numLeaves = 30; // More leaves since canvas is now full-screen width
    leavesRef.current = Array.from({ length: numLeaves }, () => ({
      x: Math.random() * canvas.width * 1.3 - canvas.width * 0.2,
      y: Math.random() * canvas.height * -0.5 - 20,
      size: Math.random() * 8 + 5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.035,
      speedX: -(Math.random() * 1.6 + 1.2), // drift left
      speedY: Math.random() * 1.3 + 0.9, // drift down
      swayAmp: Math.random() * 1.8 + 0.6,
      swaySpeed: Math.random() * 0.02 + 0.012,
      swayOffset: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Initialize fog layers
    fogRef.current = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.8 + (i * 20) - 30,
      r: Math.random() * 220 + 150,
      vx: (Math.random() * 0.12 + 0.04) * (Math.random() > 0.5 ? 1 : -1),
      opacity: Math.random() * 0.10 + 0.05,
    }));

    // Draw maple leaf path helper
    const drawMapleLeafShape = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      
      // Top lobe
      c.quadraticCurveTo(size * 0.1, -size * 0.6, size * 0.25, -size * 0.45);
      c.lineTo(size * 0.1, -size * 0.35);
      
      // Top-right lobe
      c.quadraticCurveTo(size * 0.5, -size * 0.4, size * 0.8, -size * 0.2);
      c.lineTo(size * 0.45, -size * 0.1);
      
      // Right lobe
      c.quadraticCurveTo(size * 0.8, size * 0.15, size * 0.9, size * 0.35);
      c.lineTo(size * 0.4, size * 0.25);
      
      // Bottom-right lobe
      c.quadraticCurveTo(size * 0.5, size * 0.6, size * 0.6, size * 0.85);
      c.lineTo(size * 0.2, size * 0.5);

      c.lineTo(0, size * 0.4);
      
      // Bottom-left lobe
      c.lineTo(-size * 0.2, size * 0.5);
      c.quadraticCurveTo(-size * 0.5, size * 0.6, -size * 0.6, size * 0.85);
      
      // Left lobe
      c.lineTo(-size * 0.4, size * 0.25);
      c.quadraticCurveTo(-size * 0.8, size * 0.15, -size * 0.9, size * 0.35);
      
      // Top-left lobe
      c.lineTo(-size * 0.45, -size * 0.1);
      c.quadraticCurveTo(-size * 0.5, -size * 0.4, -size * 0.8, -size * 0.2);
      c.lineTo(-size * 0.1, -size * 0.35);
      
      c.quadraticCurveTo(-size * 0.1, -size * 0.6, 0, -size);
      
      c.moveTo(0, size * 0.4);
      c.lineTo(0, size * 1.1);

      c.closePath();
    };

    // Helper to draw image aligned to the right on desktop/tablet, or focal-framed full-height background on mobile
    const drawImageRightAligned = (c: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, parallaxX: number, parallaxY: number) => {
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const isMobile = (window.innerWidth || 0) < 768;

      if (!isMobile) {
        // Desktop & Tablet (>= 768px): Keep exact existing right-aligned behavior
        const r = h / imgH; // Scale to match height
        const nw = imgW * r;
        const nh = h;
        
        // Right-aligned coordinates: cx is w - nw to align right
        const cx = w - nw;
        const cy = 0;

        // Apply subtle mouse parallax to the background image
        const px = cx + parallaxX * -15;
        const py = cy + parallaxY * -15;

        c.drawImage(img, px, py, nw, nh);
      } else {
        // Mobile (< 768px): Full-height background (cy = 0) with focal alignment for red sun & samurai behind text
        const r = h / imgH; // Scale to match height so animation spans top-to-bottom
        const nw = imgW * r;
        const nh = h;
        // Focal alignment (0.58) perfectly frames red sun & samurai in mobile background behind text
        const cx = (w - nw) * 0.58;
        const cy = 0;
        const px = cx + parallaxX * -6;
        const py = cy + parallaxY * -6;

        c.drawImage(img, px, py, nw, nh);
      }
    };

    const frameIndexRef = { current: 0 }; // Start playhead from the first frame
    let animationId: number;

    const isVisibleRef = { current: true };
    const handleScroll = () => {
      // Pause animation loop when scrolled completely past the fold (+100px buffer)
      isVisibleRef.current = window.scrollY < window.innerHeight + 100;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const render = () => {
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const mouse = mouseRef.current;
      // Lerp mouse parallax positions
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw loop for preloaded frames (Sumi/samurai animation sequence)
      ctx.fillStyle = "#121110";
      ctx.fillRect(0, 0, w, h);
      
      // Check if frames are available, loop sequentially
      if (images.length === 192 && loadedCountRef.current >= 192) {
        const totalFrames = 192;

        // Advance playhead (0.6 frames per tick for smooth 36 FPS playback)
        frameIndexRef.current = (frameIndexRef.current + 0.6) % totalFrames;

        const currentFrame = images[Math.floor(frameIndexRef.current)];
        if (currentFrame && currentFrame.complete) {
          drawImageRightAligned(ctx, currentFrame, w, h, mouse.x, mouse.y);
        }
      } else {
        // Fallback Sunset sky gradient while loading
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, "#191716");
        skyGrad.addColorStop(0.5, "#2d1b12");
        skyGrad.addColorStop(1, "#ebdcb9");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Overlay moving fog layers
      fogRef.current.forEach((fog) => {
        fog.x += fog.vx;
        if (fog.x > w + fog.r) fog.x = -fog.r;
        if (fog.x < -fog.r) fog.x = w + fog.r;

        ctx.save();
        ctx.beginPath();
        const radGrad = ctx.createRadialGradient(fog.x, fog.y, 0, fog.x, fog.y, fog.r);
        radGrad.addColorStop(0, `rgba(235, 220, 185, ${fog.opacity})`);
        radGrad.addColorStop(0.6, `rgba(235, 220, 185, ${fog.opacity * 0.35})`);
        radGrad.addColorStop(1, "rgba(235, 220, 185, 0)");
        ctx.fillStyle = radGrad;
        ctx.arc(fog.x, fog.y, fog.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Overlay falling red maple leaves particles
      leavesRef.current.forEach((leaf) => {
        leaf.swayOffset += leaf.swaySpeed;
        leaf.x += leaf.speedX + Math.sin(leaf.swayOffset) * leaf.swayAmp;
        leaf.y += leaf.speedY;
        leaf.angle += leaf.spin;

        if (leaf.y > h + 20 || leaf.x < -30) {
          leaf.y = Math.random() * h * -0.5 - 20;
          leaf.x = Math.random() * w * 1.3 + w * 0.1;
          leaf.size = Math.random() * 8 + 5;
          leaf.speedX = -(Math.random() * 1.6 + 1.2);
          leaf.speedY = Math.random() * 1.3 + 0.9;
        }

        ctx.save();
        ctx.translate(leaf.x + mouse.x * -35, leaf.y + mouse.y * -30); // parallax on leaves
        ctx.rotate(leaf.angle);
        ctx.fillStyle = leaf.color;
        
        drawMapleLeafShape(ctx, leaf.size);
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    // Track loaded frames inside rendering checks using ref to avoid hooks capture issues
    const loadedCountRef = { current: 0 };
    const checkImageLoads = () => {
      loadedCountRef.current = images.filter(img => img.complete).length;
    };
    const loadInterval = setInterval(checkImageLoads, 100);

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(loadInterval);
      cancelAnimationFrame(animationId);
    };
  }, [images]);

  return (
    <div className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden border-b border-sumi-gray bg-sumi-black">
      {/* Background Canvas: Spans full width and height of the hero block */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        
        {/* Image preloader screen */}
        <AnimatePresence>
          {!isPreloaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              className="absolute inset-0 bg-sumi-black flex flex-col items-center justify-center z-20 pointer-events-auto"
            >
              <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="w-full h-full animate-spin text-samurai-gold" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="60 180" />
                </svg>
                <span className="font-shippori text-[10px] text-samurai-gold absolute">
                  {loadProgress}%
                </span>
              </div>
              <span className="font-shippori text-[9px] tracking-widest text-washi-light/50 uppercase mt-4">
                Loading Cinematic Sequence...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soft edge fade overlay for mobile transition */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t md:bg-gradient-to-r from-sumi-black/60 via-transparent to-transparent md:w-1/3 h-full" />
      </div>

      {/* LEFT SIDE: Typography and Call to Action (Z-indexed above canvas) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-24 md:py-16 z-10 select-none">
        
        {/* Decorative Crest Outline */}
        <div className="mb-6 opacity-40">
          <svg className="w-12 h-12 text-samurai-gold" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="45" strokeDasharray="4 4" />
            <path d="M50 15 L50 85 M15 50 L85 50" />
            <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" />
          </svg>
        </div>

        <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-7xl font-bold tracking-widest text-washi-light leading-tight">
          <motion.span 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="block text-washi-parchment"
          >
            THE WAY OF
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="block"
          >
            CRAFT.
          </motion.span>
        </h1>

        <div className="mt-4 flex flex-col font-playfair italic text-3xl sm:text-4xl lg:text-5xl tracking-widest text-samurai-red space-y-2">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            BUILD.
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            CREATE.
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            ENDURE.
          </motion.span>
        </div>

        {/* Introduction */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-washi-light/80 max-w-md text-base sm:text-lg leading-relaxed font-sans font-light tracking-wide"
        >
          Greetings. I am an <strong className="font-semibold text-samurai-gold">AI Engineer</strong>, 
          <strong className="font-semibold text-samurai-gold"> Game Developer</strong>, and 
          <strong className="font-semibold text-samurai-gold"> Creative Technologist</strong>. I dedicate my craft to building systems that endure and designing digital experiences with precision, discipline, and soul.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <button
            onClick={() => {
              audio.playSwordSlice();
              onScrollToProjects();
            }}
            onMouseEnter={() => audio.playWoodStrike()}
            className="group relative px-6 py-3 font-medium tracking-widest text-xs uppercase bg-samurai-red text-washi-light border border-samurai-red rounded shadow-md overflow-hidden transition-all hover:bg-transparent hover:text-samurai-red"
          >
            <span className="absolute inset-0 w-3 bg-samurai-gold transition-all duration-300 ease-out group-hover:w-full opacity-10"></span>
            <span className="relative z-10 flex items-center gap-2">
              View Projects
              <span className="text-[10px]">▼</span>
            </span>
          </button>

          <button
            onClick={() => {
              audio.playKoto(0);
              onScrollToContact();
            }}
            onMouseEnter={() => audio.playWoodStrike()}
            className="group relative px-6 py-3 font-medium tracking-widest text-xs uppercase border border-samurai-gold text-samurai-gold rounded transition-all hover:bg-samurai-gold/5"
          >
            <span className="relative z-10">Contact Me</span>
          </button>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Empty Spacer (makes right-side canvas showing samurai visible) */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto pointer-events-none z-10" />

      {/* Floating scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 select-none animate-bounce z-10">
        <span className="font-shippori text-[10px] tracking-widest uppercase text-samurai-gold mb-1">Scroll</span>
        <span className="h-6 w-[1px] bg-samurai-gold" />
      </div>
    </div>
  );
}
