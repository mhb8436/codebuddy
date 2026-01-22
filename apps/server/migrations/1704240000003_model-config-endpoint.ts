import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Add endpoint, api_key, api_version columns to model_config table
  pgm.addColumns('model_config', {
    endpoint: {
      type: 'text',
      notNull: false,
    },
    api_key: {
      type: 'text',
      notNull: false,
    },
    api_version: {
      type: 'varchar(50)',
      notNull: false,
    },
  });

  // Update default values for existing rows
  pgm.sql(`
    UPDATE model_config
    SET
      endpoint = CASE level
        WHEN 'beginner_zero' THEN 'https://your-instance.openai.azure.com/openai/deployments/gpt-5-mini/chat/completions'
        WHEN 'beginner' THEN 'https://your-instance.openai.azure.com/openai/deployments/gpt-5-mini/chat/completions'
        WHEN 'beginner_plus' THEN 'https://your-instance.openai.azure.com/openai/deployments/gpt-5-nano/chat/completions'
      END,
      api_version = CASE level
        WHEN 'beginner_zero' THEN '2025-01-01-preview'
        WHEN 'beginner' THEN '2025-01-01-preview'
        WHEN 'beginner_plus' THEN '2025-01-01-preview'
      END
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns('model_config', ['endpoint', 'api_key', 'api_version']);
}
