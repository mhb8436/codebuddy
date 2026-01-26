/**
 * TypeScript 커리큘럼 시드 스크립트
 *
 * 스파이럴 학습법 기반 커리큘럼:
 * - 입문 (beginner_zero): JavaScript는 알지만 TypeScript는 처음인 사람
 * - 기초 (beginner): 기본 타입을 알고 더 활용하고 싶은 사람
 * - 중급 (beginner_plus): 고급 타입과 실무 패턴을 익히고 싶은 사람
 *
 * 사용법:
 *   cd apps/server
 *   npx tsx ../../scripts/seed-typescript-curriculum.ts
 *
 * 환경변수:
 *   DATABASE_URL: PostgreSQL 연결 문자열
 */

import { query, transaction, pool } from '../apps/server/src/db/index.js';

// =============================================
// TypeScript 커리큘럼 데이터
// =============================================

// 트랙 정의 (이미 존재하면 업데이트)
const TRACKS = [
  {
    id: 'ts-beginner',
    language_id: 'typescript',
    name: 'TypeScript 입문',
    description: 'JavaScript를 알고 TypeScript를 처음 시작하는 분들을 위한 과정',
    target_level: 'beginner_zero',
    estimated_hours: 15,
    display_order: 0,
  },
  {
    id: 'ts-basics',
    language_id: 'typescript',
    name: 'TypeScript 기초',
    description: '기본 타입을 알고 더 다양하게 활용하고 싶은 분들을 위한 과정',
    target_level: 'beginner',
    estimated_hours: 25,
    display_order: 1,
  },
  {
    id: 'ts-intermediate',
    language_id: 'typescript',
    name: 'TypeScript 중급',
    description: '고급 타입 시스템과 실무 패턴을 익히고 싶은 분들을 위한 과정',
    target_level: 'beginner_plus',
    estimated_hours: 35,
    display_order: 2,
  },
];

// =============================================
// 입문 (beginner_zero) 스테이지 & 토픽
// =============================================
const BEGINNER_STAGES = [
  {
    id: 'ts-intro-start',
    track_id: 'ts-beginner',
    name: 'TypeScript 시작',
    description: 'TypeScript란 무엇인가',
    display_order: 1,
    topics: [
      { id: 'ts-intro-what-is', name: 'TypeScript란?', description: 'JavaScript + 타입, 왜 필요한가', display_order: 1 },
      { id: 'ts-intro-setup', name: '환경 설정', description: 'tsc, tsconfig.json 기본', display_order: 2 },
      { id: 'ts-intro-first-code', name: '첫 TypeScript 코드', description: '.ts 파일 작성과 컴파일', display_order: 3 },
    ],
  },
  {
    id: 'ts-intro-basic-types',
    track_id: 'ts-beginner',
    name: '기본 타입',
    description: '가장 많이 쓰는 타입들',
    display_order: 2,
    topics: [
      { id: 'ts-intro-primitives', name: '원시 타입', description: 'string, number, boolean', display_order: 1 },
      { id: 'ts-intro-array', name: '배열 타입', description: 'number[], Array<string>', display_order: 2 },
      { id: 'ts-intro-any-unknown', name: 'any와 unknown', description: '타입을 모를 때, 차이점', display_order: 3 },
    ],
  },
  {
    id: 'ts-intro-type-annotation',
    track_id: 'ts-beginner',
    name: '타입 명시',
    description: '변수와 함수에 타입 붙이기',
    display_order: 3,
    topics: [
      { id: 'ts-intro-var-type', name: '변수 타입 명시', description: 'let name: string = "Kim"', display_order: 1 },
      { id: 'ts-intro-func-type', name: '함수 타입 명시', description: '매개변수와 반환 타입', display_order: 2 },
      { id: 'ts-intro-inference', name: '타입 추론', description: 'TypeScript가 알아서 추론', display_order: 3 },
    ],
  },
  {
    id: 'ts-intro-objects',
    track_id: 'ts-beginner',
    name: '객체 타입',
    description: '객체의 형태 정의하기',
    display_order: 4,
    topics: [
      { id: 'ts-intro-obj-type', name: '객체 타입 기본', description: '{ name: string, age: number }', display_order: 1 },
      { id: 'ts-intro-optional', name: '선택적 속성', description: 'name?: string', display_order: 2 },
      { id: 'ts-intro-readonly', name: '읽기 전용', description: 'readonly id: number', display_order: 3 },
    ],
  },
  {
    id: 'ts-intro-interface',
    track_id: 'ts-beginner',
    name: '인터페이스',
    description: '타입에 이름 붙이기',
    display_order: 5,
    topics: [
      { id: 'ts-intro-interface-basic', name: '인터페이스 기본', description: 'interface User { }', display_order: 1 },
      { id: 'ts-intro-interface-extend', name: '인터페이스 확장', description: 'extends로 상속', display_order: 2 },
    ],
  },
  {
    id: 'ts-intro-type-alias',
    track_id: 'ts-beginner',
    name: '타입 별칭',
    description: 'type으로 타입 정의',
    display_order: 6,
    topics: [
      { id: 'ts-intro-type-basic', name: '타입 별칭 기본', description: 'type ID = string | number', display_order: 1 },
      { id: 'ts-intro-interface-vs-type', name: 'interface vs type', description: '언제 무엇을 쓸까', display_order: 2 },
    ],
  },
  {
    id: 'ts-intro-union',
    track_id: 'ts-beginner',
    name: '유니온 타입',
    description: '여러 타입 중 하나',
    display_order: 7,
    topics: [
      { id: 'ts-intro-union-basic', name: '유니온 기본', description: 'string | number', display_order: 1 },
      { id: 'ts-intro-narrowing', name: '타입 좁히기', description: 'typeof로 타입 확인', display_order: 2 },
    ],
  },
  {
    id: 'ts-intro-literal',
    track_id: 'ts-beginner',
    name: '리터럴 타입',
    description: '특정 값만 허용',
    display_order: 8,
    topics: [
      { id: 'ts-intro-literal-basic', name: '리터럴 타입 기본', description: '"left" | "right" | "center"', display_order: 1 },
      { id: 'ts-intro-const-assertion', name: 'as const', description: '리터럴 타입으로 고정', display_order: 2 },
    ],
  },
];

// =============================================
// 기초 (beginner) 스테이지 & 토픽
// =============================================
const BASICS_STAGES = [
  {
    id: 'ts-basics-functions',
    track_id: 'ts-basics',
    name: '함수 타입 심화',
    description: '함수를 더 정확하게 타이핑',
    display_order: 1,
    topics: [
      { id: 'ts-basics-func-overload', name: '함수 오버로드', description: '같은 함수, 다른 시그니처', display_order: 1 },
      { id: 'ts-basics-func-type-expr', name: '함수 타입 표현식', description: 'type Fn = (a: number) => void', display_order: 2 },
      { id: 'ts-basics-callback-type', name: '콜백 타입', description: '콜백 함수 타이핑', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-objects-adv',
    track_id: 'ts-basics',
    name: '객체 타입 심화',
    description: '더 정교한 객체 타입',
    display_order: 2,
    topics: [
      { id: 'ts-basics-index-sig', name: '인덱스 시그니처', description: '{ [key: string]: number }', display_order: 1 },
      { id: 'ts-basics-nested', name: '중첩 객체 타입', description: '복잡한 객체 구조', display_order: 2 },
      { id: 'ts-basics-intersection', name: '교차 타입', description: 'Type1 & Type2', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-generics-intro',
    track_id: 'ts-basics',
    name: '제네릭 입문',
    description: '타입을 변수처럼',
    display_order: 3,
    topics: [
      { id: 'ts-basics-generic-what', name: '제네릭이란?', description: '타입을 매개변수로', display_order: 1 },
      { id: 'ts-basics-generic-func', name: '제네릭 함수', description: 'function identity<T>(arg: T): T', display_order: 2 },
      { id: 'ts-basics-generic-interface', name: '제네릭 인터페이스', description: 'interface Box<T> { value: T }', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-narrowing',
    track_id: 'ts-basics',
    name: '타입 좁히기 심화',
    description: '타입 가드 활용',
    display_order: 4,
    topics: [
      { id: 'ts-basics-typeof-guard', name: 'typeof 가드', description: 'typeof x === "string"', display_order: 1 },
      { id: 'ts-basics-instanceof', name: 'instanceof 가드', description: 'x instanceof Date', display_order: 2 },
      { id: 'ts-basics-in-operator', name: 'in 연산자', description: '"name" in obj', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-classes',
    track_id: 'ts-basics',
    name: '클래스와 타입',
    description: '클래스에 타입 적용',
    display_order: 5,
    topics: [
      { id: 'ts-basics-class-member', name: '멤버 타입', description: '속성과 메서드 타입', display_order: 1 },
      { id: 'ts-basics-access-modifier', name: '접근 제한자', description: 'public, private, protected', display_order: 2 },
      { id: 'ts-basics-implements', name: 'implements', description: '인터페이스 구현', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-enum',
    track_id: 'ts-basics',
    name: '열거형',
    description: '관련된 상수 묶음',
    display_order: 6,
    topics: [
      { id: 'ts-basics-enum-numeric', name: '숫자 열거형', description: 'enum Direction { Up, Down }', display_order: 1 },
      { id: 'ts-basics-enum-string', name: '문자열 열거형', description: 'enum Color { Red = "RED" }', display_order: 2 },
      { id: 'ts-basics-const-enum', name: 'const enum', description: '컴파일 타임 최적화', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-tuple',
    track_id: 'ts-basics',
    name: '튜플',
    description: '고정 길이 배열',
    display_order: 7,
    topics: [
      { id: 'ts-basics-tuple-basic', name: '튜플 기본', description: '[string, number]', display_order: 1 },
      { id: 'ts-basics-tuple-optional', name: '선택적 요소', description: '[string, number?]', display_order: 2 },
      { id: 'ts-basics-tuple-rest', name: '나머지 요소', description: '[string, ...number[]]', display_order: 3 },
    ],
  },
  {
    id: 'ts-basics-assertion',
    track_id: 'ts-basics',
    name: '타입 단언',
    description: '내가 타입을 안다고 선언',
    display_order: 8,
    topics: [
      { id: 'ts-basics-as', name: 'as 문법', description: 'value as string', display_order: 1 },
      { id: 'ts-basics-non-null', name: '논널 단언', description: 'value!', display_order: 2 },
      { id: 'ts-basics-satisfies', name: 'satisfies 연산자', description: '타입 체크하면서 추론 유지', display_order: 3 },
    ],
  },
];

// =============================================
// 중급 (beginner_plus) 스테이지 & 토픽
// =============================================
const INTERMEDIATE_STAGES = [
  {
    id: 'ts-inter-generics',
    track_id: 'ts-intermediate',
    name: '제네릭 심화',
    description: '고급 제네릭 패턴',
    display_order: 1,
    topics: [
      { id: 'ts-inter-generic-constraint', name: '제네릭 제약', description: 'T extends { length: number }', display_order: 1 },
      { id: 'ts-inter-generic-default', name: '기본 타입 매개변수', description: '<T = string>', display_order: 2 },
      { id: 'ts-inter-generic-inference', name: '제네릭 추론', description: 'infer 키워드', display_order: 3 },
    ],
  },
  {
    id: 'ts-inter-utility',
    track_id: 'ts-intermediate',
    name: '유틸리티 타입',
    description: '내장 유틸리티 타입 활용',
    display_order: 2,
    topics: [
      { id: 'ts-inter-partial-required', name: 'Partial과 Required', description: '선택적/필수로 변환', display_order: 1 },
      { id: 'ts-inter-pick-omit', name: 'Pick과 Omit', description: '속성 선택/제외', display_order: 2 },
      { id: 'ts-inter-record', name: 'Record', description: 'Record<K, V> 맵 타입', display_order: 3 },
      { id: 'ts-inter-returntype', name: 'ReturnType과 Parameters', description: '함수 타입 추출', display_order: 4 },
    ],
  },
  {
    id: 'ts-inter-mapped',
    track_id: 'ts-intermediate',
    name: '매핑된 타입',
    description: '타입 변환 패턴',
    display_order: 3,
    topics: [
      { id: 'ts-inter-mapped-basic', name: '매핑된 타입 기본', description: '{ [K in keyof T]: ... }', display_order: 1 },
      { id: 'ts-inter-key-remapping', name: '키 재매핑', description: 'as 절로 키 변환', display_order: 2 },
      { id: 'ts-inter-template-literal', name: '템플릿 리터럴 타입', description: '`${Prefix}_${Name}`', display_order: 3 },
    ],
  },
  {
    id: 'ts-inter-conditional',
    track_id: 'ts-intermediate',
    name: '조건부 타입',
    description: '타입 레벨 조건문',
    display_order: 4,
    topics: [
      { id: 'ts-inter-cond-basic', name: '조건부 타입 기본', description: 'T extends U ? X : Y', display_order: 1 },
      { id: 'ts-inter-distributive', name: '분산 조건부 타입', description: '유니온에 분산 적용', display_order: 2 },
      { id: 'ts-inter-infer', name: 'infer 키워드', description: '타입 추출하기', display_order: 3 },
    ],
  },
  {
    id: 'ts-inter-discriminated',
    track_id: 'ts-intermediate',
    name: '판별 유니온',
    description: '타입 안전한 유니온 패턴',
    display_order: 5,
    topics: [
      { id: 'ts-inter-disc-union', name: '판별 유니온 기본', description: 'type: "circle" | "square"', display_order: 1 },
      { id: 'ts-inter-exhaustive', name: '완전성 검사', description: 'never로 모든 케이스 처리 확인', display_order: 2 },
    ],
  },
  {
    id: 'ts-inter-module',
    track_id: 'ts-intermediate',
    name: '모듈과 타입',
    description: '모듈 시스템과 타입',
    display_order: 6,
    topics: [
      { id: 'ts-inter-import-type', name: 'import type', description: '타입만 가져오기', display_order: 1 },
      { id: 'ts-inter-declaration', name: '선언 파일', description: '.d.ts 파일 작성', display_order: 2 },
      { id: 'ts-inter-ambient', name: '앰비언트 선언', description: 'declare 키워드', display_order: 3 },
    ],
  },
  {
    id: 'ts-inter-patterns',
    track_id: 'ts-intermediate',
    name: '실무 패턴',
    description: '현업에서 자주 쓰는 패턴',
    display_order: 7,
    topics: [
      { id: 'ts-inter-builder', name: '빌더 패턴', description: '타입 안전한 빌더', display_order: 1 },
      { id: 'ts-inter-brand', name: '브랜드 타입', description: '같은 타입 구분하기', display_order: 2 },
      { id: 'ts-inter-assertion-func', name: '타입 단언 함수', description: 'asserts 키워드', display_order: 3 },
    ],
  },
  {
    id: 'ts-inter-config',
    track_id: 'ts-intermediate',
    name: 'tsconfig 심화',
    description: '컴파일러 옵션 마스터',
    display_order: 8,
    topics: [
      { id: 'ts-inter-strict', name: 'strict 옵션', description: 'strictNullChecks, noImplicitAny', display_order: 1 },
      { id: 'ts-inter-module-resolution', name: '모듈 해석', description: 'moduleResolution 옵션', display_order: 2 },
      { id: 'ts-inter-paths', name: '경로 매핑', description: 'paths, baseUrl 설정', display_order: 3 },
    ],
  },
];

// 모든 스테이지 합치기
const ALL_STAGES = [...BEGINNER_STAGES, ...BASICS_STAGES, ...INTERMEDIATE_STAGES];

// =============================================
// 시드 실행 함수
// =============================================

async function seedTypeScriptCurriculum() {
  console.log('🚀 TypeScript 커리큘럼 시드 시작...\n');

  try {
    await transaction(async (client) => {
      // 1. 관련 테이블 데이터 먼저 삭제 (FK 제약 해제)
      console.log('📦 관련 데이터 삭제 중...');

      // question_bank 삭제
      await client.query(`DELETE FROM question_bank WHERE language = 'typescript'`);
      console.log('  - question_bank 삭제 완료');

      // question_generation_jobs 삭제
      await client.query(`DELETE FROM question_generation_jobs WHERE language = 'typescript'`);
      console.log('  - question_generation_jobs 삭제 완료');

      // learning_progress 삭제
      await client.query(`DELETE FROM learning_progress WHERE language = 'typescript'`);
      console.log('  - learning_progress 삭제 완료');

      // 2. 기존 TypeScript 토픽 삭제 (CASCADE로 concepts도 삭제됨)
      console.log('📦 기존 TypeScript 토픽 삭제 중...');
      await client.query(`
        DELETE FROM curriculum_topics
        WHERE stage_id IN (
          SELECT s.id FROM curriculum_stages s
          JOIN curriculum_tracks t ON s.track_id = t.id
          WHERE t.language_id = 'typescript'
        )
      `);

      // 3. 기존 TypeScript 스테이지 삭제
      console.log('📦 기존 TypeScript 스테이지 삭제 중...');
      await client.query(`
        DELETE FROM curriculum_stages
        WHERE track_id IN (
          SELECT id FROM curriculum_tracks WHERE language_id = 'typescript'
        )
      `);

      // 4. 트랙 업데이트 (UPSERT)
      console.log('📚 트랙 업데이트 중...');
      for (const track of TRACKS) {
        await client.query(
          `
          INSERT INTO curriculum_tracks (id, language_id, name, description, target_level, estimated_hours, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            target_level = EXCLUDED.target_level,
            estimated_hours = EXCLUDED.estimated_hours,
            display_order = EXCLUDED.display_order,
            updated_at = NOW()
          `,
          [
            track.id,
            track.language_id,
            track.name,
            track.description,
            track.target_level,
            track.estimated_hours,
            track.display_order,
          ]
        );
        console.log(`  ✅ 트랙: ${track.name}`);
      }

      // 5. 스테이지 & 토픽 생성
      console.log('\n📖 스테이지 & 토픽 생성 중...');
      for (const stage of ALL_STAGES) {
        // 스테이지 생성
        await client.query(
          `
          INSERT INTO curriculum_stages (id, track_id, name, description, display_order)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [stage.id, stage.track_id, stage.name, stage.description, stage.display_order]
        );
        console.log(`  📁 스테이지: ${stage.name}`);

        // 토픽 생성
        for (const topic of stage.topics) {
          await client.query(
            `
            INSERT INTO curriculum_topics (id, stage_id, name, description, display_order)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [topic.id, stage.id, topic.name, topic.description, topic.display_order]
          );
          console.log(`    📝 토픽: ${topic.name}`);
        }
      }

      console.log('\n✨ TypeScript 커리큘럼 시드 완료!');
      console.log(`  - 트랙: ${TRACKS.length}개`);
      console.log(`  - 스테이지: ${ALL_STAGES.length}개`);
      console.log(`  - 토픽: ${ALL_STAGES.reduce((sum, s) => sum + s.topics.length, 0)}개`);
    });
  } catch (error) {
    console.error('❌ 시드 실패:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 실행
seedTypeScriptCurriculum().catch((err) => {
  console.error(err);
  process.exit(1);
});
