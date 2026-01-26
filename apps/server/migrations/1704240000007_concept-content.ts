import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // curriculum_concepts 테이블에 학습 컨텐츠 컬럼 추가

  // content: 마크다운 형식의 개념 설명 (이모지 없이)
  pgm.addColumn('curriculum_concepts', {
    content: {
      type: 'text',
      comment: '마크다운 형식의 개념 설명 콘텐츠',
    },
  });

  // runnable_examples: 실행 가능한 코드 예제 배열
  // 형식: [{ title: string, code: string, expected_output?: string }]
  pgm.addColumn('curriculum_concepts', {
    runnable_examples: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
      comment: '실행 가능한 코드 예제 배열 [{title, code, expected_output}]',
    },
  });

  // 컬럼 코멘트 추가
  pgm.sql("COMMENT ON COLUMN curriculum_concepts.content IS '마크다운 형식의 개념 설명 콘텐츠 (이모지 없음)'");
  pgm.sql("COMMENT ON COLUMN curriculum_concepts.runnable_examples IS '실행 가능한 코드 예제 배열 [{title, code, expected_output}]'");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn('curriculum_concepts', 'runnable_examples');
  pgm.dropColumn('curriculum_concepts', 'content');
}
