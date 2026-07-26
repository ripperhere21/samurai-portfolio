"use client";

import React, { createContext, useContext, useState } from "react";

export type ThemeType = "samurai" | "space";

interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  activeSector: string;
  setActiveSector: (sector: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("samurai");
  const [activeSector, setActiveSector] = useState<string>("intro");
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState("samurai");
    const lenis = (window as any).lenisInstance;
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        activeSector,
        setActiveSector,
        isMuted,
        setIsMuted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
