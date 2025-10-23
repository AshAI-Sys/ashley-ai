"use client";

import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  // Show a static button during SSR/hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative w-9 px-0 hover:bg-accent/10 transition-colors"
          aria-label="Toggle theme"
        >
          <div className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 px-0 hover:bg-accent/10 transition-colors"
        aria-label="Toggle theme"
      >
        {/* Sun icon for light mode */}
        <Sun
          className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            effectiveTheme === "dark"
              ? "rotate-90 scale-0"
              : "rotate-0 scale-100"
          }`}
        />
        {/* Moon icon for dark mode */}
        <Moon
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            effectiveTheme === "dark"
              ? "rotate-0 scale-100"
              : "-rotate-90 scale-0"
          }`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-lg z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto text-primary font-semibold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
