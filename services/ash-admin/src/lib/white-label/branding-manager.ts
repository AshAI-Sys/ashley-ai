// White-Label Branding System
// Allows tenants to customize the application with their own branding

export interface BrandingConfig {
  workspace_id: string;

  // Company Information
  company_name: string;
  company_tagline?: string;
  company_website?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;

  // Visual Branding
  logo_url?: string;
  logo_light_url?: string; // For dark backgrounds
  logo_dark_url?: string; // For light backgrounds
  favicon_url?: string;

  // Color Scheme
  colors: {
    primary: string; // Main brand color
    secondary: string; // Secondary brand color
    accent: string; // Accent color for highlights
    success: string; // Success messages
    warning: string; // Warnings
    error: string; // Errors
    info: string; // Information
    background: string; // Page background
    surface: string; // Card/panel background
    text_primary: string; // Main text color
    text_secondary: string; // Secondary text color
  };

  // Typography
  typography: {
    font_family_heading: string;
    font_family_body: string;
    font_size_base: string;
    font_weight_normal: number;
    font_weight_medium: number;
    font_weight_bold: number;
  };

  // UI Customization
  ui: {
    border_radius: string; // e.g., '8px', '1rem'
    shadow_style: "none" | "subtle" | "normal" | "strong";
    button_style: "rounded" | "square" | "pill";
    layout_style: "compact" | "normal" | "spacious";
  };

  // Email Branding
  email: {
    header_color?: string;
    footer_text?: string;
    signature?: string;
  };

  // Custom Domain
  custom_domain?: string;

  // Feature Toggles (UI visibility)
  feature_visibility: {
    show_powered_by?: boolean;
    show_help_center?: boolean;
    show_community_link?: boolean;
    custom_footer_text?: string;
  };

  // Advanced
  custom_css?: string;
  custom_javascript?: string;
}

export class BrandingManager {
  private readonly DEFAULT_BRANDING: Omit<BrandingConfig, "workspace_id"> = {
    company_name: "Ashley AI",
    company_tagline: "Smart Manufacturing ERP",
    colors: {
      primary: "#4F46E5", // Indigo
      secondary: "#7C3AED", // Purple
      accent: "#EC4899", // Pink
      success: "#10B981", // Green
      warning: "#F59E0B", // Amber
      error: "#EF4444", // Red
      info: "#3B82F6", // Blue
      background: "#F9FAFB", // Gray 50
      surface: "#FFFFFF", // White
      text_primary: "#111827", // Gray 900
      text_secondary: "#6B7280", // Gray 500
    },
    typography: {
      font_family_heading: "'Inter', sans-serif",
      font_family_body: "'Inter', sans-serif",
      font_size_base: "16px",
      font_weight_normal: 400,
      font_weight_medium: 500,
      font_weight_bold: 700,
    },
    ui: {
      border_radius: "8px",
      shadow_style: "normal",
      button_style: "rounded",
      layout_style: "normal",
    },
    email: {
      header_color: "#4F46E5",
      footer_text: "© 2024 Ashley AI. All rights reserved.",
    },
    feature_visibility: {
      show_powered_by: true,
      show_help_center: true,
      show_community_link: true,
    },
  };

  // Get branding configuration for workspace
  async getBranding(workspace_id: string): Promise<BrandingConfig> {
    try {
      const { prisma } = await import("@/lib/db");

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspace_id },
      });

      if (!workspace || !workspace.settings) {
        return {
          workspace_id,
          ...this.DEFAULT_BRANDING,
        };
      }

      const settings = JSON.parse(workspace.settings);
      const branding = settings.branding || {};

      // Merge with defaults
      return {
        workspace_id,
        company_name: branding.company_name || workspace.name,
        company_tagline:
          branding.company_tagline || this.DEFAULT_BRANDING.company_tagline,
        company_website: branding.company_website,
        company_email: branding.company_email,
        company_phone: branding.company_phone,
        company_address: branding.company_address,
        logo_url: branding.logo_url,
        logo_light_url: branding.logo_light_url,
        logo_dark_url: branding.logo_dark_url,
        favicon_url: branding.favicon_url,
        colors: { ...this.DEFAULT_BRANDING.colors, ...branding.colors },
        typography: {
          ...this.DEFAULT_BRANDING.typography,
          ...branding.typography,
        },
        ui: { ...this.DEFAULT_BRANDING.ui, ...branding.ui },
        email: { ...this.DEFAULT_BRANDING.email, ...branding.email },
        custom_domain: branding.custom_domain,
        feature_visibility: {
          ...this.DEFAULT_BRANDING.feature_visibility,
          ...branding.feature_visibility,
        },
        custom_css: branding.custom_css,
        custom_javascript: branding.custom_javascript,
      };
    } catch (error: any) {
      console.error("Get branding error:", error);
      return {
        workspace_id,
        ...this.DEFAULT_BRANDING,
      };
    }
  }

  // Update branding configuration
  async updateBranding(
    workspace_id: string,
    updates: Partial<Omit<BrandingConfig, "workspace_id">>
  ): Promise<boolean> {
    try {
      const { prisma } = await import("@/lib/db");

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspace_id },
      });

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      const currentSettings = workspace.settings
        ? JSON.parse(workspace.settings)
        : {};
      const currentBranding = currentSettings.branding || {};

      const updatedBranding = {
        ...currentBranding,
        ...updates,
        colors: { ...currentBranding.colors, ...updates.colors },
        typography: { ...currentBranding.typography, ...updates.typography },
        ui: { ...currentBranding.ui, ...updates.ui },
        email: { ...currentBranding.email, ...updates.email },
        feature_visibility: {
          ...currentBranding.feature_visibility,
          ...updates.feature_visibility,
        },
      };

      const newSettings = {
        ...currentSettings,
        branding: updatedBranding,
      };

      await prisma.workspace.update({
        where: { id: workspace_id },
        data: {
          settings: JSON.stringify(newSettings),
        },
      });

      return true;
    } catch (error: any) {
      console.error("Update branding error:", error);
      return false;
    }
  }

  // Generate CSS variables from branding config
  generateCSSVariables(branding: BrandingConfig): string {
    return `
:root {
  /* Colors */
  --color-primary: ${branding.colors.primary};
  --color-secondary: ${branding.colors.secondary};
  --color-accent: ${branding.colors.accent};
  --color-success: ${branding.colors.success};
  --color-warning: ${branding.colors.warning};
  --color-error: ${branding.colors.error};
  --color-info: ${branding.colors.info};
  --color-background: ${branding.colors.background};
  --color-surface: ${branding.colors.surface};
  --color-text-primary: ${branding.colors.text_primary};
  --color-text-secondary: ${branding.colors.text_secondary};

  /* Typography */
  --font-heading: ${branding.typography.font_family_heading};
  --font-body: ${branding.typography.font_family_body};
  --font-size-base: ${branding.typography.font_size_base};
  --font-weight-normal: ${branding.typography.font_weight_normal};
  --font-weight-medium: ${branding.typography.font_weight_medium};
  --font-weight-bold: ${branding.typography.font_weight_bold};

  /* UI */
  --border-radius: ${branding.ui.border_radius};
  --shadow-subtle: ${this.getShadowStyle(branding.ui.shadow_style, "subtle")};
  --shadow-normal: ${this.getShadowStyle(branding.ui.shadow_style, "normal")};
  --shadow-strong: ${this.getShadowStyle(branding.ui.shadow_style, "strong")};
}

/* Button Styles */
.btn {
  border-radius: ${this.getButtonBorderRadius(branding.ui.button_style)};
  background-color: var(--color-primary);
  color: white;
  font-weight: var(--font-weight-medium);
  padding: ${branding.ui.layout_style === "compact" ? "0.5rem 1rem" : branding.ui.layout_style === "spacious" ? "1rem 1.5rem" : "0.75rem 1.25rem"};
}

.btn:hover {
  opacity: 0.9;
}

/* Card Styles */
.card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-normal);
  padding: ${branding.ui.layout_style === "compact" ? "1rem" : branding.ui.layout_style === "spacious" ? "2rem" : "1.5rem"};
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-background);
}

${branding.custom_css || ""}
    `.trim();
  }

  // Generate HTML for branding preview
  generatePreviewHTML(branding: BrandingConfig): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding.company_name} - Branding Preview</title>
  <style>
    ${this.generateCSSVariables(branding)}

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .logo { max-width: 200px; height: auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
    .color-swatch { padding: 1rem; border-radius: var(--border-radius); color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${branding.logo_url ? `<img src="${branding.logo_url}" alt="${branding.company_name}" class="logo">` : `<h1>${branding.company_name}</h1>`}
      ${branding.company_tagline ? `<p style="color: var(--color-text-secondary); margin-top: 0.5rem;">${branding.company_tagline}</p>` : ""}
    </div>

    <div class="card">
      <h2>Color Palette</h2>
      <div class="grid">
        <div class="color-swatch" style="background-color: var(--color-primary);">Primary</div>
        <div class="color-swatch" style="background-color: var(--color-secondary);">Secondary</div>
        <div class="color-swatch" style="background-color: var(--color-accent);">Accent</div>
        <div class="color-swatch" style="background-color: var(--color-success);">Success</div>
        <div class="color-swatch" style="background-color: var(--color-warning);">Warning</div>
        <div class="color-swatch" style="background-color: var(--color-error);">Error</div>
      </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
      <h2>Sample Components</h2>
      <button class="btn">Primary Button</button>
      <p style="margin-top: 1rem;">This is sample body text in ${branding.typography.font_family_body}.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  // Helper methods

  private getShadowStyle(
    style: string,
    level: "subtle" | "normal" | "strong"
  ): string {
    if (style === "none") return "none";

    const shadows = {
      subtle: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        normal: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        strong: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
      },
      normal: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        normal: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        strong: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      strong: {
        subtle: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        normal: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        strong: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
    };

    return (
      shadows[style as keyof typeof shadows]?.[level] || shadows.normal[level]
    );
  }

  private getButtonBorderRadius(style: string): string {
    switch (style) {
      case "square":
        return "0px";
      case "pill":
        return "9999px";
      case "rounded":
      default:
        return "var(--border-radius)";
    }
  }
}

// Export singleton
export const brandingManager = new BrandingManager();
