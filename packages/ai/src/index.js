"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfigs = exports.Ashley = void 0;
exports.createAshley = createAshley;
var ashley_1 = require("./ashley");
Object.defineProperty(exports, "Ashley", {
  enumerable: true,
  get: function () {
    return ashley_1.Ashley;
  },
});
__exportStar(require("./types"), exports);
__exportStar(require("./validation"), exports);
__exportStar(require("./providers"), exports);
// Default configurations
exports.defaultConfigs = {
  openai: {
    provider: "openai",
    config: {
      model: "gpt-4-turbo-preview",
      maxTokens: 2000,
      temperature: 0.1,
    },
  },
  anthropic: {
    provider: "anthropic",
    config: {
      model: "claude-3-sonnet-20240229",
      maxTokens: 2000,
      temperature: 0.1,
    },
  },
};
// Helper function to create Ashley instance
function createAshley(provider, apiKey, options = {}) {
  const baseConfig = exports.defaultConfigs[provider];
  return new Ashley({
    ...baseConfig,
    config: {
      ...baseConfig.config,
      apiKey,
    },
    ...options,
  });
}
