import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Learning Progress table - 사용자별 학습 진도 추적
  pgm.createTable('learning_progress', {
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
    language: {
      type: 'varchar(50)',
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
    concept_id: {
      type: 'varchar(100)',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: "'not_started'", // not_started, in_progress, completed
    },
    practice_count: {
      type: 'integer',
      default: 0,
    },
    correct_count: {
      type: 'integer',
      default: 0,
    },
    last_practiced_at: {
      type: 'timestamp',
    },
    completed_at: {
      type: 'timestamp',
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

  // Unique constraint to prevent duplicate progress entries
  pgm.createIndex('learning_progress', ['user_id', 'language', 'track_id', 'topic_id'], {
    unique: true,
    name: 'idx_learning_progress_unique',
  });
  pgm.createIndex('learning_progress', 'user_id');
  pgm.createIndex('learning_progress', ['language', 'track_id']);

  // Topic Stats table - 토픽별 전체 통계 (관리자용)
  pgm.createTable('topic_stats', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    language: {
      type: 'varchar(50)',
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
    total_attempts: {
      type: 'integer',
      default: 0,
    },
    total_correct: {
      type: 'integer',
      default: 0,
    },
    total_users: {
      type: 'integer',
      default: 0,
    },
    avg_completion_time: {
      type: 'integer', // in minutes
    },
    difficulty_score: {
      type: 'decimal(3,2)', // 0.00 ~ 1.00
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('topic_stats', ['language', 'track_id', 'topic_id'], {
    unique: true,
    name: 'idx_topic_stats_unique',
  });

  // User Track Enrollment - 사용자 트랙 등록 정보
  pgm.createTable('user_track_enrollment', {
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
    language: {
      type: 'varchar(50)',
      notNull: true,
    },
    track_id: {
      type: 'varchar(100)',
      notNull: true,
    },
    current_topic_id: {
      type: 'varchar(100)',
    },
    progress_percent: {
      type: 'integer',
      default: 0,
    },
    enrolled_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
    last_activity_at: {
      type: 'timestamp',
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('user_track_enrollment', ['user_id', 'language', 'track_id'], {
    unique: true,
    name: 'idx_user_track_enrollment_unique',
  });
  pgm.createIndex('user_track_enrollment', 'user_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('user_track_enrollment');
  pgm.dropTable('topic_stats');
  pgm.dropTable('learning_progress');
}
