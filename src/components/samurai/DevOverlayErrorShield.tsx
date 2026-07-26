"use client";

import { useEffect } from "react";

export function DevOverlayErrorShield() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return;

    // 1. Monkeypatch console.error to ignore React hydration warnings caused by extensions
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const msg = args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ");
      
      const isMutedMessage =
        msg.includes("Hydration failed") ||
        msg.includes("hydration-mismatch") ||
        msg.includes("translate-tooltip") ||
        msg.includes("translate") ||
        msg.includes("MetaMask") ||
        msg.includes("React Hydration");

      if (isMutedMessage) {
        console.warn("🛡️ Muted hydration/extension console error to prevent Next.js dev overlay popup:", msg);
        return;
      }
      
      originalConsoleError.apply(console, args);
    };

    // 2. Intercept uncaught script errors
    const handleError = (e: ErrorEvent) => {
      const message = e.message || "";
      const filename = e.filename || "";
      const stack = e.error?.stack || "";

      const isExtensionError =
        filename.startsWith("chrome-extension://") ||
        filename.includes("inpage.js") ||
        message.includes("MetaMask") ||
        message.includes("translate") ||
        message.includes("Hydration failed") ||
        stack.includes("chrome-extension://");

      if (isExtensionError) {
        e.stopImmediatePropagation();
        e.preventDefault();
        console.warn("🛡️ Muted third-party extension error to prevent dev overlay popup:", message);
      }
    };

    // 3. Intercept uncaught promise rejections
    const handleRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const message = reason?.message || String(reason);
      const stack = reason?.stack || "";

      const isExtensionError =
        message.includes("MetaMask") ||
        message.includes("translate") ||
        stack.includes("chrome-extension://");

      if (isExtensionError) {
        e.stopImmediatePropagation();
        e.preventDefault();
        console.warn("🛡️ Muted third-party extension promise rejection:", message);
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      // Restore console.error and remove listeners
      console.error = originalConsoleError;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}
