"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { ZenCalligraphy } from "./ZenCalligraphy";

interface AboutProps {
  audio: any;
}

export function About({ audio }: AboutProps) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.15 } // Trigger open when 15% is visible
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      // Unroll the scroll
      controls.start("open");
      if (!hasPlayedSound) {
        audio.playKoto(3); // play pleasant ambient koto string on unroll
        setHasPlayedSound(true);
      }
    } else {
      // Roll the scroll back closed when it exits viewport
      controls.start("closed");
      setHasPlayedSound(false); // Reset sound trigger for next unroll
    }
  }, [inView, controls, audio, hasPlayedSound]);

  return (
    <section id="about" className="py-24 px-8 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="mb-16 w-full text-center md:text-left border-b border-samurai-gold/20 pb-6">
          <span className="font-shippori text-xs md:text-sm tracking-widest text-samurai-gold uppercase block mb-2">// Scroll of Truth</span>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-widest text-washi-light">
            THE CREATIVE PHILOSOPHY
          </h2>
        </div>

        {/* Scroll Intersection Trigger Ref */}
        <div ref={ref} className="w-full relative flex justify-center py-8">
          
          {/* Scroll Assembly Wrapper */}
          <div className="relative w-full max-w-4xl min-h-[550px] md:min-h-[420px] flex items-center justify-center">
            
            {/* 1. Scroll Parchment Background Layer */}
            <motion.div
              variants={{
                closed: { scaleX: 0, opacity: 0 },
                open: { scaleX: 1, opacity: 1 }
              }}
              initial="closed"
              animate={controls}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              style={{ originX: 0.5 }} // scale out from center
              className="parchment-bg w-[94%] h-full absolute inset-y-0 rounded-sm p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start select-text"
            >
              {/* Traditional Red Ink Stamp watermarked */}
              <div className="absolute right-12 top-12 opacity-[0.04] font-shippori text-9xl pointer-events-none select-none text-samurai-red rotate-12">
                道
              </div>

              {/* Left Column: Philosophical Pillars */}
              <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cedar-brown/25 pb-6 md:pb-0 md:pr-8 flex flex-col justify-between h-full space-y-6">
                <div>
                  <h3 className="font-cinzel text-lg md:text-xl font-bold tracking-widest text-cedar-brown uppercase mb-2">
                    THREE PILLARS
                  </h3>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-samurai-red font-bold">
                    - The Code of Craft -
                  </p>
                </div>

                <div className="space-y-4 font-shippori text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-samurai-red text-washi-light font-bold text-xs select-none shadow">守</span>
                    <div className="flex flex-col">
                      <strong className="text-cedar-brown tracking-wider">DISCIPLINE (Shu)</strong>
                      <span className="text-[10px] text-cedar-brown/65">Mastering fundamental mechanics.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-samurai-red text-washi-light font-bold text-xs select-none shadow">破</span>
                    <div className="flex flex-col">
                      <strong className="text-cedar-brown tracking-wider">INNOVATION (Ha)</strong>
                      <span className="text-[10px] text-cedar-brown/65">Breaking patterns to advance.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-samurai-red text-washi-light font-bold text-xs select-none shadow">離</span>
                    <div className="flex flex-col">
                      <strong className="text-cedar-brown tracking-wider">MASTERY (Ri)</strong>
                      <span className="text-[10px] text-cedar-brown/65">Becoming one with the canvas.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bio Narrative */}
              <div className="w-full md:w-2/3 md:pl-4 space-y-4 font-serif text-sm md:text-base leading-relaxed text-[#3d2619] font-light">
                <p>
                  As an engineer, I view code not merely as static instructions for a compiler, but as a digital blade—honed through rigorous training, testing, and meticulous attention to detail.
                </p>
                <p>
                  My journey began by exploring the intersection of algorithmic computation and visual design. Over the years, I have applied this focus to build complex multi-agent architectures, low-latency WebGL graphics pipelines, and interactive gaming systems.
                </p>
                <p>
                  I believe that true craftsmanship is timeless. Whether designing a neural network weights optimization loop or composing a cinematic shaders scene, the objective remains constant: to construct experiences that represent discipline, functionality, and artistic intent.
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <div className="h-[1px] bg-cedar-brown/20 flex-grow" />
                  <span className="font-shippori text-xs tracking-widest text-samurai-red font-bold uppercase rotate-[-2deg]">
                    - The Wandering Coder -
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 2. Left Wooden Roller Rod */}
            <motion.div
              variants={{
                closed: { left: "50%" },
                open: { left: "3%" }
              }}
              initial="closed"
              animate={controls}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              className="absolute w-8 h-[94%] bg-[#22130b] rounded-sm border-r-2 border-samurai-gold/50 flex flex-col justify-between py-4 items-center shadow-[10px_0_15px_rgba(0,0,0,0.6)] z-20 pointer-events-none transform -translate-x-1/2"
            >
              {/* Roller End Caps */}
              <div className="w-10 h-3 bg-[#bfa15f] border border-[#d4af37] rounded-sm absolute -top-1" />
              <div className="h-6 w-1 bg-[#bfa15f]/40 rounded-full" />
              <div className="font-shippori text-[10px] text-samurai-gold opacity-45 font-bold uppercase select-none rotate-180 writing-mode-vertical">
                巻
              </div>
              <div className="h-6 w-1 bg-[#bfa15f]/40 rounded-full" />
              <div className="w-10 h-3 bg-[#bfa15f] border border-[#d4af37] rounded-sm absolute -bottom-1" />
            </motion.div>

            {/* 3. Right Wooden Roller Rod */}
            <motion.div
              variants={{
                closed: { left: "50%" },
                open: { left: "97%" }
              }}
              initial="closed"
              animate={controls}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              className="absolute w-8 h-[94%] bg-[#22130b] rounded-sm border-l-2 border-samurai-gold/50 flex flex-col justify-between py-4 items-center shadow-[-10px_0_15px_rgba(0,0,0,0.6)] z-20 pointer-events-none transform -translate-x-1/2"
            >
              {/* Roller End Caps */}
              <div className="w-10 h-3 bg-[#bfa15f] border border-[#d4af37] rounded-sm absolute -top-1" />
              <div className="h-6 w-1 bg-[#bfa15f]/40 rounded-full" />
              <div className="font-shippori text-[10px] text-samurai-gold opacity-45 font-bold uppercase select-none writing-mode-vertical">
                軸
              </div>
              <div className="h-6 w-1 bg-[#bfa15f]/40 rounded-full" />
              <div className="w-10 h-3 bg-[#bfa15f] border border-[#d4af37] rounded-sm absolute -bottom-1" />
            </motion.div>

          </div>
        </div>

        {/* Interactive Zen Calligraphy board */}
        <ZenCalligraphy audio={audio} />
      </div>
    </section>
  );
}
