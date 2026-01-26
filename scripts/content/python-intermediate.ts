/**
 * Python 중급 (beginner_plus) 개념 콘텐츠
 * 대상: 기본 문법을 알고 심화 학습이 필요한 학습자
 * 특징: 고급 패턴, 실무 활용, 원리 설명
 */

export const PY_INTERMEDIATE_CONCEPTS = {
  'py-inter-scope-legb': {
    name: 'LEGB 규칙',
    description: 'Local, Enclosing, Global, Built-in',
    content: `# LEGB 규칙

## 변수를 찾는 순서

Python은 변수를 찾을 때 LEGB 순서로 검색합니다.

1. **L (Local)**: 현재 함수 내부
2. **E (Enclosing)**: 감싸고 있는 함수 (중첩 함수에서)
3. **G (Global)**: 모듈(파일) 전체
4. **B (Built-in)**: 파이썬 내장

## Local Scope

\`\`\`python
def my_func():
    x = 10  # Local
    print(x)

my_func()  # 10
# print(x)  # NameError: x는 함수 밖에서 접근 불가
\`\`\`

## Enclosing Scope

\`\`\`python
def outer():
    x = "outer"  # Enclosing

    def inner():
        print(x)  # outer의 x를 찾음

    inner()

outer()  # "outer"
\`\`\`

## Global Scope

\`\`\`python
x = "global"  # Global

def my_func():
    print(x)  # Local에 없으면 Global에서 찾음

my_func()  # "global"
\`\`\`

## Built-in Scope

\`\`\`python
# len, print 등은 Built-in
print(len([1, 2, 3]))  # 3

# Built-in을 덮어쓰면 문제 발생!
# len = 10  # 이제 len 함수를 사용할 수 없음
\`\`\`

## 같은 이름의 변수

\`\`\`python
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(x)  # "local" (L)

    inner()
    print(x)  # "enclosing" (E)

outer()
print(x)  # "global" (G)
\`\`\``,
    runnable_examples: [
      {
        title: 'LEGB 검색 순서',
        code: `x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(f"inner에서 x: {x}")

    inner()
    print(f"outer에서 x: {x}")

outer()
print(f"전역 x: {x}")`,
        expected_output: `inner에서 x: local
outer에서 x: enclosing
전역 x: global`,
      },
      {
        title: 'Enclosing 참조',
        code: `def counter():
    count = 0  # Enclosing scope

    def increment():
        # count는 Enclosing에서 참조
        print(f"현재 count: {count}")

    count = 5
    increment()

    count = 10
    increment()

counter()`,
        expected_output: `현재 count: 5
현재 count: 10`,
      },
      {
        title: 'Built-in 주의',
        code: `# len은 Built-in
print(f"len([1,2,3]): {len([1, 2, 3])}")

# 로컬에서 같은 이름 사용 시
def my_func():
    # list = [1, 2, 3]  # 이러면 list()를 사용 못함!
    items = [1, 2, 3]  # 이렇게 다른 이름 사용
    print(f"items: {items}")

my_func()

# Built-in 확인
import builtins
print(f"\\nBuilt-in 함수들: {dir(builtins)[:5]}...")`,
        expected_output: `len([1,2,3]): 3
items: [1, 2, 3]

Built-in 함수들: ['ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException', 'BaseExceptionGroup']...`,
      },
    ],
    keywords: ['LEGB', 'scope', '스코프', 'local', 'global', 'enclosing', '범위'],
  },

  'py-inter-global-nonlocal': {
    name: 'global과 nonlocal',
    description: '외부 스코프 변수 접근',
    content: `# global과 nonlocal

## 외부 변수 수정하기

함수 내에서 외부 변수를 수정하려면 특별한 선언이 필요합니다.

## global

전역 변수를 함수 내에서 수정할 때 사용합니다.

\`\`\`python
count = 0

def increment():
    global count  # 전역 count를 사용
    count += 1

increment()
increment()
print(count)  # 2
\`\`\`

## global 없이 하면?

\`\`\`python
count = 0

def increment():
    count = 1  # 새로운 지역 변수 생성!
    print(f"함수 내: {count}")

increment()
print(f"전역: {count}")  # 여전히 0
\`\`\`

## nonlocal

중첩 함수에서 감싸는 함수(Enclosing)의 변수를 수정할 때 사용합니다.

\`\`\`python
def outer():
    count = 0

    def inner():
        nonlocal count  # outer의 count 사용
        count += 1

    inner()
    inner()
    print(count)  # 2

outer()
\`\`\`

## 클로저와 함께 활용

\`\`\`python
def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter

c = make_counter()
print(c())  # 1
print(c())  # 2
print(c())  # 3
\`\`\`

## 주의사항

- global/nonlocal 남용은 코드를 복잡하게 만듦
- 가능하면 함수 인자와 반환값 사용을 권장`,
    runnable_examples: [
      {
        title: 'global 사용',
        code: `total = 0

def add(value):
    global total
    total += value
    print(f"현재 합계: {total}")

add(10)
add(20)
add(30)
print(f"최종 합계: {total}")`,
        expected_output: `현재 합계: 10
현재 합계: 30
현재 합계: 60
최종 합계: 60`,
      },
      {
        title: 'nonlocal 사용',
        code: `def make_accumulator():
    total = 0

    def add(value):
        nonlocal total
        total += value
        return total

    return add

acc = make_accumulator()
print(f"add(10): {acc(10)}")
print(f"add(20): {acc(20)}")
print(f"add(30): {acc(30)}")`,
        expected_output: `add(10): 10
add(20): 30
add(30): 60`,
      },
      {
        title: '카운터 클로저',
        code: `def make_counter(start=0):
    count = start

    def counter(step=1):
        nonlocal count
        count += step
        return count

    return counter

# 두 개의 독립적인 카운터
counter1 = make_counter()
counter2 = make_counter(100)

print(f"counter1: {counter1()}")  # 1
print(f"counter1: {counter1()}")  # 2
print(f"counter2: {counter2()}")  # 101
print(f"counter1: {counter1(5)}")  # 7 (5씩 증가)
print(f"counter2: {counter2()}")  # 102`,
        expected_output: `counter1: 1
counter1: 2
counter2: 101
counter1: 7
counter2: 102`,
      },
    ],
    keywords: ['global', 'nonlocal', '전역', '스코프', '변수수정'],
  },

  'py-inter-closure': {
    name: '클로저',
    description: '함수가 환경을 기억하는 원리',
    content: `# 클로저 (Closure)

## 함수가 환경을 기억한다

클로저는 **함수와 그 함수가 참조하는 환경(변수)을 함께 저장**한 것입니다.

## 클로저의 조건

1. 중첩 함수가 있어야 함
2. 내부 함수가 외부 함수의 변수를 참조
3. 외부 함수가 내부 함수를 반환

\`\`\`python
def outer(x):
    def inner():
        return x * 2  # outer의 x를 기억
    return inner

double = outer(10)
print(double())  # 20 (x=10을 기억하고 있음)
\`\`\`

## 왜 클로저를 쓸까?

### 데이터 은닉

\`\`\`python
def make_account(balance):
    def withdraw(amount):
        nonlocal balance
        if amount <= balance:
            balance -= amount
            return balance
        return "잔액 부족"
    return withdraw

account = make_account(1000)
# balance에 직접 접근 불가!
print(account(300))  # 700
\`\`\`

### 함수 공장

\`\`\`python
def multiplier(n):
    def multiply(x):
        return x * n
    return multiply

double = multiplier(2)
triple = multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15
\`\`\`

## 클로저 내부 확인

\`\`\`python
def outer(x):
    def inner():
        return x
    return inner

func = outer(42)
print(func.__closure__)  # 클로저 셀
print(func.__closure__[0].cell_contents)  # 42
\`\`\``,
    runnable_examples: [
      {
        title: '기본 클로저',
        code: `def greeting(name):
    message = f"안녕하세요, {name}님!"

    def greet():
        return message  # name과 message를 기억

    return greet

greet_kim = greeting("김철수")
greet_lee = greeting("이영희")

print(greet_kim())
print(greet_lee())`,
        expected_output: `안녕하세요, 김철수님!
안녕하세요, 이영희님!`,
      },
      {
        title: '함수 공장',
        code: `def power_factory(exponent):
    """거듭제곱 함수를 만드는 공장"""
    def power(base):
        return base ** exponent
    return power

square = power_factory(2)  # 제곱 함수
cube = power_factory(3)    # 세제곱 함수

print(f"5의 제곱: {square(5)}")
print(f"5의 세제곱: {cube(5)}")
print(f"10의 제곱: {square(10)}")`,
        expected_output: `5의 제곱: 25
5의 세제곱: 125
10의 제곱: 100`,
      },
      {
        title: '상태 유지',
        code: `def make_counter():
    """호출 횟수를 기억하는 카운터"""
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter

# 각 카운터는 독립적
counter_a = make_counter()
counter_b = make_counter()

print(f"A: {counter_a()}")
print(f"A: {counter_a()}")
print(f"B: {counter_b()}")
print(f"A: {counter_a()}")
print(f"B: {counter_b()}")`,
        expected_output: `A: 1
A: 2
B: 1
A: 3
B: 2`,
      },
      {
        title: '클로저 내부 확인',
        code: `def outer(value):
    secret = value * 2

    def inner():
        return secret

    return inner

func = outer(21)
print(f"결과: {func()}")

# 클로저 정보 확인
print(f"\\n클로저 존재: {func.__closure__ is not None}")
if func.__closure__:
    for i, cell in enumerate(func.__closure__):
        print(f"  cell[{i}] = {cell.cell_contents}")`,
        expected_output: `결과: 42

클로저 존재: True
  cell[0] = 42`,
      },
    ],
    keywords: ['클로저', 'closure', '환경', '캡처', '상태유지'],
  },

  'py-inter-decorator': {
    name: '데코레이터',
    description: '@decorator 함수 꾸미기',
    content: `# 데코레이터

## 함수를 꾸미는 함수

데코레이터는 기존 함수를 수정하지 않고 기능을 추가합니다.

## 기본 구조

\`\`\`python
def decorator(func):
    def wrapper(*args, **kwargs):
        # 전처리
        result = func(*args, **kwargs)
        # 후처리
        return result
    return wrapper

@decorator
def my_func():
    pass
\`\`\`

## 간단한 예제

\`\`\`python
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 실행 시간: {end - start:.4f}초")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)

slow_function()
\`\`\`

## @ 없이 사용

\`\`\`python
# @decorator와 동일
def my_func():
    pass
my_func = decorator(my_func)
\`\`\`

## 인자가 있는 데코레이터

\`\`\`python
def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")
\`\`\`

## functools.wraps

함수 메타데이터를 보존합니다.

\`\`\`python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\``,
    runnable_examples: [
      {
        title: '기본 데코레이터',
        code: `def logging(func):
    def wrapper(*args, **kwargs):
        print(f"[LOG] {func.__name__} 호출")
        result = func(*args, **kwargs)
        print(f"[LOG] {func.__name__} 완료, 결과: {result}")
        return result
    return wrapper

@logging
def add(a, b):
    return a + b

@logging
def multiply(a, b):
    return a * b

print(add(3, 5))
print()
print(multiply(4, 6))`,
        expected_output: `[LOG] add 호출
[LOG] add 완료, 결과: 8
8

[LOG] multiply 호출
[LOG] multiply 완료, 결과: 24
24`,
      },
      {
        title: '실행 시간 측정',
        code: `import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__}: {elapsed:.6f}초")
        return result
    return wrapper

@timer
def slow_sum(n):
    total = 0
    for i in range(n):
        total += i
    return total

@timer
def fast_sum(n):
    return n * (n - 1) // 2

result1 = slow_sum(100000)
result2 = fast_sum(100000)
print(f"결과 일치: {result1 == result2}")`,
        expected_output: `slow_sum: 0.005123초
fast_sum: 0.000012초
결과 일치: True`,
      },
      {
        title: '인자 있는 데코레이터',
        code: `def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for i in range(times):
                print(f"[{i+1}/{times}]", end=" ")
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"안녕, {name}!")
    return "완료"

result = greet("철수")`,
        expected_output: `[1/3] 안녕, 철수!
[2/3] 안녕, 철수!
[3/3] 안녕, 철수!`,
      },
      {
        title: 'functools.wraps 사용',
        code: `from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        """Wrapper 함수"""
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """인사하는 함수"""
    return f"Hello, {name}!"

# 메타데이터 보존 확인
print(f"함수 이름: {greet.__name__}")
print(f"문서화: {greet.__doc__}")
print(f"결과: {greet('Python')}")`,
        expected_output: `함수 이름: greet
문서화: 인사하는 함수
결과: Hello, Python!`,
      },
    ],
    keywords: ['데코레이터', 'decorator', '@', '함수꾸미기', 'wraps'],
  },

  'py-inter-higher-order': {
    name: '고차 함수',
    description: 'map, filter, reduce',
    content: `# 고차 함수

## 함수를 다루는 함수

고차 함수는 함수를 인자로 받거나 함수를 반환하는 함수입니다.

## map()

모든 요소에 함수를 적용합니다.

\`\`\`python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
print(squares)  # [1, 4, 9, 16, 25]

# 일반 함수도 가능
def double(x):
    return x * 2

doubled = list(map(double, numbers))
print(doubled)  # [2, 4, 6, 8, 10]
\`\`\`

## filter()

조건을 만족하는 요소만 걸러냅니다.

\`\`\`python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]
\`\`\`

## reduce()

요소들을 누적해서 하나의 결과를 만듭니다.

\`\`\`python
from functools import reduce

numbers = [1, 2, 3, 4, 5]
total = reduce(lambda acc, x: acc + x, numbers)
print(total)  # 15 (1+2+3+4+5)
\`\`\`

## map + filter 조합

\`\`\`python
numbers = range(1, 11)

# 짝수만 골라서 제곱
result = list(map(lambda x: x**2, filter(lambda x: x % 2 == 0, numbers)))
print(result)  # [4, 16, 36, 64, 100]
\`\`\`

## 리스트 컴프리헨션과 비교

\`\`\`python
# map + filter
result1 = list(map(lambda x: x**2, filter(lambda x: x % 2 == 0, range(10))))

# 리스트 컴프리헨션 (더 읽기 쉬움)
result2 = [x**2 for x in range(10) if x % 2 == 0]
\`\`\``,
    runnable_examples: [
      {
        title: 'map() 사용',
        code: `# 숫자 변환
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, numbers))
print(f"제곱: {squares}")

# 문자열 변환
names = ["kim", "lee", "park"]
upper_names = list(map(str.upper, names))
print(f"대문자: {upper_names}")

# 여러 리스트
a = [1, 2, 3]
b = [4, 5, 6]
sums = list(map(lambda x, y: x + y, a, b))
print(f"합: {sums}")`,
        expected_output: `제곱: [1, 4, 9, 16, 25]
대문자: ['KIM', 'LEE', 'PARK']
합: [5, 7, 9]`,
      },
      {
        title: 'filter() 사용',
        code: `numbers = list(range(1, 21))

# 짝수만
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"짝수: {evens}")

# 10보다 큰 수
big = list(filter(lambda x: x > 10, numbers))
print(f"10 초과: {big}")

# 문자열 필터링
words = ["apple", "an", "banana", "a", "cherry", "at"]
long_words = list(filter(lambda w: len(w) > 2, words))
print(f"긴 단어: {long_words}")`,
        expected_output: `짝수: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
10 초과: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
긴 단어: ['apple', 'banana', 'cherry']`,
      },
      {
        title: 'reduce() 사용',
        code: `from functools import reduce

numbers = [1, 2, 3, 4, 5]

# 합계
total = reduce(lambda acc, x: acc + x, numbers)
print(f"합계: {total}")

# 곱
product = reduce(lambda acc, x: acc * x, numbers)
print(f"곱: {product}")

# 최대값 찾기
maximum = reduce(lambda a, b: a if a > b else b, numbers)
print(f"최대값: {maximum}")

# 문자열 연결
words = ["Hello", "World", "Python"]
sentence = reduce(lambda a, b: a + " " + b, words)
print(f"문장: {sentence}")`,
        expected_output: `합계: 15
곱: 120
최대값: 5
문장: Hello World Python`,
      },
      {
        title: '조합 활용',
        code: `# 학생 점수 데이터
students = [
    {"name": "Kim", "score": 85},
    {"name": "Lee", "score": 92},
    {"name": "Park", "score": 67},
    {"name": "Choi", "score": 78},
]

# 80점 이상인 학생 이름만
high_scorers = list(map(
    lambda s: s["name"],
    filter(lambda s: s["score"] >= 80, students)
))
print(f"80점 이상: {high_scorers}")

# 동일한 결과 (컴프리헨션)
high_scorers2 = [s["name"] for s in students if s["score"] >= 80]
print(f"컴프리헨션: {high_scorers2}")`,
        expected_output: `80점 이상: ['Kim', 'Lee']
컴프리헨션: ['Kim', 'Lee']`,
      },
    ],
    keywords: ['map', 'filter', 'reduce', '고차함수', '함수형'],
  },

  'py-inter-iterator': {
    name: '이터레이터',
    description: '__iter__, __next__',
    content: `# 이터레이터

## 반복 가능한 객체

이터레이터는 값을 하나씩 차례로 반환하는 객체입니다.

## 이터러블 vs 이터레이터

- **이터러블 (Iterable)**: \`__iter__()\`를 가진 객체 (리스트, 문자열 등)
- **이터레이터 (Iterator)**: \`__next__()\`를 가진 객체

\`\`\`python
my_list = [1, 2, 3]  # 이터러블
my_iter = iter(my_list)  # 이터레이터

print(next(my_iter))  # 1
print(next(my_iter))  # 2
print(next(my_iter))  # 3
# print(next(my_iter))  # StopIteration 예외
\`\`\`

## for문의 동작 원리

\`\`\`python
# 이 코드는
for item in [1, 2, 3]:
    print(item)

# 내부적으로 이렇게 동작
it = iter([1, 2, 3])
while True:
    try:
        item = next(it)
        print(item)
    except StopIteration:
        break
\`\`\`

## 커스텀 이터레이터

\`\`\`python
class Counter:
    def __init__(self, max_value):
        self.max = max_value
        self.current = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < self.max:
            self.current += 1
            return self.current
        raise StopIteration

for num in Counter(5):
    print(num)  # 1, 2, 3, 4, 5
\`\`\`

## 이터레이터의 장점

- **메모리 효율**: 모든 데이터를 메모리에 올리지 않음
- **지연 평가**: 필요할 때만 값을 생성`,
    runnable_examples: [
      {
        title: 'iter()와 next()',
        code: `# 리스트에서 이터레이터 생성
fruits = ["apple", "banana", "cherry"]
it = iter(fruits)

print("next() 호출:")
print(f"  1번째: {next(it)}")
print(f"  2번째: {next(it)}")
print(f"  3번째: {next(it)}")

# 다 소진되면 StopIteration
try:
    print(next(it))
except StopIteration:
    print("  끝!")`,
        expected_output: `next() 호출:
  1번째: apple
  2번째: banana
  3번째: cherry
  끝!`,
      },
      {
        title: 'for문 내부 동작',
        code: `numbers = [10, 20, 30]

print("=== for문 ===")
for n in numbers:
    print(n)

print("\\n=== 수동 이터레이션 ===")
it = iter(numbers)
while True:
    try:
        n = next(it)
        print(n)
    except StopIteration:
        break`,
        expected_output: `=== for문 ===
10
20
30

=== 수동 이터레이션 ===
10
20
30`,
      },
      {
        title: '커스텀 이터레이터',
        code: `class Range:
    """간단한 range 구현"""
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < self.end:
            value = self.current
            self.current += 1
            return value
        raise StopIteration

print("Range(1, 6):")
for n in Range(1, 6):
    print(f"  {n}")`,
        expected_output: `Range(1, 6):
  1
  2
  3
  4
  5`,
      },
      {
        title: '무한 이터레이터',
        code: `class InfiniteCounter:
    """무한 카운터"""
    def __init__(self, start=0):
        self.value = start

    def __iter__(self):
        return self

    def __next__(self):
        result = self.value
        self.value += 1
        return result

# 처음 5개만 사용
counter = InfiniteCounter(100)
for i, value in enumerate(counter):
    print(value, end=" ")
    if i >= 4:
        break`,
        expected_output: `100 101 102 103 104 `,
      },
    ],
    keywords: ['이터레이터', 'iterator', '__iter__', '__next__', 'StopIteration'],
  },

  'py-inter-generator': {
    name: '제너레이터',
    description: 'yield, 메모리 효율적 순회',
    content: `# 제너레이터

## yield로 값을 생성

제너레이터는 \`yield\`를 사용해 값을 하나씩 생성하는 함수입니다.

\`\`\`python
def my_generator():
    yield 1
    yield 2
    yield 3

gen = my_generator()
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
\`\`\`

## 일반 함수와 차이

\`\`\`python
# 일반 함수: 모든 값을 한 번에 반환
def get_numbers():
    return [1, 2, 3, 4, 5]

# 제너레이터: 값을 하나씩 생성
def gen_numbers():
    for i in range(1, 6):
        yield i
\`\`\`

## 메모리 효율

\`\`\`python
# 리스트: 모든 값이 메모리에
big_list = [x**2 for x in range(1000000)]  # 메모리 많이 사용

# 제너레이터: 값을 필요할 때 생성
big_gen = (x**2 for x in range(1000000))  # 거의 메모리 안 씀
\`\`\`

## 제너레이터 표현식

\`\`\`python
# 리스트 컴프리헨션: []
squares_list = [x**2 for x in range(5)]

# 제너레이터 표현식: ()
squares_gen = (x**2 for x in range(5))
\`\`\`

## 무한 시퀀스

\`\`\`python
def infinite_counter(start=0):
    n = start
    while True:
        yield n
        n += 1

# 필요한 만큼만 사용
counter = infinite_counter()
for _ in range(5):
    print(next(counter))
\`\`\``,
    runnable_examples: [
      {
        title: '기본 제너레이터',
        code: `def countdown(n):
    print(f"카운트다운 시작: {n}")
    while n > 0:
        yield n
        n -= 1
    print("발사!")

gen = countdown(5)
print("제너레이터 생성됨")
print()

for num in gen:
    print(f"  {num}...")`,
        expected_output: `제너레이터 생성됨

카운트다운 시작: 5
  5...
  4...
  3...
  2...
  1...
발사!`,
      },
      {
        title: '제너레이터 표현식',
        code: `# 리스트 컴프리헨션 vs 제너레이터 표현식
import sys

# 리스트: 메모리에 모두 저장
list_comp = [x**2 for x in range(1000)]
print(f"리스트 크기: {sys.getsizeof(list_comp)} bytes")

# 제너레이터: 값을 하나씩 생성
gen_exp = (x**2 for x in range(1000))
print(f"제너레이터 크기: {sys.getsizeof(gen_exp)} bytes")

# 사용은 동일
print(f"\\n첫 5개: {[next(gen_exp) for _ in range(5)]}")`,
        expected_output: `리스트 크기: 8856 bytes
제너레이터 크기: 104 bytes

첫 5개: [0, 1, 4, 9, 16]`,
      },
      {
        title: '피보나치 제너레이터',
        code: `def fibonacci(max_count):
    """피보나치 수열 제너레이터"""
    a, b = 0, 1
    count = 0
    while count < max_count:
        yield a
        a, b = b, a + b
        count += 1

print("피보나치 수열 (처음 10개):")
for i, fib in enumerate(fibonacci(10)):
    print(f"  F({i}) = {fib}")`,
        expected_output: `피보나치 수열 (처음 10개):
  F(0) = 0
  F(1) = 1
  F(2) = 1
  F(3) = 2
  F(4) = 3
  F(5) = 5
  F(6) = 8
  F(7) = 13
  F(8) = 21
  F(9) = 34`,
      },
      {
        title: '파일 읽기 제너레이터',
        code: `def read_lines(text):
    """텍스트를 줄 단위로 읽는 제너레이터"""
    for line in text.split('\\n'):
        if line.strip():  # 빈 줄 제외
            yield line.strip()

sample_text = """
첫 번째 줄입니다.
두 번째 줄입니다.

세 번째 줄입니다.
네 번째 줄입니다.
"""

print("줄 단위 읽기:")
for i, line in enumerate(read_lines(sample_text), 1):
    print(f"  {i}: {line}")`,
        expected_output: `줄 단위 읽기:
  1: 첫 번째 줄입니다.
  2: 두 번째 줄입니다.
  3: 세 번째 줄입니다.
  4: 네 번째 줄입니다.`,
      },
    ],
    keywords: ['제너레이터', 'generator', 'yield', '메모리효율', '지연평가'],
  },

  'py-inter-class-basic': {
    name: '클래스 기본',
    description: 'class, __init__, self',
    content: `# 클래스 기본

## 객체 지향 프로그래밍

클래스는 **데이터(속성)와 기능(메서드)을 하나로 묶은 설계도**입니다.

## 클래스 정의

\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name  # 인스턴스 속성
        self.age = age

    def greet(self):  # 메서드
        return f"안녕, 나는 {self.name}야"

# 인스턴스 생성
person = Person("철수", 20)
print(person.greet())
\`\`\`

## __init__ 메서드

인스턴스가 생성될 때 자동 호출되는 **생성자**입니다.

\`\`\`python
class Dog:
    def __init__(self, name):
        print(f"{name} 인스턴스 생성!")
        self.name = name

dog = Dog("바둑이")  # "바둑이 인스턴스 생성!" 출력
\`\`\`

## self란?

\`self\`는 인스턴스 자기 자신을 가리킵니다.

\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0  # 이 인스턴스의 count

    def increment(self):
        self.count += 1  # self를 통해 접근

c1 = Counter()
c2 = Counter()
c1.increment()
c1.increment()
print(c1.count, c2.count)  # 2 0 (독립적!)
\`\`\`

## 클래스 속성 vs 인스턴스 속성

\`\`\`python
class Dog:
    species = "Canis familiaris"  # 클래스 속성 (모든 인스턴스 공유)

    def __init__(self, name):
        self.name = name  # 인스턴스 속성 (각자 다름)

dog1 = Dog("바둑이")
dog2 = Dog("뽀삐")
print(Dog.species)  # 클래스로 접근
print(dog1.species)  # 인스턴스로도 접근 가능
\`\`\``,
    runnable_examples: [
      {
        title: '기본 클래스',
        code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        return f"안녕하세요, {self.name}({self.age}세)입니다."

    def have_birthday(self):
        self.age += 1
        return f"{self.name}의 생일! 이제 {self.age}세"

# 인스턴스 생성
person = Person("김철수", 25)
print(person.introduce())
print(person.have_birthday())`,
        expected_output: `안녕하세요, 김철수(25세)입니다.
김철수의 생일! 이제 26세`,
      },
      {
        title: '인스턴스 독립성',
        code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return f"입금 {amount}원. 잔액: {self.balance}원"

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            return f"출금 {amount}원. 잔액: {self.balance}원"
        return "잔액 부족"

# 독립적인 계좌들
acc1 = BankAccount("철수", 1000)
acc2 = BankAccount("영희", 5000)

print(acc1.deposit(500))
print(acc2.withdraw(2000))
print(f"\\n철수 잔액: {acc1.balance}원")
print(f"영희 잔액: {acc2.balance}원")`,
        expected_output: `입금 500원. 잔액: 1500원
출금 2000원. 잔액: 3000원

철수 잔액: 1500원
영희 잔액: 3000원`,
      },
      {
        title: '클래스 속성',
        code: `class Employee:
    company = "ABC Corp"  # 클래스 속성
    count = 0

    def __init__(self, name):
        self.name = name  # 인스턴스 속성
        Employee.count += 1  # 클래스 속성 수정

    def info(self):
        return f"{self.name} @ {Employee.company}"

emp1 = Employee("김철수")
emp2 = Employee("이영희")
emp3 = Employee("박민수")

print(emp1.info())
print(f"총 직원 수: {Employee.count}명")`,
        expected_output: `김철수 @ ABC Corp
총 직원 수: 3명`,
      },
    ],
    keywords: ['클래스', 'class', '__init__', 'self', '인스턴스', '객체'],
  },

  'py-inter-inheritance': {
    name: '상속',
    description: '부모 클래스, super()',
    content: `# 상속

## 기존 클래스 확장

상속은 부모 클래스의 속성과 메서드를 자식 클래스가 물려받는 것입니다.

\`\`\`python
class Animal:  # 부모 클래스
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass

class Dog(Animal):  # 자식 클래스
    def speak(self):
        return f"{self.name}: 멍멍!"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: 야옹!"
\`\`\`

## super() 사용

부모 클래스의 메서드를 호출합니다.

\`\`\`python
class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, student_id):
        super().__init__(name)  # 부모의 __init__ 호출
        self.student_id = student_id
\`\`\`

## 메서드 오버라이딩

부모의 메서드를 자식이 재정의합니다.

\`\`\`python
class Shape:
    def area(self):
        return 0

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):  # 오버라이딩
        return self.width * self.height
\`\`\`

## isinstance()와 상속

\`\`\`python
dog = Dog("바둑이")
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True (상속 관계)
\`\`\``,
    runnable_examples: [
      {
        title: '기본 상속',
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return f"{self.name}: 멍멍!"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: 야옹!"

# 다형성
animals = [Dog("바둑이"), Cat("나비"), Dog("뽀삐")]
for animal in animals:
    print(animal.speak())`,
        expected_output: `바둑이: 멍멍!
나비: 야옹!
뽀삐: 멍멍!`,
      },
      {
        title: 'super() 사용',
        code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        return f"{self.name}, {self.age}세"

class Student(Person):
    def __init__(self, name, age, school):
        super().__init__(name, age)  # 부모 초기화
        self.school = school

    def introduce(self):
        base = super().introduce()  # 부모 메서드 호출
        return f"{base}, {self.school}"

student = Student("김철수", 18, "한국고")
print(student.introduce())`,
        expected_output: `김철수, 18세, 한국고`,
      },
      {
        title: '메서드 오버라이딩',
        code: `class Shape:
    def __init__(self, name):
        self.name = name

    def area(self):
        return 0

    def info(self):
        return f"{self.name}: 면적 = {self.area()}"

class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("사각형")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("원")
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

shapes = [Rectangle(4, 5), Circle(3)]
for shape in shapes:
    print(shape.info())`,
        expected_output: `사각형: 면적 = 20
원: 면적 = 28.27431`,
      },
    ],
    keywords: ['상속', 'inheritance', 'super', '부모클래스', '자식클래스', '오버라이딩'],
  },

  'py-inter-try-except': {
    name: 'try-except',
    description: '예외 잡기',
    content: `# 예외 처리

## 오류 잡아서 처리하기

프로그램 실행 중 발생하는 오류를 처리합니다.

\`\`\`python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("0으로 나눌 수 없습니다")
\`\`\`

## 기본 구조

\`\`\`python
try:
    # 오류가 발생할 수 있는 코드
    pass
except 예외타입:
    # 예외 처리
    pass
else:
    # 예외가 없을 때 실행
    pass
finally:
    # 항상 실행 (정리 작업)
    pass
\`\`\`

## 여러 예외 처리

\`\`\`python
try:
    value = int(input("숫자: "))
    result = 10 / value
except ValueError:
    print("유효한 숫자가 아닙니다")
except ZeroDivisionError:
    print("0으로 나눌 수 없습니다")
except Exception as e:
    print(f"알 수 없는 오류: {e}")
\`\`\`

## 예외 정보 가져오기

\`\`\`python
try:
    x = int("abc")
except ValueError as e:
    print(f"오류 메시지: {e}")
    print(f"오류 타입: {type(e).__name__}")
\`\`\`

## 흔한 예외 타입

- \`ValueError\`: 잘못된 값
- \`TypeError\`: 잘못된 타입
- \`KeyError\`: 없는 딕셔너리 키
- \`IndexError\`: 범위를 벗어난 인덱스
- \`FileNotFoundError\`: 파일 없음
- \`ZeroDivisionError\`: 0으로 나눔`,
    runnable_examples: [
      {
        title: '기본 예외 처리',
        code: `def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return "0으로 나눌 수 없습니다"
    else:
        return result

print(f"10 / 2 = {safe_divide(10, 2)}")
print(f"10 / 0 = {safe_divide(10, 0)}")`,
        expected_output: `10 / 2 = 5.0
10 / 0 = 0으로 나눌 수 없습니다`,
      },
      {
        title: '여러 예외 처리',
        code: `def get_element(data, index):
    try:
        return data[index]
    except IndexError:
        return "인덱스 범위 초과"
    except TypeError:
        return "인덱스는 정수여야 합니다"
    except Exception as e:
        return f"알 수 없는 오류: {e}"

numbers = [1, 2, 3]
print(f"numbers[1] = {get_element(numbers, 1)}")
print(f"numbers[10] = {get_element(numbers, 10)}")
print(f"numbers['a'] = {get_element(numbers, 'a')}")`,
        expected_output: `numbers[1] = 2
numbers[10] = 인덱스 범위 초과
numbers['a'] = 인덱스는 정수여야 합니다`,
      },
      {
        title: 'finally 활용',
        code: `def process_data(data):
    print("처리 시작...")
    try:
        result = 100 / data
        print(f"결과: {result}")
        return result
    except ZeroDivisionError:
        print("오류: 0으로 나눌 수 없습니다")
        return None
    finally:
        print("처리 완료 (항상 실행)")
    print("이 줄은 실행 안 됨")

print("=== 정상 케이스 ===")
process_data(5)

print("\\n=== 오류 케이스 ===")
process_data(0)`,
        expected_output: `=== 정상 케이스 ===
처리 시작...
결과: 20.0
처리 완료 (항상 실행)

=== 오류 케이스 ===
처리 시작...
오류: 0으로 나눌 수 없습니다
처리 완료 (항상 실행)`,
      },
    ],
    keywords: ['try', 'except', 'finally', 'else', '예외처리', 'Exception'],
  },

  'py-inter-file-basic': {
    name: '파일 기본',
    description: 'open, read, write, close',
    content: `# 파일 기본

## 파일 열기

\`open()\` 함수로 파일을 엽니다.

\`\`\`python
# 읽기 모드
f = open("file.txt", "r")

# 쓰기 모드 (덮어쓰기)
f = open("file.txt", "w")

# 추가 모드 (끝에 추가)
f = open("file.txt", "a")
\`\`\`

## 파일 읽기

\`\`\`python
f = open("file.txt", "r")

# 전체 읽기
content = f.read()

# 한 줄씩 읽기
line = f.readline()

# 모든 줄 리스트로
lines = f.readlines()

f.close()  # 반드시 닫기!
\`\`\`

## 파일 쓰기

\`\`\`python
f = open("file.txt", "w")
f.write("Hello, World!\\n")
f.write("Python\\n")
f.close()
\`\`\`

## with 문 (권장)

자동으로 파일을 닫아줍니다.

\`\`\`python
with open("file.txt", "r") as f:
    content = f.read()
# 자동으로 f.close() 호출됨

with open("file.txt", "w") as f:
    f.write("Hello!")
\`\`\`

## 인코딩

한글 등 유니코드를 위해 인코딩을 지정합니다.

\`\`\`python
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
\`\`\``,
    runnable_examples: [
      {
        title: '파일 읽기',
        code: `# 테스트용 파일 생성
test_content = """첫 번째 줄
두 번째 줄
세 번째 줄"""

with open("test.txt", "w", encoding="utf-8") as f:
    f.write(test_content)

# 전체 읽기
with open("test.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print("=== 전체 읽기 ===")
    print(content)

# 한 줄씩 읽기
with open("test.txt", "r", encoding="utf-8") as f:
    print("\\n=== 한 줄씩 ===")
    for i, line in enumerate(f, 1):
        print(f"{i}: {line.strip()}")

import os
os.remove("test.txt")`,
        expected_output: `=== 전체 읽기 ===
첫 번째 줄
두 번째 줄
세 번째 줄

=== 한 줄씩 ===
1: 첫 번째 줄
2: 두 번째 줄
3: 세 번째 줄`,
      },
      {
        title: '파일 쓰기',
        code: `# 새 파일 쓰기
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("파일 쓰기 테스트\\n")
    f.write("Python 파일 처리\\n")

# 내용 확인
with open("output.txt", "r", encoding="utf-8") as f:
    print("=== 쓰기 결과 ===")
    print(f.read())

# 추가 모드
with open("output.txt", "a", encoding="utf-8") as f:
    f.write("추가된 내용\\n")

# 최종 내용
with open("output.txt", "r", encoding="utf-8") as f:
    print("=== 추가 후 ===")
    print(f.read())

import os
os.remove("output.txt")`,
        expected_output: `=== 쓰기 결과 ===
파일 쓰기 테스트
Python 파일 처리

=== 추가 후 ===
파일 쓰기 테스트
Python 파일 처리
추가된 내용
`,
      },
      {
        title: 'readlines()와 writelines()',
        code: `# 리스트 쓰기
lines = ["사과\\n", "바나나\\n", "체리\\n"]
with open("fruits.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)

# 리스트로 읽기
with open("fruits.txt", "r", encoding="utf-8") as f:
    read_lines = f.readlines()
    print(f"readlines(): {read_lines}")

# strip하면서 읽기
with open("fruits.txt", "r", encoding="utf-8") as f:
    clean_lines = [line.strip() for line in f]
    print(f"정리된 리스트: {clean_lines}")

import os
os.remove("fruits.txt")`,
        expected_output: `readlines(): ['사과\n', '바나나\n', '체리\n']
정리된 리스트: ['사과', '바나나', '체리']`,
      },
    ],
    keywords: ['파일', 'open', 'read', 'write', 'close', 'with'],
  },

  'py-inter-with': {
    name: 'with문',
    description: '컨텍스트 매니저, 안전한 파일 처리',
    content: `# with문

## 자원 자동 관리

with문은 **자원을 자동으로 정리**해주는 구문입니다.

## 파일 처리

\`\`\`python
# with 없이 (위험)
f = open("file.txt")
content = f.read()
f.close()  # 까먹기 쉬움, 예외 발생 시 닫히지 않음

# with 사용 (안전)
with open("file.txt") as f:
    content = f.read()
# 자동으로 닫힘 (예외 발생해도)
\`\`\`

## 동작 원리

with문은 컨텍스트 매니저 프로토콜을 사용합니다.

\`\`\`python
# with 문은 내부적으로
manager = open("file.txt")
manager.__enter__()  # 시작
try:
    # 블록 내용 실행
    pass
finally:
    manager.__exit__()  # 정리 (항상 실행)
\`\`\`

## 커스텀 컨텍스트 매니저

\`\`\`python
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.end = time.time()
        print(f"실행 시간: {self.end - self.start:.4f}초")

with Timer():
    time.sleep(1)
\`\`\`

## contextlib 사용

\`\`\`python
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.time()
    yield
    print(f"실행 시간: {time.time() - start:.4f}초")

with timer():
    time.sleep(1)
\`\`\``,
    runnable_examples: [
      {
        title: 'with문 기본',
        code: `# 여러 파일 동시 처리
with open("source.txt", "w") as f:
    f.write("Hello World")

with open("source.txt", "r") as src:
    content = src.read()
    print(f"읽은 내용: {content}")

# 중첩 with
with open("source.txt", "r") as src:
    with open("dest.txt", "w") as dst:
        dst.write(src.read().upper())

with open("dest.txt", "r") as f:
    print(f"변환된 내용: {f.read()}")

import os
os.remove("source.txt")
os.remove("dest.txt")`,
        expected_output: `읽은 내용: Hello World
변환된 내용: HELLO WORLD`,
      },
      {
        title: '커스텀 컨텍스트 매니저',
        code: `import time

class Timer:
    def __init__(self, name="작업"):
        self.name = name

    def __enter__(self):
        self.start = time.time()
        print(f"[{self.name}] 시작")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start
        print(f"[{self.name}] 종료 ({elapsed:.4f}초)")
        return False  # 예외 전파

with Timer("계산"):
    total = sum(range(1000000))
    print(f"합계: {total}")`,
        expected_output: `[계산] 시작
합계: 499999500000
[계산] 종료 (0.0312초)`,
      },
      {
        title: 'contextmanager 데코레이터',
        code: `from contextlib import contextmanager

@contextmanager
def section(title):
    print(f"=== {title} 시작 ===")
    yield
    print(f"=== {title} 끝 ===\\n")

with section("데이터 처리"):
    data = [1, 2, 3, 4, 5]
    print(f"데이터: {data}")
    print(f"합계: {sum(data)}")

with section("문자열 처리"):
    text = "Hello Python"
    print(f"원본: {text}")
    print(f"대문자: {text.upper()}")`,
        expected_output: `=== 데이터 처리 시작 ===
데이터: [1, 2, 3, 4, 5]
합계: 15
=== 데이터 처리 끝 ===

=== 문자열 처리 시작 ===
원본: Hello Python
대문자: HELLO PYTHON
=== 문자열 처리 끝 ===
`,
      },
    ],
    keywords: ['with', '컨텍스트매니저', '__enter__', '__exit__', 'contextmanager'],
  },

  'py-inter-json': {
    name: 'JSON 처리',
    description: 'json.load, json.dump',
    content: `# JSON 처리

## JSON이란?

JSON은 데이터를 저장하고 교환하는 형식입니다.

\`\`\`json
{
    "name": "홍길동",
    "age": 25,
    "skills": ["Python", "JavaScript"]
}
\`\`\`

## 파이썬 <-> JSON 변환

\`\`\`python
import json

# 파이썬 -> JSON 문자열
data = {"name": "Kim", "age": 25}
json_str = json.dumps(data)

# JSON 문자열 -> 파이썬
python_obj = json.loads(json_str)
\`\`\`

## 파일로 저장/읽기

\`\`\`python
import json

# 저장
with open("data.json", "w") as f:
    json.dump(data, f)

# 읽기
with open("data.json", "r") as f:
    loaded = json.load(f)
\`\`\`

## 옵션들

\`\`\`python
# 보기 좋게 포맷팅
json.dumps(data, indent=2)

# 한글 유지
json.dumps(data, ensure_ascii=False)

# 키 정렬
json.dumps(data, sort_keys=True)
\`\`\`

## 타입 대응

| Python | JSON |
|--------|------|
| dict | object |
| list | array |
| str | string |
| int, float | number |
| True, False | true, false |
| None | null |`,
    runnable_examples: [
      {
        title: 'JSON 기본 변환',
        code: `import json

# 파이썬 딕셔너리
data = {
    "name": "홍길동",
    "age": 30,
    "skills": ["Python", "JavaScript"],
    "active": True
}

# JSON 문자열로 변환
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print("=== JSON 문자열 ===")
print(json_str)

# 다시 파이썬 객체로
parsed = json.loads(json_str)
print("\\n=== 파싱 결과 ===")
print(f"이름: {parsed['name']}")
print(f"스킬: {parsed['skills']}")`,
        expected_output: `=== JSON 문자열 ===
{
  "name": "홍길동",
  "age": 30,
  "skills": [
    "Python",
    "JavaScript"
  ],
  "active": true
}

=== 파싱 결과 ===
이름: 홍길동
스킬: ['Python', 'JavaScript']`,
      },
      {
        title: 'JSON 파일 처리',
        code: `import json

# 데이터 준비
users = [
    {"id": 1, "name": "김철수", "score": 85},
    {"id": 2, "name": "이영희", "score": 92},
    {"id": 3, "name": "박민수", "score": 78}
]

# 파일로 저장
with open("users.json", "w", encoding="utf-8") as f:
    json.dump(users, f, ensure_ascii=False, indent=2)

# 파일에서 읽기
with open("users.json", "r", encoding="utf-8") as f:
    loaded_users = json.load(f)

print("=== 로드된 데이터 ===")
for user in loaded_users:
    print(f"  {user['name']}: {user['score']}점")

import os
os.remove("users.json")`,
        expected_output: `=== 로드된 데이터 ===
  김철수: 85점
  이영희: 92점
  박민수: 78점`,
      },
      {
        title: '중첩 JSON 다루기',
        code: `import json

# 복잡한 중첩 구조
config = {
    "app": {
        "name": "MyApp",
        "version": "1.0.0"
    },
    "database": {
        "host": "localhost",
        "port": 5432,
        "credentials": {
            "user": "admin",
            "password": "secret"
        }
    },
    "features": ["auth", "logging", "cache"]
}

# 정렬된 JSON
json_str = json.dumps(config, indent=2, sort_keys=True)
print(json_str[:200] + "...")

# 중첩 데이터 접근
print(f"\\nDB 호스트: {config['database']['host']}")
print(f"DB 사용자: {config['database']['credentials']['user']}")`,
        expected_output: `{
  "app": {
    "name": "MyApp",
    "version": "1.0.0"
  },
  "database": {
    "credentials": {
      "password": "secret",
      "user": "admin"
    },
    "host": "localhost",
    "port": 5432
  },
  "features": [
    "auth",
    "logging",
    "cache"
  ]
}...

DB 호스트: localhost
DB 사용자: admin`,
      },
    ],
    keywords: ['json', 'dumps', 'loads', 'dump', 'load', '직렬화'],
  },

  'py-inter-import': {
    name: 'import',
    description: 'import, from, as',
    content: `# import

## 모듈 가져오기

모듈은 파이썬 코드를 담고 있는 파일입니다.

## import 방법들

\`\`\`python
# 전체 모듈 가져오기
import math
print(math.sqrt(16))  # 4.0

# 특정 함수만 가져오기
from math import sqrt
print(sqrt(16))  # 4.0

# 여러 개 가져오기
from math import sqrt, pi, ceil

# 별칭 사용
import numpy as np

# 전체 가져오기 (권장하지 않음)
from math import *
\`\`\`

## 표준 라이브러리

\`\`\`python
import os       # 운영체제 기능
import sys      # 시스템 관련
import datetime # 날짜/시간
import random   # 난수
import json     # JSON 처리
import re       # 정규표현식
\`\`\`

## 자주 쓰는 패턴

\`\`\`python
# 조건부 import
try:
    import numpy as np
except ImportError:
    np = None

# if __name__ == "__main__"
if __name__ == "__main__":
    # 이 파일이 직접 실행될 때만 실행
    main()
\`\`\`

## 패키지 구조

\`\`\`
mypackage/
    __init__.py
    module1.py
    module2.py
    subpackage/
        __init__.py
        module3.py
\`\`\`

\`\`\`python
from mypackage import module1
from mypackage.subpackage import module3
\`\`\``,
    runnable_examples: [
      {
        title: 'import 다양한 방법',
        code: `# 전체 모듈 import
import math
print(f"sqrt(25) = {math.sqrt(25)}")
print(f"pi = {math.pi:.4f}")

# from import
from random import randint, choice
print(f"\\nrandint(1, 10) = {randint(1, 10)}")
print(f"choice(['a','b','c']) = {choice(['a', 'b', 'c'])}")

# 별칭
from datetime import datetime as dt
now = dt.now()
print(f"\\n현재 시간: {now.strftime('%Y-%m-%d %H:%M:%S')}")`,
        expected_output: `sqrt(25) = 5.0
pi = 3.1416

randint(1, 10) = 7
choice(['a','b','c']) = b

현재 시간: 2024-01-15 14:30:00`,
      },
      {
        title: '표준 라이브러리 활용',
        code: `import os
import sys
from collections import Counter

# os 모듈
print(f"현재 디렉토리: {os.getcwd()[:30]}...")
print(f"환경변수 HOME: {os.environ.get('HOME', 'N/A')[:20]}...")

# sys 모듈
print(f"\\nPython 버전: {sys.version[:15]}...")

# collections
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = Counter(words)
print(f"\\n단어 빈도: {dict(counter)}")`,
        expected_output: `현재 디렉토리: /Users/user/workspace...
환경변수 HOME: /Users/user...

Python 버전: 3.11.0 (main...

단어 빈도: {'apple': 3, 'banana': 2, 'cherry': 1}`,
      },
      {
        title: '__name__ 활용',
        code: `# 모듈 이름 확인
print(f"현재 모듈 이름: {__name__}")

def main():
    print("main 함수 실행!")

def helper():
    return "헬퍼 함수"

# 직접 실행될 때만
if __name__ == "__main__":
    print("이 파일이 직접 실행되었습니다")
    main()
else:
    print("이 파일이 import 되었습니다")`,
        expected_output: `현재 모듈 이름: __main__
이 파일이 직접 실행되었습니다
main 함수 실행!`,
      },
    ],
    keywords: ['import', 'from', 'as', '모듈', 'package', '__name__'],
  },

  'py-inter-comprehension-adv': {
    name: '컴프리헨션 고급',
    description: '중첩, 조건부 컴프리헨션',
    content: `# 컴프리헨션 고급

## 중첩 반복

\`\`\`python
# 2차원 리스트 평탄화
matrix = [[1, 2], [3, 4], [5, 6]]
flat = [x for row in matrix for x in row]
print(flat)  # [1, 2, 3, 4, 5, 6]

# 구구단
table = [[i*j for j in range(1, 10)] for i in range(2, 10)]
\`\`\`

## 조건부 값

\`\`\`python
# if-else로 값 변환
nums = [1, 2, 3, 4, 5]
result = ["짝" if x % 2 == 0 else "홀" for x in nums]
\`\`\`

## 딕셔너리/세트 컴프리헨션

\`\`\`python
# 딕셔너리
squares = {x: x**2 for x in range(5)}

# 세트
unique = {x % 3 for x in range(10)}  # {0, 1, 2}
\`\`\`

## 중첩 컴프리헨션

\`\`\`python
# 2차원 리스트 생성
matrix = [[i*j for j in range(1, 4)] for i in range(1, 4)]
# [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
\`\`\`

## 복잡한 조건

\`\`\`python
# 여러 조건
result = [x for x in range(100) if x % 2 == 0 if x % 3 == 0]
# 2의 배수이면서 3의 배수 (6의 배수)
\`\`\``,
    runnable_examples: [
      {
        title: '중첩 반복',
        code: `# 2차원 리스트 평탄화
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

flat = [x for row in matrix for x in row]
print(f"평탄화: {flat}")

# 짝수만 평탄화
even_flat = [x for row in matrix for x in row if x % 2 == 0]
print(f"짝수만: {even_flat}")

# 좌표 생성
coords = [(x, y) for x in range(3) for y in range(3)]
print(f"좌표: {coords}")`,
        expected_output: `평탄화: [1, 2, 3, 4, 5, 6, 7, 8, 9]
짝수만: [2, 4, 6, 8]
좌표: [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]`,
      },
      {
        title: '조건부 값 변환',
        code: `numbers = list(range(1, 11))

# if-else: 모든 요소 변환
labels = ["짝수" if n % 2 == 0 else "홀수" for n in numbers]
print(f"라벨: {labels}")

# 조건에 따른 변환
processed = [n * 2 if n > 5 else n for n in numbers]
print(f"처리: {processed}")

# 복잡한 변환
grades = [95, 82, 67, 88, 73, 55]
results = [
    "A" if s >= 90 else
    "B" if s >= 80 else
    "C" if s >= 70 else
    "D" if s >= 60 else "F"
    for s in grades
]
print(f"등급: {results}")`,
        expected_output: `라벨: ['홀수', '짝수', '홀수', '짝수', '홀수', '짝수', '홀수', '짝수', '홀수', '짝수']
처리: [1, 2, 3, 4, 5, 12, 14, 16, 18, 20]
등급: ['A', 'B', 'F', 'B', 'C', 'F']`,
      },
      {
        title: '딕셔너리/세트 컴프리헨션',
        code: `# 딕셔너리 컴프리헨션
words = ["apple", "banana", "cherry"]
lengths = {word: len(word) for word in words}
print(f"길이 딕셔너리: {lengths}")

# 세트 컴프리헨션
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique_squares = {n**2 for n in numbers}
print(f"고유 제곱: {unique_squares}")

# 딕셔너리 필터링
scores = {"Kim": 85, "Lee": 62, "Park": 91, "Choi": 78}
passed = {k: v for k, v in scores.items() if v >= 70}
print(f"합격자: {passed}")`,
        expected_output: `길이 딕셔너리: {'apple': 5, 'banana': 6, 'cherry': 6}
고유 제곱: {16, 1, 4, 9}
합격자: {'Kim': 85, 'Park': 91, 'Choi': 78}`,
      },
      {
        title: '2차원 리스트 생성',
        code: `# 구구단 테이블
dan = 3
row = [f"{dan}x{i}={dan*i}" for i in range(1, 10)]
print(f"{dan}단: {row[:5]}...")

# n x m 행렬
n, m = 3, 4
matrix = [[i * m + j for j in range(m)] for i in range(n)]
print(f"\\n3x4 행렬:")
for row in matrix:
    print(f"  {row}")

# 전치 행렬
transposed = [[matrix[i][j] for i in range(n)] for j in range(m)]
print(f"\\n전치 행렬 (4x3):")
for row in transposed:
    print(f"  {row}")`,
        expected_output: `3단: ['3x1=3', '3x2=6', '3x3=9', '3x4=12', '3x5=15']...

3x4 행렬:
  [0, 1, 2, 3]
  [4, 5, 6, 7]
  [8, 9, 10, 11]

전치 행렬 (4x3):
  [0, 4, 8]
  [1, 5, 9]
  [2, 6, 10]
  [3, 7, 11]`,
      },
    ],
    keywords: ['컴프리헨션', '중첩', '조건부', '딕셔너리', '세트'],
  },

  'py-inter-unpacking': {
    name: '언패킹',
    description: 'a, b = b, a / *args 활용',
    content: `# 언패킹

## 값 풀어내기

언패킹은 여러 값을 한 번에 변수에 할당합니다.

## 기본 언패킹

\`\`\`python
# 튜플 언패킹
point = (10, 20)
x, y = point

# 리스트 언패킹
first, second, third = [1, 2, 3]

# 스왑
a, b = b, a
\`\`\`

## 확장 언패킹 (*)

\`\`\`python
first, *rest = [1, 2, 3, 4, 5]
print(first)  # 1
print(rest)   # [2, 3, 4, 5]

first, *middle, last = [1, 2, 3, 4, 5]
print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5
\`\`\`

## 함수 인자 언패킹

\`\`\`python
def func(a, b, c):
    return a + b + c

# 리스트 언패킹
args = [1, 2, 3]
print(func(*args))  # func(1, 2, 3)

# 딕셔너리 언패킹
kwargs = {"a": 1, "b": 2, "c": 3}
print(func(**kwargs))  # func(a=1, b=2, c=3)
\`\`\`

## 중첩 언패킹

\`\`\`python
data = [("Kim", (85, 90)), ("Lee", (92, 88))]
for name, (score1, score2) in data:
    print(f"{name}: {score1}, {score2}")
\`\`\``,
    runnable_examples: [
      {
        title: '기본 언패킹',
        code: `# 튜플 언패킹
point = (100, 200, 300)
x, y, z = point
print(f"x={x}, y={y}, z={z}")

# 스왑
a, b = 10, 20
print(f"교환 전: a={a}, b={b}")
a, b = b, a
print(f"교환 후: a={a}, b={b}")

# 다중 할당
x = y = z = 0
print(f"x={x}, y={y}, z={z}")`,
        expected_output: `x=100, y=200, z=300
교환 전: a=10, b=20
교환 후: a=20, b=10
x=0, y=0, z=0`,
      },
      {
        title: '확장 언패킹 (*)',
        code: `numbers = [1, 2, 3, 4, 5]

# 첫 번째와 나머지
first, *rest = numbers
print(f"first: {first}, rest: {rest}")

# 마지막과 나머지
*init, last = numbers
print(f"init: {init}, last: {last}")

# 첫, 중간, 끝
first, *middle, last = numbers
print(f"first: {first}, middle: {middle}, last: {last}")

# 불필요한 값 무시
first, *_, last = numbers
print(f"first: {first}, last: {last}")`,
        expected_output: `first: 1, rest: [2, 3, 4, 5]
init: [1, 2, 3, 4], last: 5
first: 1, middle: [2, 3, 4], last: 5
first: 1, last: 5`,
      },
      {
        title: '함수 인자 언패킹',
        code: `def greet(name, age, city):
    return f"{name}({age}세, {city})"

# 리스트 언패킹
args = ["김철수", 25, "서울"]
print(f"리스트 언패킹: {greet(*args)}")

# 딕셔너리 언패킹
kwargs = {"name": "이영희", "age": 30, "city": "부산"}
print(f"딕셔너리 언패킹: {greet(**kwargs)}")

# 혼합
print(f"혼합: {greet('박민수', **{'age': 28, 'city': '대전'})}")`,
        expected_output: `리스트 언패킹: 김철수(25세, 서울)
딕셔너리 언패킹: 이영희(30세, 부산)
혼합: 박민수(28세, 대전)`,
      },
      {
        title: '중첩 언패킹',
        code: `# 복잡한 데이터 구조
students = [
    ("김철수", (85, 90, 88)),
    ("이영희", (92, 88, 95)),
    ("박민수", (78, 82, 80))
]

print("=== 성적표 ===")
for name, (korean, english, math) in students:
    avg = (korean + english + math) / 3
    print(f"{name}: 국어 {korean}, 영어 {english}, 수학 {math} / 평균 {avg:.1f}")`,
        expected_output: `=== 성적표 ===
김철수: 국어 85, 영어 90, 수학 88 / 평균 87.7
이영희: 국어 92, 영어 88, 수학 95 / 평균 91.7
박민수: 국어 78, 영어 82, 수학 80 / 평균 80.0`,
      },
    ],
    keywords: ['언패킹', 'unpacking', '*', '**', '스왑', '할당'],
  },
};
