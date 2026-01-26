/**
 * TypeScript 기초 (beginner) 개념 콘텐츠
 * 대상: TypeScript 기본 문법을 아는 학습자
 * 특징: 제네릭, 유틸리티 타입, 실용 패턴 중심
 */

export const TS_BEGINNER_CONCEPTS = {
  'ts-basics-generic-what': {
    name: '제네릭 기본',
    description: '<T>의 의미와 필요성',
    content: `# 제네릭 기본

## 타입을 변수처럼

제네릭은 **타입을 매개변수로 받는 것**입니다.
함수를 만들 때 값을 매개변수로 받듯이, 타입도 매개변수로 받을 수 있습니다.

\`\`\`typescript
// 값 매개변수
function identity(value: number): number {
    return value;
}

// 타입 매개변수 (제네릭)
function identity<T>(value: T): T {
    return value;
}
\`\`\`

## 왜 필요한가?

### 문제: 타입별로 함수 만들기

\`\`\`typescript
function identityNumber(value: number): number { return value; }
function identityString(value: string): string { return value; }
function identityBoolean(value: boolean): boolean { return value; }
// ... 끝이 없음
\`\`\`

### 해결: 제네릭

\`\`\`typescript
function identity<T>(value: T): T {
    return value;
}

identity<number>(42);      // T = number
identity<string>("hello"); // T = string
identity(true);            // T = boolean (추론)
\`\`\`

## 타입 추론

타입을 명시하지 않아도 TypeScript가 추론합니다.

\`\`\`typescript
const num = identity(42);      // T는 number로 추론
const str = identity("hello"); // T는 string으로 추론
\`\`\`

## 여러 타입 매개변수

\`\`\`typescript
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

pair<string, number>("age", 25);  // ["age", 25]
pair("name", "Kim");              // ["name", "Kim"]
\`\`\``,
    runnable_examples: [
      {
        title: '제네릭 함수 기본',
        code: `// 제네릭 함수
function identity<T>(value: T): T {
    return value;
}

// 타입 명시
console.log(identity<number>(42));
console.log(identity<string>("Hello"));

// 타입 추론
console.log(identity(true));
console.log(identity([1, 2, 3]));`,
        expected_output: `42
Hello
true
[1, 2, 3]`,
      },
      {
        title: '여러 타입 매개변수',
        code: `function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

function swap<A, B>(tuple: [A, B]): [B, A] {
    return [tuple[1], tuple[0]];
}

const p1 = pair("name", "Kim");
const p2 = pair("age", 25);
const swapped = swap(p2);

console.log("pair1:", p1);
console.log("pair2:", p2);
console.log("swapped:", swapped);`,
        expected_output: `pair1: ["name", "Kim"]
pair2: ["age", 25]
swapped: [25, "age"]`,
      },
      {
        title: '배열과 제네릭',
        code: `function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

function last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

const numbers = [10, 20, 30];
const strings = ["a", "b", "c"];

console.log("first number:", first(numbers));
console.log("last string:", last(strings));

// 빈 배열
console.log("empty:", first([]));`,
        expected_output: `first number: 10
last string: c
empty: undefined`,
      },
    ],
    keywords: ['제네릭', 'generic', '<T>', '타입매개변수'],
  },

  'ts-inter-generic-constraint': {
    name: '제네릭 제약',
    description: 'extends로 타입 제한',
    content: `# 제네릭 제약

## 타입 범위 제한하기

\`extends\`를 사용해 제네릭 타입을 제한할 수 있습니다.

\`\`\`typescript
// T는 반드시 length 속성을 가져야 함
function getLength<T extends { length: number }>(item: T): number {
    return item.length;
}

getLength("hello");     // OK, string은 length 있음
getLength([1, 2, 3]);   // OK, 배열도 length 있음
// getLength(123);      // 오류! number는 length 없음
\`\`\`

## 기본 제약 패턴

### 특정 타입 확장

\`\`\`typescript
function processArray<T extends any[]>(arr: T): number {
    return arr.length;
}
\`\`\`

### 객체 제약

\`\`\`typescript
function getProperty<T extends object, K extends keyof T>(
    obj: T,
    key: K
): T[K] {
    return obj[key];
}
\`\`\`

## keyof와 함께 사용

\`\`\`typescript
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        result[key] = obj[key];
    }
    return result;
}
\`\`\`

## 제약의 장점

1. **타입 안전성**: 필요한 속성이 있음을 보장
2. **자동 완성**: 제약된 타입의 멤버 접근 가능
3. **오류 조기 발견**: 컴파일 시 문제 파악`,
    runnable_examples: [
      {
        title: '기본 제약',
        code: `// length 속성을 가진 타입만 허용
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(item: T): void {
    console.log(\`길이: \${item.length}\`);
}

logLength("Hello");
logLength([1, 2, 3, 4, 5]);
logLength({ length: 10, value: "test" });
// logLength(123);  // Error! number has no length`,
        expected_output: `길이: 5
길이: 5
길이: 10`,
      },
      {
        title: 'keyof 제약',
        code: `function getProperty<T, K extends keyof T>(
    obj: T,
    key: K
): T[K] {
    return obj[key];
}

const user = {
    name: "Kim",
    age: 25,
    email: "kim@mail.com"
};

console.log("name:", getProperty(user, "name"));
console.log("age:", getProperty(user, "age"));
console.log("email:", getProperty(user, "email"));
// getProperty(user, "phone");  // Error! "phone" is not a key`,
        expected_output: `name: Kim
age: 25
email: kim@mail.com`,
      },
      {
        title: '복합 제약',
        code: `// 두 조건을 모두 만족해야 함
interface Printable {
    print(): string;
}

interface Serializable {
    serialize(): string;
}

function process<T extends Printable & Serializable>(item: T): void {
    console.log("Print:", item.print());
    console.log("Serialize:", item.serialize());
}

const doc = {
    title: "Report",
    print() { return this.title; },
    serialize() { return JSON.stringify({ title: this.title }); }
};

process(doc);`,
        expected_output: `Print: Report
Serialize: {"title":"Report"}`,
      },
    ],
    keywords: ['제네릭제약', 'extends', 'keyof', '타입제한'],
  },

  'ts-basics-generic-interface': {
    name: '제네릭 인터페이스',
    description: 'interface Box<T> { }',
    content: `# 제네릭 인터페이스

## 인터페이스에 제네릭 적용

인터페이스도 타입 매개변수를 가질 수 있습니다.

\`\`\`typescript
interface Box<T> {
    value: T;
}

const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };
\`\`\`

## 여러 타입 매개변수

\`\`\`typescript
interface KeyValuePair<K, V> {
    key: K;
    value: V;
}

const pair: KeyValuePair<string, number> = {
    key: "age",
    value: 25
};
\`\`\`

## 제네릭 메서드

\`\`\`typescript
interface Container<T> {
    value: T;
    getValue(): T;
    setValue(value: T): void;
}
\`\`\`

## 기본 타입 지정

\`\`\`typescript
interface Response<T = any> {
    data: T;
    status: number;
}

// T를 지정하지 않으면 any
const res1: Response = { data: "anything", status: 200 };

// T를 지정
const res2: Response<string[]> = { data: ["a", "b"], status: 200 };
\`\`\`

## 실용적인 예시: API 응답

\`\`\`typescript
interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

type UserResponse = ApiResponse<{ id: number; name: string }>;
type ListResponse = ApiResponse<string[]>;
\`\`\``,
    runnable_examples: [
      {
        title: '제네릭 인터페이스 기본',
        code: `interface Box<T> {
    value: T;
    isEmpty(): boolean;
}

function createBox<T>(value: T): Box<T> {
    return {
        value,
        isEmpty() { return this.value === null || this.value === undefined; }
    };
}

const numBox = createBox(42);
const strBox = createBox("Hello");
const arrBox = createBox([1, 2, 3]);

console.log("Number box:", numBox.value);
console.log("String box:", strBox.value);
console.log("Array box:", arrBox.value);`,
        expected_output: `Number box: 42
String box: Hello
Array box: [1, 2, 3]`,
      },
      {
        title: 'KeyValue 인터페이스',
        code: `interface Dictionary<K extends string | number, V> {
    entries: Array<{ key: K; value: V }>;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
}

function createDict<K extends string | number, V>(): Dictionary<K, V> {
    const entries: Array<{ key: K; value: V }> = [];
    return {
        entries,
        get(key) {
            return entries.find(e => e.key === key)?.value;
        },
        set(key, value) {
            entries.push({ key, value });
        }
    };
}

const dict = createDict<string, number>();
dict.set("a", 1);
dict.set("b", 2);

console.log("get a:", dict.get("a"));
console.log("get b:", dict.get("b"));
console.log("entries:", dict.entries);`,
        expected_output: `get a: 1
get b: 2
entries: [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]`,
      },
      {
        title: 'API 응답 타입',
        code: `interface ApiResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
    error?: string;
}

type User = { id: number; name: string };
type UserListResponse = ApiResponse<User[]>;

const response: UserListResponse = {
    success: true,
    data: [
        { id: 1, name: "Kim" },
        { id: 2, name: "Lee" }
    ],
    timestamp: new Date().toISOString()
};

console.log("Success:", response.success);
console.log("Users:", response.data.map(u => u.name).join(", "));`,
        expected_output: `Success: true
Users: Kim, Lee`,
      },
    ],
    keywords: ['제네릭인터페이스', 'interface', '<T>', '타입매개변수'],
  },

  'ts-basics-generic-class': {
    name: '제네릭 클래스',
    description: 'class Stack<T> { }',
    content: `# 제네릭 클래스

## 클래스에 제네릭 적용

클래스도 타입 매개변수를 가질 수 있습니다.

\`\`\`typescript
class Box<T> {
    private value: T;

    constructor(value: T) {
        this.value = value;
    }

    getValue(): T {
        return this.value;
    }
}

const numBox = new Box<number>(42);
const strBox = new Box("hello");  // 추론
\`\`\`

## 제네릭 스택

\`\`\`typescript
class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
}
\`\`\`

## 제약 조건과 함께

\`\`\`typescript
class Repository<T extends { id: number }> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    findById(id: number): T | undefined {
        return this.items.find(item => item.id === id);
    }
}
\`\`\`

## 정적 멤버와 제네릭

정적 멤버는 클래스의 제네릭 타입을 사용할 수 없습니다.

\`\`\`typescript
class MyClass<T> {
    // static value: T;  // 오류!
    static count: number = 0;  // OK
    instanceValue: T;  // OK
}
\`\`\``,
    runnable_examples: [
      {
        title: '제네릭 스택',
        code: `class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    get size(): number {
        return this.items.length;
    }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);

console.log("size:", numberStack.size);
console.log("peek:", numberStack.peek());
console.log("pop:", numberStack.pop());
console.log("pop:", numberStack.pop());
console.log("size after pops:", numberStack.size);`,
        expected_output: `size: 3
peek: 3
pop: 3
pop: 2
size after pops: 1`,
      },
      {
        title: '제네릭 Repository',
        code: `interface Entity {
    id: number;
}

class Repository<T extends Entity> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    findById(id: number): T | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): T[] {
        return [...this.items];
    }
}

interface User extends Entity {
    name: string;
}

const userRepo = new Repository<User>();
userRepo.add({ id: 1, name: "Kim" });
userRepo.add({ id: 2, name: "Lee" });

console.log("Find id=1:", userRepo.findById(1));
console.log("All users:", userRepo.getAll());`,
        expected_output: `Find id=1: { id: 1, name: 'Kim' }
All users: [{ id: 1, name: 'Kim' }, { id: 2, name: 'Lee' }]`,
      },
      {
        title: '제네릭 큐',
        code: `class Queue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    front(): T | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

const taskQueue = new Queue<string>();
taskQueue.enqueue("Task A");
taskQueue.enqueue("Task B");
taskQueue.enqueue("Task C");

console.log("Front:", taskQueue.front());

while (!taskQueue.isEmpty()) {
    console.log("Processing:", taskQueue.dequeue());
}`,
        expected_output: `Front: Task A
Processing: Task A
Processing: Task B
Processing: Task C`,
      },
    ],
    keywords: ['제네릭클래스', 'class', 'Stack', 'Queue', 'Repository'],
  },

  'ts-inter-partial-required': {
    name: 'Partial과 Required',
    description: '선택적/필수 속성 변환',
    content: `# Partial과 Required

## Partial<T>

모든 속성을 선택적으로 만듭니다.

\`\`\`typescript
interface User {
    name: string;
    age: number;
    email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string }

const update: PartialUser = { name: "Kim" };  // OK
\`\`\`

## Required<T>

모든 선택적 속성을 필수로 만듭니다.

\`\`\`typescript
interface Config {
    host?: string;
    port?: number;
}

type RequiredConfig = Required<Config>;
// { host: string; port: number }

// const config: RequiredConfig = { host: "localhost" };  // 오류!
const config: RequiredConfig = { host: "localhost", port: 3000 };  // OK
\`\`\`

## 실용적인 사용

### 업데이트 함수

\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
}

function updateUser(id: number, updates: Partial<User>): User {
    const user = findUser(id);
    return { ...user, ...updates };
}

updateUser(1, { name: "New Name" });  // name만 업데이트
\`\`\`

### 기본값 채우기

\`\`\`typescript
function createConfig(options: Partial<Config>): Required<Config> {
    return {
        host: options.host ?? "localhost",
        port: options.port ?? 3000
    };
}
\`\`\``,
    runnable_examples: [
      {
        title: 'Partial 사용',
        code: `interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// 전체 User
const user: User = {
    id: 1,
    name: "Kim",
    email: "kim@mail.com",
    age: 25
};

// Partial: 일부만 업데이트
function updateUser(user: User, updates: Partial<User>): User {
    return { ...user, ...updates };
}

const updated = updateUser(user, { name: "Lee", age: 26 });
console.log("Original:", user.name, user.age);
console.log("Updated:", updated.name, updated.age);`,
        expected_output: `Original: Kim 25
Updated: Lee 26`,
      },
      {
        title: 'Required 사용',
        code: `interface Options {
    debug?: boolean;
    timeout?: number;
    retries?: number;
}

function createClient(options: Options): Required<Options> {
    // 모든 옵션에 기본값 제공
    return {
        debug: options.debug ?? false,
        timeout: options.timeout ?? 5000,
        retries: options.retries ?? 3
    };
}

// 일부만 전달해도 됨
const client1 = createClient({});
const client2 = createClient({ debug: true, timeout: 10000 });

console.log("Client 1:", client1);
console.log("Client 2:", client2);`,
        expected_output: `Client 1: { debug: false, timeout: 5000, retries: 3 }
Client 2: { debug: true, timeout: 10000, retries: 3 }`,
      },
      {
        title: 'Partial로 폼 상태 관리',
        code: `interface FormData {
    username: string;
    email: string;
    password: string;
}

class Form {
    private data: Partial<FormData> = {};

    update(field: keyof FormData, value: string): void {
        this.data[field] = value;
    }

    isComplete(): boolean {
        return !!(this.data.username && this.data.email && this.data.password);
    }

    getData(): Partial<FormData> {
        return { ...this.data };
    }
}

const form = new Form();
console.log("Complete?", form.isComplete());

form.update("username", "user1");
form.update("email", "user@mail.com");
console.log("Complete?", form.isComplete());

form.update("password", "secret");
console.log("Complete?", form.isComplete());
console.log("Data:", form.getData());`,
        expected_output: `Complete? false
Complete? false
Complete? true
Data: { username: 'user1', email: 'user@mail.com', password: 'secret' }`,
      },
    ],
    keywords: ['Partial', 'Required', '유틸리티타입', '선택적'],
  },

  'ts-inter-pick-omit': {
    name: 'Pick과 Omit',
    description: '속성 선택/제외',
    content: `# Pick과 Omit

## Pick<T, K>

특정 속성만 선택하여 새 타입을 만듭니다.

\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }
\`\`\`

## Omit<T, K>

특정 속성을 제외하여 새 타입을 만듭니다.

\`\`\`typescript
type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string }

type PublicUser = Omit<User, "password" | "email">;
// { id: number; name: string }
\`\`\`

## 사용 시나리오

### 공개 정보 분리

\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
}

// API 응답용 (민감 정보 제외)
type PublicUser = Omit<User, "password">;

// 목록 표시용 (최소 정보)
type UserListItem = Pick<User, "id" | "name">;
\`\`\`

### 생성/수정 타입

\`\`\`typescript
// 생성 시 id 불필요
type CreateUserInput = Omit<User, "id" | "createdAt">;

// 수정 시 id만 필요하고 나머지는 선택적
type UpdateUserInput = Pick<User, "id"> & Partial<Omit<User, "id">>;
\`\`\``,
    runnable_examples: [
      {
        title: 'Pick 사용',
        code: `interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
}

// 목록에 필요한 정보만
type ProductCard = Pick<Product, "id" | "name" | "price">;

const products: ProductCard[] = [
    { id: 1, name: "노트북", price: 1500000 },
    { id: 2, name: "마우스", price: 50000 },
];

function renderCards(items: ProductCard[]): void {
    for (const item of items) {
        console.log(\`[\${item.id}] \${item.name}: \${item.price.toLocaleString()}원\`);
    }
}

renderCards(products);`,
        expected_output: `[1] 노트북: 1,500,000원
[2] 마우스: 50,000원`,
      },
      {
        title: 'Omit 사용',
        code: `interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
}

// 비밀번호 제외
type SafeUser = Omit<User, "password">;

function toSafeUser(user: User): SafeUser {
    const { password, ...safe } = user;
    return safe;
}

const user: User = {
    id: 1,
    name: "Kim",
    email: "kim@mail.com",
    password: "secret123",
    role: "admin"
};

const safeUser = toSafeUser(user);
console.log("Safe user:", safeUser);
// password가 없음!`,
        expected_output: `Safe user: { id: 1, name: 'Kim', email: 'kim@mail.com', role: 'admin' }`,
      },
      {
        title: 'Pick + Omit 조합',
        code: `interface Article {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
    updatedAt: Date;
}

// 생성 입력 (id와 timestamps 제외)
type CreateArticle = Omit<Article, "id" | "createdAt" | "updatedAt">;

// 수정 입력 (id 필수, 나머지 선택)
type UpdateArticle = Pick<Article, "id"> & Partial<CreateArticle>;

const newArticle: CreateArticle = {
    title: "Hello TypeScript",
    content: "TypeScript is great!",
    authorId: 1
};

const updateData: UpdateArticle = {
    id: 1,
    title: "Updated Title"  // content와 authorId는 선택
};

console.log("Create:", newArticle);
console.log("Update:", updateData);`,
        expected_output: `Create: { title: 'Hello TypeScript', content: 'TypeScript is great!', authorId: 1 }
Update: { id: 1, title: 'Updated Title' }`,
      },
    ],
    keywords: ['Pick', 'Omit', '유틸리티타입', '속성선택'],
  },

  'ts-inter-record': {
    name: 'Record',
    description: 'Record<K, V>로 맵 타입',
    content: `# Record

## 키-값 맵 타입

\`Record<K, V>\`는 키 타입 K와 값 타입 V로 구성된 객체 타입입니다.

\`\`\`typescript
type StringMap = Record<string, string>;
// { [key: string]: string }

const dict: StringMap = {
    hello: "안녕",
    world: "세계"
};
\`\`\`

## 리터럴 키 사용

\`\`\`typescript
type Status = "pending" | "approved" | "rejected";
type StatusMessages = Record<Status, string>;

const messages: StatusMessages = {
    pending: "대기 중",
    approved: "승인됨",
    rejected: "거부됨"
};
\`\`\`

## 모든 키가 필수

Record는 지정된 모든 키가 필수입니다.

\`\`\`typescript
type RGB = Record<"r" | "g" | "b", number>;

// const color: RGB = { r: 255, g: 128 };  // 오류! b 누락
const color: RGB = { r: 255, g: 128, b: 0 };  // OK
\`\`\`

## 실용적인 사용

\`\`\`typescript
// 캐시
type Cache = Record<string, { value: any; expiry: number }>;

// 설정
type Config = Record<string, string | number | boolean>;

// 에러 코드
type ErrorCodes = Record<number, string>;
\`\`\``,
    runnable_examples: [
      {
        title: 'Record 기본',
        code: `type StatusCode = Record<number, string>;

const httpStatus: StatusCode = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    404: "Not Found",
    500: "Internal Server Error"
};

function getStatusMessage(code: number): string {
    return httpStatus[code] ?? "Unknown Status";
}

console.log(getStatusMessage(200));
console.log(getStatusMessage(404));
console.log(getStatusMessage(999));`,
        expected_output: `OK
Not Found
Unknown Status`,
      },
      {
        title: '리터럴 키로 Record',
        code: `type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Schedule = Record<Day, string[]>;

const weeklySchedule: Schedule = {
    mon: ["회의", "개발"],
    tue: ["코드리뷰"],
    wed: ["개발", "테스트"],
    thu: ["배포"],
    fri: ["회고", "계획"],
    sat: [],
    sun: []
};

function getTasks(day: Day): string[] {
    return weeklySchedule[day];
}

console.log("월요일:", getTasks("mon").join(", ") || "없음");
console.log("토요일:", getTasks("sat").join(", ") || "없음");`,
        expected_output: `월요일: 회의, 개발
토요일: 없음`,
      },
      {
        title: '복합 값 Record',
        code: `interface UserInfo {
    name: string;
    role: string;
    active: boolean;
}

type UserDatabase = Record<string, UserInfo>;

const users: UserDatabase = {
    "user_001": { name: "Kim", role: "admin", active: true },
    "user_002": { name: "Lee", role: "user", active: true },
    "user_003": { name: "Park", role: "user", active: false }
};

// 활성 사용자만 필터링
const activeUsers = Object.entries(users)
    .filter(([_, info]) => info.active)
    .map(([id, info]) => \`\${id}: \${info.name}\`);

console.log("Active users:");
activeUsers.forEach(u => console.log("  " + u));`,
        expected_output: `Active users:
  user_001: Kim
  user_002: Lee`,
      },
    ],
    keywords: ['Record', '맵타입', '키값', '유틸리티타입'],
  },

  'ts-inter-exhaustive': {
    name: 'Extract와 Exclude',
    description: '유니온에서 타입 추출/제외',
    content: `# Extract와 Exclude

## Extract<T, U>

T에서 U에 할당 가능한 타입만 추출합니다.

\`\`\`typescript
type T = string | number | boolean;

type OnlyStrNum = Extract<T, string | number>;
// string | number

type OnlyString = Extract<T, string>;
// string
\`\`\`

## Exclude<T, U>

T에서 U에 할당 가능한 타입을 제외합니다.

\`\`\`typescript
type T = string | number | boolean;

type NoBoolean = Exclude<T, boolean>;
// string | number

type NoStrNum = Exclude<T, string | number>;
// boolean
\`\`\`

## 실용적인 사용

### 함수 타입 추출

\`\`\`typescript
type Mixed = string | number | (() => void) | { x: number };

type FunctionTypes = Extract<Mixed, Function>;
// () => void

type NonFunctionTypes = Exclude<Mixed, Function>;
// string | number | { x: number }
\`\`\`

### 특정 속성을 가진 타입 추출

\`\`\`typescript
type HasId = { id: number };

type Objects = { id: number; name: string } | { id: number; value: number } | { key: string };

type WithId = Extract<Objects, HasId>;
// { id: number; name: string } | { id: number; value: number }
\`\`\``,
    runnable_examples: [
      {
        title: 'Extract 기본',
        code: `type AllTypes = string | number | boolean | null | undefined;

// string과 number만 추출
type StringOrNumber = Extract<AllTypes, string | number>;

// null과 undefined만 추출
type Nullable = Extract<AllTypes, null | undefined>;

// 타입 테스트
const strOrNum: StringOrNumber = "hello";
const nullable: Nullable = null;

console.log("StringOrNumber:", typeof strOrNum);
console.log("Nullable:", nullable);

// 함수에서 활용
function process(value: StringOrNumber): void {
    if (typeof value === "string") {
        console.log("String:", value.toUpperCase());
    } else {
        console.log("Number:", value.toFixed(2));
    }
}

process("test");
process(3.14159);`,
        expected_output: `StringOrNumber: string
Nullable: null
String: TEST
Number: 3.14`,
      },
      {
        title: 'Exclude 기본',
        code: `type AllTypes = string | number | boolean | null | undefined;

// null과 undefined 제외
type NonNullable = Exclude<AllTypes, null | undefined>;

// boolean 제외
type StringOrNumber = Exclude<AllTypes, boolean | null | undefined>;

function requireValue(value: NonNullable): void {
    console.log("Value:", value);
}

requireValue("hello");
requireValue(42);
requireValue(true);
// requireValue(null);  // Error!`,
        expected_output: `Value: hello
Value: 42
Value: true`,
      },
      {
        title: '이벤트 타입 필터링',
        code: `type AppEvent =
    | { type: "click"; x: number; y: number }
    | { type: "keydown"; key: string }
    | { type: "scroll"; position: number }
    | { type: "resize"; width: number; height: number };

// 마우스 관련 이벤트만
type MouseEvent = Extract<AppEvent, { type: "click" } | { type: "scroll" }>;

// 키보드 이벤트 제외
type NonKeyEvent = Exclude<AppEvent, { type: "keydown" }>;

function handleMouseEvent(event: MouseEvent): void {
    if (event.type === "click") {
        console.log(\`Click at (\${event.x}, \${event.y})\`);
    } else {
        console.log(\`Scroll to \${event.position}\`);
    }
}

handleMouseEvent({ type: "click", x: 100, y: 200 });
handleMouseEvent({ type: "scroll", position: 500 });`,
        expected_output: `Click at (100, 200)
Scroll to 500`,
      },
    ],
    keywords: ['Extract', 'Exclude', '유니온', '필터링'],
  },

  'ts-inter-returntype': {
    name: 'ReturnType과 Parameters',
    description: '함수 타입에서 추출',
    content: `# ReturnType과 Parameters

## ReturnType<T>

함수 타입의 반환 타입을 추출합니다.

\`\`\`typescript
function getUser() {
    return { id: 1, name: "Kim" };
}

type User = ReturnType<typeof getUser>;
// { id: number; name: string }
\`\`\`

## Parameters<T>

함수 타입의 매개변수 타입을 튜플로 추출합니다.

\`\`\`typescript
function createUser(name: string, age: number) {
    return { name, age };
}

type CreateUserParams = Parameters<typeof createUser>;
// [string, number]
\`\`\`

## 실용적인 사용

### API 함수 타입 재사용

\`\`\`typescript
async function fetchUser(id: number): Promise<{ name: string; email: string }> {
    // ...
}

type UserData = ReturnType<typeof fetchUser>;  // Promise<...>
type UserDataResolved = Awaited<ReturnType<typeof fetchUser>>;  // 실제 데이터 타입
\`\`\`

### 래퍼 함수

\`\`\`typescript
function original(a: string, b: number, c: boolean) {
    return \`\${a}-\${b}-\${c}\`;
}

function wrapper(...args: Parameters<typeof original>) {
    console.log("Calling original with:", args);
    return original(...args);
}
\`\`\``,
    runnable_examples: [
      {
        title: 'ReturnType 사용',
        code: `function createUser(name: string, age: number) {
    return {
        id: Math.random(),
        name,
        age,
        createdAt: new Date()
    };
}

// 반환 타입 추출
type User = ReturnType<typeof createUser>;

// 추출한 타입 사용
function displayUser(user: User): void {
    console.log(\`[\${user.id.toFixed(4)}] \${user.name}, \${user.age}세\`);
}

const user = createUser("Kim", 25);
displayUser(user);`,
        expected_output: `[0.1234] Kim, 25세`,
      },
      {
        title: 'Parameters 사용',
        code: `function sendMessage(
    to: string,
    subject: string,
    body: string,
    urgent: boolean = false
) {
    console.log(\`To: \${to}\`);
    console.log(\`Subject: \${subject}\`);
    console.log(\`Body: \${body}\`);
    console.log(\`Urgent: \${urgent}\`);
}

// 매개변수 타입 추출
type MessageParams = Parameters<typeof sendMessage>;

// 래퍼 함수
function queueMessage(...args: MessageParams): void {
    console.log("=== Queuing message ===");
    sendMessage(...args);
}

queueMessage("user@mail.com", "Hello", "This is a test", true);`,
        expected_output: `=== Queuing message ===
To: user@mail.com
Subject: Hello
Body: This is a test
Urgent: true`,
      },
      {
        title: 'async 함수와 Awaited',
        code: `async function fetchData(): Promise<{ items: string[]; total: number }> {
    return { items: ["a", "b", "c"], total: 3 };
}

// Promise 반환 타입
type PromiseResult = ReturnType<typeof fetchData>;
// Promise<{ items: string[]; total: number }>

// Promise 내부 타입 (Awaited)
type ActualData = Awaited<ReturnType<typeof fetchData>>;
// { items: string[]; total: number }

async function processData(): Promise<void> {
    const data: ActualData = await fetchData();
    console.log("Items:", data.items.join(", "));
    console.log("Total:", data.total);
}

processData();`,
        expected_output: `Items: a, b, c
Total: 3`,
      },
    ],
    keywords: ['ReturnType', 'Parameters', 'Awaited', '함수타입'],
  },

  'ts-basics-typeof-guard': {
    name: '타입 가드 함수',
    description: 'is 키워드로 타입 보장',
    content: `# 타입 가드 함수

## 사용자 정의 타입 가드

\`is\` 키워드로 타입을 좁히는 함수를 만들 수 있습니다.

\`\`\`typescript
function isString(value: unknown): value is string {
    return typeof value === "string";
}

const value: unknown = "hello";

if (isString(value)) {
    // 여기서 value는 string
    console.log(value.toUpperCase());
}
\`\`\`

## 왜 필요한가?

\`\`\`typescript
// 일반 함수 - 타입 좁히기 안 됨
function isStringNormal(value: unknown): boolean {
    return typeof value === "string";
}

// 타입 가드 함수 - 타입 좁히기 됨
function isString(value: unknown): value is string {
    return typeof value === "string";
}
\`\`\`

## 객체 타입 가드

\`\`\`typescript
interface Cat {
    meow(): void;
}

interface Dog {
    bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
    return "meow" in animal;
}

function isDog(animal: Cat | Dog): animal is Dog {
    return "bark" in animal;
}
\`\`\`

## 클래스 타입 가드

\`\`\`typescript
class Fish {
    swim() { console.log("Swimming"); }
}

class Bird {
    fly() { console.log("Flying"); }
}

function isFish(animal: Fish | Bird): animal is Fish {
    return animal instanceof Fish;
}
\`\`\``,
    runnable_examples: [
      {
        title: '기본 타입 가드',
        code: `function isNumber(value: unknown): value is number {
    return typeof value === "number";
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function processValue(value: unknown): string {
    if (isString(value)) {
        return \`String: \${value.toUpperCase()}\`;
    }
    if (isNumber(value)) {
        return \`Number: \${value.toFixed(2)}\`;
    }
    return "Unknown type";
}

console.log(processValue("hello"));
console.log(processValue(42.123));
console.log(processValue(true));`,
        expected_output: `String: HELLO
Number: 42.12
Unknown type`,
      },
      {
        title: '객체 타입 가드',
        code: `interface User {
    type: "user";
    name: string;
}

interface Admin {
    type: "admin";
    name: string;
    permissions: string[];
}

type Person = User | Admin;

function isAdmin(person: Person): person is Admin {
    return person.type === "admin";
}

function getPermissions(person: Person): string[] {
    if (isAdmin(person)) {
        return person.permissions;  // Admin 확정
    }
    return [];  // User는 권한 없음
}

const user: User = { type: "user", name: "Kim" };
const admin: Admin = { type: "admin", name: "Lee", permissions: ["read", "write"] };

console.log("User permissions:", getPermissions(user));
console.log("Admin permissions:", getPermissions(admin));`,
        expected_output: `User permissions: []
Admin permissions: ["read", "write"]`,
      },
      {
        title: '복합 타입 가드',
        code: `interface SuccessResponse {
    success: true;
    data: any;
}

interface ErrorResponse {
    success: false;
    error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function isSuccess(res: ApiResponse): res is SuccessResponse {
    return res.success === true;
}

function isError(res: ApiResponse): res is ErrorResponse {
    return res.success === false;
}

function handleResponse(res: ApiResponse): void {
    if (isSuccess(res)) {
        console.log("Data:", res.data);
    } else if (isError(res)) {
        console.log("Error:", res.error);
    }
}

handleResponse({ success: true, data: { id: 1 } });
handleResponse({ success: false, error: "Not found" });`,
        expected_output: `Data: { id: 1 }
Error: Not found`,
      },
    ],
    keywords: ['타입가드', 'is', 'typeof', 'instanceof'],
  },

  'ts-inter-assertion-func': {
    name: 'assertion 함수',
    description: 'asserts 키워드',
    content: `# Assertion 함수

## asserts 키워드

assertion 함수는 조건이 거짓이면 오류를 던지고,
참이면 이후 코드에서 타입을 좁힙니다.

\`\`\`typescript
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error("Not a string!");
    }
}

const value: unknown = "hello";
assertIsString(value);
// 여기서 value는 string
console.log(value.toUpperCase());
\`\`\`

## 일반 assert

\`\`\`typescript
function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

function processNumber(value: number | null) {
    assert(value !== null, "Value is null!");
    // 여기서 value는 number
    console.log(value.toFixed(2));
}
\`\`\`

## 타입 가드 vs assertion

\`\`\`typescript
// 타입 가드: 조건 분기
function isString(value: unknown): value is string {
    return typeof value === "string";
}

if (isString(value)) {
    // string
} else {
    // unknown
}

// Assertion: 오류 또는 보장
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") throw new Error();
}

assertIsString(value);
// 여기 도달하면 반드시 string
\`\`\``,
    runnable_examples: [
      {
        title: 'assert 기본',
        code: `function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

function divide(a: number, b: number): number {
    assert(b !== 0, "Cannot divide by zero");
    return a / b;
}

console.log("10 / 2 =", divide(10, 2));
console.log("15 / 3 =", divide(15, 3));

try {
    divide(10, 0);
} catch (e) {
    console.log("Error:", (e as Error).message);
}`,
        expected_output: `10 / 2 = 5
15 / 3 = 5
Error: Cannot divide by zero`,
      },
      {
        title: 'assertIsType 패턴',
        code: `function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(\`Expected string, got \${typeof value}\`);
    }
}

function assertIsNumber(value: unknown): asserts value is number {
    if (typeof value !== "number") {
        throw new Error(\`Expected number, got \${typeof value}\`);
    }
}

function processData(data: unknown): void {
    assertIsString(data);
    // data는 이제 string
    console.log("Length:", data.length);
    console.log("Upper:", data.toUpperCase());
}

processData("hello");

try {
    processData(123);
} catch (e) {
    console.log("Error:", (e as Error).message);
}`,
        expected_output: `Length: 5
Upper: HELLO
Error: Expected string, got number`,
      },
      {
        title: 'assertDefined 패턴',
        code: `function assertDefined<T>(
    value: T | null | undefined,
    name: string
): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error(\`\${name} is not defined\`);
    }
}

interface User {
    id: number;
    name: string;
    email?: string;
}

function sendEmail(user: User): void {
    assertDefined(user.email, "user.email");
    // email은 이제 string
    console.log(\`Sending email to \${user.email}\`);
}

const user1: User = { id: 1, name: "Kim", email: "kim@mail.com" };
const user2: User = { id: 2, name: "Lee" };

sendEmail(user1);

try {
    sendEmail(user2);
} catch (e) {
    console.log("Error:", (e as Error).message);
}`,
        expected_output: `Sending email to kim@mail.com
Error: user.email is not defined`,
      },
    ],
    keywords: ['asserts', 'assertion', '단언', '타입보장'],
  },

  'ts-inter-disc-union': {
    name: '판별 유니온',
    description: '공통 속성으로 타입 구분',
    content: `# 판별 유니온 (Discriminated Unions)

## 공통 판별 속성

여러 타입에 공통 속성을 두고 그 값으로 타입을 구분합니다.

\`\`\`typescript
interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
    }
}
\`\`\`

## 장점

1. **타입 안전성**: switch에서 모든 케이스 처리 강제
2. **자동 완성**: 에디터가 가능한 kind 값 제안
3. **리팩토링 용이**: 새 타입 추가 시 누락된 처리 컴파일 오류

## 완전성 검사

\`\`\`typescript
type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        // case "triangle" 누락 시 컴파일 오류!
        default:
            const _exhaustive: never = shape;
            return _exhaustive;
    }
}
\`\`\`

## 실용 예시: 상태 관리

\`\`\`typescript
type State =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: string }
    | { status: "error"; error: Error };
\`\`\``,
    runnable_examples: [
      {
        title: '도형 계산',
        code: `interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Triangle {
    kind: "triangle";
    base: number;
    height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "triangle":
            return (shape.base * shape.height) / 2;
    }
}

const shapes: Shape[] = [
    { kind: "circle", radius: 5 },
    { kind: "rectangle", width: 4, height: 6 },
    { kind: "triangle", base: 3, height: 4 }
];

shapes.forEach(s => {
    console.log(\`\${s.kind}: \${getArea(s).toFixed(2)}\`);
});`,
        expected_output: `circle: 78.54
rectangle: 24.00
triangle: 6.00`,
      },
      {
        title: '상태 관리',
        code: `type AsyncState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: string };

function renderState<T>(state: AsyncState<T>): string {
    switch (state.status) {
        case "idle":
            return "Ready to start";
        case "loading":
            return "Loading...";
        case "success":
            return \`Data: \${JSON.stringify(state.data)}\`;
        case "error":
            return \`Error: \${state.error}\`;
    }
}

const states: AsyncState<string[]>[] = [
    { status: "idle" },
    { status: "loading" },
    { status: "success", data: ["a", "b", "c"] },
    { status: "error", error: "Network failed" }
];

states.forEach(s => console.log(renderState(s)));`,
        expected_output: `Ready to start
Loading...
Data: ["a","b","c"]
Error: Network failed`,
      },
      {
        title: '완전성 검사',
        code: `type Action =
    | { type: "INCREMENT" }
    | { type: "DECREMENT" }
    | { type: "SET"; value: number };

function assertNever(x: never): never {
    throw new Error(\`Unexpected value: \${x}\`);
}

function reducer(state: number, action: Action): number {
    switch (action.type) {
        case "INCREMENT":
            return state + 1;
        case "DECREMENT":
            return state - 1;
        case "SET":
            return action.value;
        default:
            // 모든 케이스가 처리되지 않으면 컴파일 오류
            return assertNever(action);
    }
}

let state = 0;
console.log("Initial:", state);
state = reducer(state, { type: "INCREMENT" });
console.log("After INCREMENT:", state);
state = reducer(state, { type: "SET", value: 10 });
console.log("After SET(10):", state);
state = reducer(state, { type: "DECREMENT" });
console.log("After DECREMENT:", state);`,
        expected_output: `Initial: 0
After INCREMENT: 1
After SET(10): 10
After DECREMENT: 9`,
      },
    ],
    keywords: ['판별유니온', 'discriminated', 'switch', 'kind'],
  },

  'ts-basics-func-overload': {
    name: '함수 오버로드',
    description: '여러 시그니처 정의',
    content: `# 함수 오버로드

## 여러 호출 방식 정의

함수 오버로드로 같은 함수를 여러 방식으로 호출할 수 있게 합니다.

\`\`\`typescript
// 오버로드 시그니처
function greet(name: string): string;
function greet(firstName: string, lastName: string): string;

// 구현 시그니처
function greet(nameOrFirst: string, lastName?: string): string {
    if (lastName) {
        return \`Hello, \${nameOrFirst} \${lastName}!\`;
    }
    return \`Hello, \${nameOrFirst}!\`;
}
\`\`\`

## 왜 필요한가?

유니온 타입만으로는 매개변수와 반환 타입의 관계를 표현할 수 없습니다.

\`\`\`typescript
// 유니온만 사용 - 관계 표현 불가
function process(value: string | number): string | number {
    // string 입력 시 string 반환, number 입력 시 number 반환
    // ... 하지만 타입에서는 알 수 없음
}

// 오버로드 사용 - 관계 표현
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
    // 구현
}
\`\`\`

## 오버로드 규칙

1. 오버로드 시그니처는 구현 시그니처 위에 작성
2. 구현 시그니처는 모든 오버로드를 포함해야 함
3. 구현 시그니처는 직접 호출 불가 (오버로드만 호출 가능)`,
    runnable_examples: [
      {
        title: '기본 오버로드',
        code: `// 오버로드 시그니처
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// 구현
function format(value: string | number | Date): string {
    if (typeof value === "string") {
        return \`String: "\${value}"\`;
    }
    if (typeof value === "number") {
        return \`Number: \${value.toFixed(2)}\`;
    }
    return \`Date: \${value.toISOString().split("T")[0]}\`;
}

console.log(format("hello"));
console.log(format(3.14159));
console.log(format(new Date("2024-01-15")));`,
        expected_output: `String: "hello"
Number: 3.14
Date: 2024-01-15`,
      },
      {
        title: '반환 타입 연동',
        code: `// 입력에 따라 반환 타입 결정
function createArray(length: number): number[];
function createArray(value: string): string[];
function createArray(arg: number | string): number[] | string[] {
    if (typeof arg === "number") {
        return Array.from({ length: arg }, (_, i) => i);
    }
    return arg.split("");
}

const numbers = createArray(5);  // number[]
const chars = createArray("hello");  // string[]

console.log("Numbers:", numbers);
console.log("Chars:", chars);

// 타입 안전성 확인
console.log("Sum:", numbers.reduce((a, b) => a + b, 0));
console.log("Join:", chars.join("-"));`,
        expected_output: `Numbers: [0, 1, 2, 3, 4]
Chars: ["h", "e", "l", "l", "o"]
Sum: 10
Join: h-e-l-l-o`,
      },
      {
        title: '매개변수 조합',
        code: `interface Point2D { x: number; y: number }
interface Point3D { x: number; y: number; z: number }

// 다양한 호출 방식
function createPoint(x: number, y: number): Point2D;
function createPoint(x: number, y: number, z: number): Point3D;
function createPoint(coords: [number, number]): Point2D;
function createPoint(coords: [number, number, number]): Point3D;

function createPoint(
    xOrCoords: number | [number, number] | [number, number, number],
    y?: number,
    z?: number
): Point2D | Point3D {
    if (Array.isArray(xOrCoords)) {
        if (xOrCoords.length === 3) {
            return { x: xOrCoords[0], y: xOrCoords[1], z: xOrCoords[2] };
        }
        return { x: xOrCoords[0], y: xOrCoords[1] };
    }
    if (z !== undefined) {
        return { x: xOrCoords, y: y!, z };
    }
    return { x: xOrCoords, y: y! };
}

console.log(createPoint(1, 2));
console.log(createPoint(1, 2, 3));
console.log(createPoint([10, 20]));
console.log(createPoint([10, 20, 30]));`,
        expected_output: `{ x: 1, y: 2 }
{ x: 1, y: 2, z: 3 }
{ x: 10, y: 20 }
{ x: 10, y: 20, z: 30 }`,
      },
    ],
    keywords: ['오버로드', 'overload', '시그니처', '함수'],
  },

  'ts-basics-tuple-basic': {
    name: '튜플',
    description: '고정 길이, 타입 배열',
    content: `# 튜플 (Tuple)

## 고정 길이와 타입의 배열

튜플은 **정해진 개수**와 **각 위치별 타입**이 고정된 배열입니다.

\`\`\`typescript
// 튜플 타입
type Point = [number, number];
type NameAge = [string, number];

const point: Point = [10, 20];
const person: NameAge = ["Kim", 25];
\`\`\`

## 배열과 차이

\`\`\`typescript
// 배열: 개수 자유, 모든 요소 같은 타입
const arr: number[] = [1, 2, 3, 4, 5];

// 튜플: 개수 고정, 위치별 타입 지정
const tuple: [string, number] = ["age", 25];
\`\`\`

## 선택적 요소

\`\`\`typescript
type OptionalTuple = [string, number?];

const t1: OptionalTuple = ["hello"];
const t2: OptionalTuple = ["hello", 42];
\`\`\`

## Rest 요소

\`\`\`typescript
type StringNumberPair = [string, ...number[]];

const pair: StringNumberPair = ["sum", 1, 2, 3, 4, 5];
\`\`\`

## 읽기 전용 튜플

\`\`\`typescript
type ReadonlyPoint = readonly [number, number];

const point: ReadonlyPoint = [10, 20];
// point[0] = 30;  // 오류!
\`\`\``,
    runnable_examples: [
      {
        title: '튜플 기본',
        code: `// 2D 좌표
type Point2D = [number, number];

// 이름-나이 쌍
type NameAge = [string, number];

// 색상 RGB
type RGB = [number, number, number];

const origin: Point2D = [0, 0];
const user: NameAge = ["Kim", 25];
const red: RGB = [255, 0, 0];

console.log(\`Point: (\${origin[0]}, \${origin[1]})\`);
console.log(\`User: \${user[0]}, \${user[1]}세\`);
console.log(\`RGB: rgb(\${red.join(", ")})\`);

// 구조 분해
const [name, age] = user;
console.log(\`Destructured: \${name}, \${age}\`);`,
        expected_output: `Point: (0, 0)
User: Kim, 25세
RGB: rgb(255, 0, 0)
Destructured: Kim, 25`,
      },
      {
        title: '선택적 요소와 rest',
        code: `// 선택적 요소
type Config = [string, number?];

const c1: Config = ["debug"];
const c2: Config = ["verbose", 3];

console.log("Config 1:", c1);
console.log("Config 2:", c2);

// Rest 요소
type StringAndNumbers = [string, ...number[]];

function sum(label: string, ...values: number[]): void {
    const total = values.reduce((a, b) => a + b, 0);
    console.log(\`\${label}: \${total}\`);
}

// 튜플을 스프레드로 전달
const data: StringAndNumbers = ["Total", 1, 2, 3, 4, 5];
sum(...data);`,
        expected_output: `Config 1: ["debug"]
Config 2: ["verbose", 3]
Total: 15`,
      },
      {
        title: '함수 반환으로 튜플',
        code: `// React의 useState 패턴
function useState<T>(initial: T): [T, (value: T) => void] {
    let value = initial;
    const setValue = (newValue: T) => {
        value = newValue;
        console.log("Value changed to:", value);
    };
    return [value, setValue];
}

const [count, setCount] = useState(0);
console.log("Initial:", count);
setCount(1);
setCount(2);

// 에러와 결과 튜플
function tryParse(json: string): [Error | null, any] {
    try {
        return [null, JSON.parse(json)];
    } catch (e) {
        return [e as Error, null];
    }
}

const [err1, data1] = tryParse('{"name":"Kim"}');
const [err2, data2] = tryParse('invalid json');

console.log("Parse 1:", err1, data1);
console.log("Parse 2:", err2?.message);`,
        expected_output: `Initial: 0
Value changed to: 1
Value changed to: 2
Parse 1: null { name: 'Kim' }
Parse 2: Unexpected token 'i', "invalid json" is not valid JSON`,
      },
    ],
    keywords: ['튜플', 'tuple', '고정길이', 'readonly'],
  },

  'ts-basics-index-sig': {
    name: '인덱스 시그니처',
    description: '[key: string]: any',
    content: `# 인덱스 시그니처

## 동적 키 허용

인덱스 시그니처로 정해지지 않은 키를 허용합니다.

\`\`\`typescript
interface StringMap {
    [key: string]: string;
}

const map: StringMap = {
    hello: "안녕",
    world: "세계",
    anything: "아무거나"  // 키 이름 자유
};
\`\`\`

## 숫자 키

\`\`\`typescript
interface NumberKeyMap {
    [key: number]: string;
}

const arr: NumberKeyMap = {
    0: "zero",
    1: "one",
    2: "two"
};
\`\`\`

## 고정 속성과 함께

\`\`\`typescript
interface User {
    name: string;
    age: number;
    [key: string]: string | number;  // 추가 속성 허용
}

const user: User = {
    name: "Kim",
    age: 25,
    email: "kim@mail.com",
    phone: "010-1234-5678"
};
\`\`\`

## 제한사항

인덱스 시그니처가 있으면 모든 속성이 해당 타입을 따라야 합니다.

\`\`\`typescript
interface Bad {
    name: string;
    [key: string]: number;  // 오류! name은 string인데 number로 제한
}
\`\`\``,
    runnable_examples: [
      {
        title: '문자열 맵',
        code: `interface Dictionary {
    [key: string]: string;
}

const dict: Dictionary = {
    hello: "안녕하세요",
    goodbye: "안녕히 가세요",
    thanks: "감사합니다"
};

function translate(word: string): string {
    return dict[word] ?? "번역 없음";
}

console.log(translate("hello"));
console.log(translate("thanks"));
console.log(translate("unknown"));

// 동적 추가
dict["morning"] = "좋은 아침";
console.log(translate("morning"));`,
        expected_output: `안녕하세요
감사합니다
번역 없음
좋은 아침`,
      },
      {
        title: '고정 + 동적 속성',
        code: `interface Config {
    name: string;
    version: number;
    [key: string]: string | number | boolean;
}

const config: Config = {
    name: "MyApp",
    version: 1,
    debug: true,
    timeout: 5000,
    apiUrl: "https://api.example.com"
};

console.log("Name:", config.name);
console.log("Version:", config.version);
console.log("Debug:", config.debug);
console.log("Timeout:", config.timeout);

// 동적 접근
const keys = Object.keys(config);
console.log("All keys:", keys.join(", "));`,
        expected_output: `Name: MyApp
Version: 1
Debug: true
Timeout: 5000
All keys: name, version, debug, timeout, apiUrl`,
      },
      {
        title: '숫자 인덱스',
        code: `interface StringArray {
    [index: number]: string;
    length: number;
}

function createArray(...items: string[]): StringArray {
    const arr: StringArray = {
        length: items.length
    };
    items.forEach((item, i) => {
        (arr as any)[i] = item;
    });
    return arr;
}

const myArr = createArray("a", "b", "c");
console.log("Length:", myArr.length);
console.log("[0]:", myArr[0]);
console.log("[1]:", myArr[1]);
console.log("[2]:", myArr[2]);`,
        expected_output: `Length: 3
[0]: a
[1]: b
[2]: c`,
      },
    ],
    keywords: ['인덱스시그니처', 'index signature', '동적키', '맵'],
  },

  'ts-inter-mapped-basic': {
    name: '매핑된 타입 기초',
    description: '[K in keyof T]',
    content: `# 매핑된 타입 (Mapped Types)

## 기존 타입 변환

매핑된 타입은 기존 타입의 각 속성을 변환해 새 타입을 만듭니다.

\`\`\`typescript
// 모든 속성을 선택적으로
type Partial<T> = {
    [K in keyof T]?: T[K];
};

// 모든 속성을 읽기 전용으로
type Readonly<T> = {
    readonly [K in keyof T]: T[K];
};
\`\`\`

## 기본 문법

\`\`\`typescript
type Mapped<T> = {
    [K in keyof T]: 새로운타입;
};
\`\`\`

- \`keyof T\`: T의 모든 키를 유니온으로
- \`K in keyof T\`: 각 키를 순회
- \`T[K]\`: 원래 값 타입

## 예시

\`\`\`typescript
interface User {
    name: string;
    age: number;
}

// 모든 값을 string으로
type StringValues<T> = {
    [K in keyof T]: string;
};

type StringUser = StringValues<User>;
// { name: string; age: string }
\`\`\`

## 수정자 변경

\`\`\`typescript
// 선택적 제거
type Required<T> = {
    [K in keyof T]-?: T[K];
};

// readonly 제거
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
\`\`\``,
    runnable_examples: [
      {
        title: '기본 매핑',
        code: `// 모든 속성을 nullable로
type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

interface User {
    name: string;
    age: number;
    email: string;
}

type NullableUser = Nullable<User>;

const user: NullableUser = {
    name: "Kim",
    age: null,
    email: null
};

console.log("User:", user);

// null 체크 후 사용
if (user.age !== null) {
    console.log("Age:", user.age);
} else {
    console.log("Age: unknown");
}`,
        expected_output: `User: { name: 'Kim', age: null, email: null }
Age: unknown`,
      },
      {
        title: '값 타입 변환',
        code: `// 모든 값을 getter 함수로
type Getters<T> = {
    [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person {
    name: string;
    age: number;
}

// 수동 구현 (실제 매핑은 타입 레벨)
function createGetters<T extends object>(obj: T): Getters<T> {
    const result: any = {};
    for (const key of Object.keys(obj)) {
        const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
        result[\`get\${capitalKey}\`] = () => (obj as any)[key];
    }
    return result;
}

const person = { name: "Kim", age: 25 };
const getters = createGetters(person);

console.log("getName:", getters.getName());
console.log("getAge:", getters.getAge());`,
        expected_output: `getName: Kim
getAge: 25`,
      },
      {
        title: 'Partial 직접 구현',
        code: `// Partial 직접 구현
type MyPartial<T> = {
    [K in keyof T]?: T[K];
};

// Required 직접 구현
type MyRequired<T> = {
    [K in keyof T]-?: T[K];
};

interface Config {
    host: string;
    port?: number;
    debug?: boolean;
}

// 모든 선택적
const partial: MyPartial<Config> = {
    host: "localhost"  // port, debug 생략 가능
};

// 모든 필수
const required: MyRequired<Config> = {
    host: "localhost",
    port: 3000,
    debug: true  // 모두 필수
};

console.log("Partial:", partial);
console.log("Required:", required);`,
        expected_output: `Partial: { host: 'localhost' }
Required: { host: 'localhost', port: 3000, debug: true }`,
      },
    ],
    keywords: ['매핑타입', 'mapped types', 'keyof', 'in'],
  },

  'ts-inter-template-literal': {
    name: '템플릿 리터럴 타입 기초',
    description: '문자열 타입 조합',
    content: `# 템플릿 리터럴 타입

## 문자열 타입 조합

템플릿 리터럴 타입으로 문자열 패턴을 타입으로 정의합니다.

\`\`\`typescript
type World = "world";
type Greeting = \`hello \${World}\`;
// "hello world"
\`\`\`

## 유니온과 조합

\`\`\`typescript
type Color = "red" | "green" | "blue";
type Size = "small" | "large";

type ColorSize = \`\${Color}-\${Size}\`;
// "red-small" | "red-large" | "green-small" | "green-large" | "blue-small" | "blue-large"
\`\`\`

## 실용 예시

### 이벤트 핸들러 이름

\`\`\`typescript
type EventName = "click" | "focus" | "blur";
type HandlerName = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onFocus" | "onBlur"
\`\`\`

### CSS 속성

\`\`\`typescript
type Position = "top" | "bottom" | "left" | "right";
type Margin = \`margin-\${Position}\`;
// "margin-top" | "margin-bottom" | ...
\`\`\`

## 내장 문자열 유틸리티

\`\`\`typescript
type Upper = Uppercase<"hello">;       // "HELLO"
type Lower = Lowercase<"HELLO">;       // "hello"
type Cap = Capitalize<"hello">;        // "Hello"
type Uncap = Uncapitalize<"Hello">;    // "hello"
\`\`\``,
    runnable_examples: [
      {
        title: '기본 템플릿 리터럴',
        code: `type Method = "get" | "post" | "put" | "delete";
type Route = "/users" | "/posts";

type Endpoint = \`\${Uppercase<Method>} \${Route}\`;

function request(endpoint: Endpoint): void {
    const [method, route] = endpoint.split(" ");
    console.log(\`Method: \${method}, Route: \${route}\`);
}

request("GET /users");
request("POST /posts");
request("DELETE /users");
// request("PATCH /users");  // Error!`,
        expected_output: `Method: GET, Route: /users
Method: POST, Route: /posts
Method: DELETE, Route: /users`,
      },
      {
        title: '이벤트 핸들러 타입',
        code: `type Events = "click" | "focus" | "blur" | "change";
type Handler<E extends string> = \`on\${Capitalize<E>}\`;

type ClickHandler = Handler<"click">;  // "onClick"
type FocusHandler = Handler<"focus">;  // "onFocus"

// 모든 핸들러 타입
type AllHandlers = Handler<Events>;
// "onClick" | "onFocus" | "onBlur" | "onChange"

interface EventHandlers {
    onClick?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onChange?: () => void;
}

const handlers: EventHandlers = {
    onClick: () => console.log("Clicked!"),
    onFocus: () => console.log("Focused!")
};

handlers.onClick?.();
handlers.onFocus?.();
handlers.onBlur?.();  // undefined`,
        expected_output: `Clicked!
Focused!`,
      },
      {
        title: 'CSS 속성 타입',
        code: `type Direction = "top" | "right" | "bottom" | "left";

type MarginProperty = \`margin\${Capitalize<Direction>}\`;
type PaddingProperty = \`padding\${Capitalize<Direction>}\`;

type SpacingProperties = MarginProperty | PaddingProperty;

interface Spacing {
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
}

function toCSS(spacing: Spacing): string {
    return Object.entries(spacing)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            return \`\${cssKey}: \${value}px\`;
        })
        .join("; ");
}

const style: Spacing = {
    marginTop: 10,
    marginBottom: 20,
    paddingLeft: 5
};

console.log(toCSS(style));`,
        expected_output: `margin-top: 10px; margin-bottom: 20px; padding-left: 5px`,
      },
    ],
    keywords: ['템플릿리터럴', 'template literal', 'Capitalize', '문자열타입'],
  },

  'ts-basics-class-member': {
    name: '클래스 타입',
    description: 'public, private, protected',
    content: `# 클래스 타입

## 접근 제어자

TypeScript는 클래스에 접근 제어자를 제공합니다.

\`\`\`typescript
class Person {
    public name: string;     // 어디서든 접근 가능
    private age: number;     // 클래스 내부에서만
    protected id: number;    // 클래스와 자식 클래스에서만

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
        this.id = Math.random();
    }
}
\`\`\`

## 매개변수 속성

생성자 매개변수에 접근 제어자를 붙이면 자동으로 속성이 됩니다.

\`\`\`typescript
class Person {
    constructor(
        public name: string,
        private age: number
    ) {}
}
// this.name = name; 자동 처리
\`\`\`

## readonly

\`\`\`typescript
class Circle {
    readonly radius: number;

    constructor(radius: number) {
        this.radius = radius;
    }
}

const c = new Circle(10);
// c.radius = 20;  // 오류!
\`\`\`

## 인터페이스 구현

\`\`\`typescript
interface Printable {
    print(): void;
}

class Document implements Printable {
    print(): void {
        console.log("Printing...");
    }
}
\`\`\``,
    runnable_examples: [
      {
        title: '접근 제어자',
        code: `class BankAccount {
    public owner: string;
    private balance: number;
    protected accountNumber: string;

    constructor(owner: string, initialBalance: number) {
        this.owner = owner;
        this.balance = initialBalance;
        this.accountNumber = \`ACC-\${Math.random().toString(36).slice(2, 10)}\`;
    }

    public deposit(amount: number): void {
        this.balance += amount;
        console.log(\`Deposited: \${amount}\`);
    }

    public getBalance(): number {
        return this.balance;
    }
}

const account = new BankAccount("Kim", 1000);
console.log("Owner:", account.owner);
account.deposit(500);
console.log("Balance:", account.getBalance());

// account.balance = 999999;  // Error: private
// account.accountNumber;     // Error: protected`,
        expected_output: `Owner: Kim
Deposited: 500
Balance: 1500`,
      },
      {
        title: '매개변수 속성',
        code: `class User {
    constructor(
        public readonly id: number,
        public name: string,
        private password: string
    ) {}

    checkPassword(input: string): boolean {
        return this.password === input;
    }

    display(): void {
        console.log(\`[ID: \${this.id}] \${this.name}\`);
    }
}

const user = new User(1, "Kim", "secret123");
user.display();
console.log("Password check:", user.checkPassword("secret123"));
console.log("Wrong password:", user.checkPassword("wrong"));

// user.id = 2;  // Error: readonly
user.name = "Lee";  // OK
user.display();`,
        expected_output: `[ID: 1] Kim
Password check: true
Wrong password: false
[ID: 1] Lee`,
      },
      {
        title: '인터페이스 구현',
        code: `interface Serializable {
    serialize(): string;
}

interface Comparable<T> {
    compareTo(other: T): number;
}

class Product implements Serializable, Comparable<Product> {
    constructor(
        public name: string,
        public price: number
    ) {}

    serialize(): string {
        return JSON.stringify({ name: this.name, price: this.price });
    }

    compareTo(other: Product): number {
        return this.price - other.price;
    }
}

const p1 = new Product("Mouse", 50000);
const p2 = new Product("Keyboard", 80000);

console.log("P1:", p1.serialize());
console.log("P2:", p2.serialize());
console.log("Compare:", p1.compareTo(p2) < 0 ? "P1 cheaper" : "P2 cheaper");`,
        expected_output: `P1: {"name":"Mouse","price":50000}
P2: {"name":"Keyboard","price":80000}
Compare: P1 cheaper`,
      },
    ],
    keywords: ['클래스', 'public', 'private', 'protected', 'readonly'],
  },

  'ts-basics-implements': {
    name: '추상 클래스',
    description: 'abstract class, method',
    content: `# 추상 클래스

## abstract 키워드

추상 클래스는 **직접 인스턴스화할 수 없고**, 반드시 상속받아 구현해야 합니다.

\`\`\`typescript
abstract class Animal {
    abstract makeSound(): void;  // 구현 필수

    move(): void {  // 일반 메서드도 가능
        console.log("Moving...");
    }
}

// const animal = new Animal();  // 오류!

class Dog extends Animal {
    makeSound(): void {
        console.log("Bark!");
    }
}

const dog = new Dog();
dog.makeSound();  // "Bark!"
dog.move();       // "Moving..."
\`\`\`

## 추상 메서드

\`\`\`typescript
abstract class Shape {
    abstract getArea(): number;
    abstract getPerimeter(): number;

    display(): void {
        console.log(\`Area: \${this.getArea()}\`);
        console.log(\`Perimeter: \${this.getPerimeter()}\`);
    }
}
\`\`\`

## 추상 속성

\`\`\`typescript
abstract class Vehicle {
    abstract readonly wheels: number;
    abstract start(): void;
}

class Car extends Vehicle {
    readonly wheels = 4;

    start(): void {
        console.log("Car starting...");
    }
}
\`\`\`

## interface vs abstract class

| | interface | abstract class |
|---|---|---|
| 다중 상속 | O (implements 여러 개) | X (extends 하나만) |
| 구현 포함 | X | O |
| 접근 제어자 | X | O |
| 사용 시점 | 형태 정의 | 공통 로직 + 강제 구현 |`,
    runnable_examples: [
      {
        title: '추상 클래스 기본',
        code: `abstract class Animal {
    constructor(public name: string) {}

    abstract makeSound(): void;

    describe(): void {
        console.log(\`This is \${this.name}\`);
        this.makeSound();
    }
}

class Dog extends Animal {
    makeSound(): void {
        console.log("Woof! Woof!");
    }
}

class Cat extends Animal {
    makeSound(): void {
        console.log("Meow~");
    }
}

const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");

dog.describe();
console.log("---");
cat.describe();`,
        expected_output: `This is Buddy
Woof! Woof!
---
This is Whiskers
Meow~`,
      },
      {
        title: '도형 추상 클래스',
        code: `abstract class Shape {
    abstract getArea(): number;
    abstract getPerimeter(): number;

    display(): void {
        console.log(\`Area: \${this.getArea().toFixed(2)}\`);
        console.log(\`Perimeter: \${this.getPerimeter().toFixed(2)}\`);
    }
}

class Circle extends Shape {
    constructor(public radius: number) {
        super();
    }

    getArea(): number {
        return Math.PI * this.radius ** 2;
    }

    getPerimeter(): number {
        return 2 * Math.PI * this.radius;
    }
}

class Rectangle extends Shape {
    constructor(public width: number, public height: number) {
        super();
    }

    getArea(): number {
        return this.width * this.height;
    }

    getPerimeter(): number {
        return 2 * (this.width + this.height);
    }
}

console.log("Circle (r=5):");
new Circle(5).display();
console.log("\\nRectangle (4x6):");
new Rectangle(4, 6).display();`,
        expected_output: `Circle (r=5):
Area: 78.54
Perimeter: 31.42

Rectangle (4x6):
Area: 24.00
Perimeter: 20.00`,
      },
      {
        title: '추상 속성',
        code: `abstract class DataSource {
    abstract readonly name: string;
    abstract connect(): void;
    abstract disconnect(): void;

    query(sql: string): void {
        console.log(\`[\${this.name}] Executing: \${sql}\`);
    }
}

class MySQLDataSource extends DataSource {
    readonly name = "MySQL";

    connect(): void {
        console.log("Connecting to MySQL...");
    }

    disconnect(): void {
        console.log("Disconnecting from MySQL...");
    }
}

class PostgreSQLDataSource extends DataSource {
    readonly name = "PostgreSQL";

    connect(): void {
        console.log("Connecting to PostgreSQL...");
    }

    disconnect(): void {
        console.log("Disconnecting from PostgreSQL...");
    }
}

const mysql = new MySQLDataSource();
mysql.connect();
mysql.query("SELECT * FROM users");
mysql.disconnect();`,
        expected_output: `Connecting to MySQL...
[MySQL] Executing: SELECT * FROM users
Disconnecting from MySQL...`,
      },
    ],
    keywords: ['추상클래스', 'abstract', '상속', 'extends'],
  },

  'ts-inter-import-type': {
    name: '모듈 import/export',
    description: 'ES 모듈 문법',
    content: `# 모듈 import/export

## Named Export

여러 항목을 이름으로 내보내기

\`\`\`typescript
// math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
    return a + b;
}

export interface Point {
    x: number;
    y: number;
}
\`\`\`

\`\`\`typescript
// app.ts
import { PI, add, Point } from "./math";

console.log(PI);
console.log(add(1, 2));
\`\`\`

## Default Export

파일당 하나의 기본 내보내기

\`\`\`typescript
// user.ts
export default class User {
    constructor(public name: string) {}
}

// app.ts
import User from "./user";  // 이름 자유
import MyUser from "./user";  // 같은 것
\`\`\`

## 타입만 import

\`\`\`typescript
import type { Point } from "./math";

// 런타임에는 제거됨
\`\`\`

## 재내보내기

\`\`\`typescript
// index.ts
export { add, PI } from "./math";
export { default as User } from "./user";
export * from "./utils";
\`\`\``,
    runnable_examples: [
      {
        title: 'Named Export',
        code: `// 모듈 정의 (가상)
const MathModule = {
    PI: 3.14159,
    E: 2.71828,
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b
};

// import { PI, add } from "./math" 와 유사
const { PI, E, add, multiply } = MathModule;

console.log("PI:", PI);
console.log("E:", E);
console.log("add(3, 5):", add(3, 5));
console.log("multiply(4, 7):", multiply(4, 7));`,
        expected_output: `PI: 3.14159
E: 2.71828
add(3, 5): 8
multiply(4, 7): 28`,
      },
      {
        title: 'Default Export 패턴',
        code: `// export default class User 와 유사
class User {
    constructor(public id: number, public name: string) {}

    greet(): string {
        return \`Hello, I'm \${this.name}\`;
    }
}

// import User from "./user" 와 유사
const UserClass = User;

const user1 = new UserClass(1, "Kim");
const user2 = new UserClass(2, "Lee");

console.log(user1.greet());
console.log(user2.greet());`,
        expected_output: `Hello, I'm Kim
Hello, I'm Lee`,
      },
      {
        title: '모듈 구조 예시',
        code: `// 실제 프로젝트 구조 시뮬레이션
const types = {
    User: null as unknown as { id: number; name: string },
    Product: null as unknown as { id: number; price: number }
};

const utils = {
    formatPrice: (price: number) => \`\${price.toLocaleString()}원\`,
    formatDate: (date: Date) => date.toLocaleDateString()
};

const services = {
    userService: {
        getUser: (id: number) => ({ id, name: \`User \${id}\` })
    },
    productService: {
        getProduct: (id: number) => ({ id, price: 10000 * id })
    }
};

// index.ts 에서 재내보내기하는 패턴
const api = { types, utils, services };

// 사용
const user = api.services.userService.getUser(1);
const product = api.services.productService.getProduct(2);

console.log("User:", user);
console.log("Product:", product);
console.log("Formatted:", api.utils.formatPrice(product.price));`,
        expected_output: `User: { id: 1, name: 'User 1' }
Product: { id: 2, price: 20000 }
Formatted: 20,000원`,
      },
    ],
    keywords: ['import', 'export', '모듈', 'module', 'default'],
  },

  'ts-inter-declaration': {
    name: '타입 선언 파일',
    description: '.d.ts 파일 기초',
    content: `# 타입 선언 파일 (.d.ts)

## 타입 선언 파일이란?

\`.d.ts\` 파일은 **타입 정보만** 포함합니다.
JavaScript 라이브러리에 타입을 추가할 때 사용합니다.

\`\`\`typescript
// types.d.ts
declare function greet(name: string): void;
declare const VERSION: string;
declare class User {
    name: string;
    constructor(name: string);
}
\`\`\`

## @types 패키지

DefinitelyTyped 프로젝트에서 관리하는 타입 정의

\`\`\`bash
npm install --save-dev @types/lodash
npm install --save-dev @types/express
\`\`\`

## 전역 타입 선언

\`\`\`typescript
// global.d.ts
declare global {
    interface Window {
        myApp: {
            version: string;
            init(): void;
        };
    }
}

export {};  // 모듈로 만들기
\`\`\`

## 모듈 타입 선언

\`\`\`typescript
// my-lib.d.ts
declare module "my-lib" {
    export function doSomething(): void;
    export interface Config {
        name: string;
    }
}
\`\`\`

## 사용 시점

1. JavaScript 라이브러리 사용 시
2. 전역 변수/함수 타입 정의
3. CSS/이미지 모듈 import 지원`,
    runnable_examples: [
      {
        title: '타입 선언 개념',
        code: `// .d.ts 파일의 역할 시뮬레이션

// 1. JavaScript 라이브러리 (타입 없음)
const jsLibrary = {
    version: "1.0.0",
    greet(name: string) {
        return \`Hello, \${name}!\`;
    },
    calculate(a: number, b: number) {
        return a + b;
    }
};

// 2. 타입 정의 (.d.ts가 하는 역할)
interface JsLibraryType {
    version: string;
    greet(name: string): string;
    calculate(a: number, b: number): number;
}

// 3. 타입 적용
const typedLib: JsLibraryType = jsLibrary;

console.log("Version:", typedLib.version);
console.log(typedLib.greet("TypeScript"));
console.log("Calculate:", typedLib.calculate(10, 20));`,
        expected_output: `Version: 1.0.0
Hello, TypeScript!
Calculate: 30`,
      },
      {
        title: '모듈 선언 패턴',
        code: `// declare module 패턴 시뮬레이션

// 실제로는 별도 .d.ts 파일에 작성
// declare module "string-utils" { ... }

// 모듈 구현 (JS 라이브러리 역할)
const stringUtils = {
    capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
    reverse: (str: string) => str.split("").reverse().join(""),
    truncate: (str: string, len: number) =>
        str.length > len ? str.slice(0, len) + "..." : str
};

// 타입 정의
interface StringUtils {
    capitalize(str: string): string;
    reverse(str: string): string;
    truncate(str: string, len: number): string;
}

const utils: StringUtils = stringUtils;

console.log(utils.capitalize("hello"));
console.log(utils.reverse("TypeScript"));
console.log(utils.truncate("This is a long text", 10));`,
        expected_output: `Hello
tpircSepyT
This is a ...`,
      },
      {
        title: '전역 확장 패턴',
        code: `// declare global 패턴 시뮬레이션

// 전역 인터페이스 확장
interface Array<T> {
    first(): T | undefined;
    last(): T | undefined;
}

// 구현 추가
Array.prototype.first = function() {
    return this[0];
};

Array.prototype.last = function() {
    return this[this.length - 1];
};

// 사용
const numbers = [10, 20, 30, 40, 50];
const strings = ["a", "b", "c"];

console.log("First number:", numbers.first());
console.log("Last number:", numbers.last());
console.log("First string:", strings.first());
console.log("Last string:", strings.last());`,
        expected_output: `First number: 10
Last number: 50
First string: a
Last string: c`,
      },
    ],
    keywords: ['d.ts', '선언파일', 'declare', '@types'],
  },

  'ts-inter-strict': {
    name: 'strict 모드',
    description: 'tsconfig strict 옵션',
    content: `# strict 모드

## strict: true

\`strict: true\`는 여러 엄격한 타입 검사 옵션을 한번에 켭니다.

\`\`\`json
{
  "compilerOptions": {
    "strict": true
  }
}
\`\`\`

## 포함되는 옵션들

### strictNullChecks

null과 undefined를 명시적으로 처리

\`\`\`typescript
let name: string = null;     // 오류!
let name: string | null = null;  // OK
\`\`\`

### noImplicitAny

암시적 any 금지

\`\`\`typescript
function greet(name) { }  // 오류! name: any
function greet(name: string) { }  // OK
\`\`\`

### strictFunctionTypes

함수 타입 검사 강화

### strictPropertyInitialization

클래스 속성 초기화 필수

\`\`\`typescript
class User {
    name: string;  // 오류! 초기화 필요
}

class User {
    name: string = "";  // OK
    // 또는 constructor에서 초기화
}
\`\`\`

## 권장 사항

- 새 프로젝트: \`strict: true\` 권장
- 기존 프로젝트: 점진적으로 적용`,
    runnable_examples: [
      {
        title: 'strictNullChecks 효과',
        code: `// strictNullChecks: true

function getLength(str: string | null): number {
    // str.length;  // Error: str might be null

    // 방법 1: 조건 검사
    if (str !== null) {
        return str.length;
    }
    return 0;
}

// 방법 2: 옵셔널 체이닝
function getLengthSafe(str: string | null | undefined): number {
    return str?.length ?? 0;
}

console.log(getLength("hello"));
console.log(getLength(null));
console.log(getLengthSafe(undefined));`,
        expected_output: `5
0
0`,
      },
      {
        title: 'noImplicitAny 효과',
        code: `// noImplicitAny: true

// 타입 명시 필수
function add(a: number, b: number): number {
    return a + b;
}

// 배열 메서드도 타입 필요
const numbers = [1, 2, 3];

// 타입 추론 가능
const doubled = numbers.map(n => n * 2);

// 명시적 타입
const parsed = ["1", "2", "3"].map((s: string): number => parseInt(s));

console.log("Doubled:", doubled);
console.log("Parsed:", parsed);`,
        expected_output: `Doubled: [2, 4, 6]
Parsed: [1, 2, 3]`,
      },
      {
        title: 'strictPropertyInitialization',
        code: `// strictPropertyInitialization: true

class User {
    // 초기화 방법들
    name: string = "";  // 방법 1: 기본값
    age: number;        // 방법 2: constructor
    email?: string;     // 방법 3: optional

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

class Config {
    // definite assignment assertion (!)
    // 나중에 반드시 초기화됨을 보장
    value!: string;

    init(value: string): void {
        this.value = value;
    }
}

const user = new User("Kim", 25);
console.log(\`\${user.name}, \${user.age}\`);
console.log("Email:", user.email ?? "not set");

const config = new Config();
config.init("initialized");
console.log("Config:", config.value);`,
        expected_output: `Kim, 25
Email: not set
Config: initialized`,
      },
    ],
    keywords: ['strict', 'strictNullChecks', 'noImplicitAny', 'tsconfig'],
  },

  'ts-basics-non-null': {
    name: 'null 처리 패턴',
    description: '?., ??, !, null 체크',
    content: `# null 처리 패턴

## 옵셔널 체이닝 (?.)

null/undefined일 때 안전하게 접근

\`\`\`typescript
interface User {
    address?: {
        city?: string;
    };
}

const user: User = {};

// 안전한 접근
const city = user.address?.city;  // undefined
// user.address.city;  // 오류!
\`\`\`

## Nullish Coalescing (??)

null/undefined일 때만 기본값

\`\`\`typescript
const value = null ?? "default";  // "default"
const zero = 0 ?? "default";      // 0 (falsy지만 null 아님)
\`\`\`

## Non-null Assertion (!)

"절대 null 아님"을 단언 (주의해서 사용)

\`\`\`typescript
function getElement(id: string): HTMLElement | null {
    return document.getElementById(id);
}

// 확실히 존재할 때만 사용
const element = getElement("app")!;
\`\`\`

## 타입 좁히기

\`\`\`typescript
function process(value: string | null): string {
    if (value === null) {
        return "default";
    }
    return value.toUpperCase();  // string 확정
}
\`\`\`

## 패턴 비교

| 상황 | 방법 |
|------|------|
| 속성 접근 | \`?.\` |
| 기본값 | \`??\` |
| 확실히 존재 | \`!\` |
| 조건 분기 | 타입 가드 |`,
    runnable_examples: [
      {
        title: '옵셔널 체이닝',
        code: `interface Company {
    name: string;
    address?: {
        city?: string;
        zipCode?: string;
    };
}

const company1: Company = {
    name: "TechCorp",
    address: { city: "Seoul", zipCode: "12345" }
};

const company2: Company = {
    name: "StartUp"
    // address 없음
};

// 안전한 접근
console.log("Company1 city:", company1.address?.city);
console.log("Company2 city:", company2.address?.city);

// 메서드 호출에도 사용
const arr: number[] | undefined = undefined;
console.log("Array length:", arr?.length);

// 함수 호출
const callback: (() => void) | undefined = undefined;
callback?.();  // 호출 안 됨`,
        expected_output: `Company1 city: Seoul
Company2 city: undefined
Array length: undefined`,
      },
      {
        title: 'Nullish Coalescing',
        code: `// ?? vs ||
const empty = "" ?? "default";  // ""
const emptyOr = "" || "default"; // "default"

const zero = 0 ?? 100;  // 0
const zeroOr = 0 || 100;  // 100

const nullVal = null ?? "fallback";  // "fallback"
const undefinedVal = undefined ?? "fallback";  // "fallback"

console.log('empty ??:', empty);
console.log('empty ||:', emptyOr);
console.log('zero ??:', zero);
console.log('zero ||:', zeroOr);
console.log('null ??:', nullVal);

// 실용 예: 설정값
interface Config {
    timeout?: number;
    retries?: number;
    debug?: boolean;
}

function createConfig(opts: Config): Required<Config> {
    return {
        timeout: opts.timeout ?? 5000,
        retries: opts.retries ?? 3,
        debug: opts.debug ?? false
    };
}

console.log("Config:", createConfig({ timeout: 0 }));`,
        expected_output: `empty ??:
empty ||: default
zero ??: 0
zero ||: 100
null ??: fallback
Config: { timeout: 0, retries: 3, debug: false }`,
      },
      {
        title: '타입 가드 패턴',
        code: `function processValue(value: string | null | undefined): string {
    // 방법 1: 명시적 비교
    if (value === null || value === undefined) {
        return "[empty]";
    }
    return value.toUpperCase();
}

function processWithDefault(
    value: string | null | undefined,
    defaultValue: string = "default"
): string {
    // 방법 2: Nullish coalescing
    return (value ?? defaultValue).toUpperCase();
}

function assertDefined<T>(value: T | null | undefined): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error("Value is null or undefined");
    }
}

console.log(processValue("hello"));
console.log(processValue(null));
console.log(processWithDefault(undefined, "fallback"));

// assertion
let maybeString: string | null = "exists";
assertDefined(maybeString);
console.log("After assert:", maybeString.length);`,
        expected_output: `HELLO
[empty]
FALLBACK
After assert: 6`,
      },
    ],
    keywords: ['옵셔널체이닝', '?.', '??', '!', 'null'],
  },
};
