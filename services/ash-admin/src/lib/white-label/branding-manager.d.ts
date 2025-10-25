export interface BrandingConfig {
    workspace_id: string;
    company_name: string;
    company_tagline?: string;
    company_website?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    logo_url?: string;
    logo_light_url?: string;
    logo_dark_url?: string;
    favicon_url?: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        background: string;
        surface: string;
        text_primary: string;
        text_secondary: string;
    };
    typography: {
        font_family_heading: string;
        font_family_body: string;
        font_size_base: string;
        font_weight_normal: number;
        font_weight_medium: number;
        font_weight_bold: number;
    };
    ui: {
        border_radius: string;
        shadow_style: "none" | "subtle" | "normal" | "strong";
        button_style: "rounded" | "square" | "pill";
        layout_style: "compact" | "normal" | "spacious";
    };
    email: {
        header_color?: string;
        footer_text?: string;
        signature?: string;
    };
    custom_domain?: string;
    feature_visibility: {
        show_powered_by?: boolean;
        show_help_center?: boolean;
        show_community_link?: boolean;
        custom_footer_text?: string;
    };
    custom_css?: string;
    custom_javascript?: string;
}
export declare class BrandingManager {
    private readonly DEFAULT_BRANDING;
    getBranding(workspace_id: string): Promise<BrandingConfig>;
    updateBranding(workspace_id: string, updates: Partial<Omit<BrandingConfig, "workspace_id">>): Promise<boolean>;
    generateCSSVariables(branding: BrandingConfig): string;
    generatePreviewHTML(branding: BrandingConfig): string;
    private getShadowStyle;
    private getButtonBorderRadius;
}
export declare const brandingManager: BrandingManager;
