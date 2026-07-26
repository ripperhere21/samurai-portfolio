"use client";

import React, { useState } from "react";
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

export function Skills({ audio }: SkillsProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const categories: SkillCategory[] = [
    {
      id: 1,
      title: "AI & NEURAL ARCHITECTURE",
      jpTitle: "人工知能",
      description: "Designing neural weights and autonomous decision-making agents capable of learning and adapting to dynamic parameters.",
      skills: ["Deep Learning", "Reinforcement Learning", "NLP / LLMs", "Multi-Agent Systems", "PyTorch / TensorFlow"],
      crestSvg: (isActive) => (
        // Dragon / Circle Crest (Ryu)
        <svg viewBox="0 0 100 100" className="w-20 h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="50" r="42" strokeDasharray="1 3" />
          <motion.circle cx="50" cy="50" r="38" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Dragon claw/geometric scales */}
          <motion.path d="M50 12 C 30 20, 20 40, 20 50 C 20 60, 30 80, 50 88 C 70 80, 80 60, 80 50 C 80 40, 70 20, 50 12 Z" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.path d="M50 25 C 40 30, 35 45, 35 50 C 35 55, 40 70, 50 75 C 60 70, 65 55, 65 50 C 65 45, 60 30, 50 25 Z" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <circle cx="50" cy="50" r="6" fill="currentColor" className="opacity-20" />
        </svg>
      )
    },
    {
      id: 2,
      title: "CREATIVE ENGINEERING & WEBGL",
      jpTitle: "創造技術",
      description: "Forging highly interactive, hardware-accelerated user experiences with rich shader aesthetics and fluid mechanics.",
      skills: ["WebGL / GLSL", "Three.js / React Three Fiber", "GSAP / Framer Motion", "Canvas APIs", "Shader Optimization"],
      crestSvg: (isActive) => (
        // Waves and Sun Crest (Nami)
        <svg viewBox="0 0 100 100" className="w-20 h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <motion.circle cx="50" cy="50" r="38" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Traditional wave curves */}
          <motion.path d="M22 65 Q36 50 50 65 T78 65" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.path d="M16 55 Q33 35 50 55 T84 55" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.path d="M28 75 Q39 63 50 75 T72 75" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Rising Sun silhouette top half */}
          <circle cx="50" cy="40" r="14" fill="currentColor" className="opacity-15" />
          <motion.path d="M36 40 L64 40" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
        </svg>
      )
    },
    {
      id: 3,
      title: "INTERACTIVE & GAME SYSTEMS",
      jpTitle: "遊戯開発",
      description: "Forging responsive game loops, collision matrix calculations, and state machines with immediate user tactile feedback.",
      skills: ["ECS Architecture", "Physics Simulation", "Game Design Patterns", "C# / Unity", "TypeScript Game Loops"],
      crestSvg: (isActive) => (
        // Crossed Arrows Crest (Yagasuri)
        <svg viewBox="0 0 100 100" className="w-20 h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <motion.circle cx="50" cy="50" r="38" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Crossed Arrows */}
          <motion.line x1="25" y1="75" x2="75" y2="25" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.line x1="25" y1="25" x2="75" y2="75" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Fletching details */}
          <path d="M70 20 L78 22 L75 30 L67 28 Z" fill="currentColor" className="opacity-30" />
          <path d="M20 70 L22 78 L30 75 L28 67 Z" fill="currentColor" className="opacity-30" />
          <path d="M70 80 L78 78 L75 70 L67 72 Z" fill="currentColor" className="opacity-30" />
          <path d="M20 30 L22 22 L30 25 L28 33 Z" fill="currentColor" className="opacity-30" />
          {/* Center binding ring */}
          <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" />
        </svg>
      )
    },
    {
      id: 4,
      title: "DISTRIBUTED & CORE ARCHITECTURE",
      jpTitle: "基盤設計",
      description: "Sculpting robust backend pipelines, real-time message streams, and highly optimized database relations.",
      skills: ["Node.js / Go", "Docker / K8s", "PostgreSQL / Redis", "API Gateway Routing", "System Design"],
      crestSvg: (isActive) => (
        // Pine Needle / Bamboo Crest (Matsu)
        <svg viewBox="0 0 100 100" className="w-20 h-20 transition-all duration-500 group-hover:stroke-samurai-gold-bright" fill="none" stroke="currentColor" strokeWidth="1.5">
          <motion.circle cx="50" cy="50" r="38" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Matsu pine fan layers */}
          <motion.path d="M50 18 C50 18, 28 32, 28 45 C28 58, 50 58, 50 58 C50 58, 72 58, 72 45 C72 32, 50 18, 50 18 Z" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          <motion.path d="M50 36 C50 36, 34 46, 34 55 C34 64, 50 64, 50 64 C50 64, 66 64, 66 55 C66 46, 50 36, 50 36 Z" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Stem */}
          <motion.line x1="50" y1="58" x2="50" y2="82" strokeWidth="2.5" variants={pathVariants} initial="inactive" animate={isActive ? "active" : "inactive"} />
          {/* Knots */}
          <circle cx="50" cy="68" r="3" fill="currentColor" />
        </svg>
      )
    }
  ];

  return (
    <section id="skills" className="py-24 px-8 md:px-20 lg:px-32 border-b border-sumi-gray bg-sumi-black relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-samurai-gold/20 pb-6">
          <div>
            <span className="font-shippori text-xs md:text-sm tracking-widest text-samurai-gold uppercase block mb-2">// Crests of Proficiency</span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-widest text-washi-light">
              MASTERY & DISCIPLINE
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-sans text-xs md:text-sm text-washi-light/60 tracking-wider font-light max-w-xs md:text-right">
            Forged techniques accumulated through years of dedicated training and implementation.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat.id;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                onMouseEnter={() => {
                  audio.playWoodStrike();
                  setActiveCategory(cat.id);
                }}
                onMouseLeave={() => setActiveCategory(null)}
                className={`relative p-8 rounded-sm brush-border-gold transition-all duration-500 flex flex-col items-center text-center select-none ${
                  isActive 
                    ? "bg-[#1c1918] border-samurai-gold shadow-[0_15px_30px_rgba(191,161,95,0.15)] -translate-y-2" 
                    : "bg-[#141312] border-samurai-gold/20"
                }`}
              >
                {/* Kanji Overlay background */}
                <div className="absolute top-4 right-4 opacity-5 font-shippori text-xl font-bold text-samurai-gold">
                  {cat.jpTitle}
                </div>

                {/* Kamon Crest Container */}
                <div className={`mb-6 p-4 rounded-full border transition-all duration-500 ${
                  isActive 
                    ? "border-samurai-gold text-samurai-gold bg-samurai-gold/5" 
                    : "border-washi-light/10 text-washi-light/40"
                }`}>
                  {cat.crestSvg(isActive)}
                </div>

                {/* Title */}
                <h3 className={`font-cinzel text-sm lg:text-base font-bold tracking-widest transition-colors duration-300 ${
                  isActive ? "text-samurai-gold-bright" : "text-washi-light"
                }`}>
                  {cat.title}
                </h3>

                {/* Divider */}
                <div className={`my-4 w-12 h-[1px] transition-all duration-500 ${
                  isActive ? "bg-samurai-gold w-20" : "bg-washi-light/10"
                }`} />

                {/* Description */}
                <p className="font-sans text-xs text-washi-light/65 leading-relaxed font-light mb-6 min-h-[60px]">
                  {cat.description}
                </p>

                {/* Sub Skill tags */}
                <div className="w-full flex flex-col space-y-2 mt-auto">
                  {cat.skills.map((skill, sIdx) => (
                    <div 
                      key={sIdx}
                      className={`text-[11px] font-sans tracking-widest uppercase py-1 border transition-all duration-300 ${
                        isActive 
                          ? "border-samurai-gold/15 bg-samurai-gold/5 text-washi-light" 
                          : "border-transparent text-washi-light/40"
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
