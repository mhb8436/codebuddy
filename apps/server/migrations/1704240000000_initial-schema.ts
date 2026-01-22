import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Enable UUID extension
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // Classes table
  pgm.createTable('classes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    invite_code: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
    max_students: {
      type: 'integer',
      default: 20,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
    expires_at: {
      type: 'timestamp',
    },
  });

  pgm.createIndex('classes', 'invite_code');

  // Users table
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    role: {
      type: 'varchar(20)',
      default: "'student'",
    },
    class_id: {
      type: 'uuid',
      references: 'classes',
      onDelete: 'SET NULL',
    },
    level: {
      type: 'varchar(20)',
      default: "'beginner'",
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
    last_login_at: {
      type: 'timestamp',
    },
  });

  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'class_id');

  // Chat sessions table
  pgm.createTable('chat_sessions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(255)',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('chat_sessions', 'user_id');

  // Messages table
  pgm.createTable('messages', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    session_id: {
      type: 'uuid',
      notNull: true,
      references: 'chat_sessions',
      onDelete: 'CASCADE',
    },
    role: {
      type: 'varchar(20)',
      notNull: true,
    },
    content: {
      type: 'text',
      notNull: true,
    },
    model_used: {
      type: 'varchar(50)',
    },
    tokens_used: {
      type: 'integer',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('messages', 'session_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('messages');
  pgm.dropTable('chat_sessions');
  pgm.dropTable('users');
  pgm.dropTable('classes');
}
