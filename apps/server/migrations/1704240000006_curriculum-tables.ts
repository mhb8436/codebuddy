import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // ========================================
  // 0. 기존 데이터 정리 (잘못된 track_id 수정)
  // ========================================
  // beginner-fundamentals -> js-beginner 로 수정
  pgm.sql(`
    UPDATE question_bank
    SET track_id = 'js-beginner'
    WHERE language = 'javascript' AND track_id = 'beginner-fundamentals'
  `);

  pgm.sql(`
    UPDATE learning_progress
    SET track_id = 'js-beginner'
    WHERE language = 'javascript' AND track_id = 'beginner-fundamentals'
  `);

  pgm.sql(`
    UPDATE user_track_enrollment
    SET track_id = 'js-beginner'
    WHERE language = 'javascript' AND track_id = 'beginner-fundamentals'
  `);

  pgm.sql(`
    UPDATE question_generation_jobs
    SET track_id = 'js-beginner'
    WHERE language = 'javascript' AND track_id = 'beginner-fundamentals'
  `);

  // ========================================
  // 1. 커리큘럼 언어 테이블
  // ========================================
  pgm.createTable('curriculum_languages', {
    id: {
      type: 'varchar(50)',
      primaryKey: true, // 'javascript', 'python', 'typescript'
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    display_order: {
      type: 'integer',
      default: 0,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  // ========================================
  // 2. 커리큘럼 트랙 테이블
  // ========================================
  pgm.createTable('curriculum_tracks', {
    id: {
      type: 'varchar(100)',
      primaryKey: true, // 'js-beginner', 'py-basics'
    },
    language_id: {
      type: 'varchar(50)',
      notNull: true,
      references: 'curriculum_languages',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(200)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    target_level: {
      type: 'varchar(50)',
      notNull: true,
      default: "'beginner'",
      // beginner_zero, beginner, beginner_plus
    },
    estimated_hours: {
      type: 'integer',
      default: 10,
    },
    prerequisites: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"), // ['js-beginner']
    },
    display_order: {
      type: 'integer',
      default: 0,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  pgm.createIndex('curriculum_tracks', 'language_id', {
    name: 'idx_curriculum_tracks_language',
  });

  // ========================================
  // 3. 커리큘럼 스테이지 테이블
  // ========================================
  pgm.createTable('curriculum_stages', {
    id: {
      type: 'varchar(100)',
      primaryKey: true, // 'js-basic', 'js-functions'
    },
    track_id: {
      type: 'varchar(100)',
      notNull: true,
      references: 'curriculum_tracks',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(200)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    display_order: {
      type: 'integer',
      default: 0,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  pgm.createIndex('curriculum_stages', 'track_id', {
    name: 'idx_curriculum_stages_track',
  });

  // ========================================
  // 4. 커리큘럼 토픽 테이블
  // ========================================
  pgm.createTable('curriculum_topics', {
    id: {
      type: 'varchar(100)',
      primaryKey: true, // 'variables', 'loops', 'functions'
    },
    stage_id: {
      type: 'varchar(100)',
      notNull: true,
      references: 'curriculum_stages',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(200)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    display_order: {
      type: 'integer',
      default: 0,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  pgm.createIndex('curriculum_topics', 'stage_id', {
    name: 'idx_curriculum_topics_stage',
  });

  // ========================================
  // 5. 커리큘럼 컨셉 테이블 (토픽의 세부 개념)
  // ========================================
  pgm.createTable('curriculum_concepts', {
    id: {
      type: 'varchar(100)',
      primaryKey: true, // 'let-const', 'if-else'
    },
    topic_id: {
      type: 'varchar(100)',
      notNull: true,
      references: 'curriculum_topics',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(200)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    examples: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"), // Array of code examples
    },
    keywords: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"), // Array of search keywords
    },
    display_order: {
      type: 'integer',
      default: 0,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  pgm.createIndex('curriculum_concepts', 'topic_id', {
    name: 'idx_curriculum_concepts_topic',
  });

  // ========================================
  // 6. 시드 데이터 삽입 (FK 제약조건 추가 전에 필요)
  // ========================================

  // 6.1 Languages
  pgm.sql(`
    INSERT INTO curriculum_languages (id, name, description, display_order) VALUES
    ('javascript', 'JavaScript', '웹 개발의 기초가 되는 JavaScript 프로그래밍', 1),
    ('python', 'Python', '데이터 분석과 자동화를 위한 Python 프로그래밍', 2),
    ('typescript', 'TypeScript', '타입 안전성을 갖춘 JavaScript의 상위 집합', 3)
  `);

  // 6.2 Tracks
  pgm.sql(`
    INSERT INTO curriculum_tracks (id, language_id, name, description, target_level, estimated_hours, prerequisites, display_order) VALUES
    -- JavaScript tracks
    ('js-beginner', 'javascript', 'JavaScript 입문', '프로그래밍을 처음 시작하는 분들을 위한 JavaScript 기초', 'beginner_zero', 20, '[]'::jsonb, 1),
    ('js-basics', 'javascript', 'JavaScript 기초', '변수와 조건문을 알고 실습을 더 해보고 싶은 분들을 위한 과정', 'beginner', 25, '["js-beginner"]'::jsonb, 2),
    ('js-intermediate', 'javascript', 'JavaScript 중급', '실무에서 자주 사용하는 JavaScript 패턴과 기법', 'beginner_plus', 30, '["js-basics"]'::jsonb, 3),
    -- Python tracks
    ('py-beginner', 'python', 'Python 입문', '프로그래밍을 처음 시작하는 분들을 위한 Python 기초', 'beginner_zero', 20, '[]'::jsonb, 1),
    ('py-basics', 'python', 'Python 기초', '변수와 조건문을 알고 실습을 더 해보고 싶은 분들을 위한 과정', 'beginner', 25, '["py-beginner"]'::jsonb, 2),
    ('py-intermediate', 'python', 'Python 중급', '실무에서 자주 사용하는 Python 기법', 'beginner_plus', 30, '["py-basics"]'::jsonb, 3),
    -- TypeScript tracks
    ('ts-beginner', 'typescript', 'TypeScript 입문', 'JavaScript 경험이 없어도 시작할 수 있는 TypeScript 첫걸음', 'beginner_zero', 25, '[]'::jsonb, 1),
    ('ts-basics', 'typescript', 'TypeScript 기초', 'JavaScript를 조금 알고 TypeScript를 배우려는 분들을 위한 과정', 'beginner', 20, '["ts-beginner"]'::jsonb, 2),
    ('ts-intermediate', 'typescript', 'TypeScript 중급', '실무에서 자주 사용하는 TypeScript 고급 기법', 'beginner_plus', 30, '["ts-basics"]'::jsonb, 3)
  `);

  // 6.3 Stages
  pgm.sql(`
    INSERT INTO curriculum_stages (id, track_id, name, display_order) VALUES
    -- js-beginner stages
    ('js-basic', 'js-beginner', '기초 문법', 1),
    ('js-functions', 'js-beginner', '함수', 2),
    ('js-arrays', 'js-beginner', '배열', 3),
    ('js-objects', 'js-beginner', '객체', 4),
    -- js-basics stages
    ('js-practice-basics', 'js-basics', '기초 실습', 1),
    ('js-practical-patterns', 'js-basics', '실용 패턴', 2),
    ('js-array-advanced', 'js-basics', '배열 심화', 3),
    -- js-intermediate stages
    ('js-async', 'js-intermediate', '비동기 프로그래밍', 1),
    -- py-beginner stages
    ('py-basic', 'py-beginner', '기초 문법', 1),
    ('py-functions', 'py-beginner', '함수', 2),
    ('py-data-structures', 'py-beginner', '자료구조', 3),
    ('py-comprehensions', 'py-beginner', '컴프리헨션', 4),
    -- py-basics stages
    ('py-practice-basics', 'py-basics', '기초 실습', 1),
    ('py-practical-patterns', 'py-basics', '실용 패턴', 2),
    ('py-file-string', 'py-basics', '문자열과 파일', 3),
    -- py-intermediate stages
    ('py-oop', 'py-intermediate', '객체지향 프로그래밍', 1),
    ('py-file-io', 'py-intermediate', '파일 입출력', 2),
    ('py-exceptions', 'py-intermediate', '예외 처리', 3),
    -- ts-beginner stages
    ('ts-intro', 'ts-beginner', 'TypeScript 시작하기', 1),
    ('ts-control-flow', 'ts-beginner', '제어문', 2),
    ('ts-functions-basic', 'ts-beginner', '함수 기초', 3),
    -- ts-basics stages
    ('ts-object-types', 'ts-basics', '객체 타입', 1),
    ('ts-union-types', 'ts-basics', '유니온과 리터럴 타입', 2),
    ('ts-array-advanced', 'ts-basics', '배열과 튜플', 3),
    -- ts-intermediate stages
    ('ts-generics', 'ts-intermediate', '제네릭', 1),
    ('ts-utility-types', 'ts-intermediate', '유틸리티 타입', 2),
    ('ts-classes', 'ts-intermediate', '클래스와 타입', 3),
    ('ts-async', 'ts-intermediate', '비동기 타입', 4)
  `);

  // 6.4 Topics
  pgm.sql(`
    INSERT INTO curriculum_topics (id, stage_id, name, display_order) VALUES
    -- js-basic topics
    ('variables', 'js-basic', '변수와 상수', 1),
    ('operators', 'js-basic', '연산자', 2),
    ('conditionals', 'js-basic', '조건문', 3),
    ('loops', 'js-basic', '반복문', 4),
    -- js-functions topics
    ('function-basics', 'js-functions', '함수 기초', 1),
    ('scope', 'js-functions', '스코프', 2),
    -- js-arrays topics
    ('array-basics', 'js-arrays', '배열 기초', 1),
    ('array-iteration', 'js-arrays', '배열 순회', 2),
    -- js-objects topics
    ('object-basics', 'js-objects', '객체 기초', 1),
    -- js-practice-basics topics
    ('js-console', 'js-practice-basics', '콘솔과 디버깅', 1),
    ('js-string-methods', 'js-practice-basics', '문자열 메서드', 2),
    ('js-number-methods', 'js-practice-basics', '숫자와 Math', 3),
    -- js-practical-patterns topics
    ('js-spread-rest', 'js-practical-patterns', '전개와 나머지', 1),
    ('js-short-circuit', 'js-practical-patterns', '단축 평가', 2),
    ('js-error-handling', 'js-practical-patterns', '에러 처리', 3),
    -- js-array-advanced topics
    ('js-array-transform', 'js-array-advanced', '배열 변환', 1),
    ('js-array-search', 'js-array-advanced', '배열 검색', 2),
    -- js-async topics
    ('promises', 'js-async', 'Promise', 1),
    -- py-basic topics
    ('py-variables', 'py-basic', '변수와 자료형', 1),
    ('py-operators', 'py-basic', '연산자', 2),
    ('py-conditionals', 'py-basic', '조건문', 3),
    ('py-loops', 'py-basic', '반복문', 4),
    -- py-functions topics
    ('py-function-basics', 'py-functions', '함수 기초', 1),
    ('py-lambda', 'py-functions', '람다 함수', 2),
    -- py-data-structures topics
    ('py-lists', 'py-data-structures', '리스트', 1),
    ('py-dictionaries', 'py-data-structures', '딕셔너리', 2),
    ('py-tuples-sets', 'py-data-structures', '튜플과 세트', 3),
    -- py-comprehensions topics
    ('py-list-comp', 'py-comprehensions', '리스트 컴프리헨션', 1),
    -- py-practice-basics topics
    ('py-input-output', 'py-practice-basics', '입출력', 1),
    ('py-string-methods', 'py-practice-basics', '문자열 메서드', 2),
    ('py-list-methods', 'py-practice-basics', '리스트 메서드 심화', 3),
    -- py-practical-patterns topics
    ('py-useful-functions', 'py-practical-patterns', '유용한 내장 함수', 1),
    ('py-iteration-tools', 'py-practical-patterns', '반복 도구', 2),
    ('py-dict-advanced', 'py-practical-patterns', '딕셔너리 심화', 3),
    -- py-file-string topics
    ('py-string-format-adv', 'py-file-string', '문자열 포맷팅 심화', 1),
    ('py-error-handling', 'py-file-string', '예외 처리 기초', 2),
    -- py-oop topics
    ('py-classes', 'py-oop', '클래스', 1),
    -- py-file-io topics
    ('py-file-basics', 'py-file-io', '파일 읽기/쓰기', 1),
    -- py-exceptions topics
    ('py-try-except', 'py-exceptions', 'try-except', 1),
    -- ts-intro topics
    ('ts-what-is', 'ts-intro', 'TypeScript란?', 1),
    ('ts-basic-types', 'ts-intro', '기본 타입', 2),
    ('ts-variables', 'ts-intro', '변수와 상수', 3),
    -- ts-control-flow topics
    ('ts-conditionals', 'ts-control-flow', '조건문', 1),
    ('ts-loops', 'ts-control-flow', '반복문', 2),
    -- ts-functions-basic topics
    ('ts-function-types', 'ts-functions-basic', '함수 타입', 1),
    -- ts-object-types topics
    ('ts-object-basics', 'ts-object-types', '객체 타입 기초', 1),
    ('ts-type-alias', 'ts-object-types', '타입 별칭', 2),
    -- ts-union-types topics
    ('ts-union-basics', 'ts-union-types', '유니온 타입', 1),
    ('ts-literal-types', 'ts-union-types', '리터럴 타입', 2),
    -- ts-array-advanced topics
    ('ts-array-methods', 'ts-array-advanced', '배열 메서드', 1),
    ('ts-tuple', 'ts-array-advanced', '튜플', 2),
    -- ts-generics topics
    ('ts-generic-basics', 'ts-generics', '제네릭 기초', 1),
    ('ts-generic-constraints', 'ts-generics', '제네릭 제약', 2),
    -- ts-utility-types topics
    ('ts-common-utilities', 'ts-utility-types', '자주 쓰는 유틸리티', 1),
    ('ts-record-type', 'ts-utility-types', 'Record 타입', 2),
    -- ts-classes topics
    ('ts-class-basics', 'ts-classes', '클래스 기초', 1),
    ('ts-class-interface', 'ts-classes', '인터페이스 구현', 2),
    -- ts-async topics
    ('ts-promise-types', 'ts-async', 'Promise 타입', 1)
  `);

  // ========================================
  // 7. 편의를 위한 뷰 생성 - 토픽의 전체 경로 조회
  // ========================================
  pgm.sql(`
    CREATE VIEW curriculum_topic_full_path AS
    SELECT
      t.id as topic_id,
      t.name as topic_name,
      t.display_order as topic_order,
      s.id as stage_id,
      s.name as stage_name,
      s.display_order as stage_order,
      tr.id as track_id,
      tr.name as track_name,
      tr.target_level,
      l.id as language_id,
      l.name as language_name
    FROM curriculum_topics t
    JOIN curriculum_stages s ON t.stage_id = s.id
    JOIN curriculum_tracks tr ON s.track_id = tr.id
    JOIN curriculum_languages l ON tr.language_id = l.id
    WHERE t.is_active = true
      AND s.is_active = true
      AND tr.is_active = true
      AND l.is_active = true
    ORDER BY l.display_order, tr.display_order, s.display_order, t.display_order
  `);

  // ========================================
  // 8. question_bank에 FK 제약조건 추가
  // ========================================
  // language FK
  pgm.addConstraint('question_bank', 'fk_question_bank_language', {
    foreignKeys: {
      columns: 'language',
      references: 'curriculum_languages(id)',
      onDelete: 'RESTRICT',
    },
  });

  // track_id FK - 복합 체크 (language + track_id 조합 검증)
  pgm.addConstraint('question_bank', 'fk_question_bank_track', {
    foreignKeys: {
      columns: 'track_id',
      references: 'curriculum_tracks(id)',
      onDelete: 'RESTRICT',
    },
  });

  // topic_id FK
  pgm.addConstraint('question_bank', 'fk_question_bank_topic', {
    foreignKeys: {
      columns: 'topic_id',
      references: 'curriculum_topics(id)',
      onDelete: 'RESTRICT',
    },
  });

  // ========================================
  // 9. learning_progress에 FK 제약조건 추가
  // ========================================
  pgm.addConstraint('learning_progress', 'fk_learning_progress_language', {
    foreignKeys: {
      columns: 'language',
      references: 'curriculum_languages(id)',
      onDelete: 'RESTRICT',
    },
  });

  pgm.addConstraint('learning_progress', 'fk_learning_progress_track', {
    foreignKeys: {
      columns: 'track_id',
      references: 'curriculum_tracks(id)',
      onDelete: 'RESTRICT',
    },
  });

  pgm.addConstraint('learning_progress', 'fk_learning_progress_topic', {
    foreignKeys: {
      columns: 'topic_id',
      references: 'curriculum_topics(id)',
      onDelete: 'RESTRICT',
    },
  });

  // ========================================
  // 10. user_track_enrollment에 FK 제약조건 추가
  // ========================================
  pgm.addConstraint('user_track_enrollment', 'fk_enrollment_language', {
    foreignKeys: {
      columns: 'language',
      references: 'curriculum_languages(id)',
      onDelete: 'RESTRICT',
    },
  });

  pgm.addConstraint('user_track_enrollment', 'fk_enrollment_track', {
    foreignKeys: {
      columns: 'track_id',
      references: 'curriculum_tracks(id)',
      onDelete: 'RESTRICT',
    },
  });

  // ========================================
  // 11. question_generation_jobs에 FK 제약조건 추가
  // ========================================
  pgm.addConstraint('question_generation_jobs', 'fk_gen_jobs_language', {
    foreignKeys: {
      columns: 'language',
      references: 'curriculum_languages(id)',
      onDelete: 'RESTRICT',
    },
  });

  pgm.addConstraint('question_generation_jobs', 'fk_gen_jobs_track', {
    foreignKeys: {
      columns: 'track_id',
      references: 'curriculum_tracks(id)',
      onDelete: 'RESTRICT',
    },
  });

  pgm.addConstraint('question_generation_jobs', 'fk_gen_jobs_topic', {
    foreignKeys: {
      columns: 'topic_id',
      references: 'curriculum_topics(id)',
      onDelete: 'RESTRICT',
    },
  });

  // ========================================
  // 12. 테이블 코멘트 추가
  // ========================================
  pgm.sql("COMMENT ON TABLE curriculum_languages IS '커리큘럼 언어 (JavaScript, Python, TypeScript)'");
  pgm.sql("COMMENT ON TABLE curriculum_tracks IS '커리큘럼 트랙 - 학습 경로'");
  pgm.sql("COMMENT ON TABLE curriculum_stages IS '커리큘럼 스테이지 - 트랙 내 단계'");
  pgm.sql("COMMENT ON TABLE curriculum_topics IS '커리큘럼 토픽 - 학습 주제'");
  pgm.sql("COMMENT ON TABLE curriculum_concepts IS '커리큘럼 컨셉 - 토픽 내 세부 개념'");
  pgm.sql("COMMENT ON VIEW curriculum_topic_full_path IS '토픽의 전체 경로 정보 조회용 뷰'");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // FK 제약조건 제거
  pgm.dropConstraint('question_generation_jobs', 'fk_gen_jobs_topic');
  pgm.dropConstraint('question_generation_jobs', 'fk_gen_jobs_track');
  pgm.dropConstraint('question_generation_jobs', 'fk_gen_jobs_language');

  pgm.dropConstraint('user_track_enrollment', 'fk_enrollment_track');
  pgm.dropConstraint('user_track_enrollment', 'fk_enrollment_language');

  pgm.dropConstraint('learning_progress', 'fk_learning_progress_topic');
  pgm.dropConstraint('learning_progress', 'fk_learning_progress_track');
  pgm.dropConstraint('learning_progress', 'fk_learning_progress_language');

  pgm.dropConstraint('question_bank', 'fk_question_bank_topic');
  pgm.dropConstraint('question_bank', 'fk_question_bank_track');
  pgm.dropConstraint('question_bank', 'fk_question_bank_language');

  // 뷰 및 테이블 제거
  pgm.sql('DROP VIEW IF EXISTS curriculum_topic_full_path');
  pgm.dropTable('curriculum_concepts');
  pgm.dropTable('curriculum_topics');
  pgm.dropTable('curriculum_stages');
  pgm.dropTable('curriculum_tracks');
  pgm.dropTable('curriculum_languages');
}
