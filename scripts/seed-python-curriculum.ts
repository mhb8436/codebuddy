/**
 * Python 커리큘럼 시드 스크립트
 *
 * 스파이럴 학습법 기반 커리큘럼:
 * - 입문 (beginner_zero): 코딩을 전혀 모르는 초보자
 * - 기초 (beginner): 변수/조건문/반복문을 들어본 사람
 * - 중급 (beginner_plus): 기본 문법을 알고 더 잘 쓰고 싶은 사람
 *
 * 사용법:
 *   cd apps/server
 *   npx tsx ../../scripts/seed-python-curriculum.ts
 *
 * 환경변수:
 *   DATABASE_URL: PostgreSQL 연결 문자열
 */

import { query, transaction, pool } from '../apps/server/src/db/index.js';

// =============================================
// Python 커리큘럼 데이터
// =============================================

// 트랙 정의 (이미 존재하면 업데이트)
const TRACKS = [
  {
    id: 'py-beginner',
    language_id: 'python',
    name: 'Python 입문',
    description: '프로그래밍을 처음 시작하는 분들을 위한 과정. 코딩이 뭔지 이해하기',
    target_level: 'beginner_zero',
    estimated_hours: 20,
    display_order: 0,
  },
  {
    id: 'py-basics',
    language_id: 'python',
    name: 'Python 기초',
    description: '변수와 조건문을 알고 직접 코드를 작성하고 싶은 분들을 위한 과정',
    target_level: 'beginner',
    estimated_hours: 30,
    display_order: 1,
  },
  {
    id: 'py-intermediate',
    language_id: 'python',
    name: 'Python 중급',
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
    id: 'py-intro-start',
    track_id: 'py-beginner',
    name: '프로그래밍 시작',
    description: '컴퓨터에게 명령 내리기, 첫 코드 실행',
    display_order: 1,
    topics: [
      { id: 'py-intro-what-is-programming', name: '프로그래밍이란', description: '컴퓨터에게 명령 내리기, 순서대로 실행되는 원리', display_order: 1 },
      { id: 'py-intro-print', name: '출력하기', description: 'print()로 첫 코드 실행하기', display_order: 2 },
      { id: 'py-intro-input', name: '입력받기', description: 'input()으로 사용자 입력 받기', display_order: 3 },
    ],
  },
  {
    id: 'py-intro-variables',
    track_id: 'py-beginner',
    name: '변수',
    description: '데이터를 저장하는 상자',
    display_order: 2,
    topics: [
      { id: 'py-intro-var-what', name: '변수란?', description: '상자에 물건 담기 비유, 변수의 개념', display_order: 1 },
      { id: 'py-intro-var-naming', name: '변수 이름 짓기', description: '변수명 규칙, 좋은 이름 짓기', display_order: 2 },
    ],
  },
  {
    id: 'py-intro-types',
    track_id: 'py-beginner',
    name: '자료형',
    description: '데이터의 종류',
    display_order: 3,
    topics: [
      { id: 'py-intro-number', name: '숫자', description: '정수(int)와 실수(float), 사칙연산', display_order: 1 },
      { id: 'py-intro-string', name: '문자열', description: '"안녕" + "하세요", 문자열 연결', display_order: 2 },
      { id: 'py-intro-boolean', name: '불리언', description: 'True/False, 참과 거짓', display_order: 3 },
    ],
  },
  {
    id: 'py-intro-conditionals',
    track_id: 'py-beginner',
    name: '조건문',
    description: '상황에 따라 다르게 실행',
    display_order: 4,
    topics: [
      { id: 'py-intro-if', name: 'if문 기본', description: '만약 ~라면', display_order: 1 },
      { id: 'py-intro-if-else', name: 'if-else', description: '그렇지 않으면', display_order: 2 },
      { id: 'py-intro-elif', name: 'elif', description: '여러 조건 검사하기', display_order: 3 },
    ],
  },
  {
    id: 'py-intro-loops',
    track_id: 'py-beginner',
    name: '반복문',
    description: '같은 일을 여러 번',
    display_order: 5,
    topics: [
      { id: 'py-intro-for', name: 'for문 기본', description: 'for i in range(5): 5번 반복', display_order: 1 },
      { id: 'py-intro-while', name: 'while문', description: '~하는 동안 계속', display_order: 2 },
    ],
  },
  {
    id: 'py-intro-functions',
    track_id: 'py-beginner',
    name: '함수',
    description: '재사용 가능한 코드 묶음',
    display_order: 6,
    topics: [
      { id: 'py-intro-func-what', name: '함수란?', description: '레시피, 재사용 가능한 코드 묶음', display_order: 1 },
      { id: 'py-intro-func-def', name: '함수 정의', description: 'def 함수이름():', display_order: 2 },
      { id: 'py-intro-func-params', name: '매개변수와 반환', description: '입력 → 처리 → return 출력', display_order: 3 },
    ],
  },
  {
    id: 'py-intro-lists',
    track_id: 'py-beginner',
    name: '리스트',
    description: '여러 데이터를 한 줄로',
    display_order: 7,
    topics: [
      { id: 'py-intro-list-what', name: '리스트란?', description: '여러 개를 한 줄로 정리, [1, 2, 3]', display_order: 1 },
      { id: 'py-intro-list-index', name: '인덱스 접근', description: '0번째, 1번째... list[0]', display_order: 2 },
      { id: 'py-intro-list-methods', name: '기본 메서드', description: 'append, remove, len', display_order: 3 },
    ],
  },
  {
    id: 'py-intro-dict',
    track_id: 'py-beginner',
    name: '딕셔너리',
    description: '키-값 쌍으로 데이터 저장',
    display_order: 8,
    topics: [
      { id: 'py-intro-dict-what', name: '딕셔너리란?', description: '이름표 붙은 서랍장, {"name": "Kim"}', display_order: 1 },
      { id: 'py-intro-dict-access', name: '값 접근', description: 'person["name"], person.get("name")', display_order: 2 },
    ],
  },
];

// =============================================
// 기초 (beginner) 스테이지 & 토픽
// =============================================
const BASICS_STAGES = [
  {
    id: 'py-basics-types',
    track_id: 'py-basics',
    name: '자료형 심화',
    description: '타입 변환과 확인',
    display_order: 1,
    topics: [
      { id: 'py-basics-type-convert', name: '타입 변환', description: 'int(), str(), float() 형변환', display_order: 1 },
      { id: 'py-basics-type-check', name: '타입 확인', description: 'type(), isinstance()', display_order: 2 },
    ],
  },
  {
    id: 'py-basics-operators',
    track_id: 'py-basics',
    name: '연산자',
    description: '다양한 연산자 활용',
    display_order: 2,
    topics: [
      { id: 'py-basics-comparison', name: '비교 연산자', description: '==, !=, <, >, <=, >=', display_order: 1 },
      { id: 'py-basics-logical', name: '논리 연산자', description: 'and, or, not', display_order: 2 },
      { id: 'py-basics-membership', name: '멤버십 연산자', description: 'in, not in', display_order: 3 },
    ],
  },
  {
    id: 'py-basics-strings',
    track_id: 'py-basics',
    name: '문자열 심화',
    description: '문자열 다루기',
    display_order: 3,
    topics: [
      { id: 'py-basics-string-methods', name: '문자열 메서드', description: 'split, join, strip, replace', display_order: 1 },
      { id: 'py-basics-string-format', name: '문자열 포맷팅', description: 'f-string, format()', display_order: 2 },
      { id: 'py-basics-string-slice', name: '슬라이싱', description: 'text[1:5], text[::2]', display_order: 3 },
    ],
  },
  {
    id: 'py-basics-loops',
    track_id: 'py-basics',
    name: '반복문 심화',
    description: '다양한 반복 패턴',
    display_order: 4,
    topics: [
      { id: 'py-basics-for-enumerate', name: 'enumerate', description: '인덱스와 값 함께 순회', display_order: 1 },
      { id: 'py-basics-for-zip', name: 'zip', description: '여러 리스트 동시 순회', display_order: 2 },
      { id: 'py-basics-break-continue', name: 'break와 continue', description: '반복문 제어', display_order: 3 },
    ],
  },
  {
    id: 'py-basics-functions',
    track_id: 'py-basics',
    name: '함수 심화',
    description: '다양한 함수 활용법',
    display_order: 5,
    topics: [
      { id: 'py-basics-default-args', name: '기본 매개변수', description: 'def func(a=10):', display_order: 1 },
      { id: 'py-basics-args-kwargs', name: '*args와 **kwargs', description: '가변 인자', display_order: 2 },
      { id: 'py-basics-lambda', name: '람다 함수', description: 'lambda x: x + 1', display_order: 3 },
    ],
  },
  {
    id: 'py-basics-list-methods',
    track_id: 'py-basics',
    name: '리스트 메서드',
    description: '리스트를 다루는 강력한 도구들',
    display_order: 6,
    topics: [
      { id: 'py-basics-list-comprehension', name: '리스트 컴프리헨션', description: '[x*2 for x in range(10)]', display_order: 1 },
      { id: 'py-basics-list-sort', name: '정렬', description: 'sort(), sorted(), reverse()', display_order: 2 },
      { id: 'py-basics-list-slice', name: '리스트 슬라이싱', description: 'list[1:5], list[::2]', display_order: 3 },
    ],
  },
  {
    id: 'py-basics-dict-methods',
    track_id: 'py-basics',
    name: '딕셔너리 심화',
    description: '딕셔너리 활용법',
    display_order: 7,
    topics: [
      { id: 'py-basics-dict-methods', name: '딕셔너리 메서드', description: 'keys(), values(), items()', display_order: 1 },
      { id: 'py-basics-dict-comprehension', name: '딕셔너리 컴프리헨션', description: '{k: v for k, v in items}', display_order: 2 },
      { id: 'py-basics-dict-get', name: '안전한 접근', description: 'get(), setdefault()', display_order: 3 },
    ],
  },
  {
    id: 'py-basics-tuple-set',
    track_id: 'py-basics',
    name: '튜플과 세트',
    description: '다른 컬렉션 타입들',
    display_order: 8,
    topics: [
      { id: 'py-basics-tuple', name: '튜플', description: '변경 불가능한 리스트, (1, 2, 3)', display_order: 1 },
      { id: 'py-basics-set', name: '세트', description: '중복 없는 집합, {1, 2, 3}', display_order: 2 },
      { id: 'py-basics-set-operations', name: '집합 연산', description: '합집합, 교집합, 차집합', display_order: 3 },
    ],
  },
];

// =============================================
// 중급 (beginner_plus) 스테이지 & 토픽
// =============================================
const INTERMEDIATE_STAGES = [
  {
    id: 'py-inter-scope',
    track_id: 'py-intermediate',
    name: '스코프와 네임스페이스',
    description: '변수의 범위와 이름 공간',
    display_order: 1,
    topics: [
      { id: 'py-inter-scope-legb', name: 'LEGB 규칙', description: 'Local, Enclosing, Global, Built-in', display_order: 1 },
      { id: 'py-inter-global-nonlocal', name: 'global과 nonlocal', description: '외부 스코프 변수 접근', display_order: 2 },
    ],
  },
  {
    id: 'py-inter-functions',
    track_id: 'py-intermediate',
    name: '함수 고급',
    description: '함수형 프로그래밍 기법',
    display_order: 2,
    topics: [
      { id: 'py-inter-closure', name: '클로저', description: '함수가 환경을 기억하는 원리', display_order: 1 },
      { id: 'py-inter-decorator', name: '데코레이터', description: '@decorator 함수 꾸미기', display_order: 2 },
      { id: 'py-inter-higher-order', name: '고차 함수', description: 'map, filter, reduce', display_order: 3 },
    ],
  },
  {
    id: 'py-inter-iteration',
    track_id: 'py-intermediate',
    name: '이터레이션 고급',
    description: '고급 반복 패턴',
    display_order: 3,
    topics: [
      { id: 'py-inter-iterator', name: '이터레이터', description: '__iter__, __next__', display_order: 1 },
      { id: 'py-inter-generator', name: '제너레이터', description: 'yield, 메모리 효율적 순회', display_order: 2 },
      { id: 'py-inter-itertools', name: 'itertools', description: 'chain, combinations, permutations', display_order: 3 },
    ],
  },
  {
    id: 'py-inter-oop',
    track_id: 'py-intermediate',
    name: '객체지향 프로그래밍',
    description: '클래스와 객체',
    display_order: 4,
    topics: [
      { id: 'py-inter-class-basic', name: '클래스 기본', description: 'class, __init__, self', display_order: 1 },
      { id: 'py-inter-inheritance', name: '상속', description: '부모 클래스, super()', display_order: 2 },
      { id: 'py-inter-magic-methods', name: '매직 메서드', description: '__str__, __repr__, __len__', display_order: 3 },
      { id: 'py-inter-property', name: '프로퍼티', description: '@property, getter/setter', display_order: 4 },
    ],
  },
  {
    id: 'py-inter-error',
    track_id: 'py-intermediate',
    name: '에러 처리',
    description: '견고한 코드를 위한 예외 처리',
    display_order: 5,
    topics: [
      { id: 'py-inter-try-except', name: 'try-except', description: '예외 잡기', display_order: 1 },
      { id: 'py-inter-custom-exception', name: '커스텀 예외', description: 'raise, 예외 클래스 정의', display_order: 2 },
      { id: 'py-inter-finally', name: 'finally와 else', description: '정리 작업, 성공 시 실행', display_order: 3 },
    ],
  },
  {
    id: 'py-inter-files',
    track_id: 'py-intermediate',
    name: '파일 처리',
    description: '파일 읽기/쓰기',
    display_order: 6,
    topics: [
      { id: 'py-inter-file-basic', name: '파일 기본', description: 'open, read, write, close', display_order: 1 },
      { id: 'py-inter-with', name: 'with문', description: '컨텍스트 매니저, 안전한 파일 처리', display_order: 2 },
      { id: 'py-inter-json', name: 'JSON 처리', description: 'json.load, json.dump', display_order: 3 },
    ],
  },
  {
    id: 'py-inter-modules',
    track_id: 'py-intermediate',
    name: '모듈과 패키지',
    description: '코드 분리와 재사용',
    display_order: 7,
    topics: [
      { id: 'py-inter-import', name: 'import', description: 'import, from, as', display_order: 1 },
      { id: 'py-inter-package', name: '패키지 구조', description: '__init__.py, 패키지 만들기', display_order: 2 },
      { id: 'py-inter-pip', name: 'pip와 가상환경', description: 'pip install, venv', display_order: 3 },
    ],
  },
  {
    id: 'py-inter-patterns',
    track_id: 'py-intermediate',
    name: '실무 패턴',
    description: '현업에서 자주 쓰는 패턴',
    display_order: 8,
    topics: [
      { id: 'py-inter-comprehension-adv', name: '컴프리헨션 고급', description: '중첩, 조건부 컴프리헨션', display_order: 1 },
      { id: 'py-inter-unpacking', name: '언패킹', description: 'a, b = b, a / *args 활용', display_order: 2 },
      { id: 'py-inter-walrus', name: '왈러스 연산자', description: ':= 할당 표현식', display_order: 3 },
    ],
  },
];

// 모든 스테이지 합치기
const ALL_STAGES = [...BEGINNER_STAGES, ...BASICS_STAGES, ...INTERMEDIATE_STAGES];

// =============================================
// 시드 실행 함수
// =============================================

async function seedPythonCurriculum() {
  console.log('🚀 Python 커리큘럼 시드 시작...\n');

  try {
    await transaction(async (client) => {
      // 1. 관련 테이블 데이터 먼저 삭제 (FK 제약 해제)
      console.log('📦 관련 데이터 삭제 중...');

      // question_bank 삭제
      await client.query(`DELETE FROM question_bank WHERE language = 'python'`);
      console.log('  - question_bank 삭제 완료');

      // question_generation_jobs 삭제
      await client.query(`DELETE FROM question_generation_jobs WHERE language = 'python'`);
      console.log('  - question_generation_jobs 삭제 완료');

      // learning_progress 삭제
      await client.query(`DELETE FROM learning_progress WHERE language = 'python'`);
      console.log('  - learning_progress 삭제 완료');

      // 2. 기존 Python 토픽 삭제 (CASCADE로 concepts도 삭제됨)
      console.log('📦 기존 Python 토픽 삭제 중...');
      await client.query(`
        DELETE FROM curriculum_topics
        WHERE stage_id IN (
          SELECT s.id FROM curriculum_stages s
          JOIN curriculum_tracks t ON s.track_id = t.id
          WHERE t.language_id = 'python'
        )
      `);

      // 3. 기존 Python 스테이지 삭제
      console.log('📦 기존 Python 스테이지 삭제 중...');
      await client.query(`
        DELETE FROM curriculum_stages
        WHERE track_id IN (
          SELECT id FROM curriculum_tracks WHERE language_id = 'python'
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

      console.log('\n✨ Python 커리큘럼 시드 완료!');
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
seedPythonCurriculum().catch((err) => {
  console.error(err);
  process.exit(1);
});
