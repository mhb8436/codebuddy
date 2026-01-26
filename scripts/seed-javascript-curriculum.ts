/**
 * JavaScript 커리큘럼 시드 스크립트
 *
 * 스파이럴 학습법 기반 커리큘럼:
 * - 입문 (beginner_zero): 코딩을 전혀 모르는 초보자
 * - 기초 (beginner): 변수/조건문/반복문을 들어본 사람
 * - 중급 (beginner_plus): 기본 문법을 알고 더 잘 쓰고 싶은 사람
 *
 * 사용법:
 *   cd apps/server
 *   npx tsx ../../scripts/seed-javascript-curriculum.ts
 *
 * 환경변수:
 *   DATABASE_URL: PostgreSQL 연결 문자열
 */

import { query, transaction, pool } from '../apps/server/src/db/index.js';

// =============================================
// JavaScript 커리큘럼 데이터
// =============================================

// 트랙 정의 (이미 존재하면 업데이트)
const TRACKS = [
  {
    id: 'js-beginner',
    language_id: 'javascript',
    name: 'JavaScript 입문',
    description: '프로그래밍을 처음 시작하는 분들을 위한 과정. 코딩이 뭔지 이해하기',
    target_level: 'beginner_zero',
    estimated_hours: 20,
    display_order: 0,
  },
  {
    id: 'js-basics',
    language_id: 'javascript',
    name: 'JavaScript 기초',
    description: '변수와 조건문을 알고 직접 코드를 작성하고 싶은 분들을 위한 과정',
    target_level: 'beginner',
    estimated_hours: 30,
    display_order: 1,
  },
  {
    id: 'js-intermediate',
    language_id: 'javascript',
    name: 'JavaScript 중급',
    description: '기본 문법을 알고 실무에서 쓰는 패턴을 익히고 싶은 분들을 위한 과정',
    target_level: 'beginner_plus',
    estimated_hours: 40,
    display_order: 2,
  },
];

// =============================================
// 입문 (beginner_zero) 스테이지 & 토픽
// =============================================
const BEGINNER_STAGES = [
  {
    id: 'js-intro-start',
    track_id: 'js-beginner',
    name: '프로그래밍 시작',
    description: '컴퓨터에게 명령 내리기, 첫 코드 실행',
    display_order: 1,
    topics: [
      { id: 'js-intro-what-is-programming', name: '프로그래밍이란', description: '컴퓨터에게 명령 내리기, 순서대로 실행되는 원리', display_order: 1 },
      { id: 'js-intro-console', name: '콘솔 출력', description: 'console.log로 첫 코드 실행하기', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-variables',
    track_id: 'js-beginner',
    name: '변수',
    description: '데이터를 저장하는 상자',
    display_order: 2,
    topics: [
      { id: 'js-intro-var-what', name: '변수란?', description: '상자에 물건 담기 비유, 변수의 개념', display_order: 1 },
      { id: 'js-intro-let-const', name: 'let vs const', description: '바꿀 수 있는 것 vs 없는 것', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-types',
    track_id: 'js-beginner',
    name: '자료형',
    description: '데이터의 종류',
    display_order: 3,
    topics: [
      { id: 'js-intro-number-string', name: '숫자와 문자열', description: '1 + 1 = 2, "안녕" + "하세요" = "안녕하세요"', display_order: 1 },
      { id: 'js-intro-boolean', name: '불리언', description: '참/거짓, true/false', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-conditionals',
    track_id: 'js-beginner',
    name: '조건문',
    description: '상황에 따라 다르게 실행',
    display_order: 4,
    topics: [
      { id: 'js-intro-if', name: 'if문 기본', description: '만약 ~라면', display_order: 1 },
      { id: 'js-intro-if-else', name: 'if-else', description: '그렇지 않으면', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-loops',
    track_id: 'js-beginner',
    name: '반복문',
    description: '같은 일을 여러 번',
    display_order: 5,
    topics: [
      { id: 'js-intro-for', name: 'for문 기본', description: '5번 반복해서 출력하기', display_order: 1 },
      { id: 'js-intro-while', name: 'while문', description: '~하는 동안 계속', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-functions',
    track_id: 'js-beginner',
    name: '함수',
    description: '재사용 가능한 코드 묶음',
    display_order: 6,
    topics: [
      { id: 'js-intro-func-what', name: '함수란?', description: '레시피, 재사용 가능한 코드 묶음', display_order: 1 },
      { id: 'js-intro-func-params', name: '매개변수와 반환', description: '입력 → 처리 → 출력', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-arrays',
    track_id: 'js-beginner',
    name: '배열',
    description: '여러 데이터를 한 줄로',
    display_order: 7,
    topics: [
      { id: 'js-intro-array-what', name: '배열이란?', description: '여러 개를 한 줄로 정리, [1, 2, 3]', display_order: 1 },
      { id: 'js-intro-array-index', name: '인덱스 접근', description: '0번째, 1번째... arr[0]', display_order: 2 },
    ],
  },
  {
    id: 'js-intro-objects',
    track_id: 'js-beginner',
    name: '객체',
    description: '이름표 붙은 데이터 묶음',
    display_order: 8,
    topics: [
      { id: 'js-intro-obj-what', name: '객체란?', description: '이름표 붙은 서랍장, {name: "Kim"}', display_order: 1 },
      { id: 'js-intro-obj-access', name: '속성 접근', description: 'person.name, person["name"]', display_order: 2 },
    ],
  },
];

// =============================================
// 기초 (beginner) 스테이지 & 토픽
// =============================================
const BASICS_STAGES = [
  {
    id: 'js-basics-variables',
    track_id: 'js-basics',
    name: '변수 심화',
    description: '변수의 범위와 동작 원리',
    display_order: 1,
    topics: [
      { id: 'js-basics-scope', name: '스코프', description: '블록 스코프, 변수가 보이는 범위', display_order: 1 },
      { id: 'js-basics-hoisting', name: '호이스팅', description: 'var vs let의 차이, 선언 끌어올림', display_order: 2 },
    ],
  },
  {
    id: 'js-basics-operators',
    track_id: 'js-basics',
    name: '연산자',
    description: '다양한 연산자 활용',
    display_order: 2,
    topics: [
      { id: 'js-basics-comparison', name: '비교 연산자', description: '==, ===, 타입까지 비교', display_order: 1 },
      { id: 'js-basics-logical', name: '논리 연산자', description: '&&, ||, !', display_order: 2 },
      { id: 'js-basics-ternary', name: '삼항 연산자', description: '조건 ? 참 : 거짓', display_order: 3 },
    ],
  },
  {
    id: 'js-basics-conditionals',
    track_id: 'js-basics',
    name: '조건문 심화',
    description: '더 복잡한 조건 처리',
    display_order: 3,
    topics: [
      { id: 'js-basics-switch', name: 'switch문', description: '여러 조건을 깔끔하게', display_order: 1 },
      { id: 'js-basics-nested-if', name: '조건 중첩 정리', description: 'if 안의 if 깔끔하게 정리하기', display_order: 2 },
    ],
  },
  {
    id: 'js-basics-loops',
    track_id: 'js-basics',
    name: '반복문 심화',
    description: '다양한 반복 방법',
    display_order: 4,
    topics: [
      { id: 'js-basics-for-of', name: 'for...of', description: '배열 요소 직접 순회', display_order: 1 },
      { id: 'js-basics-for-in', name: 'for...in', description: '객체 키 순회', display_order: 2 },
      { id: 'js-basics-foreach', name: 'forEach', description: '배열 메서드로 순회', display_order: 3 },
    ],
  },
  {
    id: 'js-basics-functions',
    track_id: 'js-basics',
    name: '함수 심화',
    description: '다양한 함수 활용법',
    display_order: 5,
    topics: [
      { id: 'js-basics-arrow', name: '화살표 함수', description: '() => {} 간결한 문법', display_order: 1 },
      { id: 'js-basics-callback', name: '콜백 함수', description: '함수를 인자로 전달', display_order: 2 },
      { id: 'js-basics-default-params', name: '기본 매개변수', description: 'function(a = 10)', display_order: 3 },
    ],
  },
  {
    id: 'js-basics-array-methods',
    track_id: 'js-basics',
    name: '배열 메서드',
    description: '배열을 다루는 강력한 도구들',
    display_order: 6,
    topics: [
      { id: 'js-basics-map', name: 'map', description: '배열 변환, 새 배열 반환', display_order: 1 },
      { id: 'js-basics-filter', name: 'filter', description: '조건에 맞는 요소만 걸러내기', display_order: 2 },
      { id: 'js-basics-find', name: 'find / findIndex', description: '요소 찾기', display_order: 3 },
    ],
  },
  {
    id: 'js-basics-objects',
    track_id: 'js-basics',
    name: '객체 심화',
    description: '객체를 더 잘 다루기',
    display_order: 7,
    topics: [
      { id: 'js-basics-methods', name: '메서드', description: '객체 안의 함수', display_order: 1 },
      { id: 'js-basics-this', name: 'this 기본', description: '나 자신을 가리킴', display_order: 2 },
      { id: 'js-basics-destructuring', name: '구조분해 할당', description: 'const { name } = person', display_order: 3 },
    ],
  },
  {
    id: 'js-basics-string-number',
    track_id: 'js-basics',
    name: '문자열과 숫자',
    description: '내장 메서드 활용',
    display_order: 8,
    topics: [
      { id: 'js-basics-string-methods', name: '문자열 메서드', description: 'split, join, slice, includes', display_order: 1 },
      { id: 'js-basics-math', name: '숫자와 Math', description: 'Math.random, 반올림, 최대/최소', display_order: 2 },
    ],
  },
];

// =============================================
// 중급 (beginner_plus) 스테이지 & 토픽
// =============================================
const INTERMEDIATE_STAGES = [
  {
    id: 'js-inter-scope',
    track_id: 'js-intermediate',
    name: '변수/스코프 고급',
    description: '클로저와 렉시컬 스코프',
    display_order: 1,
    topics: [
      { id: 'js-inter-closure', name: '클로저', description: '함수가 환경을 기억하는 원리', display_order: 1 },
      { id: 'js-inter-lexical', name: '렉시컬 스코프', description: '선언 위치 기준 스코프 결정', display_order: 2 },
    ],
  },
  {
    id: 'js-inter-functions',
    track_id: 'js-intermediate',
    name: '함수 고급',
    description: '함수형 프로그래밍 기법',
    display_order: 2,
    topics: [
      { id: 'js-inter-higher-order', name: '고차 함수', description: '함수를 반환하는 함수', display_order: 1 },
      { id: 'js-inter-currying', name: '커링', description: 'add(1)(2)(3) 패턴', display_order: 2 },
      { id: 'js-inter-memoization', name: '메모이제이션', description: '결과 캐싱으로 성능 향상', display_order: 3 },
    ],
  },
  {
    id: 'js-inter-iteration',
    track_id: 'js-intermediate',
    name: '반복/순회 고급',
    description: '고급 반복 패턴',
    display_order: 3,
    topics: [
      { id: 'js-inter-reduce', name: 'reduce', description: '배열을 하나의 값으로', display_order: 1 },
      { id: 'js-inter-recursion', name: '재귀', description: '함수가 자신을 호출', display_order: 2 },
      { id: 'js-inter-generators', name: '이터레이터/제너레이터', description: 'function*, yield', display_order: 3 },
    ],
  },
  {
    id: 'js-inter-objects',
    track_id: 'js-intermediate',
    name: '객체 고급',
    description: '프로토타입과 클래스',
    display_order: 4,
    topics: [
      { id: 'js-inter-prototype', name: '프로토타입', description: 'JavaScript 상속의 원리', display_order: 1 },
      { id: 'js-inter-class', name: '클래스', description: 'ES6 class 문법', display_order: 2 },
      { id: 'js-inter-this-binding', name: 'this 바인딩', description: 'bind, call, apply', display_order: 3 },
    ],
  },
  {
    id: 'js-inter-async',
    track_id: 'js-intermediate',
    name: '비동기',
    description: '비동기 프로그래밍 완전 정복',
    display_order: 5,
    topics: [
      { id: 'js-inter-callback-hell', name: '콜백 지옥', description: '왜 Promise가 필요한가', display_order: 1 },
      { id: 'js-inter-promise', name: 'Promise', description: 'resolve, reject, then, catch', display_order: 2 },
      { id: 'js-inter-async-await', name: 'async/await', description: '동기처럼 쓰는 비동기', display_order: 3 },
    ],
  },
  {
    id: 'js-inter-error',
    track_id: 'js-intermediate',
    name: '에러 처리',
    description: '견고한 코드를 위한 에러 처리',
    display_order: 6,
    topics: [
      { id: 'js-inter-try-catch', name: 'try-catch', description: '에러 잡기', display_order: 1 },
      { id: 'js-inter-custom-error', name: '커스텀 에러', description: 'throw new Error, 에러 클래스', display_order: 2 },
      { id: 'js-inter-error-propagation', name: '에러 전파', description: '어디서 잡을 것인가', display_order: 3 },
    ],
  },
  {
    id: 'js-inter-modules',
    track_id: 'js-intermediate',
    name: '모듈',
    description: '코드 분리와 재사용',
    display_order: 7,
    topics: [
      { id: 'js-inter-import-export', name: 'import/export', description: '파일 분리하기', display_order: 1 },
      { id: 'js-inter-default-named', name: 'default vs named', description: '내보내기 방식의 차이', display_order: 2 },
    ],
  },
  {
    id: 'js-inter-patterns',
    track_id: 'js-intermediate',
    name: '실무 패턴',
    description: '현업에서 자주 쓰는 패턴',
    display_order: 8,
    topics: [
      { id: 'js-inter-short-circuit', name: '단축 평가', description: '&& || 활용 패턴', display_order: 1 },
      { id: 'js-inter-optional-chaining', name: '옵셔널 체이닝', description: '?. 안전한 접근', display_order: 2 },
      { id: 'js-inter-nullish', name: '널 병합 연산자', description: '?? null/undefined 처리', display_order: 3 },
    ],
  },
];

// 모든 스테이지 합치기
const ALL_STAGES = [...BEGINNER_STAGES, ...BASICS_STAGES, ...INTERMEDIATE_STAGES];

// =============================================
// 시드 실행 함수
// =============================================

async function seedJavaScriptCurriculum() {
  console.log('🚀 JavaScript 커리큘럼 시드 시작...\n');

  try {
    await transaction(async (client) => {
      // 1. 관련 테이블 데이터 먼저 삭제 (FK 제약 해제)
      console.log('📦 관련 데이터 삭제 중...');

      // question_bank 삭제
      await client.query(`DELETE FROM question_bank WHERE language = 'javascript'`);
      console.log('  - question_bank 삭제 완료');

      // question_generation_jobs 삭제
      await client.query(`DELETE FROM question_generation_jobs WHERE language = 'javascript'`);
      console.log('  - question_generation_jobs 삭제 완료');

      // learning_progress 삭제
      await client.query(`DELETE FROM learning_progress WHERE language = 'javascript'`);
      console.log('  - learning_progress 삭제 완료');

      // 2. 기존 JavaScript 토픽 삭제 (CASCADE로 concepts도 삭제됨)
      console.log('📦 기존 JavaScript 토픽 삭제 중...');
      await client.query(`
        DELETE FROM curriculum_topics
        WHERE stage_id IN (
          SELECT s.id FROM curriculum_stages s
          JOIN curriculum_tracks t ON s.track_id = t.id
          WHERE t.language_id = 'javascript'
        )
      `);

      // 2. 기존 JavaScript 스테이지 삭제
      console.log('📦 기존 JavaScript 스테이지 삭제 중...');
      await client.query(`
        DELETE FROM curriculum_stages
        WHERE track_id IN (
          SELECT id FROM curriculum_tracks WHERE language_id = 'javascript'
        )
      `);

      // 3. 트랙 업데이트 (UPSERT)
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

      // 4. 스테이지 & 토픽 생성
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

      console.log('\n✨ JavaScript 커리큘럼 시드 완료!');
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
seedJavaScriptCurriculum().catch((err) => {
  console.error(err);
  process.exit(1);
});
