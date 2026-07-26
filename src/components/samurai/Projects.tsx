"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { DeflectionGame } from "./DeflectionGame";

interface Project {
  id: number;
  title: string;
  kanji: string;
  category: string;
  description: string;
  longDescription: string;
  tech: string[];
  role: string;
  links: {
    github?: string;
    demo?: string;
  };
}

interface ProjectsProps {
  audio: any;
}

export function Projects({ audio }: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  React.useEffect(() => {
    const lenis = (window as any).lenisInstance;
    if (selectedProject) {
      if (lenis) lenis.stop();
      document.body.style.overflow = "hidden";
    } else {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    }
    return () => {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const projectsList: Project[] = [
    {
      id: 1,
      title: "PROJECT SHINOBI",
      kanji: "機",
      category: "AI Agent & Systems",
      description: "An autonomous, multi-agent reinforcement learning system designed for stealthy pathfinding and threat evasion in complex grid environments.",
      longDescription: "Project Shinobi is a state-of-the-art multi-agent framework built to test adversarial decision-making models. Agents coordinate using a custom decentralized architecture, utilizing neural network weights that prioritize path efficiency and threat mitigation. Features full analytics streaming and customizable testing arenas.",
      tech: ["Python", "TensorFlow", "React", "WebSocket", "FastAPI"],
      role: "Lead AI Engineer",
      links: {
        github: "https://github.com",
        demo: "https://example.com"
      }
    },
    {
      id: 2,
      title: "SEKIRO'S SHADOW",
      kanji: "遊",
      category: "WebGL Game Development",
      description: "A fast-paced, high-performance 3D sword-fighting combat simulator running entirely in the browser with realistic physics and deflect mechanics.",
      longDescription: "A browser-based technical tribute to action-adventure deflection combat. Built using Three.js and custom shaders, the system simulates precise collision detection and deflect frame windows (120ms) at 60 FPS. Features procedural posture meters, particle deflection sparks, and ragdoll death dynamics.",
      tech: ["WebGL", "Three.js", "TypeScript", "GSAP", "Howler.js"],
      role: "Solo Game Developer",
      links: {
        github: "https://github.com",
        demo: "https://example.com"
      }
    },
    {
      id: 3,
      title: "SUMI-E CANVAS",
      kanji: "画",
      category: "Creative Technology",
      description: "A procedural digital canvas that simulates authentic traditional Japanese calligraphy ink bleeds, paper absorption, and brush bristle dynamics.",
      longDescription: "Sumi-e Canvas is an interactive drawing application that uses custom fluid simulation algorithms on a HTML5 2D Canvas. It calculates ink dispersion rates based on mouse drag speeds, brush angles, and virtual paper fiber densities, creating authentic calligraphic strokes and bleed edges.",
      tech: ["JavaScript", "HTML5 Canvas", "Math.js", "Tailwind CSS"],
      role: "Creative Technologist",
      links: {
        github: "https://github.com",
        demo: "https://example.com"
      }
    }
  ];

  return (
    <section id="projects" className="py-24 px-8 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative">
      {/* Decorative vertical texts */}
      <div className="absolute right-6 top-12 hidden lg:flex flex-col space-y-4 opacity-15 select-none font-shippori text-sm tracking-widest text-samurai-gold">
        <span>工</span>
        <span>芸</span>
        <span>の</span>
        <span>道</span>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-samurai-gold/20 pb-6">
          <div>
            <span className="font-shippori text-xs md:text-sm tracking-widest text-samurai-gold uppercase block mb-2">// Scroll of Accomplishments</span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-widest text-washi-light">
              SELECTED WORKS
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-sans text-xs md:text-sm text-washi-light/60 tracking-wider font-light max-w-xs md:text-right">
            Handcrafted creations forged through discipline and engineering principles.
          </p>
        </div>

        {/* Grid Layout of Wooden Plaques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projectsList.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              onClick={() => {
                audio.playSwordSlice();
                setSelectedProject(project);
              }}
              onMouseEnter={() => audio.playWoodStrike()}
              className="wood-plaque-bg group relative p-8 flex flex-col justify-between h-96 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            >
              {/* Gold corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-samurai-gold/40 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-samurai-gold/40 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-samurai-gold/40 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-samurai-gold/40 pointer-events-none" />

              {/* Decorative hanging tassel outline on top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 flex justify-center opacity-60">
                <svg viewBox="0 0 20 10" className="w-full h-full text-samurai-gold" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 10 Q10 0 18 10" />
                </svg>
              </div>

              {/* Plaque Content */}
              <div>
                {/* Plaque Header: Parchment Tag */}
                <div className="bg-washi-parchment text-sumi-black px-3 py-1.5 font-shippori font-bold tracking-widest text-xs md:text-sm text-center shadow-md rotate-[-1.5deg] border border-samurai-gold/30 uppercase inline-block mb-6">
                  {project.category}
                </div>

                {/* Title */}
                <h3 className="font-cinzel text-xl md:text-2xl font-bold tracking-widest text-washi-light group-hover:text-samurai-gold transition-colors duration-300">
                  {project.title}
                </h3>

                {/* Subtitle description */}
                <p className="mt-4 font-sans text-xs md:text-sm text-washi-light/75 leading-relaxed font-light line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Plaque Footer: Kanji stamp and Action indicator */}
              <div className="flex items-end justify-between border-t border-washi-light/10 pt-4 mt-6">
                {/* Kanji Hanko Stamp (Red ink circle seal) */}
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full border border-samurai-red/60 text-samurai-red font-shippori text-lg font-bold select-none rotate-[6deg] bg-samurai-red/5">
                  <span className="relative z-10">{project.kanji}</span>
                  {/* ink blob/imperfections overlay */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-samurai-red/30 opacity-70 scale-95" />
                </div>

                {/* Interactive ink underline read more */}
                <span className="font-shippori text-[10px] tracking-widest uppercase text-samurai-gold/80 group-hover:text-samurai-gold-bright transition-colors duration-300 ink-underline pb-0.5">
                  Unroll Details →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hanging Scroll Detail Modal (Kakemono) */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sumi-black/90 backdrop-blur-md">
            
            {/* Modal Closer Background */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => {
                audio.playKoto(1);
                setSelectedProject(null);
              }}
            />

            {/* Hanging Scroll container */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ originY: 0 }} // unrolls down
              className="relative w-full max-w-2xl bg-[#f5efe0] text-[#2c1a11] shadow-[0_25px_50px_rgba(0,0,0,0.8)] border-x-[12px] border-cedar-brown rounded-sm overflow-hidden z-10 font-sans"
            >
              {/* Paper Texture Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-image" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.08' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

              {/* Top Wood Roller rod */}
              <div className="h-4 bg-[#1e120c] border-b-2 border-samurai-gold/50 flex justify-between px-2 items-center text-[8px] text-samurai-gold/50 tracking-wider">
                <span>巻</span>
                <span>KAKEMONO SCROLL</span>
                <span>軸</span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  audio.playKoto(1);
                  setSelectedProject(null);
                }}
                onMouseEnter={() => audio.playWoodStrike()}
                className="absolute top-6 right-6 p-2 rounded-full border border-[#2c1a11]/20 hover:bg-[#2c1a11]/10 text-[#2c1a11] transition-colors z-20"
              >
                <X size={16} />
              </button>

              {/* Scroll Content Area */}
              <div className="p-8 md:p-12 overflow-y-auto max-h-[75vh] select-text" data-lenis-prevent>
                
                {/* Kanji watermarked in background */}
                <div className="absolute right-8 bottom-8 opacity-[0.04] font-shippori text-9xl pointer-events-none select-none text-samurai-red">
                  {selectedProject.kanji}
                </div>

                {/* Category Header */}
                <span className="font-shippori text-xs font-semibold tracking-widest text-samurai-red uppercase block mb-2 border-b border-samurai-red/20 pb-1 w-fit">
                  {selectedProject.category}
                </span>

                {/* Title */}
                <h3 className="font-cinzel text-2xl md:text-4xl font-extrabold tracking-widest text-[#1e120c]">
                  {selectedProject.title}
                </h3>
                
                <span className="font-shippori text-[10px] tracking-wider text-samurai-gold font-bold uppercase mt-1 block">
                  Role: {selectedProject.role}
                </span>

                {/* Narrative */}
                <p className="mt-6 text-sm md:text-base leading-relaxed font-serif font-light text-[#3d2619]">
                  {selectedProject.longDescription}
                </p>

                {/* Tech Stack items */}
                <div className="mt-8">
                  <h4 className="font-shippori text-xs font-bold tracking-widest text-[#1e120c] uppercase mb-3">
                    // Tech Arsenal
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map((t, i) => (
                      <span
                        key={i}
                        className="bg-[#e8dec9] border border-[#2c1a11]/25 px-2.5 py-1 text-xs font-medium tracking-wide text-[#2c1a11] rounded-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="mt-8 pt-6 border-t border-[#2c1a11]/15 flex flex-wrap gap-4">
                  {selectedProject.links.github && (
                    <a
                      href={selectedProject.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => audio.playWoodStrike()}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#1e120c] hover:text-samurai-red transition-colors duration-300"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" stroke="currentColor" />
                        <path d="M9 18c-4.51 2-5-2-7-2" stroke="currentColor" />
                      </svg>
                      View Codebase
                    </a>
                  )}
                  {selectedProject.links.demo && (
                    <a
                      href={selectedProject.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => audio.playWoodStrike()}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#1e120c] hover:text-samurai-red transition-colors duration-300"
                    >
                      <ExternalLink size={14} />
                      Live Demonstration
                    </a>
                  )}
                </div>

                {/* Playable Sekiro Deflection Mini-Game Widget */}
                {selectedProject.id === 2 && (
                  <DeflectionGame audio={audio} />
                )}
              </div>

              {/* Bottom Wood Roller rod */}
              <div className="h-6 bg-[#1e120c] border-t border-samurai-gold/30 flex justify-center items-center">
                <div className="w-1/3 h-1 bg-[#bfa15f]/25 rounded-full" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
