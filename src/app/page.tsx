"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { CustomCursor } from "../components/samurai/CustomCursor";
import { CinematicHero } from "../components/samurai/CinematicHero";
import { Projects } from "../components/samurai/Projects";
import { Skills } from "../components/samurai/Skills";
import { About } from "../components/samurai/About";
import { Contact } from "../components/samurai/Contact";
import { useSamuraiAudio } from "../hooks/useSamuraiAudio";
import { Volume2, VolumeX, Menu, X } from "lucide-react";
import { AudioVisualizerHUD } from "../components/samurai/AudioVisualizerHUD";
import { GlobalParticles } from "../components/samurai/GlobalParticles";
import { KatanaScrollbar } from "../components/samurai/KatanaScrollbar";

export default function Home() {
  const audio = useSamuraiAudio();
  
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    (window as any).lenisInstance = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // End loading sequence after 2.2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Handle anchor navigation with Lenis
  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    const lenis = (window as any).lenisInstance;
    if (element && lenis) {
      lenis.scrollTo(element, { offset: 0, duration: 1.5 });
    } else if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen bg-sumi-black text-washi-light select-none overflow-x-hidden">
      
      {/* Dynamic Cursor */}
      <CustomCursor />

      {/* Cinematic Entrance Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-sumi-black"
          >
            <div className="relative w-40 h-40 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1], scale: [0.8, 1.05, 1] }}
                transition={{ duration: 1.8, times: [0, 0.4, 1] }}
                className="font-shippori text-6xl text-samurai-gold tracking-widest relative z-10"
              >
                道
              </motion.div>
              <svg className="absolute inset-0 w-full h-full text-samurai-red" viewBox="0 0 100 100">
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 260", rotate: -90 }}
                  animate={{ strokeDasharray: "250 260", rotate: 270 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  style={{ originX: "50px", originY: "50px" }}
                />
              </svg>
            </div>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 font-cinzel text-xs tracking-widest text-washi-parchment"
            >
              FORGING EXPERIENCES
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Traditional Samurai Mode Layout */}
      <div className="relative w-full min-h-screen">
        <KatanaScrollbar />
        <GlobalParticles />
        
        <header className="fixed top-0 left-0 w-full z-40 bg-sumi-black/80 backdrop-blur-md border-b border-sumi-gray py-4 px-8 md:px-20 lg:px-32 flex items-center justify-between">
          <div 
            onClick={() => handleScrollTo("hero")}
            onMouseEnter={() => audio.playWoodStrike()}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <svg className="w-8 h-8 text-samurai-red hover:text-samurai-gold transition-colors duration-300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="50" cy="50" r="40" />
              <path d="M30 50 L70 50 M50 30 L50 70" />
              <circle cx="50" cy="50" r="16" />
            </svg>
            <span className="font-cinzel text-xs font-bold tracking-widest text-washi-light hover:text-samurai-gold transition-colors duration-300">
              SAMURAI // CODER
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-widest uppercase">
            <button
              onClick={() => handleScrollTo("projects")}
              onMouseEnter={() => audio.playWoodStrike()}
              className="hover:text-samurai-gold transition-colors duration-300 ink-underline pb-0.5"
            >
              Selected Works
            </button>
            <button
              onClick={() => handleScrollTo("skills")}
              onMouseEnter={() => audio.playWoodStrike()}
              className="hover:text-samurai-gold transition-colors duration-300 ink-underline pb-0.5"
            >
              Mastery
            </button>
            <button
              onClick={() => handleScrollTo("about")}
              onMouseEnter={() => audio.playWoodStrike()}
              className="hover:text-samurai-gold transition-colors duration-300 ink-underline pb-0.5"
            >
              Philosophy
            </button>
            <button
              onClick={() => handleScrollTo("contact")}
              onMouseEnter={() => audio.playWoodStrike()}
              className="hover:text-samurai-gold transition-colors duration-300 ink-underline pb-0.5"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-washi-light/10 bg-sumi-black/40">
              <AudioVisualizerHUD getAnalyser={audio.getAnalyser} isMuted={audio.isMuted} />
              <button
                onClick={() => audio.toggleMute()}
                onMouseEnter={() => audio.playWoodStrike()}
                className={`p-1 rounded-full transition-all duration-300 ${
                  audio.isMuted 
                    ? "text-washi-light/40 hover:text-washi-light" 
                    : "text-samurai-gold hover:text-samurai-gold-bright"
                }`}
                title={audio.isMuted ? "Unmute Wind & Sounds" : "Mute Sound"}
              >
                {audio.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>

            <button
              onClick={() => {
                audio.playWoodStrike();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 md:hidden text-washi-light hover:text-samurai-gold transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-[65px] bg-sumi-black/95 backdrop-blur-lg border-b border-sumi-gray p-6 flex flex-col space-y-4 z-30 select-none text-center font-cinzel tracking-widest text-sm"
            >
              <button
                onClick={() => handleScrollTo("projects")}
                onMouseEnter={() => audio.playWoodStrike()}
                className="py-2 text-washi-light hover:text-samurai-gold transition-colors"
              >
                Selected Works
              </button>
              <button
                onClick={() => handleScrollTo("skills")}
                onMouseEnter={() => audio.playWoodStrike()}
                className="py-2 text-washi-light hover:text-samurai-gold transition-colors"
              >
                Mastery
              </button>
              <button
                onClick={() => handleScrollTo("about")}
                onMouseEnter={() => audio.playWoodStrike()}
                className="py-2 text-washi-light hover:text-samurai-gold transition-colors"
              >
                Philosophy
              </button>
              <button
                onClick={() => handleScrollTo("contact")}
                onMouseEnter={() => audio.playWoodStrike()}
                className="py-2 text-washi-light hover:text-samurai-gold transition-colors"
              >
                Contact
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="hero">
          <CinematicHero 
            onScrollToProjects={() => handleScrollTo("projects")}
            onScrollToContact={() => handleScrollTo("contact")}
            audio={audio}
          />
        </div>

        <Projects audio={audio} />
        <Skills audio={audio} />
        <About audio={audio} />
        <Contact audio={audio} />

        <footer className="py-12 px-8 md:px-20 lg:px-32 bg-[#0a0a09] border-t border-sumi-gray select-none">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <svg className="w-10 h-8 text-samurai-red opacity-40" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M10 20 Q50 15 90 20 M15 32 L85 32 M35 32 L35 75 M65 32 L65 75" />
              </svg>
              <span className="font-shippori text-[10px] tracking-widest text-samurai-gold opacity-50 uppercase">
                工芸 // 武士道
              </span>
            </div>
            <p className="font-sans text-[11px] text-washi-light/35 tracking-widest text-center md:text-right">
              © {new Date().getFullYear()} THE WAY OF CRAFT. ALL RIGHTS RESERVED. FORGED WITH HONOUR.
            </p>
          </div>
        </footer>
      </div>

    </main>
  );
}
