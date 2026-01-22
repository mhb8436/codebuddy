/**
 * 시험 기능 통합 테스트를 위한 테스트 데이터 설정 스크립트
 *
 * 사용법:
 *   cd apps/server
 *   npx tsx ../../scripts/setup-test-data.ts
 */

import { query, transaction, pool } from '../apps/server/src/db/index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const TEST_DATA = {
  // 테스트 반
  class: {
    id: uuidv4(),
    name: '테스트반',
    inviteCode: 'TEST123',
  },

  // 테스트 계정
  admin: {
    id: uuidv4(),
    email: 'admin@test.com',
    password: 'admin123',
    name: '관리자',
    role: 'admin',
  },

  student: {
    id: uuidv4(),
    email: 'student@test.com',
    password: 'student123',
    name: '학생',
    role: 'student',
  },

  // 테스트 문제 (승인된 상태)
  approvedQuestions: [
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'easy' as const,
      points: 10,
      title: '변수 선언하기',
      description: '이름을 저장하는 변수를 선언하고 "홍길동"을 할당한 후 출력하세요.',
      requirements: ['let 키워드 사용', 'console.log로 출력'],
      testCases: [
        {
          description: '이름 출력 테스트',
          expectedOutput: '홍길동',
          points: 10,
        },
      ],
      sampleAnswer: 'let name = "홍길동";\nconsole.log(name);',
      status: 'approved' as const,
    },
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'easy' as const,
      points: 10,
      title: '숫자 변수 연산',
      description: '두 숫자를 더한 결과를 출력하세요. a=5, b=3일 때 a+b를 출력합니다.',
      requirements: ['변수 두 개 선언', '덧셈 결과 출력'],
      testCases: [
        {
          description: '덧셈 결과 테스트',
          expectedOutput: '8',
          points: 10,
        },
      ],
      sampleAnswer: 'let a = 5;\nlet b = 3;\nconsole.log(a + b);',
      status: 'approved' as const,
    },
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'medium' as const,
      points: 15,
      title: '변수 교환하기',
      description: '임시 변수를 사용하여 두 변수의 값을 교환하고, 교환 후 값을 출력하세요.',
      requirements: ['임시 변수 사용', '두 줄에 걸쳐 출력'],
      testCases: [
        {
          description: '교환 결과 테스트',
          expectedOutput: '20\n10',
          points: 15,
        },
      ],
      sampleAnswer: 'let a = 10;\nlet b = 20;\nlet temp = a;\na = b;\nb = temp;\nconsole.log(a);\nconsole.log(b);',
      status: 'approved' as const,
    },
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'medium' as const,
      points: 15,
      title: 'const와 let 구분하기',
      description: '상수 PI=3.14와 변수 radius=5를 선언하고, 원의 둘레(2*PI*radius)를 출력하세요.',
      requirements: ['const 사용', 'let 사용', '둘레 계산'],
      testCases: [
        {
          description: '원 둘레 계산 테스트',
          expectedOutput: '31.400000000000002',
          points: 15,
        },
      ],
      sampleAnswer: 'const PI = 3.14;\nlet radius = 5;\nconsole.log(2 * PI * radius);',
      status: 'approved' as const,
    },
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'hard' as const,
      points: 20,
      title: '구조 분해 할당',
      description: '객체에서 구조 분해 할당을 사용하여 name과 age를 추출하고 출력하세요.',
      requirements: ['객체 생성', '구조 분해 할당 사용', '두 값 출력'],
      testCases: [
        {
          description: '구조 분해 할당 테스트',
          expectedOutput: '김철수\n25',
          points: 20,
        },
      ],
      sampleAnswer: 'const person = { name: "김철수", age: 25 };\nconst { name, age } = person;\nconsole.log(name);\nconsole.log(age);',
      status: 'approved' as const,
    },
  ],

  // 테스트 문제 (대기 중)
  pendingQuestions: [
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'easy' as const,
      points: 10,
      title: '[대기중] 문자열 연결',
      description: '두 문자열을 연결하여 출력하세요.',
      requirements: ['문자열 연결'],
      testCases: [
        {
          description: '문자열 연결 테스트',
          expectedOutput: 'Hello World',
          points: 10,
        },
      ],
      sampleAnswer: 'console.log("Hello" + " " + "World");',
      status: 'pending' as const,
    },
    {
      language: 'javascript',
      trackId: 'beginner-fundamentals',
      topicId: 'variables',
      difficulty: 'medium' as const,
      points: 15,
      title: '[대기중] 템플릿 리터럴',
      description: '템플릿 리터럴을 사용하여 변수를 문자열에 삽입하세요.',
      requirements: ['템플릿 리터럴 사용'],
      testCases: [
        {
          description: '템플릿 리터럴 테스트',
          expectedOutput: '이름: 홍길동, 나이: 30',
          points: 15,
        },
      ],
      sampleAnswer: 'const name = "홍길동";\nconst age = 30;\nconsole.log(`이름: ${name}, 나이: ${age}`);',
      status: 'pending' as const,
    },
  ],
};

async function setupTestData() {
  console.log('🚀 테스트 데이터 설정 시작...\n');

  try {
    await transaction(async (client) => {
      // 1. 기존 테스트 데이터 정리
      console.log('🗑️  기존 테스트 데이터 정리 중...');
      await client.query(`DELETE FROM users WHERE email IN ($1, $2)`, [
        TEST_DATA.admin.email,
        TEST_DATA.student.email,
      ]);
      await client.query(`DELETE FROM classes WHERE invite_code = $1`, [
        TEST_DATA.class.inviteCode,
      ]);
      await client.query(`DELETE FROM question_bank WHERE track_id = $1`, [
        'beginner-fundamentals',
      ]);

      // 2. 테스트 반 생성
      console.log('📚 테스트 반 생성 중...');
      await client.query(
        `INSERT INTO classes (id, name, invite_code, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [TEST_DATA.class.id, TEST_DATA.class.name, TEST_DATA.class.inviteCode]
      );

      // 3. 관리자 계정 생성
      console.log('👤 관리자 계정 생성 중...');
      const adminHash = await bcrypt.hash(TEST_DATA.admin.password, 10);
      await client.query(
        `INSERT INTO users (id, email, password_hash, name, role, class_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          TEST_DATA.admin.id,
          TEST_DATA.admin.email,
          adminHash,
          TEST_DATA.admin.name,
          TEST_DATA.admin.role,
          TEST_DATA.class.id,
        ]
      );

      // 4. 학생 계정 생성
      console.log('👤 학생 계정 생성 중...');
      const studentHash = await bcrypt.hash(TEST_DATA.student.password, 10);
      await client.query(
        `INSERT INTO users (id, email, password_hash, name, role, class_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          TEST_DATA.student.id,
          TEST_DATA.student.email,
          studentHash,
          TEST_DATA.student.name,
          TEST_DATA.student.role,
          TEST_DATA.class.id,
        ]
      );

      // 5. 승인된 문제 추가
      console.log('✅ 승인된 문제 추가 중...');
      for (const q of TEST_DATA.approvedQuestions) {
        await client.query(
          `INSERT INTO question_bank (
            id, language, track_id, topic_id, difficulty, points,
            title, description, requirements, test_cases, sample_answer,
            status, created_by, approved_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, NOW(), NOW())`,
          [
            uuidv4(),
            q.language,
            q.trackId,
            q.topicId,
            q.difficulty,
            q.points,
            q.title,
            q.description,
            JSON.stringify(q.requirements),
            JSON.stringify(q.testCases),
            q.sampleAnswer,
            q.status,
            TEST_DATA.admin.id,
          ]
        );
      }
      console.log(`   → ${TEST_DATA.approvedQuestions.length}개 승인된 문제 추가됨`);

      // 6. 대기 중 문제 추가
      console.log('⏳ 대기 중 문제 추가 중...');
      for (const q of TEST_DATA.pendingQuestions) {
        await client.query(
          `INSERT INTO question_bank (
            id, language, track_id, topic_id, difficulty, points,
            title, description, requirements, test_cases, sample_answer,
            status, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
          [
            uuidv4(),
            q.language,
            q.trackId,
            q.topicId,
            q.difficulty,
            q.points,
            q.title,
            q.description,
            JSON.stringify(q.requirements),
            JSON.stringify(q.testCases),
            q.sampleAnswer,
            q.status,
            TEST_DATA.admin.id,
          ]
        );
      }
      console.log(`   → ${TEST_DATA.pendingQuestions.length}개 대기 중 문제 추가됨`);
    });

    console.log('\n✨ 테스트 데이터 설정 완료!\n');
    console.log('='.repeat(50));
    console.log('테스트 계정 정보:');
    console.log('='.repeat(50));
    console.log(`\n관리자:`);
    console.log(`  이메일: ${TEST_DATA.admin.email}`);
    console.log(`  비밀번호: ${TEST_DATA.admin.password}`);
    console.log(`\n학생:`);
    console.log(`  이메일: ${TEST_DATA.student.email}`);
    console.log(`  비밀번호: ${TEST_DATA.student.password}`);
    console.log(`\n초대 코드: ${TEST_DATA.class.inviteCode}`);
    console.log('='.repeat(50));
    console.log('\n문제 은행 현황:');
    console.log(`  - 승인된 문제: ${TEST_DATA.approvedQuestions.length}개`);
    console.log(`  - 대기 중 문제: ${TEST_DATA.pendingQuestions.length}개`);
    console.log(`  - 트랙: beginner-fundamentals`);
    console.log(`  - 토픽: variables`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ 테스트 데이터 설정 실패:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
setupTestData().catch(console.error);
