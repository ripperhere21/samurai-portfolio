"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { Play, RotateCcw, Swords } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

interface Character {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  health: number;
  posture: number;
  state: "idle" | "run" | "attack" | "block" | "hit" | "dead";
  direction: number;
  cooldown: number;
  animTimer: number;
}

interface DeflectionGameProps {
  audio: any;
}

export const DeflectionGame = memo(function DeflectionGame({ audio }: DeflectionGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"idle" | "playing" | "victory" | "defeat">("idle");
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const playerRef = useRef<Character>({
    x: 80,
    y: 155,
    vx: 0,
    width: 30,
    height: 60,
    health: 100,
    posture: 0,
    state: "idle",
    direction: 1,
    cooldown: 0,
    animTimer: 0,
  });

  const enemyRef = useRef<Character>({
    x: 300,
    y: 155,
    vx: 0,
    width: 30,
    height: 60,
    health: 100,
    posture: 0,
    state: "idle",
    direction: -1,
    cooldown: 0,
    animTimer: 0,
  });

  const particlesRef = useRef<Particle[]>([]);
  const slashTrailRef = useRef<{ x: number; y: number; direction: number; life: number } | null>(null);
  const screenFlashRef = useRef<string | null>(null);

  const playDeflectClash = () => {
    if (audio?.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1400, now);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1750, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);

      setTimeout(() => {
        if (ctx.state !== "closed") ctx.close().catch(() => {});
      }, 600);
    } catch (_) {}
  };

  const spawnSparks = (x: number, y: number, color = "#bfa15f", count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
        color,
        alpha: 1.0,
        life: 1.0,
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        if (playerRef.current.state !== "attack" && playerRef.current.state !== "dead") {
          playerRef.current.state = "block";
          audio?.playWoodStrike?.();
        }
      }
      if (e.code === "Space") {
        if (e.cancelable) e.preventDefault();
        if (playerRef.current.cooldown <= 0 && playerRef.current.state !== "dead") {
          playerRef.current.state = "attack";
          playerRef.current.cooldown = 22;
          audio?.playSwordSlice?.();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if ((e.code === "KeyS" || e.code === "ArrowDown") && playerRef.current.state === "block") {
        playerRef.current.state = "idle";
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [audio]);

  const startGame = () => {
    setGameState("playing");
    setPlayerHP(100);
    setEnemyHP(100);

    playerRef.current = {
      x: 80,
      y: 155,
      vx: 0,
      width: 30,
      height: 60,
      health: 100,
      posture: 0,
      state: "idle",
      direction: 1,
      cooldown: 0,
      animTimer: 0,
    };

    enemyRef.current = {
      x: 340,
      y: 155,
      vx: 0,
      width: 30,
      height: 60,
      health: 100,
      posture: 0,
      state: "idle",
      direction: -1,
      cooldown: 0,
      animTimer: 0,
    };

    particlesRef.current = [];
    slashTrailRef.current = null;
    screenFlashRef.current = null;
    audio?.playSwordSlice?.();
  };

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const gameLoop = () => {
      if (!isTabVisible) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const player = playerRef.current;
      const enemy = enemyRef.current;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Arena Background (Moonlit bamboo shrine grove)
      ctx.fillStyle = "#161514";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#1e1d1c";
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(40 + i * 70, 0, 8, 215);
      }

      ctx.fillStyle = "#ebdcb9";
      ctx.beginPath();
      ctx.arc(380, 45, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#2c1a11";
      ctx.fillRect(0, 215, w, 35);
      ctx.fillStyle = "#8d1c1d";
      ctx.fillRect(0, 215, w, 2);

      if (gameState === "playing") {
        // Player Input & Physics
        if (player.state !== "attack" && player.state !== "block" && player.state !== "hit") {
          if (keysPressed.current["KeyA"] || keysPressed.current["ArrowLeft"]) {
            player.vx = -2.2;
            player.direction = -1;
            player.state = "run";
          } else if (keysPressed.current["KeyD"] || keysPressed.current["ArrowRight"]) {
            player.vx = 2.2;
            player.direction = 1;
            player.state = "run";
          } else {
            player.vx = 0;
            player.state = "idle";
          }
        } else {
          player.vx = 0;
        }

        player.x += player.vx;
        player.x = Math.max(20, Math.min(w - 50, player.x));

        if (player.cooldown > 0) {
          player.cooldown--;
          if (player.cooldown === 0 && player.state === "attack") {
            player.state = "idle";
          }
        }

        // Enemy AI Logic
        const dist = Math.abs(enemy.x - player.x);
        enemy.direction = enemy.x > player.x ? -1 : 1;

        if (enemy.state !== "attack" && enemy.state !== "block" && enemy.state !== "hit") {
          if (dist > 55) {
            enemy.vx = enemy.direction * 1.5;
            enemy.state = "run";
          } else {
            enemy.vx = 0;
            enemy.state = "idle";
            if (enemy.cooldown <= 0 && Math.random() < 0.035) {
              enemy.state = "attack";
              enemy.cooldown = 40;
            }
          }
        } else {
          enemy.vx = 0;
        }

        enemy.x += enemy.vx;
        enemy.x = Math.max(20, Math.min(w - 50, enemy.x));

        if (enemy.cooldown > 0) {
          enemy.cooldown--;
          if (enemy.cooldown === 0 && enemy.state === "attack") {
            enemy.state = "idle";
          }
        }

        // Hit Detection & Combat Resolution
        if (enemy.state === "attack" && enemy.cooldown === 20 && dist < 50) {
          if (player.state === "block") {
            // Deflect!
            playDeflectClash();
            spawnSparks(player.x + 15, player.y + 20, "#bfa15f", 20);
            screenFlashRef.current = "rgba(191, 161, 95, 0.25)";
            enemy.health -= 12;
            enemy.state = "hit";
            setEnemyHP(Math.max(0, enemy.health));
          } else {
            // Hit!
            audio?.playSwordSlice?.();
            spawnSparks(player.x + 15, player.y + 20, "#8d1c1d", 16);
            player.health -= 25;
            player.state = "hit";
            setPlayerHP(Math.max(0, player.health));
          }
        }

        if (player.state === "attack" && player.cooldown === 15 && dist < 50) {
          audio?.playSwordSlice?.();
          spawnSparks(enemy.x + 15, enemy.y + 20, "#8d1c1d", 16);
          enemy.health -= 30;
          enemy.state = "hit";
          setEnemyHP(Math.max(0, enemy.health));
        }

        if (player.health <= 0) {
          player.state = "dead";
          setGameState("defeat");
        } else if (enemy.health <= 0) {
          enemy.state = "dead";
          setGameState("victory");
        }
      }

      // Render Characters
      const drawCharacter = (char: Character, isPlayer: boolean) => {
        ctx.save();
        ctx.translate(char.x, char.y);

        ctx.fillStyle = isPlayer ? "#bfa15f" : "#8d1c1d";
        ctx.fillRect(0, 0, char.width, char.height);

        ctx.fillStyle = "#ebdcb9";
        ctx.beginPath();
        ctx.arc(char.width / 2, 10, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (char.state === "attack") {
          ctx.moveTo(char.width / 2, 20);
          ctx.lineTo(char.width / 2 + char.direction * 35, 20);
        } else if (char.state === "block") {
          ctx.moveTo(char.width / 2, 5);
          ctx.lineTo(char.width / 2 + char.direction * 15, 45);
        } else {
          ctx.moveTo(char.width / 2, 25);
          ctx.lineTo(char.width / 2 + char.direction * 25, 40);
        }
        ctx.stroke();

        ctx.restore();
      };

      drawCharacter(player, true);
      drawCharacter(enemy, false);

      // Render Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) return;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // Screen Flash
      if (screenFlashRef.current) {
        ctx.fillStyle = screenFlashRef.current;
        ctx.fillRect(0, 0, w, h);
        screenFlashRef.current = null;
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, [gameState, audio]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="relative w-full max-w-[440px] rounded border border-samurai-gold/40 overflow-hidden shadow-2xl bg-sumi-black">
        {/* HP Bars */}
        <div className="absolute top-3 inset-x-4 flex justify-between gap-4 z-10 pointer-events-none">
          <div className="w-1/2 flex flex-col gap-1">
            <span className="font-cinzel text-[9px] font-bold text-samurai-gold tracking-widest uppercase">
              SAMURAI (YOU)
            </span>
            <div className="w-full h-2 bg-sumi-gray rounded-full overflow-hidden border border-samurai-gold/30">
              <div className="h-full bg-samurai-gold transition-all duration-300" style={{ width: `${playerHP}%` }} />
            </div>
          </div>

          <div className="w-1/2 flex flex-col items-end gap-1">
            <span className="font-cinzel text-[9px] font-bold text-samurai-red tracking-widest uppercase">
              SHADOW NINJA
            </span>
            <div className="w-full h-2 bg-sumi-gray rounded-full overflow-hidden border border-samurai-red/30">
              <div className="h-full bg-samurai-red transition-all duration-300" style={{ width: `${enemyHP}%` }} />
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} width={440} height={250} className="w-full h-[250px] block" />

        {/* Game State Overlay */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 bg-sumi-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            {gameState === "idle" && (
              <>
                <Swords className="w-10 h-10 text-samurai-gold mb-3 animate-pulse" />
                <h4 className="font-cinzel text-lg font-bold text-washi-light tracking-wider mb-1">
                  SEKIRO'S DEFLECTION ARENA
                </h4>
                <p className="font-sans text-xs text-washi-light/60 max-w-xs mb-5 font-light">
                  Press <strong className="text-samurai-gold font-semibold">SPACE</strong> to Slash, <strong className="text-samurai-gold font-semibold">S / DOWN</strong> to Deflect attacks, and <strong className="text-samurai-gold font-semibold">A / D</strong> to move.
                </p>
                <button
                  onClick={startGame}
                  className="min-h-[44px] px-6 py-2.5 bg-samurai-red hover:bg-[#a8201a] text-washi-light font-cinzel text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-samurai-gold"
                >
                  Enter Combat <Play size={14} />
                </button>
              </>
            )}

            {gameState === "victory" && (
              <>
                <span className="font-shippori text-xs text-samurai-gold font-bold tracking-widest uppercase mb-1">
                  勝利 // VICTORY ACQUIRED
                </span>
                <h4 className="font-cinzel text-2xl font-bold text-washi-light tracking-wider mb-2">
                  SHADOW DEFEATED
                </h4>
                <p className="font-sans text-xs text-washi-light/70 mb-5 font-light">
                  Your blade moves with flawless precision. Deflection window mastered.
                </p>
                <button
                  onClick={startGame}
                  className="min-h-[44px] px-6 py-2.5 bg-samurai-gold hover:bg-samurai-gold-bright text-sumi-black font-cinzel text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-samurai-gold"
                >
                  Rematch Ninja <RotateCcw size={14} />
                </button>
              </>
            )}

            {gameState === "defeat" && (
              <>
                <span className="font-shippori text-xs text-samurai-red font-bold tracking-widest uppercase mb-1">
                  敗北 // SHADOW OVERWHELMED
                </span>
                <h4 className="font-cinzel text-2xl font-bold text-washi-light tracking-wider mb-2">
                  YOU FELL IN COMBAT
                </h4>
                <p className="font-sans text-xs text-washi-light/70 mb-5 font-light">
                  Time your blocks with <strong className="text-samurai-gold font-semibold">S / DOWN</strong> right as the ninja slashes to deflect.
                </p>
                <button
                  onClick={startGame}
                  className="min-h-[44px] px-6 py-2.5 bg-samurai-red hover:bg-[#a8201a] text-washi-light font-cinzel text-xs font-bold tracking-widest uppercase rounded shadow-lg transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-samurai-gold"
                >
                  Try Again <RotateCcw size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-washi-light/50 font-mono">
        <span>[A/D] MOVE</span>
        <span>•</span>
        <span>[S/DOWN] DEFLECT BLOCK</span>
        <span>•</span>
        <span>[SPACE] SLASH</span>
      </div>
    </div>
  );
});
