/**
 * JavaScript 입문 (beginner_zero) 개념 콘텐츠
 * 대상: 프로그래밍을 처음 접하는 완전 초보자
 * 특징: 비유와 일상 예시 활용, 상세한 설명, 풍부한 예제
 */

export const JS_BEGINNER_ZERO_CONCEPTS = {
  'js-intro-what-is-programming': {
    name: '프로그래밍이란',
    description: '컴퓨터에게 명령 내리기, 순서대로 실행되는 원리',
    content: `# 프로그래밍이란?

## 컴퓨터에게 말하는 방법

프로그래밍은 **컴퓨터에게 일을 시키는 방법**입니다.

우리가 친구에게 "물 좀 가져다줘"라고 말하듯이,
컴퓨터에게도 "이 숫자들을 더해줘"라고 말할 수 있습니다.

다만, 컴퓨터는 한국어를 이해하지 못하기 때문에
**프로그래밍 언어**라는 특별한 언어를 사용합니다.

## 왜 프로그래밍을 배울까?

- 반복적인 일을 컴퓨터가 대신해줍니다
- 웹사이트, 앱, 게임을 만들 수 있습니다
- 문제 해결 능력이 좋아집니다

## JavaScript 소개

JavaScript는 가장 인기 있는 프로그래밍 언어 중 하나입니다.

- 웹 브라우저에서 바로 실행됩니다
- 배우기 쉽습니다
- 웹사이트, 앱, 서버까지 다양하게 사용됩니다

## 코드는 순서대로 실행됩니다

컴퓨터는 위에서 아래로, 한 줄씩 차례대로 읽고 실행합니다.
마치 요리 레시피를 순서대로 따라하는 것과 같습니다.

\`\`\`javascript
// 이 코드는 위에서 아래로 순서대로 실행됩니다
console.log("1번: 안녕하세요");
console.log("2번: 반갑습니다");
console.log("3번: 프로그래밍 세계에 오신 것을 환영합니다");
\`\`\`

## 주석이란?

\`//\` 뒤에 쓴 글자는 컴퓨터가 무시합니다.
사람이 읽기 위한 메모입니다.

\`\`\`javascript
// 이것은 주석입니다. 컴퓨터는 이 줄을 무시합니다.
console.log("이 줄만 실행됩니다");
\`\`\`

## 정리

- 프로그래밍: 컴퓨터에게 일을 시키는 것
- JavaScript: 웹에서 사용하는 인기 있는 언어
- 코드는 위에서 아래로 순서대로 실행됨
- \`//\` 주석: 사람을 위한 메모`,
    runnable_examples: [
      {
        title: '순서대로 실행되는 코드',
        code: `// 첫 번째 줄부터 실행됩니다
console.log("1. 시작합니다");
console.log("2. 중간입니다");
console.log("3. 끝입니다");`,
        expected_output: `1. 시작합니다
2. 중간입니다
3. 끝입니다`,
      },
      {
        title: '주석 사용하기',
        code: `// 아래 줄은 인사말을 출력합니다
console.log("안녕하세요!");

// 이 줄은 실행되지 않습니다
// console.log("이건 주석이라 안 나와요");

console.log("반갑습니다!");`,
        expected_output: `안녕하세요!
반갑습니다!`,
      },
    ],
    keywords: ['프로그래밍', '코드', 'JavaScript', '순서', '실행', '주석'],
  },

  'js-intro-console': {
    name: '콘솔 출력',
    description: 'console.log로 첫 코드 실행하기',
    content: `# 콘솔 출력 - console.log

## 화면에 글자 보여주기

\`console.log()\`는 괄호 안의 내용을 화면에 보여주는 명령입니다.
프로그래밍에서 가장 먼저 배우는, 가장 많이 쓰는 명령입니다.

## 기본 사용법

\`\`\`javascript
console.log("안녕하세요");
\`\`\`

이 코드를 실행하면 화면에 "안녕하세요"가 나타납니다.

## 문자열은 따옴표로 감싸기

글자를 출력할 때는 반드시 따옴표로 감싸야 합니다.

\`\`\`javascript
console.log("큰따옴표 사용");    // 정상 작동
console.log('작은따옴표 사용');  // 정상 작동
console.log(\`백틱 사용\`);       // 정상 작동
\`\`\`

세 가지 모두 같은 결과를 보여줍니다.

## 숫자는 따옴표 없이

숫자는 따옴표 없이 그대로 씁니다.

\`\`\`javascript
console.log(123);    // 숫자 123
console.log(3.14);   // 소수점도 가능
console.log(-50);    // 음수도 가능
\`\`\`

## 따옴표 유무의 차이

\`\`\`javascript
console.log(100);    // 숫자 100
console.log("100");  // 문자 "100"

console.log(1 + 1);    // 2 (계산됨)
console.log("1 + 1");  // "1 + 1" (그대로 출력)
\`\`\`

## 여러 줄 출력하기

console.log를 여러 번 쓰면 여러 줄이 출력됩니다.

\`\`\`javascript
console.log("첫 번째 줄");
console.log("두 번째 줄");
console.log("세 번째 줄");
\`\`\`

## 여러 값 한 번에 출력하기

쉼표로 구분하여 여러 값을 한 줄에 출력할 수 있습니다.

\`\`\`javascript
console.log("이름:", "철수");
console.log("나이:", 25, "살");
\`\`\`

## 정리

- \`console.log()\`: 화면에 출력하는 명령
- 문자는 따옴표로 감싸기 (\`" "\` 또는 \`' '\`)
- 숫자는 따옴표 없이
- 쉼표로 여러 값 출력 가능`,
    runnable_examples: [
      {
        title: '기본 출력',
        code: `console.log("Hello, JavaScript!");
console.log("프로그래밍 첫걸음!");`,
        expected_output: `Hello, JavaScript!
프로그래밍 첫걸음!`,
      },
      {
        title: '숫자와 문자 출력',
        code: `// 숫자 출력
console.log(42);
console.log(3.14159);

// 문자열 출력
console.log("이것은 문자입니다");`,
        expected_output: `42
3.14159
이것은 문자입니다`,
      },
      {
        title: '계산 결과 출력',
        code: `console.log(10 + 5);
console.log(100 - 30);
console.log(7 * 8);
console.log(20 / 4);`,
        expected_output: `15
70
56
5`,
      },
      {
        title: '여러 값 함께 출력',
        code: `console.log("1 + 2 =", 1 + 2);
console.log("이름:", "홍길동", "나이:", 30);`,
        expected_output: `1 + 2 = 3
이름: 홍길동 나이: 30`,
      },
    ],
    keywords: ['console.log', '출력', '콘솔', '문자열', '숫자', '따옴표'],
  },

  'js-intro-var-what': {
    name: '변수란?',
    description: '상자에 물건 담기 비유, 변수의 개념',
    content: `# 변수란?

## 데이터를 저장하는 상자

변수는 **데이터를 저장하는 상자**라고 생각하면 됩니다.

물건을 상자에 넣고 이름표를 붙이듯이,
데이터를 저장하고 이름을 붙여서 나중에 사용합니다.

## 변수 만들기

\`\`\`javascript
let 상자이름 = 저장할값;
\`\`\`

- \`let\`: "변수를 만들겠다"는 선언
- \`상자이름\`: 변수의 이름 (나중에 이 이름으로 찾음)
- \`=\`: "저장한다"는 의미 (수학의 "같다"와 다름!)
- \`저장할값\`: 상자에 넣을 데이터

## 실제 예시

\`\`\`javascript
let name = "김철수";
let age = 25;
let height = 175.5;
\`\`\`

이제 \`name\`이라는 상자에 "김철수"가,
\`age\`라는 상자에 25가,
\`height\`라는 상자에 175.5가 들어있습니다.

## 변수 사용하기

저장한 값은 변수 이름만으로 사용할 수 있습니다.

\`\`\`javascript
let message = "안녕하세요";
console.log(message);  // "안녕하세요" 출력
\`\`\`

## 변수 값 바꾸기

상자 안의 물건을 바꾸듯이, 변수의 값도 바꿀 수 있습니다.

\`\`\`javascript
let score = 80;
console.log(score);  // 80

score = 95;          // 새로운 값으로 변경
console.log(score);  // 95
\`\`\`

## 변수 이름 짓는 규칙

1. 영문자, 숫자, 밑줄(_), 달러($) 사용 가능
2. 숫자로 시작할 수 없음
3. 예약어(let, if 등) 사용 불가
4. 대소문자 구분 (name과 Name은 다름)

\`\`\`javascript
// 좋은 예
let userName = "홍길동";
let age2024 = 30;
let _private = "비밀";

// 나쁜 예 (오류 발생)
// let 2name = "이름";     // 숫자로 시작
// let let = "값";         // 예약어 사용
\`\`\`

## 좋은 변수 이름

변수 이름만 보고 무슨 데이터인지 알 수 있어야 합니다.

\`\`\`javascript
// 좋은 예 - 의미가 명확함
let studentName = "박영희";
let totalPrice = 15000;

// 나쁜 예 - 의미를 알 수 없음
let a = "박영희";
let x = 15000;
\`\`\`

## 정리

- 변수: 데이터를 저장하는 이름 붙은 상자
- \`let 이름 = 값\`으로 변수 생성
- 변수 이름으로 값 사용 가능
- 값 변경: 변수에 새 값 할당`,
    runnable_examples: [
      {
        title: '변수 만들고 사용하기',
        code: `// 변수 만들기
let name = "김민수";
let age = 20;

// 변수 사용하기
console.log("이름:", name);
console.log("나이:", age);`,
        expected_output: `이름: 김민수
나이: 20`,
      },
      {
        title: '변수로 계산하기',
        code: `let price = 1000;
let quantity = 5;
let total = price * quantity;

console.log("개당 가격:", price);
console.log("수량:", quantity);
console.log("총액:", total);`,
        expected_output: `개당 가격: 1000
수량: 5
총액: 5000`,
      },
      {
        title: '변수 값 변경하기',
        code: `let count = 1;
console.log("처음:", count);

count = 2;
console.log("변경 후:", count);

count = count + 1;  // 기존 값에 1 더하기
console.log("1 더한 후:", count);`,
        expected_output: `처음: 1
변경 후: 2
1 더한 후: 3`,
      },
    ],
    keywords: ['변수', 'let', '저장', '값', '할당', '이름'],
  },

  'js-intro-let-const': {
    name: 'let vs const',
    description: '바꿀 수 있는 것 vs 없는 것',
    content: `# let vs const

## 두 가지 변수 선언 방법

JavaScript에서 변수를 만드는 두 가지 주요 방법이 있습니다.

| 키워드 | 특징 | 용도 |
|--------|------|------|
| let | 값을 바꿀 수 있음 | 변하는 값 |
| const | 값을 바꿀 수 없음 | 고정된 값 |

## let - 변경 가능한 변수

\`let\`으로 만든 변수는 나중에 값을 바꿀 수 있습니다.

\`\`\`javascript
let score = 80;
console.log(score);  // 80

score = 95;  // 값 변경 가능!
console.log(score);  // 95
\`\`\`

## const - 변경 불가능한 상수

\`const\`로 만든 상수는 한 번 정하면 바꿀 수 없습니다.
"상수(constant)"라고 부릅니다.

\`\`\`javascript
const PI = 3.14159;
console.log(PI);  // 3.14159

// PI = 3.14;  // 오류 발생! 값을 바꿀 수 없습니다.
\`\`\`

## 언제 let을 쓸까?

값이 바뀌어야 하는 경우에 사용합니다.

\`\`\`javascript
// 점수는 변할 수 있음
let currentScore = 0;
currentScore = currentScore + 10;

// 반복에서 사용하는 변수
let count = 0;
count = count + 1;

// 사용자 입력에 따라 변하는 값
let userName = "";
userName = "홍길동";
\`\`\`

## 언제 const를 쓸까?

값이 바뀌면 안 되는 경우에 사용합니다.

\`\`\`javascript
// 수학 상수
const PI = 3.14159;
const E = 2.71828;

// 설정값
const MAX_USERS = 100;
const API_URL = "https://api.example.com";

// 변하지 않는 정보
const BIRTH_YEAR = 1990;
const COMPANY_NAME = "ABC회사";
\`\`\`

## 기본적으로 const를 사용하세요

프로그래머들 사이에서 권장하는 방법:

1. **일단 const로 선언**
2. **값을 바꿔야 할 때만 let으로 변경**

이렇게 하면 실수로 값을 바꾸는 것을 방지할 수 있습니다.

## var는 쓰지 마세요

예전 방식인 \`var\`도 있지만, 여러 문제가 있어서 지금은 사용하지 않습니다.

\`\`\`javascript
// 옛날 방식 - 사용하지 마세요
var oldWay = "사용하지 마세요";

// 현대 방식 - 이것을 사용하세요
let modernLet = "let 사용";
const modernConst = "const 사용";
\`\`\`

## 정리

- \`let\`: 값을 바꿀 수 있는 변수
- \`const\`: 값을 바꿀 수 없는 상수
- 기본적으로 const 사용, 필요할 때만 let
- var는 사용하지 않기`,
    runnable_examples: [
      {
        title: 'let으로 값 변경하기',
        code: `let temperature = 20;
console.log("현재 온도:", temperature);

temperature = 25;
console.log("변경된 온도:", temperature);

temperature = temperature + 5;
console.log("5도 상승:", temperature);`,
        expected_output: `현재 온도: 20
변경된 온도: 25
5도 상승: 30`,
      },
      {
        title: 'const로 상수 만들기',
        code: `const SITE_NAME = "CodeBuddy";
const MAX_RETRY = 3;
const TAX_RATE = 0.1;

console.log("사이트:", SITE_NAME);
console.log("최대 재시도:", MAX_RETRY);
console.log("세율:", TAX_RATE);

// const SITE_NAME = "Other";  // 오류! 변경 불가`,
        expected_output: `사이트: CodeBuddy
최대 재시도: 3
세율: 0.1`,
      },
      {
        title: 'let과 const 함께 사용',
        code: `const PRICE = 1000;  // 가격은 고정
let quantity = 1;    // 수량은 변함

console.log("수량 1:", PRICE * quantity);

quantity = 3;
console.log("수량 3:", PRICE * quantity);

quantity = 5;
console.log("수량 5:", PRICE * quantity);`,
        expected_output: `수량 1: 1000
수량 3: 3000
수량 5: 5000`,
      },
    ],
    keywords: ['let', 'const', '변수', '상수', '선언', 'var'],
  },

  'js-intro-number-string': {
    name: '숫자와 문자열',
    description: '1 + 1 = 2, "안녕" + "하세요" = "안녕하세요"',
    content: `# 숫자와 문자열

## 데이터에는 종류가 있습니다

프로그래밍에서 가장 기본적인 두 가지 데이터 종류입니다.

- **숫자(Number)**: 1, 2, 3.14, -50 등
- **문자열(String)**: "안녕", "Hello", "123" 등

## 숫자 (Number)

숫자는 **따옴표 없이** 그대로 씁니다.
사칙연산이 가능합니다.

\`\`\`javascript
// 정수
let count = 10;
let negative = -5;

// 소수
let price = 19.99;
let pi = 3.14159;
\`\`\`

### 숫자 연산

\`\`\`javascript
let a = 10;
let b = 3;

console.log(a + b);  // 13 (더하기)
console.log(a - b);  // 7  (빼기)
console.log(a * b);  // 30 (곱하기)
console.log(a / b);  // 3.333... (나누기)
console.log(a % b);  // 1  (나머지)
\`\`\`

## 문자열 (String)

문자열은 **반드시 따옴표로 감싸야** 합니다.

\`\`\`javascript
let greeting = "안녕하세요";
let name = '홍길동';
let sentence = \`오늘 날씨가 좋습니다\`;
\`\`\`

### 문자열 연결 (+ 연산자)

문자열끼리는 \`+\`로 이어붙일 수 있습니다.

\`\`\`javascript
let first = "안녕";
let second = "하세요";
let result = first + second;
console.log(result);  // "안녕하세요"
\`\`\`

### 문자열과 변수 조합

\`\`\`javascript
let name = "철수";
console.log("안녕, " + name + "!");  // "안녕, 철수!"
\`\`\`

## 숫자 vs 문자열 "123"

겉보기에 같아 보여도 다릅니다!

\`\`\`javascript
console.log(100 + 200);      // 300 (숫자 덧셈)
console.log("100" + "200");  // "100200" (문자열 연결)
\`\`\`

## 템플릿 리터럴 (백틱)

백틱(\`)을 사용하면 변수를 쉽게 넣을 수 있습니다.

\`\`\`javascript
let name = "영희";
let age = 20;

// + 연산자 방식 (복잡함)
console.log("이름: " + name + ", 나이: " + age + "살");

// 템플릿 리터럴 방식 (간편함)
console.log(\`이름: \${name}, 나이: \${age}살\`);
\`\`\`

\`\${}\` 안에 변수나 계산식을 넣으면 자동으로 값이 들어갑니다.

## 정리

- 숫자: 따옴표 없이, 계산 가능
- 문자열: 따옴표로 감싸기
- 문자열 연결: \`+\` 사용
- 템플릿 리터럴: \`\${변수}\`로 편하게 조합
- "123"(문자)과 123(숫자)은 다름`,
    runnable_examples: [
      {
        title: '숫자 연산',
        code: `let x = 15;
let y = 4;

console.log("더하기:", x + y);
console.log("빼기:", x - y);
console.log("곱하기:", x * y);
console.log("나누기:", x / y);
console.log("나머지:", x % y);`,
        expected_output: `더하기: 19
빼기: 11
곱하기: 60
나누기: 3.75
나머지: 3`,
      },
      {
        title: '문자열 연결',
        code: `let lastName = "김";
let firstName = "철수";
let fullName = lastName + firstName;

console.log(fullName);
console.log("안녕하세요, " + fullName + "님!");`,
        expected_output: `김철수
안녕하세요, 김철수님!`,
      },
      {
        title: '템플릿 리터럴 사용',
        code: `let item = "커피";
let price = 4500;
let quantity = 3;
let total = price * quantity;

console.log(\`\${item} \${quantity}잔 = \${total}원\`);
console.log(\`개당 \${price}원입니다.\`);`,
        expected_output: `커피 3잔 = 13500원
개당 4500원입니다.`,
      },
      {
        title: '숫자 vs 문자열',
        code: `// 숫자 더하기
console.log(10 + 20);

// 문자열 연결
console.log("10" + "20");

// 혼합 (문자열로 변환됨)
console.log("결과: " + 10 + 20);
console.log("결과: " + (10 + 20));`,
        expected_output: `30
1020
결과: 1020
결과: 30`,
      },
    ],
    keywords: ['숫자', '문자열', 'Number', 'String', '연산', '템플릿'],
  },

  'js-intro-boolean': {
    name: '불리언',
    description: '참/거짓, true/false',
    content: `# 불리언 (Boolean)

## 참 또는 거짓, 두 가지 중 하나

불리언은 딱 두 가지 값만 있는 특별한 자료형입니다.

- \`true\`: 참, 맞음, 예
- \`false\`: 거짓, 틀림, 아니오

이름은 영국 수학자 조지 불(George Boole)에서 왔습니다.

## 불리언 변수 만들기

\`\`\`javascript
let isStudent = true;    // 학생인가? 네
let isMarried = false;   // 결혼했나? 아니오
let hasLicense = true;   // 면허가 있나? 네
\`\`\`

## 비교의 결과는 불리언

두 값을 비교하면 true 또는 false가 나옵니다.

\`\`\`javascript
console.log(5 > 3);   // true (5가 3보다 큼)
console.log(5 < 3);   // false (5가 3보다 작지 않음)
console.log(5 === 5); // true (같음)
console.log(5 === 3); // false (다름)
console.log(5 !== 3); // true (5는 3이 아님)
\`\`\`

## 비교 연산자 종류

| 연산자 | 의미 | 예시 |
|--------|------|------|
| > | 크다 | 5 > 3 은 true |
| < | 작다 | 5 < 3 은 false |
| >= | 크거나 같다 | 5 >= 5 는 true |
| <= | 작거나 같다 | 5 <= 3 은 false |
| === | 같다 | 5 === 5 는 true |
| !== | 같지 않다 | 5 !== 3 은 true |

## 조건문에서 사용

불리언은 "만약 ~라면"을 표현할 때 사용됩니다.

\`\`\`javascript
let age = 20;

if (age >= 18) {
  console.log("성인입니다");
}

let isRaining = true;

if (isRaining) {
  console.log("우산을 챙기세요");
}
\`\`\`

## 불리언 변환

JavaScript에서는 다른 값도 불리언처럼 판단됩니다.

### false로 판단되는 값 (Falsy)

\`\`\`javascript
console.log(Boolean(0));         // false
console.log(Boolean(""));        // false (빈 문자열)
console.log(Boolean(null));      // false
console.log(Boolean(undefined)); // false
\`\`\`

### true로 판단되는 값 (Truthy)

\`\`\`javascript
console.log(Boolean(1));         // true
console.log(Boolean("안녕"));    // true
console.log(Boolean(100));       // true
console.log(Boolean("0"));       // true (문자열 "0")
\`\`\`

## 정리

- 불리언: true(참) 또는 false(거짓) 두 가지만 존재
- 비교 연산 결과는 불리언
- 조건문에서 참/거짓 판단에 사용
- 0, "", null, undefined는 false로 취급`,
    runnable_examples: [
      {
        title: '불리언 기본',
        code: `let isHappy = true;
let isSad = false;
let isActive = true;

console.log("행복:", isHappy);
console.log("슬픔:", isSad);
console.log("활성화:", isActive);`,
        expected_output: `행복: true
슬픔: false
활성화: true`,
      },
      {
        title: '비교 연산 결과',
        code: `let a = 10;
let b = 5;

console.log("a > b:", a > b);
console.log("a < b:", a < b);
console.log("a === b:", a === b);
console.log("a !== b:", a !== b);
console.log("a >= 10:", a >= 10);`,
        expected_output: `a > b: true
a < b: false
a === b: false
a !== b: true
a >= 10: true`,
      },
      {
        title: '조건 확인하기',
        code: `let score = 85;
let isPassing = score >= 60;
let isExcellent = score >= 90;

console.log("점수:", score);
console.log("합격:", isPassing);
console.log("우수:", isExcellent);`,
        expected_output: `점수: 85
합격: true
우수: false`,
      },
      {
        title: '문자열 비교',
        code: `let password = "secret123";
let input = "secret123";

console.log("비밀번호 일치:", password === input);

let wrong = "wrong";
console.log("틀린 비밀번호:", password === wrong);`,
        expected_output: `비밀번호 일치: true
틀린 비밀번호: false`,
      },
    ],
    keywords: ['불리언', 'Boolean', 'true', 'false', '참', '거짓', '비교'],
  },

  'js-intro-if': {
    name: 'if문 기본',
    description: '만약 ~라면',
    content: `# if문 기본

## 조건에 따라 실행하기

if문은 **"만약 ~라면 ~해라"**를 표현합니다.
조건이 참(true)일 때만 코드가 실행됩니다.

## 일상생활의 예

- 만약 비가 오면, 우산을 챙긴다
- 만약 배가 고프면, 밥을 먹는다
- 만약 18살 이상이면, 영화를 볼 수 있다

## 기본 구조

\`\`\`javascript
if (조건) {
  // 조건이 참이면 이 코드 실행
}
\`\`\`

## 간단한 예시

\`\`\`javascript
let age = 20;

if (age >= 18) {
  console.log("성인입니다");
}
\`\`\`

age가 18 이상이므로 조건이 true가 되어 "성인입니다"가 출력됩니다.

## 조건이 거짓이면?

조건이 false이면 중괄호 안의 코드는 **실행되지 않고 건너뜁니다**.

\`\`\`javascript
let age = 15;

if (age >= 18) {
  console.log("성인입니다");  // 실행 안 됨!
}
console.log("프로그램 계속 진행");  // 이건 실행됨
\`\`\`

## 여러 조건 검사하기

조건 여러 개를 검사할 수 있습니다.

\`\`\`javascript
let score = 85;

if (score >= 90) {
  console.log("A등급");
}

if (score >= 80) {
  console.log("80점 이상");
}

if (score >= 70) {
  console.log("70점 이상");
}
\`\`\`

위 코드는 조건이 맞는 모든 if문이 실행됩니다.
(80점 이상, 70점 이상 둘 다 출력)

## 조건에 변수 사용하기

불리언 변수를 직접 조건으로 사용할 수 있습니다.

\`\`\`javascript
let isLoggedIn = true;

if (isLoggedIn) {
  console.log("환영합니다!");
}

let isAdmin = false;

if (isAdmin) {
  console.log("관리자 페이지");  // 실행 안 됨
}
\`\`\`

## 정리

- if문: "만약 ~라면" 조건 실행
- \`if (조건) { 코드 }\`
- 조건이 true면 코드 실행
- 조건이 false면 건너뜀
- 여러 개의 독립적인 if문 가능`,
    runnable_examples: [
      {
        title: '기본 if문',
        code: `let temperature = 35;

if (temperature >= 30) {
  console.log("오늘은 덥습니다!");
}

console.log("날씨 확인 완료");`,
        expected_output: `오늘은 덥습니다!
날씨 확인 완료`,
      },
      {
        title: '조건이 거짓인 경우',
        code: `let money = 5000;

if (money >= 10000) {
  console.log("택시를 탈 수 있습니다");
}

console.log("현재 잔액:", money, "원");`,
        expected_output: `현재 잔액: 5000 원`,
      },
      {
        title: '여러 조건 검사',
        code: `let age = 16;

if (age >= 18) {
  console.log("성인입니다");
}

if (age >= 14) {
  console.log("중학생 이상입니다");
}

if (age >= 7) {
  console.log("학교에 다닐 수 있습니다");
}`,
        expected_output: `중학생 이상입니다
학교에 다닐 수 있습니다`,
      },
      {
        title: '불리언 변수로 조건 검사',
        code: `let hasTicket = true;
let isVIP = false;

if (hasTicket) {
  console.log("입장 가능합니다");
}

if (isVIP) {
  console.log("VIP 라운지 이용 가능");
}

console.log("확인 완료");`,
        expected_output: `입장 가능합니다
확인 완료`,
      },
    ],
    keywords: ['if', '조건문', '조건', '참', '거짓', '실행'],
  },

  'js-intro-if-else': {
    name: 'if-else',
    description: '그렇지 않으면',
    content: `# if-else

## 조건이 거짓일 때도 처리하기

if만 사용하면 조건이 거짓일 때 아무 일도 하지 않습니다.
else를 사용하면 거짓일 때 실행할 코드를 지정할 수 있습니다.

## 일상생활의 예

- 만약 비가 오면 우산 챙기기, **아니면** 선글라스 챙기기
- 만약 잔액이 충분하면 결제하기, **아니면** 충전하기

## 기본 구조

\`\`\`javascript
if (조건) {
  // 조건이 참이면 실행
} else {
  // 조건이 거짓이면 실행
}
\`\`\`

## 간단한 예시

\`\`\`javascript
let score = 50;

if (score >= 60) {
  console.log("합격");
} else {
  console.log("불합격");
}
\`\`\`

score가 60 미만이므로 "불합격"이 출력됩니다.

## else if - 여러 조건 연속 검사

조건이 3개 이상일 때는 else if를 사용합니다.

\`\`\`javascript
let score = 85;

if (score >= 90) {
  console.log("A등급");
} else if (score >= 80) {
  console.log("B등급");
} else if (score >= 70) {
  console.log("C등급");
} else if (score >= 60) {
  console.log("D등급");
} else {
  console.log("F등급");
}
\`\`\`

## 중요: 위에서부터 순서대로 검사

\`\`\`javascript
let score = 95;

if (score >= 60) {
  console.log("60점 이상");  // 이것만 출력됨!
} else if (score >= 90) {
  console.log("90점 이상");  // 실행 안 됨
}
\`\`\`

위 코드는 95점이어도 "60점 이상"만 출력됩니다.
먼저 만족하는 조건이 있으면 나머지는 건너뛰기 때문입니다.

올바른 순서:

\`\`\`javascript
let score = 95;

if (score >= 90) {
  console.log("90점 이상");  // 먼저 검사
} else if (score >= 60) {
  console.log("60점 이상");
}
\`\`\`

## else만 따로 쓸 수도 있습니다

\`\`\`javascript
let isRaining = false;

if (isRaining) {
  console.log("우산을 챙기세요");
} else {
  console.log("좋은 날씨입니다");
}
\`\`\`

## 정리

- else: if가 거짓일 때 실행
- else if: 여러 조건 연속 검사
- 조건은 위에서부터 순서대로 검사
- 먼저 참인 조건을 만나면 나머지는 건너뜀`,
    runnable_examples: [
      {
        title: 'if-else 기본',
        code: `let age = 15;

if (age >= 18) {
  console.log("성인입니다");
} else {
  console.log("미성년자입니다");
}`,
        expected_output: `미성년자입니다`,
      },
      {
        title: 'else if로 등급 매기기',
        code: `let score = 75;

if (score >= 90) {
  console.log("A등급");
} else if (score >= 80) {
  console.log("B등급");
} else if (score >= 70) {
  console.log("C등급");
} else if (score >= 60) {
  console.log("D등급");
} else {
  console.log("F등급");
}

console.log("점수:", score);`,
        expected_output: `C등급
점수: 75`,
      },
      {
        title: '로그인 상태 확인',
        code: `let isLoggedIn = true;
let isAdmin = false;

if (isAdmin) {
  console.log("관리자 모드");
} else if (isLoggedIn) {
  console.log("일반 사용자 모드");
} else {
  console.log("로그인이 필요합니다");
}`,
        expected_output: `일반 사용자 모드`,
      },
      {
        title: '날씨에 따른 활동',
        code: `let weather = "비";

if (weather === "맑음") {
  console.log("소풍을 가요");
} else if (weather === "흐림") {
  console.log("집에서 쉬어요");
} else if (weather === "비") {
  console.log("우산을 챙기세요");
} else {
  console.log("날씨를 확인하세요");
}`,
        expected_output: `우산을 챙기세요`,
      },
    ],
    keywords: ['if', 'else', 'else if', '조건문', '분기', '조건'],
  },

  'js-intro-for': {
    name: 'for문 기본',
    description: '5번 반복해서 출력하기',
    content: `# for문 기본

## 같은 일을 여러 번 하기

for문은 같은 코드를 **여러 번 반복**할 때 사용합니다.

## 반복이 필요한 상황

- "안녕하세요"를 10번 출력해야 할 때
- 1부터 100까지 숫자를 더할 때
- 배열의 모든 요소를 확인할 때

## 기본 구조

\`\`\`javascript
for (초기값; 조건; 증가) {
  // 반복할 코드
}
\`\`\`

- **초기값**: 시작할 때 한 번만 실행 (보통 let i = 0)
- **조건**: 이 조건이 참인 동안 반복
- **증가**: 한 번 반복할 때마다 실행 (보통 i++)

## 5번 반복하기

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 출력: 0, 1, 2, 3, 4
\`\`\`

## 실행 순서 이해하기

\`\`\`javascript
for (let i = 0; i < 3; i++) {
  console.log(i);
}
\`\`\`

1. \`let i = 0\` - i를 0으로 시작 (한 번만)
2. \`i < 3\` - 0 < 3 ? true! 실행
3. console.log(0) 출력
4. \`i++\` - i가 1이 됨
5. \`i < 3\` - 1 < 3 ? true! 실행
6. console.log(1) 출력
7. \`i++\` - i가 2가 됨
8. \`i < 3\` - 2 < 3 ? true! 실행
9. console.log(2) 출력
10. \`i++\` - i가 3이 됨
11. \`i < 3\` - 3 < 3 ? false! 종료

## 1부터 시작하기

\`\`\`javascript
for (let i = 1; i <= 5; i++) {
  console.log(i);
}
// 출력: 1, 2, 3, 4, 5
\`\`\`

## i++ 이해하기

\`i++\`는 \`i = i + 1\`과 같습니다.
i를 1씩 증가시킵니다.

\`\`\`javascript
let i = 0;
i++;  // i = 1
i++;  // i = 2
i++;  // i = 3
\`\`\`

## 2씩 증가하기

\`\`\`javascript
for (let i = 0; i <= 10; i += 2) {
  console.log(i);
}
// 출력: 0, 2, 4, 6, 8, 10
\`\`\`

## 정리

- for문: 코드를 여러 번 반복
- \`for (let i = 0; i < 횟수; i++)\`
- i는 반복 변수 (몇 번째인지 알려줌)
- i++는 1씩 증가, i += 2는 2씩 증가`,
    runnable_examples: [
      {
        title: '5번 반복 출력',
        code: `for (let i = 0; i < 5; i++) {
  console.log("반복 " + i + "번");
}`,
        expected_output: `반복 0번
반복 1번
반복 2번
반복 3번
반복 4번`,
      },
      {
        title: '1부터 10까지 출력',
        code: `for (let i = 1; i <= 10; i++) {
  console.log(i);
}`,
        expected_output: `1
2
3
4
5
6
7
8
9
10`,
      },
      {
        title: '1부터 10까지 합계',
        code: `let sum = 0;

for (let i = 1; i <= 10; i++) {
  sum = sum + i;
}

console.log("1부터 10까지 합:", sum);`,
        expected_output: `1부터 10까지 합: 55`,
      },
      {
        title: '구구단 5단',
        code: `let dan = 5;

for (let i = 1; i <= 9; i++) {
  console.log(dan + " x " + i + " = " + (dan * i));
}`,
        expected_output: `5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
5 x 4 = 20
5 x 5 = 25
5 x 6 = 30
5 x 7 = 35
5 x 8 = 40
5 x 9 = 45`,
      },
    ],
    keywords: ['for', '반복문', '루프', 'loop', '반복', 'i++'],
  },

  'js-intro-while': {
    name: 'while문',
    description: '~하는 동안 계속',
    content: `# while문

## 조건이 참인 동안 반복

while문은 **조건이 true인 동안 계속** 반복합니다.

## for문과 while문의 차이

- for문: 몇 번 반복할지 미리 알 때
- while문: 언제까지 반복할지 모를 때

## 기본 구조

\`\`\`javascript
while (조건) {
  // 조건이 참인 동안 반복
}
\`\`\`

## 간단한 예시

\`\`\`javascript
let count = 0;

while (count < 3) {
  console.log(count);
  count++;  // 중요! 이게 없으면 무한 반복
}
// 출력: 0, 1, 2
\`\`\`

## 실행 순서

1. 조건 확인 (count < 3 ?)
2. true면 코드 실행
3. count++ 로 값 증가
4. 다시 1번으로 돌아감
5. false가 되면 종료

## for문을 while문으로

같은 동작을 for문과 while문 둘 다로 쓸 수 있습니다.

\`\`\`javascript
// for문
for (let i = 0; i < 3; i++) {
  console.log(i);
}

// while문으로 같은 동작
let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}
\`\`\`

## while문이 유용한 경우

언제 끝날지 모르는 상황에서 유용합니다.

\`\`\`javascript
// 예: 숫자 맞추기 게임
// 사용자가 맞출 때까지 반복 (여기서는 시뮬레이션)
let guess = 0;
let answer = 7;

while (guess !== answer) {
  guess++;  // 1씩 증가하며 찾기
}
console.log("정답을 맞췄습니다: " + guess);
\`\`\`

## 주의: 무한 루프

조건이 절대 false가 되지 않으면 영원히 반복합니다.
**반드시 조건이 false가 되도록** 만들어야 합니다.

\`\`\`javascript
// 위험! 무한 루프
// while (true) {
//   console.log("영원히 반복");
// }

// 안전: 조건이 false가 됨
let x = 0;
while (x < 5) {
  console.log(x);
  x++;  // 이게 있어야 언젠가 false가 됨
}
\`\`\`

## do-while문

while과 비슷하지만, **최소 한 번은 실행**합니다.

\`\`\`javascript
let count = 5;

do {
  console.log(count);  // 조건이 false여도 한 번 실행
  count++;
} while (count < 5);
// 출력: 5 (한 번 실행 후 조건 확인)
\`\`\`

## 정리

- while: 조건이 true인 동안 반복
- 조건을 false로 만드는 코드 필수 (무한 루프 방지)
- 몇 번 반복할지 모를 때 유용
- do-while: 최소 한 번 실행 보장`,
    runnable_examples: [
      {
        title: 'while문 기본',
        code: `let count = 0;

while (count < 5) {
  console.log("현재 count:", count);
  count++;
}

console.log("반복 종료");`,
        expected_output: `현재 count: 0
현재 count: 1
현재 count: 2
현재 count: 3
현재 count: 4
반복 종료`,
      },
      {
        title: '합계가 100 넘을 때까지',
        code: `let sum = 0;
let num = 1;

while (sum < 100) {
  sum = sum + num;
  console.log(num + "까지 합:", sum);
  num++;
}

console.log("100을 넘은 합:", sum);`,
        expected_output: `1까지 합: 1
2까지 합: 3
3까지 합: 6
4까지 합: 10
5까지 합: 15
6까지 합: 21
7까지 합: 28
8까지 합: 36
9까지 합: 45
10까지 합: 55
11까지 합: 66
12까지 합: 78
13까지 합: 91
14까지 합: 105
100을 넘은 합: 105`,
      },
      {
        title: '숫자 절반으로 줄이기',
        code: `let number = 100;

while (number > 1) {
  console.log(number);
  number = Math.floor(number / 2);
}

console.log("최종:", number);`,
        expected_output: `100
50
25
12
6
3
최종: 1`,
      },
    ],
    keywords: ['while', '반복문', '루프', '조건', '무한루프', 'do-while'],
  },

  'js-intro-func-what': {
    name: '함수란?',
    description: '레시피, 재사용 가능한 코드 묶음',
    content: `# 함수란?

## 재사용 가능한 코드 묶음

함수는 **특정 작업을 수행하는 코드를 묶어둔 것**입니다.

마치 요리 레시피처럼:
- 한 번 만들어두면
- 필요할 때마다 사용할 수 있습니다

## 왜 함수를 쓸까?

### 함수 없이 반복하면

\`\`\`javascript
console.log("안녕하세요!");
console.log("오늘도 좋은 하루 되세요.");
console.log("감사합니다.");

// ... 다른 코드 ...

console.log("안녕하세요!");
console.log("오늘도 좋은 하루 되세요.");
console.log("감사합니다.");

// 또 같은 코드 반복...
\`\`\`

### 함수로 만들면

\`\`\`javascript
function greet() {
  console.log("안녕하세요!");
  console.log("오늘도 좋은 하루 되세요.");
  console.log("감사합니다.");
}

greet();  // 함수 호출
greet();  // 필요할 때마다 호출
greet();
\`\`\`

## 함수 만들기

\`\`\`javascript
function 함수이름() {
  // 실행할 코드
}
\`\`\`

- \`function\`: "함수를 만든다"는 선언
- \`함수이름\`: 함수를 부를 때 사용할 이름
- \`()\`: 괄호 (나중에 값을 받을 수 있음)
- \`{ }\`: 중괄호 안에 실행할 코드

## 함수 호출하기

함수를 만들었으면, 이름 뒤에 \`()\`를 붙여 실행합니다.

\`\`\`javascript
function sayHello() {
  console.log("안녕하세요!");
}

sayHello();  // 함수 호출 - "안녕하세요!" 출력
sayHello();  // 여러 번 호출 가능
sayHello();
\`\`\`

## 함수는 정의만 하면 실행되지 않음

\`\`\`javascript
function printMessage() {
  console.log("이 메시지는 함수를 호출해야 보입니다");
}

// 위 코드만으로는 아무것도 출력되지 않습니다
// 아래처럼 호출해야 실행됩니다
printMessage();
\`\`\`

## 함수 이름 짓기

- 동사로 시작하면 좋음 (do, get, set, print, calculate...)
- 무슨 일을 하는지 알 수 있는 이름
- camelCase 사용 (두 번째 단어부터 대문자)

\`\`\`javascript
function printWelcome() { }    // 환영 인사 출력
function calculateSum() { }    // 합계 계산
function getUserName() { }     // 사용자 이름 가져오기
\`\`\`

## 정리

- 함수: 재사용 가능한 코드 묶음
- \`function 이름() { 코드 }\`로 정의
- \`이름()\`으로 호출
- 정의만 하면 실행되지 않음, 호출해야 실행됨`,
    runnable_examples: [
      {
        title: '간단한 함수 만들기',
        code: `function greet() {
  console.log("안녕하세요!");
  console.log("환영합니다!");
}

// 함수 호출
greet();
console.log("---");
greet();`,
        expected_output: `안녕하세요!
환영합니다!
---
안녕하세요!
환영합니다!`,
      },
      {
        title: '여러 함수 만들기',
        code: `function printLine() {
  console.log("================");
}

function printTitle() {
  console.log("JavaScript 학습");
}

printLine();
printTitle();
printLine();`,
        expected_output: `================
JavaScript 학습
================`,
      },
      {
        title: '함수로 구구단 출력',
        code: `function printMultiplicationTable() {
  let dan = 2;
  for (let i = 1; i <= 5; i++) {
    console.log(dan + " x " + i + " = " + (dan * i));
  }
}

console.log("2단 출력:");
printMultiplicationTable();`,
        expected_output: `2단 출력:
2 x 1 = 2
2 x 2 = 4
2 x 3 = 6
2 x 4 = 8
2 x 5 = 10`,
      },
    ],
    keywords: ['함수', 'function', '정의', '호출', '재사용', '코드묶음'],
  },

  'js-intro-func-params': {
    name: '매개변수와 반환',
    description: '입력 -> 처리 -> 출력',
    content: `# 매개변수와 반환

## 함수에 값 전달하기

함수를 더 유용하게 만들려면 **값을 전달**할 수 있어야 합니다.
전달받는 값을 **매개변수(parameter)**라고 합니다.

## 매개변수가 있는 함수

\`\`\`javascript
function greet(name) {  // name이 매개변수
  console.log("안녕, " + name + "!");
}

greet("철수");  // "안녕, 철수!"
greet("영희");  // "안녕, 영희!"
\`\`\`

## 여러 개의 매개변수

쉼표로 구분하여 여러 값을 받을 수 있습니다.

\`\`\`javascript
function introduce(name, age) {
  console.log("저는 " + name + "입니다.");
  console.log("나이는 " + age + "살입니다.");
}

introduce("민수", 25);
\`\`\`

## 결과 돌려주기 - return

함수가 **계산한 결과를 돌려줄 수** 있습니다.

\`\`\`javascript
function add(a, b) {
  return a + b;  // 결과를 돌려줌
}

let result = add(3, 5);
console.log(result);  // 8
\`\`\`

## return 이후 코드는 실행 안 됨

return을 만나면 함수가 즉시 종료됩니다.

\`\`\`javascript
function check(num) {
  if (num < 0) {
    return "음수입니다";
  }
  return "양수입니다";  // num >= 0 일 때
}

console.log(check(-5));  // "음수입니다"
console.log(check(10));  // "양수입니다"
\`\`\`

## 매개변수에 기본값 주기

값을 전달하지 않으면 기본값이 사용됩니다.

\`\`\`javascript
function greet(name = "손님") {
  console.log("안녕하세요, " + name + "님!");
}

greet("철수");  // "안녕하세요, 철수님!"
greet();        // "안녕하세요, 손님님!"
\`\`\`

## 입력 -> 처리 -> 출력 패턴

함수는 공장과 같습니다:

1. **입력(매개변수)**: 재료를 받음
2. **처리**: 재료로 작업
3. **출력(return)**: 결과물을 내보냄

\`\`\`javascript
function calculateArea(width, height) {
  let area = width * height;  // 처리
  return area;                 // 결과 반환
}

let roomArea = calculateArea(5, 4);  // 20
\`\`\`

## 정리

- 매개변수: 함수에 전달하는 입력값
- 여러 매개변수: 쉼표로 구분
- return: 결과를 돌려줌
- return 이후 코드는 실행 안 됨
- 기본값: \`parameter = 기본값\``,
    runnable_examples: [
      {
        title: '매개변수 사용하기',
        code: `function greet(name) {
  console.log("안녕, " + name + "!");
}

greet("민수");
greet("지영");
greet("철수");`,
        expected_output: `안녕, 민수!
안녕, 지영!
안녕, 철수!`,
      },
      {
        title: '두 수의 합 반환',
        code: `function add(a, b) {
  return a + b;
}

let sum1 = add(10, 20);
let sum2 = add(5, 3);

console.log("10 + 20 =", sum1);
console.log("5 + 3 =", sum2);
console.log("합계:", sum1 + sum2);`,
        expected_output: `10 + 20 = 30
5 + 3 = 8
합계: 38`,
      },
      {
        title: '계산기 함수들',
        code: `function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }

let x = 20;
let y = 4;

console.log(x + " + " + y + " =", add(x, y));
console.log(x + " - " + y + " =", subtract(x, y));
console.log(x + " * " + y + " =", multiply(x, y));
console.log(x + " / " + y + " =", divide(x, y));`,
        expected_output: `20 + 4 = 24
20 - 4 = 16
20 * 4 = 80
20 / 4 = 5`,
      },
      {
        title: '기본 매개변수',
        code: `function orderCoffee(type = "아메리카노", size = "보통") {
  console.log(size + " " + type + " 주문되었습니다.");
}

orderCoffee("라떼", "큰");
orderCoffee("에스프레소");
orderCoffee();`,
        expected_output: `큰 라떼 주문되었습니다.
보통 에스프레소 주문되었습니다.
보통 아메리카노 주문되었습니다.`,
      },
    ],
    keywords: ['매개변수', 'parameter', 'return', '반환', '인자', '기본값'],
  },

  'js-intro-array-what': {
    name: '배열이란?',
    description: '여러 개를 한 줄로 정리, [1, 2, 3]',
    content: `# 배열이란?

## 여러 데이터를 한 줄로 정리

배열은 **여러 개의 값을 순서대로 저장**하는 자료구조입니다.
대괄호 \`[]\` 안에 쉼표로 구분하여 값을 넣습니다.

## 왜 배열이 필요할까?

### 배열 없이 저장하면

\`\`\`javascript
let student1 = "김철수";
let student2 = "이영희";
let student3 = "박민수";
let student4 = "최지영";
// ... 학생이 많으면 변수가 너무 많아짐!
\`\`\`

### 배열로 저장하면

\`\`\`javascript
let students = ["김철수", "이영희", "박민수", "최지영"];
// 하나의 변수에 모든 학생 저장!
\`\`\`

## 배열 만들기

\`\`\`javascript
// 문자열 배열
let fruits = ["사과", "바나나", "오렌지"];

// 숫자 배열
let numbers = [1, 2, 3, 4, 5];

// 혼합 배열 (권장하지 않음)
let mixed = ["안녕", 123, true];

// 빈 배열
let empty = [];
\`\`\`

## 배열의 길이 확인

\`length\` 속성으로 배열에 몇 개가 있는지 확인합니다.

\`\`\`javascript
let fruits = ["사과", "바나나", "오렌지"];
console.log(fruits.length);  // 3

let empty = [];
console.log(empty.length);   // 0
\`\`\`

## 배열에 값 추가하기

\`push()\`로 배열 끝에 값을 추가합니다.

\`\`\`javascript
let fruits = ["사과"];
fruits.push("바나나");
fruits.push("오렌지");
console.log(fruits);  // ["사과", "바나나", "오렌지"]
\`\`\`

## 배열에서 값 제거하기

\`pop()\`으로 마지막 값을 제거합니다.

\`\`\`javascript
let fruits = ["사과", "바나나", "오렌지"];
let removed = fruits.pop();  // "오렌지" 제거
console.log(removed);  // "오렌지"
console.log(fruits);   // ["사과", "바나나"]
\`\`\`

## 전체 배열 출력하기

\`\`\`javascript
let colors = ["빨강", "파랑", "초록"];
console.log(colors);       // 배열 전체 출력
console.log(colors.length); // 개수 확인
\`\`\`

## 정리

- 배열: 여러 값을 순서대로 저장
- \`[값1, 값2, 값3]\` 형태
- \`.length\`: 배열 길이(개수)
- \`.push(값)\`: 끝에 추가
- \`.pop()\`: 마지막 제거`,
    runnable_examples: [
      {
        title: '배열 만들고 확인하기',
        code: `let fruits = ["사과", "바나나", "오렌지", "포도"];

console.log("과일 목록:", fruits);
console.log("과일 개수:", fruits.length);`,
        expected_output: `과일 목록: [ '사과', '바나나', '오렌지', '포도' ]
과일 개수: 4`,
      },
      {
        title: '배열에 추가하기',
        code: `let numbers = [];

numbers.push(10);
console.log("추가 후:", numbers);

numbers.push(20);
numbers.push(30);
console.log("추가 후:", numbers);

console.log("총 개수:", numbers.length);`,
        expected_output: `추가 후: [ 10 ]
추가 후: [ 10, 20, 30 ]
총 개수: 3`,
      },
      {
        title: '배열에서 제거하기',
        code: `let items = ["A", "B", "C", "D"];
console.log("처음:", items);

let removed = items.pop();
console.log("제거된 값:", removed);
console.log("제거 후:", items);`,
        expected_output: `처음: [ 'A', 'B', 'C', 'D' ]
제거된 값: D
제거 후: [ 'A', 'B', 'C' ]`,
      },
      {
        title: '다양한 타입의 배열',
        code: `let names = ["홍길동", "김철수", "이영희"];
let scores = [95, 80, 88];
let active = [true, false, true];

console.log("이름:", names);
console.log("점수:", scores);
console.log("활성:", active);`,
        expected_output: `이름: [ '홍길동', '김철수', '이영희' ]
점수: [ 95, 80, 88 ]
활성: [ true, false, true ]`,
      },
    ],
    keywords: ['배열', 'Array', 'push', 'pop', 'length', '리스트'],
  },

  'js-intro-array-index': {
    name: '인덱스 접근',
    description: '0번째, 1번째... arr[0]',
    content: `# 인덱스 접근

## 순서 번호로 접근하기

배열의 각 요소는 **번호(인덱스)**를 가집니다.
**중요: 인덱스는 0부터 시작합니다!**

\`\`\`javascript
let fruits = ["사과", "바나나", "오렌지"];
//            [0]     [1]       [2]
\`\`\`

## 인덱스로 값 가져오기

대괄호 안에 인덱스를 넣어 값을 가져옵니다.

\`\`\`javascript
let fruits = ["사과", "바나나", "오렌지"];

console.log(fruits[0]);  // "사과"
console.log(fruits[1]);  // "바나나"
console.log(fruits[2]);  // "오렌지"
\`\`\`

## 왜 0부터 시작할까?

컴퓨터에서 0은 "처음"을 의미합니다.
대부분의 프로그래밍 언어가 0부터 시작합니다.

| 순서 | 인덱스 | 값 |
|------|--------|-----|
| 첫 번째 | 0 | 사과 |
| 두 번째 | 1 | 바나나 |
| 세 번째 | 2 | 오렌지 |

## 인덱스로 값 변경하기

\`\`\`javascript
let fruits = ["사과", "바나나"];

fruits[1] = "딸기";  // 바나나를 딸기로 변경
console.log(fruits);  // ["사과", "딸기"]
\`\`\`

## 마지막 요소 접근하기

배열의 마지막 요소는 \`length - 1\` 번째입니다.

\`\`\`javascript
let arr = [1, 2, 3, 4, 5];
let last = arr[arr.length - 1];  // arr[4] = 5
console.log(last);  // 5
\`\`\`

## 존재하지 않는 인덱스

없는 인덱스에 접근하면 \`undefined\`가 나옵니다.

\`\`\`javascript
let fruits = ["사과", "바나나"];
console.log(fruits[10]);  // undefined
\`\`\`

## for문으로 배열 순회하기

\`\`\`javascript
let fruits = ["사과", "바나나", "오렌지"];

for (let i = 0; i < fruits.length; i++) {
  console.log(i + "번:", fruits[i]);
}
\`\`\`

## 정리

- 인덱스: 0부터 시작
- \`배열[인덱스]\`로 접근
- \`배열[인덱스] = 값\`으로 변경
- 마지막: \`배열[배열.length - 1]\`
- 없는 인덱스: undefined`,
    runnable_examples: [
      {
        title: '인덱스로 값 가져오기',
        code: `let colors = ["빨강", "주황", "노랑", "초록", "파랑"];

console.log("0번째:", colors[0]);
console.log("1번째:", colors[1]);
console.log("2번째:", colors[2]);
console.log("마지막:", colors[colors.length - 1]);`,
        expected_output: `0번째: 빨강
1번째: 주황
2번째: 노랑
마지막: 파랑`,
      },
      {
        title: '값 변경하기',
        code: `let scores = [80, 70, 90];
console.log("변경 전:", scores);

scores[1] = 95;  // 두 번째(인덱스 1) 값 변경
console.log("변경 후:", scores);`,
        expected_output: `변경 전: [ 80, 70, 90 ]
변경 후: [ 80, 95, 90 ]`,
      },
      {
        title: 'for문으로 배열 출력',
        code: `let students = ["김철수", "이영희", "박민수"];

for (let i = 0; i < students.length; i++) {
  console.log((i + 1) + "번 학생:", students[i]);
}`,
        expected_output: `1번 학생: 김철수
2번 학생: 이영희
3번 학생: 박민수`,
      },
      {
        title: '배열 합계 구하기',
        code: `let numbers = [10, 20, 30, 40, 50];
let sum = 0;

for (let i = 0; i < numbers.length; i++) {
  sum = sum + numbers[i];
}

console.log("배열:", numbers);
console.log("합계:", sum);`,
        expected_output: `배열: [ 10, 20, 30, 40, 50 ]
합계: 150`,
      },
    ],
    keywords: ['인덱스', 'index', '배열', '접근', '요소', '순회'],
  },

  'js-intro-obj-what': {
    name: '객체란?',
    description: '이름표 붙은 서랍장, {name: "Kim"}',
    content: `# 객체란?

## 이름표가 붙은 데이터 묶음

객체는 **관련된 데이터를 이름표와 함께 묶어둔 것**입니다.
중괄호 \`{}\` 안에 "이름: 값" 형태로 저장합니다.

## 왜 객체가 필요할까?

### 변수로 따로 저장하면

\`\`\`javascript
let personName = "김철수";
let personAge = 25;
let personCity = "서울";
// 한 사람 정보가 흩어져 있음
\`\`\`

### 객체로 묶으면

\`\`\`javascript
let person = {
  name: "김철수",
  age: 25,
  city: "서울"
};
// 한 사람 정보가 하나로 묶임
\`\`\`

## 객체 만들기

\`\`\`javascript
let person = {
  name: "김철수",    // 키: 값
  age: 25,          // 키: 값
  isStudent: true   // 키: 값
};
\`\`\`

- **키(key)**: 속성의 이름 (name, age, isStudent)
- **값(value)**: 속성의 값 ("김철수", 25, true)
- **속성(property)**: 키와 값의 쌍

## 배열 vs 객체

| 배열 | 객체 |
|------|------|
| 순서대로 저장 | 이름으로 저장 |
| 인덱스(숫자)로 접근 | 키(이름)로 접근 |
| \`[값1, 값2]\` | \`{키: 값}\` |

\`\`\`javascript
// 배열 - 순서만 있음
let arr = ["김철수", 25, "서울"];
console.log(arr[0]);  // "김철수"

// 객체 - 이름으로 구분
let obj = { name: "김철수", age: 25, city: "서울" };
console.log(obj.name);  // "김철수"
\`\`\`

## 한 줄 vs 여러 줄

\`\`\`javascript
// 한 줄 (짧을 때)
let point = { x: 10, y: 20 };

// 여러 줄 (길 때)
let user = {
  name: "홍길동",
  email: "hong@example.com",
  age: 30,
  isAdmin: false
};
\`\`\`

## 객체 출력하기

\`\`\`javascript
let car = {
  brand: "현대",
  model: "소나타",
  year: 2024
};

console.log(car);  // 객체 전체 출력
\`\`\`

## 정리

- 객체: 이름 붙은 데이터 묶음
- \`{ 키: 값, 키: 값 }\` 형태
- 키로 값을 구분하고 접근
- 관련 데이터를 하나로 묶을 때 유용`,
    runnable_examples: [
      {
        title: '객체 만들기',
        code: `let person = {
  name: "김민수",
  age: 28,
  job: "개발자",
  isMarried: false
};

console.log(person);`,
        expected_output: `{ name: '김민수', age: 28, job: '개발자', isMarried: false }`,
      },
      {
        title: '다양한 객체',
        code: `let book = {
  title: "JavaScript 입문",
  author: "홍길동",
  pages: 300,
  price: 25000
};

console.log("책 정보:", book);

let point = { x: 100, y: 200 };
console.log("좌표:", point);`,
        expected_output: `책 정보: { title: 'JavaScript 입문', author: '홍길동', pages: 300, price: 25000 }
좌표: { x: 100, y: 200 }`,
      },
      {
        title: '배열 안의 객체',
        code: `let students = [
  { name: "김철수", score: 85 },
  { name: "이영희", score: 92 },
  { name: "박민수", score: 78 }
];

console.log("학생 목록:", students);
console.log("학생 수:", students.length);`,
        expected_output: `학생 목록: [ { name: '김철수', score: 85 }, { name: '이영희', score: 92 }, { name: '박민수', score: 78 } ]
학생 수: 3`,
      },
    ],
    keywords: ['객체', 'Object', '속성', 'property', '키', '값'],
  },

  'js-intro-obj-access': {
    name: '속성 접근',
    description: 'person.name, person["name"]',
    content: `# 속성 접근

## 객체의 속성에 접근하는 두 가지 방법

### 1. 점 표기법 (dot notation)

가장 많이 사용하는 방법입니다.

\`\`\`javascript
let person = { name: "철수", age: 20 };

console.log(person.name);  // "철수"
console.log(person.age);   // 20
\`\`\`

### 2. 대괄호 표기법 (bracket notation)

키를 문자열로 지정합니다.

\`\`\`javascript
let person = { name: "철수", age: 20 };

console.log(person["name"]);  // "철수"
console.log(person["age"]);   // 20
\`\`\`

## 언제 어떤 방법을 쓸까?

**점 표기법**을 기본으로 사용하고,
아래 경우에만 **대괄호 표기법**을 사용합니다:

1. 키에 공백이나 특수문자가 있을 때
2. 변수로 키를 지정할 때

\`\`\`javascript
let data = {
  "user name": "홍길동",  // 공백 있음
  "2024-score": 95        // 특수문자 있음
};

// 점 표기법 불가능
// console.log(data.user name);  // 오류!

// 대괄호 표기법 사용
console.log(data["user name"]);
console.log(data["2024-score"]);
\`\`\`

## 변수로 키 지정하기

\`\`\`javascript
let person = { name: "철수", age: 20 };
let key = "name";

console.log(person[key]);  // "철수"

key = "age";
console.log(person[key]);  // 20
\`\`\`

## 속성 값 변경하기

\`\`\`javascript
let person = { name: "철수", age: 20 };

person.age = 21;      // 점 표기법으로 변경
person["name"] = "영희";  // 대괄호로 변경

console.log(person);  // { name: "영희", age: 21 }
\`\`\`

## 속성 추가하기

없는 키에 값을 할당하면 새 속성이 추가됩니다.

\`\`\`javascript
let person = { name: "철수" };

person.age = 20;           // 새 속성 추가
person["city"] = "서울";   // 새 속성 추가

console.log(person);  // { name: "철수", age: 20, city: "서울" }
\`\`\`

## 속성 삭제하기

\`\`\`javascript
let person = { name: "철수", age: 20, city: "서울" };

delete person.city;

console.log(person);  // { name: "철수", age: 20 }
\`\`\`

## 속성 존재 확인

\`\`\`javascript
let person = { name: "철수", age: 20 };

console.log("name" in person);   // true
console.log("email" in person);  // false
\`\`\`

## 정리

- 점 표기법: \`객체.키\` (기본 사용)
- 대괄호 표기법: \`객체["키"]\` (특수 상황)
- 같은 방법으로 읽기/쓰기/추가 가능
- \`delete\`로 속성 삭제
- \`in\`으로 존재 확인`,
    runnable_examples: [
      {
        title: '속성 접근하기',
        code: `let user = {
  name: "홍길동",
  email: "hong@email.com",
  age: 30
};

// 점 표기법
console.log("이름:", user.name);
console.log("이메일:", user.email);

// 대괄호 표기법
console.log("나이:", user["age"]);`,
        expected_output: `이름: 홍길동
이메일: hong@email.com
나이: 30`,
      },
      {
        title: '속성 변경과 추가',
        code: `let product = {
  name: "노트북",
  price: 1000000
};

console.log("변경 전:", product);

product.price = 900000;      // 가격 변경
product.discount = 10;       // 할인율 추가
product["inStock"] = true;   // 재고 여부 추가

console.log("변경 후:", product);`,
        expected_output: `변경 전: { name: '노트북', price: 1000000 }
변경 후: { name: '노트북', price: 900000, discount: 10, inStock: true }`,
      },
      {
        title: '변수로 키 접근',
        code: `let student = {
  korean: 90,
  english: 85,
  math: 95
};

let subjects = ["korean", "english", "math"];

for (let i = 0; i < subjects.length; i++) {
  let subject = subjects[i];
  console.log(subject + " 점수:", student[subject]);
}`,
        expected_output: `korean 점수: 90
english 점수: 85
math 점수: 95`,
      },
      {
        title: '속성 존재 확인',
        code: `let config = {
  debug: true,
  version: "1.0"
};

console.log("debug 있음?", "debug" in config);
console.log("name 있음?", "name" in config);

if ("debug" in config) {
  console.log("디버그 모드:", config.debug);
}`,
        expected_output: `debug 있음? true
name 있음? false
디버그 모드: true`,
      },
    ],
    keywords: ['속성', '접근', 'dot notation', 'bracket notation', '객체', '키'],
  },
};
