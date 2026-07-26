"use client";

import { useEffect, useRef, useState } from "react";

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const ambientFilterRef = useRef<BiquadFilterNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Initialize Audio Context on user gesture
  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Create a low low-pass filter for ambient hum
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, ctx.currentTime);
    ambientFilterRef.current = filter;

    // Create ambient synth node (sawtooth + triangle)
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note - deep rumble
    ambientOscRef.current = osc;

    // Gain node for ambient volume
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0, ctx.currentTime); // Start silent
    ambientGainRef.current = gainNode;

    // Connect ambient synthesizer
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start oscillator
    osc.start(0);

    // If already unmuted, fade in the ambient hum
    if (!isMuted) {
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      
      // Attempt to initialize or resume context if needed
      if (!audioCtxRef.current) {
        initAudio();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      if (ambientGainRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (nextMuted) {
          ambientGainRef.current.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.5);
        } else {
          ambientGainRef.current.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
        }
      }
      return nextMuted;
    });
  };

  // Play sci-fi UI hover/click sounds
  const playClick = (freq = 800, type: OscillatorType = "sine", duration = 0.08) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Laser sweep if frequency is high
      if (freq > 1200) {
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
      }

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Click audio play failed:", e);
    }
  };

  // Play warp jump sound
  const playWarpSound = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    try {
      const duration = 1.8;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(40, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + duration);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(60, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(4800, ctx.currentTime + duration);

      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + duration * 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Warp sound play failed:", e);
    }
  };

  // Play computer alert sound
  const playAlert = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    try {
      const now = ctx.currentTime;
      [0, 0.15, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(987.77, now + delay); // B5 note
        
        gainNode.gain.setValueAtTime(0.12, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch (e) {
      console.warn("Alert play failed:", e);
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.stop();
        } catch (_) {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    initAudio,
    playClick: (freq?: number, type?: OscillatorType, duration?: number) => playClick(freq, type, duration),
    playWarpSound,
    playAlert
  };
}
