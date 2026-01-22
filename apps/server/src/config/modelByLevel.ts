export type LearnerLevel = 'beginner_zero' | 'beginner' | 'beginner_plus';
export type ModelProvider = 'azure-openai';

export interface ModelConfig {
  provider: ModelProvider;
  baseURL: string;
  apiKey: string;
  modelName: string;
  apiVersion?: string;
}

export interface CachedLevelConfig {
  provider: ModelProvider;
  modelName: string;
  endpoint: string | null;
  apiKey: string | null;
  apiVersion: string | null;
}

// Default configuration (used before DB config is loaded)
// gpt-5-mini: aidpes-g5m, gpt-5-nano: aidpes-g5n
const DEFAULT_MODEL_BY_LEVEL: Record<LearnerLevel, CachedLevelConfig> = {
  beginner_zero: {
    provider: 'azure-openai',
    modelName: 'gpt-5-mini',
    endpoint: null,
    apiKey: null,
    apiVersion: null,
  },
  beginner: {
    provider: 'azure-openai',
    modelName: 'gpt-5-nano',
    endpoint: null,
    apiKey: null,
    apiVersion: null,
  },
  beginner_plus: {
    provider: 'azure-openai',
    modelName: 'gpt-5-nano',
    endpoint: null,
    apiKey: null,
    apiVersion: null,
  }
};

// Cached configuration from DB
let cachedConfig: Record<LearnerLevel, CachedLevelConfig> | null = null;

export function setCachedConfig(config: Record<LearnerLevel, CachedLevelConfig>) {
  cachedConfig = config;
}

export function clearCachedConfig() {
  cachedConfig = null;
}

export function getCachedConfig() {
  return cachedConfig;
}

// Get base URL and API key from environment variables
function getEnvBaseURLAndKey(): { baseURL: string; apiKey: string } {
  return {
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  };
}

export function getModelConfig(level: LearnerLevel): ModelConfig {
  const config = cachedConfig || DEFAULT_MODEL_BY_LEVEL;
  const levelConfig = config[level] || config.beginner;

  // Use DB values if available, otherwise fall back to env vars
  const envFallback = getEnvBaseURLAndKey();

  return {
    provider: levelConfig.provider,
    baseURL: levelConfig.endpoint || envFallback.baseURL,
    apiKey: levelConfig.apiKey || envFallback.apiKey,
    modelName: levelConfig.modelName,
    apiVersion: levelConfig.apiVersion || process.env.AZURE_OPENAI_API_VERSION || undefined,
  };
}

// For backwards compatibility
export const MODEL_BY_LEVEL = DEFAULT_MODEL_BY_LEVEL;
