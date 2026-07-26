"use client";

import React, { useState, memo } from "react";
import { motion } from "framer-motion";

interface SkillCategory {
  id: number;
  title: string;
  jpTitle: string;
  description: string;
  skills: string[];
  crestSvg: (isActive: boolean) => React.ReactNode;
}

interface SkillsProps {
  audio: any;
}

const pathVariants = {
  inactive: { pathLength: 0.35, opacity: 0.4 },
  active: { pathLength: 1, opacity: 1, transition: { duration: 1.0, ease: "easeInOut" as const } }
} as const;

export const Skills = memo(function Skills({ audio }: SkillsProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const categories: SkillCategory[] = [
    {
      id: 1,
      title: "AI & NEURAL ARCHITECTURE",
      jpTitle: "人工知能",
      description: "Designing neural weights and autonomous decision-making agents capable of learning and adapting to dynamic parameters.",
      skills: ["Deep Learning", "Reinforcement Learning", "NLP / LLMs", "Multi-Agent Systems", "PyTorch / TensorFlow"],
      crestSvg: (isActive) => (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="50" r="42" strokeDasharray="1 3" />
          <motion.circle cx="50" cy="50" r="38" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.path d="M50 12 C 30 20, 20 40, 20 50 C 20 60, 30 80, 50 88 C 70 80, 80 60, 80 50 C 80 40, 70 20, 50 12 Z" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
        </svg>
      )
    },
    {
      id: 2,
      title: "WEBGL & GRAPHICS SHADERS",
      jpTitle: "視覚技術",
      description: "Mastering real-time browser graphics pipelines, GPU particle calculations, and interactive 3D WebGL environments.",
      skills: ["Three.js / WebGL", "WebGPU", "Custom GLSL Shaders", "GSAP ScrollTrigger", "Physics Engines (Rapier)"],
      crestSvg: (isActive) => (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" strokeDasharray="2 2" />
          <motion.polygon points="50,18 82,34 82,66 50,82 18,66 18,34" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.circle cx="50" cy="50" r="14" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
        </svg>
      )
    },
    {
      id: 3,
      title: "SYSTEMS & BACKEND ARCHITECTURE",
      jpTitle: "基盤工学",
      description: "Engineering fault-tolerant backend infrastructures, real-time WebSockets, and low-latency microservices.",
      skills: ["Node.js / TypeScript", "Python / FastAPI", "Rust / Wasm", "Docker / Kubernetes", "PostgreSQL / Redis"],
      crestSvg: (isActive) => (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="50" r="40" />
          <motion.path d="M 50 10 L 50 90 M 10 50 L 90 50 M 22 22 L 78 78 M 22 78 L 78 22" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
        </svg>
      )
    },
    {
      id: 4,
      title: "UI/UX & KINETIC CRAFT",
      jpTitle: "造形設計",
      description: "Crafting fluid, highly responsive user interfaces inspired by classical art, typography, and modern micro-interactions.",
      skills: ["Next.js App Router", "Tailwind CSS", "Framer Motion", "Accessibility (a11y)", "Design Systems"],
      crestSvg: (isActive) => (
        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="15" y="15" width="70" height="70" rx="3" strokeDasharray="3 3" />
          <motion.rect x="25" y="25" width="50" height="50" rx="2" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.path d="M 15 50 L 85 50" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
        </svg>
      )
    }
  ];

  return (
    <section id="skills" className="py-20 md:py-24 px-6 sm:px-12 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div>
            <span className="font-shippori text-xs text-samurai-gold tracking-widest uppercase block mb-1">
              熟練 // Technical Arsenal
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-washi-light tracking-wider">
              DISCIPLINE & MASTERY.
            </h2>
          </div>
          <p className="font-sans text-xs sm:text-sm text-washi-light/60 max-w-sm tracking-wide font-light">
            Each discipline represents years of dedicated study, iteration, and refinement across multiple domains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: cat.id * 0.1 }}
                onMouseEnter={() => {
                  audio?.playWoodStrike?.();
                  setActiveCategory(cat.id);
                }}
                onMouseLeave={() => setActiveCategory(null)}
                className={`group relative bg-[#171615] border rounded-lg p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 cursor-pointer ${
                  isActive
                    ? "border-samurai-gold/70 shadow-[0_0_30px_rgba(191,161,95,0.15)] bg-[#1d1b19]"
                    : "border-sumi-gray hover:border-samurai-gold/30"
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="font-shippori text-xs text-samurai-gold opacity-60 tracking-widest uppercase block mb-1">
                      {cat.jpTitle}
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-washi-light group-hover:text-samurai-gold transition-colors duration-300">
                      {cat.title}
                    </h3>
                  </div>

                  <div className={`transition-transform duration-500 ${isActive ? "scale-105 text-samurai-gold" : "text-samurai-gold/40"}`}>
                    {cat.crestSvg(isActive)}
                  </div>
                </div>

                <p className="font-sans text-xs sm:text-sm text-washi-light/70 leading-relaxed font-light mb-8">
                  {cat.description}
                </p>

                <div className="w-full flex flex-col space-y-2 mt-auto">
                  <span className="font-sans text-[10px] tracking-widest text-samurai-gold uppercase font-semibold">
                    Core Arsenal:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`text-xs font-mono px-3 py-1 rounded transition-all duration-300 border ${
                          isActive
                            ? "bg-samurai-gold/15 text-samurai-gold-bright border-samurai-gold/40"
                            : "bg-sumi-black/60 text-washi-light/65 border-sumi-gray"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
