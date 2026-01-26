/**
 * TypeScript 중급 (beginner_plus/intermediate) 개념 콘텐츠
 * 대상: TypeScript 기초를 아는 학습자
 * 특징: 고급 타입, 실무 패턴, 성능 최적화
 */

export const TS_INTERMEDIATE_CONCEPTS = {
  'ts-inter-generic-inference': {
    name: '고급 제네릭',
    description: '조건부 타입, infer',
    content: `# 고급 제네릭

## 조건부 타입

조건에 따라 타입을 결정합니다.

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
\`\`\`

## infer 키워드

타입 내에서 타입을 추론하여 캡처합니다.

\`\`\`typescript
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = GetReturnType<() => string>;  // string
type B = GetReturnType<(x: number) => boolean>;  // boolean
\`\`\`

## 분배 조건부 타입

유니온에 조건부 타입 적용 시 분배됩니다.

\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string | number>;
// string[] | number[] (분배됨)
\`\`\`

## 실용 패턴

\`\`\`typescript
// Promise 내부 타입 추출
type Awaited<T> = T extends Promise<infer U> ? U : T;

// 함수 첫 번째 매개변수 타입
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

// 배열 요소 타입
type ArrayElement<T> = T extends (infer E)[] ? E : never;
\`\`\``,
    runnable_examples: [
      {
        title: '조건부 타입 기본',
        code: `// 조건부 타입
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// 타입 테스트 함수
function checkType<T>(value: T, expected: string): void {
    console.log(\`Value: \${JSON.stringify(value)}, Expected: \${expected}\`);
}

// 런타임 체크 (타입 레벨 아님)
const arr = [1, 2, 3];
const num = 42;
const fn = () => "hello";

checkType(arr, "IsArray: true");
checkType(num, "IsArray: false");
checkType(fn, "IsFunction: true");`,
        expected_output: `Value: [1,2,3], Expected: IsArray: true
Value: 42, Expected: IsArray: false
Value: undefined, Expected: IsFunction: true`,
      },
      {
        title: 'infer로 타입 추출',
        code: `// 함수 반환 타입 추출 (직접 구현)
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 함수 매개변수 타입 추출
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

// 테스트용 함수들
function greet(name: string): string {
    return \`Hello, \${name}\`;
}

function add(a: number, b: number): number {
    return a + b;
}

// 타입 확인 (실제로는 타입 레벨에서 동작)
type GreetReturn = MyReturnType<typeof greet>;  // string
type AddParams = MyParameters<typeof add>;  // [number, number]

console.log("greet returns:", greet("World"));
console.log("add returns:", add(5, 3));`,
        expected_output: `greet returns: Hello, World
add returns: 8`,
      },
      {
        title: 'Promise 타입 추출',
        code: `// Promise 내부 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 중첩 Promise 풀기
type DeepUnwrap<T> = T extends Promise<infer U>
    ? DeepUnwrap<U>
    : T;

// 예시
async function fetchUser(): Promise<{ id: number; name: string }> {
    return { id: 1, name: "Kim" };
}

async function fetchNumber(): Promise<number> {
    return 42;
}

// 실제 사용
async function demo(): Promise<void> {
    const user = await fetchUser();
    const num = await fetchNumber();

    console.log("User:", user);
    console.log("Number:", num);
}

demo();`,
        expected_output: `User: { id: 1, name: 'Kim' }
Number: 42`,
      },
    ],
    keywords: ['조건부타입', 'infer', 'extends', '고급제네릭'],
  },

  'ts-inter-key-remapping': {
    name: '고급 매핑 타입',
    description: 'as, 키 변환',
    content: `# 고급 매핑 타입

## as로 키 변환

매핑 시 키를 변환할 수 있습니다.

\`\`\`typescript
type Getters<T> = {
    [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person {
    name: string;
    age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
\`\`\`

## 키 필터링

\`\`\`typescript
// 특정 타입의 키만 선택
type OnlyStringKeys<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed {
    name: string;
    age: number;
    email: string;
}

type StringProps = OnlyStringKeys<Mixed>;
// { name: string; email: string }
\`\`\`

## 실용 패턴

\`\`\`typescript
// 이벤트 핸들러 생성
type EventHandlers<T> = {
    [K in keyof T as \`on\${Capitalize<string & K>}Change\`]: (value: T[K]) => void;
};

// nullable 버전
type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

// 깊은 Partial
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
\`\`\``,
    runnable_examples: [
      {
        title: 'Getter/Setter 생성',
        code: `// Getter 타입 생성
type Getters<T> = {
    [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

// Setter 타입 생성
type Setters<T> = {
    [K in keyof T as \`set\${Capitalize<string & K>}\`]: (value: T[K]) => void;
};

interface State {
    count: number;
    name: string;
}

// 구현
function createAccessors<T extends object>(initial: T): T & Getters<T> & Setters<T> {
    const state = { ...initial };
    const accessors: any = { ...state };

    for (const key of Object.keys(initial)) {
        const capKey = key.charAt(0).toUpperCase() + key.slice(1);
        accessors[\`get\${capKey}\`] = () => (state as any)[key];
        accessors[\`set\${capKey}\`] = (value: any) => { (state as any)[key] = value; };
    }

    return accessors;
}

const store = createAccessors<State>({ count: 0, name: "Test" });
console.log("Initial count:", store.getCount());
store.setCount(10);
console.log("After set:", store.getCount());
store.setName("Updated");
console.log("Name:", store.getName());`,
        expected_output: `Initial count: 0
After set: 10
Name: Updated`,
      },
      {
        title: '키 필터링',
        code: `// string 타입 키만 추출
type StringKeys<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// function 타입 키만 추출
type MethodKeys<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};

interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    greet(): string;
    save(): Promise<void>;
}

// 실제 사용 예시
const user: User = {
    id: 1,
    name: "Kim",
    email: "kim@mail.com",
    age: 25,
    greet() { return \`Hi, I'm \${this.name}\`; },
    async save() { console.log("Saving..."); }
};

// StringKeys<User> = { name: string; email: string }
const stringProps = ["name", "email"] as const;
stringProps.forEach(key => {
    console.log(\`\${key}: \${user[key]}\`);
});`,
        expected_output: `name: Kim
email: kim@mail.com`,
      },
      {
        title: 'DeepPartial 구현',
        code: `// 깊은 Partial
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object
        ? T[K] extends Array<any>
            ? T[K]
            : DeepPartial<T[K]>
        : T[K];
};

interface Config {
    server: {
        host: string;
        port: number;
        ssl: {
            enabled: boolean;
            cert: string;
        };
    };
    database: {
        url: string;
        pool: number;
    };
}

function mergeConfig(base: Config, partial: DeepPartial<Config>): Config {
    return {
        server: {
            ...base.server,
            ...partial.server,
            ssl: {
                ...base.server.ssl,
                ...partial.server?.ssl
            }
        },
        database: {
            ...base.database,
            ...partial.database
        }
    };
}

const defaultConfig: Config = {
    server: { host: "localhost", port: 3000, ssl: { enabled: false, cert: "" } },
    database: { url: "localhost:5432", pool: 10 }
};

const merged = mergeConfig(defaultConfig, {
    server: { port: 8080, ssl: { enabled: true } }
});

console.log("Merged config:", JSON.stringify(merged, null, 2));`,
        expected_output: `Merged config: {
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": {
      "enabled": true,
      "cert": ""
    }
  },
  "database": {
    "url": "localhost:5432",
    "pool": 10
  }
}`,
      },
    ],
    keywords: ['매핑타입', 'as', '키변환', 'DeepPartial'],
  },

  'ts-inter-cond-basic': {
    name: '고급 템플릿 리터럴',
    description: '복잡한 문자열 패턴',
    content: `# 고급 템플릿 리터럴 타입

## 복잡한 패턴 매칭

\`\`\`typescript
type ExtractRouteParams<T extends string> =
    T extends \`\${infer _Start}:\${infer Param}/\${infer Rest}\`
        ? Param | ExtractRouteParams<Rest>
        : T extends \`\${infer _Start}:\${infer Param}\`
            ? Param
            : never;

type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
// "id" | "postId"
\`\`\`

## 문자열 조작

\`\`\`typescript
// 케밥 케이스를 카멜 케이스로
type KebabToCamel<S extends string> =
    S extends \`\${infer T}-\${infer U}\`
        ? \`\${T}\${KebabToCamel<Capitalize<U>>}\`
        : S;

type Result = KebabToCamel<"background-color">;
// "backgroundColor"
\`\`\`

## 이벤트 이름 생성

\`\`\`typescript
type Events = "click" | "focus" | "blur";
type EventMethods = {
    [E in Events as \`on\${Capitalize<E>}\`]: () => void;
} & {
    [E in Events as \`add\${Capitalize<E>}Listener\`]: (handler: () => void) => void;
};
\`\`\`

## 경로 타입

\`\`\`typescript
type Join<T extends string[], D extends string> =
    T extends []
        ? ""
        : T extends [infer F extends string]
            ? F
            : T extends [infer F extends string, ...infer R extends string[]]
                ? \`\${F}\${D}\${Join<R, D>}\`
                : never;

type Path = Join<["users", "profile", "settings"], "/">;
// "users/profile/settings"
\`\`\``,
    runnable_examples: [
      {
        title: 'URL 경로 파라미터 추출',
        code: `// 라우트 파라미터 추출 타입
type ExtractParams<T extends string> =
    T extends \`\${string}:\${infer Param}/\${infer Rest}\`
        ? Param | ExtractParams<\`/\${Rest}\`>
        : T extends \`\${string}:\${infer Param}\`
            ? Param
            : never;

// 파라미터 객체 타입
type RouteParams<T extends string> = {
    [K in ExtractParams<T>]: string;
};

// 사용 예시
type UserRoute = "/users/:userId";
type PostRoute = "/users/:userId/posts/:postId";

function createUrl<T extends string>(
    template: T,
    params: RouteParams<T>
): string {
    let url: string = template;
    for (const [key, value] of Object.entries(params)) {
        url = url.replace(\`:\${key}\`, value as string);
    }
    return url;
}

console.log(createUrl("/users/:userId", { userId: "123" }));
console.log(createUrl("/users/:userId/posts/:postId", {
    userId: "123",
    postId: "456"
}));`,
        expected_output: `/users/123
/users/123/posts/456`,
      },
      {
        title: '케이스 변환',
        code: `// 카멜케이스 -> 스네이크케이스 (런타임)
function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => \`_\${letter.toLowerCase()}\`);
}

// 스네이크케이스 -> 카멜케이스 (런타임)
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 객체 키 변환
function convertKeys<T extends object>(
    obj: T,
    converter: (key: string) => string
): object {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        result[converter(key)] = value;
    }
    return result;
}

const camelObj = {
    firstName: "John",
    lastName: "Doe",
    emailAddress: "john@example.com"
};

const snakeObj = convertKeys(camelObj, camelToSnake);
console.log("To snake:", snakeObj);

const backToCamel = convertKeys(snakeObj, snakeToCamel);
console.log("Back to camel:", backToCamel);`,
        expected_output: `To snake: { first_name: 'John', last_name: 'Doe', email_address: 'john@example.com' }
Back to camel: { firstName: 'John', lastName: 'Doe', emailAddress: 'john@example.com' }`,
      },
      {
        title: 'CSS 속성 타입',
        code: `// CSS 속성명 생성
type CSSProperty =
    | \`margin-\${"top" | "right" | "bottom" | "left"}\`
    | \`padding-\${"top" | "right" | "bottom" | "left"}\`
    | \`border-\${"top" | "right" | "bottom" | "left"}-\${"width" | "color" | "style"}\`;

// CSS 값 타입
type CSSValue = string | number;

// 스타일 객체
type StyleObject = Partial<Record<CSSProperty, CSSValue>>;

function createStyle(styles: StyleObject): string {
    return Object.entries(styles)
        .map(([prop, value]) => {
            const cssValue = typeof value === "number" ? \`\${value}px\` : value;
            return \`\${prop}: \${cssValue}\`;
        })
        .join("; ");
}

const buttonStyle: StyleObject = {
    "margin-top": 10,
    "margin-bottom": 10,
    "padding-left": 20,
    "padding-right": 20,
    "border-top-width": 1,
    "border-top-color": "#ccc"
};

console.log(createStyle(buttonStyle));`,
        expected_output: `margin-top: 10px; margin-bottom: 10px; padding-left: 20px; padding-right: 20px; border-top-width: 1px; border-top-color: #ccc`,
      },
    ],
    keywords: ['템플릿리터럴', '패턴매칭', 'infer', '문자열타입'],
  },

  'ts-inter-infer': {
    name: '타입 서술어 고급',
    description: '복잡한 타입 가드',
    content: `# 고급 타입 서술어

## 복합 타입 가드

\`\`\`typescript
interface Success<T> {
    success: true;
    data: T;
}

interface Failure {
    success: false;
    error: string;
}

type Result<T> = Success<T> | Failure;

function isSuccess<T>(result: Result<T>): result is Success<T> {
    return result.success === true;
}
\`\`\`

## 배열 필터링

\`\`\`typescript
const items: (string | null)[] = ["a", null, "b", null, "c"];

// filter와 타입 가드 결합
const strings: string[] = items.filter(
    (item): item is string => item !== null
);
\`\`\`

## 객체 속성 검사

\`\`\`typescript
function hasProperty<T extends object, K extends string>(
    obj: T,
    key: K
): obj is T & Record<K, unknown> {
    return key in obj;
}
\`\`\`

## 제네릭 타입 가드

\`\`\`typescript
function isOfType<T>(
    value: unknown,
    check: (v: unknown) => boolean
): value is T {
    return check(value);
}

const value: unknown = "hello";
if (isOfType<string>(value, v => typeof v === "string")) {
    console.log(value.toUpperCase());  // string 확정
}
\`\`\``,
    runnable_examples: [
      {
        title: 'Result 타입 패턴',
        code: `interface Success<T> {
    success: true;
    data: T;
}

interface Failure {
    success: false;
    error: string;
}

type Result<T> = Success<T> | Failure;

function isSuccess<T>(result: Result<T>): result is Success<T> {
    return result.success === true;
}

function isFailure<T>(result: Result<T>): result is Failure {
    return result.success === false;
}

// 사용 예시
function parseJSON<T>(json: string): Result<T> {
    try {
        return { success: true, data: JSON.parse(json) };
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

const result1 = parseJSON<{ name: string }>('{"name": "Kim"}');
const result2 = parseJSON<number>("invalid json");

if (isSuccess(result1)) {
    console.log("Parsed:", result1.data.name);
}

if (isFailure(result2)) {
    console.log("Error:", result2.error);
}`,
        expected_output: `Parsed: Kim
Error: Unexpected token 'i', "invalid json" is not valid JSON`,
      },
      {
        title: '배열 필터링 타입 가드',
        code: `interface User {
    id: number;
    name: string;
    email?: string;
}

const users: (User | null | undefined)[] = [
    { id: 1, name: "Kim", email: "kim@mail.com" },
    null,
    { id: 2, name: "Lee" },
    undefined,
    { id: 3, name: "Park", email: "park@mail.com" }
];

// 타입 가드 함수
function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

function hasEmail(user: User): user is User & { email: string } {
    return user.email !== undefined;
}

// 필터링
const validUsers = users.filter(isDefined);
console.log("Valid users:", validUsers.length);

const usersWithEmail = validUsers.filter(hasEmail);
console.log("Users with email:", usersWithEmail.map(u => u.email).join(", "));`,
        expected_output: `Valid users: 3
Users with email: kim@mail.com, park@mail.com`,
      },
      {
        title: '속성 존재 검사',
        code: `function hasProperty<K extends string>(
    obj: object,
    key: K
): obj is object & Record<K, unknown> {
    return key in obj;
}

function hasProperties<K extends string>(
    obj: object,
    ...keys: K[]
): obj is object & Record<K, unknown> {
    return keys.every(key => key in obj);
}

// 사용 예시
const data: unknown = {
    name: "Kim",
    age: 25,
    email: "kim@mail.com"
};

if (typeof data === "object" && data !== null) {
    if (hasProperty(data, "name")) {
        console.log("Has name:", data.name);
    }

    if (hasProperties(data, "name", "age", "email")) {
        console.log("Full user:", data.name, data.age, data.email);
    }

    if (hasProperty(data, "address")) {
        console.log("Has address");
    } else {
        console.log("No address property");
    }
}`,
        expected_output: `Has name: Kim
Full user: Kim 25 kim@mail.com
No address property`,
      },
    ],
    keywords: ['타입서술어', 'is', '타입가드', '필터링'],
  },

  'ts-inter-distributive': {
    name: '공변성과 반공변성',
    description: '함수 타입 호환성',
    content: `# 공변성과 반공변성

## 공변성 (Covariance)

자식 타입을 부모 타입 위치에 사용 가능

\`\`\`typescript
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// 배열은 공변적
let animals: Animal[] = [];
let dogs: Dog[] = [{ name: "Buddy", breed: "Labrador" }];

animals = dogs;  // OK: Dog[] -> Animal[]
\`\`\`

## 반공변성 (Contravariance)

함수 매개변수는 반공변적

\`\`\`typescript
type Handler<T> = (value: T) => void;

let animalHandler: Handler<Animal> = (a) => console.log(a.name);
let dogHandler: Handler<Dog> = (d) => console.log(d.breed);

// 반공변: 매개변수 타입이 넓은 것을 좁은 위치에 할당 가능
dogHandler = animalHandler;  // OK
// animalHandler = dogHandler;  // 오류!
\`\`\`

## 이변성 (Bivariance)

TypeScript의 기본 함수 매개변수 동작 (strict 모드에서 변경됨)

## strictFunctionTypes

\`\`\`json
{
  "compilerOptions": {
    "strictFunctionTypes": true
  }
}
\`\`\`

strict 모드에서는 함수 매개변수가 반공변적으로 검사됩니다.`,
    runnable_examples: [
      {
        title: '공변성 예시',
        code: `interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

interface Cat extends Animal {
    color: string;
}

// 배열 공변성
function printAnimals(animals: Animal[]): void {
    animals.forEach(a => console.log(a.name));
}

const dogs: Dog[] = [
    { name: "Buddy", breed: "Labrador" },
    { name: "Max", breed: "Poodle" }
];

const cats: Cat[] = [
    { name: "Whiskers", color: "orange" }
];

// Dog[]와 Cat[]을 Animal[]로 사용 가능 (공변)
printAnimals(dogs);
printAnimals(cats);`,
        expected_output: `Buddy
Max
Whiskers`,
      },
      {
        title: '반공변성 예시',
        code: `interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

// 함수 타입
type AnimalCallback = (animal: Animal) => void;
type DogCallback = (dog: Dog) => void;

// Animal을 처리하는 함수
const handleAnimal: AnimalCallback = (animal) => {
    console.log(\`Animal: \${animal.name}\`);
};

// Dog를 처리하는 함수
const handleDog: DogCallback = (dog) => {
    console.log(\`Dog: \${dog.name}, Breed: \${dog.breed}\`);
};

// 반공변: AnimalCallback을 DogCallback 위치에 사용 가능
function processDog(callback: DogCallback): void {
    const dog: Dog = { name: "Buddy", breed: "Labrador" };
    callback(dog);
}

processDog(handleAnimal);  // OK: Animal 핸들러로 Dog 처리 가능
// processDog에 handleDog도 당연히 OK`,
        expected_output: `Animal: Buddy`,
      },
      {
        title: '실용 예시: 이벤트 핸들러',
        code: `interface Event {
    type: string;
    timestamp: number;
}

interface MouseEvent extends Event {
    x: number;
    y: number;
}

interface KeyboardEvent extends Event {
    key: string;
}

// 이벤트 핸들러 타입
type EventHandler<E extends Event> = (event: E) => void;

// 범용 이벤트 핸들러
const logEvent: EventHandler<Event> = (e) => {
    console.log(\`[\${e.type}] at \${e.timestamp}\`);
};

// 마우스 이벤트 핸들러
const logMouseEvent: EventHandler<MouseEvent> = (e) => {
    console.log(\`Mouse at (\${e.x}, \${e.y})\`);
};

// 반공변성: 범용 핸들러를 특정 이벤트에 사용 가능
function onMouseClick(handler: EventHandler<MouseEvent>): void {
    const event: MouseEvent = { type: "click", timestamp: Date.now(), x: 100, y: 200 };
    handler(event);
}

onMouseClick(logEvent);  // OK: Event 핸들러로 MouseEvent 처리
onMouseClick(logMouseEvent);  // OK: MouseEvent 핸들러로 처리`,
        expected_output: `[click] at 1705123456789
Mouse at (100, 200)`,
      },
    ],
    keywords: ['공변성', '반공변성', 'covariance', 'contravariance'],
  },

  'ts-inter-brand': {
    name: '브랜딩 타입',
    description: '타입 구분을 위한 브랜드',
    content: `# 브랜딩 타입 (Branded Types)

## 구조적 타이핑의 문제

\`\`\`typescript
type UserId = number;
type ProductId = number;

function getUser(id: UserId) { }
function getProduct(id: ProductId) { }

const userId: UserId = 1;
const productId: ProductId = 2;

getUser(productId);  // 오류 없음! (둘 다 number)
\`\`\`

## 브랜드로 구분하기

\`\`\`typescript
type UserId = number & { readonly __brand: unique symbol };
type ProductId = number & { readonly __brand: unique symbol };

function createUserId(id: number): UserId {
    return id as UserId;
}

function createProductId(id: number): ProductId {
    return id as ProductId;
}

const userId = createUserId(1);
const productId = createProductId(2);

getUser(userId);      // OK
// getUser(productId);   // 오류!
\`\`\`

## 실용 패턴

\`\`\`typescript
// 브랜드 헬퍼
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type Email = Brand<string, "Email">;
type URL = Brand<string, "URL">;

function validateEmail(email: string): Email {
    if (!email.includes("@")) throw new Error("Invalid email");
    return email as Email;
}
\`\`\``,
    runnable_examples: [
      {
        title: '브랜딩 기본',
        code: `// 브랜드 타입 정의
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

// 브랜드된 ID 타입
type UserId = Brand<number, "UserId">;
type OrderId = Brand<number, "OrderId">;

// 생성 함수
function createUserId(id: number): UserId {
    return id as UserId;
}

function createOrderId(id: number): OrderId {
    return id as OrderId;
}

// 사용 함수
function getUser(id: UserId): void {
    console.log(\`Getting user with ID: \${id}\`);
}

function getOrder(id: OrderId): void {
    console.log(\`Getting order with ID: \${id}\`);
}

const userId = createUserId(1);
const orderId = createOrderId(100);

getUser(userId);   // OK
getOrder(orderId); // OK

// getUser(orderId);  // 컴파일 오류! (타입 불일치)
// getOrder(userId);  // 컴파일 오류! (타입 불일치)`,
        expected_output: `Getting user with ID: 1
Getting order with ID: 100`,
      },
      {
        title: '검증된 문자열',
        code: `declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

type Email = Brand<string, "Email">;
type PhoneNumber = Brand<string, "PhoneNumber">;

// 검증 함수
function validateEmail(value: string): Email {
    if (!/^[^@]+@[^@]+\\.[^@]+$/.test(value)) {
        throw new Error("Invalid email format");
    }
    return value as Email;
}

function validatePhone(value: string): PhoneNumber {
    if (!/^\\d{3}-\\d{4}-\\d{4}$/.test(value)) {
        throw new Error("Invalid phone format (xxx-xxxx-xxxx)");
    }
    return value as PhoneNumber;
}

// 타입이 보장된 함수
function sendEmail(to: Email, subject: string): void {
    console.log(\`Sending "\${subject}" to \${to}\`);
}

// 사용
try {
    const email = validateEmail("user@example.com");
    const phone = validatePhone("010-1234-5678");

    sendEmail(email, "Hello!");
    console.log(\`Phone: \${phone}\`);

    // sendEmail(phone, "Test");  // 컴파일 오류!
} catch (e) {
    console.error((e as Error).message);
}`,
        expected_output: `Sending "Hello!" to user@example.com
Phone: 010-1234-5678`,
      },
      {
        title: '금액 타입',
        code: `declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

// 통화별 금액 타입
type KRW = Brand<number, "KRW">;
type USD = Brand<number, "USD">;

function krw(amount: number): KRW {
    return amount as KRW;
}

function usd(amount: number): USD {
    return amount as USD;
}

// 통화 변환
function usdToKrw(amount: USD, rate: number): KRW {
    return krw(amount * rate);
}

function formatKRW(amount: KRW): string {
    return \`\${amount.toLocaleString()}원\`;
}

function formatUSD(amount: USD): string {
    return \`$\${amount.toFixed(2)}\`;
}

// 사용
const price = usd(100);
const converted = usdToKrw(price, 1300);

console.log(\`USD: \${formatUSD(price)}\`);
console.log(\`KRW: \${formatKRW(converted)}\`);

// formatKRW(price);  // 컴파일 오류! USD를 KRW로 직접 사용 불가`,
        expected_output: `USD: $100.00
KRW: 130,000원`,
      },
    ],
    keywords: ['브랜딩', 'Brand', '타입구분', '명목적타입'],
  },

  'ts-inter-builder': {
    name: '빌더 패턴',
    description: '타입 안전한 빌더',
    content: `# 타입 안전한 빌더 패턴

## 기본 빌더

\`\`\`typescript
class QueryBuilder {
    private query: string[] = [];

    select(columns: string[]): this {
        this.query.push(\`SELECT \${columns.join(", ")}\`);
        return this;
    }

    from(table: string): this {
        this.query.push(\`FROM \${table}\`);
        return this;
    }

    build(): string {
        return this.query.join(" ");
    }
}
\`\`\`

## 타입 추적 빌더

\`\`\`typescript
interface Builder<T> {
    set<K extends keyof T>(key: K, value: T[K]): Builder<T>;
    build(): T;
}
\`\`\`

## 필수 속성 강제

\`\`\`typescript
type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface UserBuilder {
    name(n: string): UserBuilder & { __hasName: true };
    email(e: string): UserBuilder & { __hasEmail: true };
    build(): this extends { __hasName: true; __hasEmail: true } ? User : never;
}
\`\`\``,
    runnable_examples: [
      {
        title: '기본 빌더 패턴',
        code: `interface User {
    name: string;
    email: string;
    age?: number;
    role?: string;
}

class UserBuilder {
    private user: Partial<User> = {};

    name(name: string): this {
        this.user.name = name;
        return this;
    }

    email(email: string): this {
        this.user.email = email;
        return this;
    }

    age(age: number): this {
        this.user.age = age;
        return this;
    }

    role(role: string): this {
        this.user.role = role;
        return this;
    }

    build(): User {
        if (!this.user.name || !this.user.email) {
            throw new Error("name and email are required");
        }
        return this.user as User;
    }
}

const user1 = new UserBuilder()
    .name("Kim")
    .email("kim@mail.com")
    .age(25)
    .build();

const user2 = new UserBuilder()
    .name("Lee")
    .email("lee@mail.com")
    .role("admin")
    .build();

console.log("User 1:", user1);
console.log("User 2:", user2);`,
        expected_output: `User 1: { name: 'Kim', email: 'kim@mail.com', age: 25 }
User 2: { name: 'Lee', email: 'lee@mail.com', role: 'admin' }`,
      },
      {
        title: 'SQL 쿼리 빌더',
        code: `class QueryBuilder {
    private parts: string[] = [];
    private params: any[] = [];

    select(...columns: string[]): this {
        this.parts.push(\`SELECT \${columns.join(", ")}\`);
        return this;
    }

    from(table: string): this {
        this.parts.push(\`FROM \${table}\`);
        return this;
    }

    where(condition: string, value?: any): this {
        this.parts.push(\`WHERE \${condition}\`);
        if (value !== undefined) {
            this.params.push(value);
        }
        return this;
    }

    orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
        this.parts.push(\`ORDER BY \${column} \${direction}\`);
        return this;
    }

    limit(count: number): this {
        this.parts.push(\`LIMIT \${count}\`);
        return this;
    }

    build(): { sql: string; params: any[] } {
        return {
            sql: this.parts.join(" "),
            params: this.params
        };
    }
}

const query = new QueryBuilder()
    .select("id", "name", "email")
    .from("users")
    .where("age > ?", 18)
    .orderBy("name", "ASC")
    .limit(10)
    .build();

console.log("SQL:", query.sql);
console.log("Params:", query.params);`,
        expected_output: `SQL: SELECT id, name, email FROM users WHERE age > ? ORDER BY name ASC LIMIT 10
Params: [18]`,
      },
      {
        title: '타입 추적 빌더',
        code: `// 설정된 필드를 타입으로 추적
type Empty = {};
type WithName = { name: string };
type WithEmail = { email: string };

interface Config {
    name: string;
    email: string;
    port?: number;
}

class ConfigBuilder<T extends Partial<Config> = Empty> {
    private config: Partial<Config> = {};

    name(name: string): ConfigBuilder<T & WithName> {
        this.config.name = name;
        return this as any;
    }

    email(email: string): ConfigBuilder<T & WithEmail> {
        this.config.email = email;
        return this as any;
    }

    port(port: number): ConfigBuilder<T> {
        this.config.port = port;
        return this;
    }

    // 필수 필드가 있을 때만 build 가능
    build(this: ConfigBuilder<WithName & WithEmail>): Config {
        return this.config as Config;
    }
}

const config = new ConfigBuilder()
    .name("MyApp")
    .email("app@example.com")
    .port(3000)
    .build();  // OK: name과 email 모두 설정됨

console.log("Config:", config);

// new ConfigBuilder().name("Test").build();  // 컴파일 오류!`,
        expected_output: `Config: { name: 'MyApp', email: 'app@example.com', port: 3000 }`,
      },
    ],
    keywords: ['빌더패턴', 'Builder', '체이닝', '타입추적'],
  },

  'ts-inter-ambient': {
    name: '상태 머신 타입',
    description: '상태 전이 타입 안전성',
    content: `# 상태 머신 타입

## 상태와 전이 정의

\`\`\`typescript
type OrderState = "pending" | "paid" | "shipped" | "delivered";

type StateTransitions = {
    pending: "paid" | "cancelled";
    paid: "shipped" | "refunded";
    shipped: "delivered";
    delivered: never;
};
\`\`\`

## 타입 안전한 전이

\`\`\`typescript
type NextState<S extends OrderState> = StateTransitions[S];

function transition<S extends OrderState>(
    current: S,
    next: NextState<S>
): NextState<S> {
    return next;
}

transition("pending", "paid");      // OK
transition("pending", "shipped");   // 오류!
\`\`\`

## 상태별 데이터

\`\`\`typescript
type OrderData = {
    pending: { items: string[] };
    paid: { items: string[]; paidAt: Date };
    shipped: { items: string[]; paidAt: Date; trackingNo: string };
    delivered: { items: string[]; paidAt: Date; trackingNo: string; deliveredAt: Date };
};

type Order<S extends OrderState> = {
    state: S;
    data: OrderData[S];
};
\`\`\``,
    runnable_examples: [
      {
        title: '기본 상태 머신',
        code: `type OrderState = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// 상태별 허용 전이
type Transitions = {
    pending: "paid" | "cancelled";
    paid: "shipped" | "refunded";
    shipped: "delivered";
    delivered: never;
    cancelled: never;
};

// 상태 머신 클래스
class Order {
    constructor(private state: OrderState = "pending") {}

    getState(): OrderState {
        return this.state;
    }

    pay(): void {
        if (this.state !== "pending") {
            throw new Error(\`Cannot pay from \${this.state}\`);
        }
        this.state = "paid";
        console.log("Order paid");
    }

    ship(): void {
        if (this.state !== "paid") {
            throw new Error(\`Cannot ship from \${this.state}\`);
        }
        this.state = "shipped";
        console.log("Order shipped");
    }

    deliver(): void {
        if (this.state !== "shipped") {
            throw new Error(\`Cannot deliver from \${this.state}\`);
        }
        this.state = "delivered";
        console.log("Order delivered");
    }
}

const order = new Order();
console.log("Initial:", order.getState());
order.pay();
console.log("After pay:", order.getState());
order.ship();
console.log("After ship:", order.getState());
order.deliver();
console.log("After deliver:", order.getState());`,
        expected_output: `Initial: pending
Order paid
After pay: paid
Order shipped
After ship: shipped
Order delivered
After deliver: delivered`,
      },
      {
        title: '상태별 데이터',
        code: `// 상태별 데이터 타입
interface PendingOrder {
    state: "pending";
    items: string[];
}

interface PaidOrder {
    state: "paid";
    items: string[];
    paidAt: Date;
    amount: number;
}

interface ShippedOrder {
    state: "shipped";
    items: string[];
    paidAt: Date;
    amount: number;
    trackingNo: string;
}

type Order = PendingOrder | PaidOrder | ShippedOrder;

// 상태별 처리
function processOrder(order: Order): void {
    switch (order.state) {
        case "pending":
            console.log(\`Pending: \${order.items.length} items\`);
            break;
        case "paid":
            console.log(\`Paid: $\${order.amount} at \${order.paidAt.toISOString()}\`);
            break;
        case "shipped":
            console.log(\`Shipped: Tracking \${order.trackingNo}\`);
            break;
    }
}

const orders: Order[] = [
    { state: "pending", items: ["item1", "item2"] },
    { state: "paid", items: ["item1"], paidAt: new Date(), amount: 100 },
    { state: "shipped", items: ["item1"], paidAt: new Date(), amount: 50, trackingNo: "TRK123" }
];

orders.forEach(processOrder);`,
        expected_output: `Pending: 2 items
Paid: $100 at 2024-01-15T10:00:00.000Z
Shipped: Tracking TRK123`,
      },
      {
        title: '타입 안전한 전이',
        code: `// 제네릭 상태 머신
type StateMachine<States extends string, Transitions extends Record<States, States>> = {
    state: States;
    canTransition<S extends States>(from: S, to: Transitions[S]): boolean;
    transition<S extends States>(from: S, to: Transitions[S]): void;
};

// 문서 상태 예시
type DocState = "draft" | "review" | "approved" | "published";

const DocTransitions = {
    draft: ["review"] as const,
    review: ["draft", "approved"] as const,
    approved: ["published", "draft"] as const,
    published: [] as const
};

class Document {
    private state: DocState = "draft";

    getState(): DocState {
        return this.state;
    }

    private canTransitionTo(next: DocState): boolean {
        const allowed = DocTransitions[this.state] as readonly DocState[];
        return allowed.includes(next);
    }

    transitionTo(next: DocState): void {
        if (!this.canTransitionTo(next)) {
            throw new Error(\`Cannot transition from \${this.state} to \${next}\`);
        }
        console.log(\`\${this.state} -> \${next}\`);
        this.state = next;
    }
}

const doc = new Document();
doc.transitionTo("review");
doc.transitionTo("approved");
doc.transitionTo("published");

try {
    doc.transitionTo("draft");  // 에러: published -> draft 불가
} catch (e) {
    console.log("Error:", (e as Error).message);
}`,
        expected_output: `draft -> review
review -> approved
approved -> published
Error: Cannot transition from published to draft`,
      },
    ],
    keywords: ['상태머신', 'State Machine', '전이', '타입안전'],
  },

  'ts-inter-paths': {
    name: '팬텀 타입',
    description: '런타임에 없는 타입 정보',
    content: `# 팬텀 타입 (Phantom Types)

## 런타임에 없는 타입 매개변수

팬텀 타입은 타입 시스템에만 존재하고 런타임에는 없는 타입입니다.

\`\`\`typescript
// _T는 사용되지 않지만 타입 구분에 사용
class Box<_T> {
    constructor(private value: unknown) {}

    get(): unknown {
        return this.value;
    }
}

const stringBox = new Box<string>("hello");
const numberBox = new Box<number>(42);

// 타입 레벨에서 구분됨
// stringBox = numberBox;  // 오류 (TypeScript 4.0+)
\`\`\`

## 상태 추적

\`\`\`typescript
type Unvalidated = { __validated: false };
type Validated = { __validated: true };

class Form<State> {
    private data: Record<string, string>;

    constructor(data: Record<string, string>) {
        this.data = data;
    }

    validate(): Form<Validated> {
        // 검증 로직
        return this as unknown as Form<Validated>;
    }
}

function submit(form: Form<Validated>): void {
    // 검증된 폼만 제출 가능
}
\`\`\``,
    runnable_examples: [
      {
        title: '검증 상태 추적',
        code: `// 팬텀 타입으로 검증 상태 표현
type Unvalidated = { readonly __brand: "unvalidated" };
type Validated = { readonly __brand: "validated" };

class UserInput<State = Unvalidated> {
    constructor(
        public readonly email: string,
        public readonly password: string
    ) {}

    validate(): UserInput<Validated> | null {
        // 검증 로직
        if (!this.email.includes("@")) {
            console.log("Invalid email");
            return null;
        }
        if (this.password.length < 8) {
            console.log("Password too short");
            return null;
        }
        console.log("Validation passed");
        return this as unknown as UserInput<Validated>;
    }
}

// 검증된 입력만 받는 함수
function createAccount(input: UserInput<Validated>): void {
    console.log(\`Creating account for: \${input.email}\`);
}

// 사용
const input1 = new UserInput("invalid", "short");
const validated1 = input1.validate();
if (validated1) {
    createAccount(validated1);
}

const input2 = new UserInput("user@example.com", "password123");
const validated2 = input2.validate();
if (validated2) {
    createAccount(validated2);
}

// createAccount(input1);  // 컴파일 오류! Unvalidated 타입`,
        expected_output: `Invalid email
Validation passed
Creating account for: user@example.com`,
      },
      {
        title: '파일 상태 추적',
        code: `// 파일 상태 팬텀 타입
type Closed = { __state: "closed" };
type Open = { __state: "open" };

class File<State = Closed> {
    private content: string = "";
    private _isOpen: boolean = false;

    constructor(public readonly path: string) {}

    open(): File<Open> {
        console.log(\`Opening: \${this.path}\`);
        this._isOpen = true;
        return this as unknown as File<Open>;
    }

    // 열린 파일에서만 읽기 가능
    read(this: File<Open>): string {
        console.log(\`Reading: \${this.path}\`);
        return this.content;
    }

    // 열린 파일에서만 쓰기 가능
    write(this: File<Open>, data: string): void {
        console.log(\`Writing to: \${this.path}\`);
        this.content = data;
    }

    close(this: File<Open>): File<Closed> {
        console.log(\`Closing: \${this.path}\`);
        this._isOpen = false;
        return this as unknown as File<Closed>;
    }
}

// 사용
const file = new File("test.txt");

// file.read();  // 컴파일 오류! 닫힌 파일

const openFile = file.open();
openFile.write("Hello, World!");
const content = openFile.read();
const closedFile = openFile.close();

// closedFile.read();  // 컴파일 오류! 다시 닫힘`,
        expected_output: `Opening: test.txt
Writing to: test.txt
Reading: test.txt
Closing: test.txt`,
      },
      {
        title: '단위 타입 안전성',
        code: `// 단위 팬텀 타입
type Meters = { __unit: "meters" };
type Feet = { __unit: "feet" };
type Seconds = { __unit: "seconds" };

type Length<U> = number & U;
type Time<U> = number & U;

function meters(value: number): Length<Meters> {
    return value as Length<Meters>;
}

function feet(value: number): Length<Feet> {
    return value as Length<Feet>;
}

function seconds(value: number): Time<Seconds> {
    return value as Time<Seconds>;
}

// 같은 단위끼리만 연산 가능
function addLengths<U>(a: Length<U>, b: Length<U>): Length<U> {
    return (a + b) as Length<U>;
}

// 단위 변환
function feetToMeters(f: Length<Feet>): Length<Meters> {
    return meters(f * 0.3048);
}

// 사용
const distance1 = meters(100);
const distance2 = meters(50);
const total = addLengths(distance1, distance2);

console.log(\`Total: \${total}m\`);

const inFeet = feet(328);
const converted = feetToMeters(inFeet);
console.log(\`328ft = \${converted.toFixed(2)}m\`);

// addLengths(distance1, inFeet);  // 컴파일 오류! 단위 불일치`,
        expected_output: `Total: 150m
328ft = 99.97m`,
      },
    ],
    keywords: ['팬텀타입', 'Phantom', '타입매개변수', '상태추적'],
  },

  'ts-inter-module-resolution': {
    name: '고차 타입 패턴',
    description: 'Higher-Kinded Types 시뮬레이션',
    content: `# 고차 타입 패턴

## TypeScript의 한계

TypeScript는 진정한 고차 타입(HKT)를 지원하지 않습니다.
하지만 여러 패턴으로 유사하게 구현할 수 있습니다.

## 인터페이스 매핑

\`\`\`typescript
interface TypeMap {
    Array: unknown[];
    Promise: Promise<unknown>;
    Option: unknown | null;
}

type Apply<F extends keyof TypeMap, A> =
    F extends "Array" ? A[] :
    F extends "Promise" ? Promise<A> :
    F extends "Option" ? A | null :
    never;
\`\`\`

## 제네릭 함수 타입

\`\`\`typescript
type Functor<F extends keyof TypeMap> = {
    map: <A, B>(fa: Apply<F, A>, f: (a: A) => B) => Apply<F, B>;
};
\`\`\`

## 실용적인 접근

\`\`\`typescript
// 타입 클래스 패턴
interface Mappable<T> {
    map<U>(f: (value: T) => U): Mappable<U>;
}

class Box<T> implements Mappable<T> {
    constructor(private value: T) {}

    map<U>(f: (value: T) => U): Box<U> {
        return new Box(f(this.value));
    }
}
\`\`\``,
    runnable_examples: [
      {
        title: '타입 매핑',
        code: `// 타입 생성자 시뮬레이션
interface TypeConstructors {
    Array: unknown[];
    Set: Set<unknown>;
    Map: Map<string, unknown>;
}

// 타입 적용
type ApplyType<
    F extends keyof TypeConstructors,
    T
> = F extends "Array" ? T[]
  : F extends "Set" ? Set<T>
  : F extends "Map" ? Map<string, T>
  : never;

// 팩토리 함수
function createContainer<F extends keyof TypeConstructors>(
    type: F
): <T>(value: T) => ApplyType<F, T> {
    switch (type) {
        case "Array":
            return ((value: any) => [value]) as any;
        case "Set":
            return ((value: any) => new Set([value])) as any;
        case "Map":
            return ((value: any) => new Map([["value", value]])) as any;
        default:
            throw new Error("Unknown type");
    }
}

const createArray = createContainer("Array");
const createSet = createContainer("Set");

console.log("Array:", createArray(42));
console.log("Set:", createSet("hello"));`,
        expected_output: `Array: [42]
Set: Set(1) { 'hello' }`,
      },
      {
        title: 'Functor 패턴',
        code: `// Functor 인터페이스
interface Functor<T> {
    map<U>(f: (value: T) => U): Functor<U>;
}

// Box Functor
class Box<T> implements Functor<T> {
    constructor(private value: T) {}

    map<U>(f: (value: T) => U): Box<U> {
        return new Box(f(this.value));
    }

    getValue(): T {
        return this.value;
    }
}

// Maybe Functor
class Maybe<T> implements Functor<T> {
    constructor(private value: T | null) {}

    static some<T>(value: T): Maybe<T> {
        return new Maybe(value);
    }

    static none<T>(): Maybe<T> {
        return new Maybe<T>(null);
    }

    map<U>(f: (value: T) => U): Maybe<U> {
        if (this.value === null) {
            return Maybe.none<U>();
        }
        return Maybe.some(f(this.value));
    }

    getValue(): T | null {
        return this.value;
    }
}

// 사용
const box = new Box(5)
    .map(x => x * 2)
    .map(x => x + 1)
    .map(x => \`Result: \${x}\`);

console.log(box.getValue());

const maybe = Maybe.some(10)
    .map(x => x * 3)
    .map(x => \`Value: \${x}\`);

console.log(maybe.getValue());

const none = Maybe.none<number>()
    .map(x => x * 2);

console.log("None:", none.getValue());`,
        expected_output: `Result: 11
Value: 30
None: null`,
      },
      {
        title: 'Monad 패턴',
        code: `// Monad 인터페이스
interface Monad<T> {
    map<U>(f: (value: T) => U): Monad<U>;
    flatMap<U>(f: (value: T) => Monad<U>): Monad<U>;
}

// Result Monad (Either 패턴)
class Result<T, E = Error> implements Monad<T> {
    private constructor(
        private readonly value: T | null,
        private readonly error: E | null
    ) {}

    static ok<T, E = Error>(value: T): Result<T, E> {
        return new Result<T, E>(value, null);
    }

    static err<T, E = Error>(error: E): Result<T, E> {
        return new Result<T, E>(null, error);
    }

    map<U>(f: (value: T) => U): Result<U, E> {
        if (this.error !== null) {
            return Result.err<U, E>(this.error);
        }
        return Result.ok(f(this.value!));
    }

    flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
        if (this.error !== null) {
            return Result.err<U, E>(this.error);
        }
        return f(this.value!);
    }

    match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
        if (this.error !== null) {
            return onErr(this.error);
        }
        return onOk(this.value!);
    }
}

// 사용
function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return Result.err("Division by zero");
    return Result.ok(a / b);
}

function sqrt(n: number): Result<number, string> {
    if (n < 0) return Result.err("Negative number");
    return Result.ok(Math.sqrt(n));
}

const result1 = divide(10, 2)
    .flatMap(x => sqrt(x))
    .map(x => \`Result: \${x.toFixed(2)}\`);

console.log(result1.match(v => v, e => \`Error: \${e}\`));

const result2 = divide(10, 0)
    .flatMap(x => sqrt(x))
    .map(x => \`Result: \${x.toFixed(2)}\`);

console.log(result2.match(v => v, e => \`Error: \${e}\`));`,
        expected_output: `Result: 2.24
Error: Division by zero`,
      },
    ],
    keywords: ['HKT', 'Functor', 'Monad', '함수형'],
  },

  'ts-inter-generic-default': {
    name: '타입 성능 최적화',
    description: '컴파일 시간 개선',
    content: `# 타입 성능 최적화

## 타입 복잡도 문제

복잡한 타입은 컴파일 시간을 늘립니다.

\`\`\`typescript
// 피하기: 깊은 재귀
type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

// 대안: 깊이 제한
type DeepPartialN<T, N extends number> = ...;
\`\`\`

## 조건부 타입 최적화

\`\`\`typescript
// 분배 방지
type NoDistribute<T> = [T] extends [any] ? ... : ...;

// 캐싱 활용
type CachedExtract<T, U> = T extends U ? T : never;
\`\`\`

## 인터페이스 vs 타입

\`\`\`typescript
// 인터페이스: 선언 병합, 캐싱 최적화
interface User {
    name: string;
}

// 타입: 매번 계산
type User = {
    name: string;
};
\`\`\`

## 실용 팁

1. **인터페이스 선호**: 객체 타입은 interface 사용
2. **재귀 제한**: 깊이 제한 매개변수 추가
3. **유니온 축소**: 큰 유니온 분할
4. **any 전략적 사용**: 내부 구현에서 필요시
5. **타입 캐싱**: 자주 사용하는 타입 미리 정의`,
    runnable_examples: [
      {
        title: '재귀 깊이 제한',
        code: `// 깊이 제한 없는 DeepPartial (성능 문제 가능)
type DeepPartialUnlimited<T> = T extends object
    ? { [K in keyof T]?: DeepPartialUnlimited<T[K]> }
    : T;

// 깊이 제한 있는 버전
type Prev = [never, 0, 1, 2, 3, 4, 5];

type DeepPartialN<T, N extends number = 5> = N extends 0
    ? T
    : T extends object
        ? { [K in keyof T]?: DeepPartialN<T[K], Prev[N]> }
        : T;

// 사용
interface Config {
    server: {
        host: string;
        ports: {
            http: number;
            https: number;
        };
    };
}

type PartialConfig = DeepPartialN<Config, 2>;

const config: PartialConfig = {
    server: {
        host: "localhost"
        // ports 생략 가능
    }
};

console.log("Config:", JSON.stringify(config));`,
        expected_output: `Config: {"server":{"host":"localhost"}}`,
      },
      {
        title: '유니온 분할',
        code: `// 큰 유니온 대신 분류된 유니온 사용

// 피하기: 모든 이벤트를 하나의 유니온으로
// type Event = MouseEvent | KeyboardEvent | TouchEvent | ... (100개);

// 권장: 카테고리별 분할
type MouseEvents = "click" | "dblclick" | "mousedown" | "mouseup";
type KeyboardEvents = "keydown" | "keyup" | "keypress";
type TouchEvents = "touchstart" | "touchend" | "touchmove";

// 필요할 때만 조합
type AllEvents = MouseEvents | KeyboardEvents | TouchEvents;

// 카테고리별 핸들러
type EventHandlers = {
    mouse: Record<MouseEvents, () => void>;
    keyboard: Record<KeyboardEvents, () => void>;
    touch: Record<TouchEvents, () => void>;
};

const handlers: Partial<EventHandlers> = {
    mouse: {
        click: () => console.log("clicked"),
        dblclick: () => console.log("double clicked"),
        mousedown: () => console.log("mouse down"),
        mouseup: () => console.log("mouse up")
    }
};

handlers.mouse?.click();
handlers.mouse?.dblclick();`,
        expected_output: `clicked
double clicked`,
      },
      {
        title: '타입 캐싱',
        code: `// 반복 계산 대신 캐싱

// 기본 유틸리티 타입 미리 정의
interface BaseUser {
    id: number;
    name: string;
    email: string;
}

// 자주 사용하는 변형 캐싱
type UserWithoutId = Omit<BaseUser, "id">;
type PartialUser = Partial<BaseUser>;
type ReadonlyUser = Readonly<BaseUser>;
type UserKeys = keyof BaseUser;

// 조합 타입도 캐싱
type CreateUserInput = UserWithoutId;
type UpdateUserInput = Partial<UserWithoutId>;

// 사용
function createUser(input: CreateUserInput): BaseUser {
    return {
        id: Math.floor(Math.random() * 1000),
        ...input
    };
}

function updateUser(id: number, input: UpdateUserInput): BaseUser {
    const user = createUser({ name: "temp", email: "temp@mail.com" });
    return { ...user, id, ...input };
}

const newUser = createUser({ name: "Kim", email: "kim@mail.com" });
console.log("Created:", newUser);

const updated = updateUser(newUser.id, { name: "Lee" });
console.log("Updated:", updated);`,
        expected_output: `Created: { id: 123, name: 'Kim', email: 'kim@mail.com' }
Updated: { id: 123, name: 'Lee', email: 'kim@mail.com' }`,
      },
    ],
    keywords: ['성능', '최적화', '컴파일시간', '캐싱'],
  },

  'ts-basics-satisfies': {
    name: '타입 테스트',
    description: '타입 수준 테스트',
    content: `# 타입 테스트

## 타입 동등성 검사

\`\`\`typescript
type Equals<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;

type Test1 = Equals<string, string>;  // true
type Test2 = Equals<string, number>;  // false
\`\`\`

## Expect 패턴

\`\`\`typescript
type Expect<T extends true> = T;
type ExpectFalse<T extends false> = T;

// 사용
type Case1 = Expect<Equals<1, 1>>;  // OK
// type Case2 = Expect<Equals<1, 2>>;  // 오류
\`\`\`

## 실제 테스트

\`\`\`typescript
// 유틸리티 타입 테스트
type TestPartial = Expect<Equals<
    Partial<{ a: string; b: number }>,
    { a?: string; b?: number }
>>;

type TestPick = Expect<Equals<
    Pick<{ a: string; b: number }, "a">,
    { a: string }
>>;
\`\`\`

## 라이브러리

- **tsd**: CLI 타입 테스트
- **@type-challenges/utils**: 타입 테스트 유틸리티
- **expect-type**: 런타임 없는 타입 테스트`,
    runnable_examples: [
      {
        title: '타입 테스트 유틸리티',
        code: `// 타입 동등성 검사
type Equals<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;

// 테스트 유틸리티
type Expect<T extends true> = T;

// 테스트 케이스들
type TestString = Equals<string, string>;  // true
type TestNumber = Equals<number, number>;  // true
type TestMixed = Equals<string, number>;   // false

// Expect로 검증 (컴파일 시 체크)
type Case1 = Expect<TestString>;
type Case2 = Expect<TestNumber>;
// type Case3 = Expect<TestMixed>;  // 컴파일 오류!

// 런타임에서 결과 확인 (시뮬레이션)
console.log("string = string:", true);  // TestString
console.log("number = number:", true);  // TestNumber
console.log("string = number:", false); // TestMixed`,
        expected_output: `string = string: true
number = number: true
string = number: false`,
      },
      {
        title: '유틸리티 타입 테스트',
        code: `// 타입 동등성
type Equals<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;

type Expect<T extends true> = T;

// 테스트 대상 타입
interface User {
    id: number;
    name: string;
    email: string;
}

// Partial 테스트
type TestPartial = Expect<Equals<
    Partial<User>,
    { id?: number; name?: string; email?: string }
>>;

// Pick 테스트
type TestPick = Expect<Equals<
    Pick<User, "id" | "name">,
    { id: number; name: string }
>>;

// Omit 테스트
type TestOmit = Expect<Equals<
    Omit<User, "email">,
    { id: number; name: string }
>>;

console.log("Partial test passed");
console.log("Pick test passed");
console.log("Omit test passed");

// 실제 사용
const partialUser: Partial<User> = { name: "Kim" };
const pickedUser: Pick<User, "id" | "name"> = { id: 1, name: "Lee" };

console.log("Partial user:", partialUser);
console.log("Picked user:", pickedUser);`,
        expected_output: `Partial test passed
Pick test passed
Omit test passed
Partial user: { name: 'Kim' }
Picked user: { id: 1, name: 'Lee' }`,
      },
      {
        title: '커스텀 타입 테스트',
        code: `// 테스트 유틸리티
type Equals<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2) ? true : false;

type Expect<T extends true> = T;

// 커스텀 타입: NonNullableKeys
type NonNullableKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

// 테스트
interface Config {
    host: string;
    port?: number;
    debug?: boolean;
}

type TestNonNullableKeys = Expect<Equals<
    NonNullableKeys<Config>,
    "host"
>>;

// 커스텀 타입: RequiredKeys
type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type TestRequiredKeys = Expect<Equals<
    RequiredKeys<Config>,
    "host"
>>;

// 런타임 검증
function validateConfig(config: Pick<Config, "host">): void {
    console.log(\`Config validated: \${config.host}\`);
}

validateConfig({ host: "localhost" });
console.log("All type tests passed!");`,
        expected_output: `Config validated: localhost
All type tests passed!`,
      },
    ],
    keywords: ['타입테스트', 'Equals', 'Expect', '타입검증'],
  },

  'ts-basics-as': {
    name: '타입 안전 에러 처리',
    description: 'Result, Option 패턴',
    content: `# 타입 안전 에러 처리

## 문제: 예외 던지기

\`\`\`typescript
// 타입에서 에러 가능성을 알 수 없음
function divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
}
\`\`\`

## Result 타입

\`\`\`typescript
type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return { ok: false, error: "Division by zero" };
    return { ok: true, value: a / b };
}
\`\`\`

## Option 타입

\`\`\`typescript
type Option<T> = T | null;

function find<T>(arr: T[], pred: (item: T) => boolean): Option<T> {
    for (const item of arr) {
        if (pred(item)) return item;
    }
    return null;
}
\`\`\`

## 장점

1. **명시적**: 타입에서 실패 가능성 표현
2. **강제 처리**: 에러 케이스 무시 불가
3. **조합 가능**: map, flatMap으로 연결
4. **예측 가능**: try-catch 없이 흐름 제어`,
    runnable_examples: [
      {
        title: 'Result 패턴',
        code: `type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };

// 헬퍼 함수
const ok = <T, E>(value: T): Result<T, E> => ({ ok: true, value });
const err = <T, E>(error: E): Result<T, E> => ({ ok: false, error });

// Result 사용 함수
function parseNumber(str: string): Result<number, string> {
    const num = Number(str);
    if (isNaN(num)) return err(\`Invalid number: \${str}\`);
    return ok(num);
}

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return err("Division by zero");
    return ok(a / b);
}

// 사용
function calculate(aStr: string, bStr: string): Result<number, string> {
    const aResult = parseNumber(aStr);
    if (!aResult.ok) return aResult;

    const bResult = parseNumber(bStr);
    if (!bResult.ok) return bResult;

    return divide(aResult.value, bResult.value);
}

const r1 = calculate("10", "2");
const r2 = calculate("10", "0");
const r3 = calculate("abc", "2");

console.log("10 / 2:", r1.ok ? r1.value : r1.error);
console.log("10 / 0:", r2.ok ? r2.value : r2.error);
console.log("abc / 2:", r3.ok ? r3.value : r3.error);`,
        expected_output: `10 / 2: 5
10 / 0: Division by zero
abc / 2: Invalid number: abc`,
      },
      {
        title: 'Option 패턴',
        code: `type Option<T> = { some: true; value: T } | { some: false };

const some = <T>(value: T): Option<T> => ({ some: true, value });
const none = <T>(): Option<T> => ({ some: false });

// Option 유틸리티
function optionMap<T, U>(opt: Option<T>, f: (v: T) => U): Option<U> {
    if (!opt.some) return none();
    return some(f(opt.value));
}

function optionFlatMap<T, U>(opt: Option<T>, f: (v: T) => Option<U>): Option<U> {
    if (!opt.some) return none();
    return f(opt.value);
}

// 사용 예시
interface User {
    id: number;
    name: string;
    email?: string;
}

function findUser(id: number): Option<User> {
    const users: User[] = [
        { id: 1, name: "Kim", email: "kim@mail.com" },
        { id: 2, name: "Lee" }  // email 없음
    ];
    const user = users.find(u => u.id === id);
    return user ? some(user) : none();
}

function getEmail(user: User): Option<string> {
    return user.email ? some(user.email) : none();
}

// 체이닝
const user1Email = optionFlatMap(findUser(1), getEmail);
const user2Email = optionFlatMap(findUser(2), getEmail);
const user3Email = optionFlatMap(findUser(3), getEmail);

console.log("User 1 email:", user1Email.some ? user1Email.value : "none");
console.log("User 2 email:", user2Email.some ? user2Email.value : "none");
console.log("User 3 email:", user3Email.some ? user3Email.value : "none");`,
        expected_output: `User 1 email: kim@mail.com
User 2 email: none
User 3 email: none`,
      },
      {
        title: 'async Result 패턴',
        code: `type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };

const ok = <T, E>(value: T): Result<T, E> => ({ ok: true, value });
const err = <T, E>(error: E): Result<T, E> => ({ ok: false, error });

// async Result 래퍼
async function tryCatch<T, E = Error>(
    fn: () => Promise<T>,
    mapError: (e: unknown) => E = (e => e as E)
): Promise<Result<T, E>> {
    try {
        const value = await fn();
        return ok(value);
    } catch (e) {
        return err(mapError(e));
    }
}

// API 시뮬레이션
async function fetchData(id: number): Promise<{ data: string }> {
    if (id < 0) throw new Error("Invalid ID");
    if (id === 0) throw new Error("Not found");
    return { data: \`Data for \${id}\` };
}

// 사용
async function loadData(id: number): Promise<Result<string, string>> {
    const result = await tryCatch(
        () => fetchData(id),
        (e) => (e as Error).message
    );

    if (!result.ok) return result;
    return ok(result.value.data);
}

// 테스트
async function main() {
    const r1 = await loadData(1);
    const r2 = await loadData(0);
    const r3 = await loadData(-1);

    console.log("ID 1:", r1.ok ? r1.value : r1.error);
    console.log("ID 0:", r2.ok ? r2.value : r2.error);
    console.log("ID -1:", r3.ok ? r3.value : r3.error);
}

main();`,
        expected_output: `ID 1: Data for 1
ID 0: Not found
ID -1: Invalid ID`,
      },
    ],
    keywords: ['Result', 'Option', '에러처리', '타입안전'],
  },

  'ts-basics-intersection': {
    name: '데코레이터 타입',
    description: 'TypeScript 5.0 데코레이터',
    content: `# 데코레이터 타입

## TypeScript 5.0 데코레이터

\`\`\`typescript
function log<T extends (...args: any[]) => any>(
    target: T,
    context: ClassMethodDecoratorContext
): T {
    return function(...args: Parameters<T>): ReturnType<T> {
        console.log(\`Calling \${String(context.name)}\`);
        return target.apply(this, args);
    } as T;
}
\`\`\`

## 클래스 데코레이터

\`\`\`typescript
function sealed<T extends new (...args: any[]) => any>(
    target: T,
    context: ClassDecoratorContext
): T {
    Object.seal(target);
    Object.seal(target.prototype);
    return target;
}

@sealed
class MyClass { }
\`\`\`

## 필드 데코레이터

\`\`\`typescript
function required<T, V>(
    target: undefined,
    context: ClassFieldDecoratorContext<T, V>
): (value: V) => V {
    return function(value: V): V {
        if (value === undefined || value === null) {
            throw new Error(\`\${String(context.name)} is required\`);
        }
        return value;
    };
}
\`\`\`

## 접근자 데코레이터

\`\`\`typescript
function memoize<T, V>(
    target: () => V,
    context: ClassGetterDecoratorContext<T, V>
): () => V {
    const cache = new WeakMap<object, V>();
    return function(this: T): V {
        if (cache.has(this as object)) {
            return cache.get(this as object)!;
        }
        const value = target.call(this);
        cache.set(this as object, value);
        return value;
    };
}
\`\`\``,
    runnable_examples: [
      {
        title: '메서드 데코레이터 시뮬레이션',
        code: `// 데코레이터 시뮬레이션 (experimentalDecorators 없이)

// 로깅 데코레이터
function createLoggedMethod<T extends (...args: any[]) => any>(
    fn: T,
    name: string
): T {
    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
        console.log(\`Calling \${name} with args:\`, args);
        const result = fn.apply(this, args);
        console.log(\`Result:\`, result);
        return result;
    } as T;
}

// 클래스
class Calculator {
    add(a: number, b: number): number {
        return a + b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }
}

// 데코레이터 적용
const calc = new Calculator();
calc.add = createLoggedMethod(calc.add.bind(calc), "add");
calc.multiply = createLoggedMethod(calc.multiply.bind(calc), "multiply");

calc.add(3, 5);
calc.multiply(4, 6);`,
        expected_output: `Calling add with args: [3, 5]
Result: 8
Calling multiply with args: [4, 6]
Result: 24`,
      },
      {
        title: '유효성 검사 데코레이터',
        code: `// 유효성 검사 데코레이터 패턴

type Validator<T> = (value: T) => boolean;

interface ValidatedClass {
    __validators?: Map<string, Validator<any>[]>;
}

// 필드 검증기 추가
function addValidator<T>(
    target: ValidatedClass,
    field: string,
    validator: Validator<T>
): void {
    if (!target.__validators) {
        target.__validators = new Map();
    }
    const validators = target.__validators.get(field) || [];
    validators.push(validator);
    target.__validators.set(field, validators);
}

// 검증 실행
function validate(obj: ValidatedClass): string[] {
    const errors: string[] = [];
    const validators = obj.__validators;

    if (validators) {
        for (const [field, fns] of validators) {
            const value = (obj as any)[field];
            for (const fn of fns) {
                if (!fn(value)) {
                    errors.push(\`Validation failed for \${field}\`);
                }
            }
        }
    }

    return errors;
}

// 사용
class User implements ValidatedClass {
    __validators?: Map<string, Validator<any>[]>;
    name: string;
    age: number;
    email: string;

    constructor(name: string, age: number, email: string) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}

// 검증기 등록
const user = new User("", -5, "invalid");
addValidator(user, "name", (v: string) => v.length > 0);
addValidator(user, "age", (v: number) => v >= 0);
addValidator(user, "email", (v: string) => v.includes("@"));

const errors = validate(user);
console.log("Validation errors:", errors);

const validUser = new User("Kim", 25, "kim@mail.com");
addValidator(validUser, "name", (v: string) => v.length > 0);
addValidator(validUser, "age", (v: number) => v >= 0);
addValidator(validUser, "email", (v: string) => v.includes("@"));

const validErrors = validate(validUser);
console.log("Valid user errors:", validErrors.length === 0 ? "none" : validErrors);`,
        expected_output: `Validation errors: ["Validation failed for name", "Validation failed for age", "Validation failed for email"]
Valid user errors: none`,
      },
      {
        title: '메모이제이션 패턴',
        code: `// 메모이제이션 데코레이터 패턴

function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();

    return function(...args: Parameters<T>): ReturnType<T> {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            console.log(\`Cache hit for \${key}\`);
            return cache.get(key)!;
        }

        console.log(\`Computing for \${key}\`);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    } as T;
}

// 비용이 큰 계산
function expensiveCalculation(n: number): number {
    console.log(\`  (calculating fib(\${n})...)\`);
    if (n <= 1) return n;
    return expensiveCalculation(n - 1) + expensiveCalculation(n - 2);
}

// 메모이즈된 버전
const memoizedFib = memoize((n: number): number => {
    if (n <= 1) return n;
    return memoizedFib(n - 1) + memoizedFib(n - 2);
});

console.log("=== Without memoization (small n) ===");
console.log(\`fib(5) = \${expensiveCalculation(5)}\`);

console.log("\\n=== With memoization ===");
console.log(\`fib(10) = \${memoizedFib(10)}\`);
console.log(\`fib(10) again = \${memoizedFib(10)}\`);  // 캐시 히트`,
        expected_output: `=== Without memoization (small n) ===
  (calculating fib(5)...)
  (calculating fib(4)...)
  (calculating fib(3)...)
  (calculating fib(2)...)
  (calculating fib(1)...)
  (calculating fib(0)...)
  (calculating fib(1)...)
  (calculating fib(2)...)
  (calculating fib(1)...)
  (calculating fib(0)...)
  (calculating fib(3)...)
  (calculating fib(2)...)
  (calculating fib(1)...)
  (calculating fib(0)...)
  (calculating fib(1)...)
fib(5) = 5

=== With memoization ===
Computing for [10]
Computing for [9]
Computing for [8]
Computing for [7]
Computing for [6]
Computing for [5]
Computing for [4]
Computing for [3]
Computing for [2]
Computing for [1]
Computing for [0]
Cache hit for [1]
Cache hit for [2]
Cache hit for [3]
Cache hit for [4]
Cache hit for [5]
Cache hit for [6]
Cache hit for [7]
Cache hit for [8]
fib(10) = 55
Cache hit for [10]
fib(10) again = 55`,
      },
    ],
    keywords: ['데코레이터', 'decorator', '메타프로그래밍'],
  },
};
