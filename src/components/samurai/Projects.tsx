"use client";

import React, { useState, useEffect, memo } from "react";
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

export const Projects = memo(function Projects({ audio }: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
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
    <section id="projects" className="py-20 md:py-24 px-6 sm:px-12 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative">
      <div className="absolute right-6 top-12 hidden lg:flex flex-col space-y-4 opacity-15 select-none font-shippori text-sm tracking-widest text-samurai-gold">
        <span>工</span>
        <span>芸</span>
        <span>の</span>
        <span>道</span>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div>
            <span className="font-shippori text-xs text-samurai-gold tracking-widest uppercase block mb-1">
              作品 // Selected Catalog
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-washi-light tracking-wider">
              MASTERY IN CODE.
            </h2>
          </div>
          <p className="font-sans text-xs sm:text-sm text-washi-light/60 max-w-sm tracking-wide font-light">
            A curated index of engineered intelligent systems, real-time graphics, and interactive experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {projectsList.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: project.id * 0.15 }}
              onClick={() => {
                audio?.playWoodStrike?.();
                setSelectedProject(project);
              }}
              onMouseEnter={() => audio?.playWoodStrike?.()}
              className="group relative bg-[#181716] border border-sumi-gray hover:border-samurai-gold/50 rounded-lg p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 hover:-translate-y-1.5 shadow-lg hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-shippori text-3xl text-samurai-gold/40 group-hover:text-samurai-gold transition-colors duration-300">
                    {project.kanji}
                  </span>
                  <span className="font-sans text-[10px] tracking-widest text-samurai-gold uppercase px-2.5 py-1 rounded bg-samurai-gold/10 border border-samurai-gold/20">
                    {project.category}
                  </span>
                </div>

                <h3 className="font-cinzel text-xl font-bold tracking-wider text-washi-light group-hover:text-samurai-gold transition-colors duration-300 mb-3">
                  {project.title}
                </h3>

                <p className="font-sans text-xs text-washi-light/70 leading-relaxed font-light mb-6 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tech.map((t, i) => (
                    <span key={i} className="text-[9px] font-mono text-washi-light/50 bg-sumi-black/60 px-2 py-0.5 rounded border border-sumi-gray">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-sumi-gray/60">
                  <span className="font-sans text-[10px] tracking-wider text-washi-light/40 uppercase">
                    {project.role}
                  </span>
                  <span className="font-cinzel text-xs text-samurai-gold group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1 font-bold">
                    Inspect ➔
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-sumi-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 select-none overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#161514] border border-samurai-gold/40 rounded-lg p-6 sm:p-10 text-washi-light shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full border border-washi-light/10 text-washi-light/60 hover:text-samurai-gold hover:border-samurai-gold transition-colors focus-visible:ring-2 focus-visible:ring-samurai-gold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="font-shippori text-4xl text-samurai-gold">
                  {selectedProject.kanji}
                </span>
                <div>
                  <span className="font-sans text-[10px] tracking-widest text-samurai-gold uppercase block">
                    {selectedProject.category}
                  </span>
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wider text-washi-light">
                    {selectedProject.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-6 my-6 text-sm text-washi-light/80 leading-relaxed font-sans font-light">
                <p>{selectedProject.longDescription}</p>

                {selectedProject.id === 2 && (
                  <div className="my-6">
                    <DeflectionGame audio={audio} />
                  </div>
                )}

                <div>
                  <h4 className="font-cinzel text-xs font-bold tracking-widest text-samurai-gold uppercase mb-2">
                    Engineered Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map((t, i) => (
                      <span key={i} className="text-xs font-mono text-samurai-gold bg-samurai-gold/10 px-3 py-1 rounded border border-samurai-gold/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-sumi-gray">
                <span className="font-sans text-xs tracking-wider text-washi-light/50 uppercase">
                  Role: {selectedProject.role}
                </span>
                <div className="flex items-center gap-3">
                  {selectedProject.links.github && (
                    <a
                      href={selectedProject.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs tracking-widest uppercase border border-washi-light/20 text-washi-light hover:border-samurai-gold hover:text-samurai-gold transition-colors rounded min-h-[44px] flex items-center gap-2"
                    >
                      GitHub <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});
