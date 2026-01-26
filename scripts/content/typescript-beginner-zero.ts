/**
 * TypeScript 입문 (beginner_zero) 개념 콘텐츠
 * 대상: JavaScript는 알지만 TypeScript는 처음인 학습자
 * 특징: 타입의 필요성, 기본 문법, 실용적인 예제
 */

export const TS_BEGINNER_ZERO_CONCEPTS = {
  'ts-intro-what-is': {
    name: 'TypeScript란?',
    description: 'JavaScript + 타입, 왜 필요한가',
    content: `# TypeScript란?

## JavaScript에 타입을 더하다

TypeScript는 **JavaScript에 타입 시스템을 추가**한 언어입니다.
JavaScript의 모든 기능을 포함하면서, 추가로 타입을 명시할 수 있습니다.

\`\`\`typescript
// JavaScript
let name = "철수";
name = 123;  // 오류 없음 (실행 시 문제 발생 가능)

// TypeScript
let name: string = "철수";
name = 123;  // 컴파일 오류! (미리 발견)
\`\`\`

## 왜 TypeScript를 쓸까?

### 1. 버그를 미리 잡아준다

\`\`\`typescript
function add(a: number, b: number) {
    return a + b;
}

add(5, "3");  // 오류! "3"은 number가 아님
\`\`\`

### 2. 에디터 지원이 좋아진다

- 자동 완성
- 함수 인자 힌트
- 리팩토링 지원

### 3. 문서화 역할

\`\`\`typescript
// 코드만 봐도 이해됨
function createUser(name: string, age: number): User {
    // ...
}
\`\`\`

## TypeScript 동작 방식

1. \`.ts\` 파일 작성
2. TypeScript 컴파일러(tsc)가 \`.js\`로 변환
3. 브라우저/Node.js에서 실행

\`\`\`
main.ts  ---(tsc)--->  main.js
\`\`\`

## 정리

- TypeScript = JavaScript + 타입
- 컴파일 시 오류 발견 (런타임 오류 감소)
- 에디터 지원 강화
- 코드 문서화 효과`,
    runnable_examples: [
      {
        title: 'JavaScript vs TypeScript',
        code: `// TypeScript는 타입을 명시합니다
let message: string = "Hello, TypeScript!";
let count: number = 42;
let isActive: boolean = true;

console.log(message);
console.log(\`count: \${count}, type: \${typeof count}\`);
console.log(\`isActive: \${isActive}\`);

// 타입이 맞지 않으면 컴파일 오류
// count = "문자열";  // Error!`,
        expected_output: `Hello, TypeScript!
count: 42, type: number
isActive: true`,
      },
      {
        title: '함수에 타입 지정',
        code: `// 매개변수와 반환값에 타입 지정
function greet(name: string): string {
    return \`안녕하세요, \${name}님!\`;
}

function add(a: number, b: number): number {
    return a + b;
}

console.log(greet("철수"));
console.log(\`5 + 3 = \${add(5, 3)}\`);

// add("5", "3");  // 오류! 문자열은 number가 아님`,
        expected_output: `안녕하세요, 철수님!
5 + 3 = 8`,
      },
    ],
    keywords: ['TypeScript', '타입', 'JavaScript', '컴파일', 'tsc'],
  },

  'ts-intro-setup': {
    name: '환경 설정',
    description: 'tsc, tsconfig.json 기본',
    content: `# 환경 설정

## TypeScript 설치

\`\`\`bash
# 전역 설치
npm install -g typescript

# 프로젝트에 설치 (권장)
npm install --save-dev typescript
\`\`\`

## 버전 확인

\`\`\`bash
tsc --version
\`\`\`

## 컴파일하기

\`\`\`bash
# 단일 파일 컴파일
tsc hello.ts

# 감시 모드 (파일 변경 시 자동 컴파일)
tsc --watch hello.ts
\`\`\`

## tsconfig.json

프로젝트 설정 파일입니다.

\`\`\`bash
# 설정 파일 생성
tsc --init
\`\`\`

### 기본 설정

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
\`\`\`

### 주요 옵션

- \`target\`: 출력할 JavaScript 버전
- \`strict\`: 엄격한 타입 검사
- \`outDir\`: 출력 디렉토리
- \`rootDir\`: 소스 디렉토리

## 실행 방법

\`\`\`bash
# 방법 1: 컴파일 후 실행
tsc && node dist/index.js

# 방법 2: ts-node 사용 (개발 시 편리)
npm install -g ts-node
ts-node src/index.ts
\`\`\``,
    runnable_examples: [
      {
        title: 'tsconfig.json 예시',
        code: `// tsconfig.json의 주요 설정 이해하기

const config = {
  compilerOptions: {
    target: "ES2020",      // 출력 JS 버전
    module: "commonjs",    // 모듈 시스템
    strict: true,          // 엄격한 타입 검사
    outDir: "./dist",      // 출력 폴더
    rootDir: "./src",      // 소스 폴더
    esModuleInterop: true  // ES 모듈 호환
  },
  include: ["src/**/*"],   // 컴파일할 파일
  exclude: ["node_modules"] // 제외할 폴더
};

console.log("TypeScript 설정 예시:");
console.log(JSON.stringify(config, null, 2));`,
        expected_output: `TypeScript 설정 예시:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}`,
      },
    ],
    keywords: ['tsc', 'tsconfig', '설정', '컴파일', 'npm'],
  },

  'ts-intro-first-code': {
    name: '첫 TypeScript 코드',
    description: '.ts 파일 작성과 컴파일',
    content: `# 첫 TypeScript 코드

## 파일 작성

\`hello.ts\` 파일을 만들어봅시다.

\`\`\`typescript
// hello.ts
function sayHello(name: string): void {
    console.log(\`Hello, \${name}!\`);
}

sayHello("TypeScript");
\`\`\`

## 컴파일

\`\`\`bash
tsc hello.ts
\`\`\`

결과로 \`hello.js\`가 생성됩니다.

\`\`\`javascript
// hello.js (생성된 파일)
function sayHello(name) {
    console.log("Hello, " + name + "!");
}
sayHello("TypeScript");
\`\`\`

## 실행

\`\`\`bash
node hello.js
# 출력: Hello, TypeScript!
\`\`\`

## 타입이 제거되는 것 확인

TypeScript의 타입 정보는 컴파일 후 사라집니다.
JavaScript 런타임에는 타입이 없습니다.

\`\`\`typescript
// TypeScript
let count: number = 42;

// JavaScript로 컴파일 후
let count = 42;  // 타입 정보 없음
\`\`\`

## 타입 오류 확인

\`\`\`typescript
function add(a: number, b: number): number {
    return a + b;
}

add("5", "3");  // 컴파일 오류!
// Argument of type 'string' is not assignable to parameter of type 'number'.
\`\`\`

컴파일 전에 오류를 발견할 수 있습니다!`,
    runnable_examples: [
      {
        title: '기본 TypeScript 코드',
        code: `// 타입이 있는 함수
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

// 타입이 있는 변수
const message: string = greet("World");
console.log(message);

// 숫자 계산
function multiply(a: number, b: number): number {
    return a * b;
}

console.log(\`5 x 4 = \${multiply(5, 4)}\`);`,
        expected_output: `Hello, World!
5 x 4 = 20`,
      },
      {
        title: '다양한 타입 사용',
        code: `// 문자열
const name: string = "TypeScript";

// 숫자
const version: number = 5.0;

// 불리언
const isAwesome: boolean = true;

// 배열
const numbers: number[] = [1, 2, 3, 4, 5];

console.log(\`\${name} \${version}\`);
console.log(\`Is awesome? \${isAwesome}\`);
console.log(\`Numbers: \${numbers.join(", ")}\`);`,
        expected_output: `TypeScript 5.0
Is awesome? true
Numbers: 1, 2, 3, 4, 5`,
      },
    ],
    keywords: ['ts', '컴파일', '실행', 'tsc', 'node'],
  },

  'ts-intro-primitives': {
    name: '원시 타입',
    description: 'string, number, boolean',
    content: `# 원시 타입

## 세 가지 기본 타입

TypeScript의 기본 타입은 JavaScript와 같습니다.

### string

문자열을 나타냅니다.

\`\`\`typescript
let name: string = "홍길동";
let message: string = \`안녕하세요, \${name}님\`;
\`\`\`

### number

모든 숫자 (정수, 실수)를 나타냅니다.

\`\`\`typescript
let age: number = 25;
let price: number = 19.99;
let hex: number = 0xf00d;
\`\`\`

### boolean

true 또는 false를 나타냅니다.

\`\`\`typescript
let isActive: boolean = true;
let hasPermission: boolean = false;
\`\`\`

## 타입 추론

타입을 명시하지 않아도 TypeScript가 추론합니다.

\`\`\`typescript
let name = "철수";  // string으로 추론
let age = 25;       // number로 추론
let isOk = true;    // boolean으로 추론
\`\`\`

## 주의: 대문자 타입

\`\`\`typescript
// 올바름 (소문자)
let name: string = "철수";
let age: number = 25;

// 피해야 함 (대문자 - 래퍼 객체)
let name: String = "철수";  // 권장하지 않음
\`\`\`

소문자 \`string\`, \`number\`, \`boolean\`을 사용하세요.`,
    runnable_examples: [
      {
        title: '원시 타입 사용',
        code: `// string 타입
let firstName: string = "홍";
let lastName: string = "길동";
let fullName: string = \`\${firstName}\${lastName}\`;

// number 타입
let age: number = 30;
let height: number = 175.5;
let score: number = 95;

// boolean 타입
let isStudent: boolean = false;
let isEmployed: boolean = true;

console.log(\`이름: \${fullName}\`);
console.log(\`나이: \${age}세, 키: \${height}cm\`);
console.log(\`학생: \${isStudent}, 직장인: \${isEmployed}\`);`,
        expected_output: `이름: 홍길동
나이: 30세, 키: 175.5cm
학생: false, 직장인: true`,
      },
      {
        title: '타입 추론',
        code: `// 타입을 명시하지 않아도 추론됨
let city = "서울";           // string
let population = 10000000;   // number
let isCapital = true;        // boolean

// 추론된 타입 확인
console.log(\`city: \${typeof city}\`);
console.log(\`population: \${typeof population}\`);
console.log(\`isCapital: \${typeof isCapital}\`);

// 타입 오류 예시
// city = 123;  // Error: number를 string에 할당 불가`,
        expected_output: `city: string
population: number
isCapital: boolean`,
      },
    ],
    keywords: ['string', 'number', 'boolean', '원시타입', '타입추론'],
  },

  'ts-intro-array': {
    name: '배열 타입',
    description: 'number[], Array<string>',
    content: `# 배열 타입

## 배열 선언 방법

두 가지 문법이 있습니다.

\`\`\`typescript
// 방법 1: 타입[] (권장)
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Kim", "Lee", "Park"];

// 방법 2: Array<타입>
let scores: Array<number> = [85, 90, 78];
let colors: Array<string> = ["red", "green", "blue"];
\`\`\`

## 타입 안전성

배열에는 선언된 타입만 넣을 수 있습니다.

\`\`\`typescript
let numbers: number[] = [1, 2, 3];
numbers.push(4);       // OK
numbers.push("five");  // 오류!
\`\`\`

## 2차원 배열

\`\`\`typescript
let matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
\`\`\`

## 읽기 전용 배열

\`\`\`typescript
const numbers: readonly number[] = [1, 2, 3];
// numbers.push(4);  // 오류! readonly 배열은 수정 불가
// numbers[0] = 10;  // 오류!
\`\`\`

## 빈 배열 선언

\`\`\`typescript
// 타입 명시 필수
let items: string[] = [];
items.push("first");  // OK

// 타입 없이 선언하면 any[]가 됨 (권장하지 않음)
let unknown = [];
\`\`\``,
    runnable_examples: [
      {
        title: '배열 기본',
        code: `// 숫자 배열
const numbers: number[] = [10, 20, 30, 40, 50];
console.log("숫자 배열:", numbers);
console.log("합계:", numbers.reduce((a, b) => a + b, 0));

// 문자열 배열
const fruits: string[] = ["apple", "banana", "cherry"];
console.log("과일:", fruits.join(", "));

// 불리언 배열
const flags: boolean[] = [true, false, true];
console.log("플래그:", flags);`,
        expected_output: `숫자 배열: [10, 20, 30, 40, 50]
합계: 150
과일: apple, banana, cherry
플래그: [true, false, true]`,
      },
      {
        title: '배열 조작',
        code: `const items: string[] = [];

// 요소 추가
items.push("first");
items.push("second");
items.push("third");
console.log("추가 후:", items);

// 배열 메서드 (타입 안전)
const upperItems: string[] = items.map(item => item.toUpperCase());
console.log("대문자:", upperItems);

// 필터링
const filtered: string[] = items.filter(item => item.length > 5);
console.log("5자 초과:", filtered);`,
        expected_output: `추가 후: ["first", "second", "third"]
대문자: ["FIRST", "SECOND", "THIRD"]
5자 초과: ["second"]`,
      },
      {
        title: '2차원 배열',
        code: `// 2차원 숫자 배열
const matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log("행렬:");
for (const row of matrix) {
    console.log("  ", row);
}

// 특정 위치 접근
console.log(\`\\n중앙값: \${matrix[1][1]}\`);`,
        expected_output: `행렬:
  [1, 2, 3]
  [4, 5, 6]
  [7, 8, 9]

중앙값: 5`,
      },
    ],
    keywords: ['배열', 'array', '[]', 'Array', 'readonly'],
  },

  'ts-intro-any-unknown': {
    name: 'any와 unknown',
    description: '타입을 모를 때, 차이점',
    content: `# any와 unknown

## any 타입

모든 타입을 허용합니다. 타입 검사를 우회합니다.

\`\`\`typescript
let value: any = 10;
value = "hello";  // OK
value = true;     // OK
value.foo();      // OK (런타임 오류 가능!)
\`\`\`

### any의 문제점

\`\`\`typescript
let data: any = "hello";
console.log(data.toFixed(2));  // 런타임 오류!
// TypeScript가 검사하지 않음
\`\`\`

## unknown 타입

any처럼 모든 값을 받지만, 사용 전 타입 검사가 필요합니다.

\`\`\`typescript
let value: unknown = "hello";
// value.toUpperCase();  // 오류! unknown은 바로 사용 불가

// 타입 검사 후 사용
if (typeof value === "string") {
    console.log(value.toUpperCase());  // OK
}
\`\`\`

## any vs unknown

| | any | unknown |
|---|---|---|
| 모든 값 할당 | O | O |
| 다른 변수에 할당 | O | X (타입 검사 필요) |
| 메서드 호출 | O (위험) | X (타입 검사 필요) |
| 권장 | 비권장 | 권장 |

## 언제 사용할까?

\`\`\`typescript
// 외부 데이터 (API 응답 등)
async function fetchData(): Promise<unknown> {
    const response = await fetch("/api/data");
    return response.json();
}

// 사용 시 타입 검사
const data = await fetchData();
if (typeof data === "object" && data !== null) {
    // 안전하게 사용
}
\`\`\``,
    runnable_examples: [
      {
        title: 'any 타입',
        code: `// any는 모든 타입 허용
let anything: any = "문자열";
console.log("1:", anything);

anything = 123;
console.log("2:", anything);

anything = { name: "객체" };
console.log("3:", anything);

// 위험: 타입 검사 없이 호출 가능
// anything.unknownMethod();  // 런타임 오류!`,
        expected_output: `1: 문자열
2: 123
3: { name: '객체' }`,
      },
      {
        title: 'unknown 타입',
        code: `// unknown은 타입 검사 후 사용
let value: unknown = "Hello TypeScript";

// 직접 사용 불가
// console.log(value.length);  // Error!

// 타입 검사 후 사용
if (typeof value === "string") {
    console.log("문자열 길이:", value.length);
    console.log("대문자:", value.toUpperCase());
}

// 다른 값으로 변경
value = 42;
if (typeof value === "number") {
    console.log("숫자 제곱:", value * value);
}`,
        expected_output: `문자열 길이: 16
대문자: HELLO TYPESCRIPT
숫자 제곱: 1764`,
      },
      {
        title: 'unknown 활용',
        code: `// 안전한 JSON 파싱
function safeParseJSON(jsonString: string): unknown {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}

const data = safeParseJSON('{"name": "Kim", "age": 25}');

// 타입 검사 후 사용
if (data && typeof data === "object") {
    const obj = data as { name?: string; age?: number };
    console.log("이름:", obj.name);
    console.log("나이:", obj.age);
}`,
        expected_output: `이름: Kim
나이: 25`,
      },
    ],
    keywords: ['any', 'unknown', '타입안전', '타입검사'],
  },

  'ts-intro-var-type': {
    name: '변수 타입 명시',
    description: 'let name: string = "Kim"',
    content: `# 변수 타입 명시

## 기본 문법

변수 선언 시 타입을 명시합니다.

\`\`\`typescript
let 변수명: 타입 = 값;
const 변수명: 타입 = 값;
\`\`\`

## 예시

\`\`\`typescript
let name: string = "홍길동";
let age: number = 25;
let isStudent: boolean = true;
const PI: number = 3.14159;
\`\`\`

## 타입 추론 활용

초기값이 있으면 타입을 생략해도 됩니다.

\`\`\`typescript
// 명시적 타입
let name: string = "철수";

// 타입 추론 (동일한 결과)
let name = "철수";
\`\`\`

## 언제 타입을 명시할까?

### 명시하는 것이 좋은 경우

\`\`\`typescript
// 1. 초기값이 없을 때
let data: string;
data = "later";

// 2. 타입 추론이 원하는 것과 다를 때
let id: number | string = 123;

// 3. 함수 매개변수/반환값
function add(a: number, b: number): number {
    return a + b;
}
\`\`\`

### 생략해도 좋은 경우

\`\`\`typescript
// 초기값으로 타입이 명확한 경우
const name = "철수";      // string
const count = 42;         // number
const items = [1, 2, 3];  // number[]
\`\`\``,
    runnable_examples: [
      {
        title: '변수 타입 명시',
        code: `// 타입 명시
let username: string = "user123";
let score: number = 95;
let isPremium: boolean = true;

console.log(\`사용자: \${username}\`);
console.log(\`점수: \${score}\`);
console.log(\`프리미엄: \${isPremium}\`);

// 나중에 값 할당
let email: string;
email = "user@example.com";
console.log(\`이메일: \${email}\`);`,
        expected_output: `사용자: user123
점수: 95
프리미엄: true
이메일: user@example.com`,
      },
      {
        title: '타입 추론 vs 명시',
        code: `// 타입 추론 (권장 - 간결함)
const firstName = "길동";
const age = 25;
const isActive = true;

// 타입 명시 (명확성이 필요할 때)
let lastName: string = "홍";
let level: number = 1;
let hasPermission: boolean = false;

// 결과는 동일
console.log(\`\${lastName}\${firstName}, \${age}세\`);
console.log(\`레벨: \${level}, 활성: \${isActive}\`);`,
        expected_output: `홍길동, 25세
레벨: 1, 활성: true`,
      },
      {
        title: 'const vs let',
        code: `// const: 재할당 불가
const MAX_SIZE: number = 100;
// MAX_SIZE = 200;  // Error!

// let: 재할당 가능
let currentSize: number = 50;
currentSize = 75;  // OK

console.log(\`최대: \${MAX_SIZE}\`);
console.log(\`현재: \${currentSize}\`);

// const 객체의 속성은 변경 가능
const config: { port: number } = { port: 3000 };
config.port = 8080;  // OK
console.log(\`포트: \${config.port}\`);`,
        expected_output: `최대: 100
현재: 75
포트: 8080`,
      },
    ],
    keywords: ['변수', 'let', 'const', '타입명시', '타입추론'],
  },

  'ts-intro-func-type': {
    name: '함수 타입 명시',
    description: '매개변수와 반환 타입',
    content: `# 함수 타입 명시

## 기본 문법

\`\`\`typescript
function 함수명(매개변수: 타입): 반환타입 {
    return 값;
}
\`\`\`

## 예시

\`\`\`typescript
function add(a: number, b: number): number {
    return a + b;
}

function greet(name: string): string {
    return \`Hello, \${name}!\`;
}
\`\`\`

## 반환 타입이 없을 때: void

\`\`\`typescript
function logMessage(message: string): void {
    console.log(message);
    // return 없음
}
\`\`\`

## 화살표 함수

\`\`\`typescript
const add = (a: number, b: number): number => {
    return a + b;
};

// 한 줄일 때
const double = (n: number): number => n * 2;
\`\`\`

## 선택적 매개변수

\`\`\`typescript
function greet(name: string, greeting?: string): string {
    return \`\${greeting || "Hello"}, \${name}!\`;
}

greet("철수");           // "Hello, 철수!"
greet("철수", "안녕");   // "안녕, 철수!"
\`\`\`

## 기본값 매개변수

\`\`\`typescript
function greet(name: string, greeting: string = "Hello"): string {
    return \`\${greeting}, \${name}!\`;
}
\`\`\``,
    runnable_examples: [
      {
        title: '기본 함수 타입',
        code: `// 매개변수와 반환 타입 명시
function add(a: number, b: number): number {
    return a + b;
}

function concat(a: string, b: string): string {
    return a + b;
}

console.log("3 + 5 =", add(3, 5));
console.log("Hello + World =", concat("Hello", "World"));`,
        expected_output: `3 + 5 = 8
Hello + World = HelloWorld`,
      },
      {
        title: 'void와 화살표 함수',
        code: `// void: 반환값 없음
function logInfo(message: string): void {
    console.log(\`[INFO] \${message}\`);
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;
const greet = (name: string): string => \`Hello, \${name}!\`;

logInfo("프로그램 시작");
console.log("4 x 7 =", multiply(4, 7));
console.log(greet("TypeScript"));`,
        expected_output: `[INFO] 프로그램 시작
4 x 7 = 28
Hello, TypeScript!`,
      },
      {
        title: '선택적/기본값 매개변수',
        code: `// 선택적 매개변수 (?)
function createUser(name: string, age?: number): string {
    if (age !== undefined) {
        return \`\${name} (\${age}세)\`;
    }
    return name;
}

// 기본값 매개변수
function formatPrice(price: number, currency: string = "원"): string {
    return \`\${price.toLocaleString()}\${currency}\`;
}

console.log(createUser("철수"));
console.log(createUser("영희", 25));
console.log(formatPrice(10000));
console.log(formatPrice(50, "$"));`,
        expected_output: `철수
영희 (25세)
10,000원
50$`,
      },
    ],
    keywords: ['함수', 'function', 'void', '매개변수', '반환타입'],
  },

  'ts-intro-inference': {
    name: '타입 추론',
    description: 'TypeScript가 알아서 추론',
    content: `# 타입 추론

## TypeScript의 똑똑한 추론

TypeScript는 코드를 분석해 타입을 자동으로 추론합니다.

\`\`\`typescript
// 명시하지 않아도 타입이 결정됨
let name = "철수";    // string
let age = 25;         // number
let isOk = true;      // boolean
\`\`\`

## 추론이 작동하는 곳

### 변수 초기화

\`\`\`typescript
let message = "hello";  // string으로 추론
// message = 123;  // 오류!
\`\`\`

### 함수 반환값

\`\`\`typescript
function add(a: number, b: number) {
    return a + b;  // 반환 타입: number로 추론
}
\`\`\`

### 배열

\`\`\`typescript
const numbers = [1, 2, 3];  // number[]
const mixed = [1, "two"];   // (number | string)[]
\`\`\`

## 추론의 한계

### 초기값 없을 때

\`\`\`typescript
let data;  // any로 추론 (위험!)
data = "hello";
data = 123;

// 해결: 타입 명시
let data: string;
\`\`\`

### 매개변수

\`\`\`typescript
// 매개변수는 추론 불가 (명시 필요)
function greet(name) {  // any
    return \`Hello, \${name}\`;
}

// 올바른 방법
function greet(name: string) {
    return \`Hello, \${name}\`;
}
\`\`\`

## 추론에 맡길까, 명시할까?

\`\`\`typescript
// 추론에 맡기기 좋은 경우
const name = "철수";
const numbers = [1, 2, 3];

// 명시하는 것이 좋은 경우
function processData(data: unknown): string { ... }
let items: string[] = [];
\`\`\``,
    runnable_examples: [
      {
        title: '타입 추론 예시',
        code: `// 변수 초기화에서 추론
let name = "홍길동";  // string
let age = 30;         // number
let active = true;    // boolean

// 배열 추론
const scores = [85, 90, 78];  // number[]
const words = ["a", "b"];     // string[]

// 마우스 오버하면 타입 확인 가능!
console.log(\`이름: \${name} (추론: string)\`);
console.log(\`나이: \${age} (추론: number)\`);
console.log(\`점수: \${scores} (추론: number[])\`);`,
        expected_output: `이름: 홍길동 (추론: string)
나이: 30 (추론: number)
점수: 85,90,78 (추론: number[])`,
      },
      {
        title: '함수 반환 타입 추론',
        code: `// 반환 타입 자동 추론
function multiply(a: number, b: number) {
    return a * b;  // number 반환 추론
}

function getMessage(name: string) {
    return \`Hello, \${name}!\`;  // string 반환 추론
}

function getFirstElement<T>(arr: T[]) {
    return arr[0];  // T 반환 추론
}

console.log(multiply(4, 5));
console.log(getMessage("World"));
console.log(getFirstElement([1, 2, 3]));
console.log(getFirstElement(["a", "b"]));`,
        expected_output: `20
Hello, World!
1
a`,
      },
      {
        title: '복잡한 추론',
        code: `// 객체 타입 추론
const user = {
    name: "Kim",
    age: 25,
    isAdmin: false
};
// 타입: { name: string; age: number; isAdmin: boolean }

// 조건 표현식 추론
const value = Math.random() > 0.5 ? "문자열" : 123;
// 타입: string | number

console.log("user:", user);
console.log("value:", value, "타입:", typeof value);`,
        expected_output: `user: { name: 'Kim', age: 25, isAdmin: false }
value: 문자열 타입: string`,
      },
    ],
    keywords: ['타입추론', 'inference', '자동', '추론'],
  },

  'ts-intro-obj-type': {
    name: '객체 타입 기본',
    description: '{ name: string, age: number }',
    content: `# 객체 타입 기본

## 객체의 형태 정의

객체 타입은 속성의 이름과 타입을 정의합니다.

\`\`\`typescript
let user: { name: string; age: number } = {
    name: "철수",
    age: 25
};
\`\`\`

## 여러 줄로 작성

\`\`\`typescript
let user: {
    name: string;
    age: number;
    email: string;
} = {
    name: "철수",
    age: 25,
    email: "chul@mail.com"
};
\`\`\`

## 함수 매개변수로

\`\`\`typescript
function printUser(user: { name: string; age: number }): void {
    console.log(\`\${user.name}, \${user.age}세\`);
}

printUser({ name: "철수", age: 25 });
\`\`\`

## 타입 별칭 사용 (권장)

\`\`\`typescript
type User = {
    name: string;
    age: number;
};

let user: User = { name: "철수", age: 25 };

function printUser(user: User): void {
    console.log(\`\${user.name}, \${user.age}세\`);
}
\`\`\`

## 초과 속성 검사

\`\`\`typescript
type User = { name: string };

// 직접 할당: 초과 속성 오류
// let user: User = { name: "철수", age: 25 };  // 오류!

// 변수를 통한 할당: 오류 없음
let data = { name: "철수", age: 25 };
let user: User = data;  // OK
\`\`\``,
    runnable_examples: [
      {
        title: '객체 타입 기본',
        code: `// 인라인 객체 타입
let person: { name: string; age: number } = {
    name: "홍길동",
    age: 30
};

console.log(\`이름: \${person.name}\`);
console.log(\`나이: \${person.age}세\`);

// 속성 접근
person.age = 31;  // OK
console.log(\`생일 후: \${person.age}세\`);`,
        expected_output: `이름: 홍길동
나이: 30세
생일 후: 31세`,
      },
      {
        title: '타입 별칭 사용',
        code: `// type으로 이름 붙이기
type Product = {
    id: number;
    name: string;
    price: number;
};

const laptop: Product = {
    id: 1,
    name: "MacBook Pro",
    price: 2000000
};

const phone: Product = {
    id: 2,
    name: "iPhone",
    price: 1200000
};

function printProduct(p: Product): void {
    console.log(\`[\${p.id}] \${p.name}: \${p.price.toLocaleString()}원\`);
}

printProduct(laptop);
printProduct(phone);`,
        expected_output: `[1] MacBook Pro: 2,000,000원
[2] iPhone: 1,200,000원`,
      },
      {
        title: '중첩 객체',
        code: `type Address = {
    city: string;
    zipCode: string;
};

type User = {
    name: string;
    address: Address;
};

const user: User = {
    name: "김철수",
    address: {
        city: "서울",
        zipCode: "12345"
    }
};

console.log(\`이름: \${user.name}\`);
console.log(\`주소: \${user.address.city} (\${user.address.zipCode})\`);`,
        expected_output: `이름: 김철수
주소: 서울 (12345)`,
      },
    ],
    keywords: ['객체', 'object', 'type', '속성', '타입별칭'],
  },

  'ts-intro-optional': {
    name: '선택적 속성',
    description: 'name?: string',
    content: `# 선택적 속성

## 있어도 되고 없어도 되는 속성

\`?\`를 붙이면 선택적 속성이 됩니다.

\`\`\`typescript
type User = {
    name: string;     // 필수
    age?: number;     // 선택
    email?: string;   // 선택
};

// 모두 유효함
let user1: User = { name: "철수" };
let user2: User = { name: "영희", age: 25 };
let user3: User = { name: "민수", age: 30, email: "min@mail.com" };
\`\`\`

## 선택적 속성 사용 시 주의

선택적 속성은 \`undefined\`일 수 있습니다.

\`\`\`typescript
type User = {
    name: string;
    age?: number;
};

function printAge(user: User): void {
    // user.age.toFixed();  // 오류! age가 undefined일 수 있음

    // 방법 1: 조건 검사
    if (user.age !== undefined) {
        console.log(user.age.toFixed());
    }

    // 방법 2: 옵셔널 체이닝
    console.log(user.age?.toFixed());

    // 방법 3: 기본값
    console.log((user.age ?? 0).toFixed());
}
\`\`\`

## 함수 매개변수에서

\`\`\`typescript
function greet(name: string, greeting?: string): string {
    return \`\${greeting || "Hello"}, \${name}!\`;
}

greet("철수");          // "Hello, 철수!"
greet("철수", "안녕");  // "안녕, 철수!"
\`\`\``,
    runnable_examples: [
      {
        title: '선택적 속성 기본',
        code: `type User = {
    name: string;
    age?: number;
    email?: string;
};

// 필수 속성만
const user1: User = { name: "철수" };

// 일부 선택 속성
const user2: User = { name: "영희", age: 25 };

// 모든 속성
const user3: User = {
    name: "민수",
    age: 30,
    email: "min@mail.com"
};

console.log("user1:", user1);
console.log("user2:", user2);
console.log("user3:", user3);`,
        expected_output: `user1: { name: '철수' }
user2: { name: '영희', age: 25 }
user3: { name: '민수', age: 30, email: 'min@mail.com' }`,
      },
      {
        title: '선택적 속성 안전하게 사용',
        code: `type Config = {
    host: string;
    port?: number;
    debug?: boolean;
};

function createConnection(config: Config): string {
    // 옵셔널 체이닝과 기본값
    const port = config.port ?? 3000;
    const debug = config.debug ?? false;

    return \`\${config.host}:\${port} (debug: \${debug})\`;
}

console.log(createConnection({ host: "localhost" }));
console.log(createConnection({ host: "api.example.com", port: 8080 }));
console.log(createConnection({ host: "dev.local", debug: true }));`,
        expected_output: `localhost:3000 (debug: false)
api.example.com:8080 (debug: false)
dev.local:3000 (debug: true)`,
      },
    ],
    keywords: ['선택적', 'optional', '?', 'undefined', '옵셔널'],
  },

  'ts-intro-readonly': {
    name: '읽기 전용',
    description: 'readonly id: number',
    content: `# 읽기 전용 속성

## readonly 키워드

\`readonly\`는 속성을 읽기 전용으로 만듭니다.
한 번 설정하면 변경할 수 없습니다.

\`\`\`typescript
type User = {
    readonly id: number;
    name: string;
};

const user: User = { id: 1, name: "철수" };
user.name = "영희";  // OK
// user.id = 2;      // 오류! readonly 속성
\`\`\`

## 왜 readonly를 쓸까?

1. **실수 방지**: 변경되면 안 되는 값 보호
2. **의도 표현**: 이 값은 변경 안 함을 명시
3. **디버깅 용이**: 어디서 값이 변경됐는지 추적 쉬움

## 배열에 readonly

\`\`\`typescript
type User = {
    readonly permissions: readonly string[];
};

const user: User = {
    permissions: ["read", "write"]
};

// user.permissions = [];      // 오류! readonly 속성
// user.permissions.push("x"); // 오류! readonly 배열
\`\`\`

## Readonly 유틸리티 타입

\`\`\`typescript
type User = {
    id: number;
    name: string;
};

type ReadonlyUser = Readonly<User>;
// 모든 속성이 readonly가 됨

const user: ReadonlyUser = { id: 1, name: "철수" };
// user.id = 2;    // 오류!
// user.name = ""; // 오류!
\`\`\``,
    runnable_examples: [
      {
        title: 'readonly 기본',
        code: `type User = {
    readonly id: number;
    name: string;
    email: string;
};

const user: User = {
    id: 1,
    name: "홍길동",
    email: "hong@mail.com"
};

// 일반 속성은 변경 가능
user.name = "김철수";
user.email = "kim@mail.com";

// readonly 속성은 변경 불가
// user.id = 2;  // Error!

console.log(\`ID: \${user.id} (변경 불가)\`);
console.log(\`이름: \${user.name}\`);
console.log(\`이메일: \${user.email}\`);`,
        expected_output: `ID: 1 (변경 불가)
이름: 김철수
이메일: kim@mail.com`,
      },
      {
        title: 'readonly 배열',
        code: `type Config = {
    readonly settings: readonly string[];
    mutableList: string[];
};

const config: Config = {
    settings: ["debug", "verbose"],
    mutableList: ["item1"]
};

// 읽기만 가능
console.log("설정:", config.settings);
console.log("첫 번째 설정:", config.settings[0]);

// mutableList는 변경 가능
config.mutableList.push("item2");
console.log("변경 가능 리스트:", config.mutableList);

// settings는 변경 불가
// config.settings.push("new");  // Error!
// config.settings = [];         // Error!`,
        expected_output: `설정: ["debug", "verbose"]
첫 번째 설정: debug
변경 가능 리스트: ["item1", "item2"]`,
      },
      {
        title: 'Readonly 유틸리티',
        code: `type Product = {
    id: number;
    name: string;
    price: number;
};

// 모든 속성을 readonly로
type FrozenProduct = Readonly<Product>;

const product: FrozenProduct = {
    id: 1,
    name: "노트북",
    price: 1500000
};

console.log("상품:", product);

// 모든 속성 변경 불가
// product.id = 2;        // Error!
// product.name = "폰";   // Error!
// product.price = 1000;  // Error!

console.log("(모든 속성이 readonly)");`,
        expected_output: `상품: { id: 1, name: '노트북', price: 1500000 }
(모든 속성이 readonly)`,
      },
    ],
    keywords: ['readonly', '읽기전용', '불변', 'Readonly'],
  },

  'ts-intro-interface-basic': {
    name: '인터페이스 기본',
    description: 'interface User { }',
    content: `# 인터페이스 기본

## interface란?

인터페이스는 객체의 형태를 정의하는 또 다른 방법입니다.
\`type\`과 비슷하지만 약간의 차이가 있습니다.

\`\`\`typescript
interface User {
    name: string;
    age: number;
}

const user: User = {
    name: "철수",
    age: 25
};
\`\`\`

## 메서드 정의

\`\`\`typescript
interface User {
    name: string;
    greet(): string;
    setAge(age: number): void;
}

const user: User = {
    name: "철수",
    greet() {
        return \`안녕, 나는 \${this.name}\`;
    },
    setAge(age) {
        console.log(\`나이: \${age}\`);
    }
};
\`\`\`

## 선택적 속성과 readonly

\`\`\`typescript
interface User {
    readonly id: number;
    name: string;
    email?: string;
}
\`\`\`

## interface vs type

대부분의 경우 둘 다 사용 가능합니다.

\`\`\`typescript
// interface
interface User {
    name: string;
}

// type
type User = {
    name: string;
};
\`\`\`

### 주요 차이점

- **interface**: 확장(extends)과 선언 병합 지원
- **type**: 유니온, 튜플 등 더 다양한 타입 표현 가능`,
    runnable_examples: [
      {
        title: '인터페이스 기본',
        code: `interface User {
    id: number;
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: "홍길동",
    email: "hong@mail.com"
};

function printUser(u: User): void {
    console.log(\`[\${u.id}] \${u.name} <\${u.email}>\`);
}

printUser(user);`,
        expected_output: `[1] 홍길동 <hong@mail.com>`,
      },
      {
        title: '메서드가 있는 인터페이스',
        code: `interface Calculator {
    value: number;
    add(n: number): number;
    subtract(n: number): number;
    reset(): void;
}

const calc: Calculator = {
    value: 0,
    add(n) {
        this.value += n;
        return this.value;
    },
    subtract(n) {
        this.value -= n;
        return this.value;
    },
    reset() {
        this.value = 0;
    }
};

console.log("add(10):", calc.add(10));
console.log("add(5):", calc.add(5));
console.log("subtract(3):", calc.subtract(3));
calc.reset();
console.log("reset() 후:", calc.value);`,
        expected_output: `add(10): 10
add(5): 15
subtract(3): 12
reset() 후: 0`,
      },
      {
        title: '선택적/readonly 속성',
        code: `interface Product {
    readonly id: number;
    name: string;
    price: number;
    description?: string;
}

const product: Product = {
    id: 1,
    name: "노트북",
    price: 1500000
};

// description은 선택적
console.log("상품:", product.name);
console.log("설명:", product.description ?? "설명 없음");

// id는 변경 불가
// product.id = 2;  // Error!`,
        expected_output: `상품: 노트북
설명: 설명 없음`,
      },
    ],
    keywords: ['interface', '인터페이스', '객체', '형태', '정의'],
  },

  'ts-intro-interface-extend': {
    name: '인터페이스 확장',
    description: 'extends로 상속',
    content: `# 인터페이스 확장

## extends 키워드

인터페이스는 다른 인터페이스를 확장(상속)할 수 있습니다.

\`\`\`typescript
interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

const dog: Dog = {
    name: "바둑이",
    breed: "진돗개"
};
\`\`\`

## 여러 인터페이스 확장

\`\`\`typescript
interface Named {
    name: string;
}

interface Aged {
    age: number;
}

interface Person extends Named, Aged {
    email: string;
}

const person: Person = {
    name: "철수",
    age: 25,
    email: "chul@mail.com"
};
\`\`\`

## 속성 오버라이드

\`\`\`typescript
interface Base {
    id: number | string;
}

interface Derived extends Base {
    id: number;  // 더 좁은 타입으로 오버라이드
}
\`\`\`

## 실용적인 예시

\`\`\`typescript
interface BaseEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

interface User extends BaseEntity {
    name: string;
    email: string;
}

interface Post extends BaseEntity {
    title: string;
    content: string;
    authorId: number;
}
\`\`\``,
    runnable_examples: [
      {
        title: '기본 확장',
        code: `interface Animal {
    name: string;
    age: number;
}

interface Dog extends Animal {
    breed: string;
    bark(): void;
}

const dog: Dog = {
    name: "바둑이",
    age: 3,
    breed: "진돗개",
    bark() {
        console.log(\`\${this.name}: 멍멍!\`);
    }
};

console.log(\`이름: \${dog.name}, 나이: \${dog.age}세\`);
console.log(\`품종: \${dog.breed}\`);
dog.bark();`,
        expected_output: `이름: 바둑이, 나이: 3세
품종: 진돗개
바둑이: 멍멍!`,
      },
      {
        title: '다중 확장',
        code: `interface HasId {
    id: number;
}

interface HasTimestamp {
    createdAt: Date;
    updatedAt: Date;
}

interface User extends HasId, HasTimestamp {
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: "홍길동",
    email: "hong@mail.com",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15")
};

console.log(\`ID: \${user.id}\`);
console.log(\`이름: \${user.name}\`);
console.log(\`생성일: \${user.createdAt.toLocaleDateString()}\`);`,
        expected_output: `ID: 1
이름: 홍길동
생성일: 2024. 1. 1.`,
      },
      {
        title: '실용 예제: API 응답',
        code: `interface BaseResponse {
    success: boolean;
    timestamp: string;
}

interface UserResponse extends BaseResponse {
    data: {
        id: number;
        name: string;
    };
}

interface ErrorResponse extends BaseResponse {
    success: false;
    error: string;
}

function handleResponse(res: UserResponse | ErrorResponse): void {
    console.log(\`성공: \${res.success}\`);
    console.log(\`시간: \${res.timestamp}\`);

    if (res.success) {
        console.log(\`사용자: \${(res as UserResponse).data.name}\`);
    } else {
        console.log(\`오류: \${res.error}\`);
    }
}

handleResponse({
    success: true,
    timestamp: "2024-01-15T10:00:00",
    data: { id: 1, name: "Kim" }
});`,
        expected_output: `성공: true
시간: 2024-01-15T10:00:00
사용자: Kim`,
      },
    ],
    keywords: ['extends', '확장', '상속', '인터페이스'],
  },

  'ts-intro-type-basic': {
    name: '타입 별칭 기본',
    description: 'type ID = string | number',
    content: `# 타입 별칭

## type 키워드

타입 별칭은 타입에 이름을 붙이는 것입니다.

\`\`\`typescript
type ID = number;
type Name = string;

let userId: ID = 123;
let userName: Name = "철수";
\`\`\`

## 유니온 타입에 이름 붙이기

\`\`\`typescript
type ID = string | number;

let id1: ID = 123;
let id2: ID = "abc123";
\`\`\`

## 객체 타입

\`\`\`typescript
type User = {
    id: number;
    name: string;
    email?: string;
};

const user: User = {
    id: 1,
    name: "철수"
};
\`\`\`

## 함수 타입

\`\`\`typescript
type Callback = (data: string) => void;
type Calculator = (a: number, b: number) => number;

const log: Callback = (data) => console.log(data);
const add: Calculator = (a, b) => a + b;
\`\`\`

## 타입 조합

\`\`\`typescript
type Point = { x: number; y: number };
type Label = { label: string };

// 교차 타입 (&)
type LabeledPoint = Point & Label;

const point: LabeledPoint = {
    x: 10,
    y: 20,
    label: "원점"
};
\`\`\``,
    runnable_examples: [
      {
        title: '타입 별칭 기본',
        code: `// 원시 타입에 별칭
type UserID = number;
type Username = string;

const id: UserID = 12345;
const name: Username = "홍길동";

// 유니온 타입 별칭
type Status = "pending" | "active" | "inactive";

let userStatus: Status = "active";
console.log(\`ID: \${id}, 이름: \${name}\`);
console.log(\`상태: \${userStatus}\`);`,
        expected_output: `ID: 12345, 이름: 홍길동
상태: active`,
      },
      {
        title: '객체와 함수 타입',
        code: `// 객체 타입 별칭
type Product = {
    id: number;
    name: string;
    price: number;
};

// 함수 타입 별칭
type PriceFormatter = (price: number) => string;

const formatPrice: PriceFormatter = (price) => {
    return \`\${price.toLocaleString()}원\`;
};

const laptop: Product = {
    id: 1,
    name: "MacBook",
    price: 2500000
};

console.log(\`\${laptop.name}: \${formatPrice(laptop.price)}\`);`,
        expected_output: `MacBook: 2,500,000원`,
      },
      {
        title: '타입 조합',
        code: `type HasId = { id: number };
type HasName = { name: string };
type HasEmail = { email: string };

// 교차 타입으로 조합
type User = HasId & HasName & HasEmail;

const user: User = {
    id: 1,
    name: "김철수",
    email: "kim@mail.com"
};

// 타입별로 검증
function printId(entity: HasId): void {
    console.log(\`ID: \${entity.id}\`);
}

function printName(entity: HasName): void {
    console.log(\`이름: \${entity.name}\`);
}

printId(user);
printName(user);`,
        expected_output: `ID: 1
이름: 김철수`,
      },
    ],
    keywords: ['type', '타입별칭', '유니온', '교차', 'alias'],
  },

  'ts-intro-interface-vs-type': {
    name: 'interface vs type',
    description: '언제 무엇을 쓸까',
    content: `# interface vs type

## 둘 다 객체 타입 정의 가능

\`\`\`typescript
// interface
interface User {
    name: string;
    age: number;
}

// type
type User = {
    name: string;
    age: number;
};
\`\`\`

## interface만 가능한 것

### 선언 병합

\`\`\`typescript
interface User {
    name: string;
}

interface User {
    age: number;
}

// 자동으로 합쳐짐
const user: User = {
    name: "철수",
    age: 25
};
\`\`\`

### extends로 확장

\`\`\`typescript
interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}
\`\`\`

## type만 가능한 것

### 유니온 타입

\`\`\`typescript
type ID = string | number;
type Status = "pending" | "done";
\`\`\`

### 튜플 타입

\`\`\`typescript
type Point = [number, number];
type Response = [boolean, string];
\`\`\`

### 원시 타입 별칭

\`\`\`typescript
type Name = string;
type Age = number;
\`\`\`

## 언제 무엇을 쓸까?

| 상황 | 권장 |
|------|------|
| 객체 형태 정의 | interface |
| 확장이 필요 | interface |
| 유니온/튜플 | type |
| 라이브러리 API | interface |
| 일관성 중시 | 하나를 선택해서 통일 |`,
    runnable_examples: [
      {
        title: 'interface 선언 병합',
        code: `// 같은 이름의 interface는 합쳐짐
interface Config {
    host: string;
}

interface Config {
    port: number;
}

interface Config {
    debug?: boolean;
}

// 모든 속성이 합쳐진 Config
const config: Config = {
    host: "localhost",
    port: 3000,
    debug: true
};

console.log("설정:", config);`,
        expected_output: `설정: { host: 'localhost', port: 3000, debug: true }`,
      },
      {
        title: 'type 유니온과 튜플',
        code: `// 유니온 (interface로 불가)
type ID = string | number;
type Status = "pending" | "active" | "done";

// 튜플 (interface로 불가)
type Coordinate = [number, number];
type ApiResponse = [boolean, string | null];

let userId: ID = "user_123";
let status: Status = "active";
let point: Coordinate = [10, 20];
let response: ApiResponse = [true, "성공"];

console.log(\`ID: \${userId}\`);
console.log(\`상태: \${status}\`);
console.log(\`좌표: (\${point[0]}, \${point[1]})\`);
console.log(\`응답: 성공=\${response[0]}, 메시지=\${response[1]}\`);`,
        expected_output: `ID: user_123
상태: active
좌표: (10, 20)
응답: 성공=true, 메시지=성공`,
      },
      {
        title: '실제 사용 예시',
        code: `// interface: 객체 형태
interface User {
    id: number;
    name: string;
    email: string;
}

// type: 유니온, 유틸리티
type UserRole = "admin" | "user" | "guest";
type UserWithRole = User & { role: UserRole };

const admin: UserWithRole = {
    id: 1,
    name: "관리자",
    email: "admin@mail.com",
    role: "admin"
};

console.log(\`\${admin.name} (\${admin.role})\`);`,
        expected_output: `관리자 (admin)`,
      },
    ],
    keywords: ['interface', 'type', '차이', '선택', '병합'],
  },

  'ts-intro-union-basic': {
    name: '유니온 기본',
    description: 'string | number',
    content: `# 유니온 타입

## 여러 타입 중 하나

유니온 타입은 **여러 타입 중 하나**를 가질 수 있습니다.

\`\`\`typescript
type ID = string | number;

let id1: ID = 123;
let id2: ID = "abc123";
\`\`\`

## 사용 시 주의

유니온 타입을 사용할 때는 **공통 멤버**만 접근 가능합니다.

\`\`\`typescript
function printId(id: string | number): void {
    // console.log(id.toUpperCase());  // 오류! number에는 없음
    console.log(id.toString());  // OK, 둘 다 있음
}
\`\`\`

## 타입 좁히기

조건문으로 타입을 좁힐 수 있습니다.

\`\`\`typescript
function printId(id: string | number): void {
    if (typeof id === "string") {
        console.log(id.toUpperCase());  // string 확정
    } else {
        console.log(id.toFixed(2));  // number 확정
    }
}
\`\`\`

## 리터럴 유니온

\`\`\`typescript
type Direction = "up" | "down" | "left" | "right";
type Status = "pending" | "approved" | "rejected";

function move(direction: Direction): void {
    console.log(\`Moving \${direction}\`);
}

move("up");     // OK
// move("diagonal");  // 오류!
\`\`\``,
    runnable_examples: [
      {
        title: '유니온 기본',
        code: `type ID = string | number;

function printId(id: ID): void {
    console.log(\`ID: \${id} (타입: \${typeof id})\`);
}

printId(123);
printId("abc123");
printId(999);
printId("user_456");`,
        expected_output: `ID: 123 (타입: number)
ID: abc123 (타입: string)
ID: 999 (타입: number)
ID: user_456 (타입: string)`,
      },
      {
        title: '타입 좁히기',
        code: `function formatValue(value: string | number | boolean): string {
    if (typeof value === "string") {
        return \`문자열: "\${value}"\`;
    } else if (typeof value === "number") {
        return \`숫자: \${value.toFixed(2)}\`;
    } else {
        return \`불리언: \${value ? "참" : "거짓"}\`;
    }
}

console.log(formatValue("hello"));
console.log(formatValue(3.14159));
console.log(formatValue(true));`,
        expected_output: `문자열: "hello"
숫자: 3.14
불리언: 참`,
      },
      {
        title: '리터럴 유니온',
        code: `type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Status = "pending" | "success" | "error";

function request(method: HttpMethod, url: string): Status {
    console.log(\`\${method} \${url}\`);
    return "success";
}

const result1 = request("GET", "/api/users");
const result2 = request("POST", "/api/data");

console.log(\`결과: \${result1}\`);`,
        expected_output: `GET /api/users
POST /api/data
결과: success`,
      },
    ],
    keywords: ['유니온', 'union', '|', '타입좁히기', '리터럴'],
  },

  'ts-intro-narrowing': {
    name: '타입 좁히기',
    description: 'typeof로 타입 확인',
    content: `# 타입 좁히기 (Narrowing)

## 조건으로 타입 확정

유니온 타입을 사용할 때, 조건문으로 타입을 좁힐 수 있습니다.

## typeof 가드

\`\`\`typescript
function print(value: string | number): void {
    if (typeof value === "string") {
        // 여기서 value는 string
        console.log(value.toUpperCase());
    } else {
        // 여기서 value는 number
        console.log(value.toFixed(2));
    }
}
\`\`\`

## 진위 검사 (Truthiness)

\`\`\`typescript
function printName(name: string | null | undefined): void {
    if (name) {
        // name이 truthy면 string
        console.log(name.toUpperCase());
    } else {
        console.log("이름 없음");
    }
}
\`\`\`

## 등호 검사

\`\`\`typescript
function compare(a: string | number, b: string | number): void {
    if (a === b) {
        // 둘 다 같은 타입이고 같은 값
    }
    if (typeof a === "string" && typeof b === "string") {
        // 둘 다 string
    }
}
\`\`\`

## in 연산자

\`\`\`typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird): void {
    if ("swim" in animal) {
        animal.swim();
    } else {
        animal.fly();
    }
}
\`\`\``,
    runnable_examples: [
      {
        title: 'typeof 가드',
        code: `function process(value: string | number | boolean): string {
    if (typeof value === "string") {
        return \`문자열: \${value.toUpperCase()}\`;
    }
    if (typeof value === "number") {
        return \`숫자: \${value * 2}\`;
    }
    // value는 boolean
    return \`불리언: \${value ? "참" : "거짓"}\`;
}

console.log(process("hello"));
console.log(process(21));
console.log(process(false));`,
        expected_output: `문자열: HELLO
숫자: 42
불리언: 거짓`,
      },
      {
        title: 'null/undefined 체크',
        code: `function greet(name: string | null | undefined): string {
    // truthy 검사
    if (name) {
        return \`안녕하세요, \${name}님!\`;
    }
    return "안녕하세요, 손님!";
}

console.log(greet("철수"));
console.log(greet(null));
console.log(greet(undefined));
console.log(greet(""));  // 빈 문자열도 falsy`,
        expected_output: `안녕하세요, 철수님!
안녕하세요, 손님!
안녕하세요, 손님!
안녕하세요, 손님!`,
      },
      {
        title: 'in 연산자',
        code: `type Car = { drive: () => void; wheels: number };
type Boat = { sail: () => void; propeller: boolean };

function move(vehicle: Car | Boat): void {
    if ("drive" in vehicle) {
        console.log(\`자동차: \${vehicle.wheels}개의 바퀴로 달립니다\`);
        vehicle.drive();
    } else {
        console.log(\`보트: 항해합니다\`);
        vehicle.sail();
    }
}

const car: Car = {
    wheels: 4,
    drive() { console.log("부릉부릉"); }
};

const boat: Boat = {
    propeller: true,
    sail() { console.log("출항!"); }
};

move(car);
move(boat);`,
        expected_output: `자동차: 4개의 바퀴로 달립니다
부릉부릉
보트: 항해합니다
출항!`,
      },
    ],
    keywords: ['narrowing', '타입좁히기', 'typeof', 'in', '가드'],
  },

  'ts-intro-literal-basic': {
    name: '리터럴 타입 기본',
    description: '"left" | "right" | "center"',
    content: `# 리터럴 타입

## 특정 값만 허용

리터럴 타입은 **정확한 값**을 타입으로 사용합니다.

\`\`\`typescript
let direction: "left" | "right" | "center" = "left";
direction = "center";  // OK
// direction = "up";   // 오류!
\`\`\`

## 문자열 리터럴

\`\`\`typescript
type Direction = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Size = "small" | "medium" | "large";

function move(direction: Direction): void {
    console.log(\`Moving \${direction}\`);
}

move("up");     // OK
// move("diagonal");  // 오류!
\`\`\`

## 숫자 리터럴

\`\`\`typescript
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatus = 200 | 404 | 500;

function rollDice(): DiceValue {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}
\`\`\`

## 불리언 리터럴

\`\`\`typescript
type Success = true;
type Failure = false;
type Result = Success | Failure;

function check(): Result {
    return Math.random() > 0.5;
}
\`\`\`

## 리터럴 타입의 장점

1. **타입 안전성**: 오타 방지
2. **자동 완성**: 에디터가 가능한 값 제안
3. **문서화**: 코드만 봐도 가능한 값 파악`,
    runnable_examples: [
      {
        title: '문자열 리터럴',
        code: `type TextAlign = "left" | "center" | "right";

function alignText(text: string, align: TextAlign): string {
    const width = 20;
    switch (align) {
        case "left":
            return text.padEnd(width);
        case "right":
            return text.padStart(width);
        case "center":
            const padding = Math.floor((width - text.length) / 2);
            return text.padStart(text.length + padding).padEnd(width);
    }
}

console.log(\`|\${alignText("Hello", "left")}|\`);
console.log(\`|\${alignText("Hello", "center")}|\`);
console.log(\`|\${alignText("Hello", "right")}|\`);`,
        expected_output: `|Hello               |
|       Hello        |
|               Hello|`,
      },
      {
        title: '숫자 리터럴',
        code: `type HttpStatus = 200 | 201 | 400 | 404 | 500;

function getStatusMessage(status: HttpStatus): string {
    switch (status) {
        case 200: return "OK";
        case 201: return "Created";
        case 400: return "Bad Request";
        case 404: return "Not Found";
        case 500: return "Internal Server Error";
    }
}

const codes: HttpStatus[] = [200, 404, 500];
for (const code of codes) {
    console.log(\`\${code}: \${getStatusMessage(code)}\`);
}`,
        expected_output: `200: OK
404: Not Found
500: Internal Server Error`,
      },
      {
        title: '실용 예제: 버튼 스타일',
        code: `type ButtonSize = "small" | "medium" | "large";
type ButtonVariant = "primary" | "secondary" | "danger";

interface Button {
    text: string;
    size: ButtonSize;
    variant: ButtonVariant;
}

function renderButton(btn: Button): string {
    return \`<button class="\${btn.size} \${btn.variant}">\${btn.text}</button>\`;
}

const saveBtn: Button = {
    text: "저장",
    size: "large",
    variant: "primary"
};

const cancelBtn: Button = {
    text: "취소",
    size: "medium",
    variant: "secondary"
};

console.log(renderButton(saveBtn));
console.log(renderButton(cancelBtn));`,
        expected_output: `<button class="large primary">저장</button>
<button class="medium secondary">취소</button>`,
      },
    ],
    keywords: ['리터럴', 'literal', '문자열', '숫자', '값타입'],
  },

  'ts-intro-const-assertion': {
    name: 'as const',
    description: '리터럴 타입으로 고정',
    content: `# as const

## 값을 리터럴 타입으로 고정

\`as const\`는 값을 **가장 좁은 리터럴 타입**으로 만듭니다.

\`\`\`typescript
// 일반 선언
const direction = "left";  // 타입: "left" (const라서 이미 좁음)
let direction2 = "left";   // 타입: string

// as const
let direction3 = "left" as const;  // 타입: "left"
\`\`\`

## 객체에 as const

\`\`\`typescript
// 일반 객체
const config = {
    host: "localhost",
    port: 3000
};
// 타입: { host: string; port: number }

// as const
const config2 = {
    host: "localhost",
    port: 3000
} as const;
// 타입: { readonly host: "localhost"; readonly port: 3000 }
\`\`\`

## 배열에 as const

\`\`\`typescript
// 일반 배열
const colors = ["red", "green", "blue"];
// 타입: string[]

// as const
const colors2 = ["red", "green", "blue"] as const;
// 타입: readonly ["red", "green", "blue"]
\`\`\`

## 활용: 상수 객체

\`\`\`typescript
const HttpStatus = {
    OK: 200,
    NOT_FOUND: 404,
    ERROR: 500
} as const;

type StatusCode = typeof HttpStatus[keyof typeof HttpStatus];
// 타입: 200 | 404 | 500
\`\`\``,
    runnable_examples: [
      {
        title: 'as const 기본',
        code: `// 일반 let: string 타입
let normalLet = "hello";

// as const: "hello" 리터럴 타입
let withAsConst = "hello" as const;

console.log("normalLet:", normalLet);
console.log("withAsConst:", withAsConst);

// normalLet은 다른 string 할당 가능
normalLet = "world";

// withAsConst는 오직 "hello"만 가능
// withAsConst = "world";  // Error!

console.log("변경 후 normalLet:", normalLet);`,
        expected_output: `normalLet: hello
withAsConst: hello
변경 후 normalLet: world`,
      },
      {
        title: '객체에 as const',
        code: `// 일반 객체: 속성 타입이 넓음
const normal = {
    name: "Kim",
    age: 25
};
// 타입: { name: string; age: number }

// as const: 리터럴 + readonly
const frozen = {
    name: "Kim",
    age: 25
} as const;
// 타입: { readonly name: "Kim"; readonly age: 25 }

console.log("normal:", normal);
console.log("frozen:", frozen);

// normal은 수정 가능
normal.name = "Lee";

// frozen은 수정 불가
// frozen.name = "Lee";  // Error!

console.log("변경 후 normal:", normal);`,
        expected_output: `normal: { name: 'Kim', age: 25 }
frozen: { name: 'Kim', age: 25 }
변경 후 normal: { name: 'Lee', age: 25 }`,
      },
      {
        title: '상수 enum 패턴',
        code: `// enum 대신 as const 사용
const Direction = {
    Up: "UP",
    Down: "DOWN",
    Left: "LEFT",
    Right: "RIGHT"
} as const;

// 타입 추출
type DirectionType = typeof Direction[keyof typeof Direction];

function move(direction: DirectionType): void {
    console.log(\`Moving: \${direction}\`);
}

move(Direction.Up);
move(Direction.Left);
// move("DIAGONAL");  // Error!`,
        expected_output: `Moving: UP
Moving: LEFT`,
      },
    ],
    keywords: ['as const', '리터럴', 'readonly', '고정', '상수'],
  },
};
