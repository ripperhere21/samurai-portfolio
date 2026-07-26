"use client";

import React, { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface Point {
  x: number;
  y: number;
  width: number;
}

interface Stroke {
  points: Point[];
  startTime: number;
}

interface ZenCalligraphyProps {
  audio: any;
}

const KANJI_PATHS: Record<string, number[][][]> = {
  "力": [
    [[35, 35], [65, 35], [63, 62], [52, 75], [38, 80]], // Stroke 1: Horizontal and hook
    [[50, 22], [50, 45], [42, 65], [26, 75]]             // Stroke 2: Left slash
  ],
  "心": [
    [[28, 55], [24, 64]],                                 // Stroke 1: Left dot
    [[35, 45], [42, 72], [68, 72], [76, 60], [72, 48]],    // Stroke 2: Curved base and hook
    [[52, 40], [54, 48]],                                 // Stroke 3: Center dot
    [[76, 35], [80, 42]]                                  // Stroke 4: Right dot
  ],
  "忍": [
    // Top Blade (刃)
    [[35, 26], [65, 26]],                                 // Stroke 1: Horizontal
    [[50, 16], [50, 40], [42, 46]],                       // Stroke 2: Vertical with hook
    [[30, 36], [22, 46]],                                 // Stroke 3: Left slash
    [[58, 32], [66, 38]],                                 // Stroke 4: Center dot
    // Bottom Heart (心)
    [[28, 72], [24, 78]],                                 // Stroke 5: Left dot
    [[36, 62], [42, 86], [68, 86], [76, 74], [72, 64]],    // Stroke 6: Curved base & hook
    [[52, 58], [55, 66]],                                 // Stroke 7: Center dot
    [[76, 54], [80, 62]]                                  // Stroke 8: Right dot
  ]
};

export function ZenCalligraphy({ audio }: ZenCalligraphyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);
  const strokesRef = useRef<Stroke[]>([]);
  const lastPointRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [slashActive, setSlashActive] = useState(false);

  // Brush sweeping sound synthesis context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sweepNodeRef = useRef<{ osc: OscillatorNode; filter: BiquadFilterNode; gain: GainNode } | null>(null);

  const initSweepSound = () => {
    if (audio.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Soft brush friction sound modeled using a triangle wave at very low volume + bandpass filter
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, ctx.currentTime);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.Q.setValueAtTime(10, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);

      sweepNodeRef.current = { osc, filter, gain };
    } catch (e) {
      console.warn("Brush sweep audio setup failed:", e);
    }
  };

  const startSweepSound = () => {
    if (audio.isMuted) return;
    if (!audioCtxRef.current) {
      initSweepSound();
    }
    const node = sweepNodeRef.current;
    if (node && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      node.gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    }
  };

  const updateSweepSound = (speed: number) => {
    const node = sweepNodeRef.current;
    if (node && audioCtxRef.current && !audio.isMuted) {
      const now = audioCtxRef.current.currentTime;
      // Modulate volume and filter frequency by drawing speed
      const targetVolume = Math.min(0.18, 0.02 + speed * 0.05);
      const targetFreq = Math.min(4000, 1200 + speed * 400);
      node.gain.gain.setValueAtTime(targetVolume, now);
      node.filter.frequency.setValueAtTime(targetFreq, now);
    }
  };

  const stopSweepSound = () => {
    const node = sweepNodeRef.current;
    if (node && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      node.gain.gain.linearRampToValueAtTime(0, now + 0.15);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  // Handle Resize using ResizeObserver to ensure correct sizing even if the scroll animates open
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue; // Skip zero-width initial layout state

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Animation Loop (Redraw and fade strokes)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      const fadeDuration = 6000; // Ink fades fully in 6 seconds (Zen writing)

      // Filter active strokes
      strokesRef.current = strokesRef.current.filter((stroke) => {
        return now - stroke.startTime < fadeDuration;
      });

      strokesRef.current.forEach((stroke) => {
        const age = now - stroke.startTime;
        const opacity = Math.max(0, 1 - age / fadeDuration);

        if (stroke.points.length < 2) return;

        // 1. Draw outer bleeding layer (simulates ink spreading on wet washi)
        ctx.beginPath();
        ctx.strokeStyle = `rgba(20, 18, 16, ${opacity * 0.08})`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineWidth = pt.width * 2.8; // Wider bleed width
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // 2. Draw core sumi-e ink layer (darker, sharp center)
        ctx.beginPath();
        ctx.strokeStyle = `rgba(10, 9, 8, ${opacity * 0.85})`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          ctx.lineWidth = pt.width;
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    const touchEvent = e as React.TouchEvent;
    const mouseEvent = e as React.MouseEvent;

    if (touchEvent.touches && touchEvent.touches.length > 0) {
      clientX = touchEvent.touches[0].clientX;
      clientY = touchEvent.touches[0].clientY;
    } else if (touchEvent.changedTouches && touchEvent.changedTouches.length > 0) {
      clientX = touchEvent.changedTouches[0].clientX;
      clientY = touchEvent.changedTouches[0].clientY;
    } else {
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isAutoDrawing) return;
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    startSweepSound();

    const newStroke: Stroke = {
      points: [{ x: coords.x, y: coords.y, width: 6 }],
      startTime: Date.now(),
    };

    strokesRef.current.push(newStroke);
    lastPointRef.current = { x: coords.x, y: coords.y, time: Date.now() };
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isAutoDrawing) return;
    if (!isDrawing || strokesRef.current.length === 0) return;
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
    if (!coords || !lastPointRef.current) return;

    const currentStroke = strokesRef.current[strokesRef.current.length - 1];
    const now = Date.now();
    const timeDiff = now - lastPointRef.current.time || 1;

    const dx = coords.x - lastPointRef.current.x;
    const dy = coords.y - lastPointRef.current.y;
    const distance = Math.hypot(dx, dy);
    const speed = distance / timeDiff;

    updateSweepSound(speed);

    // Calligraphy speed thickness: faster = thinner, slower = thicker
    const targetWidth = Math.max(2, 10 - speed * 1.8);
    const lastPoint = currentStroke.points[currentStroke.points.length - 1];
    const width = lastPoint ? lastPoint.width + (targetWidth - lastPoint.width) * 0.3 : targetWidth;

    currentStroke.points.push({ x: coords.x, y: coords.y, width });
    lastPointRef.current = { x: coords.x, y: coords.y, time: now };
  };

  const handleEnd = () => {
    if (isAutoDrawing) return;
    setIsDrawing(false);
    stopSweepSound();
    lastPointRef.current = null;
  };

  const handleReset = () => {
    if (isAutoDrawing) return;
    audio.playSwordSlice();
    setSlashActive(true);
    setTimeout(() => {
      strokesRef.current = [];
      setSlashActive(false);
    }, 450);
  };

  const drawKanji = (key: string) => {
    if (isAutoDrawing || isDrawing) return;
    setIsAutoDrawing(true);
    strokesRef.current = []; // Clear board

    const kanjiStrokes = KANJI_PATHS[key];
    if (!kanjiStrokes) {
      setIsAutoDrawing(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsAutoDrawing(false);
      return;
    }
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    let strokeIdx = 0;
    startSweepSound();

    const drawNextStroke = () => {
      if (strokeIdx >= kanjiStrokes.length) {
        stopSweepSound();
        setIsAutoDrawing(false);
        return;
      }

      const relativePoints = kanjiStrokes[strokeIdx];
      const points = relativePoints.map(([rx, ry]) => ({
        x: (rx / 100) * w,
        y: (ry / 100) * h,
        width: 5.5
      }));

      // Create new stroke
      const newStroke: Stroke = {
        points: [points[0]],
        startTime: Date.now()
      };
      strokesRef.current.push(newStroke);

      let pointIdx = 1;
      const interval = setInterval(() => {
        if (pointIdx >= points.length) {
          clearInterval(interval);
          strokeIdx++;
          audio.playWoodStrike(); // Wood tap sound when lifting brush
          setTimeout(drawNextStroke, 200); // 200ms delay before next stroke
          return;
        }

        const pt = points[pointIdx];
        const lastPt = newStroke.points[newStroke.points.length - 1];
        const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        
        updateSweepSound(dist * 0.15);
        newStroke.points.push(pt);
        pointIdx++;
      }, 50); // 50ms per stroke point segment
    };

    drawNextStroke();
  };

  return (
    <div className="w-full flex flex-col items-center mt-16 max-w-4xl px-4 relative select-none">
      
      {/* Decorative Stamp (Kanji signature tag) */}
      <div className="absolute left-8 -top-8 opacity-25 font-shippori text-6xl text-samurai-red hidden md:block">
        筆
      </div>

      <div className="text-center mb-6">
        <h4 className="font-cinzel text-lg md:text-xl font-bold tracking-widest text-samurai-gold uppercase mb-2">
          Zen Calligraphy Canvas // 水書板
        </h4>
        <p className="font-sans text-[11px] md:text-xs text-washi-light/50 tracking-wider font-light max-w-md mx-auto">
          Draw on the scroll with your sumi-e water brush. The ink will seep into the fibers and slowly fade away, mirroring the impermanence of all things.
        </p>
      </div>

      {/* Kanji Oracle Brush Selection Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6 select-none bg-cedar-brown/[0.04] p-2 rounded border border-cedar-brown/10">
        <span className="font-sans text-[10px] text-cedar-brown/60 tracking-wider uppercase font-bold mr-1">// Oracle Brush:</span>
        <button
          disabled={isAutoDrawing || isDrawing}
          onClick={() => drawKanji("力")}
          onMouseEnter={() => audio.playWoodStrike()}
          className="px-3 py-1 text-xs border border-cedar-brown/30 bg-[#ecdca7] hover:bg-[#decfa7] text-[#2c1a11] font-shippori font-bold transition-all disabled:opacity-30 rounded-sm cursor-pointer shadow-sm active:scale-95"
        >
          力 (Strength)
        </button>
        <button
          disabled={isAutoDrawing || isDrawing}
          onClick={() => drawKanji("心")}
          onMouseEnter={() => audio.playWoodStrike()}
          className="px-3 py-1 text-xs border border-cedar-brown/30 bg-[#ecdca7] hover:bg-[#decfa7] text-[#2c1a11] font-shippori font-bold transition-all disabled:opacity-30 rounded-sm cursor-pointer shadow-sm active:scale-95"
        >
          心 (Heart)
        </button>
        <button
          disabled={isAutoDrawing || isDrawing}
          onClick={() => drawKanji("忍")}
          onMouseEnter={() => audio.playWoodStrike()}
          className="px-3 py-1 text-xs border border-cedar-brown/30 bg-[#ecdca7] hover:bg-[#decfa7] text-[#2c1a11] font-shippori font-bold transition-all disabled:opacity-30 rounded-sm cursor-pointer shadow-sm active:scale-95"
        >
          忍 (Endure)
        </button>
      </div>

      {/* Board Container */}
      <div
        ref={containerRef}
        className="w-full h-80 relative rounded border border-cedar-brown/30 bg-[#ebdcb9]/90 shadow-[inset_0_4px_20px_rgba(0,0,0,0.15),0_10px_25px_rgba(0,0,0,0.4)] overflow-hidden cursor-crosshair group parchment-bg"
      >
        {/* Calligraphy Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 z-10"
          style={{ touchAction: "none" }}
        />

        {/* Traditional Washi fiber lines texture watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-image" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

        {/* Clear Button */}
        <button
          onClick={handleReset}
          disabled={isAutoDrawing}
          onMouseEnter={() => audio.playWoodStrike()}
          className="absolute bottom-4 right-4 z-20 p-2.5 rounded-full border border-cedar-brown/30 bg-[#ecdca7] text-cedar-brown hover:bg-[#decfa7] hover:text-[#2c1a11] transition-all duration-300 shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          title="Slash Canvas (Clear)"
        >
          <Trash2 size={15} />
        </button>

        {/* Slash Sword Visual Overlay Effect */}
        {slashActive && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div className="w-[150%] h-[2px] bg-washi-light rotate-[-22deg] animate-slash-cut shadow-[0_0_15px_rgba(255,255,255,1)]" />
            <div className="absolute inset-0 bg-sumi-black/20 animate-flash-overlay" />
          </div>
        )}
      </div>
    </div>
  );
}
