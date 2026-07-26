"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Cpu, User } from "lucide-react";

interface Message {
  sender: "user" | "aegis";
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  "List core technologies",
  "Summarize key projects",
  "Where are the hidden stars?",
  "How to hire this creator?"
];

// Predefined AI knowledge base responses
const getAIResponse = (input: string): string => {
  const query = input.toLowerCase();

  if (query.includes("skill") || query.includes("tech") || query.includes("matrix") || query.includes("language")) {
    return "ACCESSING CREATOR SKILLS INDEX...\n- AI Core: Deep Learning, PyTorch, LLMs, NLP agent routers.\n- Graphics: WebGL 2.0, custom GLSL shaders, Three.js, WebGPU, Rust.\n- Engineering: TypeScript/Node.js, C++, C#, Python, Docker, PostgreSQL.\n- Design: Blender, Framer Motion, GSAP, kinetic layouts.";
  }
  if (query.includes("project") || query.includes("portfolio") || query.includes("catalogue") || query.includes("work")) {
    return "LOADING PROJECT DIRECTORIES...\n1. AETHER ENGINE: WebGL & WebAssembly particles running in Rust.\n2. NEUROLINK AI CORE: Real-time 3D transformer weight visualizer.\n3. NOVA PROTOCOL: Voxel space tactical RPG prototype in Unity.\nSelect [SOLAR ARCHIVE] in the navigation console to explore visual planetary nodes.";
  }
  if (query.includes("star") || query.includes("hidden") || query.includes("collect") || query.includes("achievement") || query.includes("easter")) {
    return "DIAGNOSTICS: 5 hidden energy stars are scattered in the ship's mainframe terminals. Keep an eye out in: Memory Planet [Memorium], Star Constellation [Constellation], Projects [Solar Archive], Asteroid Belt [Asteroid Deep], and the Contact Console [Comm Array]. Clicking them unlocks the GRAND ARCHIVIST clearance level.";
  }
  if (query.includes("hire") || query.includes("contact") || query.includes("email") || query.includes("available")) {
    return "COMMUNICATION CHANNELS ONLINE.\nThe creator is currently accepting select opportunities in AI, WebGL, Creative Engineering, and Game Development.\nSubmit your details via the [COMM ARRAY] contact beacon, or route an direct transmission to: creator@starfall-terminal.io";
  }
  if (query.includes("experience") || query.includes("career") || query.includes("timeline") || query.includes("job")) {
    return "RETRIEVING CAREER VORTEX TIMELINE...\n- Lead Creative Engineer @ QuantumLabs (2024-Present)\n- Graphics Engineer @ Singularity Games (2022-2024)\n- Software Architect @ Helix Systems (2020-2022)\nSelect [WORMHOLE VORTEX] on navigation console to scroll through the full warp logs.";
  }
  if (query.includes("game") || query.includes("pixel") || query.includes("mini")) {
    return "CAUTION: Signals detected in the [ASTEROID DEEP] sector. There is an active warning beacon. Clicking it will override the console and launch the STARFALL DEFENDER retro arcade simulation directly on your screen.";
  }
  if (query.includes("hello") || query.includes("hi") || query.includes("aegis") || query.includes("who are you")) {
    return "Greetings. I am A.E.G.I.S. (Automated Galactic Information System), the AI consciousness of the Starfall Vessel. Ask me anything regarding our pilot's skills, code projects, timeline history, or details about the ship's subsystems.";
  }

  return "TRANSMISSION RECEIVED. I have searched the creator's archive but could not find a exact match for your query. Try asking about 'skills', 'projects', 'experience', 'hidden stars', or 'contact email'.";
};

export function AICoreTerminal({
  playClick
}: {
  playClick: (freq?: number, type?: OscillatorType, duration?: number) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "aegis",
      text: "Greetings. I am A.E.G.I.S., the AI consciousness of the Starfall Vessel. Ask me anything regarding our pilot's skills, code projects, timeline history, or details about the ship's subsystems.",
      time: new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    playClick(850, "sine", 0.05);

    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      minute: "2-digit",
      second: "2-digit"
    });

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text, time: timeStr }]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI thinking and reply
    setTimeout(() => {
      playClick(1000, "triangle", 0.08);
      const answer = getAIResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: "aegis",
          text: answer,
          time: new Date().toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit"
          })
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[50vh] sm:h-[55vh] font-share">
      {/* Dialogue box */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 border border-cyan-glow/10 bg-black/60 p-4 rounded-md scrollbar"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar icon */}
            <div
              className={`p-1.5 rounded-full border ${
                msg.sender === "user"
                  ? "border-[#ff007f]/40 bg-[#ff007f]/10 text-[#ff007f]"
                  : "border-cyan-glow/40 bg-cyan-glow/10 text-[#00e5ff]"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] p-3 rounded-md border text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                msg.sender === "user"
                  ? "border-[#ff007f]/20 bg-[#ff007f]/5 text-zinc-100"
                  : "border-cyan-glow/20 bg-cyan-glow/5 text-cyan-glow"
              }`}
            >
              <div className="flex justify-between items-center gap-4 mb-1.5 opacity-55 text-[9px] uppercase tracking-wider">
                <span>{msg.sender === "user" ? "Vessel Visitor" : "AEGIS AI CORE"}</span>
                <span>{msg.time}</span>
              </div>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 italic uppercase tracking-widest pl-10">
            <Terminal className="w-3.5 h-3.5 animate-spin" />
            AEGIS SEARCHING CORE DATAFILES...
          </div>
        )}
      </div>

      {/* Suggested prompts tag list */}
      <div className="flex flex-wrap gap-2 my-3">
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[10px] sm:text-xs px-2.5 py-1 border border-cyan-glow/20 bg-black/40 text-cyan-glow/70 rounded-full hover:bg-cyan-glow/10 hover:border-cyan-glow/50 hover:text-white transition-all cursor-none"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Inputs bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="flex items-center gap-2 mt-1 border-t border-cyan-glow/20 pt-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask A.E.G.I.S. about skills, projects, timeline, email..."
          className="flex-1 px-4 py-2 border border-cyan-glow/20 bg-black/80 rounded-md text-xs sm:text-sm text-cyan-glow focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow cursor-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 border.5 border-cyan-glow bg-cyan-glow/25 text-white hover:bg-cyan-glow/40 transition-colors rounded-md disabled:opacity-35 disabled:cursor-not-allowed cursor-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
export type { Message };
