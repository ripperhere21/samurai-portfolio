"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { CustomCursor } from "../components/samurai/CustomCursor";
import { CinematicHero } from "../components/samurai/CinematicHero";
import { Projects } from "../components/samurai/Projects";
import { Skills } from "../components/samurai/Skills";
import { About } from "../components/samurai/About";
import { Contact } from "../components/samurai/Contact";
import { useSamuraiAudio } from "../hooks/useSamuraiAudio";
import { useAudio } from "../hooks/useAudio"; // Space Theme Audio
import { useTheme } from "../context/ThemeContext"; // Dual theme context
import { SpaceCanvas } from "../components/space/SpaceCanvas";
import { HolographicHUD } from "../components/ui/HolographicHUD";
import { SectorTerminal } from "../components/ui/SectorTerminal";
import { AICoreTerminal } from "../components/ui/AICoreTerminal";
import { RetroGame } from "../components/ui/RetroGame";
import { Volume2, VolumeX, Menu, X } from "lucide-react";
import { AudioVisualizerHUD } from "../components/samurai/AudioVisualizerHUD";
import { GlobalParticles } from "../components/samurai/GlobalParticles";
import { KatanaScrollbar } from "../components/samurai/KatanaScrollbar";

export default function Home() {
  const { theme, setTheme, activeSector, setActiveSector } = useTheme();
  
  const audio = useSamuraiAudio();
  const spaceAudio = useAudio();
  
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [warpActive, setWarpActive] = useState(false);
  const [collectedStars, setCollectedStars] = useState<number[]>([]);

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

    // If initial theme is space, make sure Lenis starts paused
    if (theme === "space") {
      lenis.stop();
      document.body.style.overflow = "hidden";
    }

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

  // Dimensions Shift Gate Switch handler
  const handleThemeShift = () => {
    setIsTransitioning(true);
    
    if (theme === "samurai") {
      const currentMuted = audio.isMuted;
      audio.playSwordSlice();
      setTimeout(() => {
        setTheme("space");
        // Sync mute states
        if (!currentMuted) {
          spaceAudio.initAudio();
          if (spaceAudio.isMuted) spaceAudio.toggleMute();
        } else {
          if (!spaceAudio.isMuted) spaceAudio.toggleMute();
        }
        if (!audio.isMuted) audio.toggleMute();
      }, 600);
    } else {
      const currentMuted = spaceAudio.isMuted;
      spaceAudio.playClick(1200, "sine", 0.2);
      setTimeout(() => {
        setTheme("samurai");
        // Sync mute states
        if (!currentMuted) {
          audio.initAudio();
          if (audio.isMuted) audio.toggleMute();
        } else {
          if (!audio.isMuted) audio.toggleMute();
        }
        if (!spaceAudio.isMuted) spaceAudio.toggleMute();
      }, 600);
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  };

  const handleCollectStar = (idx: number) => {
    if (!collectedStars.includes(idx)) {
      setCollectedStars((prev) => [...prev, idx]);
      spaceAudio.playClick(1500, "sine", 0.3);
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

      {/* Cinematic Dimension Shift Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-sumi-black text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-16 h-16 rounded-full border-t-2 border-r-2 border-samurai-gold"
            />
            <span className="mt-6 font-cinzel text-xs tracking-widest text-washi-parchment animate-pulse uppercase">
              {theme === "samurai" ? "WARPING TO SPACE SECTOR..." : "DESCENDING TO EARTH..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Traditional Samurai Mode Layout */}
      {theme === "samurai" && (
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
      )}

      {/* 2. Cyber-Space Mode Layout */}
      {theme === "space" && (
        <div className="fixed inset-0 w-full h-full bg-black overflow-hidden font-share text-cyan-glow z-0">
          
          {/* Space canvas (Three.js/R3F) */}
          <SpaceCanvas
            activeSector={activeSector}
            warpActive={warpActive}
            onNodeSelect={(node) => {
              spaceAudio.playClick(900, "sine", 0.05);
              setActiveSector("skills");
            }}
            onProjectSelect={(proj) => {
              spaceAudio.playClick(900, "sine", 0.05);
              setActiveSector("projects");
            }}
            onLaunchGame={() => {
              spaceAudio.playClick(1000, "sine", 0.08);
              setActiveSector("games");
            }}
            onSectorSelect={(sec) => {
              spaceAudio.playClick(900, "sine", 0.05);
              setActiveSector(sec);
            }}
          />

          {/* Holographic HUD console */}
          <HolographicHUD
            activeSector={activeSector}
            onSelectSector={(sec) => {
              spaceAudio.playClick(800, "sine", 0.05);
              setActiveSector(sec);
            }}
            audioMuted={spaceAudio.isMuted}
            onToggleMute={spaceAudio.toggleMute}
            playClick={spaceAudio.playClick}
            achievements={collectedStars}
            systemWarning={warpActive ? "WARP JUMP" : null}
            triggerEvent={(event) => {
              if (event === "warp") {
                spaceAudio.playWarpSound();
                setWarpActive(true);
                setTimeout(() => setWarpActive(false), 2000);
              }
            }}
          />

          {/* Return Shift Portal Toggle */}
          <div className="absolute top-[85px] left-6 pointer-events-auto z-50">
            <button
              onClick={handleThemeShift}
              onMouseEnter={() => spaceAudio.playClick(1000, "sine", 0.03)}
              className="glass-panel px-3 py-1.5 text-xs font-bold tracking-widest text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:text-white transition-all cursor-pointer border border-[#00e5ff]/30 rounded-sm font-share"
            >
              [ WARP TO EARTH // 侍 ]
            </button>
          </div>

          {/* Floating Panels: SectorTerminal Wrapper content */}
          {activeSector === "about" && (
            <SectorTerminal
              isOpen={true}
              title="MEMORIUM MODULE"
              subtitle="PILOT INTEL LOGS"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="cyan"
              hasStarIndex={0}
              collectedStars={collectedStars}
              onCollectStar={handleCollectStar}
            >
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2" data-lenis-prevent>
                <p className="font-semibold text-white">// BIO METRIC READOUT</p>
                <p>I am a creative software engineer and graphics researcher building state-of-the-art interactive environments.</p>
                <p>My discipline centers on WebGL, real-time shaders, and high-performance frontend interfaces that bridge calculations and visual artwork.</p>
                <p>In this digital ship, you can click on outer solar planets to view specific directory files.</p>
              </div>
            </SectorTerminal>
          )}

          {activeSector === "skills" && (
            <SectorTerminal
              isOpen={true}
              title="CONSTELLATION DIRECTORY"
              subtitle="COGNITIVE SKILLS MATRIX"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="cyan"
              hasStarIndex={1}
              collectedStars={collectedStars}
              onCollectStar={handleCollectStar}
            >
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2" data-lenis-prevent>
                <p className="font-semibold text-white">// ACTIVE SKILL ARSENAL</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-3 border-[#00e5ff]/10 rounded">
                    <span className="text-[#00e5ff] font-bold block mb-1">AI CORE</span>
                    <span className="text-xs text-zinc-400">Pytorch, Agent Orchestration, RL models</span>
                  </div>
                  <div className="glass-panel p-3 border-[#00e5ff]/10 rounded">
                    <span className="text-[#00e5ff] font-bold block mb-1">GRAPHICS</span>
                    <span className="text-xs text-zinc-400">WebGL 2.0, WebGPU, Rust Wasm, Three.js</span>
                  </div>
                  <div className="glass-panel p-3 border-[#00e5ff]/10 rounded">
                    <span className="text-[#00e5ff] font-bold block mb-1">ENGINEERING</span>
                    <span className="text-xs text-zinc-400">Node, TS, C++, Next.js, Docker</span>
                  </div>
                  <div className="glass-panel p-3 border-[#00e5ff]/10 rounded">
                    <span className="text-[#00e5ff] font-bold block mb-1">KINETIC ART</span>
                    <span className="text-xs text-zinc-400">Blender, Framer Motion, GSAP animations</span>
                  </div>
                </div>
              </div>
            </SectorTerminal>
          )}

          {activeSector === "projects" && (
            <SectorTerminal
              isOpen={true}
              title="SOLAR ARCHIVE"
              subtitle="COMPLETED PROJECT COMPILATIONS"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="gold"
              hasStarIndex={2}
              collectedStars={collectedStars}
              onCollectStar={handleCollectStar}
            >
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2" data-lenis-prevent>
                <p className="font-semibold text-[#ffd700]">// DIRECTORY ARCHIVES</p>
                <div className="space-y-3">
                  <div className="border-b border-zinc-800 pb-2">
                    <span className="text-white font-bold block">1. AETHER ENGINE</span>
                    <span className="text-xs text-zinc-400">WebGL & Rust WebAssembly GPU particle simulation.</span>
                  </div>
                  <div className="border-b border-zinc-800 pb-2">
                    <span className="text-white font-bold block">2. NEUROLINK RECON</span>
                    <span className="text-xs text-zinc-400">Real-time browser transformer model weight visualizer.</span>
                  </div>
                  <div className="pb-2">
                    <span className="text-white font-bold block">3. SHADOW DUEL</span>
                    <span className="text-xs text-zinc-400">2D side-scrolling samurai simulator running on local threads.</span>
                  </div>
                </div>
              </div>
            </SectorTerminal>
          )}

          {activeSector === "experience" && (
            <SectorTerminal
              isOpen={true}
              title="WORMHOLE FLIGHT LOGS"
              subtitle="CAREER TIMELINE INDEX"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="magenta"
              hasStarIndex={3}
              collectedStars={collectedStars}
              onCollectStar={handleCollectStar}
            >
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2" data-lenis-prevent>
                <p className="font-semibold text-[#ff007f]">// EXPERIENCE LOG</p>
                <div className="border-l-2 border-[#ff007f] pl-4 space-y-4">
                  <div>
                    <span className="text-white font-bold block">Lead Creative Engineer @ QuantumLabs</span>
                    <span className="text-xs text-[#ff007f]">2024 - Present</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">Graphics Engineer @ Singularity Games</span>
                    <span className="text-xs text-[#ff007f]">2022 - 2024</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">Software Architect @ Helix Systems</span>
                    <span className="text-xs text-[#ff007f]">2020 - 2022</span>
                  </div>
                </div>
              </div>
            </SectorTerminal>
          )}

          {activeSector === "aicore" && (
            <SectorTerminal
              isOpen={true}
              title="AEGIS MAIN SYSTEM"
              subtitle="AUTOMATED INFORMATION CHAT"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="cyan"
              hasStarIndex={4}
              collectedStars={collectedStars}
              onCollectStar={handleCollectStar}
            >
              <AICoreTerminal playClick={spaceAudio.playClick} />
            </SectorTerminal>
          )}

          {activeSector === "games" && (
            <SectorTerminal
              isOpen={true}
              title="ASTEROID DEEP"
              subtitle="STARFALL DEFENDER RADAR MINI-GAME"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="magenta"
            >
              <RetroGame
                playClick={spaceAudio.playClick}
                onUnlockStar={(idx) => handleCollectStar(idx)}
              />
            </SectorTerminal>
          )}

          {activeSector === "resume" && (
            <SectorTerminal
              isOpen={true}
              title="CRYSTAL DOCK"
              subtitle="RESUME DOCUMENT RETRIEVAL"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="gold"
            >
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2" data-lenis-prevent>
                <p className="font-semibold text-[#ffd700]">// ARCHIVE RETRIEVAL</p>
                <p>The pilot's complete documentation logs are compiled into a downloadable format.</p>
                <a
                  href="/resume.pdf"
                  download
                  onMouseEnter={() => spaceAudio.playClick(1000, "sine", 0.03)}
                  className="inline-block mt-2 px-4 py-2 border border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10 transition-colors uppercase text-xs font-bold font-share"
                >
                  Download Resume PDF
                </a>
              </div>
            </SectorTerminal>
          )}

          {activeSector === "contact" && (
            <SectorTerminal
              isOpen={true}
              title="COMM ARRAY"
              subtitle="TRANSMIT CONTACT SIGNAL"
              onClose={() => setActiveSector("bridge")}
              playClick={spaceAudio.playClick}
              themeColor="cyan"
            >
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[50vh] overflow-y-auto pr-2" data-lenis-prevent>
                <p className="font-semibold text-white">// COMM LINK TRANSMISSION</p>
                <p>To establish contact with the pilot, send a direct transmission via email to:</p>
                <p className="text-xl text-[#00e5ff] font-bold tracking-widest font-mono">
                  creator@starfall-terminal.io
                </p>
                <p className="text-xs text-zinc-500">
                  Or warp back to Earth to submit a sealed scroll via the calligraphy desk.
                </p>
              </div>
            </SectorTerminal>
          )}

        </div>
      )}

    </main>
  );
}
