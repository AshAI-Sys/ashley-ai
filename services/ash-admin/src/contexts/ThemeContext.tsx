"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: EffectiveTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("ashley-ai-theme") as Theme | null;

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
      setThemeState(savedTheme);
    } else {
      // Default to light mode
      setThemeState("light");
    }
  }, []);

  // Calculate effective theme and apply to document
  useEffect(() => {
    if (!mounted) return;

    let effective: EffectiveTheme = "light";

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effective = prefersDark ? "dark" : "light";
    } else {
      effective = theme as EffectiveTheme;
    }

    setEffectiveTheme(effective);

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effective);
    root.style.colorScheme = effective;

    // Save to localStorage
    localStorage.setItem("ashley-ai-theme", theme);
    localStorage.setItem("ash_theme", effective); // For compatibility
  }, [theme, mounted]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const effective = mediaQuery.matches ? "dark" : "light";
      setEffectiveTheme(effective);
      document.documentElement.classList.toggle("dark", mediaQuery.matches);
      document.documentElement.style.colorScheme = effective;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      return "light"; // system -> light
    });
  };

  // Always provide context, even when not mounted (prevents "useTheme must be used within ThemeProvider" errors)
  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
