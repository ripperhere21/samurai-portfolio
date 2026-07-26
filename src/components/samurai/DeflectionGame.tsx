"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Swords } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number; // 0 to 1
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
  direction: number; // -1 = left, 1 = right
  cooldown: number; // frame countdowns
  animTimer: number;
}

interface DeflectionGameProps {
  audio: any;
}

export function DeflectionGame({ audio }: DeflectionGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [gameState, setGameState] = useState<"idle" | "playing" | "victory" | "defeat">("idle");
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);

  // Keyboard state
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Game entities refs
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

  // Visual effects
  const particlesRef = useRef<Particle[]>([]);
  const slashTrailRef = useRef<{ x: number; y: number; direction: number; life: number } | null>(null);
  const screenFlashRef = useRef<string | null>(null);

  // Play sound synthesis helper
  const playDeflectClash = () => {
    if (audio.isMuted) return;
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
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);

      setTimeout(() => {
        if (ctx.state !== "closed") ctx.close().catch(() => {});
      }, 700);
    } catch (e) {}
  };

  const playHitSlice = () => {
    if (audio.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Low pitch slice swoop noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      setTimeout(() => {
        if (ctx.state !== "closed") ctx.close().catch(() => {});
      }, 300);
    } catch (e) {}
  };

  const spawnSparks = (x: number, y: number, color = "#bfa15f") => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 1 + Math.random() * 2,
        color,
        alpha: 1,
        life: 1.0,
      });
    }
  };

  const spawnInkSplatter = (x: number, y: number) => {
    for (let i = 0; i < 15; i++) {
      const angle = Math.PI + Math.random() * Math.PI; // Fly upwards and out
      const speed = 1.5 + Math.random() * 2.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: "#1c120c", // dark ink/blood splatter
        alpha: 0.9,
        life: 1.0,
      });
    }
  };

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      
      if (gameState === "playing") {
        if (e.code === "Space") {
          e.preventDefault();
          triggerPlayerAttack();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  const triggerPlayerAttack = () => {
    const p = playerRef.current;
    if (p.state !== "attack" && p.state !== "hit" && p.state !== "dead") {
      p.state = "attack";
      p.cooldown = 24; // 24 frames of attack duration
      audio.playSwordSlice(); // slice sound effect
      slashTrailRef.current = {
        x: p.x + p.direction * 30,
        y: p.y - p.height / 2,
        direction: p.direction,
        life: 1.0,
      };
    }
  };

  const startGame = () => {
    audio.playSwordSlice();
    
    // Reset player
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

    // Reset enemy
    enemyRef.current = {
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
    };

    particlesRef.current = [];
    slashTrailRef.current = null;
    setPlayerHP(100);
    setEnemyHP(100);
    setGameState("playing");
  };

  // Main game logic loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId: number;

    // Background sakura petals
    const sakuraList: { x: number; y: number; size: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < 15; i++) {
      sakuraList.push({
        x: Math.random() * 384,
        y: Math.random() * 192,
        size: 1.5 + Math.random() * 2,
        vx: -0.5 - Math.random() * 0.8,
        vy: 0.3 + Math.random() * 0.5,
      });
    }

    const tick = () => {
      const p = playerRef.current;
      const e = enemyRef.current;

      // 1. Process countdowns
      if (p.cooldown > 0) p.cooldown--;
      if (e.cooldown > 0) e.cooldown--;

      // 2. Handle player state transitions from keys
      if (p.state !== "dead") {
        if (p.state === "attack") {
          p.vx = p.direction * 0.5; // step forward during swing
          if (p.cooldown === 0) {
            p.state = "idle";
          }
          // Strike impact check at middle of swing
          if (p.cooldown === 12) {
            checkHitDetection(p, e);
          }
        } else if (p.state === "hit") {
          p.vx = -p.direction * 0.8; // stagger backwards
          if (p.cooldown === 0) {
            p.state = "idle";
          }
        } else {
          // Block / Guard
          if (keysPressed.current["KeyS"] || keysPressed.current["ArrowDown"]) {
            p.state = "block";
            p.vx = 0;
          } 
          // Move Left
          else if (keysPressed.current["KeyA"] || keysPressed.current["ArrowLeft"]) {
            p.state = "run";
            p.vx = -2.2;
            p.direction = -1;
          } 
          // Move Right
          else if (keysPressed.current["KeyD"] || keysPressed.current["ArrowRight"]) {
            p.state = "run";
            p.vx = 2.2;
            p.direction = 1;
          } 
          // Idle
          else {
            p.state = "idle";
            p.vx = 0;
          }
        }
      }

      // 3. Enemy AI state machine
      if (e.state !== "dead") {
        const dist = Math.abs(p.x - e.x);
        
        if (e.state === "attack") {
          e.vx = e.direction * 0.5;
          if (e.cooldown === 0) {
            e.state = "idle";
          }
          if (e.cooldown === 12) {
            checkHitDetection(e, p);
          }
        } else if (e.state === "hit") {
          e.vx = -e.direction * 0.8;
          if (e.cooldown === 0) {
            e.state = "idle";
          }
        } else {
          e.direction = p.x > e.x ? 1 : -1;

          // AI decision tree
          if (dist > 75) {
            // Chase player
            e.state = "run";
            e.vx = e.direction * 1.6;
          } else {
            // Close quarters
            e.vx = 0;
            
            // Decides to attack, block, or idle
            if (e.cooldown <= 0) {
              const rand = Math.random();
              if (p.state === "attack" && Math.random() < 0.45) {
                // Guard/Deflect incoming
                e.state = "block";
                e.cooldown = 15;
              } else if (rand < 0.08) {
                // Slashing Strike
                e.state = "attack";
                e.cooldown = 24;
                slashTrailRef.current = {
                  x: e.x + e.direction * 30,
                  y: e.y - e.height / 2,
                  direction: e.direction,
                  life: 1.0,
                };
              } else {
                e.state = "idle";
              }
            }
          }
        }
      }

      // 4. Physics: Apply velocity and keep in bounds
      p.x += p.vx;
      e.x += e.vx;

      // Keep inside screen boundaries
      p.x = Math.max(20, Math.min(364, p.x));
      e.x = Math.max(20, Math.min(364, e.x));

      // Push characters away if colliding (avoid overlapping)
      if (Math.abs(p.x - e.x) < 22 && p.state !== "dead" && e.state !== "dead") {
        const overlap = 22 - Math.abs(p.x - e.x);
        const pushDir = p.x < e.x ? -1 : 1;
        p.x += pushDir * (overlap / 2);
        e.x -= pushDir * (overlap / 2);
      }

      // Increment anim timers
      p.animTimer += 0.15;
      e.animTimer += 0.15;

      // 5. Draw Frame
      renderGameFrame(sakuraList);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const checkHitDetection = (attacker: Character, defender: Character) => {
    if (defender.state === "dead") return;

    const hitRange = 68;
    const dist = Math.abs(attacker.x - defender.x);

    if (dist <= hitRange) {
      const midPointX = (attacker.x + defender.x) / 2;
      const midPointY = attacker.y - attacker.height / 2;

      // Case 1: Defended / Blocked
      if (defender.state === "block") {
        playDeflectClash();
        spawnSparks(midPointX, midPointY, "#bfa15f"); // Gold deflection sparks
        
        // Posture damage
        defender.posture = Math.min(100, defender.posture + 15);
        if (defender.posture >= 100) {
          // Break posture (stagger)
          defender.state = "hit";
          defender.cooldown = 45; // long stagger duration
          defender.posture = 0;
          audio.playKoto(0); // broken koto string noise
        } else {
          // Push back
          defender.x += attacker.direction * 10;
        }
      } 
      // Case 2: Hit connects
      else {
        playHitSlice();
        spawnInkSplatter(midPointX, midPointY);
        screenFlashRef.current = attacker === playerRef.current ? "rgba(18, 17, 16, 0.05)" : "rgba(141, 28, 29, 0.08)";
        setTimeout(() => { screenFlashRef.current = null; }, 120);

        defender.health = Math.max(0, defender.health - 22);
        defender.state = "hit";
        defender.cooldown = 18; // hit stagger duration
        defender.x += attacker.direction * 18; // strong knockback

        // Update react state for health bars
        if (defender === enemyRef.current) {
          setEnemyHP(defender.health);
          if (defender.health <= 0) {
            defender.state = "dead";
            defender.vx = 0;
            audio.playKoto(4); // victorious chord
            setTimeout(() => setGameState("victory"), 1000);
          }
        } else {
          setPlayerHP(defender.health);
          if (defender.health <= 0) {
            defender.state = "dead";
            defender.vx = 0;
            audio.playKoto(0); // low somber string pluck
            setTimeout(() => setGameState("defeat"), 1000);
          }
        }
      }
    }
  };

  const renderGameFrame = (sakuraList: { x: number; y: number; size: number; vx: number; vy: number }[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw setting sun background (classic samurai motif)
    ctx.beginPath();
    const sunGrad = ctx.createRadialGradient(w/2, h/2 + 25, 5, w/2, h/2 + 25, 55);
    sunGrad.addColorStop(0, "rgba(141, 28, 29, 0.3)"); // Red
    sunGrad.addColorStop(1, "rgba(235, 220, 185, 0)"); // Fades into paper parchment
    ctx.fillStyle = sunGrad;
    ctx.arc(w/2, h/2 + 25, 55, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw far-off mountains silhouettes
    ctx.beginPath();
    ctx.fillStyle = "rgba(44, 26, 17, 0.04)";
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.15, h - 35);
    ctx.lineTo(w * 0.35, h - 18);
    ctx.lineTo(w * 0.55, h - 45);
    ctx.lineTo(w * 0.8, h - 25);
    ctx.lineTo(w, h);
    ctx.fill();

    // 3. Draw falling sakura cherry blossom petals
    ctx.fillStyle = "rgba(141, 28, 29, 0.15)";
    sakuraList.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.y > h - 40) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw Floor line / Ground
    ctx.beginPath();
    ctx.strokeStyle = "rgba(44, 26, 17, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.moveTo(10, 155);
    ctx.lineTo(w - 10, 155);
    ctx.stroke();

    // Draw little procedural grass tufts
    ctx.strokeStyle = "rgba(44, 26, 17, 0.15)";
    ctx.lineWidth = 1;
    for (let gx = 30; gx < w; gx += 45) {
      ctx.beginPath();
      ctx.moveTo(gx, 155);
      ctx.lineTo(gx - 2, 150);
      ctx.moveTo(gx, 155);
      ctx.lineTo(gx + 3, 148);
      ctx.stroke();
    }

    // 5. Draw Characters silhouettes
    drawSilhouette(ctx, playerRef.current, "player");
    drawSilhouette(ctx, enemyRef.current, "enemy");

    // 6. Draw sword slash trail effect
    if (slashTrailRef.current) {
      const t = slashTrailRef.current;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(247, 243, 232, 0.7)";
      ctx.lineWidth = 4;
      ctx.globalAlpha = t.life;
      
      const arcStartX = t.x - t.direction * 15;
      const arcEndX = t.x + t.direction * 35;
      
      ctx.moveTo(arcStartX, t.y + 15);
      ctx.quadraticCurveTo(t.x, t.y - 10, arcEndX, t.y + 15);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      t.life -= 0.15;
      if (t.life <= 0) slashTrailRef.current = null;
    }

    // 7. Draw particle systems (sparks, ink splatters)
    particlesRef.current.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.life -= 0.04;
      p.alpha = Math.max(0, p.life);

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) {
        particlesRef.current.splice(idx, 1);
      }
    });
    ctx.globalAlpha = 1.0;

    // 8. Screen flash damage overlays
    if (screenFlashRef.current) {
      ctx.fillStyle = screenFlashRef.current;
      ctx.fillRect(0, 0, w, h);
    }
  };

  const drawSilhouette = (ctx: CanvasRenderingContext2D, char: Character, role: "player" | "enemy") => {
    ctx.save();
    ctx.fillStyle = "#161514"; // Solid black silhouette
    ctx.strokeStyle = "#161514";
    ctx.lineWidth = 3;

    const baseOffset = char.direction;
    const isAttack = char.state === "attack";
    const isBlock = char.state === "block";
    const isRunning = char.state === "run";
    const isHit = char.state === "hit";
    const isDead = char.state === "dead";

    // Handle dead posture
    if (isDead) {
      ctx.translate(char.x, char.y);
      ctx.rotate(role === "player" ? -Math.PI / 2 : Math.PI / 2);
      // Draw flat body
      ctx.beginPath();
      ctx.arc(0, -10, 6, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(-3, 0, 6, 35); // Body
      ctx.restore();
      return;
    }

    // Standard standing pose variables
    let headY = char.y - 45;
    let bodyY = char.y - 40;
    
    // Bounce animation when running
    const runCycle = Math.sin(char.animTimer * 2.2);
    if (isRunning) {
      headY += Math.abs(runCycle) * 2;
      bodyY += Math.abs(runCycle) * 2;
    }
    
    // Crouch when blocking
    if (isBlock) {
      headY += 6;
      bodyY += 5;
    }

    // 1. Draw legs
    ctx.beginPath();
    ctx.lineWidth = 4.5;
    if (isRunning) {
      // Front leg
      ctx.moveTo(char.x, char.y - 15);
      ctx.lineTo(char.x + baseOffset * 10 * runCycle, char.y);
      // Back leg
      ctx.moveTo(char.x, char.y - 15);
      ctx.lineTo(char.x - baseOffset * 10 * runCycle, char.y);
    } else if (isBlock) {
      // Bent knees defense stance
      ctx.moveTo(char.x, char.y - 10);
      ctx.lineTo(char.x - 6, char.y - 4);
      ctx.lineTo(char.x - 8, char.y);
      
      ctx.moveTo(char.x, char.y - 10);
      ctx.lineTo(char.x + 8, char.y - 4);
      ctx.lineTo(char.x + 10, char.y);
    } else if (isHit) {
      // Stagger leg placement
      ctx.moveTo(char.x, char.y - 15);
      ctx.lineTo(char.x - baseOffset * 12, char.y);
      
      ctx.moveTo(char.x, char.y - 15);
      ctx.lineTo(char.x + baseOffset * 4, char.y);
    } else {
      // Idle straight stance
      ctx.moveTo(char.x - 4, char.y - 15);
      ctx.lineTo(char.x - 5, char.y);
      
      ctx.moveTo(char.x + 4, char.y - 15);
      ctx.lineTo(char.x + 5, char.y);
    }
    ctx.stroke();

    // 2. Draw Torso / Kimono
    ctx.beginPath();
    ctx.moveTo(char.x - 6, bodyY);
    ctx.lineTo(char.x + 6, bodyY);
    ctx.lineTo(char.x + 8, char.y - 15);
    ctx.lineTo(char.x - 8, char.y - 15);
    ctx.closePath();
    ctx.fill();

    // 3. Draw Head
    ctx.beginPath();
    ctx.arc(char.x, headY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Decorative head accessories
    if (role === "player") {
      // Red samurai ribbon flying backward
      ctx.beginPath();
      ctx.strokeStyle = "#8d1c1d"; // Crimson Red
      ctx.lineWidth = 1.5;
      ctx.moveTo(char.x - baseOffset * 5, headY + 1);
      ctx.quadraticCurveTo(
        char.x - baseOffset * 12,
        headY - 3 + Math.sin(char.animTimer) * 2,
        char.x - baseOffset * 18,
        headY + Math.cos(char.animTimer) * 2
      );
      ctx.stroke();
    } else {
      // Straw conical hat (kasa) silhouette on enemy
      ctx.beginPath();
      ctx.moveTo(char.x - 12, headY - 1);
      ctx.lineTo(char.x, headY - 8);
      ctx.lineTo(char.x + 12, headY - 1);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Draw Arms & Weapons
    ctx.lineWidth = 3.5;
    ctx.beginPath();

    if (isAttack) {
      // Swing katana forward
      const attackPhase = char.cooldown;
      
      // Arm slash arc
      ctx.moveTo(char.x, bodyY + 6);
      
      let armX = char.x + baseOffset * 14;
      let armY = bodyY;
      let swordEndX = char.x + baseOffset * 36;
      let swordEndY = bodyY - 10;
      
      if (attackPhase > 12) {
        // winding back
        armX = char.x - baseOffset * 8;
        armY = bodyY - 16;
        swordEndX = char.x - baseOffset * 22;
        swordEndY = bodyY - 26;
      } else {
        // slashing release
        armX = char.x + baseOffset * 18;
        armY = bodyY + 12;
        swordEndX = char.x + baseOffset * 40;
        swordEndY = bodyY + 15;
      }
      
      ctx.lineTo(armX, armY);
      ctx.stroke();

      // Sword katana blade (silver grey stroke)
      ctx.beginPath();
      ctx.strokeStyle = "#8c8782"; // steel silver
      ctx.lineWidth = 2;
      ctx.moveTo(armX, armY);
      ctx.lineTo(swordEndX, swordEndY);
      ctx.stroke();
      
      // Gold sword guard hilt
      ctx.beginPath();
      ctx.strokeStyle = "#bfa15f"; // gold hilt guard
      ctx.lineWidth = 3;
      const hx = armX + baseOffset * 3;
      const hy = armY + (swordEndY - armY) * 0.15;
      ctx.moveTo(hx - 2, hy + 2);
      ctx.lineTo(hx + 2, hy - 2);
      ctx.stroke();
    } else if (isBlock) {
      // Guard stance holding sword vertically
      ctx.moveTo(char.x, bodyY + 8);
      ctx.lineTo(char.x + baseOffset * 8, bodyY - 6);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "#8c8782";
      ctx.lineWidth = 2;
      ctx.moveTo(char.x + baseOffset * 8, bodyY - 6);
      ctx.lineTo(char.x + baseOffset * 12, bodyY - 32); // Raised blade
      ctx.stroke();
    } else if (isHit) {
      // Flinching recoil pose
      ctx.moveTo(char.x, bodyY + 8);
      ctx.lineTo(char.x - baseOffset * 8, bodyY + 18);
      ctx.stroke();
    } else if (isRunning) {
      // Arm movement when running
      ctx.moveTo(char.x, bodyY + 6);
      ctx.lineTo(char.x + baseOffset * 10 * runCycle, bodyY + 14);
      ctx.stroke();
    } else {
      // Relaxed idle stance, hand resting on sheathed sword
      ctx.moveTo(char.x, bodyY + 6);
      ctx.lineTo(char.x - baseOffset * 4, bodyY + 18);
      ctx.stroke();

      // Sheathed katana outline on hip
      ctx.beginPath();
      ctx.strokeStyle = "rgba(44, 26, 17, 0.4)";
      ctx.lineWidth = 1.8;
      ctx.moveTo(char.x - baseOffset * 4, bodyY + 10);
      ctx.lineTo(char.x - baseOffset * 18, bodyY + 24);
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#f2e9d2] text-[#2c1a11] rounded border border-cedar-brown/30 p-6 md:p-8 mt-6 relative shadow-md overflow-hidden select-none">
      
      {/* Torii Gate Outline watermark */}
      <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none text-samurai-red">
        <svg viewBox="0 0 100 80" className="w-24 h-20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 20 Q50 15 90 20 M15 32 L85 32 M35 32 L35 75 M65 32 L65 75" />
        </svg>
      </div>

      {/* Header */}
      <div className="w-full border-b border-cedar-brown/15 pb-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-cinzel text-base md:text-lg font-bold tracking-widest text-[#1e120c] flex items-center gap-2 justify-center md:justify-start">
            <Swords size={16} className="text-samurai-red" />
            Sekiro's Shadow // Duel Simulator
          </h4>
          <p className="font-sans text-[10px] text-[#3d2619]/65 tracking-wider mt-1 text-center md:text-left">
            A/D or ARROWS: Move | S or DOWN: Block | SPACE or CLICK: Slash sword. Defeat the ninja shadow to acquire mastery.
          </p>
        </div>
        
        {/* Status bars */}
        <div className="flex gap-6 text-xs font-shippori font-bold">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-cedar-brown/50 tracking-widest uppercase">Samurai (HP)</span>
            <div className="w-24 h-2 bg-[#d7cdb7] border border-[#2c1a11]/20 mt-1 relative rounded-sm">
              <div 
                className="h-full bg-samurai-red transition-all duration-100" 
                style={{ width: `${playerHP}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-cedar-brown/50 tracking-widest uppercase">Ninja (HP)</span>
            <div className="w-24 h-2 bg-[#d7cdb7] border border-[#2c1a11]/20 mt-1 relative rounded-sm">
              <div 
                className="h-full bg-[#1c120c] transition-all duration-100" 
                style={{ width: `${enemyHP}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Screen */}
      <div className="relative w-full max-w-lg h-56 bg-[#ebdcb9] border border-cedar-brown/20 rounded shadow-inner flex items-center justify-center overflow-hidden">
        
        <canvas
          ref={(el) => {
            canvasRef.current = el;
            if (el) {
              const ctx = el.getContext("2d");
              if (ctx && el.width === 300) {
                // scale canvas for retina display
                el.width = 448 * window.devicePixelRatio;
                el.height = 224 * window.devicePixelRatio;
                el.style.width = "448px";
                el.style.height = "224px";
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
              }
            }
          }}
          className="absolute inset-0 cursor-pointer"
          onClick={triggerPlayerAttack}
        />

        {/* HUD/Overlay states */}
        {gameState === "idle" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#ebdcb9]/85 p-4 text-center">
            <p className="font-serif text-xs md:text-sm text-cedar-brown max-w-xs leading-relaxed mb-4">
              "Mastery of the sword is forged in the shadows of combat. Duel the phantom rival and test your reflex."
            </p>
            <button
              onClick={startGame}
              onMouseEnter={() => audio.playWoodStrike()}
              className="flex items-center gap-2 px-4 py-2 bg-samurai-red hover:bg-[#6d1314] text-washi-light text-xs font-bold tracking-widest uppercase shadow-md rounded-sm transition-colors"
            >
              <Play size={12} fill="currentColor" />
              Draw Blade (Fight)
            </button>
          </div>
        )}

        {gameState === "defeat" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-samurai-red/10 p-4 text-center backdrop-blur-[2px]">
            <span className="font-shippori text-3xl font-extrabold text-samurai-red select-none mb-1 tracking-widest animate-pulse">
              討死
            </span>
            <span className="font-cinzel text-xs font-bold tracking-widest text-samurai-red uppercase mb-4">
              DEFEAT: FALLEN IN BATTLE
            </span>
            <button
              onClick={startGame}
              onMouseEnter={() => audio.playWoodStrike()}
              className="flex items-center gap-2 px-4 py-2 bg-[#2c1a11] hover:bg-[#1c120c] text-washi-light text-xs font-bold tracking-widest uppercase shadow-md rounded-sm transition-colors"
            >
              <RotateCcw size={12} />
              Reclaim Honour (Retry)
            </button>
          </div>
        )}

        {gameState === "victory" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#f5efe0]/90 p-4 text-center backdrop-blur-[2px]">
            <span className="font-shippori text-3xl font-extrabold text-samurai-gold select-none mb-1 tracking-widest animate-bounce">
              極め
            </span>
            <span className="font-cinzel text-xs font-bold tracking-widest text-[#2c1a11] uppercase mb-4">
              VICTORY: SHADOW SLAYER ACQUIRED
            </span>
            <button
              onClick={startGame}
              onMouseEnter={() => audio.playWoodStrike()}
              className="flex items-center gap-2 px-4 py-2 border border-cedar-brown text-cedar-brown hover:bg-cedar-brown/5 text-xs font-bold tracking-widest uppercase rounded-sm transition-all"
            >
              <RotateCcw size={12} />
              Fight Again
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls instructions */}
      <div className="w-full flex flex-col items-center mt-6 gap-2">
        <span className="font-sans text-[9px] text-cedar-brown/40 uppercase tracking-widest mt-1">
          - 2D Silhouette Vector Skeletal Physics Match -
        </span>
      </div>
    </div>
  );
}
