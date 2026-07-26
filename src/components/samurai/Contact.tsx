"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileText, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SpriteAnimator } from "./SpriteAnimator";

interface ContactProps {
  audio: any;
}

export const Contact = memo(function Contact({ audio }: ContactProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [dispatchState, setDispatchState] = useState<"form" | "sealing" | "resting" | "flying" | "success">("form");
  const [mounted, setMounted] = useState(false);
  const [showCrow, setShowCrow] = useState(false);
  const [hasGrabbedScroll, setHasGrabbedScroll] = useState(false);
  const [crowFps, setCrowFps] = useState(24);

  // High-performance image loading state
  const [preloadedImages, setPreloadedImages] = useState<HTMLImageElement[]>([]);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  
  const crowRef = useRef<HTMLDivElement | null>(null);
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      gsap.registerPlugin(MotionPathPlugin);
    }
  }, []);

  // Progressive Chunked Frame Preloading Strategy for Kasugai Crow Flight Sequence:
  // Loads initial 16 frames immediately and remaining in background idle chunks.
  const preloadFrames = () => {
    if (isPreloading || preloadedImagesRef.current.length > 0) return;
    setIsPreloading(true);

    const totalFrames = 192;
    const initialBatchSize = 16;
    const loadedList: HTMLImageElement[] = new Array(totalFrames).fill(null);
    let loadedCount = 0;

    const loadCrowFrame = async (i: number): Promise<void> => {
      const img = new Image();
      const frameNum = String(i).padStart(5, "0");
      img.src = `/crow/frame/frame_${frameNum}.png`;

      try {
        if ("decode" in img) {
          await img.decode();
        }
      } catch (_) {}

      loadedList[i] = img;
      loadedCount++;
      setPreloadProgress(Math.round((loadedCount / totalFrames) * 100));

      if (loadedCount === totalFrames || loadedCount === initialBatchSize) {
        const availableImages = loadedList.filter(Boolean) as HTMLImageElement[];
        preloadedImagesRef.current = availableImages;
        setPreloadedImages(availableImages);
        if (loadedCount === totalFrames) {
          setIsPreloading(false);
        }
      }
    };

    // Load initial 16 frames
    for (let i = 0; i < initialBatchSize; i++) {
      loadCrowFrame(i);
    }

    // Load remaining frames in background idle chunks
    let nextIndex = initialBatchSize;
    const loadRemaining = () => {
      if (nextIndex >= totalFrames) return;
      const chunkSize = 16;
      const endIndex = Math.min(nextIndex + chunkSize, totalFrames);

      for (let i = nextIndex; i < endIndex; i++) {
        loadCrowFrame(i);
      }
      nextIndex = endIndex;

      if (nextIndex < totalFrames) {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          (window as any).requestIdleCallback(loadRemaining, { timeout: 500 });
        } else {
          setTimeout(loadRemaining, 60);
        }
      }
    };

    loadRemaining();
  };

  const playCrowCaw = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const triggerCaw = (frequencyStart: number, frequencyEnd: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(frequencyStart, startTime);
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(frequencyStart + 50, startTime);
        filter.Q.setValueAtTime(3.2, startTime);
        
        const mod = ctx.createOscillator();
        mod.frequency.setValueAtTime(38, startTime);
        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.06, startTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, startTime);
        
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.08);
        osc.frequency.linearRampToValueAtTime(frequencyEnd, startTime + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
        
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        mod.start(startTime);
        osc.stop(startTime + duration);
        mod.stop(startTime + duration);
      };

      triggerCaw(920, 780, ctx.currentTime, 0.45);
      triggerCaw(870, 720, ctx.currentTime + 0.52, 0.42);

      setTimeout(() => {
        if (ctx.state !== "closed") {
          ctx.close().catch(() => {});
        }
      }, 1200);
    } catch (e) {
      console.error("Web audio crow caw failed", e);
    }
  };

  const startCrowFlightAnimation = () => {
    setShowCrow(true);
    setHasGrabbedScroll(false);
    setCrowFps(24);

    const lenis = (window as any).lenisInstance;
    if (lenis) {
      lenis.stop();
    }
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      if (!crowRef.current) return;

      const targetScrollEl = document.getElementById("message-scroll-target");
      let targetX = window.innerWidth / 2;
      let targetY = window.pageYOffset + window.innerHeight * 0.8;

      if (targetScrollEl) {
        const rect = targetScrollEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = window.pageYOffset + rect.top + rect.height / 2;
      }

      const startX = window.innerWidth + 150;
      const startY = window.pageYOffset - 150;

      const currentScrollY = window.pageYOffset;
      const arcControlX = (startX + targetX) / 2 + 100;
      const arcControlY = (startY + targetY) / 2 - 120;

      const exitX = -200;
      const exitY = currentScrollY - 200;
      const exitControlX = (targetX + exitX) / 2 - 150;
      const exitControlY = targetY - 250;

      gsap.set(crowRef.current, {
        x: startX,
        y: startY,
        scale: 0.7,
        rotation: -25,
        opacity: 1
      });

      const tl = gsap.timeline();

      tl.to(crowRef.current, {
        duration: 2.8,
        motionPath: {
          path: [
            { x: startX, y: startY },
            { x: arcControlX, y: arcControlY },
            { x: targetX, y: targetY }
          ],
          curviness: 1.5
        },
        scale: 1.0,
        rotation: -10,
        ease: "power2.inOut",
        onStart: () => {
          setDispatchState("flying");
          playCrowCaw();
        }
      });

      tl.to(crowRef.current, {
        duration: 1.5,
        x: targetX,
        y: targetY + 5,
        rotation: 0,
        scale: 1.05,
        ease: "sine.inOut",
        onStart: () => {
          setDispatchState("resting");
          setCrowFps(8);
        }
      });

      tl.to(crowRef.current, {
        duration: 0.1,
        onComplete: () => {
          setHasGrabbedScroll(true);
          setCrowFps(30);
          audio?.playSwordSlice?.();
        }
      });

      tl.to(crowRef.current, {
        duration: 2.5,
        motionPath: {
          path: [
            { x: targetX, y: targetY },
            { x: exitControlX, y: exitControlY },
            { x: exitX, y: exitY }
          ],
          curviness: 1.5
        },
        scale: 0.5,
        rotation: -35,
        ease: "power3.in",
        onStart: () => {
          setDispatchState("flying");
          playCrowCaw();
        },
        onComplete: () => {
          setShowCrow(false);
          setDispatchState("success");
          
          const activeLenis = (window as any).lenisInstance;
          if (activeLenis) {
            activeLenis.start();
          }
          document.body.style.overflow = "";
        }
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    audio?.playWoodStrike?.();
    setDispatchState("sealing");

    if (preloadedImagesRef.current.length === 0) {
      preloadFrames();
    }

    setTimeout(() => {
      startCrowFlightAnimation();
    }, 1200);
  };

  const handleResetForm = () => {
    audio?.playWoodStrike?.();
    setForm({ name: "", email: "", message: "" });
    setDispatchState("form");
    setShowCrow(false);
    setHasGrabbedScroll(false);
    
    const lenis = (window as any).lenisInstance;
    if (lenis) {
      lenis.start();
    }
    document.body.style.overflow = "";
  };

  return (
    <section id="contact" className="py-20 md:py-24 px-6 sm:px-12 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <span className="font-shippori text-xs text-samurai-gold tracking-widest uppercase block mb-1">
          飛脚 // Kasugai Messenger Crow
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-washi-light tracking-wider mb-4">
          DISPATCH SEALED SCROLL.
        </h2>
        <p className="font-sans text-xs sm:text-sm text-washi-light/60 max-w-lg mx-auto tracking-wide font-light">
          Seal your message onto a parchment scroll. A loyal Kasugai messenger crow will descend from the clouds, claim your scroll, and deliver your transmission across the mountains.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <AnimatePresence mode="wait">
          {(dispatchState === "form" || dispatchState === "sealing") && (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="parchment-bg rounded-lg p-6 sm:p-10 border border-cedar-brown/30 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-cedar-brown/20 pb-4 mb-6">
                <span className="font-shippori text-xs text-samurai-red font-bold uppercase tracking-widest">
                  書状 // OFFENSIVE TRANSMISSION
                </span>
                <span className="font-mono text-[10px] text-cedar-brown/50">
                  SEAL STATUS: UNBOUND
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col space-y-1">
                  <label htmlFor="name" className="font-shippori text-xs font-bold text-[#2c1a11] uppercase tracking-wider text-left">
                    Your Name // 姓名
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onFocus={preloadFrames}
                    placeholder="E.g. Lord Miyamoto Musashi"
                    className="w-full bg-[#fdfbf7] border border-cedar-brown/30 rounded px-4 py-3 text-sm text-[#2c1a11] placeholder:text-cedar-brown/30 focus:outline-none focus:border-samurai-red transition-colors"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="email" className="font-shippori text-xs font-bold text-[#2c1a11] uppercase tracking-wider text-left">
                    Your Email // 連絡先
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={preloadFrames}
                    placeholder="musashi@feudal.jp"
                    className="w-full bg-[#fdfbf7] border border-cedar-brown/30 rounded px-4 py-3 text-sm text-[#2c1a11] placeholder:text-cedar-brown/30 focus:outline-none focus:border-samurai-red transition-colors"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="message" className="font-shippori text-xs font-bold text-[#2c1a11] uppercase tracking-wider text-left">
                    Sealed Transmission // 書簡内容
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    onFocus={preloadFrames}
                    placeholder="Write your dispatch details here..."
                    className="w-full bg-[#fdfbf7] border border-cedar-brown/30 rounded px-4 py-3 text-sm text-[#2c1a11] placeholder:text-cedar-brown/30 focus:outline-none focus:border-samurai-red transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {isPreloading ? (
                    <span className="font-mono text-[10px] text-samurai-red animate-pulse">
                      Summoning Kasugai Crow... {preloadProgress}%
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-cedar-brown/60">
                      Crow Ready
                    </span>
                  )}

                  <button
                    type="submit"
                    onMouseEnter={preloadFrames}
                    disabled={dispatchState === "sealing"}
                    className="min-h-[44px] px-8 py-3 bg-samurai-red hover:bg-[#a8201a] text-washi-light font-cinzel text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-samurai-gold"
                  >
                    {dispatchState === "sealing" ? (
                      <>
                        <span className="animate-spin">❖</span> Sealing Scroll...
                      </>
                    ) : (
                      <>
                        Dispatch Crow <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {(dispatchState === "flying" || dispatchState === "resting") && (
            <motion.div
              key="target-scroll-wrapper"
              id="message-scroll-target"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 flex flex-col items-center justify-center relative"
            >
              <div
                className={`transition-all duration-700 ${
                  hasGrabbedScroll ? "opacity-0 scale-75 translate-y-[-50px]" : "opacity-100 scale-100"
                }`}
              >
                <div className="parchment-bg px-8 py-4 rounded border-2 border-samurai-red shadow-2xl flex items-center gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-samurai-red flex items-center justify-center text-washi-light font-shippori text-sm font-bold">
                    印
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-cinzel text-xs font-bold text-[#2c1a11] tracking-wider">
                      SEALED SCROLL FOR DISPATCH
                    </span>
                    <span className="font-sans text-[10px] text-cedar-brown/70">
                      From: {form.name} ({form.email})
                    </span>
                  </div>
                  <FileText className="w-6 h-6 text-samurai-red animate-pulse ml-4" />
                </div>
              </div>
            </motion.div>
          )}

          {dispatchState === "success" && (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="parchment-bg rounded-lg p-10 border border-samurai-gold shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-samurai-gold/20 border-2 border-samurai-gold flex items-center justify-center mx-auto text-samurai-gold">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="font-shippori text-xs text-samurai-red font-bold uppercase tracking-widest block mb-1">
                  伝達完了 // DISPATCH DELIVERED
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-[#2c1a11] tracking-wider">
                  TRANSMISSION CLAIMED
                </h3>
              </div>

              <p className="font-serif text-sm text-[#3d2619] leading-relaxed max-w-md mx-auto">
                The Kasugai messenger crow has claimed your scroll and taken flight across the peaks. You will receive a response at <strong className="font-bold text-[#8d1c1d]">{form.email}</strong> shortly.
              </p>

              <div className="pt-4">
                <button
                  onClick={handleResetForm}
                  className="min-h-[44px] px-8 py-3 bg-[#2c1a11] hover:bg-[#3d2619] text-samurai-gold font-cinzel text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-samurai-gold"
                >
                  Send Another Dispatch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kasugai Messenger Crow Flight Sequence Portal */}
      {mounted && showCrow && createPortal(
        <div
          ref={crowRef}
          className="fixed top-0 left-0 z-[999999] pointer-events-none w-64 h-64 -mt-32 -ml-32"
          style={{ willChange: "transform" }}
        >
          <SpriteAnimator
            images={preloadedImages}
            fps={crowFps}
            width={256}
            height={256}
          />
        </div>,
        document.body
      )}
    </section>
  );
});
