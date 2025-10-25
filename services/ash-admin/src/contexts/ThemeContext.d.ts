import React from "react";
type Theme = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";
interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveTheme: EffectiveTheme;
    toggleTheme: () => void;
}
export declare function ThemeProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useTheme(): ThemeContextType;
export {};
