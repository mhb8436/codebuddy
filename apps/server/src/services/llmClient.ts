import OpenAI from 'openai';
import type { ModelConfig } from '../config/modelByLevel.js';

export function createLLMClient(config: ModelConfig): OpenAI {
  // Normalize the endpoint URL
  // OpenAI SDK expects baseURL WITHOUT /chat/completions (it appends automatically)
  let baseURL = config.baseURL;

  // Remove trailing /chat/completions if present (SDK adds it)
  if (baseURL.endsWith('/chat/completions')) {
    baseURL = baseURL.replace('/chat/completions', '');
  }

  // Remove trailing /responses if present (for responses API, handle differently)
  if (baseURL.endsWith('/responses')) {
    baseURL = baseURL.replace('/responses', '');
  }

  if (config.provider === 'azure-openai') {
    // If URL doesn't include /openai/deployments/, construct the full path
    if (!baseURL.includes('/openai/deployments/')) {
      // Extract base and construct proper path
      const azureBase = baseURL.replace(/\/openai\/?$/, '');
      baseURL = `${azureBase}/openai/deployments/${config.modelName}`;
    }

    console.log(`[LLM] Using Azure OpenAI: ${baseURL} (model: ${config.modelName})`);

    return new OpenAI({
      apiKey: config.apiKey,
      baseURL,
      defaultQuery: { 'api-version': config.apiVersion || '2024-02-15-preview' },
      defaultHeaders: { 'api-key': config.apiKey }
    });
  } else {
    // Azure AI Foundry (Claude, etc.) - OpenAI compatible endpoint
    console.log(`[LLM] Using Azure AI Foundry: ${baseURL} (model: ${config.modelName})`);

    return new OpenAI({
      apiKey: config.apiKey,
      baseURL
    });
  }
}
