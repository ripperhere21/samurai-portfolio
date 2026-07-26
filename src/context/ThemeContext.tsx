"use client";

import React, { createContext, useContext, useState } from "react";

export type ThemeType = "samurai";

interface ThemeContextProps {
  theme: ThemeType;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: ThemeType = "samurai";
  const [isMuted, setIsMuted] = useState<boolean>(true);

  return (
    <ThemeContext.Provider
      value={{
        theme,
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

