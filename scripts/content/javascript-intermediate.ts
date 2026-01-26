/**
 * JavaScript 중급 (beginner_plus) 개념 콘텐츠
 * 대상: 기본 문법을 알고 더 깊이 알고 싶은 사람
 * 특징: 심화 개념, 실무 패턴, 원리 설명
 */

export const JS_INTERMEDIATE_CONCEPTS = {
  'js-inter-closure': {
    name: '클로저',
    description: '함수가 환경을 기억하는 원리',
    content: `# 클로저 (Closure)

## 클로저란?

클로저는 함수가 선언될 때의 렉시컬 환경을 기억하여, 함수가 외부에서 실행되어도 그 환경에 접근할 수 있는 현상입니다.

## 기본 예제

\`\`\`javascript
function outer() {
  const message = "Hello";  // 외부 함수의 변수

  function inner() {
    console.log(message);   // 외부 변수에 접근
  }

  return inner;
}

const greet = outer();  // inner 함수 반환
greet();  // "Hello" - outer는 끝났지만 message에 접근 가능!
\`\`\`

## 클로저가 형성되는 조건

1. 내부 함수가 외부 함수의 변수를 참조
2. 내부 함수가 외부로 반환되어 나중에 실행됨

## 실용적인 예제: 카운터

\`\`\`javascript
function createCounter() {
  let count = 0;  // private 변수

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment());  // 1
console.log(counter.increment());  // 2
console.log(counter.getCount());   // 2
// count에 직접 접근 불가 (캡슐화)
\`\`\`

## 클로저와 반복문

\`\`\`javascript
// 문제: 모두 5 출력
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// 5, 5, 5, 5, 5

// 해결: let 사용 (블록 스코프)
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2, 3, 4
\`\`\`

## 클로저 활용 패턴

### 데이터 은닉

\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;

  return {
    deposit(amount) {
      if (amount > 0) balance += amount;
    },
    withdraw(amount) {
      if (amount <= balance) balance -= amount;
    },
    getBalance() {
      return balance;
    }
  };
}
\`\`\`

### 함수 팩토리

\`\`\`javascript
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\``,
    runnable_examples: [
      {
        title: '클로저 기본',
        code: `function createGreeting(greeting) {
  return function(name) {
    console.log(greeting + ", " + name + "!");
  };
}

const sayHello = createGreeting("안녕하세요");
const sayHi = createGreeting("Hi");

sayHello("철수");
sayHello("영희");
sayHi("민수");`,
        expected_output: `안녕하세요, 철수!
안녕하세요, 영희!
Hi, 민수!`,
      },
      {
        title: '카운터 (데이터 은닉)',
        code: `function createCounter(initial = 0) {
  let count = initial;

  return {
    up() {
      count++;
      console.log("증가:", count);
    },
    down() {
      count--;
      console.log("감소:", count);
    },
    value() {
      return count;
    }
  };
}

const counter = createCounter(10);
counter.up();
counter.up();
counter.down();
console.log("현재값:", counter.value());`,
        expected_output: `증가: 11
증가: 12
감소: 11
현재값: 11`,
      },
      {
        title: '함수 팩토리',
        code: `function createAdder(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = createAdder(5);
const add10 = createAdder(10);

console.log("5 + 3 =", add5(3));
console.log("5 + 7 =", add5(7));
console.log("10 + 3 =", add10(3));
console.log("10 + 7 =", add10(7));`,
        expected_output: `5 + 3 = 8
5 + 7 = 12
10 + 3 = 13
10 + 7 = 17`,
      },
      {
        title: '한 번만 실행되는 함수',
        code: `function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("초기화 실행!");
  return "완료";
});

console.log(initialize());  // 실행됨
console.log(initialize());  // 캐시된 결과
console.log(initialize());  // 캐시된 결과`,
        expected_output: `초기화 실행!
완료
완료
완료`,
      },
    ],
    keywords: ['클로저', 'closure', '렉시컬', '스코프', '캡슐화'],
  },

  'js-inter-lexical': {
    name: '렉시컬 스코프',
    description: '선언 위치 기준 스코프 결정',
    content: `# 렉시컬 스코프

## 렉시컬 스코프란?

렉시컬(Lexical) 스코프는 함수를 **어디서 선언했는지**에 따라 스코프가 결정되는 규칙입니다.
어디서 호출했는지는 관계없습니다.

## 예제로 이해하기

\`\`\`javascript
const x = 10;

function outer() {
  const x = 20;

  function inner() {
    console.log(x);  // 어떤 x?
  }

  return inner;
}

const fn = outer();
fn();  // 20 - inner가 선언된 곳(outer) 기준
\`\`\`

## 렉시컬 vs 동적 스코프

\`\`\`javascript
const value = "global";

function printValue() {
  console.log(value);  // 선언 시점의 스코프
}

function wrapper() {
  const value = "wrapper";
  printValue();  // "global" - 호출 위치와 무관
}

wrapper();
\`\`\`

## 스코프 체인

\`\`\`javascript
const a = 1;

function first() {
  const b = 2;

  function second() {
    const c = 3;

    function third() {
      const d = 4;
      console.log(a, b, c, d);  // 모두 접근 가능
    }

    third();
  }

  second();
}

first();  // 1, 2, 3, 4
\`\`\`

## 클로저와의 관계

클로저는 렉시컬 스코프 덕분에 가능합니다.
함수가 선언될 때의 스코프를 기억하기 때문입니다.`,
    runnable_examples: [
      {
        title: '렉시컬 스코프 확인',
        code: `const name = "전역";

function outer() {
  const name = "외부";

  function inner() {
    console.log("inner에서:", name);
  }

  return inner;
}

function test() {
  const name = "테스트";
  const innerFn = outer();
  innerFn();  // "외부" - inner 선언 위치 기준
}

test();`,
        expected_output: `inner에서: 외부`,
      },
      {
        title: '스코프 체인',
        code: `const global = "전역";

function level1() {
  const local1 = "레벨1";

  function level2() {
    const local2 = "레벨2";

    function level3() {
      console.log("global:", global);
      console.log("local1:", local1);
      console.log("local2:", local2);
    }

    level3();
  }

  level2();
}

level1();`,
        expected_output: `global: 전역
local1: 레벨1
local2: 레벨2`,
      },
    ],
    keywords: ['렉시컬', 'lexical', '스코프', '선언', '체인'],
  },

  'js-inter-higher-order': {
    name: '고차 함수',
    description: '함수를 반환하는 함수',
    content: `# 고차 함수 (Higher-Order Function)

## 정의

고차 함수는 다음 중 하나 이상을 만족하는 함수입니다:
1. 함수를 인자로 받음
2. 함수를 반환함

## 함수를 인자로 받는 경우

\`\`\`javascript
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(3, console.log);  // 0, 1, 2
repeat(3, i => console.log("Hello " + i));
\`\`\`

## 함수를 반환하는 경우

\`\`\`javascript
function greaterThan(n) {
  return m => m > n;
}

const greaterThan10 = greaterThan(10);
console.log(greaterThan10(15));  // true
console.log(greaterThan10(5));   // false
\`\`\`

## 내장 고차 함수

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// map, filter, reduce는 모두 고차 함수
numbers.map(x => x * 2);        // [2, 4, 6, 8, 10]
numbers.filter(x => x > 2);     // [3, 4, 5]
numbers.reduce((a, b) => a + b); // 15
\`\`\`

## 함수 합성

\`\`\`javascript
const compose = (f, g) => x => f(g(x));

const addOne = x => x + 1;
const double = x => x * 2;

const addOneThenDouble = compose(double, addOne);
console.log(addOneThenDouble(5));  // 12 (5+1=6, 6*2=12)
\`\`\`

## 실용 예제: 필터 생성기

\`\`\`javascript
function createFilter(predicate) {
  return function(array) {
    return array.filter(predicate);
  };
}

const filterEvens = createFilter(x => x % 2 === 0);
const filterPositive = createFilter(x => x > 0);

console.log(filterEvens([1, 2, 3, 4, 5]));  // [2, 4]
console.log(filterPositive([-1, 0, 1, 2])); // [1, 2]
\`\`\``,
    runnable_examples: [
      {
        title: '함수를 인자로',
        code: `function map(array, transform) {
  const result = [];
  for (const item of array) {
    result.push(transform(item));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];

console.log("2배:", map(numbers, x => x * 2));
console.log("제곱:", map(numbers, x => x * x));
console.log("문자:", map(numbers, x => "숫자" + x));`,
        expected_output: `2배: [ 2, 4, 6, 8, 10 ]
제곱: [ 1, 4, 9, 16, 25 ]
문자: [ '숫자1', '숫자2', '숫자3', '숫자4', '숫자5' ]`,
      },
      {
        title: '함수를 반환',
        code: `function multiplier(factor) {
  return function(x) {
    return x * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);
const tenTimes = multiplier(10);

console.log("double(5):", double(5));
console.log("triple(5):", triple(5));
console.log("tenTimes(5):", tenTimes(5));`,
        expected_output: `double(5): 10
triple(5): 15
tenTimes(5): 50`,
      },
      {
        title: '함수 합성',
        code: `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const process = pipe(addOne, double, square);

console.log("process(2):", process(2));
console.log("단계: 2 -> 3 -> 6 -> 36");

const process2 = pipe(square, double, addOne);
console.log("process2(2):", process2(2));
console.log("단계: 2 -> 4 -> 8 -> 9");`,
        expected_output: `process(2): 36
단계: 2 -> 3 -> 6 -> 36
process2(2): 9
단계: 2 -> 4 -> 8 -> 9`,
      },
    ],
    keywords: ['고차함수', 'higher-order', '함수형', 'compose', 'pipe'],
  },

  'js-inter-reduce': {
    name: 'reduce',
    description: '배열을 하나의 값으로',
    content: `# reduce

## 배열을 하나의 값으로 축약

\`reduce\`는 배열의 모든 요소를 하나의 값으로 줄입니다.
누적 계산, 집계, 변환 등에 사용됩니다.

## 기본 구조

\`\`\`javascript
array.reduce((accumulator, currentValue, index, array) => {
  return 새로운누적값;
}, 초기값);
\`\`\`

## 합계 구하기

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((acc, curr) => {
  return acc + curr;
}, 0);

console.log(sum);  // 15
\`\`\`

## 최대값 찾기

\`\`\`javascript
const numbers = [3, 7, 2, 9, 5];

const max = numbers.reduce((acc, curr) => {
  return curr > acc ? curr : acc;
}, numbers[0]);

console.log(max);  // 9
\`\`\`

## 배열을 객체로

\`\`\`javascript
const items = ["apple", "banana", "apple", "orange", "banana", "banana"];

const count = items.reduce((acc, item) => {
  acc[item] = (acc[item] || 0) + 1;
  return acc;
}, {});

console.log(count);
// { apple: 2, banana: 3, orange: 1 }
\`\`\`

## 중첩 배열 펼치기

\`\`\`javascript
const nested = [[1, 2], [3, 4], [5, 6]];

const flat = nested.reduce((acc, arr) => {
  return acc.concat(arr);
}, []);

console.log(flat);  // [1, 2, 3, 4, 5, 6]
\`\`\`

## reduce로 map/filter 구현

\`\`\`javascript
// map 구현
const mapped = [1, 2, 3].reduce((acc, x) => {
  acc.push(x * 2);
  return acc;
}, []);

// filter 구현
const filtered = [1, 2, 3, 4, 5].reduce((acc, x) => {
  if (x > 2) acc.push(x);
  return acc;
}, []);
\`\`\``,
    runnable_examples: [
      {
        title: '합계와 평균',
        code: `const scores = [85, 92, 78, 95, 88];

const sum = scores.reduce((acc, score) => acc + score, 0);
const avg = sum / scores.length;

console.log("점수:", scores);
console.log("합계:", sum);
console.log("평균:", avg.toFixed(1));`,
        expected_output: `점수: [ 85, 92, 78, 95, 88 ]
합계: 438
평균: 87.6`,
      },
      {
        title: '빈도수 계산',
        code: `const words = ["js", "python", "js", "java", "python", "js"];

const frequency = words.reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1;
  return acc;
}, {});

console.log("단어 빈도:");
for (const [word, count] of Object.entries(frequency)) {
  console.log(\`  \${word}: \${count}번\`);
}`,
        expected_output: `단어 빈도:
  js: 3번
  python: 2번
  java: 1번`,
      },
      {
        title: '그룹화',
        code: `const people = [
  { name: "철수", age: 25 },
  { name: "영희", age: 30 },
  { name: "민수", age: 25 },
  { name: "지영", age: 30 }
];

const byAge = people.reduce((acc, person) => {
  const age = person.age;
  if (!acc[age]) acc[age] = [];
  acc[age].push(person.name);
  return acc;
}, {});

console.log("나이별 그룹:");
console.log(byAge);`,
        expected_output: `나이별 그룹:
{ '25': [ '철수', '민수' ], '30': [ '영희', '지영' ] }`,
      },
      {
        title: '파이프라인',
        code: `const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// reduce로 체이닝 대신 파이프라인
const result = [
  arr => arr.filter(x => x % 2 === 0),  // 짝수만
  arr => arr.map(x => x * 2),           // 2배
  arr => arr.reduce((a, b) => a + b, 0) // 합계
].reduce((acc, fn) => fn(acc), data);

console.log("원본:", data);
console.log("결과:", result);`,
        expected_output: `원본: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
결과: 60`,
      },
    ],
    keywords: ['reduce', '배열', '축약', '누적', '집계'],
  },

  'js-inter-promise': {
    name: 'Promise',
    description: 'resolve, reject, then, catch',
    content: `# Promise

## 비동기 작업의 결과

Promise는 미래에 완료될 작업의 결과를 나타내는 객체입니다.

## 세 가지 상태

1. **pending**: 대기 중 (아직 결과 없음)
2. **fulfilled**: 이행됨 (성공)
3. **rejected**: 거부됨 (실패)

## Promise 생성

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  // 비동기 작업 수행
  const success = true;

  if (success) {
    resolve("성공!");   // 성공 시
  } else {
    reject("실패...");  // 실패 시
  }
});
\`\`\`

## then과 catch

\`\`\`javascript
promise
  .then(result => {
    console.log("성공:", result);
  })
  .catch(error => {
    console.log("실패:", error);
  });
\`\`\`

## 체이닝

\`\`\`javascript
fetchUser(userId)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(error => console.log("에러:", error));
\`\`\`

## Promise.all

모든 Promise가 완료될 때까지 대기:

\`\`\`javascript
Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
.then(([users, posts, comments]) => {
  console.log("모두 완료!");
});
\`\`\`

## Promise.race

가장 먼저 완료되는 Promise:

\`\`\`javascript
Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) =>
    setTimeout(() => reject('timeout'), 5000)
  )
]);
\`\`\``,
    runnable_examples: [
      {
        title: 'Promise 기본',
        code: `function delay(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

console.log("시작");

delay(100, "첫 번째")
  .then(result => {
    console.log(result);
    return delay(100, "두 번째");
  })
  .then(result => {
    console.log(result);
    return delay(100, "세 번째");
  })
  .then(result => {
    console.log(result);
    console.log("완료");
  });`,
        expected_output: `시작
첫 번째
두 번째
세 번째
완료`,
      },
      {
        title: '성공과 실패',
        code: `function divide(a, b) {
  return new Promise((resolve, reject) => {
    if (b === 0) {
      reject("0으로 나눌 수 없습니다");
    } else {
      resolve(a / b);
    }
  });
}

divide(10, 2)
  .then(result => console.log("10/2 =", result))
  .catch(err => console.log("에러:", err));

divide(10, 0)
  .then(result => console.log("10/0 =", result))
  .catch(err => console.log("에러:", err));`,
        expected_output: `10/2 = 5
에러: 0으로 나눌 수 없습니다`,
      },
      {
        title: 'Promise.all',
        code: `const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(values => {
    console.log("모든 값:", values);
    console.log("합계:", values.reduce((a, b) => a + b));
  });`,
        expected_output: `모든 값: [ 1, 2, 3 ]
합계: 6`,
      },
    ],
    keywords: ['Promise', '비동기', 'then', 'catch', 'resolve', 'reject'],
  },

  'js-inter-async-await': {
    name: 'async/await',
    description: '동기처럼 쓰는 비동기',
    content: `# async/await

## 더 깔끔한 비동기 코드

async/await는 Promise를 더 읽기 쉽게 사용하는 문법입니다.
동기 코드처럼 보이지만 실제로는 비동기로 동작합니다.

## 기본 문법

\`\`\`javascript
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
\`\`\`

## Promise.then과 비교

\`\`\`javascript
// Promise.then 방식
function getUser() {
  return fetch('/api/user')
    .then(res => res.json())
    .then(user => fetch('/api/posts/' + user.id))
    .then(res => res.json());
}

// async/await 방식
async function getUser() {
  const res1 = await fetch('/api/user');
  const user = await res1.json();
  const res2 = await fetch('/api/posts/' + user.id);
  return await res2.json();
}
\`\`\`

## 에러 처리

\`\`\`javascript
async function getData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("에러:", error);
    throw error;
  }
}
\`\`\`

## 병렬 실행

\`\`\`javascript
async function parallel() {
  // 순차 실행 (느림)
  const a = await fetchA();
  const b = await fetchB();

  // 병렬 실행 (빠름)
  const [a, b] = await Promise.all([
    fetchA(),
    fetchB()
  ]);
}
\`\`\`

## 주의사항

- async 함수는 항상 Promise를 반환
- await는 async 함수 안에서만 사용 가능
- 반복문에서 await 사용 시 주의`,
    runnable_examples: [
      {
        title: 'async/await 기본',
        code: `function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

async function main() {
  console.log("시작");

  const a = await delay(100, "첫 번째");
  console.log(a);

  const b = await delay(100, "두 번째");
  console.log(b);

  const c = await delay(100, "세 번째");
  console.log(c);

  console.log("완료");
}

main();`,
        expected_output: `시작
첫 번째
두 번째
세 번째
완료`,
      },
      {
        title: '에러 처리',
        code: `async function riskyOperation(shouldFail) {
  if (shouldFail) {
    throw new Error("의도된 실패");
  }
  return "성공!";
}

async function main() {
  try {
    const result1 = await riskyOperation(false);
    console.log("결과1:", result1);

    const result2 = await riskyOperation(true);
    console.log("결과2:", result2);
  } catch (error) {
    console.log("에러 발생:", error.message);
  }

  console.log("프로그램 계속");
}

main();`,
        expected_output: `결과1: 성공!
에러 발생: 의도된 실패
프로그램 계속`,
      },
      {
        title: '병렬 vs 순차',
        code: `function delay(ms, name) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(name + " 완료");
      resolve(name);
    }, ms);
  });
}

async function sequential() {
  console.log("순차 시작");
  await delay(100, "A");
  await delay(100, "B");
  await delay(100, "C");
  console.log("순차 완료\\n");
}

async function parallel() {
  console.log("병렬 시작");
  await Promise.all([
    delay(100, "X"),
    delay(100, "Y"),
    delay(100, "Z")
  ]);
  console.log("병렬 완료");
}

async function main() {
  await sequential();
  await parallel();
}

main();`,
        expected_output: `순차 시작
A 완료
B 완료
C 완료
순차 완료

병렬 시작
X 완료
Y 완료
Z 완료
병렬 완료`,
      },
    ],
    keywords: ['async', 'await', '비동기', 'Promise', '동기'],
  },

  'js-inter-prototype': {
    name: '프로토타입',
    description: 'JavaScript 상속의 원리',
    content: `# 프로토타입

## JavaScript의 상속 메커니즘

JavaScript는 프로토타입 기반 상속을 사용합니다.
모든 객체는 다른 객체를 프로토타입으로 가질 수 있습니다.

## [[Prototype]]

모든 객체는 숨겨진 [[Prototype]] 속성을 가집니다.

\`\`\`javascript
const obj = {};
console.log(obj.__proto__ === Object.prototype);  // true
\`\`\`

## 프로토타입 체인

객체에서 속성을 찾을 때:
1. 객체 자신에서 찾음
2. 없으면 프로토타입에서 찾음
3. 없으면 프로토타입의 프로토타입에서 찾음
4. null에 도달할 때까지 반복

## 생성자 함수와 프로토타입

\`\`\`javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log("안녕, 나는 " + this.name);
};

const person1 = new Person("철수");
const person2 = new Person("영희");

person1.greet();  // 같은 메서드 공유
person2.greet();
\`\`\`

## Object.create

\`\`\`javascript
const animal = {
  speak() {
    console.log("소리를 냅니다");
  }
};

const dog = Object.create(animal);
dog.bark = function() {
  console.log("멍멍!");
};

dog.speak();  // 프로토타입에서 상속
dog.bark();
\`\`\`

## 프로토타입 확인

\`\`\`javascript
console.log(Object.getPrototypeOf(dog) === animal);  // true
console.log(dog.hasOwnProperty('bark'));  // true
console.log(dog.hasOwnProperty('speak')); // false (상속받음)
\`\`\``,
    runnable_examples: [
      {
        title: '프로토타입 체인',
        code: `const animal = {
  alive: true,
  breathe() {
    console.log("숨을 쉽니다");
  }
};

const dog = Object.create(animal);
dog.bark = function() {
  console.log("멍멍!");
};

console.log("alive:", dog.alive);  // 프로토타입에서 상속
dog.breathe();  // 프로토타입 메서드
dog.bark();     // 자신의 메서드

console.log("\\nhasOwnProperty:");
console.log("bark:", dog.hasOwnProperty("bark"));
console.log("alive:", dog.hasOwnProperty("alive"));`,
        expected_output: `alive: true
숨을 쉽니다
멍멍!

hasOwnProperty:
bark: true
alive: false`,
      },
      {
        title: '생성자 함수',
        code: `function Car(brand, model) {
  this.brand = brand;
  this.model = model;
}

Car.prototype.getInfo = function() {
  return this.brand + " " + this.model;
};

Car.prototype.start = function() {
  console.log(this.getInfo() + " 시동 걸림");
};

const car1 = new Car("현대", "소나타");
const car2 = new Car("기아", "K5");

car1.start();
car2.start();

console.log("\\n같은 메서드 공유:", car1.start === car2.start);`,
        expected_output: `현대 소나타 시동 걸림
기아 K5 시동 걸림

같은 메서드 공유: true`,
      },
    ],
    keywords: ['프로토타입', 'prototype', '상속', '체인', '__proto__'],
  },

  'js-inter-class': {
    name: '클래스',
    description: 'ES6 class 문법',
    content: `# 클래스 (Class)

## 프로토타입의 문법적 설탕

ES6 클래스는 프로토타입 기반 상속을 더 명확하게 작성하는 문법입니다.

## 기본 클래스

\`\`\`javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(\`안녕, 나는 \${this.name}\`);
  }

  getAge() {
    return this.age;
  }
}

const person = new Person("철수", 25);
person.greet();
\`\`\`

## 상속 (extends)

\`\`\`javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(this.name + "이 소리를 냅니다");
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 부모 생성자 호출
    this.breed = breed;
  }

  speak() {
    console.log(this.name + "이 멍멍!");
  }
}
\`\`\`

## 정적 메서드

\`\`\`javascript
class MathUtils {
  static add(a, b) {
    return a + b;
  }

  static PI = 3.14159;
}

console.log(MathUtils.add(5, 3));
console.log(MathUtils.PI);
\`\`\`

## getter와 setter

\`\`\`javascript
class Circle {
  constructor(radius) {
    this._radius = radius;
  }

  get radius() {
    return this._radius;
  }

  set radius(value) {
    if (value > 0) {
      this._radius = value;
    }
  }

  get area() {
    return Math.PI * this._radius ** 2;
  }
}
\`\`\``,
    runnable_examples: [
      {
        title: '기본 클래스',
        code: `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }

  getPerimeter() {
    return 2 * (this.width + this.height);
  }

  describe() {
    console.log(\`\${this.width}x\${this.height} 직사각형\`);
    console.log(\`넓이: \${this.getArea()}\`);
    console.log(\`둘레: \${this.getPerimeter()}\`);
  }
}

const rect = new Rectangle(5, 3);
rect.describe();`,
        expected_output: `5x3 직사각형
넓이: 15
둘레: 16`,
      },
      {
        title: '상속',
        code: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(this.name + " makes a sound");
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  speak() {
    console.log(this.name + " barks!");
  }

  info() {
    console.log(\`\${this.name}은 \${this.breed}입니다\`);
  }
}

const animal = new Animal("동물");
const dog = new Dog("멍멍이", "진돗개");

animal.speak();
dog.speak();
dog.info();`,
        expected_output: `동물 makes a sound
멍멍이 barks!
멍멍이은 진돗개입니다`,
      },
      {
        title: '정적 메서드와 getter/setter',
        code: `class Temperature {
  static celsiusToFahrenheit(c) {
    return c * 9/5 + 32;
  }

  static fahrenheitToCelsius(f) {
    return (f - 32) * 5/9;
  }

  constructor(celsius) {
    this._celsius = celsius;
  }

  get celsius() {
    return this._celsius;
  }

  set celsius(value) {
    this._celsius = value;
  }

  get fahrenheit() {
    return Temperature.celsiusToFahrenheit(this._celsius);
  }
}

console.log("30C =", Temperature.celsiusToFahrenheit(30) + "F");

const temp = new Temperature(25);
console.log("온도:", temp.celsius + "C =", temp.fahrenheit.toFixed(1) + "F");`,
        expected_output: `30C = 86F
온도: 25C = 77.0F`,
      },
    ],
    keywords: ['class', '클래스', 'extends', 'super', '상속', 'static'],
  },

  'js-inter-try-catch': {
    name: 'try-catch',
    description: '에러 잡기',
    content: `# try-catch

## 에러 처리

try-catch는 코드 실행 중 발생하는 에러를 잡아서 처리합니다.

## 기본 구조

\`\`\`javascript
try {
  // 에러가 발생할 수 있는 코드
} catch (error) {
  // 에러 발생 시 실행
} finally {
  // 항상 실행 (선택사항)
}
\`\`\`

## 기본 사용

\`\`\`javascript
try {
  const result = riskyOperation();
  console.log(result);
} catch (error) {
  console.log("에러 발생:", error.message);
}
\`\`\`

## finally 블록

\`\`\`javascript
try {
  openFile();
  processFile();
} catch (error) {
  console.log("에러:", error);
} finally {
  closeFile();  // 에러 여부와 관계없이 실행
}
\`\`\`

## throw로 에러 발생시키기

\`\`\`javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error("0으로 나눌 수 없습니다");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (error) {
  console.log(error.message);
}
\`\`\`

## 에러 객체 속성

\`\`\`javascript
try {
  nonExistentFunction();
} catch (error) {
  console.log("이름:", error.name);      // ReferenceError
  console.log("메시지:", error.message); // nonExistentFunction is not defined
  console.log("스택:", error.stack);     // 호출 스택
}
\`\`\`

## async/await와 함께

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("API 에러:", error);
    return null;
  }
}
\`\`\``,
    runnable_examples: [
      {
        title: 'try-catch 기본',
        code: `function parseJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    console.log("파싱 성공:", data);
    return data;
  } catch (error) {
    console.log("파싱 실패:", error.message);
    return null;
  }
}

parseJSON('{"name": "철수", "age": 25}');
console.log("---");
parseJSON('잘못된 JSON');`,
        expected_output: `파싱 성공: { name: '철수', age: 25 }
---
파싱 실패: Unexpected token '잘', "잘못된 JSON" is not valid JSON`,
      },
      {
        title: 'throw 사용',
        code: `function validateAge(age) {
  if (typeof age !== 'number') {
    throw new TypeError("나이는 숫자여야 합니다");
  }
  if (age < 0) {
    throw new RangeError("나이는 0 이상이어야 합니다");
  }
  if (age > 150) {
    throw new RangeError("나이가 너무 큽니다");
  }
  return true;
}

function testAge(age) {
  try {
    validateAge(age);
    console.log(age + "살: 유효함");
  } catch (error) {
    console.log(age + ": " + error.message);
  }
}

testAge(25);
testAge(-5);
testAge("스물다섯");`,
        expected_output: `25살: 유효함
-5: 나이는 0 이상이어야 합니다
스물다섯: 나이는 숫자여야 합니다`,
      },
      {
        title: 'finally 사용',
        code: `function process(value) {
  console.log("처리 시작:", value);
  try {
    if (value < 0) {
      throw new Error("음수 불가");
    }
    console.log("처리 중...");
    return value * 2;
  } catch (error) {
    console.log("에러:", error.message);
    return 0;
  } finally {
    console.log("처리 종료 (항상 실행)");
  }
}

console.log("결과:", process(5));
console.log("---");
console.log("결과:", process(-3));`,
        expected_output: `처리 시작: 5
처리 중...
처리 종료 (항상 실행)
결과: 10
---
처리 시작: -3
에러: 음수 불가
처리 종료 (항상 실행)
결과: 0`,
      },
    ],
    keywords: ['try', 'catch', 'finally', 'throw', '에러', '예외'],
  },

  'js-inter-optional-chaining': {
    name: '옵셔널 체이닝',
    description: '?. 안전한 접근',
    content: `# 옵셔널 체이닝 (?.)

## 안전한 속성 접근

옵셔널 체이닝은 객체 속성에 안전하게 접근하는 문법입니다.
중간에 null이나 undefined가 있으면 에러 대신 undefined를 반환합니다.

## 기본 사용

\`\`\`javascript
const user = {
  name: "철수",
  address: {
    city: "서울"
  }
};

// 기존 방식 (길고 번거로움)
const city1 = user && user.address && user.address.city;

// 옵셔널 체이닝 (간결함)
const city2 = user?.address?.city;
\`\`\`

## null/undefined 처리

\`\`\`javascript
const user = null;

// 에러 발생
// console.log(user.name);

// undefined 반환
console.log(user?.name);  // undefined
\`\`\`

## 메서드 호출

\`\`\`javascript
const obj = {
  method: function() { return "호출됨"; }
};

console.log(obj.method?.());  // "호출됨"
console.log(obj.noMethod?.());  // undefined (에러 없음)
\`\`\`

## 배열 접근

\`\`\`javascript
const arr = null;
console.log(arr?.[0]);  // undefined

const arr2 = [1, 2, 3];
console.log(arr2?.[0]);  // 1
\`\`\`

## 널 병합 연산자와 함께

\`\`\`javascript
const user = { profile: null };

// 기본값 설정
const bio = user?.profile?.bio ?? "프로필 없음";
console.log(bio);  // "프로필 없음"
\`\`\``,
    runnable_examples: [
      {
        title: '안전한 속성 접근',
        code: `const users = [
  { name: "철수", profile: { bio: "개발자" } },
  { name: "영희", profile: null },
  { name: "민수" }  // profile 없음
];

for (const user of users) {
  const bio = user?.profile?.bio ?? "소개 없음";
  console.log(\`\${user.name}: \${bio}\`);
}`,
        expected_output: `철수: 개발자
영희: 소개 없음
민수: 소개 없음`,
      },
      {
        title: '메서드 안전 호출',
        code: `const api = {
  getData: () => "데이터 로드됨",
  // processData는 없음
};

console.log(api.getData?.());
console.log(api.processData?.());
console.log(api.processData?.() ?? "메서드 없음");`,
        expected_output: `데이터 로드됨
undefined
메서드 없음`,
      },
      {
        title: '중첩 객체 접근',
        code: `const config = {
  database: {
    host: "localhost",
    settings: {
      timeout: 5000
    }
  }
};

console.log("host:", config?.database?.host);
console.log("timeout:", config?.database?.settings?.timeout);
console.log("port:", config?.database?.settings?.port ?? 3306);
console.log("cache:", config?.cache?.enabled ?? false);`,
        expected_output: `host: localhost
timeout: 5000
port: 3306
cache: false`,
      },
    ],
    keywords: ['옵셔널', 'optional', 'chaining', '?.', '안전', 'null'],
  },

  'js-inter-nullish': {
    name: '널 병합 연산자',
    description: '?? null/undefined 처리',
    content: `# 널 병합 연산자 (??)

## null과 undefined만 체크

널 병합 연산자는 왼쪽 값이 null 또는 undefined일 때만 오른쪽 값을 반환합니다.

## || 와의 차이

\`\`\`javascript
// || 는 falsy 값 모두 체크
console.log(0 || "기본값");       // "기본값"
console.log("" || "기본값");      // "기본값"
console.log(false || "기본값");   // "기본값"

// ?? 는 null/undefined만 체크
console.log(0 ?? "기본값");       // 0
console.log("" ?? "기본값");      // ""
console.log(false ?? "기본값");   // false
console.log(null ?? "기본값");    // "기본값"
console.log(undefined ?? "기본값"); // "기본값"
\`\`\`

## 실용적인 예

\`\`\`javascript
function getConfig(options) {
  return {
    timeout: options.timeout ?? 5000,
    retries: options.retries ?? 3,
    debug: options.debug ?? false  // false도 유효한 값!
  };
}

getConfig({ debug: false });
// debug가 false로 유지됨 (|| 였다면 true가 됨)
\`\`\`

## 옵셔널 체이닝과 함께

\`\`\`javascript
const user = { settings: null };

// 기본값 설정
const theme = user?.settings?.theme ?? "light";
const fontSize = user?.settings?.fontSize ?? 14;
\`\`\`

## 주의: || 또는 && 와 혼용 불가

\`\`\`javascript
// 괄호 필요
const result = (a ?? b) || c;
const result2 = a ?? (b || c);
\`\`\``,
    runnable_examples: [
      {
        title: '|| vs ??',
        code: `const values = [0, "", false, null, undefined];

console.log("|| 연산자:");
for (const v of values) {
  console.log(\`  \${String(v).padEnd(10)} || "기본" => \${v || "기본"}\`);
}

console.log("\\n?? 연산자:");
for (const v of values) {
  console.log(\`  \${String(v).padEnd(10)} ?? "기본" => \${v ?? "기본"}\`);
}`,
        expected_output: `|| 연산자:
  0          || "기본" => 기본
             || "기본" => 기본
  false      || "기본" => 기본
  null       || "기본" => 기본
  undefined  || "기본" => 기본

?? 연산자:
  0          ?? "기본" => 0
             ?? "기본" =>
  false      ?? "기본" => false
  null       ?? "기본" => 기본
  undefined  ?? "기본" => 기본`,
      },
      {
        title: '설정값 기본값',
        code: `function createServer(options = {}) {
  return {
    port: options.port ?? 3000,
    host: options.host ?? "localhost",
    debug: options.debug ?? false,
    maxConnections: options.maxConnections ?? 100
  };
}

console.log("기본 설정:");
console.log(createServer());

console.log("\\n커스텀 설정:");
console.log(createServer({
  port: 8080,
  debug: false,  // false가 유지됨
  maxConnections: 0  // 0도 유지됨
}));`,
        expected_output: `기본 설정:
{ port: 3000, host: 'localhost', debug: false, maxConnections: 100 }

커스텀 설정:
{ port: 8080, host: 'localhost', debug: false, maxConnections: 0 }`,
      },
    ],
    keywords: ['널병합', 'nullish', '??', 'null', 'undefined', '기본값'],
  },
};
