import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import bcrypt from 'bcrypt';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create default admin password hash (password: admin1234)
  // In production, change this immediately after first login
  const passwordHash = await bcrypt.hash('admin1234', 10);

  // Create default class for testing
  pgm.sql(`
    INSERT INTO classes (id, name, invite_code, max_students)
    VALUES (
      gen_random_uuid(),
      '웹개발 기초반',
      'TEST01',
      30
    )
    ON CONFLICT DO NOTHING
  `);

  // Create admin user
  pgm.sql(`
    INSERT INTO users (id, email, password_hash, name, role, level)
    VALUES (
      gen_random_uuid(),
      'admin@codebuddy.local',
      '${passwordHash}',
      '관리자',
      'admin',
      'beginner_plus'
    )
    ON CONFLICT DO NOTHING
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DELETE FROM users WHERE email = 'admin@codebuddy.local'`);
  pgm.sql(`DELETE FROM classes WHERE invite_code = 'TEST01'`);
}
