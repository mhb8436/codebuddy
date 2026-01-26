/**
 * Python 기초 (beginner) 개념 콘텐츠
 * 대상: 기본 문법을 아는 학습자
 * 특징: 실용적인 예제, 실무 패턴 소개
 */

export const PY_BEGINNER_CONCEPTS = {
  'py-basics-type-convert': {
    name: '타입 변환',
    description: 'int(), str(), float() 형변환',
    content: `# 타입 변환

## 타입을 바꿔야 할 때

프로그램에서 데이터 타입을 변환해야 하는 경우가 많습니다.

- 사용자 입력(문자열)을 숫자로 계산
- 숫자를 문자열에 연결
- 정수를 실수로, 실수를 정수로

## 주요 변환 함수

\`\`\`python
int()    # 정수로 변환
float()  # 실수로 변환
str()    # 문자열로 변환
bool()   # 불리언으로 변환
\`\`\`

## int() - 정수로 변환

\`\`\`python
# 문자열 -> 정수
num = int("42")
print(num, type(num))  # 42 <class 'int'>

# 실수 -> 정수 (소수점 버림)
num = int(3.7)
print(num)  # 3 (반올림 아님!)

# 불리언 -> 정수
print(int(True))   # 1
print(int(False))  # 0
\`\`\`

## float() - 실수로 변환

\`\`\`python
# 정수 -> 실수
num = float(42)
print(num)  # 42.0

# 문자열 -> 실수
num = float("3.14")
print(num)  # 3.14
\`\`\`

## str() - 문자열로 변환

\`\`\`python
# 숫자 -> 문자열
text = str(42)
print(text, type(text))  # "42" <class 'str'>

# 문자열 연결에 필요
age = 25
print("나이: " + str(age) + "살")
\`\`\`

## 변환 실패 시 오류

\`\`\`python
# 숫자가 아닌 문자열은 변환 불가
# int("hello")  # ValueError!
# int("3.14")   # ValueError! (정수 형식이 아님)

# float는 가능
print(float("3.14"))  # 3.14
\`\`\`

## 정리

- \`int()\`: 정수로 (소수점 버림)
- \`float()\`: 실수로
- \`str()\`: 문자열로
- 변환 불가능한 값은 오류 발생`,
    runnable_examples: [
      {
        title: '기본 타입 변환',
        code: `# 문자열 -> 숫자
s = "123"
n = int(s)
print(f"int('{s}') = {n}, type: {type(n)}")

# 정수 -> 실수
i = 42
f = float(i)
print(f"float({i}) = {f}, type: {type(f)}")

# 숫자 -> 문자열
num = 100
text = str(num)
print(f"str({num}) = '{text}', type: {type(text)}")`,
        expected_output: `int('123') = 123, type: <class 'int'>
float(42) = 42.0, type: <class 'float'>
str(100) = '100', type: <class 'str'>`,
      },
      {
        title: '실수 -> 정수 변환',
        code: `values = [3.1, 3.5, 3.9, -2.7]

for v in values:
    print(f"int({v}) = {int(v)}")

print("\\n주의: 반올림이 아니라 버림!")`,
        expected_output: `int(3.1) = 3
int(3.5) = 3
int(3.9) = 3
int(-2.7) = -2

주의: 반올림이 아니라 버림!`,
      },
      {
        title: '실용 예제: 사용자 입력 계산',
        code: `# input()은 항상 문자열 반환
price_str = "15000"
quantity_str = "3"

# 계산하려면 정수로 변환 필요
price = int(price_str)
quantity = int(quantity_str)
total = price * quantity

print(f"단가: {price}원")
print(f"수량: {quantity}개")
print(f"합계: {total}원")`,
        expected_output: `단가: 15000원
수량: 3개
합계: 45000원`,
      },
    ],
    keywords: ['타입변환', 'int', 'float', 'str', '형변환', 'type conversion'],
  },

  'py-basics-type-check': {
    name: '타입 확인',
    description: 'type(), isinstance()',
    content: `# 타입 확인

## type() 함수

변수나 값의 타입을 확인합니다.

\`\`\`python
print(type(42))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("hello"))   # <class 'str'>
print(type([1, 2, 3])) # <class 'list'>
\`\`\`

## isinstance() 함수

특정 타입인지 확인합니다 (True/False 반환).

\`\`\`python
x = 42
print(isinstance(x, int))    # True
print(isinstance(x, str))    # False
print(isinstance(x, (int, float)))  # 여러 타입 중 하나
\`\`\`

## type() vs isinstance()

\`\`\`python
# type()은 정확한 타입만 비교
print(type(42) == int)    # True
print(type(True) == int)  # False (bool은 int의 하위 클래스)

# isinstance()는 상속 관계도 고려
print(isinstance(True, int))   # True (bool은 int의 일종)
print(isinstance(True, bool))  # True
\`\`\`

## 조건문에서 활용

\`\`\`python
def process(value):
    if isinstance(value, int):
        print(f"{value}는 정수입니다")
    elif isinstance(value, str):
        print(f"'{value}'는 문자열입니다")
    elif isinstance(value, list):
        print(f"{value}는 리스트입니다")

process(42)
process("hello")
process([1, 2, 3])
\`\`\`

## 정리

- \`type(값)\`: 타입 객체 반환
- \`isinstance(값, 타입)\`: True/False 반환
- isinstance()가 더 유연함 (상속 고려)`,
    runnable_examples: [
      {
        title: 'type() 사용',
        code: `values = [42, 3.14, "hello", True, [1, 2], {"a": 1}]

for v in values:
    print(f"type({v!r}) = {type(v).__name__}")`,
        expected_output: `type(42) = int
type(3.14) = float
type('hello') = str
type(True) = bool
type([1, 2]) = list
type({'a': 1}) = dict`,
      },
      {
        title: 'isinstance() 사용',
        code: `x = 42

print(f"isinstance({x}, int): {isinstance(x, int)}")
print(f"isinstance({x}, str): {isinstance(x, str)}")
print(f"isinstance({x}, (int, float)): {isinstance(x, (int, float))}")

# bool은 int의 하위 클래스
b = True
print(f"isinstance({b}, bool): {isinstance(b, bool)}")
print(f"isinstance({b}, int): {isinstance(b, int)}")`,
        expected_output: `isinstance(42, int): True
isinstance(42, str): False
isinstance(42, (int, float)): True
isinstance(True, bool): True
isinstance(True, int): True`,
      },
      {
        title: '타입에 따른 처리',
        code: `def describe(value):
    if isinstance(value, bool):  # bool은 int보다 먼저 체크
        return f"{value}: 불리언"
    elif isinstance(value, int):
        return f"{value}: 정수"
    elif isinstance(value, float):
        return f"{value}: 실수"
    elif isinstance(value, str):
        return f"'{value}': 문자열"
    elif isinstance(value, list):
        return f"{value}: 리스트 ({len(value)}개)"
    else:
        return f"{value}: 기타"

items = [100, 3.14, "Python", True, [1, 2, 3]]
for item in items:
    print(describe(item))`,
        expected_output: `100: 정수
3.14: 실수
'Python': 문자열
True: 불리언
[1, 2, 3]: 리스트 (3개)`,
      },
    ],
    keywords: ['type', 'isinstance', '타입확인', '타입검사'],
  },

  'py-basics-comparison': {
    name: '비교 연산자',
    description: '==, !=, <, >, <=, >=',
    content: `# 비교 연산자

## 값 비교하기

비교 연산자는 두 값을 비교하여 True 또는 False를 반환합니다.

## 연산자 목록

| 연산자 | 의미 | 예시 |
|--------|------|------|
| == | 같다 | 5 == 5 -> True |
| != | 다르다 | 5 != 3 -> True |
| < | 작다 | 3 < 5 -> True |
| > | 크다 | 5 > 3 -> True |
| <= | 작거나 같다 | 5 <= 5 -> True |
| >= | 크거나 같다 | 5 >= 3 -> True |

## 숫자 비교

\`\`\`python
a, b = 10, 5

print(a == b)   # False
print(a != b)   # True
print(a > b)    # True
print(a < b)    # False
print(a >= 10)  # True
\`\`\`

## 문자열 비교

문자열은 사전순(알파벳순)으로 비교합니다.

\`\`\`python
print("apple" < "banana")  # True (a가 b보다 앞)
print("abc" < "abd")       # True
print("Python" == "python")  # False (대소문자 구분)
\`\`\`

## 연속 비교

Python은 연속 비교를 지원합니다.

\`\`\`python
x = 5
print(1 < x < 10)    # True (x는 1과 10 사이)
print(1 <= x <= 5)   # True
\`\`\`

## is vs ==

- \`==\`: 값이 같은지
- \`is\`: 같은 객체인지 (메모리 주소)

\`\`\`python
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)  # True (값이 같음)
print(a is b)  # False (다른 객체)
print(a is c)  # True (같은 객체)
\`\`\``,
    runnable_examples: [
      {
        title: '기본 비교',
        code: `a, b = 10, 5

print(f"{a} == {b}: {a == b}")
print(f"{a} != {b}: {a != b}")
print(f"{a} > {b}: {a > b}")
print(f"{a} < {b}: {a < b}")
print(f"{a} >= {a}: {a >= a}")
print(f"{b} <= {b}: {b <= b}")`,
        expected_output: `10 == 5: False
10 != 5: True
10 > 5: True
10 < 5: False
10 >= 10: True
5 <= 5: True`,
      },
      {
        title: '문자열 비교',
        code: `# 사전순 비교
print(f"'apple' < 'banana': {'apple' < 'banana'}")
print(f"'Zoo' < 'apple': {'Zoo' < 'apple'}")  # 대문자가 앞

# 길이가 아닌 내용 비교
print(f"'ab' < 'abc': {'ab' < 'abc'}")

# 대소문자 구분
print(f"'Python' == 'python': {'Python' == 'python'}")
print(f"'Python'.lower() == 'python': {'Python'.lower() == 'python'}")`,
        expected_output: `'apple' < 'banana': True
'Zoo' < 'apple': True
'ab' < 'abc': True
'Python' == 'python': False
'Python'.lower() == 'python': True`,
      },
      {
        title: '연속 비교',
        code: `score = 85

# 범위 검사
print(f"점수: {score}")
print(f"0 <= score <= 100: {0 <= score <= 100}")
print(f"90 <= score <= 100: {90 <= score <= 100}")
print(f"70 < score < 90: {70 < score < 90}")`,
        expected_output: `점수: 85
0 <= score <= 100: True
90 <= score <= 100: False
70 < score < 90: True`,
      },
      {
        title: '== vs is',
        code: `list1 = [1, 2, 3]
list2 = [1, 2, 3]
list3 = list1

print(f"list1 == list2: {list1 == list2}")  # 값 비교
print(f"list1 is list2: {list1 is list2}")  # 객체 비교
print(f"list1 is list3: {list1 is list3}")  # 같은 객체

# None 비교는 is 사용
x = None
print(f"x is None: {x is None}")`,
        expected_output: `list1 == list2: True
list1 is list2: False
list1 is list3: True
x is None: True`,
      },
    ],
    keywords: ['비교', '연산자', '==', '!=', '<', '>', 'is'],
  },

  'py-basics-logical': {
    name: '논리 연산자',
    description: 'and, or, not',
    content: `# 논리 연산자

## 여러 조건 조합하기

논리 연산자는 여러 조건을 조합합니다.

| 연산자 | 의미 | 설명 |
|--------|------|------|
| and | 그리고 | 모두 True면 True |
| or | 또는 | 하나라도 True면 True |
| not | 아니다 | True면 False, False면 True |

## and - 모두 참이어야

\`\`\`python
age = 25
has_license = True

if age >= 18 and has_license:
    print("운전 가능")
\`\`\`

## or - 하나만 참이어도

\`\`\`python
is_weekend = True
is_holiday = False

if is_weekend or is_holiday:
    print("휴일입니다")
\`\`\`

## not - 반전

\`\`\`python
is_logged_in = False

if not is_logged_in:
    print("로그인이 필요합니다")
\`\`\`

## 복합 조건

\`\`\`python
score = 85
attendance = 90

# 점수 80 이상이고 출석 70% 이상이면 합격
if score >= 80 and attendance >= 70:
    print("합격")

# 점수 95 이상이거나 출석 100%면 우수
if score >= 95 or attendance == 100:
    print("우수")
\`\`\`

## 단축 평가 (Short-circuit)

\`\`\`python
# and: 첫 값이 False면 두 번째는 평가 안 함
False and print("실행 안 됨")

# or: 첫 값이 True면 두 번째는 평가 안 함
True or print("실행 안 됨")
\`\`\``,
    runnable_examples: [
      {
        title: 'and, or, not 기본',
        code: `a, b = True, False

print(f"True and True: {True and True}")
print(f"True and False: {a and b}")
print(f"True or False: {a or b}")
print(f"False or False: {b or b}")
print(f"not True: {not a}")
print(f"not False: {not b}")`,
        expected_output: `True and True: True
True and False: False
True or False: True
False or False: False
not True: False
not False: True`,
      },
      {
        title: '실용 예제: 로그인 검사',
        code: `username = "admin"
password = "1234"
is_active = True

# 모든 조건 충족 시 로그인 성공
correct_username = username == "admin"
correct_password = password == "1234"

if correct_username and correct_password and is_active:
    print("로그인 성공!")
else:
    print("로그인 실패")

# 조건 분리 확인
print(f"\\n아이디 일치: {correct_username}")
print(f"비밀번호 일치: {correct_password}")
print(f"계정 활성: {is_active}")`,
        expected_output: `로그인 성공!

아이디 일치: True
비밀번호 일치: True
계정 활성: True`,
      },
      {
        title: '복합 조건',
        code: `age = 20
is_student = True
is_senior = False

# 학생이거나 노인이면 할인
if is_student or is_senior:
    print("할인 대상입니다")

# 성인이고 학생이 아니면 정가
if age >= 18 and not is_student:
    print("정가입니다")
else:
    print("할인가입니다")`,
        expected_output: `할인 대상입니다
할인가입니다`,
      },
      {
        title: '범위 검사',
        code: `def check_grade(score):
    if score < 0 or score > 100:
        return "유효하지 않은 점수"
    elif score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "F"

scores = [95, 82, 67, -5, 150]
for s in scores:
    print(f"점수 {s}: {check_grade(s)}")`,
        expected_output: `점수 95: A
점수 82: B
점수 67: F
점수 -5: 유효하지 않은 점수
점수 150: 유효하지 않은 점수`,
      },
    ],
    keywords: ['and', 'or', 'not', '논리연산자', '조건조합'],
  },

  'py-basics-membership': {
    name: '멤버십 연산자',
    description: 'in, not in',
    content: `# 멤버십 연산자

## 포함 여부 확인

\`in\`과 \`not in\`은 값이 컬렉션에 포함되어 있는지 확인합니다.

## in 연산자

\`\`\`python
# 리스트에서
fruits = ["apple", "banana", "orange"]
print("apple" in fruits)   # True
print("grape" in fruits)   # False

# 문자열에서
text = "Hello, World!"
print("World" in text)     # True
print("world" in text)     # False (대소문자 구분)

# 딕셔너리에서 (키만 확인)
person = {"name": "Kim", "age": 25}
print("name" in person)    # True
print("Kim" in person)     # False (키가 아닌 값)
\`\`\`

## not in 연산자

\`\`\`python
numbers = [1, 2, 3, 4, 5]
print(6 not in numbers)    # True
print(3 not in numbers)    # False
\`\`\`

## 조건문에서 활용

\`\`\`python
valid_commands = ["start", "stop", "pause", "resume"]
user_input = "start"

if user_input in valid_commands:
    print(f"명령 '{user_input}' 실행")
else:
    print("알 수 없는 명령입니다")
\`\`\`

## 성능 참고

- 리스트: O(n) - 처음부터 끝까지 검색
- 세트/딕셔너리: O(1) - 즉시 확인

\`\`\`python
# 많은 데이터에서 검색할 때는 세트 사용
large_list = list(range(10000))
large_set = set(range(10000))

# large_set에서 검색이 훨씬 빠름
9999 in large_set  # 빠름
9999 in large_list # 느림
\`\`\``,
    runnable_examples: [
      {
        title: '리스트와 문자열에서 in',
        code: `# 리스트
colors = ["red", "green", "blue"]
print(f"'red' in colors: {'red' in colors}")
print(f"'yellow' in colors: {'yellow' in colors}")

# 문자열
sentence = "Python is awesome"
print(f"'Python' in sentence: {'Python' in sentence}")
print(f"'python' in sentence: {'python' in sentence}")  # 대소문자 구분`,
        expected_output: `'red' in colors: True
'yellow' in colors: False
'Python' in sentence: True
'python' in sentence: False`,
      },
      {
        title: '딕셔너리에서 in (키 확인)',
        code: `user = {
    "name": "Kim",
    "email": "kim@example.com",
    "age": 30
}

print(f"'name' in user: {'name' in user}")
print(f"'phone' in user: {'phone' in user}")
print(f"'Kim' in user: {'Kim' in user}")  # 값은 확인 안 됨

# 값 확인하려면 .values()
print(f"'Kim' in user.values(): {'Kim' in user.values()}")`,
        expected_output: `'name' in user: True
'phone' in user: False
'Kim' in user: False
'Kim' in user.values(): True`,
      },
      {
        title: '실용 예제: 입력 검증',
        code: `allowed_choices = ["a", "b", "c", "q"]
blocked_words = ["spam", "ads", "virus"]

# 선택지 검증
choice = "b"
if choice in allowed_choices:
    print(f"'{choice}' 선택됨")

# 금칙어 검사
message = "이 제품이 좋아요"
has_blocked = False
for word in blocked_words:
    if word in message.lower():
        has_blocked = True
        break

if has_blocked:
    print("금칙어가 포함되어 있습니다")
else:
    print("메시지가 적합합니다")`,
        expected_output: `'b' 선택됨
메시지가 적합합니다`,
      },
    ],
    keywords: ['in', 'not in', '멤버십', '포함', '검색'],
  },

  'py-basics-string-methods': {
    name: '문자열 메서드',
    description: 'split, join, strip, replace',
    content: `# 문자열 메서드

## 자주 사용하는 메서드

### split() - 나누기

문자열을 구분자로 나누어 리스트로 만듭니다.

\`\`\`python
text = "apple,banana,orange"
fruits = text.split(",")
print(fruits)  # ['apple', 'banana', 'orange']

# 공백으로 나누기
sentence = "Hello World Python"
words = sentence.split()  # 기본값: 공백
print(words)  # ['Hello', 'World', 'Python']
\`\`\`

### join() - 합치기

리스트를 문자열로 합칩니다.

\`\`\`python
fruits = ['apple', 'banana', 'orange']
text = ",".join(fruits)
print(text)  # "apple,banana,orange"

words = ['Hello', 'World']
sentence = " ".join(words)
print(sentence)  # "Hello World"
\`\`\`

### strip() - 공백 제거

문자열 양끝의 공백을 제거합니다.

\`\`\`python
text = "  hello world  "
print(text.strip())   # "hello world"
print(text.lstrip())  # "hello world  " (왼쪽만)
print(text.rstrip())  # "  hello world" (오른쪽만)
\`\`\`

### replace() - 바꾸기

특정 문자열을 다른 문자열로 바꿉니다.

\`\`\`python
text = "Hello World"
new_text = text.replace("World", "Python")
print(new_text)  # "Hello Python"
\`\`\`

## 기타 유용한 메서드

\`\`\`python
text = "hello world"

print(text.upper())       # "HELLO WORLD"
print(text.lower())       # "hello world"
print(text.capitalize())  # "Hello world"
print(text.title())       # "Hello World"
print(text.count("l"))    # 3
print(text.find("world")) # 6 (시작 인덱스)
print(text.startswith("hello"))  # True
print(text.endswith("world"))    # True
\`\`\``,
    runnable_examples: [
      {
        title: 'split()과 join()',
        code: `# split: 문자열 -> 리스트
csv_data = "Kim,25,Seoul"
parts = csv_data.split(",")
print(f"split 결과: {parts}")

# join: 리스트 -> 문자열
items = ["apple", "banana", "cherry"]
result = " | ".join(items)
print(f"join 결과: {result}")

# 공백으로 나누기
sentence = "Python is   powerful"
words = sentence.split()
print(f"공백 split: {words}")`,
        expected_output: `split 결과: ['Kim', '25', 'Seoul']
join 결과: apple | banana | cherry
공백 split: ['Python', 'is', 'powerful']`,
      },
      {
        title: 'strip()과 replace()',
        code: `# strip: 양끝 공백 제거
user_input = "  hello world  \\n"
cleaned = user_input.strip()
print(f"원본: '{user_input}'")
print(f"strip: '{cleaned}'")

# replace: 문자열 치환
text = "I like Java. Java is great."
new_text = text.replace("Java", "Python")
print(f"replace: {new_text}")

# 여러 번 치환
text = "a-b-c-d"
print(f"'-' -> ' ': {text.replace('-', ' ')}")`,
        expected_output: `원본: '  hello world
'
strip: 'hello world'
replace: I like Python. Python is great.
'-' -> ' ': a b c d`,
      },
      {
        title: '대소문자 변환',
        code: `text = "hello WORLD python"

print(f"원본: {text}")
print(f"upper(): {text.upper()}")
print(f"lower(): {text.lower()}")
print(f"capitalize(): {text.capitalize()}")
print(f"title(): {text.title()}")
print(f"swapcase(): {text.swapcase()}")`,
        expected_output: `원본: hello WORLD python
upper(): HELLO WORLD PYTHON
lower(): hello world python
capitalize(): Hello world python
title(): Hello World Python
swapcase(): HELLO world PYTHON`,
      },
      {
        title: '검색 메서드',
        code: `text = "Python programming is fun"

print(f"count('n'): {text.count('n')}")
print(f"find('pro'): {text.find('pro')}")
print(f"find('java'): {text.find('java')}")  # 없으면 -1

print(f"startswith('Python'): {text.startswith('Python')}")
print(f"endswith('fun'): {text.endswith('fun')}")`,
        expected_output: `count('n'): 3
find('pro'): 7
find('java'): -1
startswith('Python'): True
endswith('fun'): True`,
      },
    ],
    keywords: ['split', 'join', 'strip', 'replace', 'upper', 'lower', '문자열메서드'],
  },

  'py-basics-string-format': {
    name: '문자열 포맷팅',
    description: 'f-string, format()',
    content: `# 문자열 포맷팅

## 변수를 문자열에 넣는 방법

### f-string (권장)

Python 3.6+에서 가장 권장되는 방법입니다.

\`\`\`python
name = "Kim"
age = 25
print(f"이름: {name}, 나이: {age}")
\`\`\`

### format() 메서드

\`\`\`python
print("이름: {}, 나이: {}".format(name, age))
print("이름: {0}, 나이: {1}".format(name, age))  # 인덱스
print("이름: {n}, 나이: {a}".format(n=name, a=age))  # 이름
\`\`\`

### % 연산자 (구식)

\`\`\`python
print("이름: %s, 나이: %d" % (name, age))
\`\`\`

## f-string 포맷 지정

### 숫자 포맷

\`\`\`python
num = 1234567.89

print(f"{num:,}")       # 1,234,567.89 (천 단위 쉼표)
print(f"{num:.2f}")     # 1234567.89 (소수점 2자리)
print(f"{num:,.2f}")    # 1,234,567.89 (조합)
print(f"{42:05d}")      # 00042 (5자리, 0으로 채움)
print(f"{0.75:.0%}")    # 75% (퍼센트)
\`\`\`

### 정렬

\`\`\`python
text = "Hi"
print(f"{text:<10}")    # 'Hi        ' (왼쪽 정렬)
print(f"{text:>10}")    # '        Hi' (오른쪽 정렬)
print(f"{text:^10}")    # '    Hi    ' (가운데 정렬)
print(f"{text:*^10}")   # '****Hi****' (채움 문자)
\`\`\`

### 표현식

\`\`\`python
x, y = 10, 3
print(f"{x} + {y} = {x + y}")
print(f"{x} / {y} = {x / y:.2f}")
\`\`\``,
    runnable_examples: [
      {
        title: 'f-string 기본',
        code: `name = "홍길동"
age = 30
city = "서울"

# 기본 사용
print(f"이름: {name}")
print(f"나이: {age}살")
print(f"{name}님은 {city}에 사는 {age}세입니다.")

# 표현식
print(f"내년 나이: {age + 1}살")`,
        expected_output: `이름: 홍길동
나이: 30살
홍길동님은 서울에 사는 30세입니다.
내년 나이: 31살`,
      },
      {
        title: '숫자 포맷',
        code: `price = 1234567
rate = 0.153
pi = 3.14159265359

print(f"가격: {price:,}원")
print(f"비율: {rate:.2%}")
print(f"파이: {pi:.4f}")

# 번호 포맷
for i in range(1, 4):
    print(f"파일_{i:03d}.txt")`,
        expected_output: `가격: 1,234,567원
비율: 15.30%
파이: 3.1416
파일_001.txt
파일_002.txt
파일_003.txt`,
      },
      {
        title: '정렬',
        code: `items = [("사과", 1500), ("바나나", 3000), ("오렌지", 2500)]

print("=" * 20)
print(f"{'품목':^10}{'가격':^10}")
print("=" * 20)
for name, price in items:
    print(f"{name:<10}{price:>10,}")`,
        expected_output: `====================
    품목        가격
====================
사과              1,500
바나나             3,000
오렌지             2,500`,
      },
      {
        title: 'format() 메서드',
        code: `# 위치 인자
print("이름: {}, 나이: {}".format("Kim", 25))

# 인덱스
print("{1}은 {0}살".format(25, "Kim"))

# 키워드
print("{name}님, 주문 금액은 {price:,}원입니다.".format(
    name="홍길동", price=50000))`,
        expected_output: `이름: Kim, 나이: 25
Kim은 25살
홍길동님, 주문 금액은 50,000원입니다.`,
      },
    ],
    keywords: ['f-string', 'format', '포맷팅', '문자열', '형식'],
  },

  'py-basics-string-slice': {
    name: '슬라이싱',
    description: 'text[1:5], text[::2]',
    content: `# 슬라이싱

## 문자열 일부 추출

슬라이싱은 문자열의 일부분을 추출하는 방법입니다.

## 기본 문법

\`\`\`python
text[시작:끝:간격]
\`\`\`

- 시작: 시작 인덱스 (포함)
- 끝: 끝 인덱스 (미포함)
- 간격: 몇 칸씩 건너뛸지

## 기본 슬라이싱

\`\`\`python
text = "Python"
#       012345

print(text[0:3])   # "Pyt" (0~2)
print(text[2:5])   # "tho" (2~4)
print(text[0:6])   # "Python" (전체)
\`\`\`

## 생략 가능

\`\`\`python
text = "Python"

print(text[:3])    # "Pyt" (처음부터)
print(text[3:])    # "hon" (끝까지)
print(text[:])     # "Python" (전체 복사)
\`\`\`

## 음수 인덱스

\`\`\`python
text = "Python"
#      -6-5-4-3-2-1

print(text[-3:])    # "hon" (뒤에서 3글자)
print(text[:-2])    # "Pyth" (뒤 2글자 제외)
print(text[-4:-1])  # "tho"
\`\`\`

## 간격 (step)

\`\`\`python
text = "0123456789"

print(text[::2])    # "02468" (2칸씩)
print(text[1::2])   # "13579" (1부터 2칸씩)
print(text[::-1])   # "9876543210" (역순)
\`\`\``,
    runnable_examples: [
      {
        title: '기본 슬라이싱',
        code: `text = "Hello Python"
#       0123456789...

print(f"전체: {text}")
print(f"[0:5]: {text[0:5]}")
print(f"[6:12]: {text[6:12]}")
print(f"[:5]: {text[:5]}")
print(f"[6:]: {text[6:]}")`,
        expected_output: `전체: Hello Python
[0:5]: Hello
[6:12]: Python
[:5]: Hello
[6:]: Python`,
      },
      {
        title: '음수 인덱스',
        code: `text = "programming"

print(f"전체: {text}")
print(f"[-4:]: {text[-4:]}")       # 뒤 4글자
print(f"[:-4]: {text[:-4]}")       # 뒤 4글자 제외
print(f"[-7:-3]: {text[-7:-3]}")   # 중간 부분`,
        expected_output: `전체: programming
[-4:]: ming
[:-4]: program
[-7:-3]: gram`,
      },
      {
        title: '간격(step) 사용',
        code: `text = "0123456789"

print(f"[::2]: {text[::2]}")    # 짝수 인덱스
print(f"[1::2]: {text[1::2]}")  # 홀수 인덱스
print(f"[::3]: {text[::3]}")    # 3칸씩
print(f"[::-1]: {text[::-1]}")  # 역순

# 문자열 뒤집기
word = "Python"
print(f"'{word}' 뒤집기: '{word[::-1]}'")`,
        expected_output: `[::2]: 02468
[1::2]: 13579
[::3]: 0369
[::-1]: 9876543210
'Python' 뒤집기: 'nohtyP'`,
      },
      {
        title: '실용 예제',
        code: `# 파일 확장자 추출
filename = "document.pdf"
extension = filename[-3:]
print(f"확장자: {extension}")

# 전화번호 마스킹
phone = "010-1234-5678"
masked = phone[:4] + "****" + phone[-5:]
print(f"마스킹: {masked}")

# 날짜 파싱
date = "2024-01-15"
year = date[:4]
month = date[5:7]
day = date[8:]
print(f"{year}년 {month}월 {day}일")`,
        expected_output: `확장자: pdf
마스킹: 010-****-5678
2024년 01월 15일`,
      },
    ],
    keywords: ['슬라이싱', 'slice', '인덱스', '추출', '부분문자열'],
  },

  'py-basics-for-enumerate': {
    name: 'enumerate',
    description: '인덱스와 값 함께 순회',
    content: `# enumerate

## 인덱스가 필요할 때

리스트를 순회하면서 인덱스도 함께 필요할 때 enumerate를 사용합니다.

## 기존 방법의 문제

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# 방법 1: range 사용 (불편함)
for i in range(len(fruits)):
    print(i, fruits[i])

# 방법 2: 변수로 카운트 (비효율)
i = 0
for fruit in fruits:
    print(i, fruit)
    i += 1
\`\`\`

## enumerate 사용

\`\`\`python
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    print(index, fruit)
# 0 apple
# 1 banana
# 2 cherry
\`\`\`

## 시작 인덱스 지정

\`\`\`python
for index, fruit in enumerate(fruits, start=1):
    print(index, fruit)
# 1 apple
# 2 banana
# 3 cherry
\`\`\`

## 활용 예시

\`\`\`python
# 검색 결과 출력
results = ["Python 튜토리얼", "Python 문서", "Python 예제"]
for i, result in enumerate(results, start=1):
    print(f"{i}. {result}")

# 특정 조건 인덱스 찾기
numbers = [10, 25, 30, 45, 50]
for i, num in enumerate(numbers):
    if num > 30:
        print(f"30 초과 첫 인덱스: {i}")
        break
\`\`\``,
    runnable_examples: [
      {
        title: 'enumerate 기본',
        code: `fruits = ["apple", "banana", "cherry", "date"]

print("=== enumerate 없이 ===")
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")

print("\\n=== enumerate 사용 ===")
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")`,
        expected_output: `=== enumerate 없이 ===
0: apple
1: banana
2: cherry
3: date

=== enumerate 사용 ===
0: apple
1: banana
2: cherry
3: date`,
      },
      {
        title: '시작 인덱스 지정',
        code: `items = ["첫 번째", "두 번째", "세 번째"]

print("=== 1부터 시작 ===")
for num, item in enumerate(items, start=1):
    print(f"{num}. {item}")

print("\\n=== 10부터 시작 ===")
for num, item in enumerate(items, start=10):
    print(f"[{num}] {item}")`,
        expected_output: `=== 1부터 시작 ===
1. 첫 번째
2. 두 번째
3. 세 번째

=== 10부터 시작 ===
[10] 첫 번째
[11] 두 번째
[12] 세 번째`,
      },
      {
        title: '실용 예제: 검색/수정',
        code: `scores = [78, 92, 65, 88, 45, 91]

# 90점 이상 찾기
print("90점 이상:")
for i, score in enumerate(scores):
    if score >= 90:
        print(f"  인덱스 {i}: {score}점")

# 60점 미만 수정
print("\\n60점 미만 -> 60점으로 조정:")
for i, score in enumerate(scores):
    if score < 60:
        print(f"  인덱스 {i}: {score} -> 60")
        scores[i] = 60

print(f"\\n조정 후: {scores}")`,
        expected_output: `90점 이상:
  인덱스 1: 92점
  인덱스 5: 91점

60점 미만 -> 60점으로 조정:
  인덱스 4: 45 -> 60

조정 후: [78, 92, 65, 88, 60, 91]`,
      },
    ],
    keywords: ['enumerate', '인덱스', '순회', '반복', '번호'],
  },

  'py-basics-for-zip': {
    name: 'zip',
    description: '여러 리스트 동시 순회',
    content: `# zip

## 여러 리스트 동시 순회

zip은 여러 리스트를 병렬로 순회할 때 사용합니다.

## 기본 사용법

\`\`\`python
names = ["Kim", "Lee", "Park"]
ages = [25, 30, 28]

for name, age in zip(names, ages):
    print(f"{name}: {age}살")
# Kim: 25살
# Lee: 30살
# Park: 28살
\`\`\`

## 3개 이상도 가능

\`\`\`python
names = ["Kim", "Lee"]
ages = [25, 30]
cities = ["Seoul", "Busan"]

for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age}살, {city}")
\`\`\`

## 길이가 다르면?

가장 짧은 리스트 기준으로 멈춥니다.

\`\`\`python
a = [1, 2, 3, 4, 5]
b = ["a", "b", "c"]

for x, y in zip(a, b):
    print(x, y)
# 1 a
# 2 b
# 3 c (5개 중 3개만)
\`\`\`

## 딕셔너리 만들기

\`\`\`python
keys = ["name", "age", "city"]
values = ["Kim", 25, "Seoul"]

person = dict(zip(keys, values))
print(person)
# {"name": "Kim", "age": 25, "city": "Seoul"}
\`\`\`

## enumerate와 함께

\`\`\`python
names = ["Kim", "Lee", "Park"]
scores = [85, 90, 78]

for i, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{i}. {name}: {score}점")
\`\`\``,
    runnable_examples: [
      {
        title: 'zip 기본',
        code: `names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]

print("=== 이름과 나이 ===")
for name, age in zip(names, ages):
    print(f"{name}는 {age}살입니다")`,
        expected_output: `=== 이름과 나이 ===
Alice는 25살입니다
Bob는 30살입니다
Charlie는 35살입니다`,
      },
      {
        title: '3개 리스트 결합',
        code: `products = ["노트북", "키보드", "마우스"]
prices = [1500000, 80000, 50000]
stocks = [10, 50, 100]

print(f"{'상품':<10}{'가격':>12}{'재고':>8}")
print("-" * 30)
for prod, price, stock in zip(products, prices, stocks):
    print(f"{prod:<10}{price:>12,}원{stock:>6}개")`,
        expected_output: `상품              가격      재고
------------------------------
노트북       1,500,000원    10개
키보드          80,000원    50개
마우스          50,000원   100개`,
      },
      {
        title: 'zip으로 딕셔너리 생성',
        code: `keys = ["name", "email", "phone"]
values = ["홍길동", "hong@mail.com", "010-1234-5678"]

# dict 생성
user = dict(zip(keys, values))
print("생성된 딕셔너리:")
for key, value in user.items():
    print(f"  {key}: {value}")`,
        expected_output: `생성된 딕셔너리:
  name: 홍길동
  email: hong@mail.com
  phone: 010-1234-5678`,
      },
      {
        title: 'enumerate + zip',
        code: `students = ["김철수", "이영희", "박민수"]
korean = [85, 92, 78]
english = [90, 88, 95]
math = [88, 95, 82]

print("=== 성적표 ===")
for i, (name, kor, eng, mat) in enumerate(zip(students, korean, english, math), 1):
    total = kor + eng + mat
    avg = total / 3
    print(f"{i}. {name}: 국어 {kor}, 영어 {eng}, 수학 {mat} / 평균 {avg:.1f}")`,
        expected_output: `=== 성적표 ===
1. 김철수: 국어 85, 영어 90, 수학 88 / 평균 87.7
2. 이영희: 국어 92, 영어 88, 수학 95 / 평균 91.7
3. 박민수: 국어 78, 영어 95, 수학 82 / 평균 85.0`,
      },
    ],
    keywords: ['zip', '병렬', '순회', '결합', '동시'],
  },

  'py-basics-break-continue': {
    name: 'break와 continue',
    description: '반복문 제어',
    content: `# break와 continue

## 반복문 제어

- **break**: 반복문을 즉시 종료
- **continue**: 현재 반복을 건너뛰고 다음으로

## break - 반복 종료

\`\`\`python
for i in range(10):
    if i == 5:
        break
    print(i)
# 0, 1, 2, 3, 4 (5에서 멈춤)
\`\`\`

## continue - 건너뛰기

\`\`\`python
for i in range(5):
    if i == 2:
        continue
    print(i)
# 0, 1, 3, 4 (2만 건너뜀)
\`\`\`

## 검색에서 break

\`\`\`python
numbers = [4, 7, 2, 9, 1, 5]
target = 9

for i, num in enumerate(numbers):
    if num == target:
        print(f"{target}을(를) 인덱스 {i}에서 발견!")
        break
\`\`\`

## 필터링에서 continue

\`\`\`python
# 짝수만 출력
for i in range(10):
    if i % 2 != 0:  # 홀수면 건너뛰기
        continue
    print(i)  # 짝수만 출력
\`\`\`

## while과 함께

\`\`\`python
# 사용자 입력 받기
while True:
    text = input("입력 (q: 종료): ")
    if text == 'q':
        break
    print(f"입력값: {text}")
\`\`\`

## 중첩 반복문에서

break/continue는 가장 가까운 반복문에만 적용됩니다.

\`\`\`python
for i in range(3):
    for j in range(3):
        if j == 1:
            break  # 내부 for문만 종료
        print(i, j)
\`\`\``,
    runnable_examples: [
      {
        title: 'break 기본',
        code: `print("=== 5에서 멈추기 ===")
for i in range(10):
    if i == 5:
        print("break!")
        break
    print(i)
print("반복문 종료")`,
        expected_output: `=== 5에서 멈추기 ===
0
1
2
3
4
break!
반복문 종료`,
      },
      {
        title: 'continue 기본',
        code: `print("=== 홀수만 건너뛰기 ===")
for i in range(8):
    if i % 2 == 1:  # 홀수면
        continue
    print(i)`,
        expected_output: `=== 홀수만 건너뛰기 ===
0
2
4
6`,
      },
      {
        title: '검색에서 break',
        code: `words = ["apple", "banana", "cherry", "date", "elderberry"]
search = "cherry"

found_index = -1
for i, word in enumerate(words):
    print(f"검색 중... {word}")
    if word == search:
        found_index = i
        break

if found_index >= 0:
    print(f"'{search}'를 인덱스 {found_index}에서 발견!")
else:
    print("찾지 못함")`,
        expected_output: `검색 중... apple
검색 중... banana
검색 중... cherry
'cherry'를 인덱스 2에서 발견!`,
      },
      {
        title: '데이터 필터링',
        code: `data = [15, -3, 42, 0, 7, -10, 28, 0, 33]

print("양수만 처리:")
positive_sum = 0
for value in data:
    if value <= 0:  # 0 이하는 건너뛰기
        continue
    print(f"  처리: {value}")
    positive_sum += value

print(f"양수 합계: {positive_sum}")`,
        expected_output: `양수만 처리:
  처리: 15
  처리: 42
  처리: 7
  처리: 28
  처리: 33
양수 합계: 125`,
      },
    ],
    keywords: ['break', 'continue', '반복제어', '종료', '건너뛰기'],
  },

  'py-basics-default-args': {
    name: '기본 매개변수',
    description: 'def func(a=10):',
    content: `# 기본 매개변수

## 기본값 설정

함수 매개변수에 기본값을 지정할 수 있습니다.
인자를 전달하지 않으면 기본값이 사용됩니다.

\`\`\`python
def greet(name="손님"):
    print(f"안녕하세요, {name}님!")

greet("철수")  # 안녕하세요, 철수님!
greet()        # 안녕하세요, 손님님!
\`\`\`

## 여러 기본 매개변수

\`\`\`python
def create_user(name, age=0, city="미정"):
    print(f"{name}, {age}살, {city}")

create_user("Kim")              # Kim, 0살, 미정
create_user("Lee", 25)          # Lee, 25살, 미정
create_user("Park", 30, "서울") # Park, 30살, 서울
\`\`\`

## 주의: 기본값 매개변수는 뒤에

\`\`\`python
# 올바름
def func(a, b=10):
    pass

# 오류! 기본값 없는 매개변수가 뒤에 올 수 없음
# def func(a=10, b):
#     pass
\`\`\`

## 키워드 인자

순서 상관없이 이름으로 지정할 수 있습니다.

\`\`\`python
def create_account(name, email, age=0, country="KR"):
    print(f"{name}, {email}, {age}살, {country}")

# 키워드로 지정
create_account("Kim", "kim@mail.com", country="US")
create_account(email="lee@mail.com", name="Lee", age=25)
\`\`\`

## 주의: 가변 기본값

리스트나 딕셔너리를 기본값으로 사용하면 안 됩니다!

\`\`\`python
# 잘못된 예
def add_item(item, items=[]):
    items.append(item)
    return items

# 올바른 예
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
\`\`\``,
    runnable_examples: [
      {
        title: '기본 매개변수',
        code: `def greet(name="World", greeting="Hello"):
    print(f"{greeting}, {name}!")

greet()                    # 둘 다 기본값
greet("Python")            # name만 지정
greet("Python", "Hi")      # 둘 다 지정`,
        expected_output: `Hello, World!
Hello, Python!
Hi, Python!`,
      },
      {
        title: '키워드 인자',
        code: `def order(item, size="M", extra=None):
    result = f"{size} 사이즈 {item}"
    if extra:
        result += f" (+{extra})"
    return result

print(order("커피"))
print(order("커피", "L"))
print(order("커피", extra="샷추가"))
print(order(size="S", item="라떼", extra="시럽"))`,
        expected_output: `M 사이즈 커피
L 사이즈 커피
M 사이즈 커피 (+샷추가)
S 사이즈 라떼 (+시럽)`,
      },
      {
        title: '실용 예제: 설정 함수',
        code: `def connect_database(host="localhost", port=5432,
                        user="admin", password=""):
    config = {
        "host": host,
        "port": port,
        "user": user,
        "password": "****" if password else "(없음)"
    }
    print("DB 연결 설정:")
    for key, value in config.items():
        print(f"  {key}: {value}")

print("=== 기본 설정 ===")
connect_database()

print("\\n=== 커스텀 설정 ===")
connect_database(host="192.168.1.100", password="secret")`,
        expected_output: `=== 기본 설정 ===
DB 연결 설정:
  host: localhost
  port: 5432
  user: admin
  password: (없음)

=== 커스텀 설정 ===
DB 연결 설정:
  host: 192.168.1.100
  port: 5432
  user: admin
  password: ****`,
      },
    ],
    keywords: ['기본매개변수', 'default', '기본값', '키워드인자'],
  },

  'py-basics-args-kwargs': {
    name: '*args와 **kwargs',
    description: '가변 인자',
    content: `# *args와 **kwargs

## 가변 인자

인자 개수가 정해지지 않았을 때 사용합니다.

## *args - 위치 인자들

\`\`\`python
def add(*args):
    print(f"args: {args}")  # 튜플
    return sum(args)

print(add(1, 2))        # 3
print(add(1, 2, 3, 4))  # 10
\`\`\`

## **kwargs - 키워드 인자들

\`\`\`python
def print_info(**kwargs):
    print(f"kwargs: {kwargs}")  # 딕셔너리
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Kim", age=25, city="Seoul")
\`\`\`

## 함께 사용

\`\`\`python
def func(a, b, *args, **kwargs):
    print(f"a={a}, b={b}")
    print(f"args={args}")
    print(f"kwargs={kwargs}")

func(1, 2, 3, 4, x=10, y=20)
# a=1, b=2
# args=(3, 4)
# kwargs={'x': 10, 'y': 20}
\`\`\`

## 언패킹

\`\`\`python
def add(a, b, c):
    return a + b + c

numbers = [1, 2, 3]
print(add(*numbers))  # add(1, 2, 3)

params = {"a": 1, "b": 2, "c": 3}
print(add(**params))  # add(a=1, b=2, c=3)
\`\`\``,
    runnable_examples: [
      {
        title: '*args 사용',
        code: `def total(*numbers):
    print(f"받은 인자: {numbers}")
    return sum(numbers)

print(f"합계: {total(1, 2)}")
print(f"합계: {total(1, 2, 3, 4, 5)}")
print(f"합계: {total(10, 20, 30, 40)}")`,
        expected_output: `받은 인자: (1, 2)
합계: 3
받은 인자: (1, 2, 3, 4, 5)
합계: 15
받은 인자: (10, 20, 30, 40)
합계: 100`,
      },
      {
        title: '**kwargs 사용',
        code: `def create_profile(**info):
    print("=== 프로필 ===")
    for key, value in info.items():
        print(f"{key}: {value}")
    print()

create_profile(name="Kim", age=25)
create_profile(name="Lee", job="Developer", city="Seoul", hobby="coding")`,
        expected_output: `=== 프로필 ===
name: Kim
age: 25

=== 프로필 ===
name: Lee
job: Developer
city: Seoul
hobby: coding
`,
      },
      {
        title: '혼합 사용',
        code: `def report(title, *items, **options):
    print(f"제목: {title}")
    print(f"항목: {items}")
    print(f"옵션: {options}")
    print()

report("보고서", "항목1", "항목2", "항목3")
report("설정", "A", "B", format="PDF", page=10)`,
        expected_output: `제목: 보고서
항목: ('항목1', '항목2', '항목3')
옵션: {}

제목: 설정
항목: ('A', 'B')
옵션: {'format': 'PDF', 'page': 10}
`,
      },
      {
        title: '언패킹',
        code: `def multiply(a, b, c):
    return a * b * c

# 리스트 언패킹
nums = [2, 3, 4]
print(f"multiply(*[2,3,4]) = {multiply(*nums)}")

# 딕셔너리 언패킹
params = {"a": 5, "b": 6, "c": 7}
print(f"multiply(**dict) = {multiply(**params)}")`,
        expected_output: `multiply(*[2,3,4]) = 24
multiply(**dict) = 210`,
      },
    ],
    keywords: ['args', 'kwargs', '가변인자', '언패킹', '*', '**'],
  },

  'py-basics-lambda': {
    name: '람다 함수',
    description: 'lambda x: x + 1',
    content: `# 람다 함수

## 익명 함수

람다는 이름 없는 간단한 함수입니다.
한 줄로 간단한 함수를 만들 때 사용합니다.

## 기본 문법

\`\`\`python
lambda 매개변수: 표현식
\`\`\`

## 일반 함수와 비교

\`\`\`python
# 일반 함수
def add(a, b):
    return a + b

# 람다
add = lambda a, b: a + b

print(add(3, 5))  # 8
\`\`\`

## 주요 활용처

### sorted()의 key

\`\`\`python
students = [("Kim", 85), ("Lee", 92), ("Park", 78)]

# 점수로 정렬
by_score = sorted(students, key=lambda x: x[1])
print(by_score)  # [('Park', 78), ('Kim', 85), ('Lee', 92)]
\`\`\`

### map()과 함께

\`\`\`python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
print(squares)  # [1, 4, 9, 16, 25]
\`\`\`

### filter()와 함께

\`\`\`python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]
\`\`\`

## 언제 람다를 쓸까?

- 한 번만 사용하는 간단한 함수
- sorted, map, filter 등의 key 함수
- 함수를 인자로 전달할 때`,
    runnable_examples: [
      {
        title: '람다 기본',
        code: `# 일반 함수
def double(x):
    return x * 2

# 람다 함수
triple = lambda x: x * 3

print(f"double(5) = {double(5)}")
print(f"triple(5) = {triple(5)}")

# 여러 매개변수
add = lambda a, b: a + b
print(f"add(3, 4) = {add(3, 4)}")`,
        expected_output: `double(5) = 10
triple(5) = 15
add(3, 4) = 7`,
      },
      {
        title: 'sorted()와 람다',
        code: `# 학생 데이터
students = [
    {"name": "Kim", "score": 85},
    {"name": "Lee", "score": 92},
    {"name": "Park", "score": 78},
]

# 점수로 정렬
by_score = sorted(students, key=lambda s: s["score"])
print("점수 오름차순:")
for s in by_score:
    print(f"  {s['name']}: {s['score']}")

# 점수 내림차순
by_score_desc = sorted(students, key=lambda s: s["score"], reverse=True)
print("\\n점수 내림차순:")
for s in by_score_desc:
    print(f"  {s['name']}: {s['score']}")`,
        expected_output: `점수 오름차순:
  Park: 78
  Kim: 85
  Lee: 92

점수 내림차순:
  Lee: 92
  Kim: 85
  Park: 78`,
      },
      {
        title: 'map()과 filter()',
        code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# map: 모든 요소 변환
squares = list(map(lambda x: x**2, numbers))
print(f"제곱: {squares}")

# filter: 조건에 맞는 요소만
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"짝수: {evens}")

# 조합: 짝수의 제곱
even_squares = list(map(lambda x: x**2, filter(lambda x: x % 2 == 0, numbers)))
print(f"짝수의 제곱: {even_squares}")`,
        expected_output: `제곱: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
짝수: [2, 4, 6, 8, 10]
짝수의 제곱: [4, 16, 36, 64, 100]`,
      },
    ],
    keywords: ['lambda', '람다', '익명함수', 'map', 'filter', 'sorted'],
  },

  'py-basics-list-comprehension': {
    name: '리스트 컴프리헨션',
    description: '[x*2 for x in range(10)]',
    content: `# 리스트 컴프리헨션

## 한 줄로 리스트 만들기

리스트 컴프리헨션은 리스트를 간결하게 생성하는 문법입니다.

## 기본 문법

\`\`\`python
[표현식 for 변수 in 반복가능한것]
\`\`\`

## 기존 방식과 비교

\`\`\`python
# 기존 방식
squares = []
for x in range(5):
    squares.append(x ** 2)

# 리스트 컴프리헨션
squares = [x ** 2 for x in range(5)]
print(squares)  # [0, 1, 4, 9, 16]
\`\`\`

## 조건 추가

\`\`\`python
# 짝수만
evens = [x for x in range(10) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8]

# 조건부 값
labels = ["짝" if x % 2 == 0 else "홀" for x in range(5)]
print(labels)  # ['짝', '홀', '짝', '홀', '짝']
\`\`\`

## 중첩 반복

\`\`\`python
# 구구단 (2단만)
multiplication = [f"2x{i}={2*i}" for i in range(1, 10)]

# 2차원 좌표
coords = [(x, y) for x in range(3) for y in range(3)]
print(coords)
# [(0,0), (0,1), (0,2), (1,0), (1,1), ...]
\`\`\`

## 언제 사용할까?

- 간단한 변환이나 필터링
- 가독성이 좋을 때 (너무 복잡하면 for문 사용)`,
    runnable_examples: [
      {
        title: '기본 컴프리헨션',
        code: `# 1부터 10까지 제곱
squares = [x**2 for x in range(1, 11)]
print(f"제곱: {squares}")

# 문자열 변환
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
print(f"대문자: {upper_words}")

# 길이 리스트
lengths = [len(w) for w in words]
print(f"길이: {lengths}")`,
        expected_output: `제곱: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
대문자: ['HELLO', 'WORLD', 'PYTHON']
길이: [5, 5, 6]`,
      },
      {
        title: '조건 필터링',
        code: `numbers = list(range(1, 21))

# 짝수만
evens = [n for n in numbers if n % 2 == 0]
print(f"짝수: {evens}")

# 3의 배수만
multiples_of_3 = [n for n in numbers if n % 3 == 0]
print(f"3의 배수: {multiples_of_3}")

# 10보다 큰 짝수
big_evens = [n for n in numbers if n > 10 and n % 2 == 0]
print(f"10 초과 짝수: {big_evens}")`,
        expected_output: `짝수: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
3의 배수: [3, 6, 9, 12, 15, 18]
10 초과 짝수: [12, 14, 16, 18, 20]`,
      },
      {
        title: '조건부 값',
        code: `numbers = [1, 2, 3, 4, 5]

# 짝홀 라벨
labels = ["짝수" if n % 2 == 0 else "홀수" for n in numbers]
print(f"라벨: {labels}")

# 값에 따른 변환
processed = [n * 2 if n % 2 == 0 else n for n in numbers]
print(f"처리: {processed}")`,
        expected_output: `라벨: ['홀수', '짝수', '홀수', '짝수', '홀수']
처리: [1, 4, 3, 8, 5]`,
      },
      {
        title: '실용 예제',
        code: `# 파일명에서 확장자가 .py인 것만
files = ["main.py", "data.csv", "util.py", "config.json", "test.py"]
python_files = [f for f in files if f.endswith(".py")]
print(f"Python 파일: {python_files}")

# 딕셔너리에서 특정 값 추출
users = [
    {"name": "Kim", "age": 25, "active": True},
    {"name": "Lee", "age": 30, "active": False},
    {"name": "Park", "age": 28, "active": True},
]
active_names = [u["name"] for u in users if u["active"]]
print(f"활성 사용자: {active_names}")`,
        expected_output: `Python 파일: ['main.py', 'util.py', 'test.py']
활성 사용자: ['Kim', 'Park']`,
      },
    ],
    keywords: ['컴프리헨션', 'comprehension', '리스트', '반복', '필터'],
  },

  'py-basics-list-sort': {
    name: '정렬',
    description: 'sort(), sorted(), reverse()',
    content: `# 정렬

## sort() vs sorted()

- **sort()**: 원본 리스트를 정렬 (제자리 정렬)
- **sorted()**: 새로운 정렬된 리스트 반환 (원본 유지)

\`\`\`python
nums = [3, 1, 4, 1, 5, 9]

# sort(): 원본 변경
nums.sort()
print(nums)  # [1, 1, 3, 4, 5, 9]

# sorted(): 새 리스트 반환
nums = [3, 1, 4, 1, 5, 9]
new_nums = sorted(nums)
print(new_nums)  # [1, 1, 3, 4, 5, 9]
print(nums)      # [3, 1, 4, 1, 5, 9] (원본 유지)
\`\`\`

## 내림차순 정렬

\`\`\`python
nums = [3, 1, 4, 1, 5, 9]

nums.sort(reverse=True)
print(nums)  # [9, 5, 4, 3, 1, 1]

# 또는
sorted_nums = sorted(nums, reverse=True)
\`\`\`

## key 매개변수

정렬 기준을 지정합니다.

\`\`\`python
words = ["banana", "Apple", "cherry"]

# 기본: 대문자가 앞
print(sorted(words))  # ['Apple', 'banana', 'cherry']

# 소문자로 변환해서 비교
print(sorted(words, key=str.lower))  # ['Apple', 'banana', 'cherry']

# 길이순
print(sorted(words, key=len))  # ['Apple', 'banana', 'cherry']
\`\`\`

## 복잡한 정렬

\`\`\`python
students = [("Kim", 85), ("Lee", 92), ("Park", 78)]

# 점수로 정렬
by_score = sorted(students, key=lambda s: s[1])
print(by_score)  # [('Park', 78), ('Kim', 85), ('Lee', 92)]
\`\`\`

## reverse()

리스트 순서를 뒤집습니다 (정렬이 아님).

\`\`\`python
nums = [1, 2, 3, 4, 5]
nums.reverse()
print(nums)  # [5, 4, 3, 2, 1]
\`\`\``,
    runnable_examples: [
      {
        title: 'sort() vs sorted()',
        code: `original = [5, 2, 8, 1, 9]

# sorted(): 원본 유지
sorted_list = sorted(original)
print(f"sorted() 결과: {sorted_list}")
print(f"원본: {original}")

# sort(): 원본 변경
original.sort()
print(f"sort() 후 원본: {original}")`,
        expected_output: `sorted() 결과: [1, 2, 5, 8, 9]
원본: [5, 2, 8, 1, 9]
sort() 후 원본: [1, 2, 5, 8, 9]`,
      },
      {
        title: '내림차순과 reverse',
        code: `nums = [3, 1, 4, 1, 5, 9, 2, 6]

# 오름차순
print(f"오름차순: {sorted(nums)}")

# 내림차순
print(f"내림차순: {sorted(nums, reverse=True)}")

# reverse: 순서만 뒤집기
letters = ["a", "b", "c", "d"]
letters.reverse()
print(f"reverse: {letters}")`,
        expected_output: `오름차순: [1, 1, 2, 3, 4, 5, 6, 9]
내림차순: [9, 6, 5, 4, 3, 2, 1, 1]
reverse: ['d', 'c', 'b', 'a']`,
      },
      {
        title: 'key로 정렬 기준 지정',
        code: `words = ["banana", "Apple", "cherry", "Date"]

print(f"기본 정렬: {sorted(words)}")
print(f"소문자 기준: {sorted(words, key=str.lower)}")
print(f"길이 기준: {sorted(words, key=len)}")`,
        expected_output: `기본 정렬: ['Apple', 'Date', 'banana', 'cherry']
소문자 기준: ['Apple', 'banana', 'cherry', 'Date']
길이 기준: ['Date', 'Apple', 'banana', 'cherry']`,
      },
      {
        title: '복잡한 데이터 정렬',
        code: `products = [
    {"name": "노트북", "price": 1500000, "stock": 10},
    {"name": "키보드", "price": 80000, "stock": 50},
    {"name": "마우스", "price": 50000, "stock": 30},
]

# 가격순
by_price = sorted(products, key=lambda p: p["price"])
print("가격 오름차순:")
for p in by_price:
    print(f"  {p['name']}: {p['price']:,}원")

# 재고 내림차순
by_stock = sorted(products, key=lambda p: p["stock"], reverse=True)
print("\\n재고 내림차순:")
for p in by_stock:
    print(f"  {p['name']}: {p['stock']}개")`,
        expected_output: `가격 오름차순:
  마우스: 50,000원
  키보드: 80,000원
  노트북: 1,500,000원

재고 내림차순:
  키보드: 50개
  마우스: 30개
  노트북: 10개`,
      },
    ],
    keywords: ['sort', 'sorted', 'reverse', '정렬', 'key', '오름차순', '내림차순'],
  },

  'py-basics-list-slice': {
    name: '리스트 슬라이싱',
    description: 'list[1:5], list[::2]',
    content: `# 리스트 슬라이싱

## 리스트 일부 추출

문자열 슬라이싱과 동일한 문법입니다.

\`\`\`python
리스트[시작:끝:간격]
\`\`\`

## 기본 슬라이싱

\`\`\`python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(nums[2:5])   # [2, 3, 4]
print(nums[:3])    # [0, 1, 2]
print(nums[7:])    # [7, 8, 9]
print(nums[:])     # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] (복사)
\`\`\`

## 음수 인덱스

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]

print(nums[-3:])    # [3, 4, 5]
print(nums[:-2])    # [0, 1, 2, 3]
print(nums[-4:-1])  # [2, 3, 4]
\`\`\`

## 간격 (step)

\`\`\`python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(nums[::2])    # [0, 2, 4, 6, 8]
print(nums[1::2])   # [1, 3, 5, 7, 9]
print(nums[::-1])   # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
\`\`\`

## 슬라이스 할당

슬라이스 부분을 다른 리스트로 바꿀 수 있습니다.

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]

nums[2:4] = [20, 30, 40]  # 길이가 달라도 OK
print(nums)  # [0, 1, 20, 30, 40, 4, 5]

nums[1:4] = []  # 삭제
print(nums)  # [0, 40, 4, 5]
\`\`\``,
    runnable_examples: [
      {
        title: '기본 슬라이싱',
        code: `nums = [10, 20, 30, 40, 50, 60, 70]

print(f"전체: {nums}")
print(f"[1:4]: {nums[1:4]}")
print(f"[:3]: {nums[:3]}")
print(f"[4:]: {nums[4:]}")
print(f"[::]: {nums[::]}")`,
        expected_output: `전체: [10, 20, 30, 40, 50, 60, 70]
[1:4]: [20, 30, 40]
[:3]: [10, 20, 30]
[4:]: [50, 60, 70]
[::]: [10, 20, 30, 40, 50, 60, 70]`,
      },
      {
        title: '음수 인덱스와 step',
        code: `nums = list(range(10))
print(f"원본: {nums}")

print(f"[-3:]: {nums[-3:]}")
print(f"[:-3]: {nums[:-3]}")
print(f"[::2]: {nums[::2]}")
print(f"[1::2]: {nums[1::2]}")
print(f"[::-1]: {nums[::-1]}")`,
        expected_output: `원본: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
[-3:]: [7, 8, 9]
[:-3]: [0, 1, 2, 3, 4, 5, 6]
[::2]: [0, 2, 4, 6, 8]
[1::2]: [1, 3, 5, 7, 9]
[::-1]: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]`,
      },
      {
        title: '슬라이스 할당',
        code: `nums = [1, 2, 3, 4, 5]
print(f"원본: {nums}")

# 부분 교체
nums[1:3] = [20, 30]
print(f"[1:3] = [20, 30]: {nums}")

# 길이가 달라도 가능
nums[1:3] = [200, 300, 400]
print(f"[1:3] = [200,300,400]: {nums}")

# 삽입
nums[2:2] = [250]
print(f"[2:2] = [250]: {nums}")

# 삭제
nums[1:4] = []
print(f"[1:4] = []: {nums}")`,
        expected_output: `원본: [1, 2, 3, 4, 5]
[1:3] = [20, 30]: [1, 20, 30, 4, 5]
[1:3] = [200,300,400]: [1, 200, 300, 400, 4, 5]
[2:2] = [250]: [1, 200, 250, 300, 400, 4, 5]
[1:4] = []: [1, 400, 4, 5]`,
      },
    ],
    keywords: ['슬라이싱', 'slice', '추출', '부분', '간격'],
  },

  'py-basics-dict-methods': {
    name: '딕셔너리 메서드',
    description: 'keys(), values(), items()',
    content: `# 딕셔너리 메서드

## keys(), values(), items()

딕셔너리의 키, 값, 키-값 쌍을 가져옵니다.

\`\`\`python
person = {"name": "Kim", "age": 25, "city": "Seoul"}

print(person.keys())    # dict_keys(['name', 'age', 'city'])
print(person.values())  # dict_values(['Kim', 25, 'Seoul'])
print(person.items())   # dict_items([('name', 'Kim'), ...])
\`\`\`

## 반복문에서 사용

\`\`\`python
# 키만 순회 (기본)
for key in person:
    print(key)

# 값만 순회
for value in person.values():
    print(value)

# 키-값 함께
for key, value in person.items():
    print(f"{key}: {value}")
\`\`\`

## 기타 유용한 메서드

### update() - 병합

\`\`\`python
person = {"name": "Kim"}
person.update({"age": 25, "city": "Seoul"})
print(person)  # {"name": "Kim", "age": 25, "city": "Seoul"}
\`\`\`

### pop() - 제거 후 반환

\`\`\`python
person = {"name": "Kim", "age": 25}
age = person.pop("age")
print(age)     # 25
print(person)  # {"name": "Kim"}
\`\`\`

### clear() - 전체 삭제

\`\`\`python
person = {"name": "Kim", "age": 25}
person.clear()
print(person)  # {}
\`\`\`

### copy() - 복사

\`\`\`python
original = {"a": 1, "b": 2}
copied = original.copy()
\`\`\``,
    runnable_examples: [
      {
        title: 'keys(), values(), items()',
        code: `user = {
    "name": "홍길동",
    "email": "hong@mail.com",
    "age": 30
}

print("키:", list(user.keys()))
print("값:", list(user.values()))
print("항목:", list(user.items()))`,
        expected_output: `키: ['name', 'email', 'age']
값: ['홍길동', 'hong@mail.com', 30]
항목: [('name', '홍길동'), ('email', 'hong@mail.com'), ('age', 30)]`,
      },
      {
        title: '반복문 활용',
        code: `scores = {"국어": 85, "영어": 90, "수학": 78}

# 키만
print("=== 과목 ===")
for subject in scores:
    print(f"  {subject}")

# 키-값 함께
print("\\n=== 성적표 ===")
for subject, score in scores.items():
    print(f"  {subject}: {score}점")

# 총점, 평균
total = sum(scores.values())
avg = total / len(scores)
print(f"\\n총점: {total}, 평균: {avg:.1f}")`,
        expected_output: `=== 과목 ===
  국어
  영어
  수학

=== 성적표 ===
  국어: 85점
  영어: 90점
  수학: 78점

총점: 253, 평균: 84.3`,
      },
      {
        title: 'update(), pop(), clear()',
        code: `config = {"host": "localhost", "port": 8080}
print(f"초기: {config}")

# update: 병합
config.update({"port": 3000, "debug": True})
print(f"update 후: {config}")

# pop: 제거 후 반환
debug = config.pop("debug")
print(f"pop('debug'): {debug}")
print(f"pop 후: {config}")

# copy: 복사
backup = config.copy()
config.clear()
print(f"clear 후: {config}")
print(f"백업: {backup}")`,
        expected_output: `초기: {'host': 'localhost', 'port': 8080}
update 후: {'host': 'localhost', 'port': 3000, 'debug': True}
pop('debug'): True
pop 후: {'host': 'localhost', 'port': 3000}
clear 후: {}
백업: {'host': 'localhost', 'port': 3000}`,
      },
    ],
    keywords: ['keys', 'values', 'items', 'update', 'pop', '딕셔너리'],
  },

  'py-basics-dict-comprehension': {
    name: '딕셔너리 컴프리헨션',
    description: '{k: v for k, v in items}',
    content: `# 딕셔너리 컴프리헨션

## 한 줄로 딕셔너리 만들기

리스트 컴프리헨션과 비슷하지만 중괄호를 사용합니다.

\`\`\`python
{키: 값 for 변수 in 반복가능한것}
\`\`\`

## 기본 예제

\`\`\`python
# 숫자: 제곱
squares = {x: x**2 for x in range(1, 6)}
print(squares)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
\`\`\`

## 조건 추가

\`\`\`python
# 짝수만
evens = {x: x**2 for x in range(10) if x % 2 == 0}
print(evens)  # {0: 0, 2: 4, 4: 16, 6: 36, 8: 64}
\`\`\`

## 두 리스트로 딕셔너리

\`\`\`python
keys = ["name", "age", "city"]
values = ["Kim", 25, "Seoul"]

person = {k: v for k, v in zip(keys, values)}
print(person)  # {"name": "Kim", "age": 25, "city": "Seoul"}
\`\`\`

## 기존 딕셔너리 변환

\`\`\`python
prices = {"apple": 1000, "banana": 1500, "orange": 2000}

# 10% 할인
discounted = {k: int(v * 0.9) for k, v in prices.items()}
print(discounted)

# 키를 대문자로
upper_keys = {k.upper(): v for k, v in prices.items()}
print(upper_keys)
\`\`\``,
    runnable_examples: [
      {
        title: '기본 딕셔너리 컴프리헨션',
        code: `# 숫자: 제곱
squares = {n: n**2 for n in range(1, 6)}
print(f"제곱: {squares}")

# 알파벳: 순서
import string
alphabet = {char: i for i, char in enumerate(string.ascii_lowercase[:5], 1)}
print(f"알파벳 순서: {alphabet}")`,
        expected_output: `제곱: {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
알파벳 순서: {'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5}`,
      },
      {
        title: '조건 필터링',
        code: `numbers = range(1, 11)

# 짝수만
evens = {n: n**2 for n in numbers if n % 2 == 0}
print(f"짝수의 제곱: {evens}")

# 5보다 큰 수
big = {n: n*10 for n in numbers if n > 5}
print(f"5 초과: {big}")`,
        expected_output: `짝수의 제곱: {2: 4, 4: 16, 6: 36, 8: 64, 10: 100}
5 초과: {6: 60, 7: 70, 8: 80, 9: 90, 10: 100}`,
      },
      {
        title: '기존 딕셔너리 변환',
        code: `prices = {"apple": 1000, "banana": 1500, "orange": 2000}

# 20% 할인
discounted = {k: int(v * 0.8) for k, v in prices.items()}
print(f"할인가: {discounted}")

# 키를 대문자로
upper = {k.upper(): v for k, v in prices.items()}
print(f"대문자 키: {upper}")

# 값에 "원" 붙이기
formatted = {k: f"{v:,}원" for k, v in prices.items()}
print(f"형식화: {formatted}")`,
        expected_output: `할인가: {'apple': 800, 'banana': 1200, 'orange': 1600}
대문자 키: {'APPLE': 1000, 'BANANA': 1500, 'ORANGE': 2000}
형식화: {'apple': '1,000원', 'banana': '1,500원', 'orange': '2,000원'}`,
      },
      {
        title: '두 리스트로 딕셔너리',
        code: `students = ["Kim", "Lee", "Park"]
scores = [85, 92, 78]

# zip으로 결합
grade_book = {name: score for name, score in zip(students, scores)}
print(f"성적: {grade_book}")

# 인덱스 포함
numbered = {i: name for i, name in enumerate(students, 1)}
print(f"번호: {numbered}")`,
        expected_output: `성적: {'Kim': 85, 'Lee': 92, 'Park': 78}
번호: {1: 'Kim', 2: 'Lee', 3: 'Park'}`,
      },
    ],
    keywords: ['딕셔너리', '컴프리헨션', 'comprehension', 'dict'],
  },

  'py-basics-dict-get': {
    name: '안전한 접근',
    description: 'get(), setdefault()',
    content: `# 안전한 딕셔너리 접근

## get() - 키가 없어도 안전

대괄호 접근은 키가 없으면 오류가 발생합니다.
get()은 키가 없으면 None(또는 기본값)을 반환합니다.

\`\`\`python
person = {"name": "Kim"}

# 대괄호: 오류 발생
# print(person["age"])  # KeyError!

# get(): 안전
print(person.get("age"))       # None
print(person.get("age", 0))    # 0 (기본값)
print(person.get("name", "?")) # "Kim" (키가 있으면 값 반환)
\`\`\`

## setdefault() - 없으면 추가

키가 없으면 기본값으로 추가하고, 있으면 기존 값을 반환합니다.

\`\`\`python
person = {"name": "Kim"}

# age 키가 없으면 25로 추가
age = person.setdefault("age", 25)
print(age)     # 25
print(person)  # {"name": "Kim", "age": 25}

# name 키가 있으면 기존 값 반환
name = person.setdefault("name", "Lee")
print(name)    # "Kim" (기존 값 유지)
\`\`\`

## 패턴: 그룹화

\`\`\`python
data = [("Kim", 85), ("Lee", 90), ("Kim", 92), ("Park", 78)]
grouped = {}

for name, score in data:
    grouped.setdefault(name, []).append(score)

print(grouped)
# {"Kim": [85, 92], "Lee": [90], "Park": [78]}
\`\`\``,
    runnable_examples: [
      {
        title: 'get() 기본 사용',
        code: `config = {
    "host": "localhost",
    "port": 8080
}

# 존재하는 키
print(f"host: {config.get('host')}")

# 존재하지 않는 키
print(f"timeout: {config.get('timeout')}")
print(f"timeout (기본값): {config.get('timeout', 30)}")

# 원본은 변경되지 않음
print(f"\\nconfig: {config}")`,
        expected_output: `host: localhost
timeout: None
timeout (기본값): 30

config: {'host': 'localhost', 'port': 8080}`,
      },
      {
        title: 'setdefault() 사용',
        code: `settings = {"theme": "dark"}

# 없는 키는 추가됨
font = settings.setdefault("font_size", 14)
print(f"font_size: {font}")

# 있는 키는 기존 값 유지
theme = settings.setdefault("theme", "light")
print(f"theme: {theme}")

print(f"\\nsettings: {settings}")`,
        expected_output: `font_size: 14
theme: dark

settings: {'theme': 'dark', 'font_size': 14}`,
      },
      {
        title: '그룹화 패턴',
        code: `# 이름별 점수 그룹화
scores = [
    ("철수", 85), ("영희", 90), ("철수", 92),
    ("민수", 78), ("영희", 88), ("민수", 95)
]

grouped = {}
for name, score in scores:
    grouped.setdefault(name, []).append(score)

print("=== 이름별 점수 ===")
for name, score_list in grouped.items():
    avg = sum(score_list) / len(score_list)
    print(f"{name}: {score_list} (평균: {avg:.1f})")`,
        expected_output: `=== 이름별 점수 ===
철수: [85, 92] (평균: 88.5)
영희: [90, 88] (평균: 89.0)
민수: [78, 95] (평균: 86.5)`,
      },
    ],
    keywords: ['get', 'setdefault', '안전', '기본값', '접근'],
  },

  'py-basics-tuple': {
    name: '튜플',
    description: '변경 불가능한 리스트, (1, 2, 3)',
    content: `# 튜플

## 변경 불가능한 시퀀스

튜플은 리스트와 비슷하지만 **한 번 만들면 수정할 수 없습니다**.

\`\`\`python
# 리스트: 수정 가능
my_list = [1, 2, 3]
my_list[0] = 10  # OK

# 튜플: 수정 불가
my_tuple = (1, 2, 3)
# my_tuple[0] = 10  # TypeError!
\`\`\`

## 튜플 만들기

\`\`\`python
# 괄호로 생성
t1 = (1, 2, 3)

# 괄호 생략 가능
t2 = 1, 2, 3

# 요소가 하나인 튜플 (쉼표 필수!)
t3 = (1,)   # 튜플
t4 = (1)    # 정수 1

# 빈 튜플
t5 = ()
t6 = tuple()
\`\`\`

## 튜플 사용 이유

1. **불변성**: 실수로 수정되지 않음
2. **딕셔너리 키**: 리스트는 키가 될 수 없지만 튜플은 가능
3. **언패킹**: 여러 값을 한 번에 할당
4. **성능**: 리스트보다 약간 빠름

## 언패킹

\`\`\`python
point = (10, 20)
x, y = point  # 언패킹
print(x, y)   # 10 20

# 스왑
a, b = 1, 2
a, b = b, a  # 교환!
print(a, b)  # 2 1
\`\`\`

## 함수에서 여러 값 반환

\`\`\`python
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

low, high, total = get_stats([1, 2, 3, 4, 5])
print(low, high, total)  # 1 5 15
\`\`\``,
    runnable_examples: [
      {
        title: '튜플 기본',
        code: `# 튜플 생성
coords = (10, 20)
colors = "red", "green", "blue"

print(f"좌표: {coords}, 타입: {type(coords)}")
print(f"색상: {colors}")

# 인덱스 접근 (읽기만 가능)
print(f"x좌표: {coords[0]}")
print(f"첫번째 색: {colors[0]}")

# 길이
print(f"색상 수: {len(colors)}")`,
        expected_output: `좌표: (10, 20), 타입: <class 'tuple'>
색상: ('red', 'green', 'blue')
x좌표: 10
첫번째 색: red
색상 수: 3`,
      },
      {
        title: '언패킹',
        code: `# 기본 언패킹
point = (100, 200)
x, y = point
print(f"x={x}, y={y}")

# 스왑
a, b = 10, 20
print(f"교환 전: a={a}, b={b}")
a, b = b, a
print(f"교환 후: a={a}, b={b}")

# 부분 언패킹 (*)
first, *rest = (1, 2, 3, 4, 5)
print(f"first={first}, rest={rest}")`,
        expected_output: `x=100, y=200
교환 전: a=10, b=20
교환 후: a=20, b=10
first=1, rest=[2, 3, 4, 5]`,
      },
      {
        title: '함수 반환값',
        code: `def divide(a, b):
    """몫과 나머지 반환"""
    return a // b, a % b

def get_minmax(numbers):
    """최소값과 최대값 반환"""
    return min(numbers), max(numbers)

# 사용
quotient, remainder = divide(17, 5)
print(f"17 / 5 = 몫 {quotient}, 나머지 {remainder}")

nums = [3, 1, 4, 1, 5, 9, 2, 6]
low, high = get_minmax(nums)
print(f"최소: {low}, 최대: {high}")`,
        expected_output: `17 / 5 = 몫 3, 나머지 2
최소: 1, 최대: 9`,
      },
    ],
    keywords: ['튜플', 'tuple', '불변', '언패킹', '패킹'],
  },

  'py-basics-set': {
    name: '세트',
    description: '중복 없는 집합, {1, 2, 3}',
    content: `# 세트 (Set)

## 중복 없는 집합

세트는 **중복을 허용하지 않는** 자료형입니다.
순서가 없고, 중복된 값은 자동으로 제거됩니다.

\`\`\`python
# 중복 제거
numbers = {1, 2, 2, 3, 3, 3}
print(numbers)  # {1, 2, 3}
\`\`\`

## 세트 만들기

\`\`\`python
# 중괄호로 생성
s1 = {1, 2, 3}

# set()으로 생성
s2 = set([1, 2, 3])

# 빈 세트 ({}는 딕셔너리!)
s3 = set()  # 올바름
# s4 = {}   # 이건 빈 딕셔너리
\`\`\`

## 요소 추가/제거

\`\`\`python
s = {1, 2, 3}

s.add(4)       # 추가
s.remove(2)    # 제거 (없으면 에러)
s.discard(10)  # 제거 (없어도 에러 없음)
s.clear()      # 전체 삭제
\`\`\`

## 중복 제거에 활용

\`\`\`python
names = ["Kim", "Lee", "Kim", "Park", "Lee"]
unique = list(set(names))
print(unique)  # ['Kim', 'Lee', 'Park'] (순서 무작위)
\`\`\`

## 멤버십 테스트 (빠름!)

\`\`\`python
# 리스트: O(n)
large_list = list(range(100000))
50000 in large_list  # 느림

# 세트: O(1)
large_set = set(range(100000))
50000 in large_set   # 빠름
\`\`\``,
    runnable_examples: [
      {
        title: '세트 기본',
        code: `# 중복 자동 제거
numbers = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3}
print(f"세트: {numbers}")
print(f"길이: {len(numbers)}")

# 리스트에서 세트로
items = ["apple", "banana", "apple", "cherry", "banana"]
unique_items = set(items)
print(f"\\n원본: {items}")
print(f"중복제거: {unique_items}")`,
        expected_output: `세트: {1, 2, 3, 4, 5, 6, 9}
길이: 7

원본: ['apple', 'banana', 'apple', 'cherry', 'banana']
중복제거: {'banana', 'apple', 'cherry'}`,
      },
      {
        title: '요소 추가/제거',
        code: `fruits = {"apple", "banana"}
print(f"초기: {fruits}")

# 추가
fruits.add("orange")
print(f"add 후: {fruits}")

# 제거
fruits.remove("banana")
print(f"remove 후: {fruits}")

# discard: 없어도 에러 없음
fruits.discard("grape")  # 에러 없음
print(f"discard 후: {fruits}")`,
        expected_output: `초기: {'apple', 'banana'}
add 후: {'apple', 'banana', 'orange'}
remove 후: {'apple', 'orange'}
discard 후: {'apple', 'orange'}`,
      },
      {
        title: '멤버십 테스트',
        code: `# 빠른 검색에 유용
valid_codes = {"A001", "A002", "B001", "B002", "C001"}

# 검증
test_codes = ["A001", "X999", "B002", "Z000"]
for code in test_codes:
    if code in valid_codes:
        print(f"{code}: 유효")
    else:
        print(f"{code}: 무효")`,
        expected_output: `A001: 유효
X999: 무효
B002: 유효
Z000: 무효`,
      },
    ],
    keywords: ['세트', 'set', '집합', '중복', '유일'],
  },

  'py-basics-set-operations': {
    name: '집합 연산',
    description: '합집합, 교집합, 차집합',
    content: `# 집합 연산

## 수학의 집합 연산

세트는 수학의 집합 연산을 지원합니다.

## 합집합 (Union)

둘 중 하나라도 있는 요소

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

print(a | b)        # {1, 2, 3, 4, 5}
print(a.union(b))   # {1, 2, 3, 4, 5}
\`\`\`

## 교집합 (Intersection)

둘 다 있는 요소

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

print(a & b)              # {3}
print(a.intersection(b))  # {3}
\`\`\`

## 차집합 (Difference)

첫 번째에만 있는 요소

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

print(a - b)            # {1, 2}
print(a.difference(b))  # {1, 2}
\`\`\`

## 대칭 차집합 (Symmetric Difference)

둘 중 하나에만 있는 요소

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

print(a ^ b)                     # {1, 2, 4, 5}
print(a.symmetric_difference(b)) # {1, 2, 4, 5}
\`\`\`

## 부분집합/상위집합 검사

\`\`\`python
a = {1, 2, 3}
b = {1, 2}

print(b.issubset(a))    # True (b는 a의 부분집합)
print(a.issuperset(b))  # True (a는 b의 상위집합)
\`\`\``,
    runnable_examples: [
      {
        title: '기본 집합 연산',
        code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(f"A = {a}")
print(f"B = {b}")
print()
print(f"합집합 (A | B): {a | b}")
print(f"교집합 (A & B): {a & b}")
print(f"차집합 (A - B): {a - b}")
print(f"차집합 (B - A): {b - a}")
print(f"대칭차 (A ^ B): {a ^ b}")`,
        expected_output: `A = {1, 2, 3, 4}
B = {3, 4, 5, 6}

합집합 (A | B): {1, 2, 3, 4, 5, 6}
교집합 (A & B): {3, 4}
차집합 (A - B): {1, 2}
차집합 (B - A): {5, 6}
대칭차 (A ^ B): {1, 2, 5, 6}`,
      },
      {
        title: '실용 예제: 공통 관심사',
        code: `# 사용자별 관심사
alice_interests = {"python", "music", "movies", "travel"}
bob_interests = {"java", "movies", "sports", "travel"}

print(f"Alice: {alice_interests}")
print(f"Bob: {bob_interests}")
print()

# 공통 관심사
common = alice_interests & bob_interests
print(f"공통 관심사: {common}")

# Alice만의 관심사
only_alice = alice_interests - bob_interests
print(f"Alice만: {only_alice}")

# 모든 관심사
all_interests = alice_interests | bob_interests
print(f"전체: {all_interests}")`,
        expected_output: `Alice: {'python', 'movies', 'travel', 'music'}
Bob: {'travel', 'sports', 'java', 'movies'}

공통 관심사: {'travel', 'movies'}
Alice만: {'python', 'music'}
전체: {'python', 'travel', 'sports', 'movies', 'java', 'music'}`,
      },
      {
        title: '부분집합 검사',
        code: `basic_features = {"read", "write"}
premium_features = {"read", "write", "export", "import"}
admin_features = {"read", "write", "export", "import", "delete", "admin"}

print(f"Basic: {basic_features}")
print(f"Premium: {premium_features}")
print(f"Admin: {admin_features}")
print()

# 부분집합 검사
print(f"Basic이 Premium의 부분집합? {basic_features.issubset(premium_features)}")
print(f"Admin이 Premium의 상위집합? {admin_features.issuperset(premium_features)}")
print(f"Basic이 Admin의 부분집합? {basic_features.issubset(admin_features)}")`,
        expected_output: `Basic: {'read', 'write'}
Premium: {'export', 'read', 'import', 'write'}
Admin: {'export', 'delete', 'read', 'admin', 'import', 'write'}

Basic이 Premium의 부분집합? True
Admin이 Premium의 상위집합? True
Basic이 Admin의 부분집합? True`,
      },
    ],
    keywords: ['집합연산', '합집합', '교집합', '차집합', 'union', 'intersection'],
  },
};
