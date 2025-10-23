/**
 * Design System Configuration
 * Theme: Minimal Corporate (Soft Neutrals)
 *
 * This file contains the design tokens for the Ashley AI application.
 * Use these tokens consistently across all components.
 */

export const designSystem = {
  // Color Palette
  colors: {
    primary: '#2563EB',       // Calm Blue - primary actions, links
    accent: '#38BDF8',        // Sky Blue - highlights, hover states
    background: '#F8FAFC',    // Light Gray - page background
    sidebar: '#1E293B',       // Dark Slate - sidebar background
    text: '#0F172A',          // Almost Black - primary text
    textMuted: '#64748B',     // Slate - secondary text
    border: '#E2E8F0',        // Light Border - dividers, borders
    success: '#10B981',       // Green
    warning: '#F59E0B',       // Amber
    error: '#EF4444',         // Red
    info: '#3B82F6',          // Blue
  },

  // Typography
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Roboto Mono", "Courier New", monospace',
  },

  // Spacing Scale (in px)
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  // Border Radius
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px - modern cards
    full: '9999px',  // full round
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgba(37, 99, 235, 0.3)', // blue glow
  },

  // Animation Durations
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Breakpoints (for responsive design)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// CSS Custom Properties for dark mode support
export const cssVariables = {
  light: {
    '--color-primary': designSystem.colors.primary,
    '--color-accent': designSystem.colors.accent,
    '--color-background': designSystem.colors.background,
    '--color-sidebar': designSystem.colors.sidebar,
    '--color-text': designSystem.colors.text,
    '--color-text-muted': designSystem.colors.textMuted,
    '--color-border': designSystem.colors.border,
  },
  dark: {
    '--color-primary': '#60A5FA',       // Lighter blue for dark mode
    '--color-accent': '#7DD3FC',        // Lighter sky blue
    '--color-background': '#0F172A',    // Dark slate
    '--color-sidebar': '#1E293B',       // Darker slate
    '--color-text': '#F8FAFC',          // Almost white
    '--color-text-muted': '#94A3B8',    // Light slate
    '--color-border': '#334155',        // Slate border
  },
};

// Utility function to get color value
export const getColor = (colorName: keyof typeof designSystem.colors) => {
  return designSystem.colors[colorName];
};

// Utility function to get spacing value
export const getSpacing = (spacingName: keyof typeof designSystem.spacing) => {
  return designSystem.spacing[spacingName];
};

export default designSystem;
