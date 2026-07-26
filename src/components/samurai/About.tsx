"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { motion, useAnimation } from "framer-motion";
import { ZenCalligraphy } from "./ZenCalligraphy";

interface AboutProps {
  audio: any;
}

export const About = memo(function About({ audio }: AboutProps) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("open");
      if (!hasPlayedSound) {
        audio?.playKoto?.(3);
        setHasPlayedSound(true);
      }
    } else {
      controls.start("closed");
    }
  }, [inView, controls, hasPlayedSound, audio]);

  const scrollVariants = {
    closed: { scaleY: 0.05, opacity: 0.8 },
    open: { scaleY: 1, opacity: 1, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section id="about" className="py-20 md:py-24 px-6 sm:px-12 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div>
            <span className="font-shippori text-xs text-samurai-gold tracking-widest uppercase block mb-1">
              哲学 // Philosophy & Ethos
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-washi-light tracking-wider">
              THE UNYIELDING MIND.
            </h2>
          </div>
          <p className="font-sans text-xs sm:text-sm text-washi-light/60 max-w-sm tracking-wide font-light">
            In samurai bushido, perfection is not a destination but a continuous daily refinement of mind and blade.
          </p>
        </div>

        <div ref={ref} className="relative w-full flex justify-center py-6">
          <div className="relative w-full max-w-4xl">
            {/* Top Wooden Rod of Makimono Scroll */}
            <div className="w-full h-7 bg-wood-plaque-bg rounded-t-md border-b-2 border-samurai-gold shadow-lg flex items-center justify-between px-6 z-20 relative">
              <div className="w-4 h-4 rounded-full border border-samurai-gold bg-samurai-gold/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-samurai-gold" />
              </div>
              <span className="font-shippori text-xs tracking-widest text-samurai-gold uppercase font-bold">
                巻物 // SCROLL OF PHILOSOPHY
              </span>
              <div className="w-4 h-4 rounded-full border border-samurai-gold bg-samurai-gold/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-samurai-gold" />
              </div>
            </div>

            {/* Unrolling Scroll Parchment Body */}
            <motion.div
              variants={scrollVariants}
              initial="closed"
              animate={controls}
              style={{ originY: 0 }}
              className="w-full parchment-bg p-6 sm:p-10 md:p-14 shadow-2xl relative z-10 origin-top overflow-hidden border-x border-cedar-brown/30"
            >
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-12">
                
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cedar-brown/25 pb-6 md:pb-0 md:pr-8 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <span className="font-shippori text-4xl text-[#8d1c1d] block mb-2 font-bold">
                      極致
                    </span>
                    <h3 className="font-cinzel text-xl font-bold tracking-wider text-[#2c1a11]">
                      PRACTICE OF CRAFT
                    </h3>
                  </div>

                  <div className="space-y-4 font-shippori text-sm">
                    <div className="border-l-2 border-[#8d1c1d] pl-3 py-1">
                      <span className="font-bold text-[#8d1c1d] block text-xs tracking-widest uppercase">
                        I. PRECISION
                      </span>
                      <p className="text-[#3d2619] text-xs font-serif leading-relaxed mt-1">
                        Every pixel, shader loop, and data structure must serve a clear purpose with zero waste.
                      </p>
                    </div>

                    <div className="border-l-2 border-[#8d1c1d] pl-3 py-1">
                      <span className="font-bold text-[#8d1c1d] block text-xs tracking-widest uppercase">
                        II. MASTERY
                      </span>
                      <p className="text-[#3d2619] text-xs font-serif leading-relaxed mt-1">
                        Embracing lifelong learning across artificial intelligence, graphics pipelines, and game engines.
                      </p>
                    </div>

                    <div className="border-l-2 border-[#8d1c1d] pl-3 py-1">
                      <span className="font-bold text-[#8d1c1d] block text-xs tracking-widest uppercase">
                        III. ENDURANCE
                      </span>
                      <p className="text-[#3d2619] text-xs font-serif leading-relaxed mt-1">
                        Designing reliable architectures built to withstand heavy traffic and scale seamlessly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/3 md:pl-4 space-y-4 font-serif text-sm md:text-base leading-relaxed text-[#3d2619] font-light">
                  <p className="first-letter:text-4xl first-letter:font-shippori first-letter:text-[#8d1c1d] first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                    My engineering journey is driven by a deep reverence for craftsmanship. Just as a blacksmith folds Tamahagane steel thousands of times to purge impurities and forge an indestructible blade, I iterate on code until logic flows effortlessly and performance is immaculate.
                  </p>

                  <p>
                    Whether engineering multi-agent artificial intelligence models, authoring real-time WebGL shaders, or constructing high-throughput backend services, I approach every project with clarity, focus, and strict attention to detail.
                  </p>

                  <div className="pt-6 border-t border-cedar-brown/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-cinzel text-xs font-bold text-[#2c1a11] tracking-widest">
                        SAMURAI ENGINEER
                      </span>
                      <span className="font-sans text-[10px] text-[#3d2619]/60 tracking-wider">
                        AI & GRAPHICS TECHNOLOGIST
                      </span>
                    </div>

                    <div className="font-shippori text-xl text-[#8d1c1d] font-bold tracking-widest">
                      武士道精神
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom Wooden Rod of Makimono Scroll */}
            <div className="w-full h-7 bg-wood-plaque-bg rounded-b-md border-t-2 border-samurai-gold shadow-xl flex items-center justify-between px-6 z-20 relative">
              <div className="w-2.5 h-2.5 rounded-full bg-samurai-gold/60" />
              <span className="font-shippori text-[10px] tracking-widest text-samurai-gold/60 uppercase">
                誠心誠意 // DEDICATION & HONOUR
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-samurai-gold/60" />
            </div>
          </div>
        </div>

        {/* Interactive Zen Calligraphy Canvas Sub-component */}
        <ZenCalligraphy audio={audio} />

      </div>
    </section>
  );
});
