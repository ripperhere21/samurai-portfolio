"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShieldAlert } from "lucide-react";
import React from "react";

interface TerminalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  playClick: (freq?: number, type?: OscillatorType, duration?: number) => void;
  // Achievement star configuration
  hasStarIndex?: number; 
  collectedStars?: number[];
  onCollectStar?: (idx: number) => void;
  themeColor?: "cyan" | "magenta" | "gold";
  children: React.ReactNode;
}

export function SectorTerminal({
  isOpen,
  title,
  subtitle,
  onClose,
  playClick,
  hasStarIndex,
  collectedStars = [],
  onCollectStar,
  themeColor = "cyan",
  children
}: TerminalProps) {
  const isStarCollected = hasStarIndex !== undefined && collectedStars.includes(hasStarIndex);

  const getThemeClasses = () => {
    switch (themeColor) {
      case "magenta":
        return {
          panel: "glass-panel-magenta border-[#ff007f]/30",
          header: "text-[#ff007f] text-glow-magenta",
          border: "border-[#ff007f]/20",
          bar: "bg-[#ff007f]",
          led: "bg-[#ff007f] shadow-[0_0_8px_#ff007f]"
        };
      case "gold":
        return {
          panel: "glass-panel-gold border-[#ffd700]/30",
          header: "text-[#ffd700] text-glow-gold",
          border: "border-[#ffd700]/20",
          bar: "bg-[#ffd700]",
          led: "bg-[#ffd700] shadow-[0_0_8px_#ffd700]"
        };
      default:
        return {
          panel: "glass-panel border-[#00e5ff]/30",
          header: "text-[#00e5ff] text-glow-cyan",
          border: "border-[#00e5ff]/20",
          bar: "bg-[#00e5ff]",
          led: "bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-20 pointer-events-none">
          {/* Background blocker click-shield (allows clicking outside to close) */}
          <div className="absolute inset-0 pointer-events-auto" onClick={() => {
            playClick(600, "sine", 0.05);
            onClose();
          }} />

          {/* Core Panel Chassis */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`w-full max-w-3xl max-h-[85vh] flex flex-col pointer-events-auto relative rounded-md overflow-hidden ${theme.panel}`}
          >
            {/* Holographic scanning overlay */}
            <div className="absolute inset-0 scanline-light opacity-15 pointer-events-none" />

            {/* Terminal Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${theme.border} bg-black/60`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${theme.led} animate-pulse`} />
                <div className="flex flex-col">
                  <h2 className={`text-sm sm:text-base font-orbitron font-bold tracking-widest ${theme.header}`}>
                    {title}
                  </h2>
                  <span className="text-[9px] text-zinc-400 tracking-wider">
                    {subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Hidden Achievement Star */}
                {hasStarIndex !== undefined && !isStarCollected && (
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    onClick={() => {
                      playClick(1200, "sine", 0.25);
                      onCollectStar?.(hasStarIndex);
                    }}
                    className="p-1 text-amber-400 hover:text-amber-300 animate-bounce"
                    title="Unlock Achievement Star"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </motion.button>
                )}

                {/* Close Button */}
                <button
                  onClick={() => {
                    playClick(500, "sine", 0.05);
                    onClose();
                  }}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Core Scrollable Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-black/40 text-sm leading-relaxed text-zinc-300">
              {children}
            </div>

            {/* Terminal Footer decor */}
            <div className={`h-1.5 w-full ${theme.bar} opacity-40`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
