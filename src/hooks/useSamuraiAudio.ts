"use client";

import { useEffect, useRef, useState } from "react";

export function useSamuraiAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windNoiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const windFilterRef = useRef<BiquadFilterNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const [isMuted, setIsMuted] = useState(true);

  // Initialize Web Audio context
  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Create Wind Sound (Pink noise approximate using ScriptProcessor for maximum compatibility)
    // ScriptProcessor is deprecated but widely supported in all browsers for procedural noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate pinkish noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // scale down
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Wind filter (lowpass filter to simulate blowing)
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(3.0, ctx.currentTime);
    filter.frequency.setValueAtTime(350, ctx.currentTime);
    windFilterRef.current = filter;

    // Wind Gain node
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
    windGainRef.current = gainNode;

    // Analyser node for the HUD visualizer
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 32; // small size for high performance visualizer bars
    analyserRef.current = analyser;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    noiseSource.start(0);

    // Modulate wind frequency randomly to simulate gusty wind
    const modulateWind = () => {
      if (!audioCtxRef.current || isMuted) return;
      const now = ctx.currentTime;
      const targetFreq = 200 + Math.random() * 500;
      const targetQ = 1.0 + Math.random() * 4.0;
      const speed = 2.0 + Math.random() * 3.0; // seconds to change

      filter.frequency.exponentialRampToValueAtTime(targetFreq, now + speed);
      filter.Q.exponentialRampToValueAtTime(targetQ, now + speed);
      
      setTimeout(modulateWind, speed * 1000);
    };
    modulateWind();

    if (!isMuted) {
      gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      
      if (!audioCtxRef.current) {
        initAudio();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      if (windGainRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (nextMuted) {
          windGainRef.current.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.8);
        } else {
          windGainRef.current.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.0);
        }
      }
      return nextMuted;
    });
  };

  // Play Koto String Pluck sound
  const playKoto = (noteIndex = 0) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Traditional Hirajoshi pentatonic scale (A minor-ish)
    // A4, B4, C5, E5, F5, A5
    const scale = [440.00, 493.88, 523.25, 659.25, 698.46, 880.00];
    const freq = scale[noteIndex % scale.length];

    try {
      const now = ctx.currentTime;
      
      // Koto pluck has a sharp attack and rich harmonic content, modeled with twin oscillators (triangle + sine)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, now);
      
      osc2.type = "sine";
      // detune slightly for string thickness
      osc2.frequency.setValueAtTime(freq * 2.002, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 4, now);
      // Sweep filter down quickly for string pluck dampening
      filter.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.8);

      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.005); // sharp attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // long decay

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
    } catch (e) {
      console.warn("Koto play failed:", e);
    }
  };

  // Play Hyoshigi Wood Block Strike sound (used on button hovers/clicks)
  const playWoodStrike = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const bandpass = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(850, now);
      bandpass.Q.setValueAtTime(8, now);

      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("Wood block strike failed:", e);
    }
  };

  // Play Katana Sword Slice sound (used on main actions or section transitions)
  const playSwordSlice = () => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    try {
      const now = ctx.currentTime;
      const duration = 0.25;

      // Generate a tiny burst of white noise for the air friction/slash
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2000, now);
      // Sweeping frequency upwards and then down rapidly
      filter.frequency.exponentialRampToValueAtTime(6000, now + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.Q.setValueAtTime(4.0, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.05);
    } catch (e) {
      console.warn("Sword slice failed:", e);
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
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
    playKoto,
    playWoodStrike,
    playSwordSlice,
    getAnalyser: () => analyserRef.current
  };
}
