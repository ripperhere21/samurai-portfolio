"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  Volume2,
  VolumeX,
  Shield,
  Activity,
  Cpu,
  Star,
  Award,
  Zap,
  ChevronRight
} from "lucide-react";

interface HUDProps {
  activeSector: string;
  onSelectSector: (sector: string) => void;
  audioMuted: boolean;
  onToggleMute: () => void;
  playClick: (freq?: number, type?: OscillatorType, duration?: number) => void;
  achievements: number[];
  systemWarning: string | null;
  triggerEvent: (event: string) => void;
}

export function HolographicHUD({
  activeSector,
  onSelectSector,
  audioMuted,
  onToggleMute,
  playClick,
  achievements,
  systemWarning,
  triggerEvent
}: HUDProps) {
  const [time, setTime] = useState("");
  const [glitchText, setGlitchText] = useState("STARFALL // TERMINAL v1.0.8");

  // Keep time updated
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle glitch effect on HUD header title
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchText("S T A R F A L L // T E R M I N A L");
        setTimeout(() => {
          setGlitchText("STARFALL // TERMINAL v1.0.8");
        }, 150);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const navSectors = [
    { id: "about", name: "MEMORIUM PLANET", label: "ABOUT CREATOR" },
    { id: "skills", name: "CONSTELLATION", label: "SKILLS MATRIX" },
    { id: "projects", name: "SOLAR ARCHIVE", label: "PROJECT CATALOG" },
    { id: "games", name: "ASTEROID DEEP", label: "GAME REPOSITORY" },
    { id: "aicore", name: "AI REACTOR", label: "AEGIS CHAT CORE" },
    { id: "experience", name: "WORMHOLE VORTEX", label: "EXPERIENCE LOG" },
    { id: "resume", name: "CRYSTAL DOCK", label: "RESUME RETRIEVAL" },
    { id: "contact", name: "COMM ARRAY", label: "CONTACT BEACON" }
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 font-share text-cyan-glow select-none">
      
      {/* Top HUD Frame */}
      <div className="w-full flex items-start justify-between pointer-events-auto">
        {/* Top Left diagnostics */}
        <div className="glass-panel px-4 py-2 border-l-4 border-cyan-glow flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-glow animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-[#00e5ff] text-shadow-glow">
              {glitchText}
            </span>
          </div>
          <div className="flex gap-4 text-[10px] text-zinc-400">
            <span>SECTOR: 0x9F4</span>
            <span>SHIELD: 100%</span>
            <span>CORE TEMP: 32.4°C</span>
          </div>
        </div>

        {/* System Warnings Alert */}
        {systemWarning && (
          <div className="glass-panel-magenta px-6 py-2 border border-red-500 flex items-center gap-3 animate-pulse">
            <Zap className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-500 font-bold tracking-widest uppercase">
              ALERT: {systemWarning} IN PROGRESS
            </span>
          </div>
        )}

        {/* Top Right Controls & Time */}
        <div className="flex items-center gap-3">
          {/* Mute Button */}
          <button
            onClick={() => {
              playClick(900, "sine", 0.05);
              onToggleMute();
            }}
            className="glass-panel p-2 text-cyan-glow hover:bg-cyan-glow/10 hover:text-white transition-colors pointer-events-auto"
            title="Toggle Audio Synth"
          >
            {audioMuted ? (
              <VolumeX className="w-5 h-5 text-[#ff007f]" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          {/* Time display */}
          <div className="glass-panel px-4 py-2 flex flex-col items-end">
            <span className="text-xs text-zinc-400 tracking-wider">SYSTEM TIME</span>
            <span className="text-sm font-bold font-mono tracking-widest text-white">
              {time || "00:00:00"}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid Left / Right Accents */}
      <div className="flex-1 flex justify-between items-center my-6">
        {/* Left Side: Space Event Triggers */}
        <div className="hidden md:flex flex-col gap-3 pointer-events-auto">
          <div className="text-[10px] text-zinc-500 mb-1 tracking-widest">
            SIMULATION TRIGGER
          </div>
          <button
            onClick={() => {
              playClick(1000, "sawtooth", 0.1);
              triggerEvent("warp");
            }}
            className="glass-panel px-3 py-1.5 text-left text-xs font-semibold text-cyan-glow hover:bg-cyan-glow/10 hover:border-cyan-glow/50 transition-all flex items-center justify-between gap-3 w-40"
          >
            <span>[ WARP JUMP ]</span>
            <Zap className="w-3 h-3 text-cyan-glow animate-pulse" />
          </button>
          <button
            onClick={() => {
              playClick(400, "triangle", 0.3);
              triggerEvent("meteor");
            }}
            className="glass-panel px-3 py-1.5 text-left text-xs font-semibold text-[#ff007f] border-[#ff007f]/30 hover:bg-[#ff007f]/10 hover:border-[#ff007f]/50 transition-all flex items-center justify-between gap-3 w-40"
          >
            <span>[ METEOR SHOWER ]</span>
            <Activity className="w-3 h-3 text-[#ff007f]" />
          </button>
          <button
            onClick={() => {
              playClick(600, "sine", 0.2);
              triggerEvent("whale");
            }}
            className="glass-panel px-3 py-1.5 text-left text-xs font-semibold text-amber-400 border-amber-400/30 hover:bg-amber-400/10 hover:border-amber-400/50 transition-all flex items-center justify-between gap-3 w-40"
          >
            <span>[ BIO-WHALE ]</span>
            <Compass className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* Right Side: Collected Achievements */}
        <div className="hidden lg:flex flex-col gap-2 glass-panel p-4 max-w-xs border-r-4 border-amber-400 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              ACHIEVEMENTS
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 leading-relaxed">
            Find 5 hidden stars in the ship's consoles to unlock the ultimate rank badge.
          </span>
          <div className="flex gap-2.5 mt-2">
            {[0, 1, 2, 3, 4].map((starIdx) => (
              <div
                key={starIdx}
                className={`p-1 border rounded-md transition-all ${
                  achievements.length > starIdx
                    ? "border-amber-400 bg-amber-400/10 text-amber-400"
                    : "border-zinc-800 bg-zinc-900/30 text-zinc-600"
                }`}
                title={
                  achievements.length > starIdx
                    ? `Achievement Unlocked: Star ${starIdx + 1}`
                    : "Star Locked"
                }
              >
                <Star className="w-3.5 h-3.5" fill={achievements.length > starIdx ? "#ffd700" : "none"} />
              </div>
            ))}
          </div>
          {achievements.length === 5 && (
            <div className="text-[10px] text-amber-300 font-bold uppercase mt-1 animate-pulse">
              RANK: GRAND ARCHIVIST UNLOCKED
            </div>
          )}
        </div>
      </div>

      {/* Bottom HUD: Navigation console & ship status */}
      <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-auto">
        {/* Bridge Navigation Console */}
        <div className="w-full md:max-w-2xl glass-panel p-3 border-b-4 border-cyan-glow relative">
          <div className="absolute top-[-16px] left-[15px] bg-[#070714] border border-cyan-glow/30 px-2 py-0.5 text-[9px] text-[#00e5ff] tracking-widest font-bold">
            BRIDGE DIRECTORY SELECTOR
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {navSectors.map((sec) => {
              const active = activeSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    playClick(active ? 600 : 700, "sine", 0.06);
                    onSelectSector(sec.id);
                  }}
                  className={`text-left p-2 border flex flex-col gap-0.5 transition-all duration-300 hud-corner ${
                    active
                      ? "border-cyan-glow bg-cyan-glow/15 text-white"
                      : "border-cyan-glow/20 bg-black/40 text-cyan-glow/65 hover:border-cyan-glow/50 hover:bg-cyan-glow/5 hover:text-cyan-glow"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-wider truncate flex items-center justify-between">
                    {sec.name}
                    {active && <ChevronRight className="w-3 h-3 text-cyan-glow animate-ping" />}
                  </span>
                  <span className="text-[8px] text-zinc-500 tracking-wider">
                    {sec.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ship status radar display */}
        <div className="hidden md:flex items-center gap-3 glass-panel p-3 min-w-[200px]">
          <div className="relative w-12 h-12 flex items-center justify-center border border-cyan-glow/20 rounded-full animate-spin-slow">
            <Compass className="w-8 h-8 text-cyan-glow/50" />
            <div className="absolute inset-0 w-full h-full border-t border-cyan-glow animate-spin" />
          </div>
          <div className="flex flex-col text-[9px] text-zinc-400 gap-0.5">
            <span className="text-[#00e5ff] text-[10px] font-bold tracking-wider">TRANSCEIVER // ACTIVE</span>
            <span>BEACON: STARFALL-T9</span>
            <span>STATUS: DOCKING COMPLETE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
