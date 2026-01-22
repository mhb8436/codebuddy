/**
 * 운영 환경 초기 데이터 설정 스크립트
 *
 * 포함 내용:
 * - 기본 관리자/강사 계정
 * - 기본 반(Class) 설정
 * - 샘플 학생 계정
 * - 문제 은행 기초 데이터 (각 언어별 토픽당 3-5문제)
 *
 * 사용법:
 *   cd apps/server
 *   npx tsx ../../scripts/seed-production.ts
 *
 * 환경변수:
 *   DATABASE_URL: PostgreSQL 연결 문자열
 *   ADMIN_PASSWORD: 관리자 비밀번호 (기본: admin1234!)
 *   INSTRUCTOR_PASSWORD: 강사 비밀번호 (기본: instructor123!)
 */

import { query, transaction, pool } from '../apps/server/src/db/index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// =============================================
// 설정
// =============================================
const CONFIG = {
  adminPassword: process.env.ADMIN_PASSWORD || 'admin1234!',
  instructorPassword: process.env.INSTRUCTOR_PASSWORD || 'instructor123!',
  defaultStudentPassword: 'student123!',
};

// =============================================
// 초기 데이터 정의
// =============================================

// 1. 반(Class) 데이터
const CLASSES = [
  {
    id: uuidv4(),
    name: '웹개발 기초반 A',
    inviteCode: 'WEBA01',
    maxStudents: 25,
  },
  {
    id: uuidv4(),
    name: '웹개발 기초반 B',
    inviteCode: 'WEBB01',
    maxStudents: 25,
  },
  {
    id: uuidv4(),
    name: 'Python 데이터 분석반',
    inviteCode: 'PYDA01',
    maxStudents: 20,
  },
  {
    id: uuidv4(),
    name: 'TypeScript 실무반',
    inviteCode: 'TSPRO01',
    maxStudents: 15,
  },
];

// 2. 관리자/강사 계정
const STAFF_ACCOUNTS = [
  {
    id: uuidv4(),
    email: 'admin@codebuddy.io',
    name: '시스템 관리자',
    role: 'admin',
    level: 'beginner_plus',
    classIndex: null, // 반 소속 없음
  },
  {
    id: uuidv4(),
    email: 'instructor1@codebuddy.io',
    name: '김강사',
    role: 'instructor',
    level: 'beginner_plus',
    classIndex: 0, // 웹개발 기초반 A
  },
  {
    id: uuidv4(),
    email: 'instructor2@codebuddy.io',
    name: '이강사',
    role: 'instructor',
    level: 'beginner_plus',
    classIndex: 2, // Python 데이터 분석반
  },
];

// 3. 샘플 학생 계정 (테스트용)
const SAMPLE_STUDENTS = [
  { name: '홍길동', email: 'hong@example.com', level: 'beginner_zero', classIndex: 0 },
  { name: '김철수', email: 'kim@example.com', level: 'beginner', classIndex: 0 },
  { name: '이영희', email: 'lee@example.com', level: 'beginner_plus', classIndex: 1 },
  { name: '박민수', email: 'park@example.com', level: 'beginner_zero', classIndex: 2 },
  { name: '최지원', email: 'choi@example.com', level: 'beginner', classIndex: 3 },
];

// 4. 커리큘럼 개념(Concepts) 데이터
const CURRICULUM_CONCEPTS = [
  // ========================================
  // JavaScript - js-beginner
  // ========================================
  // js-basic stage -> variables topic
  {
    id: 'js-let-keyword',
    topicId: 'variables',
    name: 'let 키워드',
    description: '값을 변경할 수 있는 변수를 선언하는 키워드입니다. 블록 스코프를 가집니다.',
    examples: [
      { code: 'let name = "홍길동";\nname = "김철수"; // 값 변경 가능', description: 'let으로 변수 선언 후 값 변경' },
      { code: 'let count = 0;\ncount = count + 1;', description: '숫자 변수 증가' },
    ],
    keywords: ['let', '변수', '선언', '재할당'],
    displayOrder: 1,
  },
  {
    id: 'js-const-keyword',
    topicId: 'variables',
    name: 'const 키워드',
    description: '값을 변경할 수 없는 상수를 선언하는 키워드입니다. 선언 시 반드시 초기화해야 합니다.',
    examples: [
      { code: 'const PI = 3.14159;\n// PI = 3.14; // 오류! 재할당 불가', description: 'const로 상수 선언' },
      { code: 'const MAX_SIZE = 100;', description: '상수 명명 규칙 (대문자, 언더스코어)' },
    ],
    keywords: ['const', '상수', '불변', '초기화'],
    displayOrder: 2,
  },
  {
    id: 'js-var-keyword',
    topicId: 'variables',
    name: 'var 키워드 (레거시)',
    description: '과거에 사용하던 변수 선언 방식입니다. 함수 스코프를 가지며, 현재는 let/const 사용을 권장합니다.',
    examples: [
      { code: 'var oldStyle = "옛날 방식";\n// 현재는 let이나 const 사용 권장', description: 'var 선언 (비권장)' },
    ],
    keywords: ['var', '레거시', '함수 스코프', '호이스팅'],
    displayOrder: 3,
  },
  {
    id: 'js-naming-conventions',
    topicId: 'variables',
    name: '변수 명명 규칙',
    description: '변수 이름을 짓는 규칙입니다. 의미 있는 이름, 카멜케이스 사용이 권장됩니다.',
    examples: [
      { code: 'let userName = "홍길동";  // 카멜케이스\nlet user_name = "홍길동"; // 스네이크케이스', description: '명명 규칙 예시' },
      { code: 'let x = 10;  // 나쁜 예\nlet userAge = 10;  // 좋은 예', description: '의미 있는 이름 사용' },
    ],
    keywords: ['카멜케이스', '명명규칙', '변수이름', 'camelCase'],
    displayOrder: 4,
  },

  // js-basic stage -> operators topic
  {
    id: 'js-arithmetic-operators',
    topicId: 'operators',
    name: '산술 연산자',
    description: '숫자를 계산하는 연산자입니다. +, -, *, /, % 등이 있습니다.',
    examples: [
      { code: 'let sum = 10 + 5;  // 15\nlet diff = 10 - 5; // 5', description: '덧셈, 뺄셈' },
      { code: 'let product = 10 * 5; // 50\nlet quotient = 10 / 5; // 2', description: '곱셈, 나눗셈' },
      { code: 'let remainder = 10 % 3; // 1 (나머지)', description: '나머지 연산자' },
    ],
    keywords: ['산술', '덧셈', '뺄셈', '곱셈', '나눗셈', '나머지'],
    displayOrder: 1,
  },
  {
    id: 'js-comparison-operators',
    topicId: 'operators',
    name: '비교 연산자',
    description: '두 값을 비교하여 true/false를 반환하는 연산자입니다.',
    examples: [
      { code: '10 > 5   // true\n10 < 5   // false', description: '크다, 작다' },
      { code: '10 === 10 // true (값과 타입 비교)\n10 == "10" // true (값만 비교)', description: '동등 비교' },
    ],
    keywords: ['비교', '같다', '크다', '작다', '===', '=='],
    displayOrder: 2,
  },
  {
    id: 'js-logical-operators',
    topicId: 'operators',
    name: '논리 연산자',
    description: '조건을 조합하는 연산자입니다. &&(AND), ||(OR), !(NOT)이 있습니다.',
    examples: [
      { code: 'true && true   // true\ntrue && false  // false', description: 'AND 연산자' },
      { code: 'true || false  // true\nfalse || false // false', description: 'OR 연산자' },
      { code: '!true  // false\n!false // true', description: 'NOT 연산자' },
    ],
    keywords: ['논리', 'AND', 'OR', 'NOT', '&&', '||', '!'],
    displayOrder: 3,
  },

  // js-basic stage -> conditionals topic
  {
    id: 'js-if-statement',
    topicId: 'conditionals',
    name: 'if 문',
    description: '조건이 참일 때만 코드를 실행합니다.',
    examples: [
      { code: 'if (score >= 90) {\n  console.log("A등급");\n}', description: '기본 if 문' },
    ],
    keywords: ['if', '조건문', '참', '거짓'],
    displayOrder: 1,
  },
  {
    id: 'js-if-else-statement',
    topicId: 'conditionals',
    name: 'if-else 문',
    description: '조건이 참이면 if 블록, 거짓이면 else 블록을 실행합니다.',
    examples: [
      { code: 'if (age >= 18) {\n  console.log("성인");\n} else {\n  console.log("미성년자");\n}', description: 'if-else 문' },
    ],
    keywords: ['if', 'else', '조건문', '분기'],
    displayOrder: 2,
  },
  {
    id: 'js-else-if-statement',
    topicId: 'conditionals',
    name: 'else if 문',
    description: '여러 조건을 순차적으로 검사합니다.',
    examples: [
      { code: 'if (score >= 90) {\n  console.log("A");\n} else if (score >= 80) {\n  console.log("B");\n} else {\n  console.log("C");\n}', description: '다중 조건 검사' },
    ],
    keywords: ['else if', '다중 조건', '조건문'],
    displayOrder: 3,
  },
  {
    id: 'js-ternary-operator',
    topicId: 'conditionals',
    name: '삼항 연산자',
    description: '조건문을 한 줄로 작성하는 방법입니다. 조건 ? 참값 : 거짓값',
    examples: [
      { code: 'let result = score >= 60 ? "합격" : "불합격";', description: '삼항 연산자 사용' },
    ],
    keywords: ['삼항', '?:', '조건 연산자'],
    displayOrder: 4,
  },

  // js-basic stage -> loops topic
  {
    id: 'js-for-loop',
    topicId: 'loops',
    name: 'for 반복문',
    description: '정해진 횟수만큼 코드를 반복 실행합니다.',
    examples: [
      { code: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}', description: '0부터 4까지 출력' },
      { code: 'for (let i = 1; i <= 10; i++) {\n  console.log(i);\n}', description: '1부터 10까지 출력' },
    ],
    keywords: ['for', '반복문', '루프', '횟수'],
    displayOrder: 1,
  },
  {
    id: 'js-while-loop',
    topicId: 'loops',
    name: 'while 반복문',
    description: '조건이 참인 동안 코드를 반복 실행합니다.',
    examples: [
      { code: 'let i = 0;\nwhile (i < 5) {\n  console.log(i);\n  i++;\n}', description: 'while 반복문' },
    ],
    keywords: ['while', '반복문', '조건 반복'],
    displayOrder: 2,
  },
  {
    id: 'js-break-continue',
    topicId: 'loops',
    name: 'break와 continue',
    description: 'break는 반복문을 종료, continue는 현재 반복을 건너뜁니다.',
    examples: [
      { code: 'for (let i = 0; i < 10; i++) {\n  if (i === 5) break;\n  console.log(i);\n}', description: 'break로 반복 종료' },
      { code: 'for (let i = 0; i < 5; i++) {\n  if (i === 2) continue;\n  console.log(i);\n}', description: 'continue로 건너뛰기' },
    ],
    keywords: ['break', 'continue', '반복 제어'],
    displayOrder: 3,
  },

  // js-functions stage -> function-basics topic
  {
    id: 'js-function-declaration',
    topicId: 'function-basics',
    name: '함수 선언',
    description: 'function 키워드를 사용하여 함수를 정의합니다.',
    examples: [
      { code: 'function greet() {\n  console.log("안녕하세요!");\n}\ngreet();', description: '기본 함수 선언' },
    ],
    keywords: ['function', '함수', '선언', '정의'],
    displayOrder: 1,
  },
  {
    id: 'js-function-parameters',
    topicId: 'function-basics',
    name: '매개변수와 인자',
    description: '함수에 값을 전달하는 방법입니다.',
    examples: [
      { code: 'function greet(name) {\n  console.log(`안녕, ${name}!`);\n}\ngreet("철수");', description: '매개변수 사용' },
      { code: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 5));', description: '여러 매개변수' },
    ],
    keywords: ['매개변수', '인자', 'parameter', 'argument'],
    displayOrder: 2,
  },
  {
    id: 'js-return-value',
    topicId: 'function-basics',
    name: 'return 문',
    description: '함수에서 값을 반환합니다.',
    examples: [
      { code: 'function multiply(a, b) {\n  return a * b;\n}\nlet result = multiply(4, 5);', description: 'return으로 값 반환' },
    ],
    keywords: ['return', '반환', '반환값'],
    displayOrder: 3,
  },
  {
    id: 'js-arrow-function',
    topicId: 'function-basics',
    name: '화살표 함수',
    description: '=> 기호를 사용한 간결한 함수 표현식입니다.',
    examples: [
      { code: 'const add = (a, b) => a + b;\nconsole.log(add(3, 5));', description: '화살표 함수' },
      { code: 'const greet = name => `안녕, ${name}!`;', description: '매개변수 하나일 때' },
    ],
    keywords: ['화살표', '=>', 'arrow function'],
    displayOrder: 4,
  },

  // js-functions stage -> scope topic
  {
    id: 'js-block-scope',
    topicId: 'scope',
    name: '블록 스코프',
    description: 'let, const는 {} 블록 내에서만 접근 가능합니다.',
    examples: [
      { code: 'if (true) {\n  let x = 10;\n}\n// console.log(x); // 오류! 블록 밖에서 접근 불가', description: '블록 스코프 예시' },
    ],
    keywords: ['블록', '스코프', 'scope', '{}'],
    displayOrder: 1,
  },
  {
    id: 'js-function-scope',
    topicId: 'scope',
    name: '함수 스코프',
    description: '함수 내부에서 선언된 변수는 함수 밖에서 접근할 수 없습니다.',
    examples: [
      { code: 'function test() {\n  let local = "내부";\n}\n// console.log(local); // 오류!', description: '함수 스코프 예시' },
    ],
    keywords: ['함수', '스코프', '지역 변수'],
    displayOrder: 2,
  },
  {
    id: 'js-global-scope',
    topicId: 'scope',
    name: '전역 스코프',
    description: '어디서든 접근 가능한 변수입니다. 남용하면 코드가 복잡해집니다.',
    examples: [
      { code: 'let globalVar = "전역";\nfunction test() {\n  console.log(globalVar); // 접근 가능\n}', description: '전역 변수' },
    ],
    keywords: ['전역', 'global', '전역 변수'],
    displayOrder: 3,
  },

  // js-arrays stage -> array-basics topic
  {
    id: 'js-array-creation',
    topicId: 'array-basics',
    name: '배열 생성',
    description: '여러 값을 하나의 변수에 저장하는 자료구조입니다.',
    examples: [
      { code: 'let fruits = ["사과", "바나나", "딸기"];', description: '배열 리터럴' },
      { code: 'let numbers = [1, 2, 3, 4, 5];', description: '숫자 배열' },
    ],
    keywords: ['배열', 'array', '[]', '리터럴'],
    displayOrder: 1,
  },
  {
    id: 'js-array-index',
    topicId: 'array-basics',
    name: '인덱스 접근',
    description: '배열의 요소는 0부터 시작하는 인덱스로 접근합니다.',
    examples: [
      { code: 'let fruits = ["사과", "바나나", "딸기"];\nconsole.log(fruits[0]); // "사과"\nconsole.log(fruits[1]); // "바나나"', description: '인덱스로 접근' },
    ],
    keywords: ['인덱스', 'index', '접근', '0부터'],
    displayOrder: 2,
  },
  {
    id: 'js-array-length',
    topicId: 'array-basics',
    name: 'length 속성',
    description: '배열의 요소 개수를 반환합니다.',
    examples: [
      { code: 'let arr = [1, 2, 3, 4, 5];\nconsole.log(arr.length); // 5', description: 'length 사용' },
    ],
    keywords: ['length', '길이', '개수'],
    displayOrder: 3,
  },
  {
    id: 'js-array-push-pop',
    topicId: 'array-basics',
    name: 'push와 pop',
    description: 'push는 배열 끝에 추가, pop은 배열 끝에서 제거합니다.',
    examples: [
      { code: 'let arr = [1, 2];\narr.push(3);  // [1, 2, 3]\narr.pop();    // [1, 2]', description: 'push, pop 사용' },
    ],
    keywords: ['push', 'pop', '추가', '제거'],
    displayOrder: 4,
  },

  // js-arrays stage -> array-iteration topic
  {
    id: 'js-for-of-loop',
    topicId: 'array-iteration',
    name: 'for...of 반복문',
    description: '배열의 각 요소를 순회합니다.',
    examples: [
      { code: 'let fruits = ["사과", "바나나"];\nfor (let fruit of fruits) {\n  console.log(fruit);\n}', description: 'for...of 사용' },
    ],
    keywords: ['for of', '순회', '반복'],
    displayOrder: 1,
  },
  {
    id: 'js-foreach-method',
    topicId: 'array-iteration',
    name: 'forEach 메서드',
    description: '배열의 각 요소에 대해 함수를 실행합니다.',
    examples: [
      { code: 'let nums = [1, 2, 3];\nnums.forEach(num => console.log(num));', description: 'forEach 사용' },
    ],
    keywords: ['forEach', '메서드', '콜백'],
    displayOrder: 2,
  },
  {
    id: 'js-map-method',
    topicId: 'array-iteration',
    name: 'map 메서드',
    description: '배열의 각 요소를 변환하여 새 배열을 만듭니다.',
    examples: [
      { code: 'let nums = [1, 2, 3];\nlet doubled = nums.map(n => n * 2);\n// [2, 4, 6]', description: 'map으로 변환' },
    ],
    keywords: ['map', '변환', '새 배열'],
    displayOrder: 3,
  },

  // js-objects stage -> object-basics topic
  {
    id: 'js-object-creation',
    topicId: 'object-basics',
    name: '객체 생성',
    description: '키-값 쌍으로 데이터를 저장하는 자료구조입니다.',
    examples: [
      { code: 'let person = {\n  name: "홍길동",\n  age: 25\n};', description: '객체 리터럴' },
    ],
    keywords: ['객체', 'object', '{}', '키-값'],
    displayOrder: 1,
  },
  {
    id: 'js-object-access',
    topicId: 'object-basics',
    name: '속성 접근',
    description: '점 표기법이나 대괄호 표기법으로 속성에 접근합니다.',
    examples: [
      { code: 'let person = { name: "홍길동" };\nconsole.log(person.name);    // 점 표기법\nconsole.log(person["name"]); // 대괄호 표기법', description: '속성 접근 방법' },
    ],
    keywords: ['속성', '점 표기법', '대괄호', 'property'],
    displayOrder: 2,
  },
  {
    id: 'js-object-methods',
    topicId: 'object-basics',
    name: '객체 메서드',
    description: '객체의 속성으로 함수를 가질 수 있습니다.',
    examples: [
      { code: 'let person = {\n  name: "홍길동",\n  greet() {\n    console.log(`안녕, ${this.name}!`);\n  }\n};\nperson.greet();', description: '메서드 정의' },
    ],
    keywords: ['메서드', 'method', 'this'],
    displayOrder: 3,
  },

  // ========================================
  // JavaScript - js-basics
  // ========================================
  // js-practice-basics stage
  {
    id: 'js-console-log',
    topicId: 'js-console',
    name: 'console.log 활용',
    description: '콘솔에 값을 출력하여 디버깅합니다.',
    examples: [
      { code: 'console.log("Hello");\nconsole.log(123);\nconsole.log({name: "홍길동"});', description: '다양한 값 출력' },
    ],
    keywords: ['console', 'log', '출력', '디버깅'],
    displayOrder: 1,
  },
  {
    id: 'js-console-methods',
    topicId: 'js-console',
    name: 'console 메서드들',
    description: 'warn, error, table 등 다양한 콘솔 메서드가 있습니다.',
    examples: [
      { code: 'console.warn("경고!");\nconsole.error("에러!");\nconsole.table([{a:1}, {a:2}]);', description: '콘솔 메서드' },
    ],
    keywords: ['console', 'warn', 'error', 'table'],
    displayOrder: 2,
  },
  {
    id: 'js-string-length',
    topicId: 'js-string-methods',
    name: '문자열 길이와 접근',
    description: '문자열의 길이와 개별 문자에 접근합니다.',
    examples: [
      { code: 'let str = "Hello";\nconsole.log(str.length); // 5\nconsole.log(str[0]);     // "H"', description: '길이와 인덱스' },
    ],
    keywords: ['length', '문자열', '인덱스'],
    displayOrder: 1,
  },
  {
    id: 'js-string-search',
    topicId: 'js-string-methods',
    name: '문자열 검색',
    description: 'indexOf, includes로 문자열을 검색합니다.',
    examples: [
      { code: '"Hello World".indexOf("World"); // 6\n"Hello".includes("ell"); // true', description: '문자열 검색' },
    ],
    keywords: ['indexOf', 'includes', '검색'],
    displayOrder: 2,
  },
  {
    id: 'js-string-transform',
    topicId: 'js-string-methods',
    name: '문자열 변환',
    description: 'toUpperCase, toLowerCase, trim 등으로 변환합니다.',
    examples: [
      { code: '"hello".toUpperCase(); // "HELLO"\n"  hi  ".trim();        // "hi"', description: '문자열 변환' },
    ],
    keywords: ['toUpperCase', 'toLowerCase', 'trim'],
    displayOrder: 3,
  },
  {
    id: 'js-math-object',
    topicId: 'js-number-methods',
    name: 'Math 객체',
    description: '수학 관련 메서드를 제공합니다.',
    examples: [
      { code: 'Math.round(4.7);  // 5 (반올림)\nMath.floor(4.7);  // 4 (내림)\nMath.ceil(4.2);   // 5 (올림)', description: 'Math 메서드' },
    ],
    keywords: ['Math', 'round', 'floor', 'ceil'],
    displayOrder: 1,
  },
  {
    id: 'js-number-methods',
    topicId: 'js-number-methods',
    name: '숫자 메서드',
    description: 'toFixed, parseInt, parseFloat 등을 사용합니다.',
    examples: [
      { code: '(3.14159).toFixed(2); // "3.14"\nparseInt("42");       // 42\nparseFloat("3.14");   // 3.14', description: '숫자 메서드' },
    ],
    keywords: ['toFixed', 'parseInt', 'parseFloat'],
    displayOrder: 2,
  },

  // js-practical-patterns stage
  {
    id: 'js-spread-operator',
    topicId: 'js-spread-rest',
    name: '전개 연산자 (...)',
    description: '배열이나 객체를 펼쳐서 복사하거나 병합합니다.',
    examples: [
      { code: 'let arr1 = [1, 2];\nlet arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]', description: '배열 전개' },
      { code: 'let obj1 = {a: 1};\nlet obj2 = {...obj1, b: 2}; // {a: 1, b: 2}', description: '객체 전개' },
    ],
    keywords: ['spread', '전개', '...', '복사'],
    displayOrder: 1,
  },
  {
    id: 'js-rest-parameter',
    topicId: 'js-spread-rest',
    name: '나머지 매개변수',
    description: '여러 인자를 배열로 받습니다.',
    examples: [
      { code: 'function sum(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\nsum(1, 2, 3, 4); // 10', description: '나머지 매개변수' },
    ],
    keywords: ['rest', '나머지', '...', '가변 인자'],
    displayOrder: 2,
  },
  {
    id: 'js-and-short-circuit',
    topicId: 'js-short-circuit',
    name: 'AND 단축 평가',
    description: '&&는 첫 번째 falsy 값 또는 마지막 값을 반환합니다.',
    examples: [
      { code: 'let result = user && user.name;\n// user가 있으면 name 반환', description: 'AND 단축 평가' },
    ],
    keywords: ['&&', 'AND', '단축 평가'],
    displayOrder: 1,
  },
  {
    id: 'js-or-short-circuit',
    topicId: 'js-short-circuit',
    name: 'OR 단축 평가',
    description: '||는 첫 번째 truthy 값 또는 마지막 값을 반환합니다.',
    examples: [
      { code: 'let name = userName || "손님";\n// userName이 없으면 "손님" 사용', description: 'OR 단축 평가' },
    ],
    keywords: ['||', 'OR', '단축 평가', '기본값'],
    displayOrder: 2,
  },
  {
    id: 'js-nullish-coalescing',
    topicId: 'js-short-circuit',
    name: '널 병합 연산자 (??)',
    description: 'null이나 undefined일 때만 기본값을 사용합니다.',
    examples: [
      { code: 'let value = null ?? "기본값"; // "기본값"\nlet zero = 0 ?? "기본값";     // 0', description: '널 병합 연산자' },
    ],
    keywords: ['??', 'nullish', '널 병합'],
    displayOrder: 3,
  },
  {
    id: 'js-try-catch',
    topicId: 'js-error-handling',
    name: 'try-catch 문',
    description: '에러가 발생할 수 있는 코드를 안전하게 실행합니다.',
    examples: [
      { code: 'try {\n  JSON.parse("invalid");\n} catch (e) {\n  console.log("파싱 에러:", e.message);\n}', description: 'try-catch 사용' },
    ],
    keywords: ['try', 'catch', '에러', '예외'],
    displayOrder: 1,
  },
  {
    id: 'js-finally',
    topicId: 'js-error-handling',
    name: 'finally 블록',
    description: '에러 발생 여부와 관계없이 항상 실행됩니다.',
    examples: [
      { code: 'try {\n  // 코드\n} catch (e) {\n  // 에러 처리\n} finally {\n  // 항상 실행\n}', description: 'finally 사용' },
    ],
    keywords: ['finally', '정리', '항상 실행'],
    displayOrder: 2,
  },

  // js-array-advanced stage
  {
    id: 'js-filter-method',
    topicId: 'js-array-transform',
    name: 'filter 메서드',
    description: '조건을 만족하는 요소만 모아 새 배열을 만듭니다.',
    examples: [
      { code: 'let nums = [1, 2, 3, 4, 5];\nlet even = nums.filter(n => n % 2 === 0);\n// [2, 4]', description: 'filter 사용' },
    ],
    keywords: ['filter', '필터', '조건'],
    displayOrder: 1,
  },
  {
    id: 'js-reduce-method',
    topicId: 'js-array-transform',
    name: 'reduce 메서드',
    description: '배열을 하나의 값으로 줄입니다.',
    examples: [
      { code: 'let nums = [1, 2, 3, 4];\nlet sum = nums.reduce((acc, n) => acc + n, 0);\n// 10', description: 'reduce로 합계' },
    ],
    keywords: ['reduce', '축소', '누적'],
    displayOrder: 2,
  },
  {
    id: 'js-find-method',
    topicId: 'js-array-search',
    name: 'find 메서드',
    description: '조건을 만족하는 첫 번째 요소를 반환합니다.',
    examples: [
      { code: 'let users = [{id: 1}, {id: 2}];\nlet user = users.find(u => u.id === 2);\n// {id: 2}', description: 'find 사용' },
    ],
    keywords: ['find', '찾기', '첫 번째'],
    displayOrder: 1,
  },
  {
    id: 'js-findindex-method',
    topicId: 'js-array-search',
    name: 'findIndex 메서드',
    description: '조건을 만족하는 첫 번째 요소의 인덱스를 반환합니다.',
    examples: [
      { code: 'let nums = [1, 2, 3];\nlet idx = nums.findIndex(n => n > 1);\n// 1', description: 'findIndex 사용' },
    ],
    keywords: ['findIndex', '인덱스', '검색'],
    displayOrder: 2,
  },
  {
    id: 'js-some-every',
    topicId: 'js-array-search',
    name: 'some과 every 메서드',
    description: 'some은 하나라도 만족하면 true, every는 모두 만족해야 true.',
    examples: [
      { code: '[1, 2, 3].some(n => n > 2);  // true\n[1, 2, 3].every(n => n > 0); // true', description: 'some, every 사용' },
    ],
    keywords: ['some', 'every', '조건 검사'],
    displayOrder: 3,
  },

  // js-async stage -> promises topic
  {
    id: 'js-promise-basics',
    topicId: 'promises',
    name: 'Promise 기초',
    description: '비동기 작업의 완료 또는 실패를 나타내는 객체입니다.',
    examples: [
      { code: 'const promise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve("완료!"), 1000);\n});', description: 'Promise 생성' },
    ],
    keywords: ['Promise', '비동기', 'resolve', 'reject'],
    displayOrder: 1,
  },
  {
    id: 'js-then-catch',
    topicId: 'promises',
    name: 'then과 catch',
    description: 'then은 성공 시, catch는 실패 시 실행됩니다.',
    examples: [
      { code: 'fetch("/api/data")\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));', description: 'then, catch 체이닝' },
    ],
    keywords: ['then', 'catch', '체이닝'],
    displayOrder: 2,
  },
  {
    id: 'js-async-await',
    topicId: 'promises',
    name: 'async/await',
    description: 'Promise를 동기 코드처럼 작성할 수 있습니다.',
    examples: [
      { code: 'async function getData() {\n  const res = await fetch("/api/data");\n  const data = await res.json();\n  return data;\n}', description: 'async/await 사용' },
    ],
    keywords: ['async', 'await', '비동기'],
    displayOrder: 3,
  },

  // ========================================
  // Python - py-beginner
  // ========================================
  // py-basic stage -> py-variables topic
  {
    id: 'py-variable-declaration',
    topicId: 'py-variables',
    name: '변수 선언',
    description: 'Python은 타입 선언 없이 변수에 값을 할당합니다.',
    examples: [
      { code: 'name = "홍길동"\nage = 25\nis_student = True', description: '변수 선언' },
    ],
    keywords: ['변수', '할당', '='],
    displayOrder: 1,
  },
  {
    id: 'py-data-types',
    topicId: 'py-variables',
    name: '기본 자료형',
    description: 'int, float, str, bool 등의 기본 자료형이 있습니다.',
    examples: [
      { code: 'x = 10       # int\ny = 3.14     # float\nname = "Hi"  # str\nflag = True  # bool', description: '자료형 예시' },
    ],
    keywords: ['int', 'float', 'str', 'bool', '자료형'],
    displayOrder: 2,
  },
  {
    id: 'py-type-function',
    topicId: 'py-variables',
    name: 'type() 함수',
    description: '변수의 자료형을 확인합니다.',
    examples: [
      { code: 'x = 10\nprint(type(x))  # <class \'int\'>', description: 'type 사용' },
    ],
    keywords: ['type', '자료형 확인'],
    displayOrder: 3,
  },

  // py-basic stage -> py-operators topic
  {
    id: 'py-arithmetic-ops',
    topicId: 'py-operators',
    name: '산술 연산자',
    description: '+, -, *, /, //, %, ** 연산자를 사용합니다.',
    examples: [
      { code: '10 + 5   # 15\n10 / 3   # 3.333...\n10 // 3  # 3 (정수 나눗셈)\n2 ** 3   # 8 (거듭제곱)', description: '산술 연산' },
    ],
    keywords: ['산술', '+', '-', '*', '/', '//', '%', '**'],
    displayOrder: 1,
  },
  {
    id: 'py-comparison-ops',
    topicId: 'py-operators',
    name: '비교 연산자',
    description: '==, !=, <, >, <=, >= 연산자를 사용합니다.',
    examples: [
      { code: '10 == 10  # True\n10 != 5   # True\n10 > 5    # True', description: '비교 연산' },
    ],
    keywords: ['비교', '==', '!=', '<', '>', '<=', '>='],
    displayOrder: 2,
  },
  {
    id: 'py-logical-ops',
    topicId: 'py-operators',
    name: '논리 연산자',
    description: 'and, or, not 연산자를 사용합니다.',
    examples: [
      { code: 'True and False  # False\nTrue or False   # True\nnot True        # False', description: '논리 연산' },
    ],
    keywords: ['논리', 'and', 'or', 'not'],
    displayOrder: 3,
  },

  // py-basic stage -> py-conditionals topic
  {
    id: 'py-if-statement',
    topicId: 'py-conditionals',
    name: 'if 문',
    description: '조건이 참일 때 코드를 실행합니다. 들여쓰기가 중요합니다.',
    examples: [
      { code: 'if score >= 90:\n    print("A등급")', description: 'if 문' },
    ],
    keywords: ['if', '조건문', '들여쓰기'],
    displayOrder: 1,
  },
  {
    id: 'py-if-else',
    topicId: 'py-conditionals',
    name: 'if-else 문',
    description: '조건에 따라 다른 코드를 실행합니다.',
    examples: [
      { code: 'if age >= 18:\n    print("성인")\nelse:\n    print("미성년자")', description: 'if-else 문' },
    ],
    keywords: ['if', 'else', '조건문'],
    displayOrder: 2,
  },
  {
    id: 'py-elif',
    topicId: 'py-conditionals',
    name: 'elif 문',
    description: '여러 조건을 순차적으로 검사합니다.',
    examples: [
      { code: 'if score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C"', description: 'elif 사용' },
    ],
    keywords: ['elif', '다중 조건'],
    displayOrder: 3,
  },

  // py-basic stage -> py-loops topic
  {
    id: 'py-for-loop',
    topicId: 'py-loops',
    name: 'for 반복문',
    description: 'range()나 시퀀스를 순회합니다.',
    examples: [
      { code: 'for i in range(5):\n    print(i)  # 0, 1, 2, 3, 4', description: 'for와 range' },
      { code: 'for fruit in ["사과", "바나나"]:\n    print(fruit)', description: '리스트 순회' },
    ],
    keywords: ['for', 'range', '반복'],
    displayOrder: 1,
  },
  {
    id: 'py-while-loop',
    topicId: 'py-loops',
    name: 'while 반복문',
    description: '조건이 참인 동안 반복합니다.',
    examples: [
      { code: 'i = 0\nwhile i < 5:\n    print(i)\n    i += 1', description: 'while 반복' },
    ],
    keywords: ['while', '조건 반복'],
    displayOrder: 2,
  },
  {
    id: 'py-break-continue',
    topicId: 'py-loops',
    name: 'break와 continue',
    description: 'break는 반복 종료, continue는 다음 반복으로 건너뜁니다.',
    examples: [
      { code: 'for i in range(10):\n    if i == 5:\n        break\n    print(i)', description: 'break 사용' },
    ],
    keywords: ['break', 'continue', '반복 제어'],
    displayOrder: 3,
  },

  // py-functions stage -> py-function-basics topic
  {
    id: 'py-def-function',
    topicId: 'py-function-basics',
    name: '함수 정의 (def)',
    description: 'def 키워드로 함수를 정의합니다.',
    examples: [
      { code: 'def greet():\n    print("안녕하세요!")\n\ngreet()', description: '함수 정의와 호출' },
    ],
    keywords: ['def', '함수', '정의'],
    displayOrder: 1,
  },
  {
    id: 'py-parameters',
    topicId: 'py-function-basics',
    name: '매개변수',
    description: '함수에 값을 전달합니다.',
    examples: [
      { code: 'def greet(name):\n    print(f"안녕, {name}!")\n\ngreet("철수")', description: '매개변수 사용' },
    ],
    keywords: ['매개변수', '인자', 'parameter'],
    displayOrder: 2,
  },
  {
    id: 'py-return',
    topicId: 'py-function-basics',
    name: 'return 문',
    description: '함수에서 값을 반환합니다.',
    examples: [
      { code: 'def add(a, b):\n    return a + b\n\nresult = add(3, 5)  # 8', description: 'return 사용' },
    ],
    keywords: ['return', '반환'],
    displayOrder: 3,
  },
  {
    id: 'py-default-params',
    topicId: 'py-function-basics',
    name: '기본값 매개변수',
    description: '매개변수에 기본값을 지정합니다.',
    examples: [
      { code: 'def greet(name="손님"):\n    print(f"안녕, {name}!")\n\ngreet()       # "안녕, 손님!"\ngreet("철수") # "안녕, 철수!"', description: '기본값 사용' },
    ],
    keywords: ['기본값', 'default'],
    displayOrder: 4,
  },

  // py-functions stage -> py-lambda topic
  {
    id: 'py-lambda-function',
    topicId: 'py-lambda',
    name: 'lambda 함수',
    description: '한 줄로 작성하는 익명 함수입니다.',
    examples: [
      { code: 'add = lambda a, b: a + b\nprint(add(3, 5))  # 8', description: 'lambda 기본' },
      { code: 'nums = [1, 2, 3]\ndoubled = list(map(lambda x: x * 2, nums))', description: 'map과 lambda' },
    ],
    keywords: ['lambda', '익명 함수', '한 줄 함수'],
    displayOrder: 1,
  },

  // py-data-structures stage -> py-lists topic
  {
    id: 'py-list-creation',
    topicId: 'py-lists',
    name: '리스트 생성',
    description: '여러 값을 저장하는 순서가 있는 자료구조입니다.',
    examples: [
      { code: 'fruits = ["사과", "바나나", "딸기"]\nnums = [1, 2, 3, 4, 5]', description: '리스트 생성' },
    ],
    keywords: ['리스트', 'list', '[]'],
    displayOrder: 1,
  },
  {
    id: 'py-list-indexing',
    topicId: 'py-lists',
    name: '인덱싱과 슬라이싱',
    description: '인덱스로 요소에 접근하고, 슬라이싱으로 부분을 추출합니다.',
    examples: [
      { code: 'fruits = ["사과", "바나나", "딸기"]\nfruits[0]    # "사과"\nfruits[-1]   # "딸기"\nfruits[0:2]  # ["사과", "바나나"]', description: '인덱싱과 슬라이싱' },
    ],
    keywords: ['인덱싱', '슬라이싱', '[:]'],
    displayOrder: 2,
  },
  {
    id: 'py-list-methods',
    topicId: 'py-lists',
    name: '리스트 메서드',
    description: 'append, remove, pop 등의 메서드를 사용합니다.',
    examples: [
      { code: 'nums = [1, 2]\nnums.append(3)  # [1, 2, 3]\nnums.pop()      # [1, 2]', description: '리스트 메서드' },
    ],
    keywords: ['append', 'remove', 'pop', 'insert'],
    displayOrder: 3,
  },

  // py-data-structures stage -> py-dictionaries topic
  {
    id: 'py-dict-creation',
    topicId: 'py-dictionaries',
    name: '딕셔너리 생성',
    description: '키-값 쌍으로 데이터를 저장합니다.',
    examples: [
      { code: 'person = {\n    "name": "홍길동",\n    "age": 25\n}', description: '딕셔너리 생성' },
    ],
    keywords: ['딕셔너리', 'dict', '{}', '키-값'],
    displayOrder: 1,
  },
  {
    id: 'py-dict-access',
    topicId: 'py-dictionaries',
    name: '값 접근',
    description: '키로 값에 접근합니다.',
    examples: [
      { code: 'person = {"name": "홍길동"}\nperson["name"]      # "홍길동"\nperson.get("age")   # None (없으면)', description: '값 접근' },
    ],
    keywords: ['키', '값', 'get'],
    displayOrder: 2,
  },
  {
    id: 'py-dict-methods',
    topicId: 'py-dictionaries',
    name: '딕셔너리 메서드',
    description: 'keys(), values(), items() 메서드를 사용합니다.',
    examples: [
      { code: 'd = {"a": 1, "b": 2}\nd.keys()    # dict_keys([\'a\', \'b\'])\nd.values()  # dict_values([1, 2])\nd.items()   # dict_items([(\'a\', 1), (\'b\', 2)])', description: '딕셔너리 메서드' },
    ],
    keywords: ['keys', 'values', 'items'],
    displayOrder: 3,
  },

  // py-data-structures stage -> py-tuples-sets topic
  {
    id: 'py-tuple',
    topicId: 'py-tuples-sets',
    name: '튜플',
    description: '변경할 수 없는 순서가 있는 자료구조입니다.',
    examples: [
      { code: 'point = (10, 20)\nx, y = point  # 언패킹', description: '튜플 사용' },
    ],
    keywords: ['튜플', 'tuple', '()'],
    displayOrder: 1,
  },
  {
    id: 'py-set',
    topicId: 'py-tuples-sets',
    name: '세트',
    description: '중복을 허용하지 않는 자료구조입니다.',
    examples: [
      { code: 'nums = {1, 2, 2, 3}\nprint(nums)  # {1, 2, 3}', description: '세트 사용' },
    ],
    keywords: ['세트', 'set', '중복 제거'],
    displayOrder: 2,
  },

  // py-comprehensions stage -> py-list-comp topic
  {
    id: 'py-list-comprehension',
    topicId: 'py-list-comp',
    name: '리스트 컴프리헨션',
    description: '한 줄로 리스트를 생성하는 문법입니다.',
    examples: [
      { code: 'squares = [x**2 for x in range(5)]\n# [0, 1, 4, 9, 16]', description: '기본 컴프리헨션' },
      { code: 'evens = [x for x in range(10) if x % 2 == 0]\n# [0, 2, 4, 6, 8]', description: '조건 포함' },
    ],
    keywords: ['컴프리헨션', 'comprehension', '리스트 생성'],
    displayOrder: 1,
  },

  // ========================================
  // Python - py-basics (일부)
  // ========================================
  {
    id: 'py-print-input',
    topicId: 'py-input-output',
    name: 'print와 input',
    description: '출력과 입력을 처리합니다.',
    examples: [
      { code: 'print("Hello, World!")\nname = input("이름: ")', description: 'print와 input' },
    ],
    keywords: ['print', 'input', '출력', '입력'],
    displayOrder: 1,
  },
  {
    id: 'py-fstring',
    topicId: 'py-input-output',
    name: 'f-string 포맷팅',
    description: 'f-string으로 문자열을 포맷팅합니다.',
    examples: [
      { code: 'name = "홍길동"\nage = 25\nprint(f"{name}은 {age}살입니다.")', description: 'f-string 사용' },
    ],
    keywords: ['f-string', '포맷팅', 'format'],
    displayOrder: 2,
  },

  // ========================================
  // TypeScript - ts-beginner
  // ========================================
  // ts-intro stage -> ts-what-is topic
  {
    id: 'ts-introduction',
    topicId: 'ts-what-is',
    name: 'TypeScript란?',
    description: 'JavaScript에 타입 시스템을 추가한 언어입니다.',
    examples: [
      { code: '// JavaScript\nlet name = "홍길동";\n\n// TypeScript\nlet name: string = "홍길동";', description: 'JS vs TS' },
    ],
    keywords: ['TypeScript', '타입', 'JavaScript'],
    displayOrder: 1,
  },
  {
    id: 'ts-benefits',
    topicId: 'ts-what-is',
    name: 'TypeScript의 장점',
    description: '컴파일 시 오류 발견, 자동완성, 문서화 효과가 있습니다.',
    examples: [
      { code: '// 컴파일 시 오류 발견\nlet num: number = "hello"; // 오류!', description: '타입 오류 감지' },
    ],
    keywords: ['타입 검사', '자동완성', '안전성'],
    displayOrder: 2,
  },

  // ts-intro stage -> ts-basic-types topic
  {
    id: 'ts-primitive-types',
    topicId: 'ts-basic-types',
    name: '기본 타입',
    description: 'string, number, boolean 등의 기본 타입입니다.',
    examples: [
      { code: 'let name: string = "홍길동";\nlet age: number = 25;\nlet isActive: boolean = true;', description: '기본 타입' },
    ],
    keywords: ['string', 'number', 'boolean', '기본 타입'],
    displayOrder: 1,
  },
  {
    id: 'ts-array-type',
    topicId: 'ts-basic-types',
    name: '배열 타입',
    description: '배열의 요소 타입을 지정합니다.',
    examples: [
      { code: 'let nums: number[] = [1, 2, 3];\nlet names: Array<string> = ["a", "b"];', description: '배열 타입' },
    ],
    keywords: ['array', '배열', '[]', 'Array<T>'],
    displayOrder: 2,
  },
  {
    id: 'ts-any-unknown',
    topicId: 'ts-basic-types',
    name: 'any와 unknown',
    description: 'any는 모든 타입, unknown은 타입 검사가 필요합니다.',
    examples: [
      { code: 'let a: any = "hello";\na = 123;  // OK\n\nlet b: unknown = "hello";\n// b.length; // 오류! 타입 검사 필요', description: 'any vs unknown' },
    ],
    keywords: ['any', 'unknown', '타입 검사'],
    displayOrder: 3,
  },

  // ts-intro stage -> ts-variables topic
  {
    id: 'ts-type-annotation',
    topicId: 'ts-variables',
    name: '타입 어노테이션',
    description: '변수에 타입을 명시합니다.',
    examples: [
      { code: 'let name: string = "홍길동";\nlet age: number = 25;', description: '타입 어노테이션' },
    ],
    keywords: ['타입 어노테이션', ':', '타입 명시'],
    displayOrder: 1,
  },
  {
    id: 'ts-type-inference',
    topicId: 'ts-variables',
    name: '타입 추론',
    description: 'TypeScript가 자동으로 타입을 추론합니다.',
    examples: [
      { code: 'let name = "홍길동";  // string으로 추론\nlet age = 25;          // number로 추론', description: '타입 추론' },
    ],
    keywords: ['타입 추론', 'inference', '자동'],
    displayOrder: 2,
  },

  // ts-control-flow stage
  {
    id: 'ts-if-types',
    topicId: 'ts-conditionals',
    name: '조건문과 타입',
    description: 'TypeScript의 조건문은 JavaScript와 동일합니다.',
    examples: [
      { code: 'function check(value: number): string {\n  if (value > 0) {\n    return "양수";\n  }\n  return "음수 또는 0";\n}', description: '조건문과 반환 타입' },
    ],
    keywords: ['if', '조건문', '타입'],
    displayOrder: 1,
  },
  {
    id: 'ts-loop-types',
    topicId: 'ts-loops',
    name: '반복문과 타입',
    description: '배열 순회 시 요소 타입이 자동으로 추론됩니다.',
    examples: [
      { code: 'const nums: number[] = [1, 2, 3];\nfor (const n of nums) {\n  console.log(n);  // n은 number\n}', description: '반복문과 타입 추론' },
    ],
    keywords: ['for', 'while', '반복문', '타입 추론'],
    displayOrder: 1,
  },

  // ts-functions-basic stage -> ts-function-types topic
  {
    id: 'ts-function-type',
    topicId: 'ts-function-types',
    name: '함수 타입 선언',
    description: '매개변수와 반환값의 타입을 지정합니다.',
    examples: [
      { code: 'function add(a: number, b: number): number {\n  return a + b;\n}', description: '함수 타입 선언' },
    ],
    keywords: ['함수', '매개변수', '반환 타입'],
    displayOrder: 1,
  },
  {
    id: 'ts-optional-params',
    topicId: 'ts-function-types',
    name: '선택적 매개변수',
    description: '?를 사용하여 선택적 매개변수를 지정합니다.',
    examples: [
      { code: 'function greet(name: string, greeting?: string): string {\n  return `${greeting || "Hello"}, ${name}!`;\n}', description: '선택적 매개변수' },
    ],
    keywords: ['?', '선택적', 'optional'],
    displayOrder: 2,
  },
  {
    id: 'ts-void-never',
    topicId: 'ts-function-types',
    name: 'void와 never',
    description: 'void는 반환값 없음, never는 절대 반환하지 않음을 의미합니다.',
    examples: [
      { code: 'function log(msg: string): void {\n  console.log(msg);\n}\n\nfunction throwError(msg: string): never {\n  throw new Error(msg);\n}', description: 'void와 never' },
    ],
    keywords: ['void', 'never', '반환'],
    displayOrder: 3,
  },

  // ts-object-types stage
  {
    id: 'ts-object-type',
    topicId: 'ts-object-basics',
    name: '객체 타입',
    description: '객체의 구조를 타입으로 정의합니다.',
    examples: [
      { code: 'let person: { name: string; age: number } = {\n  name: "홍길동",\n  age: 25\n};', description: '인라인 객체 타입' },
    ],
    keywords: ['객체', 'object', '구조'],
    displayOrder: 1,
  },
  {
    id: 'ts-type-alias-def',
    topicId: 'ts-type-alias',
    name: '타입 별칭',
    description: 'type 키워드로 타입에 이름을 붙입니다.',
    examples: [
      { code: 'type Person = {\n  name: string;\n  age: number;\n};\n\nlet user: Person = { name: "홍길동", age: 25 };', description: '타입 별칭' },
    ],
    keywords: ['type', '별칭', 'alias'],
    displayOrder: 1,
  },
  {
    id: 'ts-interface',
    topicId: 'ts-type-alias',
    name: '인터페이스',
    description: 'interface로 객체 구조를 정의합니다.',
    examples: [
      { code: 'interface Person {\n  name: string;\n  age: number;\n}', description: '인터페이스 정의' },
    ],
    keywords: ['interface', '인터페이스'],
    displayOrder: 2,
  },

  // ts-union-types stage
  {
    id: 'ts-union-type',
    topicId: 'ts-union-basics',
    name: '유니온 타입',
    description: '여러 타입 중 하나를 가질 수 있습니다.',
    examples: [
      { code: 'let id: string | number;\nid = "abc";\nid = 123;', description: '유니온 타입' },
    ],
    keywords: ['union', '|', '유니온'],
    displayOrder: 1,
  },
  {
    id: 'ts-literal-type',
    topicId: 'ts-literal-types',
    name: '리터럴 타입',
    description: '특정 값만 허용하는 타입입니다.',
    examples: [
      { code: 'type Direction = "up" | "down" | "left" | "right";\nlet dir: Direction = "up";', description: '리터럴 타입' },
    ],
    keywords: ['literal', '리터럴', '특정 값'],
    displayOrder: 1,
  },

  // ts-array-advanced stage
  {
    id: 'ts-array-method-types',
    topicId: 'ts-array-methods',
    name: '배열 메서드와 타입',
    description: 'map, filter 등의 결과 타입이 추론됩니다.',
    examples: [
      { code: 'const nums: number[] = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);\n// doubled: number[]', description: '배열 메서드 타입' },
    ],
    keywords: ['map', 'filter', '배열 메서드', '타입 추론'],
    displayOrder: 1,
  },
  {
    id: 'ts-tuple-type',
    topicId: 'ts-tuple',
    name: '튜플 타입',
    description: '고정된 길이와 타입을 가진 배열입니다.',
    examples: [
      { code: 'let point: [number, number] = [10, 20];\nlet user: [string, number] = ["홍길동", 25];', description: '튜플 타입' },
    ],
    keywords: ['tuple', '튜플', '고정 길이'],
    displayOrder: 1,
  },

  // ts-generics stage
  {
    id: 'ts-generic-function',
    topicId: 'ts-generic-basics',
    name: '제네릭 함수',
    description: '타입을 매개변수처럼 사용합니다.',
    examples: [
      { code: 'function identity<T>(value: T): T {\n  return value;\n}\n\nidentity<string>("hello");\nidentity<number>(123);', description: '제네릭 함수' },
    ],
    keywords: ['generic', '제네릭', '<T>'],
    displayOrder: 1,
  },
  {
    id: 'ts-generic-constraint',
    topicId: 'ts-generic-constraints',
    name: '제네릭 제약',
    description: 'extends로 타입을 제한합니다.',
    examples: [
      { code: 'function getLength<T extends { length: number }>(item: T): number {\n  return item.length;\n}', description: '제네릭 제약' },
    ],
    keywords: ['extends', '제약', 'constraint'],
    displayOrder: 1,
  },

  // ts-utility-types stage
  {
    id: 'ts-partial-required',
    topicId: 'ts-common-utilities',
    name: 'Partial과 Required',
    description: 'Partial은 모든 속성을 선택적으로, Required는 필수로 만듭니다.',
    examples: [
      { code: 'type Person = { name: string; age: number };\ntype PartialPerson = Partial<Person>;\n// { name?: string; age?: number }', description: 'Partial 사용' },
    ],
    keywords: ['Partial', 'Required', '유틸리티'],
    displayOrder: 1,
  },
  {
    id: 'ts-pick-omit',
    topicId: 'ts-common-utilities',
    name: 'Pick과 Omit',
    description: 'Pick은 선택한 속성만, Omit은 제외한 속성을 가집니다.',
    examples: [
      { code: 'type Person = { name: string; age: number; email: string };\ntype NameOnly = Pick<Person, "name">;\ntype WithoutEmail = Omit<Person, "email">;', description: 'Pick, Omit 사용' },
    ],
    keywords: ['Pick', 'Omit', '선택', '제외'],
    displayOrder: 2,
  },
  {
    id: 'ts-record-type',
    topicId: 'ts-record-type',
    name: 'Record 타입',
    description: '키와 값의 타입을 지정한 객체 타입입니다.',
    examples: [
      { code: 'type Scores = Record<string, number>;\nconst scores: Scores = {\n  math: 90,\n  english: 85\n};', description: 'Record 사용' },
    ],
    keywords: ['Record', '키-값', '매핑'],
    displayOrder: 1,
  },

  // ts-classes stage
  {
    id: 'ts-class-type',
    topicId: 'ts-class-basics',
    name: '클래스와 타입',
    description: '클래스의 속성과 메서드에 타입을 지정합니다.',
    examples: [
      { code: 'class Person {\n  name: string;\n  constructor(name: string) {\n    this.name = name;\n  }\n}', description: '클래스 타입' },
    ],
    keywords: ['class', '클래스', '속성 타입'],
    displayOrder: 1,
  },
  {
    id: 'ts-access-modifiers',
    topicId: 'ts-class-basics',
    name: '접근 제어자',
    description: 'public, private, protected로 접근을 제어합니다.',
    examples: [
      { code: 'class Person {\n  public name: string;\n  private age: number;\n  protected id: string;\n}', description: '접근 제어자' },
    ],
    keywords: ['public', 'private', 'protected'],
    displayOrder: 2,
  },
  {
    id: 'ts-implements',
    topicId: 'ts-class-interface',
    name: '인터페이스 구현',
    description: 'implements로 인터페이스를 구현합니다.',
    examples: [
      { code: 'interface Printable {\n  print(): void;\n}\n\nclass Document implements Printable {\n  print() {\n    console.log("출력 중...");\n  }\n}', description: 'implements 사용' },
    ],
    keywords: ['implements', '구현', '인터페이스'],
    displayOrder: 1,
  },

  // ts-async stage
  {
    id: 'ts-promise-type',
    topicId: 'ts-promise-types',
    name: 'Promise 타입',
    description: 'Promise의 반환 타입을 지정합니다.',
    examples: [
      { code: 'async function fetchData(): Promise<string> {\n  return "데이터";\n}\n\nconst data: Promise<string> = fetchData();', description: 'Promise 타입' },
    ],
    keywords: ['Promise', '비동기', 'async'],
    displayOrder: 1,
  },
];

// 5. 문제 은행 데이터 (각 언어별 핵심 토픽)
const QUESTION_BANK = {
  javascript: [
    // variables 토픽
    {
      trackId: 'js-beginner',
      topicId: 'variables',
      difficulty: 'easy',
      points: 10,
      title: '변수 선언과 출력',
      description: 'let 키워드를 사용하여 name 변수에 "홍길동"을 저장하고 console.log로 출력하세요.',
      requirements: ['let 키워드 사용', 'console.log로 출력'],
      testCases: [{ description: '이름 출력', expectedOutput: '홍길동', points: 10 }],
      sampleAnswer: 'let name = "홍길동";\nconsole.log(name);',
    },
    {
      trackId: 'js-beginner',
      topicId: 'variables',
      difficulty: 'easy',
      points: 10,
      title: '상수 선언하기',
      description: 'const 키워드를 사용하여 PI에 3.14를 저장하고 출력하세요.',
      requirements: ['const 키워드 사용', '숫자 3.14 할당'],
      testCases: [{ description: 'PI 값 출력', expectedOutput: '3.14', points: 10 }],
      sampleAnswer: 'const PI = 3.14;\nconsole.log(PI);',
    },
    {
      trackId: 'js-beginner',
      topicId: 'variables',
      difficulty: 'medium',
      points: 15,
      title: '두 변수 값 교환',
      description: 'a=10, b=20일 때, 임시 변수를 사용하여 두 값을 교환하고 "a: 20, b: 10" 형식으로 출력하세요.',
      requirements: ['임시 변수 사용', '값 교환 후 출력'],
      testCases: [{ description: '교환 결과', expectedOutput: 'a: 20, b: 10', points: 15 }],
      sampleAnswer: 'let a = 10;\nlet b = 20;\nlet temp = a;\na = b;\nb = temp;\nconsole.log(`a: ${a}, b: ${b}`);',
    },
    // conditionals 토픽
    {
      trackId: 'js-beginner',
      topicId: 'conditionals',
      difficulty: 'easy',
      points: 10,
      title: '짝수 홀수 판별',
      description: 'num이 10일 때, 짝수이면 "짝수", 홀수이면 "홀수"를 출력하세요.',
      requirements: ['if-else 사용', '나머지 연산자 사용'],
      testCases: [{ description: '10은 짝수', expectedOutput: '짝수', points: 10 }],
      sampleAnswer: 'const num = 10;\nif (num % 2 === 0) {\n  console.log("짝수");\n} else {\n  console.log("홀수");\n}',
    },
    {
      trackId: 'js-beginner',
      topicId: 'conditionals',
      difficulty: 'medium',
      points: 15,
      title: '성적 등급 판정',
      description: 'score가 85일 때, 90이상 A, 80이상 B, 70이상 C, 그 외 F를 출력하세요.',
      requirements: ['else if 사용', '점수 구간 판정'],
      testCases: [{ description: '85점은 B등급', expectedOutput: 'B', points: 15 }],
      sampleAnswer: 'const score = 85;\nif (score >= 90) {\n  console.log("A");\n} else if (score >= 80) {\n  console.log("B");\n} else if (score >= 70) {\n  console.log("C");\n} else {\n  console.log("F");\n}',
    },
    // loops 토픽
    {
      trackId: 'js-beginner',
      topicId: 'loops',
      difficulty: 'easy',
      points: 10,
      title: '1부터 5까지 출력',
      description: 'for문을 사용하여 1부터 5까지 한 줄에 하나씩 출력하세요.',
      requirements: ['for 반복문 사용'],
      testCases: [{ description: '1~5 출력', expectedOutput: '1\n2\n3\n4\n5', points: 10 }],
      sampleAnswer: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}',
    },
    {
      trackId: 'js-beginner',
      topicId: 'loops',
      difficulty: 'medium',
      points: 15,
      title: '1부터 10까지 합계',
      description: 'for문을 사용하여 1부터 10까지의 합계를 구해 출력하세요.',
      requirements: ['for 반복문 사용', '합계 변수 사용'],
      testCases: [{ description: '합계 55', expectedOutput: '55', points: 15 }],
      sampleAnswer: 'let sum = 0;\nfor (let i = 1; i <= 10; i++) {\n  sum += i;\n}\nconsole.log(sum);',
    },
    // function-basics 토픽
    {
      trackId: 'js-beginner',
      topicId: 'function-basics',
      difficulty: 'easy',
      points: 10,
      title: '인사 함수 만들기',
      description: 'greet(name) 함수를 만들어 "안녕하세요, {name}님!"을 출력하세요. greet("철수")를 호출하세요.',
      requirements: ['함수 선언', '매개변수 사용'],
      testCases: [{ description: '인사 출력', expectedOutput: '안녕하세요, 철수님!', points: 10 }],
      sampleAnswer: 'function greet(name) {\n  console.log(`안녕하세요, ${name}님!`);\n}\ngreet("철수");',
    },
    {
      trackId: 'js-beginner',
      topicId: 'function-basics',
      difficulty: 'medium',
      points: 15,
      title: '두 수의 합 반환',
      description: 'add(a, b) 함수를 만들어 두 수의 합을 반환하세요. add(3, 5)의 결과를 출력하세요.',
      requirements: ['return 사용', '함수 호출 결과 출력'],
      testCases: [{ description: '3+5=8', expectedOutput: '8', points: 15 }],
      sampleAnswer: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 5));',
    },
    // array-basics 토픽
    {
      trackId: 'js-beginner',
      topicId: 'array-basics',
      difficulty: 'easy',
      points: 10,
      title: '배열 생성과 접근',
      description: 'fruits 배열에 ["사과", "바나나", "딸기"]를 저장하고 두 번째 요소를 출력하세요.',
      requirements: ['배열 리터럴 사용', '인덱스 접근'],
      testCases: [{ description: '두 번째 요소', expectedOutput: '바나나', points: 10 }],
      sampleAnswer: 'const fruits = ["사과", "바나나", "딸기"];\nconsole.log(fruits[1]);',
    },
    {
      trackId: 'js-beginner',
      topicId: 'array-basics',
      difficulty: 'medium',
      points: 15,
      title: '배열 길이와 마지막 요소',
      description: 'numbers 배열 [10, 20, 30, 40, 50]의 길이와 마지막 요소를 각각 출력하세요.',
      requirements: ['length 속성 사용', '마지막 요소 접근'],
      testCases: [{ description: '길이와 마지막 요소', expectedOutput: '5\n50', points: 15 }],
      sampleAnswer: 'const numbers = [10, 20, 30, 40, 50];\nconsole.log(numbers.length);\nconsole.log(numbers[numbers.length - 1]);',
    },
  ],
  python: [
    // py-variables 토픽
    {
      trackId: 'py-beginner',
      topicId: 'py-variables',
      difficulty: 'easy',
      points: 10,
      title: '변수 선언과 출력',
      description: 'name 변수에 "홍길동"을 저장하고 print로 출력하세요.',
      requirements: ['변수에 문자열 할당', 'print 함수 사용'],
      testCases: [{ description: '이름 출력', expectedOutput: '홍길동', points: 10 }],
      sampleAnswer: 'name = "홍길동"\nprint(name)',
    },
    {
      trackId: 'py-beginner',
      topicId: 'py-variables',
      difficulty: 'easy',
      points: 10,
      title: '여러 변수 선언',
      description: 'x에 10, y에 20을 저장하고 두 값을 더한 결과를 출력하세요.',
      requirements: ['두 개의 변수 선언', '덧셈 결과 출력'],
      testCases: [{ description: '합계 출력', expectedOutput: '30', points: 10 }],
      sampleAnswer: 'x = 10\ny = 20\nprint(x + y)',
    },
    {
      trackId: 'py-beginner',
      topicId: 'py-variables',
      difficulty: 'medium',
      points: 15,
      title: '자료형 확인하기',
      description: 'age = 25일 때 type(age)의 결과에서 타입 이름만 출력하세요. (예: int)',
      requirements: ['type 함수 사용', '__name__ 속성 사용'],
      testCases: [{ description: '타입 이름', expectedOutput: 'int', points: 15 }],
      sampleAnswer: 'age = 25\nprint(type(age).__name__)',
    },
    // py-conditionals 토픽
    {
      trackId: 'py-beginner',
      topicId: 'py-conditionals',
      difficulty: 'easy',
      points: 10,
      title: '짝수 홀수 판별',
      description: 'num이 10일 때, 짝수이면 "짝수", 홀수이면 "홀수"를 출력하세요.',
      requirements: ['if-else 사용', '나머지 연산자 사용'],
      testCases: [{ description: '10은 짝수', expectedOutput: '짝수', points: 10 }],
      sampleAnswer: 'num = 10\nif num % 2 == 0:\n    print("짝수")\nelse:\n    print("홀수")',
    },
    {
      trackId: 'py-beginner',
      topicId: 'py-conditionals',
      difficulty: 'medium',
      points: 15,
      title: '성적 등급 판정',
      description: 'score가 85일 때, 90이상 A, 80이상 B, 70이상 C, 그 외 F를 출력하세요.',
      requirements: ['elif 사용', '점수 구간 판정'],
      testCases: [{ description: '85점은 B등급', expectedOutput: 'B', points: 15 }],
      sampleAnswer: 'score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelse:\n    print("F")',
    },
    // py-loops 토픽
    {
      trackId: 'py-beginner',
      topicId: 'py-loops',
      difficulty: 'easy',
      points: 10,
      title: '1부터 5까지 출력',
      description: 'for문과 range를 사용하여 1부터 5까지 한 줄에 하나씩 출력하세요.',
      requirements: ['for 반복문 사용', 'range 함수 사용'],
      testCases: [{ description: '1~5 출력', expectedOutput: '1\n2\n3\n4\n5', points: 10 }],
      sampleAnswer: 'for i in range(1, 6):\n    print(i)',
    },
    {
      trackId: 'py-beginner',
      topicId: 'py-loops',
      difficulty: 'medium',
      points: 15,
      title: '1부터 10까지 합계',
      description: 'for문을 사용하여 1부터 10까지의 합계를 구해 출력하세요.',
      requirements: ['for 반복문 사용', '합계 변수 사용'],
      testCases: [{ description: '합계 55', expectedOutput: '55', points: 15 }],
      sampleAnswer: 'total = 0\nfor i in range(1, 11):\n    total += i\nprint(total)',
    },
    // py-function-basics 토픽
    {
      trackId: 'py-beginner',
      topicId: 'py-function-basics',
      difficulty: 'easy',
      points: 10,
      title: '인사 함수 만들기',
      description: 'greet(name) 함수를 만들어 "안녕하세요, {name}님!"을 출력하세요. greet("철수")를 호출하세요.',
      requirements: ['def로 함수 정의', '매개변수 사용'],
      testCases: [{ description: '인사 출력', expectedOutput: '안녕하세요, 철수님!', points: 10 }],
      sampleAnswer: 'def greet(name):\n    print(f"안녕하세요, {name}님!")\n\ngreet("철수")',
    },
    {
      trackId: 'py-beginner',
      topicId: 'py-function-basics',
      difficulty: 'medium',
      points: 15,
      title: '두 수의 합 반환',
      description: 'add(a, b) 함수를 만들어 두 수의 합을 반환하세요. add(3, 5)의 결과를 출력하세요.',
      requirements: ['return 사용', '함수 호출 결과 출력'],
      testCases: [{ description: '3+5=8', expectedOutput: '8', points: 15 }],
      sampleAnswer: 'def add(a, b):\n    return a + b\n\nprint(add(3, 5))',
    },
    // py-lists 토픽
    {
      trackId: 'py-beginner',
      topicId: 'py-lists',
      difficulty: 'easy',
      points: 10,
      title: '리스트 생성과 접근',
      description: 'fruits 리스트에 ["사과", "바나나", "딸기"]를 저장하고 두 번째 요소를 출력하세요.',
      requirements: ['리스트 리터럴 사용', '인덱스 접근'],
      testCases: [{ description: '두 번째 요소', expectedOutput: '바나나', points: 10 }],
      sampleAnswer: 'fruits = ["사과", "바나나", "딸기"]\nprint(fruits[1])',
    },
    {
      trackId: 'py-beginner',
      topicId: 'py-lists',
      difficulty: 'medium',
      points: 15,
      title: '리스트에 요소 추가',
      description: 'numbers = [1, 2, 3]에 4를 추가하고 전체 리스트를 출력하세요.',
      requirements: ['append 메서드 사용'],
      testCases: [{ description: '추가 후 리스트', expectedOutput: '[1, 2, 3, 4]', points: 15 }],
      sampleAnswer: 'numbers = [1, 2, 3]\nnumbers.append(4)\nprint(numbers)',
    },
    // py-dictionaries 토픽
    {
      trackId: 'py-beginner',
      topicId: 'py-dictionaries',
      difficulty: 'easy',
      points: 10,
      title: '딕셔너리 생성과 접근',
      description: 'person 딕셔너리에 {"name": "홍길동", "age": 25}를 저장하고 name 값을 출력하세요.',
      requirements: ['딕셔너리 리터럴 사용', '키로 값 접근'],
      testCases: [{ description: 'name 값', expectedOutput: '홍길동', points: 10 }],
      sampleAnswer: 'person = {"name": "홍길동", "age": 25}\nprint(person["name"])',
    },
  ],
  typescript: [
    // ts-basic-types 토픽
    {
      trackId: 'ts-beginner',
      topicId: 'ts-basic-types',
      difficulty: 'easy',
      points: 10,
      title: '기본 타입 선언',
      description: 'name: string에 "홍길동", age: number에 25를 할당하고 출력하세요.',
      requirements: ['타입 어노테이션 사용', '문자열과 숫자 타입'],
      testCases: [{ description: '이름과 나이', expectedOutput: '홍길동 25', points: 10 }],
      sampleAnswer: 'const name: string = "홍길동";\nconst age: number = 25;\nconsole.log(name, age);',
    },
    {
      trackId: 'ts-beginner',
      topicId: 'ts-basic-types',
      difficulty: 'easy',
      points: 10,
      title: 'boolean 타입',
      description: 'isActive: boolean에 true를 할당하고 출력하세요.',
      requirements: ['boolean 타입 사용'],
      testCases: [{ description: 'boolean 출력', expectedOutput: 'true', points: 10 }],
      sampleAnswer: 'const isActive: boolean = true;\nconsole.log(isActive);',
    },
    // ts-function-types 토픽
    {
      trackId: 'ts-beginner',
      topicId: 'ts-function-types',
      difficulty: 'easy',
      points: 10,
      title: '함수 반환 타입',
      description: 'add(a: number, b: number): number 함수를 만들어 두 수의 합을 반환하세요.',
      requirements: ['매개변수 타입 지정', '반환 타입 지정'],
      testCases: [{ description: '3+5=8', expectedOutput: '8', points: 10 }],
      sampleAnswer: 'function add(a: number, b: number): number {\n  return a + b;\n}\nconsole.log(add(3, 5));',
    },
    {
      trackId: 'ts-beginner',
      topicId: 'ts-function-types',
      difficulty: 'medium',
      points: 15,
      title: '선택적 매개변수',
      description: 'greet(name: string, greeting?: string) 함수를 만드세요. greeting이 없으면 "안녕하세요"를 사용합니다.',
      requirements: ['선택적 매개변수 사용', '기본값 처리'],
      testCases: [{ description: '선택적 매개변수', expectedOutput: '안녕하세요, 철수님!', points: 15 }],
      sampleAnswer: 'function greet(name: string, greeting?: string): void {\n  const g = greeting || "안녕하세요";\n  console.log(`${g}, ${name}님!`);\n}\ngreet("철수");',
    },
    // ts-object-basics 토픽
    {
      trackId: 'ts-basics',
      topicId: 'ts-object-basics',
      difficulty: 'easy',
      points: 10,
      title: '객체 타입 정의',
      description: '{name: string, age: number} 타입의 person 객체를 만들고 name을 출력하세요.',
      requirements: ['인라인 객체 타입 사용'],
      testCases: [{ description: 'name 출력', expectedOutput: '홍길동', points: 10 }],
      sampleAnswer: 'const person: { name: string; age: number } = {\n  name: "홍길동",\n  age: 25\n};\nconsole.log(person.name);',
    },
    // ts-type-alias 토픽
    {
      trackId: 'ts-basics',
      topicId: 'ts-type-alias',
      difficulty: 'medium',
      points: 15,
      title: '타입 별칭 사용',
      description: 'Person 타입을 정의하고 (name, age 포함) person 변수에 할당 후 출력하세요.',
      requirements: ['type 키워드 사용', '타입 별칭 정의'],
      testCases: [{ description: 'Person 타입 사용', expectedOutput: '홍길동 25', points: 15 }],
      sampleAnswer: 'type Person = {\n  name: string;\n  age: number;\n};\n\nconst person: Person = { name: "홍길동", age: 25 };\nconsole.log(person.name, person.age);',
    },
    // ts-union-basics 토픽
    {
      trackId: 'ts-basics',
      topicId: 'ts-union-basics',
      difficulty: 'medium',
      points: 15,
      title: '유니온 타입',
      description: 'id: string | number 타입의 변수를 만들어 먼저 숫자 123, 그 다음 문자열 "ABC"를 할당하고 각각 출력하세요.',
      requirements: ['유니온 타입 사용', '두 가지 타입 할당'],
      testCases: [{ description: '유니온 타입 출력', expectedOutput: '123\nABC', points: 15 }],
      sampleAnswer: 'let id: string | number = 123;\nconsole.log(id);\nid = "ABC";\nconsole.log(id);',
    },
    // ts-generic-basics 토픽
    {
      trackId: 'ts-intermediate',
      topicId: 'ts-generic-basics',
      difficulty: 'medium',
      points: 15,
      title: '제네릭 함수',
      description: 'identity<T>(value: T): T 함수를 만들어 전달받은 값을 그대로 반환하세요.',
      requirements: ['제네릭 타입 매개변수 사용'],
      testCases: [{ description: '제네릭 함수', expectedOutput: 'Hello', points: 15 }],
      sampleAnswer: 'function identity<T>(value: T): T {\n  return value;\n}\nconsole.log(identity<string>("Hello"));',
    },
    {
      trackId: 'ts-intermediate',
      topicId: 'ts-generic-basics',
      difficulty: 'hard',
      points: 20,
      title: '제네릭 배열 함수',
      description: 'getFirst<T>(arr: T[]): T 함수를 만들어 배열의 첫 번째 요소를 반환하세요.',
      requirements: ['제네릭 배열 타입 사용'],
      testCases: [{ description: '첫 번째 요소', expectedOutput: '1', points: 20 }],
      sampleAnswer: 'function getFirst<T>(arr: T[]): T {\n  return arr[0];\n}\nconsole.log(getFirst<number>([1, 2, 3]));',
    },
  ],
};

// =============================================
// 메인 스크립트
// =============================================
async function seedProduction() {
  console.log('🚀 운영 환경 초기 데이터 설정 시작...\n');
  console.log('='.repeat(60));

  try {
    await transaction(async (client) => {
      // =============================================
      // 1. 반(Class) 생성
      // =============================================
      console.log('\n📚 반(Class) 생성 중...');
      for (const cls of CLASSES) {
        const existing = await client.query(
          'SELECT id FROM classes WHERE invite_code = $1',
          [cls.inviteCode]
        );

        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO classes (id, name, invite_code, max_students, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [cls.id, cls.name, cls.inviteCode, cls.maxStudents]
          );
          console.log(`   ✅ ${cls.name} (초대코드: ${cls.inviteCode})`);
        } else {
          // 기존 반의 ID 업데이트
          cls.id = existing.rows[0].id;
          console.log(`   ⏭️  ${cls.name} 이미 존재 (초대코드: ${cls.inviteCode})`);
        }
      }

      // =============================================
      // 2. 관리자/강사 계정 생성
      // =============================================
      console.log('\n👥 관리자/강사 계정 생성 중...');
      for (const staff of STAFF_ACCOUNTS) {
        const existing = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [staff.email]
        );

        if (existing.rows.length === 0) {
          const password = staff.role === 'admin'
            ? CONFIG.adminPassword
            : CONFIG.instructorPassword;
          const passwordHash = await bcrypt.hash(password, 10);
          const classId = staff.classIndex !== null ? CLASSES[staff.classIndex].id : null;

          await client.query(
            `INSERT INTO users (id, email, password_hash, name, role, level, class_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [staff.id, staff.email, passwordHash, staff.name, staff.role, staff.level, classId]
          );
          console.log(`   ✅ ${staff.name} (${staff.email}) - ${staff.role}`);
        } else {
          staff.id = existing.rows[0].id;
          console.log(`   ⏭️  ${staff.name} 이미 존재 (${staff.email})`);
        }
      }

      // =============================================
      // 3. 샘플 학생 계정 생성
      // =============================================
      console.log('\n🎓 샘플 학생 계정 생성 중...');
      const studentPasswordHash = await bcrypt.hash(CONFIG.defaultStudentPassword, 10);
      for (const student of SAMPLE_STUDENTS) {
        const existing = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [student.email]
        );

        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO users (id, email, password_hash, name, role, level, class_id, created_at)
             VALUES ($1, $2, $3, $4, 'student', $5, $6, NOW())`,
            [
              uuidv4(),
              student.email,
              studentPasswordHash,
              student.name,
              student.level,
              CLASSES[student.classIndex].id,
            ]
          );
          console.log(`   ✅ ${student.name} (${student.email}) - ${student.level}`);
        } else {
          console.log(`   ⏭️  ${student.name} 이미 존재 (${student.email})`);
        }
      }

      // =============================================
      // 4. 커리큘럼 개념(Concepts) 데이터 생성
      // =============================================
      console.log('\n📖 커리큘럼 개념(Concepts) 데이터 생성 중...');
      let conceptCount = 0;

      for (const concept of CURRICULUM_CONCEPTS) {
        // 동일 ID의 개념이 있는지 확인
        const existing = await client.query(
          'SELECT id FROM curriculum_concepts WHERE id = $1',
          [concept.id]
        );

        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO curriculum_concepts (
              id, topic_id, name, description, examples, keywords, display_order, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
            [
              concept.id,
              concept.topicId,
              concept.name,
              concept.description,
              JSON.stringify(concept.examples),
              JSON.stringify(concept.keywords),
              concept.displayOrder,
            ]
          );
          conceptCount++;
        }
      }
      console.log(`   ✅ ${conceptCount}개 개념 추가 (총 ${CURRICULUM_CONCEPTS.length}개 중)`);

      // =============================================
      // 5. 문제 은행 데이터 생성
      // =============================================
      console.log('\n📝 문제 은행 데이터 생성 중...');
      const adminId = STAFF_ACCOUNTS.find(s => s.role === 'admin')?.id;
      let questionCount = { javascript: 0, python: 0, typescript: 0 };

      for (const [language, questions] of Object.entries(QUESTION_BANK)) {
        for (const q of questions) {
          // 동일 제목의 문제가 있는지 확인
          const existing = await client.query(
            'SELECT id FROM question_bank WHERE title = $1 AND language = $2',
            [q.title, language]
          );

          if (existing.rows.length === 0) {
            await client.query(
              `INSERT INTO question_bank (
                id, language, track_id, topic_id, difficulty, points,
                title, description, requirements, test_cases, sample_answer,
                status, created_by, approved_by, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', $12, $12, NOW(), NOW())`,
              [
                uuidv4(),
                language,
                q.trackId,
                q.topicId,
                q.difficulty,
                q.points,
                q.title,
                q.description,
                JSON.stringify(q.requirements),
                JSON.stringify(q.testCases),
                q.sampleAnswer,
                adminId,
              ]
            );
            questionCount[language as keyof typeof questionCount]++;
          }
        }
        console.log(`   ✅ ${language}: ${questionCount[language as keyof typeof questionCount]}개 문제 추가`);
      }
    });

    // =============================================
    // 결과 출력
    // =============================================
    console.log('\n' + '='.repeat(60));
    console.log('✨ 운영 환경 초기 데이터 설정 완료!\n');

    console.log('📋 생성된 반(Class) 목록:');
    console.log('-'.repeat(40));
    for (const cls of CLASSES) {
      console.log(`  ${cls.name}`);
      console.log(`    초대코드: ${cls.inviteCode}`);
      console.log(`    정원: ${cls.maxStudents}명`);
    }

    console.log('\n👤 관리자 계정:');
    console.log('-'.repeat(40));
    console.log(`  이메일: admin@codebuddy.io`);
    console.log(`  비밀번호: ${CONFIG.adminPassword}`);

    console.log('\n👨‍🏫 강사 계정:');
    console.log('-'.repeat(40));
    console.log(`  이메일: instructor1@codebuddy.io`);
    console.log(`  이메일: instructor2@codebuddy.io`);
    console.log(`  비밀번호: ${CONFIG.instructorPassword}`);

    console.log('\n🎓 샘플 학생 계정:');
    console.log('-'.repeat(40));
    for (const student of SAMPLE_STUDENTS) {
      console.log(`  ${student.name}: ${student.email}`);
    }
    console.log(`  공통 비밀번호: ${CONFIG.defaultStudentPassword}`);

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  보안 주의사항:');
    console.log('  - 운영 환경에서는 반드시 비밀번호를 변경하세요!');
    console.log('  - 환경변수로 비밀번호 설정: ADMIN_PASSWORD, INSTRUCTOR_PASSWORD');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
seedProduction().catch(console.error);
