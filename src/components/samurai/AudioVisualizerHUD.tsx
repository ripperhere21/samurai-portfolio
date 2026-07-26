"use client";

import React, { useEffect, useRef, memo } from "react";

interface AudioVisualizerHUDProps {
  getAnalyser: () => AnalyserNode | null;
  isMuted: boolean;
}

export const AudioVisualizerHUD = memo(function AudioVisualizerHUD({
  getAnalyser,
  isMuted,
}: AudioVisualizerHUDProps) {
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

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const draw = () => {
      if (!isTabVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      const currentAnalyser = getAnalyser();
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const numBars = 5;
      const barWidth = 3;
      const barGap = 2;
      const startX = (w - (numBars * barWidth + (numBars - 1) * barGap)) / 2;

      if (isMuted || !currentAnalyser) {
        // Quiet static state line (drawn once)
        ctx.fillStyle = "rgba(191, 161, 95, 0.25)";
        for (let i = 0; i < numBars; i++) {
          const x = startX + i * (barWidth + barGap);
          ctx.fillRect(x, h - 2, barWidth, 2);
        }
      } else {
        currentAnalyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#bfa15f";
        for (let i = 0; i < numBars; i++) {
          const freqValue = dataArray[i * 2] || 0;
          const barHeight = Math.max(2, (freqValue / 255) * h);
          const x = startX + i * (barWidth + barGap);
          const y = h - barHeight;

          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      // If muted, throttle draw loop to save main thread cycles
      if (isMuted) {
        setTimeout(() => {
          animId = requestAnimationFrame(draw);
        }, 200);
      } else {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
});
