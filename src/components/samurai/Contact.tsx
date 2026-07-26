"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileText, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SpriteAnimator } from "./SpriteAnimator";

interface ContactProps {
  audio: any;
}

export function Contact({ audio }: ContactProps) {
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

  // Preloads the 192 PNG frames sequentially into memory
  const preloadFrames = () => {
    if (isPreloading || preloadedImagesRef.current.length > 0) return;
    setIsPreloading(true);

    const totalFrames = 192;
    const loadedList: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      // Pad sequence number, e.g. 00000, 00001, etc.
      const frameNum = String(i).padStart(5, "0");
      img.src = `/crow/frame/frame_${frameNum}.png`;
      img.onload = () => {
        loadedCount++;
        setPreloadProgress(Math.round((loadedCount / totalFrames) * 100));
        
        if (loadedCount === totalFrames) {
          preloadedImagesRef.current = loadedList;
          setPreloadedImages(loadedList);
          setIsPreloading(false);
        }
      };
      loadedList.push(img);
    }
  };

  // Synthesize custom Kasugai Messenger Crow "Caw! Caw!" sound using Web Audio API
  const playCrowCaw = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const triggerCaw = (frequencyStart: number, frequencyEnd: number, startTime: number, duration: number) => {
        // Sawtooth oscillator for harsh nasal tone
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(frequencyStart, startTime);
        
        // Nasal bandpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(frequencyStart + 50, startTime);
        filter.Q.setValueAtTime(3.2, startTime);
        
        // Tremolo / Rattle effect
        const mod = ctx.createOscillator();
        mod.frequency.setValueAtTime(38, startTime); // 38Hz vibration
        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.06, startTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, startTime);
        
        // Envelope
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.08);
        osc.frequency.linearRampToValueAtTime(frequencyEnd, startTime + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
        
        // Connections
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

      // Caw 1
      triggerCaw(920, 780, ctx.currentTime, 0.45);
      
      // Caw 2 (slightly delayed and lower pitch)
      triggerCaw(870, 720, ctx.currentTime + 0.52, 0.42);

      // Cleanly close AudioContext after sound finishes
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
    setCrowFps(24); // Target 24 FPS

    // Stop lenis scroll
    const lenis = (window as any).lenisInstance;
    if (lenis) {
      lenis.stop();
    }
    document.body.style.overflow = "hidden";

    // Wait a brief frame to let the crow ref mount in the portal
    requestAnimationFrame(() => {
      if (!crowRef.current) return;

      const targetScrollEl = document.getElementById("message-scroll-target");
      let targetX = window.innerWidth / 2;
      let targetY = window.pageYOffset + window.innerHeight * 0.8;
      if (targetScrollEl) {
        const rect = targetScrollEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2 + window.scrollX;
        targetY = rect.top + rect.height / 2 + window.scrollY;
      }

      // Spawn exactly above the current viewport (no scroll to top)
      const startX = -150;
      const currentScrollY = window.scrollY;
      const startY = currentScrollY - 150;

      // Set initial position
      gsap.set(crowRef.current, {
        x: startX,
        y: startY,
        scale: 0.4,
        rotation: 15,
        opacity: 0
      });

      const tl = gsap.timeline({
        onComplete: () => {
          // Cleanup after flyaway completes
          setDispatchState("success");
          setShowCrow(false);
          
          // Dispose preloaded images and references to release memory
          setPreloadedImages([]);
          preloadedImagesRef.current = [];
          setPreloadProgress(0);

          // Re-enable scroll
          const currentLenis = (window as any).lenisInstance;
          if (currentLenis) {
            currentLenis.start();
          }
          document.body.style.overflow = "";
        }
      });

      // Fade in
      tl.to(crowRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out"
      });

      // Phase 1: Glide down from top of current viewport to the desk scroll
      tl.to(crowRef.current, {
        motionPath: {
          path: [
            { x: window.innerWidth * 0.25, y: currentScrollY + window.innerHeight * 0.15 },
            { x: window.innerWidth * 0.6, y: currentScrollY + window.innerHeight * 0.45 },
            { x: window.innerWidth * 0.35, y: currentScrollY + window.innerHeight * 0.75 },
            { x: targetX, y: targetY - 50 } // hover slightly above target scroll
          ],
          curviness: 1.25
        },
        scale: 0.8,
        rotation: 0,
        duration: 4.5,
        ease: "power2.out"
      }, "<");

      // Phase 2: Grab the scroll & play sound
      tl.to(crowRef.current, {
        y: targetY, // move down to grab scroll
        duration: 0.4,
        ease: "power1.inOut",
        onComplete: () => {
          playCrowCaw();
          setHasGrabbedScroll(true);
          setDispatchState("flying");
          // Increase wing flap speed by 20% (from 24 to ~29 FPS)
          setCrowFps(29);
        }
      });

      // Small hover bobbing at the desk
      tl.to(crowRef.current, {
        y: targetY - 15,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut"
      });

      // Phase 3: Flyaway diagonally upward and off-screen relative to viewport
      tl.to(crowRef.current, {
        x: window.innerWidth + 200,
        y: currentScrollY - 200, // flies out of the top of the current viewport!
        scale: 0.4,
        rotation: -25,
        duration: 2.2,
        ease: "power2.in"
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    
    // Ensure preloading is complete or triggered before continuing
    preloadFrames();
    
    // Begin sealing sequence
    setDispatchState("sealing");
    audio.playSwordSlice(); // slice sound as letter is wrapped

    // 1. Hanko stamp impact sound at 500ms
    setTimeout(() => {
      audio.playWoodStrike();
      // Play koto shortly after
      setTimeout(() => {
        audio.playKoto(4);
      }, 150);
    }, 500);

    // 2. Letter folds into rolled scroll on desk at 1200ms
    setTimeout(() => {
      setDispatchState("resting");
      
      // Wait until preloading has fully finished before starting the crow swoop
      const checkPreloadAndStart = () => {
        if (preloadedImagesRef.current.length === 192) {
          // Additional 300ms delay after sealing completes
          setTimeout(() => {
            startCrowFlightAnimation();
          }, 300);
        } else {
          setTimeout(checkPreloadAndStart, 50);
        }
      };
      
      checkPreloadAndStart();
    }, 1200);
  };

  const handleResetForm = () => {
    setForm({ name: "", email: "", message: "" });
    setDispatchState("form");
    setShowCrow(false);
    setHasGrabbedScroll(false);
  };

  return (
    <section id="contact" className="py-24 px-8 md:px-20 lg:px-32 bg-sumi-black border-b border-sumi-gray relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-samurai-gold/20 pb-6">
          <div>
            <span className="font-shippori text-xs md:text-sm tracking-widest text-samurai-gold uppercase block mb-2">// Dispatch a Message</span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-widest text-washi-light">
              BEGIN THE CONVERSATION
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-sans text-xs md:text-sm text-washi-light/60 tracking-wider font-light max-w-xs md:text-right">
            Send your inquiry. Letters are read with high priority.
          </p>
        </div>

        {/* Traditional Writing Desk layout */}
        <div className="wood-plaque-bg rounded-sm p-6 md:p-12 relative flex flex-col md:flex-row gap-12 items-stretch select-none">
          
          {/* Decorative Desk item: Inkstone & Brush */}
          <div className="w-full md:w-1/4 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-samurai-gold/15 pb-8 md:pb-0 md:pr-8">
            <span className="font-shippori text-[10px] tracking-widest text-samurai-gold opacity-50 uppercase mb-6 block">
              // Writing Utensils
            </span>
            
            {/* The Inkstone (Suzuri) */}
            <div className="w-24 h-40 bg-[#161514] rounded-md border border-[#3c3a37] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_8px_16px_rgba(0,0,0,0.5)] p-2 relative flex flex-col justify-between">
              <div className="w-full h-[65%] bg-[#0d0c0c] rounded border border-black/40 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-70" />
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-samurai-red/10 blur-[2px]" />
              </div>
              <div className="w-full h-[25%] bg-[#222120] rounded border border-black/20" />
            </div>

            {/* Resting Brush (Fude) */}
            <div className="relative w-full h-10 mt-6 flex justify-center items-center">
              <div 
                className="w-[120%] h-2 bg-[#2c1a11] rounded-full border border-samurai-gold/30 shadow-md relative origin-center"
                style={{ transform: "rotate(-18deg) translateY(-8px)" }}
              >
                <div className="absolute right-6 top-0 w-2 h-full bg-[#bfa15f]" />
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-4 bg-[#f5efe2] border border-black/15 shadow-sm"
                  style={{ borderRadius: "50% 0 0 50%", clipPath: "polygon(0 50%, 100% 0, 100% 100%)" }}
                />
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#121110]"
                  style={{ borderRadius: "50% 0 0 50%", clipPath: "polygon(0 50%, 100% 0, 100% 100%)" }}
                />
              </div>
            </div>
          </div>

          {/* Centerpiece: The Parchment Writing Desk Area */}
          <div className="w-full md:w-3/4 flex flex-col justify-between parchment-bg p-8 md:p-10 rounded-sm relative overflow-hidden min-h-[360px]">
            
            {/* 1. Hanko Sealing Animation Layer */}
            {dispatchState === "sealing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10 pointer-events-none">
                <motion.div
                  initial={{ scale: 3.5, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 0.9, rotate: 12 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-24 h-24 border-4 border-double border-samurai-red rounded-full flex flex-col items-center justify-center text-samurai-red font-shippori text-4xl font-extrabold select-none pointer-events-none bg-samurai-red/[0.03] shadow-lg"
                >
                  <span className="relative z-10 leading-none">印</span>
                  <div className="absolute inset-1.5 border border-dashed border-samurai-red/30 rounded-full scale-95" />
                </motion.div>
              </div>
            )}

            {/* 2. Folded Parchment Scroll resting on the desk */}
            {dispatchState === "resting" && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
              >
                <div id="message-scroll-target" className="relative w-48 h-16 flex items-center justify-center mb-2">
                  <svg viewBox="0 0 100 30" className="w-48 h-16 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]">
                    <rect x="10" y="5" width="80" height="20" rx="3" fill="#ebdcb9" stroke="#2c1a11" strokeWidth="1.5" />
                    <ellipse cx="10" cy="15" rx="4" ry="10" fill="#a48c5e" stroke="#2c1a11" strokeWidth="1.5" />
                    <ellipse cx="10" cy="15" rx="1.5" ry="6" fill="#2c1a11" />
                    <ellipse cx="90" cy="15" rx="4" ry="10" fill="#a48c5e" stroke="#2c1a11" strokeWidth="1.5" />
                    <ellipse cx="90" cy="15" rx="1.5" ry="6" fill="#2c1a11" />
                    <rect x="47" y="5" width="6" height="20" fill="#8d1c1d" />
                    <circle cx="50" cy="15" r="4.5" fill="#8d1c1d" stroke="#6d1314" strokeWidth="0.8" />
                    <circle cx="50" cy="15" r="2.5" fill="none" stroke="#ebdcb9" strokeWidth="0.5" opacity="0.6" />
                  </svg>
                </div>
                <span className="font-shippori text-[10px] tracking-widest text-[#3d2619] opacity-75 uppercase animate-pulse">
                  Messenger Crow Arriving... {preloadProgress > 0 ? `(${preloadProgress}%)` : ""}
                </span>
              </motion.div>
            )}

            {/* 3. Kasugai Messenger Crow Portal Overlay */}
            {mounted && showCrow && typeof document !== "undefined" && createPortal(
              <div
                ref={crowRef}
                className="absolute pointer-events-none select-none z-[9999] w-[320px] h-[180px] -translate-x-1/2 -translate-y-1/2"
                style={{ left: 0, top: 0 }}
              >
                <div className="relative w-full h-full">
                  <SpriteAnimator
                    images={preloadedImages}
                    fps={crowFps}
                    playing={true}
                    className="w-full h-full"
                  />

                  {/* Scroll physically attached to crow's feet during flyaway */}
                  {hasGrabbedScroll && (
                    <div
                      className="absolute origin-top"
                      style={{
                        top: "115px",
                        left: "120px",
                        transform: "scale(0.6) rotate(-15deg) translateX(-50%)"
                      }}
                    >
                      <svg viewBox="0 0 100 30" className="w-20 h-6 filter drop-shadow-md">
                        <rect x="10" y="5" width="80" height="20" rx="3" fill="#ebdcb9" stroke="#2c1a11" strokeWidth="1.5" />
                        <ellipse cx="10" cy="15" rx="4" ry="10" fill="#a48c5e" stroke="#2c1a11" strokeWidth="1.5" />
                        <ellipse cx="90" cy="15" rx="4" ry="10" fill="#a48c5e" stroke="#2c1a11" strokeWidth="1.5" />
                        <rect x="47" y="5" width="6" height="20" fill="#8d1c1d" />
                        <circle cx="50" cy="15" r="4.5" fill="#8d1c1d" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )}

            {/* 4. Final Success State Overlay */}
            {dispatchState === "success" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#f5efe0] rounded-sm flex flex-col items-center justify-center p-8 text-center z-10 overflow-hidden"
              >
                <CheckCircle2 className="w-16 h-16 text-samurai-red mb-4" />
                <h3 className="font-cinzel text-xl font-bold tracking-widest text-[#1e120c] mb-2">
                  MESSAGE DISPATCHED BY CROW
                </h3>
                <p className="font-serif text-sm text-[#3d2619] max-w-md leading-relaxed mb-4">
                  Your inquiry has been picked up by our **Kasugai messenger crow** and flown across the valley.
                </p>

                <button
                  onClick={handleResetForm}
                  onMouseEnter={() => audio.playWoodStrike()}
                  className="mt-4 px-4 py-2 border border-cedar-brown/30 text-xs tracking-widest uppercase hover:bg-cedar-brown/5 text-cedar-brown font-medium relative z-10"
                >
                  Write Another
                </button>
              </motion.div>
            )}

            {/* 5. Unopened Form State */}
            {dispatchState === "form" && (
              <>
                {/* Letter Head */}
                <div className="mb-6 flex justify-between items-start border-b border-[#2c1a11]/15 pb-4">
                  <span className="font-shippori text-[10px] tracking-widest text-samurai-red font-bold uppercase">
                    // Formulate Scroll
                  </span>
                  <FileText size={16} className="text-cedar-brown opacity-50" />
                </div>

                {/* The Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name Field */}
                  <div className="flex flex-col space-y-1">
                    <label className="font-shippori text-[11px] tracking-widest uppercase text-cedar-brown font-bold">
                      Name / Clan
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onFocus={() => {
                        audio.playWoodStrike();
                        preloadFrames();
                      }}
                      className="w-full bg-transparent border-b border-[#2c1a11]/30 py-2 text-sm font-sans focus:outline-none focus:border-samurai-red transition-colors duration-300 placeholder-[#2c1a11]/40"
                      placeholder="Enter name..."
                    />
                  </div>

                  {/* Email Field */}
                  <div className="flex flex-col space-y-1">
                    <label className="font-shippori text-[11px] tracking-widest uppercase text-cedar-brown font-bold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={() => {
                        audio.playWoodStrike();
                        preloadFrames();
                      }}
                      className="w-full bg-transparent border-b border-[#2c1a11]/30 py-2 text-sm font-sans focus:outline-none focus:border-samurai-red transition-colors duration-300 placeholder-[#2c1a11]/40"
                      placeholder="Enter email..."
                    />
                  </div>

                  {/* Message Field */}
                  <div className="flex flex-col space-y-1">
                    <label className="font-shippori text-[11px] tracking-widest uppercase text-cedar-brown font-bold">
                      Inquiry Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      onFocus={() => {
                        audio.playWoodStrike();
                        preloadFrames();
                      }}
                      className="w-full bg-transparent border-b border-[#2c1a11]/30 py-2 text-sm font-serif leading-relaxed focus:outline-none focus:border-samurai-red transition-colors duration-300 placeholder-[#2c1a11]/40 resize-none"
                      placeholder="Formulate your request..."
                    />
                  </div>

                  {/* Submit Wax Seal Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="group relative flex items-center justify-center p-0.5 rounded-full select-none"
                    >
                      {/* Wax Seal Design */}
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 rounded-full bg-samurai-red text-washi-light flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(141,28,29,0.5),inset_0_2px_4px_rgba(255,255,255,0.2)] relative cursor-pointer border-2 border-[#6d1314]"
                      >
                        <div className="absolute inset-1.5 rounded-full border border-dashed border-[#f5efe2]/30" />
                        
                        <span className="font-shippori text-sm font-bold tracking-widest leading-none mt-1 select-none">
                          送信
                        </span>
                        <span className="font-sans text-[7px] tracking-wider uppercase opacity-55 mt-1 select-none">
                          SEAL
                        </span>

                        <div className="absolute -bottom-1 -left-1 w-4 h-3 bg-samurai-red rounded-full blur-[1px]" />
                        <div className="absolute -top-1 -right-1 w-3 h-2 bg-samurai-red rounded-full blur-[1px]" />
                      </motion.div>
                    </button>
                  </div>

                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
