import { query } from '../index.js';
import type { LearnerLevel, ModelProvider } from '../../config/modelByLevel.js';

export interface ModelConfigRow {
  id: string;
  level: LearnerLevel;
  provider: ModelProvider;
  model_name: string;
  endpoint: string | null;
  api_key: string | null;
  api_version: string | null;
  is_active: boolean;
  updated_at: Date;
  updated_by: string | null;
}

export interface ModelConfigRowMasked extends Omit<ModelConfigRow, 'api_key'> {
  api_key_masked: string | null;
}

export interface UpdateModelConfigInput {
  provider?: ModelProvider;
  modelName?: string;
  endpoint?: string;
  apiKey?: string;
  apiVersion?: string;
  updatedBy?: string;
}

// Mask API key for display (show only last 8 characters)
export function maskApiKey(apiKey: string | null): string | null {
  if (!apiKey) return null;
  if (apiKey.length <= 8) return '••••••••';
  return '••••••••' + apiKey.slice(-8);
}

// Available models for selection (Azure OpenAI only)
export const AVAILABLE_MODELS = [
  {
    provider: 'azure-openai' as ModelProvider,
    modelName: 'gpt-5-mini',
    displayName: 'GPT-5 Mini',
    description: '품질과 비용 균형, 가성비 우수 (deployment: aidpes-g5m)',
    costTier: 'medium',
  },
  {
    provider: 'azure-openai' as ModelProvider,
    modelName: 'gpt-5-nano',
    displayName: 'GPT-5 Nano',
    description: '초경량, 빠른 응답, 최저 비용 (deployment: aidpes-g5n)',
    costTier: 'low',
  },
];

export async function findAll(): Promise<ModelConfigRow[]> {
  const result = await query<ModelConfigRow>(
    'SELECT * FROM model_config ORDER BY level'
  );
  return result.rows;
}

export async function findAllMasked(): Promise<ModelConfigRowMasked[]> {
  const rows = await findAll();
  return rows.map((row) => ({
    ...row,
    api_key_masked: maskApiKey(row.api_key),
  }));
}

export async function findByLevel(level: LearnerLevel): Promise<ModelConfigRow | null> {
  const result = await query<ModelConfigRow>(
    'SELECT * FROM model_config WHERE level = $1',
    [level]
  );
  return result.rows[0] || null;
}

export async function update(
  level: LearnerLevel,
  input: UpdateModelConfigInput
): Promise<ModelConfigRow | null> {
  // Build dynamic update query based on provided fields
  const updates: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;

  if (input.provider !== undefined) {
    updates.push(`provider = $${paramIndex++}`);
    values.push(input.provider);
  }
  if (input.modelName !== undefined) {
    updates.push(`model_name = $${paramIndex++}`);
    values.push(input.modelName);
  }
  if (input.endpoint !== undefined) {
    updates.push(`endpoint = $${paramIndex++}`);
    values.push(input.endpoint);
  }
  if (input.apiKey !== undefined) {
    updates.push(`api_key = $${paramIndex++}`);
    values.push(input.apiKey);
  }
  if (input.apiVersion !== undefined) {
    updates.push(`api_version = $${paramIndex++}`);
    values.push(input.apiVersion || null);
  }

  updates.push(`updated_at = NOW()`);
  updates.push(`updated_by = $${paramIndex++}`);
  values.push(input.updatedBy || null);

  values.push(level);

  const result = await query<ModelConfigRow>(
    `UPDATE model_config
     SET ${updates.join(', ')}
     WHERE level = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export interface FullModelConfig {
  provider: ModelProvider;
  modelName: string;
  endpoint: string | null;
  apiKey: string | null;
  apiVersion: string | null;
}

export async function getConfigMap(): Promise<Record<LearnerLevel, FullModelConfig>> {
  const configs = await findAll();

  // Default values (fallback)
  const result: Record<LearnerLevel, FullModelConfig> = {
    beginner_zero: {
      provider: 'azure-openai',
      modelName: 'gpt-5-mini',
      endpoint: null,
      apiKey: null,
      apiVersion: null,
    },
    beginner: {
      provider: 'azure-openai',
      modelName: 'gpt-5-mini',
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
    },
  };

  for (const config of configs) {
    result[config.level] = {
      provider: config.provider,
      modelName: config.model_name,
      endpoint: config.endpoint,
      apiKey: config.api_key,
      apiVersion: config.api_version,
    };
  }

  return result;
}
