export { Ashley } from "./ashley";
export type { AshleyConfig } from "./ashley";

export * from "./types";
export * from "./validation";
export * from "./providers";

// Default configurations
export const defaultConfigs = {
  openai: {
    provider: "openai" as const,
    config: {
      model: "gpt-4-turbo-preview",
      maxTokens: 2000,
      temperature: 0.1,
    },
  },
  anthropic: {
    provider: "anthropic" as const,
    config: {
      model: "claude-3-sonnet-20240229",
      maxTokens: 2000,
      temperature: 0.1,
    },
  },
};

// Helper function to create Ashley instance
export function createAshley(provider: "openai" | "anthropic", apiKey: string, options: Partial<AshleyConfig> = {}) {
  const baseConfig = defaultConfigs[provider];
  
  return new Ashley({
    ...baseConfig,
    config: {
      ...baseConfig.config,
      apiKey,
    },
    ...options,
  });
}