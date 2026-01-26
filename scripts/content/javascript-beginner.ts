/**
 * JavaScript 기초 (beginner) 개념 콘텐츠
 * 대상: 변수, 조건문, 반복문을 들어본 사람
 * 특징: 간단한 설명과 실용적인 예제, 실습 중심
 */

export const JS_BEGINNER_CONCEPTS = {
  'js-basics-scope': {
    name: '스코프',
    description: '블록 스코프, 변수가 보이는 범위',
    content: `# 스코프 (Scope)

## 변수가 보이는 범위

스코프는 변수에 접근할 수 있는 범위를 의미합니다.
어디서 변수를 선언했느냐에 따라 접근 가능한 영역이 달라집니다.

## 블록 스코프

\`let\`과 \`const\`는 **블록 스코프**를 따릅니다.
중괄호 \`{}\` 안에서 선언된 변수는 그 안에서만 사용 가능합니다.

\`\`\`javascript
if (true) {
  let inner = "블록 안";
  console.log(inner);  // "블록 안" - 접근 가능
}
// console.log(inner);  // ReferenceError - 접근 불가
\`\`\`

## 함수 스코프

함수 안에서 선언한 변수는 함수 밖에서 접근할 수 없습니다.

\`\`\`javascript
function myFunction() {
  let local = "함수 내부 변수";
  console.log(local);  // 접근 가능
}
myFunction();
// console.log(local);  // ReferenceError
\`\`\`

## 전역 스코프

어떤 블록에도 속하지 않은 변수는 **전역 변수**입니다.
코드 어디서든 접근할 수 있습니다.

\`\`\`javascript
let globalVar = "전역 변수";

function test() {
  console.log(globalVar);  // 접근 가능
}

if (true) {
  console.log(globalVar);  // 접근 가능
}
\`\`\`

## 스코프 체인

안쪽 스코프에서 바깥쪽 스코프의 변수에 접근할 수 있습니다.

\`\`\`javascript
let outer = "바깥";

function myFunc() {
  let middle = "중간";

  if (true) {
    let inner = "안쪽";
    console.log(inner);   // 접근 가능
    console.log(middle);  // 접근 가능
    console.log(outer);   // 접근 가능
  }
}
\`\`\`

## 변수 이름 충돌

같은 이름의 변수가 여러 스코프에 있으면, 가장 가까운 것이 사용됩니다.

\`\`\`javascript
let name = "전역";

function greet() {
  let name = "지역";  // 이 name이 사용됨
  console.log(name);  // "지역"
}

greet();
console.log(name);  // "전역"
\`\`\``,
    runnable_examples: [
      {
        title: '블록 스코프 이해',
        code: `let x = "전역";

if (true) {
  let y = "블록 안";
  console.log("if 블록 안 x:", x);
  console.log("if 블록 안 y:", y);
}

console.log("if 블록 밖 x:", x);
// y는 여기서 접근 불가`,
        expected_output: `if 블록 안 x: 전역
if 블록 안 y: 블록 안
if 블록 밖 x: 전역`,
      },
      {
        title: '함수 스코프',
        code: `let global = "전역";

function outer() {
  let outerVar = "outer 함수";

  function inner() {
    let innerVar = "inner 함수";
    console.log(innerVar);   // inner 자신의 변수
    console.log(outerVar);   // outer의 변수
    console.log(global);     // 전역 변수
  }

  inner();
}

outer();`,
        expected_output: `inner 함수
outer 함수
전역`,
      },
      {
        title: 'for문의 스코프',
        code: `for (let i = 0; i < 3; i++) {
  console.log("반복 안 i:", i);
}

// i는 for 블록 안에서만 존재
console.log("반복 끝");

// 만약 바깥에서 i를 쓰려면:
let j;
for (j = 0; j < 3; j++) { }
console.log("밖에서 j:", j);`,
        expected_output: `반복 안 i: 0
반복 안 i: 1
반복 안 i: 2
반복 끝
밖에서 j: 3`,
      },
    ],
    keywords: ['스코프', 'scope', '블록', '전역', '지역', '변수범위'],
  },

  'js-basics-hoisting': {
    name: '호이스팅',
    description: 'var vs let의 차이, 선언 끌어올림',
    content: `# 호이스팅 (Hoisting)

## 선언이 끌어올려지는 현상

JavaScript는 코드 실행 전에 변수와 함수 선언을 해당 스코프의 맨 위로 끌어올립니다.

## var의 호이스팅

\`var\`는 선언만 끌어올려지고, 값은 원래 위치에 남습니다.

\`\`\`javascript
console.log(x);  // undefined (오류가 아님!)
var x = 5;
console.log(x);  // 5
\`\`\`

위 코드는 내부적으로 이렇게 동작합니다:

\`\`\`javascript
var x;           // 선언이 위로
console.log(x);  // undefined
x = 5;           // 할당은 그 자리에
console.log(x);  // 5
\`\`\`

## let/const의 호이스팅과 TDZ

\`let\`과 \`const\`도 호이스팅되지만, 선언 전에 접근하면 오류가 발생합니다.
이 구간을 **TDZ (Temporal Dead Zone)**라고 합니다.

\`\`\`javascript
// TDZ 시작
// console.log(y);  // ReferenceError!
// TDZ 끝
let y = 5;
console.log(y);    // 5
\`\`\`

## 함수 선언의 호이스팅

함수 선언은 **전체가 끌어올려집니다**.

\`\`\`javascript
sayHello();  // "안녕!" - 선언 전에 호출해도 동작

function sayHello() {
  console.log("안녕!");
}
\`\`\`

## 함수 표현식은 다름

\`\`\`javascript
// sayBye();  // TypeError - 함수가 아님

const sayBye = function() {
  console.log("잘가!");
};

sayBye();  // "잘가!"
\`\`\`

## var를 피해야 하는 이유

1. 예측하기 어려운 동작
2. 블록 스코프가 아닌 함수 스코프
3. 재선언 가능 (실수 유발)

\`\`\`javascript
var name = "철수";
var name = "영희";  // 오류 없이 덮어씀

let age = 20;
// let age = 30;  // SyntaxError - 재선언 불가
\`\`\``,
    runnable_examples: [
      {
        title: 'var 호이스팅',
        code: `console.log("선언 전 a:", a);  // undefined

var a = 10;

console.log("선언 후 a:", a);  // 10`,
        expected_output: `선언 전 a: undefined
선언 후 a: 10`,
      },
      {
        title: '함수 호이스팅',
        code: `// 선언 전에 호출해도 동작
greet("철수");
greet("영희");

function greet(name) {
  console.log("안녕하세요, " + name + "!");
}`,
        expected_output: `안녕하세요, 철수!
안녕하세요, 영희!`,
      },
      {
        title: 'var vs let 비교',
        code: `// var는 함수 스코프
function testVar() {
  if (true) {
    var x = 10;
  }
  console.log("var x:", x);  // 접근 가능
}

// let은 블록 스코프
function testLet() {
  if (true) {
    let y = 20;
  }
  // console.log(y);  // 오류: y is not defined
  console.log("let은 블록 안에서만");
}

testVar();
testLet();`,
        expected_output: `var x: 10
let은 블록 안에서만`,
      },
    ],
    keywords: ['호이스팅', 'hoisting', 'var', 'let', 'TDZ', '끌어올림'],
  },

  'js-basics-comparison': {
    name: '비교 연산자',
    description: '==, ===, 타입까지 비교',
    content: `# 비교 연산자

## 값 비교하기

비교 연산자는 두 값을 비교하여 true 또는 false를 반환합니다.

## 크기 비교

| 연산자 | 의미 | 예시 |
|--------|------|------|
| > | 크다 | 5 > 3 (true) |
| < | 작다 | 5 < 3 (false) |
| >= | 크거나 같다 | 5 >= 5 (true) |
| <= | 작거나 같다 | 5 <= 3 (false) |

## == vs === (같음 비교)

**가장 중요한 차이점입니다!**

- \`==\` (동등): 값만 비교 (타입 변환 후)
- \`===\` (일치): 값과 타입 모두 비교 **(권장)**

\`\`\`javascript
console.log(5 == "5");   // true  - 타입 변환 후 비교
console.log(5 === "5");  // false - 타입이 다름
console.log(5 === 5);    // true  - 타입도 값도 같음
\`\`\`

## === 를 써야 하는 이유

\`==\`는 예상치 못한 결과를 낼 수 있습니다:

\`\`\`javascript
console.log(0 == false);   // true (?)
console.log("" == false);  // true (?)
console.log(null == undefined);  // true (?)

console.log(0 === false);  // false (명확)
console.log("" === false); // false (명확)
\`\`\`

## != vs !== (다름 비교)

\`\`\`javascript
console.log(5 != "5");   // false - 값이 같으니까
console.log(5 !== "5");  // true  - 타입이 다르니까
\`\`\`

## 문자열 비교

문자열도 비교할 수 있습니다 (사전순):

\`\`\`javascript
console.log("apple" < "banana");  // true
console.log("a" < "b");           // true
console.log("Z" < "a");           // true (대문자가 더 작음)
\`\`\`

## 객체 비교 주의

객체는 참조로 비교합니다:

\`\`\`javascript
let a = { name: "철수" };
let b = { name: "철수" };
let c = a;

console.log(a === b);  // false - 다른 객체
console.log(a === c);  // true  - 같은 객체 참조
\`\`\``,
    runnable_examples: [
      {
        title: '== vs === 비교',
        code: `console.log("숫자 5 vs 문자 '5'");
console.log("==:", 5 == "5");
console.log("===:", 5 === "5");

console.log("\\n0 vs false");
console.log("==:", 0 == false);
console.log("===:", 0 === false);

console.log("\\nnull vs undefined");
console.log("==:", null == undefined);
console.log("===:", null === undefined);`,
        expected_output: `숫자 5 vs 문자 '5'
==: true
===: false

0 vs false
==: true
===: false

null vs undefined
==: true
===: false`,
      },
      {
        title: '크기 비교',
        code: `let a = 10;
let b = 5;
let c = 10;

console.log("a > b:", a > b);
console.log("a < b:", a < b);
console.log("a >= c:", a >= c);
console.log("a === c:", a === c);
console.log("a !== b:", a !== b);`,
        expected_output: `a > b: true
a < b: false
a >= c: true
a === c: true
a !== b: true`,
      },
      {
        title: '조건문에서 비교',
        code: `let userInput = "5";
let target = 5;

// == 사용 (권장하지 않음)
if (userInput == target) {
  console.log("==로 비교: 같음");
}

// === 사용 (권장)
if (userInput === target) {
  console.log("===로 비교: 같음");
} else {
  console.log("===로 비교: 다름 (타입이 다름)");
}

// 올바른 방법: 타입 변환 후 비교
if (Number(userInput) === target) {
  console.log("타입 변환 후: 같음");
}`,
        expected_output: `==로 비교: 같음
===로 비교: 다름 (타입이 다름)
타입 변환 후: 같음`,
      },
    ],
    keywords: ['비교', '연산자', '===', '==', '같음', '타입비교'],
  },

  'js-basics-logical': {
    name: '논리 연산자',
    description: '&&, ||, !',
    content: `# 논리 연산자

## 조건 조합하기

논리 연산자는 여러 조건을 조합하거나 반전시킬 때 사용합니다.

## && (AND, 그리고)

**모든 조건이 true일 때만 true**

\`\`\`javascript
console.log(true && true);    // true
console.log(true && false);   // false
console.log(false && true);   // false
console.log(false && false);  // false
\`\`\`

실제 사용:

\`\`\`javascript
let age = 25;
let hasLicense = true;

if (age >= 18 && hasLicense) {
  console.log("운전 가능");
}
\`\`\`

## || (OR, 또는)

**하나라도 true면 true**

\`\`\`javascript
console.log(true || true);    // true
console.log(true || false);   // true
console.log(false || true);   // true
console.log(false || false);  // false
\`\`\`

실제 사용:

\`\`\`javascript
let isWeekend = true;
let isHoliday = false;

if (isWeekend || isHoliday) {
  console.log("쉬는 날");
}
\`\`\`

## ! (NOT, 부정)

**true를 false로, false를 true로**

\`\`\`javascript
console.log(!true);   // false
console.log(!false);  // true

let isLoggedIn = false;
if (!isLoggedIn) {
  console.log("로그인이 필요합니다");
}
\`\`\`

## 복합 조건

\`\`\`javascript
let age = 25;
let isMember = true;
let hasTicket = false;

// 18세 이상이고 (회원이거나 티켓이 있으면)
if (age >= 18 && (isMember || hasTicket)) {
  console.log("입장 가능");
}
\`\`\`

## 단락 평가 (Short-circuit)

&& 와 || 는 결과가 확정되면 나머지를 평가하지 않습니다.

\`\`\`javascript
// && : 첫 번째가 false면 두 번째 안 봄
false && console.log("실행 안 됨");

// || : 첫 번째가 true면 두 번째 안 봄
true || console.log("실행 안 됨");
\`\`\``,
    runnable_examples: [
      {
        title: '&& 연산자',
        code: `let username = "admin";
let password = "1234";

let isValidUser = username === "admin";
let isValidPass = password === "1234";

console.log("아이디 맞음?", isValidUser);
console.log("비번 맞음?", isValidPass);
console.log("둘 다 맞음?", isValidUser && isValidPass);

if (isValidUser && isValidPass) {
  console.log("로그인 성공!");
}`,
        expected_output: `아이디 맞음? true
비번 맞음? true
둘 다 맞음? true
로그인 성공!`,
      },
      {
        title: '|| 연산자',
        code: `let hasCard = false;
let hasCash = false;
let hasPoints = true;

console.log("카드:", hasCard);
console.log("현금:", hasCash);
console.log("포인트:", hasPoints);

if (hasCard || hasCash || hasPoints) {
  console.log("결제 가능!");
} else {
  console.log("결제 수단 없음");
}`,
        expected_output: `카드: false
현금: false
포인트: true
결제 가능!`,
      },
      {
        title: '! 연산자',
        code: `let isLoading = true;

if (!isLoading) {
  console.log("로딩 완료!");
} else {
  console.log("로딩 중...");
}

isLoading = false;

if (!isLoading) {
  console.log("이제 로딩 완료!");
}`,
        expected_output: `로딩 중...
이제 로딩 완료!`,
      },
      {
        title: '복합 조건',
        code: `let score = 85;
let attendance = 90;
let hasBonus = false;

let pass1 = score >= 80 && attendance >= 80;
let pass2 = hasBonus;

console.log("점수/출석 기준 통과:", pass1);
console.log("보너스 있음:", pass2);
console.log("최종 통과:", pass1 || pass2);`,
        expected_output: `점수/출석 기준 통과: true
보너스 있음: false
최종 통과: true`,
      },
    ],
    keywords: ['논리', '연산자', '&&', '||', '!', 'AND', 'OR', 'NOT'],
  },

  'js-basics-ternary': {
    name: '삼항 연산자',
    description: '조건 ? 참 : 거짓',
    content: `# 삼항 연산자

## if-else를 한 줄로

삼항 연산자는 간단한 조건문을 한 줄로 작성할 수 있게 합니다.

## 기본 구조

\`\`\`javascript
조건 ? 참일때값 : 거짓일때값
\`\`\`

## if-else와 비교

\`\`\`javascript
// if-else 방식
let status;
if (age >= 18) {
  status = "성인";
} else {
  status = "미성년";
}

// 삼항 연산자 방식
let status = age >= 18 ? "성인" : "미성년";
\`\`\`

## 실제 사용 예

\`\`\`javascript
let score = 85;
let result = score >= 60 ? "합격" : "불합격";
console.log(result);  // "합격"

let hour = 14;
let greeting = hour < 12 ? "오전입니다" : "오후입니다";
console.log(greeting);  // "오후입니다"
\`\`\`

## 값 할당에 유용

\`\`\`javascript
let isMember = true;
let price = 10000;
let finalPrice = isMember ? price * 0.9 : price;
console.log(finalPrice);  // 9000 (10% 할인)
\`\`\`

## 함수 호출에도 사용

\`\`\`javascript
let isLoggedIn = true;
isLoggedIn ? showDashboard() : showLoginPage();
\`\`\`

## 중첩 사용 (권장하지 않음)

가능하지만 가독성이 떨어집니다:

\`\`\`javascript
// 읽기 어려움
let grade = score >= 90 ? "A"
          : score >= 80 ? "B"
          : score >= 70 ? "C"
          : "F";

// if-else가 더 명확
let grade;
if (score >= 90) grade = "A";
else if (score >= 80) grade = "B";
else if (score >= 70) grade = "C";
else grade = "F";
\`\`\`

## 언제 사용할까?

- **사용하기 좋은 경우**: 간단한 값 선택
- **피해야 할 경우**: 복잡한 로직, 중첩 조건`,
    runnable_examples: [
      {
        title: '기본 사용',
        code: `let temperature = 28;

let feeling = temperature >= 30 ? "더움" : "적당함";
console.log("현재 온도:", temperature);
console.log("느낌:", feeling);

// 다른 온도로 테스트
temperature = 35;
feeling = temperature >= 30 ? "더움" : "적당함";
console.log("\\n현재 온도:", temperature);
console.log("느낌:", feeling);`,
        expected_output: `현재 온도: 28
느낌: 적당함

현재 온도: 35
느낌: 더움`,
      },
      {
        title: '값 계산에 활용',
        code: `let isMember = true;
let originalPrice = 10000;

let discount = isMember ? 0.2 : 0;
let finalPrice = originalPrice * (1 - discount);

console.log("회원 여부:", isMember);
console.log("원가:", originalPrice);
console.log("할인율:", discount * 100 + "%");
console.log("최종 가격:", finalPrice);`,
        expected_output: `회원 여부: true
원가: 10000
할인율: 20%
최종 가격: 8000`,
      },
      {
        title: '문자열 조합',
        code: `let items = 5;

let message = items === 0
  ? "장바구니가 비어있습니다"
  : \`장바구니에 \${items}개 상품이 있습니다\`;

console.log(message);

items = 0;
message = items === 0
  ? "장바구니가 비어있습니다"
  : \`장바구니에 \${items}개 상품이 있습니다\`;

console.log(message);`,
        expected_output: `장바구니에 5개 상품이 있습니다
장바구니가 비어있습니다`,
      },
    ],
    keywords: ['삼항', '연산자', '조건', 'ternary', '?:', '간결'],
  },

  'js-basics-switch': {
    name: 'switch문',
    description: '여러 조건을 깔끔하게',
    content: `# switch문

## 여러 값 중 하나를 선택

특정 값에 따라 다른 코드를 실행할 때 switch를 사용합니다.
여러 if-else를 대체할 수 있습니다.

## 기본 구조

\`\`\`javascript
switch (값) {
  case 값1:
    // 값 === 값1 일 때 실행
    break;
  case 값2:
    // 값 === 값2 일 때 실행
    break;
  default:
    // 어떤 case에도 해당 안 될 때
}
\`\`\`

## break의 중요성

break가 없으면 다음 case도 실행됩니다!

\`\`\`javascript
let fruit = "사과";

switch (fruit) {
  case "사과":
    console.log("빨간색");
    // break 없음!
  case "바나나":
    console.log("노란색");  // 이것도 실행됨
    break;
}
// 출력: "빨간색", "노란색"
\`\`\`

## if-else와 비교

\`\`\`javascript
// if-else 방식
if (day === "월") {
  console.log("월요일");
} else if (day === "화") {
  console.log("화요일");
} else if (day === "수") {
  console.log("수요일");
}

// switch 방식 (더 깔끔)
switch (day) {
  case "월": console.log("월요일"); break;
  case "화": console.log("화요일"); break;
  case "수": console.log("수요일"); break;
}
\`\`\`

## 여러 case 묶기

\`\`\`javascript
switch (day) {
  case "토":
  case "일":
    console.log("주말");
    break;
  case "월":
  case "화":
  case "수":
  case "목":
  case "금":
    console.log("평일");
    break;
}
\`\`\`

## default

어떤 case에도 해당하지 않을 때 실행됩니다.

\`\`\`javascript
switch (grade) {
  case "A": console.log("우수"); break;
  case "B": console.log("양호"); break;
  default: console.log("기타");
}
\`\`\``,
    runnable_examples: [
      {
        title: '요일별 메시지',
        code: `let day = "수";

switch (day) {
  case "월":
    console.log("한 주의 시작!");
    break;
  case "화":
    console.log("화이팅!");
    break;
  case "수":
    console.log("절반 왔어요!");
    break;
  case "목":
    console.log("조금만 더!");
    break;
  case "금":
    console.log("불금!");
    break;
  default:
    console.log("주말!");
}`,
        expected_output: `절반 왔어요!`,
      },
      {
        title: '점수 등급',
        code: `let score = 85;
let grade = Math.floor(score / 10);

switch (grade) {
  case 10:
  case 9:
    console.log("A등급");
    break;
  case 8:
    console.log("B등급");
    break;
  case 7:
    console.log("C등급");
    break;
  case 6:
    console.log("D등급");
    break;
  default:
    console.log("F등급");
}

console.log("점수:", score);`,
        expected_output: `B등급
점수: 85`,
      },
      {
        title: '명령어 처리',
        code: `let command = "start";

switch (command) {
  case "start":
    console.log("시작합니다...");
    console.log("프로그램 실행 중");
    break;
  case "stop":
    console.log("중지합니다...");
    break;
  case "restart":
    console.log("재시작합니다...");
    break;
  default:
    console.log("알 수 없는 명령:", command);
}`,
        expected_output: `시작합니다...
프로그램 실행 중`,
      },
    ],
    keywords: ['switch', 'case', 'break', 'default', '조건문'],
  },

  'js-basics-nested-if': {
    name: '조건 중첩 정리',
    description: 'if 안의 if 깔끔하게 정리하기',
    content: `# 조건 중첩 정리

## 중첩 if문의 문제

if 안에 if가 계속 중첩되면 코드가 읽기 어려워집니다.

\`\`\`javascript
// 읽기 어려운 코드
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      if (user.age >= 18) {
        // 실제 로직
      }
    }
  }
}
\`\`\`

## 해결 방법 1: 조기 반환 (Early Return)

조건이 맞지 않으면 빨리 함수를 종료합니다.

\`\`\`javascript
function checkUser(user) {
  if (!user) return "유저 없음";
  if (!user.isActive) return "비활성 유저";
  if (!user.hasPermission) return "권한 없음";
  if (user.age < 18) return "미성년자";

  // 모든 조건 통과 후 실제 로직
  return "접근 허용";
}
\`\`\`

## 해결 방법 2: && 연산자 활용

\`\`\`javascript
// 중첩 대신 && 로 조합
if (user && user.isActive && user.hasPermission && user.age >= 18) {
  console.log("접근 허용");
}
\`\`\`

## 해결 방법 3: 변수로 조건 분리

\`\`\`javascript
const hasUser = user !== null;
const isActive = user && user.isActive;
const hasPermission = user && user.hasPermission;
const isAdult = user && user.age >= 18;

if (hasUser && isActive && hasPermission && isAdult) {
  console.log("접근 허용");
}
\`\`\`

## 해결 방법 4: 검증 함수 만들기

\`\`\`javascript
function canAccess(user) {
  if (!user) return false;
  if (!user.isActive) return false;
  if (!user.hasPermission) return false;
  if (user.age < 18) return false;
  return true;
}

if (canAccess(user)) {
  console.log("접근 허용");
}
\`\`\``,
    runnable_examples: [
      {
        title: '조기 반환 패턴',
        code: `function processOrder(order) {
  // 각 조건 불만족시 즉시 반환
  if (!order) {
    return "주문 정보 없음";
  }

  if (order.items.length === 0) {
    return "상품이 없습니다";
  }

  if (order.total <= 0) {
    return "금액이 올바르지 않습니다";
  }

  if (!order.address) {
    return "배송지를 입력하세요";
  }

  // 모든 검증 통과
  return "주문 처리 완료!";
}

// 테스트
console.log(processOrder(null));
console.log(processOrder({ items: [], total: 0 }));
console.log(processOrder({ items: ["A"], total: 1000, address: "서울" }));`,
        expected_output: `주문 정보 없음
상품이 없습니다
주문 처리 완료!`,
      },
      {
        title: '조건 변수 분리',
        code: `let user = {
  name: "철수",
  age: 25,
  isActive: true,
  role: "member"
};

// 각 조건을 명확한 변수로
let isAdult = user.age >= 18;
let isActive = user.isActive;
let isMember = user.role === "member" || user.role === "admin";

console.log("성인:", isAdult);
console.log("활성:", isActive);
console.log("회원:", isMember);

// 최종 조건
if (isAdult && isActive && isMember) {
  console.log("\\n모든 조건 충족!");
}`,
        expected_output: `성인: true
활성: true
회원: true

모든 조건 충족!`,
      },
      {
        title: '검증 함수 사용',
        code: `function isValidEmail(email) {
  if (!email) return false;
  if (!email.includes("@")) return false;
  if (email.length < 5) return false;
  return true;
}

function isValidPassword(password) {
  if (!password) return false;
  if (password.length < 8) return false;
  return true;
}

// 깔끔한 사용
let email = "test@email.com";
let password = "password123";

if (isValidEmail(email) && isValidPassword(password)) {
  console.log("유효한 입력입니다");
} else {
  console.log("입력을 확인하세요");
}`,
        expected_output: `유효한 입력입니다`,
      },
    ],
    keywords: ['중첩', '조건문', '리팩토링', '조기반환', '가독성'],
  },

  'js-basics-for-of': {
    name: 'for...of',
    description: '배열 요소 직접 순회',
    content: `# for...of

## 배열 요소를 직접 가져오기

\`for...of\`는 배열의 요소를 직접 순회합니다.
인덱스가 필요 없을 때 유용합니다.

## 기본 for vs for...of

\`\`\`javascript
const fruits = ["사과", "바나나", "오렌지"];

// 기본 for (인덱스 사용)
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}

// for...of (요소 직접 접근)
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

## 기본 구조

\`\`\`javascript
for (const 요소 of 배열) {
  // 각 요소에 대해 실행
}
\`\`\`

## 문자열 순회

문자열도 순회할 수 있습니다:

\`\`\`javascript
const word = "Hello";
for (const char of word) {
  console.log(char);
}
// H, e, l, l, o
\`\`\`

## 인덱스가 필요하면?

entries()를 사용합니다:

\`\`\`javascript
const fruits = ["사과", "바나나", "오렌지"];

for (const [index, fruit] of fruits.entries()) {
  console.log(\`\${index}: \${fruit}\`);
}
// 0: 사과
// 1: 바나나
// 2: 오렌지
\`\`\`

## for...of 사용 시 주의

- 배열, 문자열, Map, Set 등에 사용
- 일반 객체에는 사용 불가 (for...in 사용)

\`\`\`javascript
const obj = { a: 1, b: 2 };
// for (const x of obj) { }  // TypeError!
\`\`\``,
    runnable_examples: [
      {
        title: '배열 순회',
        code: `const colors = ["빨강", "파랑", "초록", "노랑"];

for (const color of colors) {
  console.log("색상:", color);
}`,
        expected_output: `색상: 빨강
색상: 파랑
색상: 초록
색상: 노랑`,
      },
      {
        title: '합계 구하기',
        code: `const numbers = [10, 20, 30, 40, 50];
let sum = 0;

for (const num of numbers) {
  sum += num;
}

console.log("숫자:", numbers);
console.log("합계:", sum);`,
        expected_output: `숫자: [ 10, 20, 30, 40, 50 ]
합계: 150`,
      },
      {
        title: '인덱스와 함께 순회',
        code: `const students = ["김철수", "이영희", "박민수"];

for (const [index, name] of students.entries()) {
  console.log(\`\${index + 1}번: \${name}\`);
}`,
        expected_output: `1번: 김철수
2번: 이영희
3번: 박민수`,
      },
      {
        title: '문자열 순회',
        code: `const text = "JavaScript";

let count = 0;
for (const char of text) {
  count++;
  console.log(\`\${count}번째: \${char}\`);
}`,
        expected_output: `1번째: J
2번째: a
3번째: v
4번째: a
5번째: S
6번째: c
7번째: r
8번째: i
9번째: p
10번째: t`,
      },
    ],
    keywords: ['for...of', '순회', '반복', '배열', '요소'],
  },

  'js-basics-for-in': {
    name: 'for...in',
    description: '객체 키 순회',
    content: `# for...in

## 객체의 키를 순회하기

\`for...in\`은 객체의 속성(키)을 순회합니다.

## 기본 구조

\`\`\`javascript
for (const 키 in 객체) {
  // 각 키에 대해 실행
}
\`\`\`

## 객체 순회 예시

\`\`\`javascript
const person = {
  name: "철수",
  age: 25,
  city: "서울"
};

for (const key in person) {
  console.log(key + ":", person[key]);
}
// name: 철수
// age: 25
// city: 서울
\`\`\`

## 배열에는 사용하지 마세요

배열에 for...in을 사용하면 문제가 생길 수 있습니다:

\`\`\`javascript
const arr = ["a", "b", "c"];

// 권장하지 않음 - 인덱스가 문자열로 나옴
for (const i in arr) {
  console.log(typeof i);  // "string"
}

// 배열은 for...of 사용
for (const item of arr) {
  console.log(item);
}
\`\`\`

## for...of vs for...in

| for...of | for...in |
|----------|----------|
| 값(요소) 순회 | 키(속성) 순회 |
| 배열, 문자열 | 객체 |
| 순서 보장 | 순서 보장 안 됨 |

## 객체의 키와 값 가져오기

\`\`\`javascript
const scores = { math: 90, english: 85, science: 92 };

// 방법 1: for...in
for (const subject in scores) {
  console.log(subject, scores[subject]);
}

// 방법 2: Object.entries() + for...of
for (const [key, value] of Object.entries(scores)) {
  console.log(key, value);
}
\`\`\``,
    runnable_examples: [
      {
        title: '객체 순회',
        code: `const car = {
  brand: "현대",
  model: "소나타",
  year: 2024,
  color: "검정"
};

for (const key in car) {
  console.log(key + ":", car[key]);
}`,
        expected_output: `brand: 현대
model: 소나타
year: 2024
color: 검정`,
      },
      {
        title: '점수 계산',
        code: `const scores = {
  korean: 90,
  english: 85,
  math: 95
};

let total = 0;
let count = 0;

for (const subject in scores) {
  console.log(subject + ":", scores[subject]);
  total += scores[subject];
  count++;
}

console.log("\\n총점:", total);
console.log("평균:", total / count);`,
        expected_output: `korean: 90
english: 85
math: 95

총점: 270
평균: 90`,
      },
      {
        title: 'Object.entries 사용',
        code: `const user = {
  name: "홍길동",
  email: "hong@email.com",
  age: 30
};

// Object.entries()는 [키, 값] 쌍의 배열 반환
for (const [key, value] of Object.entries(user)) {
  console.log(\`\${key} => \${value}\`);
}`,
        expected_output: `name => 홍길동
email => hong@email.com
age => 30`,
      },
    ],
    keywords: ['for...in', '객체', '키', '순회', '속성'],
  },

  'js-basics-foreach': {
    name: 'forEach',
    description: '배열 메서드로 순회',
    content: `# forEach

## 배열 메서드로 순회하기

\`forEach\`는 배열의 각 요소에 대해 함수를 실행합니다.

## 기본 구조

\`\`\`javascript
배열.forEach(function(요소, 인덱스, 배열) {
  // 각 요소에 대해 실행
});
\`\`\`

## 간단한 예시

\`\`\`javascript
const fruits = ["사과", "바나나", "오렌지"];

fruits.forEach(function(fruit) {
  console.log(fruit);
});

// 화살표 함수로 더 간단하게
fruits.forEach(fruit => console.log(fruit));
\`\`\`

## 인덱스 사용하기

\`\`\`javascript
const items = ["A", "B", "C"];

items.forEach((item, index) => {
  console.log(\`\${index}: \${item}\`);
});
// 0: A
// 1: B
// 2: C
\`\`\`

## for문과 비교

\`\`\`javascript
const numbers = [1, 2, 3];

// for문
for (let i = 0; i < numbers.length; i++) {
  console.log(numbers[i]);
}

// forEach
numbers.forEach(num => console.log(num));
\`\`\`

## forEach의 특징

1. **return으로 중단 불가** - 모든 요소를 순회함
2. **break/continue 사용 불가**
3. 반환값 없음 (undefined)

\`\`\`javascript
// 중간에 멈추고 싶다면 for...of + break 사용
const numbers = [1, 2, 3, 4, 5];

for (const num of numbers) {
  if (num === 3) break;
  console.log(num);
}
// 1, 2
\`\`\`

## 언제 사용할까?

- 모든 요소를 순회해야 할 때
- 간단한 작업을 할 때
- 코드를 짧게 쓰고 싶을 때`,
    runnable_examples: [
      {
        title: 'forEach 기본',
        code: `const colors = ["빨강", "파랑", "초록"];

colors.forEach(color => {
  console.log("색상:", color);
});`,
        expected_output: `색상: 빨강
색상: 파랑
색상: 초록`,
      },
      {
        title: '인덱스 활용',
        code: `const students = ["김철수", "이영희", "박민수"];

students.forEach((student, index) => {
  console.log(\`\${index + 1}번 학생: \${student}\`);
});`,
        expected_output: `1번 학생: 김철수
2번 학생: 이영희
3번 학생: 박민수`,
      },
      {
        title: '합계 계산',
        code: `const prices = [1000, 2000, 3000, 4000];
let total = 0;

prices.forEach(price => {
  total += price;
});

console.log("가격 목록:", prices);
console.log("총합:", total);`,
        expected_output: `가격 목록: [ 1000, 2000, 3000, 4000 ]
총합: 10000`,
      },
      {
        title: '객체 배열 순회',
        code: `const users = [
  { name: "철수", age: 20 },
  { name: "영희", age: 25 },
  { name: "민수", age: 30 }
];

users.forEach(user => {
  console.log(\`\${user.name}: \${user.age}살\`);
});`,
        expected_output: `철수: 20살
영희: 25살
민수: 30살`,
      },
    ],
    keywords: ['forEach', '배열', '순회', '메서드', '콜백'],
  },

  'js-basics-arrow': {
    name: '화살표 함수',
    description: '() => {} 간결한 문법',
    content: `# 화살표 함수

## 간결한 함수 표현

화살표 함수(Arrow Function)는 함수를 더 짧게 작성하는 문법입니다.

## 기본 문법

\`\`\`javascript
// 기존 함수
const add = function(a, b) {
  return a + b;
};

// 화살표 함수
const add = (a, b) => {
  return a + b;
};

// 더 간단하게 (한 줄이면 return 생략)
const add = (a, b) => a + b;
\`\`\`

## 매개변수에 따른 형태

\`\`\`javascript
// 매개변수 없음
const sayHi = () => console.log("Hi");

// 매개변수 1개 - 괄호 생략 가능
const double = x => x * 2;

// 매개변수 2개 이상 - 괄호 필수
const add = (a, b) => a + b;
\`\`\`

## 본문에 따른 형태

\`\`\`javascript
// 한 줄 - return 생략 가능
const square = x => x * x;

// 여러 줄 - 중괄호와 return 필요
const calculate = (a, b) => {
  const sum = a + b;
  const product = a * b;
  return { sum, product };
};
\`\`\`

## 객체 반환하기

객체를 바로 반환할 때는 괄호로 감싸야 합니다:

\`\`\`javascript
// 잘못된 예 - 중괄호가 함수 본문으로 해석됨
const getObj = () => { name: "철수" };  // undefined

// 올바른 예 - 괄호로 감싸기
const getObj = () => ({ name: "철수" });
\`\`\`

## 콜백 함수로 활용

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// 기존 방식
numbers.forEach(function(n) {
  console.log(n);
});

// 화살표 함수
numbers.forEach(n => console.log(n));

// map과 함께
const doubled = numbers.map(n => n * 2);
\`\`\`

## 화살표 함수의 this

화살표 함수는 자신만의 this를 가지지 않습니다.
(중급 내용에서 자세히 다룹니다)`,
    runnable_examples: [
      {
        title: '기본 화살표 함수',
        code: `// 일반 함수
const add1 = function(a, b) {
  return a + b;
};

// 화살표 함수
const add2 = (a, b) => a + b;

console.log("일반:", add1(3, 5));
console.log("화살표:", add2(3, 5));`,
        expected_output: `일반: 8
화살표: 8`,
      },
      {
        title: '다양한 형태',
        code: `// 매개변수 없음
const greet = () => "안녕하세요!";

// 매개변수 1개
const double = x => x * 2;

// 매개변수 2개
const multiply = (a, b) => a * b;

console.log(greet());
console.log(double(5));
console.log(multiply(3, 4));`,
        expected_output: `안녕하세요!
10
12`,
      },
      {
        title: '배열 메서드와 함께',
        code: `const numbers = [1, 2, 3, 4, 5];

// 각 요소 2배
const doubled = numbers.map(n => n * 2);
console.log("2배:", doubled);

// 짝수만 필터
const evens = numbers.filter(n => n % 2 === 0);
console.log("짝수:", evens);

// 합계
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("합계:", sum);`,
        expected_output: `2배: [ 2, 4, 6, 8, 10 ]
짝수: [ 2, 4 ]
합계: 15`,
      },
      {
        title: '객체 반환',
        code: `const createUser = (name, age) => ({
  name: name,
  age: age,
  isAdult: age >= 18
});

const user1 = createUser("철수", 25);
const user2 = createUser("영희", 16);

console.log(user1);
console.log(user2);`,
        expected_output: `{ name: '철수', age: 25, isAdult: true }
{ name: '영희', age: 16, isAdult: false }`,
      },
    ],
    keywords: ['화살표', 'arrow', '=>', '함수', '람다', '간결'],
  },

  'js-basics-callback': {
    name: '콜백 함수',
    description: '함수를 인자로 전달',
    content: `# 콜백 함수

## 함수를 인자로 전달하기

콜백(Callback)은 다른 함수에 인자로 전달되는 함수입니다.
"나중에 호출해줘"라는 의미입니다.

## 기본 개념

\`\`\`javascript
function greeting(name) {
  console.log("안녕, " + name);
}

function processUser(callback) {
  const userName = "철수";
  callback(userName);  // 전달받은 함수 호출
}

processUser(greeting);  // greeting을 콜백으로 전달
// "안녕, 철수"
\`\`\`

## 배열 메서드의 콜백

\`\`\`javascript
const numbers = [1, 2, 3];

// forEach에 콜백 전달
numbers.forEach(function(num) {
  console.log(num);
});

// 화살표 함수로 더 간단하게
numbers.forEach(num => console.log(num));
\`\`\`

## 콜백의 장점

1. **코드 재사용**: 같은 로직에 다른 동작 적용
2. **비동기 처리**: 작업 완료 후 실행할 코드 지정
3. **이벤트 처리**: 이벤트 발생 시 실행할 코드 지정

## 실제 사용 예시

\`\`\`javascript
// 배열 처리 함수
function processArray(arr, callback) {
  const result = [];
  for (const item of arr) {
    result.push(callback(item));
  }
  return result;
}

// 다양한 콜백 사용
const numbers = [1, 2, 3, 4, 5];

const doubled = processArray(numbers, x => x * 2);
const squared = processArray(numbers, x => x * x);

console.log(doubled);  // [2, 4, 6, 8, 10]
console.log(squared);  // [1, 4, 9, 16, 25]
\`\`\`

## 자주 쓰는 콜백 패턴

\`\`\`javascript
// 정렬 콜백
const scores = [5, 3, 8, 1];
scores.sort((a, b) => a - b);  // 오름차순

// 필터 콜백
const adults = users.filter(user => user.age >= 18);

// 타이머 콜백
setTimeout(() => {
  console.log("1초 후 실행");
}, 1000);
\`\`\``,
    runnable_examples: [
      {
        title: '콜백 기본',
        code: `function doSomething(callback) {
  console.log("작업 시작");
  callback();
  console.log("작업 완료");
}

doSomething(() => {
  console.log("콜백 실행 중!");
});`,
        expected_output: `작업 시작
콜백 실행 중!
작업 완료`,
      },
      {
        title: '매개변수가 있는 콜백',
        code: `function calculate(a, b, operation) {
  return operation(a, b);
}

const add = (x, y) => x + y;
const multiply = (x, y) => x * y;
const subtract = (x, y) => x - y;

console.log("덧셈:", calculate(10, 5, add));
console.log("곱셈:", calculate(10, 5, multiply));
console.log("뺄셈:", calculate(10, 5, subtract));`,
        expected_output: `덧셈: 15
곱셈: 50
뺄셈: 5`,
      },
      {
        title: '배열 처리 콜백',
        code: `const numbers = [1, 2, 3, 4, 5];

// map 콜백
const doubled = numbers.map(n => n * 2);
console.log("2배:", doubled);

// filter 콜백
const big = numbers.filter(n => n > 2);
console.log("2보다 큰:", big);

// find 콜백
const found = numbers.find(n => n > 3);
console.log("처음 3보다 큰:", found);`,
        expected_output: `2배: [ 2, 4, 6, 8, 10 ]
2보다 큰: [ 3, 4, 5 ]
처음 3보다 큰: 4`,
      },
      {
        title: '정렬 콜백',
        code: `const items = [
  { name: "바나나", price: 1500 },
  { name: "사과", price: 2000 },
  { name: "오렌지", price: 1000 }
];

// 가격 오름차순 정렬
items.sort((a, b) => a.price - b.price);

console.log("가격순 정렬:");
items.forEach(item => {
  console.log(\`\${item.name}: \${item.price}원\`);
});`,
        expected_output: `가격순 정렬:
오렌지: 1000원
바나나: 1500원
사과: 2000원`,
      },
    ],
    keywords: ['콜백', 'callback', '함수', '인자', '고차함수'],
  },

  'js-basics-default-params': {
    name: '기본 매개변수',
    description: 'function(a = 10)',
    content: `# 기본 매개변수

## 매개변수 기본값 설정

함수 호출 시 인자를 전달하지 않으면 기본값이 사용됩니다.

## 기본 문법

\`\`\`javascript
function greet(name = "손님") {
  console.log("안녕하세요, " + name + "님!");
}

greet("철수");  // "안녕하세요, 철수님!"
greet();        // "안녕하세요, 손님님!"
\`\`\`

## ES6 이전 방식

\`\`\`javascript
// 예전 방식 (더 이상 권장하지 않음)
function greet(name) {
  name = name || "손님";
  console.log("안녕하세요, " + name);
}
\`\`\`

## 여러 매개변수

\`\`\`javascript
function createUser(name, age = 0, city = "미정") {
  return { name, age, city };
}

createUser("철수", 25, "서울");  // 모두 지정
createUser("영희", 20);          // city는 "미정"
createUser("민수");              // age는 0, city는 "미정"
\`\`\`

## 기본값으로 표현식 사용

\`\`\`javascript
function getDate(date = new Date()) {
  return date.toLocaleDateString();
}

function multiply(a, b = a * 2) {
  return a * b;
}

console.log(multiply(5));     // 5 * 10 = 50
console.log(multiply(5, 3));  // 5 * 3 = 15
\`\`\`

## undefined vs null

기본값은 undefined일 때만 적용됩니다:

\`\`\`javascript
function test(value = "기본값") {
  console.log(value);
}

test();           // "기본값"
test(undefined);  // "기본값"
test(null);       // null (null은 명시적 값)
test("");         // "" (빈 문자열도 값)
test(0);          // 0 (0도 값)
\`\`\`

## 필수 매개변수와 선택 매개변수

\`\`\`javascript
// 선택 매개변수는 뒤에 배치
function createPost(title, content, author = "익명") {
  return { title, content, author };
}
\`\`\``,
    runnable_examples: [
      {
        title: '기본 매개변수 사용',
        code: `function greet(name = "손님", greeting = "안녕하세요") {
  console.log(\`\${greeting}, \${name}님!\`);
}

greet("철수", "반갑습니다");
greet("영희");
greet();`,
        expected_output: `반갑습니다, 철수님!
안녕하세요, 영희님!
안녕하세요, 손님님!`,
      },
      {
        title: '객체 생성 함수',
        code: `function createProduct(name, price, stock = 0, active = true) {
  return {
    name,
    price,
    stock,
    active
  };
}

const p1 = createProduct("노트북", 1000000, 10, true);
const p2 = createProduct("마우스", 30000, 50);
const p3 = createProduct("키보드", 50000);

console.log(p1);
console.log(p2);
console.log(p3);`,
        expected_output: `{ name: '노트북', price: 1000000, stock: 10, active: true }
{ name: '마우스', price: 30000, stock: 50, active: true }
{ name: '키보드', price: 50000, stock: 0, active: true }`,
      },
      {
        title: '표현식 기본값',
        code: `function createId(prefix = "ID", number = Date.now()) {
  return \`\${prefix}_\${number}\`;
}

// 실행할 때마다 number가 달라질 수 있음
const id1 = createId("USER", 1001);
const id2 = createId("ORDER");
const id3 = createId();

console.log(id1);
console.log(id2.startsWith("ORDER_"));
console.log(id3.startsWith("ID_"));`,
        expected_output: `USER_1001
true
true`,
      },
    ],
    keywords: ['기본값', 'default', '매개변수', '파라미터', '선택적'],
  },

  'js-basics-map': {
    name: 'map',
    description: '배열 변환, 새 배열 반환',
    content: `# map

## 배열의 각 요소를 변환

\`map\`은 배열의 모든 요소에 함수를 적용하여 **새 배열을 반환**합니다.
원본 배열은 변하지 않습니다.

## 기본 문법

\`\`\`javascript
const 새배열 = 원본배열.map(요소 => 변환된값);
\`\`\`

## 간단한 예시

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

console.log(doubled);  // [2, 4, 6, 8, 10]
console.log(numbers);  // [1, 2, 3, 4, 5] (원본 유지)
\`\`\`

## 객체 배열 변환

\`\`\`javascript
const users = [
  { name: "철수", age: 25 },
  { name: "영희", age: 30 }
];

// 이름만 추출
const names = users.map(user => user.name);
console.log(names);  // ["철수", "영희"]

// 형식 변경
const formatted = users.map(user => \`\${user.name}(\${user.age})\`);
console.log(formatted);  // ["철수(25)", "영희(30)"]
\`\`\`

## 인덱스 사용

\`\`\`javascript
const items = ["a", "b", "c"];
const indexed = items.map((item, index) => \`\${index}: \${item}\`);
console.log(indexed);  // ["0: a", "1: b", "2: c"]
\`\`\`

## for문과 비교

\`\`\`javascript
const numbers = [1, 2, 3];

// for문
const result1 = [];
for (const n of numbers) {
  result1.push(n * 2);
}

// map (더 간결)
const result2 = numbers.map(n => n * 2);
\`\`\`

## 체이닝

map을 연속으로 사용할 수 있습니다:

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];
const result = numbers
  .map(n => n * 2)      // [2, 4, 6, 8, 10]
  .map(n => n + 1);     // [3, 5, 7, 9, 11]
\`\`\``,
    runnable_examples: [
      {
        title: '숫자 변환',
        code: `const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2);
const squared = numbers.map(n => n * n);
const negative = numbers.map(n => -n);

console.log("원본:", numbers);
console.log("2배:", doubled);
console.log("제곱:", squared);
console.log("음수:", negative);`,
        expected_output: `원본: [ 1, 2, 3, 4, 5 ]
2배: [ 2, 4, 6, 8, 10 ]
제곱: [ 1, 4, 9, 16, 25 ]
음수: [ -1, -2, -3, -4, -5 ]`,
      },
      {
        title: '객체 배열 변환',
        code: `const products = [
  { name: "사과", price: 1000 },
  { name: "바나나", price: 1500 },
  { name: "오렌지", price: 2000 }
];

// 이름만 추출
const names = products.map(p => p.name);
console.log("이름들:", names);

// 10% 할인 적용
const discounted = products.map(p => ({
  name: p.name,
  price: p.price * 0.9
}));
console.log("할인 후:", discounted);`,
        expected_output: `이름들: [ '사과', '바나나', '오렌지' ]
할인 후: [ { name: '사과', price: 900 }, { name: '바나나', price: 1350 }, { name: '오렌지', price: 1800 } ]`,
      },
      {
        title: '문자열 변환',
        code: `const words = ["hello", "world", "javascript"];

const upper = words.map(w => w.toUpperCase());
const lengths = words.map(w => w.length);
const first = words.map(w => w[0]);

console.log("대문자:", upper);
console.log("길이:", lengths);
console.log("첫 글자:", first);`,
        expected_output: `대문자: [ 'HELLO', 'WORLD', 'JAVASCRIPT' ]
길이: [ 5, 5, 10 ]
첫 글자: [ 'h', 'w', 'j' ]`,
      },
      {
        title: '인덱스 활용',
        code: `const items = ["A", "B", "C", "D"];

const numbered = items.map((item, index) => ({
  id: index + 1,
  value: item
}));

console.log(numbered);`,
        expected_output: `[ { id: 1, value: 'A' }, { id: 2, value: 'B' }, { id: 3, value: 'C' }, { id: 4, value: 'D' } ]`,
      },
    ],
    keywords: ['map', '배열', '변환', '매핑', '새배열'],
  },

  'js-basics-filter': {
    name: 'filter',
    description: '조건에 맞는 요소만 걸러내기',
    content: `# filter

## 조건에 맞는 요소만 선택

\`filter\`는 조건을 만족하는 요소들만 모아서 **새 배열을 반환**합니다.
원본 배열은 변하지 않습니다.

## 기본 문법

\`\`\`javascript
const 새배열 = 원본배열.filter(요소 => 조건);
\`\`\`

조건이 true인 요소만 새 배열에 포함됩니다.

## 간단한 예시

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);  // [2, 4, 6, 8, 10]

const bigNumbers = numbers.filter(n => n > 5);
console.log(bigNumbers);  // [6, 7, 8, 9, 10]
\`\`\`

## 객체 배열 필터링

\`\`\`javascript
const users = [
  { name: "철수", age: 25, active: true },
  { name: "영희", age: 17, active: true },
  { name: "민수", age: 30, active: false }
];

// 성인만 필터
const adults = users.filter(user => user.age >= 18);

// 활성 사용자만 필터
const activeUsers = users.filter(user => user.active);
\`\`\`

## 문자열 필터링

\`\`\`javascript
const words = ["apple", "banana", "avocado", "cherry"];

const startsWithA = words.filter(w => w.startsWith("a"));
console.log(startsWithA);  // ["apple", "avocado"]

const longWords = words.filter(w => w.length > 5);
console.log(longWords);  // ["banana", "avocado", "cherry"]
\`\`\`

## filter + map 조합

\`\`\`javascript
const users = [
  { name: "철수", age: 25 },
  { name: "영희", age: 17 },
  { name: "민수", age: 30 }
];

// 성인의 이름만 추출
const adultNames = users
  .filter(user => user.age >= 18)
  .map(user => user.name);

console.log(adultNames);  // ["철수", "민수"]
\`\`\``,
    runnable_examples: [
      {
        title: '숫자 필터링',
        code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = numbers.filter(n => n % 2 === 0);
const odds = numbers.filter(n => n % 2 !== 0);
const big = numbers.filter(n => n > 5);

console.log("원본:", numbers);
console.log("짝수:", evens);
console.log("홀수:", odds);
console.log("5 초과:", big);`,
        expected_output: `원본: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
짝수: [ 2, 4, 6, 8, 10 ]
홀수: [ 1, 3, 5, 7, 9 ]
5 초과: [ 6, 7, 8, 9, 10 ]`,
      },
      {
        title: '객체 배열 필터링',
        code: `const products = [
  { name: "노트북", price: 1000000, inStock: true },
  { name: "마우스", price: 30000, inStock: false },
  { name: "키보드", price: 80000, inStock: true },
  { name: "모니터", price: 300000, inStock: true }
];

// 재고 있는 상품만
const available = products.filter(p => p.inStock);
console.log("재고 있음:", available.map(p => p.name));

// 10만원 이하 상품만
const cheap = products.filter(p => p.price <= 100000);
console.log("10만원 이하:", cheap.map(p => p.name));`,
        expected_output: `재고 있음: [ '노트북', '키보드', '모니터' ]
10만원 이하: [ '마우스', '키보드' ]`,
      },
      {
        title: 'filter + map 조합',
        code: `const students = [
  { name: "김철수", score: 85, passed: true },
  { name: "이영희", score: 92, passed: true },
  { name: "박민수", score: 55, passed: false },
  { name: "최지영", score: 78, passed: true }
];

// 합격자의 이름과 점수
const passedInfo = students
  .filter(s => s.passed)
  .map(s => \`\${s.name}: \${s.score}점\`);

console.log("합격자:");
passedInfo.forEach(info => console.log("  " + info));`,
        expected_output: `합격자:
  김철수: 85점
  이영희: 92점
  최지영: 78점`,
      },
      {
        title: '검색 기능',
        code: `const items = ["apple", "banana", "orange", "grape", "avocado"];

function search(arr, keyword) {
  return arr.filter(item =>
    item.toLowerCase().includes(keyword.toLowerCase())
  );
}

console.log("'an' 검색:", search(items, "an"));
console.log("'a' 검색:", search(items, "a"));
console.log("'gr' 검색:", search(items, "gr"));`,
        expected_output: `'an' 검색: [ 'banana', 'orange' ]
'a' 검색: [ 'apple', 'banana', 'orange', 'grape', 'avocado' ]
'gr' 검색: [ 'grape' ]`,
      },
    ],
    keywords: ['filter', '배열', '필터', '조건', '걸러내기'],
  },

  'js-basics-find': {
    name: 'find / findIndex',
    description: '요소 찾기',
    content: `# find / findIndex

## 조건에 맞는 첫 번째 요소 찾기

- \`find\`: 조건에 맞는 첫 번째 **요소**를 반환
- \`findIndex\`: 조건에 맞는 첫 번째 **인덱스**를 반환

## find 기본 사용법

\`\`\`javascript
const numbers = [1, 5, 10, 15, 20];

const found = numbers.find(n => n > 8);
console.log(found);  // 10 (첫 번째로 8보다 큰 값)

const notFound = numbers.find(n => n > 100);
console.log(notFound);  // undefined
\`\`\`

## findIndex 기본 사용법

\`\`\`javascript
const numbers = [1, 5, 10, 15, 20];

const index = numbers.findIndex(n => n > 8);
console.log(index);  // 2 (10의 인덱스)

const noIndex = numbers.findIndex(n => n > 100);
console.log(noIndex);  // -1 (못 찾음)
\`\`\`

## 객체 배열에서 찾기

\`\`\`javascript
const users = [
  { id: 1, name: "철수" },
  { id: 2, name: "영희" },
  { id: 3, name: "민수" }
];

// id로 사용자 찾기
const user = users.find(u => u.id === 2);
console.log(user);  // { id: 2, name: "영희" }

// 이름으로 인덱스 찾기
const index = users.findIndex(u => u.name === "민수");
console.log(index);  // 2
\`\`\`

## filter와의 차이

\`\`\`javascript
const numbers = [1, 5, 10, 15, 20];

// find: 첫 번째 하나만 반환
const first = numbers.find(n => n > 8);
console.log(first);  // 10

// filter: 모든 일치 항목 반환
const all = numbers.filter(n => n > 8);
console.log(all);  // [10, 15, 20]
\`\`\`

## 실용적인 예시

\`\`\`javascript
const cart = [
  { id: 1, product: "노트북", quantity: 1 },
  { id: 2, product: "마우스", quantity: 2 }
];

// 상품 찾기
function findProduct(productName) {
  return cart.find(item => item.product === productName);
}

// 상품 수량 변경
function updateQuantity(productName, newQty) {
  const item = findProduct(productName);
  if (item) {
    item.quantity = newQty;
  }
}
\`\`\``,
    runnable_examples: [
      {
        title: 'find 기본',
        code: `const numbers = [3, 7, 12, 5, 18, 9];

const firstBig = numbers.find(n => n > 10);
const firstEven = numbers.find(n => n % 2 === 0);
const notFound = numbers.find(n => n > 100);

console.log("10 초과 첫 번째:", firstBig);
console.log("첫 번째 짝수:", firstEven);
console.log("100 초과 (없음):", notFound);`,
        expected_output: `10 초과 첫 번째: 12
첫 번째 짝수: 12
100 초과 (없음): undefined`,
      },
      {
        title: 'findIndex 기본',
        code: `const fruits = ["사과", "바나나", "오렌지", "포도"];

const bananaIndex = fruits.findIndex(f => f === "바나나");
const orangeIndex = fruits.findIndex(f => f === "오렌지");
const mangoIndex = fruits.findIndex(f => f === "망고");

console.log("바나나 위치:", bananaIndex);
console.log("오렌지 위치:", orangeIndex);
console.log("망고 위치:", mangoIndex);`,
        expected_output: `바나나 위치: 1
오렌지 위치: 2
망고 위치: -1`,
      },
      {
        title: '객체 배열에서 검색',
        code: `const users = [
  { id: 101, name: "김철수", role: "admin" },
  { id: 102, name: "이영희", role: "user" },
  { id: 103, name: "박민수", role: "user" }
];

// ID로 찾기
const user = users.find(u => u.id === 102);
console.log("ID 102:", user);

// 역할로 찾기
const admin = users.find(u => u.role === "admin");
console.log("관리자:", admin.name);`,
        expected_output: `ID 102: { id: 102, name: '이영희', role: 'user' }
관리자: 김철수`,
      },
      {
        title: 'filter vs find',
        code: `const scores = [65, 80, 92, 45, 88, 73];

// find: 첫 번째 80점 이상
const firstPass = scores.find(s => s >= 80);
console.log("첫 번째 80점 이상:", firstPass);

// filter: 모든 80점 이상
const allPass = scores.filter(s => s >= 80);
console.log("모든 80점 이상:", allPass);`,
        expected_output: `첫 번째 80점 이상: 80
모든 80점 이상: [ 80, 92, 88 ]`,
      },
    ],
    keywords: ['find', 'findIndex', '배열', '검색', '찾기'],
  },

  'js-basics-methods': {
    name: '메서드',
    description: '객체 안의 함수',
    content: `# 메서드

## 객체 안의 함수

메서드는 객체의 속성으로 저장된 함수입니다.
객체의 동작을 정의합니다.

## 기본 문법

\`\`\`javascript
const person = {
  name: "철수",
  greet: function() {
    console.log("안녕하세요!");
  }
};

person.greet();  // "안녕하세요!"
\`\`\`

## 축약 문법

ES6부터 function 키워드를 생략할 수 있습니다:

\`\`\`javascript
const person = {
  name: "철수",
  // 축약 문법
  greet() {
    console.log("안녕하세요!");
  },
  // 기존 문법
  sayBye: function() {
    console.log("안녕히 가세요!");
  }
};
\`\`\`

## this로 자기 자신 참조

메서드에서 \`this\`는 해당 객체를 가리킵니다:

\`\`\`javascript
const person = {
  name: "철수",
  greet() {
    console.log("안녕, 나는 " + this.name + "야!");
  }
};

person.greet();  // "안녕, 나는 철수야!"
\`\`\`

## 계산기 예시

\`\`\`javascript
const calculator = {
  result: 0,

  add(value) {
    this.result += value;
    return this;  // 체이닝 가능
  },

  subtract(value) {
    this.result -= value;
    return this;
  },

  getResult() {
    return this.result;
  }
};

calculator.add(10).add(5).subtract(3);
console.log(calculator.getResult());  // 12
\`\`\`

## 내장 객체의 메서드

JavaScript 내장 객체도 메서드를 가집니다:

\`\`\`javascript
const text = "Hello World";
console.log(text.toUpperCase());  // 문자열 메서드
console.log(text.split(" "));     // 문자열 메서드

const arr = [1, 2, 3];
console.log(arr.join("-"));       // 배열 메서드
\`\`\``,
    runnable_examples: [
      {
        title: '기본 메서드',
        code: `const dog = {
  name: "멍멍이",
  breed: "진돗개",

  bark() {
    console.log("멍멍!");
  },

  introduce() {
    console.log("저는 " + this.name + "입니다.");
    console.log("품종: " + this.breed);
  }
};

dog.bark();
dog.introduce();`,
        expected_output: `멍멍!
저는 멍멍이입니다.
품종: 진돗개`,
      },
      {
        title: '계산 메서드',
        code: `const counter = {
  count: 0,

  increment() {
    this.count++;
    console.log("증가:", this.count);
  },

  decrement() {
    this.count--;
    console.log("감소:", this.count);
  },

  reset() {
    this.count = 0;
    console.log("리셋:", this.count);
  }
};

counter.increment();
counter.increment();
counter.increment();
counter.decrement();
counter.reset();`,
        expected_output: `증가: 1
증가: 2
증가: 3
감소: 2
리셋: 0`,
      },
      {
        title: '메서드 체이닝',
        code: `const builder = {
  text: "",

  add(str) {
    this.text += str;
    return this;  // this를 반환하면 체이닝 가능
  },

  addSpace() {
    this.text += " ";
    return this;
  },

  build() {
    return this.text;
  }
};

const result = builder
  .add("Hello")
  .addSpace()
  .add("World")
  .add("!")
  .build();

console.log(result);`,
        expected_output: `Hello World!`,
      },
      {
        title: '실용 예제 - 사용자 객체',
        code: `const user = {
  firstName: "길동",
  lastName: "홍",
  age: 30,

  getFullName() {
    return this.lastName + this.firstName;
  },

  isAdult() {
    return this.age >= 18;
  },

  celebrateBirthday() {
    this.age++;
    console.log("생일 축하합니다! 이제 " + this.age + "살입니다.");
  }
};

console.log("이름:", user.getFullName());
console.log("성인:", user.isAdult());
user.celebrateBirthday();`,
        expected_output: `이름: 홍길동
성인: true
생일 축하합니다! 이제 31살입니다.`,
      },
    ],
    keywords: ['메서드', 'method', '객체', 'this', '함수'],
  },

  'js-basics-this': {
    name: 'this 기본',
    description: '나 자신을 가리킴',
    content: `# this 기본

## this란?

\`this\`는 **현재 실행 컨텍스트의 객체**를 가리킵니다.
간단히 말해, "나 자신"을 의미합니다.

## 객체 메서드에서의 this

메서드 안에서 this는 그 메서드를 가진 객체입니다:

\`\`\`javascript
const person = {
  name: "철수",
  greet() {
    console.log("안녕, 나는 " + this.name);
    // this = person 객체
  }
};

person.greet();  // "안녕, 나는 철수"
\`\`\`

## this가 필요한 이유

\`\`\`javascript
const user1 = {
  name: "철수",
  sayHi() {
    console.log("안녕, " + this.name);  // this로 자기 속성 접근
  }
};

const user2 = {
  name: "영희",
  sayHi() {
    console.log("안녕, " + this.name);
  }
};

user1.sayHi();  // "안녕, 철수"
user2.sayHi();  // "안녕, 영희"
\`\`\`

## 일반 함수에서의 this

일반 함수에서 this는 전역 객체(브라우저에서는 window):

\`\`\`javascript
function showThis() {
  console.log(this);  // 전역 객체 또는 undefined (strict mode)
}
\`\`\`

## 화살표 함수와 this

**중요**: 화살표 함수는 자신만의 this를 갖지 않습니다.
바깥 스코프의 this를 사용합니다.

\`\`\`javascript
const person = {
  name: "철수",

  // 일반 함수 - this는 person
  greetNormal() {
    console.log("일반: " + this.name);
  },

  // 화살표 함수 - this가 person이 아님!
  greetArrow: () => {
    console.log("화살표: " + this.name);  // undefined
  }
};
\`\`\`

## this 규칙 정리

1. **메서드 호출**: this = 메서드를 가진 객체
2. **일반 함수 호출**: this = 전역 객체 (strict mode에서는 undefined)
3. **화살표 함수**: this = 바깥 스코프의 this`,
    runnable_examples: [
      {
        title: 'this 기본 동작',
        code: `const car = {
  brand: "현대",
  model: "소나타",

  getInfo() {
    return this.brand + " " + this.model;
  },

  drive() {
    console.log(this.getInfo() + "가 달립니다!");
  }
};

console.log(car.getInfo());
car.drive();`,
        expected_output: `현대 소나타
현대 소나타가 달립니다!`,
      },
      {
        title: '여러 객체에서 this',
        code: `function createPerson(name, age) {
  return {
    name: name,
    age: age,
    introduce() {
      console.log(\`저는 \${this.name}이고, \${this.age}살입니다.\`);
    }
  };
}

const person1 = createPerson("철수", 25);
const person2 = createPerson("영희", 30);

person1.introduce();
person2.introduce();`,
        expected_output: `저는 철수이고, 25살입니다.
저는 영희이고, 30살입니다.`,
      },
      {
        title: 'this로 속성 수정',
        code: `const account = {
  balance: 10000,

  deposit(amount) {
    this.balance += amount;
    console.log(\`입금: \${amount}원, 잔액: \${this.balance}원\`);
  },

  withdraw(amount) {
    if (amount > this.balance) {
      console.log("잔액이 부족합니다.");
      return;
    }
    this.balance -= amount;
    console.log(\`출금: \${amount}원, 잔액: \${this.balance}원\`);
  }
};

account.deposit(5000);
account.withdraw(3000);
account.withdraw(20000);`,
        expected_output: `입금: 5000원, 잔액: 15000원
출금: 3000원, 잔액: 12000원
잔액이 부족합니다.`,
      },
    ],
    keywords: ['this', '객체', '메서드', '컨텍스트', '참조'],
  },

  'js-basics-destructuring': {
    name: '구조분해 할당',
    description: 'const { name } = person',
    content: `# 구조분해 할당

## 객체/배열에서 값 추출하기

구조분해 할당(Destructuring)은 객체나 배열의 값을 쉽게 변수에 할당합니다.

## 객체 구조분해

\`\`\`javascript
const person = { name: "철수", age: 25, city: "서울" };

// 기존 방식
const name = person.name;
const age = person.age;

// 구조분해 (더 간결)
const { name, age, city } = person;

console.log(name);  // "철수"
console.log(age);   // 25
\`\`\`

## 다른 이름으로 할당

\`\`\`javascript
const person = { name: "철수" };

// name을 userName 변수에 할당
const { name: userName } = person;

console.log(userName);  // "철수"
\`\`\`

## 기본값 설정

\`\`\`javascript
const person = { name: "철수" };

// country가 없으면 "한국" 사용
const { name, country = "한국" } = person;

console.log(country);  // "한국"
\`\`\`

## 배열 구조분해

\`\`\`javascript
const colors = ["빨강", "파랑", "초록"];

// 배열은 순서대로 할당
const [first, second, third] = colors;

console.log(first);   // "빨강"
console.log(second);  // "파랑"
\`\`\`

## 일부만 추출

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// 첫 번째만
const [first] = numbers;

// 두 번째 건너뛰기
const [a, , b] = numbers;  // a=1, b=3
\`\`\`

## 함수 매개변수에서 사용

\`\`\`javascript
// 객체를 받아서 바로 분해
function greet({ name, age }) {
  console.log(\`안녕, \${name}! \${age}살이구나.\`);
}

greet({ name: "철수", age: 25 });
\`\`\`

## 중첩 구조분해

\`\`\`javascript
const user = {
  name: "철수",
  address: {
    city: "서울",
    zip: "12345"
  }
};

const { name, address: { city } } = user;
console.log(city);  // "서울"
\`\`\``,
    runnable_examples: [
      {
        title: '객체 구조분해',
        code: `const product = {
  name: "노트북",
  price: 1000000,
  brand: "삼성"
};

const { name, price, brand } = product;

console.log("상품:", name);
console.log("가격:", price);
console.log("브랜드:", brand);`,
        expected_output: `상품: 노트북
가격: 1000000
브랜드: 삼성`,
      },
      {
        title: '이름 변경과 기본값',
        code: `const config = {
  host: "localhost",
  port: 3000
};

const {
  host: serverHost,
  port: serverPort,
  timeout = 5000
} = config;

console.log("호스트:", serverHost);
console.log("포트:", serverPort);
console.log("타임아웃:", timeout);`,
        expected_output: `호스트: localhost
포트: 3000
타임아웃: 5000`,
      },
      {
        title: '배열 구조분해',
        code: `const scores = [95, 87, 76, 92, 88];

const [first, second, ...rest] = scores;

console.log("1등:", first);
console.log("2등:", second);
console.log("나머지:", rest);

// 값 교환
let a = 1;
let b = 2;
[a, b] = [b, a];
console.log("교환 후: a=" + a + ", b=" + b);`,
        expected_output: `1등: 95
2등: 87
나머지: [ 76, 92, 88 ]
교환 후: a=2, b=1`,
      },
      {
        title: '함수 매개변수에서 활용',
        code: `function printUser({ name, age, job = "미정" }) {
  console.log(\`이름: \${name}\`);
  console.log(\`나이: \${age}\`);
  console.log(\`직업: \${job}\`);
}

printUser({ name: "철수", age: 25, job: "개발자" });
console.log("---");
printUser({ name: "영희", age: 30 });`,
        expected_output: `이름: 철수
나이: 25
직업: 개발자
---
이름: 영희
나이: 30
직업: 미정`,
      },
    ],
    keywords: ['구조분해', 'destructuring', '할당', '추출', '객체', '배열'],
  },

  'js-basics-string-methods': {
    name: '문자열 메서드',
    description: 'split, join, slice, includes',
    content: `# 문자열 메서드

## 자주 사용하는 문자열 메서드

JavaScript 문자열은 다양한 내장 메서드를 제공합니다.

## 길이와 접근

\`\`\`javascript
const str = "Hello";
console.log(str.length);    // 5
console.log(str[0]);        // "H"
console.log(str.charAt(1)); // "e"
\`\`\`

## 검색 메서드

\`\`\`javascript
const text = "Hello World";

// includes - 포함 여부
console.log(text.includes("World"));  // true

// indexOf - 위치 찾기
console.log(text.indexOf("o"));       // 4 (첫 번째 위치)
console.log(text.lastIndexOf("o"));   // 7 (마지막 위치)

// startsWith, endsWith
console.log(text.startsWith("Hello")); // true
console.log(text.endsWith("World"));   // true
\`\`\`

## 변환 메서드

\`\`\`javascript
const str = "Hello World";

// 대소문자
console.log(str.toUpperCase());  // "HELLO WORLD"
console.log(str.toLowerCase());  // "hello world"

// 공백 제거
const padded = "  Hello  ";
console.log(padded.trim());      // "Hello"
\`\`\`

## 추출 메서드

\`\`\`javascript
const str = "Hello World";

// slice(시작, 끝) - 끝 미포함
console.log(str.slice(0, 5));   // "Hello"
console.log(str.slice(6));      // "World"
console.log(str.slice(-5));     // "World" (뒤에서부터)

// substring(시작, 끝)
console.log(str.substring(0, 5)); // "Hello"
\`\`\`

## 분리와 결합

\`\`\`javascript
// split - 문자열을 배열로
const csv = "a,b,c,d";
const arr = csv.split(",");
console.log(arr);  // ["a", "b", "c", "d"]

// join - 배열을 문자열로
const words = ["Hello", "World"];
const text = words.join(" ");
console.log(text);  // "Hello World"
\`\`\`

## 치환

\`\`\`javascript
const str = "Hello World";

// replace - 첫 번째만
console.log(str.replace("o", "0"));  // "Hell0 World"

// replaceAll - 전부
console.log(str.replaceAll("o", "0"));  // "Hell0 W0rld"
\`\`\``,
    runnable_examples: [
      {
        title: '검색 메서드',
        code: `const email = "user@example.com";

console.log("@ 포함:", email.includes("@"));
console.log("@ 위치:", email.indexOf("@"));
console.log(".com 끝:", email.endsWith(".com"));
console.log("user 시작:", email.startsWith("user"));`,
        expected_output: `@ 포함: true
@ 위치: 4
.com 끝: true
user 시작: true`,
      },
      {
        title: 'split과 join',
        code: `// 문자열 -> 배열
const sentence = "JavaScript is awesome";
const words = sentence.split(" ");
console.log("단어들:", words);

// 배열 -> 문자열
const joined = words.join("-");
console.log("결합:", joined);

// CSV 처리
const csv = "이름,나이,도시";
const fields = csv.split(",");
console.log("필드:", fields);`,
        expected_output: `단어들: [ 'JavaScript', 'is', 'awesome' ]
결합: JavaScript-is-awesome
필드: [ '이름', '나이', '도시' ]`,
      },
      {
        title: '추출과 변환',
        code: `const text = "  Hello World  ";

console.log("원본:", "[" + text + "]");
console.log("trim:", "[" + text.trim() + "]");
console.log("대문자:", text.trim().toUpperCase());
console.log("slice(0,5):", text.trim().slice(0, 5));`,
        expected_output: `원본: [  Hello World  ]
trim: [Hello World]
대문자: HELLO WORLD
slice(0,5): Hello`,
      },
      {
        title: '치환',
        code: `const message = "Hello, World! Hello, JavaScript!";

// 첫 번째만 변경
console.log("replace:", message.replace("Hello", "Hi"));

// 모두 변경
console.log("replaceAll:", message.replaceAll("Hello", "Hi"));

// 정규식으로 모두 변경
console.log("regex:", message.replace(/Hello/g, "Hi"));`,
        expected_output: `replace: Hi, World! Hello, JavaScript!
replaceAll: Hi, World! Hi, JavaScript!
regex: Hi, World! Hi, JavaScript!`,
      },
    ],
    keywords: ['문자열', 'string', 'split', 'join', 'slice', 'includes'],
  },

  'js-basics-math': {
    name: '숫자와 Math',
    description: 'Math.random, 반올림, 최대/최소',
    content: `# 숫자와 Math

## Math 객체

JavaScript의 \`Math\` 객체는 수학 관련 함수와 상수를 제공합니다.

## 반올림 함수

\`\`\`javascript
const num = 3.7;

console.log(Math.round(3.7));  // 4 (반올림)
console.log(Math.round(3.2));  // 3

console.log(Math.floor(3.7));  // 3 (내림)
console.log(Math.ceil(3.2));   // 4 (올림)

console.log(Math.trunc(3.7));  // 3 (소수점 버림)
console.log(Math.trunc(-3.7)); // -3
\`\`\`

## 최대/최소

\`\`\`javascript
console.log(Math.max(1, 5, 3));   // 5
console.log(Math.min(1, 5, 3));   // 1

// 배열에서 최대/최소
const nums = [10, 5, 20, 15];
console.log(Math.max(...nums));  // 20
console.log(Math.min(...nums));  // 5
\`\`\`

## 거듭제곱과 제곱근

\`\`\`javascript
console.log(Math.pow(2, 3));   // 8 (2의 3승)
console.log(2 ** 3);           // 8 (같은 결과)

console.log(Math.sqrt(16));    // 4 (제곱근)
console.log(Math.cbrt(27));    // 3 (세제곱근)
\`\`\`

## 절대값

\`\`\`javascript
console.log(Math.abs(-5));   // 5
console.log(Math.abs(5));    // 5
\`\`\`

## 랜덤 숫자

\`\`\`javascript
// 0 이상 1 미만
console.log(Math.random());  // 0.xxxxx

// 0 ~ 9 사이 정수
console.log(Math.floor(Math.random() * 10));

// 1 ~ 10 사이 정수
console.log(Math.floor(Math.random() * 10) + 1);

// min ~ max 사이 정수
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
\`\`\`

## 수학 상수

\`\`\`javascript
console.log(Math.PI);      // 3.141592...
console.log(Math.E);       // 2.718281...
\`\`\`

## 숫자 변환

\`\`\`javascript
// 문자열 -> 숫자
console.log(parseInt("123"));     // 123
console.log(parseFloat("3.14"));  // 3.14
console.log(Number("456"));       // 456

// 소수점 자릿수
const pi = 3.14159;
console.log(pi.toFixed(2));  // "3.14" (문자열)
\`\`\``,
    runnable_examples: [
      {
        title: '반올림 함수들',
        code: `const num = 4.6;

console.log("원본:", num);
console.log("round (반올림):", Math.round(num));
console.log("floor (내림):", Math.floor(num));
console.log("ceil (올림):", Math.ceil(num));
console.log("trunc (버림):", Math.trunc(num));

console.log("\\n음수 -4.6:");
console.log("floor:", Math.floor(-4.6));  // -5
console.log("trunc:", Math.trunc(-4.6));  // -4`,
        expected_output: `원본: 4.6
round (반올림): 5
floor (내림): 4
ceil (올림): 5
trunc (버림): 4

음수 -4.6:
floor: -5
trunc: -4`,
      },
      {
        title: '최대/최소와 절대값',
        code: `const scores = [85, 92, 78, 95, 88];

const max = Math.max(...scores);
const min = Math.min(...scores);
const range = Math.abs(max - min);

console.log("점수:", scores);
console.log("최고:", max);
console.log("최저:", min);
console.log("범위:", range);`,
        expected_output: `점수: [ 85, 92, 78, 95, 88 ]
최고: 95
최저: 78
범위: 17`,
      },
      {
        title: '랜덤 숫자 생성',
        code: `// 1~6 주사위
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

console.log("주사위 5번 굴리기:");
for (let i = 0; i < 5; i++) {
  console.log("  " + (i + 1) + "번째:", rollDice());
}

// 범위 지정 랜덤
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log("\\n10~20 사이:", randomBetween(10, 20));`,
        expected_output: `주사위 5번 굴리기:
  1번째: 3
  2번째: 1
  3번째: 5
  4번째: 2
  5번째: 6

10~20 사이: 15`,
      },
      {
        title: '소수점 처리',
        code: `const price = 12345.6789;

console.log("원본:", price);
console.log("소수점 2자리:", price.toFixed(2));
console.log("소수점 0자리:", price.toFixed(0));

// 천단위 콤마
const formatted = price.toLocaleString();
console.log("포맷팅:", formatted);

// 계산 후 반올림
const result = 10 / 3;
console.log("\\n10/3 =", result);
console.log("2자리로:", result.toFixed(2));`,
        expected_output: `원본: 12345.6789
소수점 2자리: 12345.68
소수점 0자리: 12346
포맷팅: 12,345.679

10/3 = 3.3333333333333335
2자리로: 3.33`,
      },
    ],
    keywords: ['Math', '숫자', 'random', 'round', 'floor', 'ceil'],
  },
};
