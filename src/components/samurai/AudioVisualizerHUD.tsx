"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerHUDProps {
  getAnalyser: () => AnalyserNode | null;
  isMuted: boolean;
}

export function AudioVisualizerHUD({ getAnalyser, isMuted }: AudioVisualizerHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = getAnalyser();
    let dataArray = new Uint8Array(0);
    if (analyser) {
      analyser.fftSize = 32;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const draw = () => {
      const currentAnalyser = getAnalyser();
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Render 5 visualizer bars
      const numBars = 5;
      const barWidth = 3;
      const barGap = 2;
      const startX = (w - (numBars * barWidth + (numBars - 1) * barGap)) / 2;

      if (isMuted || !currentAnalyser) {
        // Draw flat quiet state line
        ctx.fillStyle = "rgba(191, 161, 95, 0.25)";
        for (let i = 0; i < numBars; i++) {
          const x = startX + i * (barWidth + barGap);
          ctx.fillRect(x, h - 2, barWidth, 2);
        }
      } else {
        // Get frequency data
        currentAnalyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#bfa15f"; // samurai-gold
        for (let i = 0; i < numBars; i++) {
          // Read from a subset of frequencies
          const freqValue = dataArray[i * 2] || 0;
          // Scale value to canvas height
          const barHeight = Math.max(2, (freqValue / 255) * h);
          const x = startX + i * (barWidth + barGap);
          const y = h - barHeight;

          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [getAnalyser, isMuted]);

  return (
    <canvas
      ref={canvasRef}
      width={24}
      height={14}
      className="opacity-75 transition-opacity duration-300 group-hover:opacity-100"
      style={{ width: "24px", height: "14px" }}
    />
  );
}
