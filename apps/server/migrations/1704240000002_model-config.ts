import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Model configuration table
  pgm.createTable('model_config', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    level: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
    provider: {
      type: 'varchar(50)',
      notNull: true,
    },
    model_name: {
      type: 'varchar(100)',
      notNull: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
    updated_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
  });

  // Insert default configuration
  pgm.sql(`
    INSERT INTO model_config (level, provider, model_name) VALUES
    ('beginner_zero', 'azure-openai', 'gpt-5-mini'),
    ('beginner', 'azure-openai', 'gpt-5-mini'),
    ('beginner_plus', 'azure-openai', 'gpt-5-nano')
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('model_config');
}
