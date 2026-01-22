import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Question Bank table - 문제 은행
  pgm.createTable('question_bank', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    language: {
      type: 'varchar(20)',
      notNull: true,
    },
    track_id: {
      type: 'varchar(100)',
      notNull: true,
    },
    topic_id: {
      type: 'varchar(100)',
      notNull: true,
    },
    difficulty: {
      type: 'varchar(10)',
      notNull: true,
      default: "'easy'",
      check: "difficulty IN ('easy', 'medium', 'hard')",
    },
    points: {
      type: 'integer',
      notNull: true,
      default: 10,
    },
    title: {
      type: 'varchar(500)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    requirements: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
    },
    test_cases: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
    },
    sample_answer: {
      type: 'text',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: "'pending'",
      check: "status IN ('pending', 'approved', 'rejected')",
    },
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
    },
    approved_by: {
      type: 'uuid',
      references: 'users',
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

  pgm.createIndex('question_bank', ['language', 'track_id', 'topic_id'], {
    name: 'idx_question_bank_topic',
  });
  pgm.createIndex('question_bank', 'status', {
    name: 'idx_question_bank_status',
  });
  pgm.createIndex('question_bank', 'difficulty', {
    name: 'idx_question_bank_difficulty',
  });
  pgm.createIndex('question_bank', 'created_by', {
    name: 'idx_question_bank_created_by',
  });

  // Question Generation Jobs table - 문제 생성 작업 추적
  pgm.createTable('question_generation_jobs', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    language: {
      type: 'varchar(20)',
      notNull: true,
    },
    track_id: {
      type: 'varchar(100)',
      notNull: true,
    },
    topic_id: {
      type: 'varchar(100)',
      notNull: true,
    },
    topic_name: {
      type: 'varchar(200)',
      notNull: true,
    },
    difficulty_config: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func("'{\"easy\": 3, \"medium\": 3, \"hard\": 2}'::jsonb"),
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: "'pending'",
      check: "status IN ('pending', 'in_progress', 'completed', 'failed')",
    },
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
    },
    error_message: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
    completed_at: {
      type: 'timestamp',
    },
  });

  pgm.createIndex('question_generation_jobs', 'status', {
    name: 'idx_generation_jobs_status',
  });
  pgm.createIndex('question_generation_jobs', 'created_by', {
    name: 'idx_generation_jobs_created_by',
  });
  pgm.createIndex('question_generation_jobs', ['language', 'track_id', 'topic_id'], {
    name: 'idx_generation_jobs_topic',
  });

  // Add comments
  pgm.sql("COMMENT ON TABLE question_bank IS '문제 은행 - 미리 생성된 시험 문제 저장'");
  pgm.sql("COMMENT ON TABLE question_generation_jobs IS '문제 생성 작업 - 백그라운드 LLM 생성 작업 추적'");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('question_generation_jobs');
  pgm.dropTable('question_bank');
}
