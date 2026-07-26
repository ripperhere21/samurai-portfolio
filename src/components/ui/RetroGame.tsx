"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, Award } from "lucide-react";

interface Laser {
  x: number;
  y: number;
  speed: number;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Alien {
  x: number;
  y: number;
  speed: number;
  width: number;
}

export function RetroGame({
  playClick,
  onUnlockStar
}: {
  playClick: (freq?: number, type?: OscillatorType, duration?: number) => void;
  onUnlockStar: (starIdx: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover" | "win">("idle");
  const [score, setScore] = useState(0);
  const [shields, setShields] = useState(3);
  
  // Game loop values in refs to avoid React delay issues
  const keys = useRef<{ [key: string]: boolean }>({});
  const playerX = useRef(200);
  const lasers = useRef<Laser[]>([]);
  const asteroids = useRef<Asteroid[]>([]);
  const aliens = useRef<Alien[]>([]);
  const lastShot = useRef(0);
  const lastAsteroidSpawn = useRef(0);
  const lastAlienSpawn = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // Setup keys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling when playing the mini-game
      if (["ArrowLeft", "ArrowRight", "Space", " "].includes(e.key)) {
        e.preventDefault();
      }
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const startGame = () => {
    playClick(600, "triangle", 0.2);
    setGameState("playing");
    setScore(0);
    setShields(3);
    playerX.current = 200;
    lasers.current = [];
    asteroids.current = [];
    aliens.current = [];
    lastShot.current = 0;
    lastAsteroidSpawn.current = Date.now();
    lastAlienSpawn.current = Date.now();
  };

  // Main Canvas drawing and logic loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const now = Date.now();

      // Clear canvas
      ctx.fillStyle = "#02020a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw starry space background grid in game
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Handle player keys: moves playerX.current left/right
      if (keys.current["ArrowLeft"] || keys.current["a"] || keys.current["A"]) {
        playerX.current = Math.max(20, playerX.current - 5);
      }
      if (keys.current["ArrowRight"] || keys.current["d"] || keys.current["D"]) {
        playerX.current = Math.min(canvas.width - 20, playerX.current + 5);
      }

      // Shooting lasers
      if ((keys.current["Spacebar"] || keys.current[" "] || keys.current["ArrowUp"]) && now - lastShot.current > 250) {
        playClick(1100, "sine", 0.08); // laser shoot noise
        lasers.current.push({
          x: playerX.current,
          y: canvas.height - 35,
          speed: 7
        });
        lastShot.current = now;
      }

      // Spawn asteroid
      if (now - lastAsteroidSpawn.current > 1200) {
        asteroids.current.push({
          x: Math.random() * (canvas.width - 30) + 15,
          y: -10,
          size: Math.random() * 15 + 10,
          speed: Math.random() * 1.5 + 1.2
        });
        lastAsteroidSpawn.current = now;
      }

      // Spawn alien
      if (now - lastAlienSpawn.current > 3000) {
        aliens.current.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          speed: Math.random() * 1.0 + 1.5,
          width: 25
        });
        lastAlienSpawn.current = now;
      }

      // Draw player spaceship
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.moveTo(playerX.current, canvas.height - 35);
      ctx.lineTo(playerX.current - 15, canvas.height - 15);
      ctx.lineTo(playerX.current + 15, canvas.height - 15);
      ctx.closePath();
      ctx.fill();

      // Spaceship thruster flame
      ctx.fillStyle = Math.random() > 0.5 ? "#ff007f" : "#ffd700";
      ctx.beginPath();
      ctx.moveTo(playerX.current - 5, canvas.height - 14);
      ctx.lineTo(playerX.current + 5, canvas.height - 14);
      ctx.lineTo(playerX.current, canvas.height - 5);
      ctx.closePath();
      ctx.fill();

      const lasersToRemove = new Set<number>();
      const asteroidsToRemove = new Set<number>();
      const aliensToRemove = new Set<number>();

      // Update & Draw Lasers
      lasers.current.forEach((las, lIdx) => {
        las.y -= las.speed;
        
        ctx.fillStyle = "#ff007f";
        ctx.shadowColor = "#ff007f";
        ctx.shadowBlur = 8;
        ctx.fillRect(las.x - 1.5, las.y, 3, 10);
        ctx.shadowBlur = 0; // reset shadow
        
        if (las.y < 0) {
          lasersToRemove.add(lIdx);
        }
      });

      // Update & Draw Asteroids
      asteroids.current.forEach((ast, aIdx) => {
        ast.y += ast.speed;

        ctx.fillStyle = "#475569";
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Check laser collision
        lasers.current.forEach((las, lIdx) => {
          if (lasersToRemove.has(lIdx) || asteroidsToRemove.has(aIdx)) return;
          const dist = Math.hypot(las.x - ast.x, las.y - ast.y);
          if (dist < ast.size + 3) {
            playClick(200, "sawtooth", 0.15); // explosion noise
            lasersToRemove.add(lIdx);
            asteroidsToRemove.add(aIdx);
            setScore((s) => {
              const next = s + 10;
              if (next >= 150) {
                setGameState("win");
                onUnlockStar(3); // Unlock 4th Achievement star
              }
              return next;
            });
          }
        });

        // Check player collision
        if (!asteroidsToRemove.has(aIdx) && Math.hypot(playerX.current - ast.x, (canvas.height - 25) - ast.y) < ast.size + 15) {
          playClick(100, "sawtooth", 0.4); // heavy damage rumble
          asteroidsToRemove.add(aIdx);
          setShields((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameState("gameover");
            }
            return next;
          });
        }

        if (ast.y > canvas.height + 20) {
          asteroidsToRemove.add(aIdx);
        }
      });

      // Update & Draw Alien ships
      aliens.current.forEach((alien, alIdx) => {
        alien.y += alien.speed;

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(alien.x, alien.y + 15);
        ctx.lineTo(alien.x - 12, alien.y - 5);
        ctx.lineTo(alien.x + 12, alien.y - 5);
        ctx.closePath();
        ctx.fill();

        // Glowing scanning core
        ctx.fillStyle = "#ff007f";
        ctx.beginPath();
        ctx.arc(alien.x, alien.y + 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Check laser collision
        lasers.current.forEach((las, lIdx) => {
          if (lasersToRemove.has(lIdx) || aliensToRemove.has(alIdx)) return;
          const dist = Math.hypot(las.x - alien.x, las.y - (alien.y + 5));
          if (dist < 15) {
            playClick(300, "sawtooth", 0.12);
            lasersToRemove.add(lIdx);
            aliensToRemove.add(alIdx);
            setScore((s) => {
              const next = s + 15;
              if (next >= 150) {
                setGameState("win");
                onUnlockStar(3); // Unlock 4th Achievement star
              }
              return next;
            });
          }
        });

        // Check player collision
        if (!aliensToRemove.has(alIdx) && Math.hypot(playerX.current - alien.x, (canvas.height - 25) - alien.y) < 20) {
          playClick(100, "sawtooth", 0.4);
          aliensToRemove.add(alIdx);
          setShields((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameState("gameover");
            }
            return next;
          });
        }

        if (alien.y > canvas.height + 20) {
          aliensToRemove.add(alIdx);
        }
      });

      // Filter out destroyed/out-of-bounds entities
      lasers.current = lasers.current.filter((_, idx) => !lasersToRemove.has(idx));
      asteroids.current = asteroids.current.filter((_, idx) => !asteroidsToRemove.has(idx));
      aliens.current = aliens.current.filter((_, idx) => !aliensToRemove.has(idx));

      // Continue game loop
      if (gameState === "playing") {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState]);

  return (
    <div className="flex flex-col items-center gap-4 bg-zinc-950/80 p-4 rounded-md border border-red-500/20 font-share w-full max-w-md mx-auto">
      {/* Title */}
      <div className="flex justify-between items-center w-full border-b border-zinc-800 pb-2">
        <span className="text-xs text-red-500 font-bold uppercase tracking-wider">
          SIMULATOR: STARFALL DEFENDER
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span>SCORE: <strong className="text-white text-shadow-glow">{score} / 150</strong></span>
          <span className="text-red-500 font-bold">SHIELDS: {Array.from({ length: shields }).map((_, i) => "◆ ")}</span>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden border border-zinc-800 bg-[#02020a]">
        
        {/* Game Area Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full block"
        />

        {/* HUD Overlay menu panel depending on state */}
        {gameState === "idle" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center gap-3">
            <h3 className="text-sm font-bold text-[#00e5ff] tracking-widest font-orbitron text-shadow-glow uppercase">
              Vessel Cockpit Override
            </h3>
            <p className="text-[11px] text-zinc-400 max-w-[280px]">
              Defend the ship. Destroy drifting asteroids and alien fighters to reach <strong className="text-amber-400">150 points</strong> and unlock the secret star achievement.
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
              [ A / D ] or [ ← / → ] to move<br />
              [ SPACEBAR ] to shoot lasers
            </p>
            <button
              onClick={startGame}
              className="mt-2 px-4 py-1.5 border border-cyan-glow bg-cyan-glow/15 hover:bg-cyan-glow/30 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-none"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              LAUNCH SIMULATION
            </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center gap-3">
            <h3 className="text-sm font-bold text-red-500 tracking-widest font-orbitron uppercase">
              SYSTEM OVERHEAT // DESTROYED
            </h3>
            <p className="text-[11px] text-zinc-400">
              Your fighter shields collapsed in the deep asteroids.
            </p>
            <span className="text-xs text-white">FINAL SCORE: {score}</span>
            <button
              onClick={startGame}
              className="mt-2 px-4 py-1.5 border border-red-500/50 bg-red-500/15 hover:bg-red-500/35 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              REBOOT SYSTEM
            </button>
          </div>
        )}

        {gameState === "win" && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center gap-3">
            <Award className="w-8 h-8 text-amber-400 animate-bounce" />
            <h3 className="text-sm font-bold text-amber-400 tracking-widest font-orbitron uppercase text-glow-gold">
              MISSION COMPLETED
            </h3>
            <p className="text-[11px] text-zinc-400">
              Asteroid swarm cleared! Star 4 has been retrieved and decrypted into your achievements logs.
            </p>
            <span className="text-xs text-[#00e5ff] font-bold">SCORE: {score} // STABILITY SECURED</span>
            <button
              onClick={startGame}
              className="mt-2 px-4 py-1.5 border border-amber-400 bg-amber-400/15 hover:bg-amber-400/30 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              SIMULATE AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
