/**
 * Python 입문 (beginner_zero) 개념 콘텐츠
 * 대상: 프로그래밍을 처음 접하는 완전 초보자
 * 특징: 비유와 일상 예시 활용, 상세한 설명, 풍부한 예제
 */

export const PY_BEGINNER_ZERO_CONCEPTS = {
  'py-intro-what-is-programming': {
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
- 데이터 분석, 인공지능까지 가능합니다
- 문제 해결 능력이 좋아집니다

## Python 소개

Python은 세계에서 가장 인기 있는 프로그래밍 언어입니다.

- 문법이 영어처럼 읽기 쉽습니다
- 배우기 쉬워서 첫 언어로 최고입니다
- 웹, 데이터 분석, 인공지능 등 다양하게 사용됩니다

## 코드는 순서대로 실행됩니다

컴퓨터는 위에서 아래로, 한 줄씩 차례대로 읽고 실행합니다.
마치 요리 레시피를 순서대로 따라하는 것과 같습니다.

\`\`\`python
# 이 코드는 위에서 아래로 순서대로 실행됩니다
print("1번: 안녕하세요")
print("2번: 반갑습니다")
print("3번: 프로그래밍 세계에 오신 것을 환영합니다")
\`\`\`

## 주석이란?

\`#\` 뒤에 쓴 글자는 컴퓨터가 무시합니다.
사람이 읽기 위한 메모입니다.

\`\`\`python
# 이것은 주석입니다. 컴퓨터는 이 줄을 무시합니다.
print("이 줄만 실행됩니다")
\`\`\`

## 정리

- 프로그래밍: 컴퓨터에게 일을 시키는 것
- Python: 배우기 쉬운 인기 있는 언어
- 코드는 위에서 아래로 순서대로 실행됨
- \`#\` 주석: 사람을 위한 메모`,
    runnable_examples: [
      {
        title: '순서대로 실행되는 코드',
        code: `# 첫 번째 줄부터 실행됩니다
print("1. 시작합니다")
print("2. 중간입니다")
print("3. 끝입니다")`,
        expected_output: `1. 시작합니다
2. 중간입니다
3. 끝입니다`,
      },
      {
        title: '주석 사용하기',
        code: `# 아래 줄은 인사말을 출력합니다
print("안녕하세요!")

# 이 줄은 실행되지 않습니다
# print("이건 주석이라 안 나와요")

print("반갑습니다!")`,
        expected_output: `안녕하세요!
반갑습니다!`,
      },
    ],
    keywords: ['프로그래밍', '코드', 'Python', '파이썬', '순서', '실행', '주석'],
  },

  'py-intro-print': {
    name: '출력하기',
    description: 'print()로 첫 코드 실행하기',
    content: `# 출력하기 - print()

## 화면에 글자 보여주기

\`print()\`는 괄호 안의 내용을 화면에 보여주는 명령입니다.
프로그래밍에서 가장 먼저 배우는, 가장 많이 쓰는 명령입니다.

## 기본 사용법

\`\`\`python
print("안녕하세요")
\`\`\`

이 코드를 실행하면 화면에 "안녕하세요"가 나타납니다.

## 문자열은 따옴표로 감싸기

글자를 출력할 때는 반드시 따옴표로 감싸야 합니다.

\`\`\`python
print("큰따옴표 사용")    # 정상 작동
print('작은따옴표 사용')  # 정상 작동
\`\`\`

둘 다 같은 결과를 보여줍니다.

## 숫자는 따옴표 없이

숫자는 따옴표 없이 그대로 씁니다.

\`\`\`python
print(123)    # 숫자 123
print(3.14)   # 소수점도 가능
print(-50)    # 음수도 가능
\`\`\`

## 따옴표 유무의 차이

\`\`\`python
print(100)    # 숫자 100 (계산 가능)
print("100")  # 문자 "100" (글자 취급)

print(1 + 1)    # 2 (계산됨)
print("1 + 1")  # 1 + 1 (그대로 출력)
\`\`\`

## 여러 줄 출력하기

print를 여러 번 쓰면 여러 줄이 출력됩니다.

\`\`\`python
print("첫 번째 줄")
print("두 번째 줄")
print("세 번째 줄")
\`\`\`

## 여러 값 한 번에 출력하기

쉼표로 구분하여 여러 값을 한 줄에 출력할 수 있습니다.

\`\`\`python
print("이름:", "철수")
print("나이:", 25, "살")
\`\`\`

## 정리

- \`print()\`: 화면에 출력하는 명령
- 문자는 따옴표로 감싸기 (\`" "\` 또는 \`' '\`)
- 숫자는 따옴표 없이
- 쉼표로 여러 값 출력 가능`,
    runnable_examples: [
      {
        title: '기본 출력',
        code: `print("Hello, Python!")
print("프로그래밍 첫걸음!")`,
        expected_output: `Hello, Python!
프로그래밍 첫걸음!`,
      },
      {
        title: '숫자와 문자 출력',
        code: `# 숫자 출력
print(42)
print(3.14159)

# 문자열 출력
print("이것은 문자입니다")`,
        expected_output: `42
3.14159
이것은 문자입니다`,
      },
      {
        title: '계산 결과 출력',
        code: `print(10 + 5)
print(100 - 30)
print(7 * 8)
print(20 / 4)`,
        expected_output: `15
70
56
5.0`,
      },
      {
        title: '여러 값 함께 출력',
        code: `print("1 + 2 =", 1 + 2)
print("이름:", "홍길동", "나이:", 20)`,
        expected_output: `1 + 2 = 3
이름: 홍길동 나이: 20`,
      },
    ],
    keywords: ['print', '출력', '문자열', '숫자', '따옴표'],
  },

  'py-intro-input': {
    name: '입력받기',
    description: 'input()으로 사용자 입력 받기',
    content: `# 입력받기 - input()

## 사용자에게 물어보기

\`input()\`은 사용자가 키보드로 입력한 내용을 받아오는 명령입니다.
프로그램과 사용자가 대화할 수 있게 해줍니다.

## 기본 사용법

\`\`\`python
name = input("이름이 뭐예요? ")
print("안녕하세요,", name)
\`\`\`

실행하면:
1. "이름이 뭐예요? "가 화면에 나타남
2. 사용자가 이름을 입력하고 엔터
3. 입력한 이름으로 인사

## input()은 항상 문자열

주의! input()으로 받은 값은 항상 문자열입니다.
숫자를 입력해도 문자열로 저장됩니다.

\`\`\`python
age = input("나이를 입력하세요: ")
print(age)       # "25" (문자열)
print(type(age)) # <class 'str'>
\`\`\`

## 숫자로 변환하기

계산을 하려면 int()나 float()로 변환해야 합니다.

\`\`\`python
age = input("나이를 입력하세요: ")
age = int(age)  # 정수로 변환
print("내년엔", age + 1, "살이네요!")
\`\`\`

한 줄로 쓸 수도 있습니다:

\`\`\`python
age = int(input("나이를 입력하세요: "))
\`\`\`

## 빈 안내문

괄호를 비워두면 아무 안내 없이 입력을 기다립니다.

\`\`\`python
x = input()  # 조용히 입력 대기
\`\`\`

## 정리

- \`input("안내문")\`: 사용자 입력 받기
- input()은 항상 문자열 반환
- 숫자 계산엔 int() 또는 float()로 변환`,
    runnable_examples: [
      {
        title: '이름 입력받기',
        code: `# 실행하면 입력창이 나타납니다
name = input("이름을 입력하세요: ")
print("안녕하세요,", name, "님!")`,
        expected_output: `이름을 입력하세요: 홍길동
안녕하세요, 홍길동 님!`,
      },
      {
        title: '숫자 입력받아 계산하기',
        code: `# 두 숫자를 입력받아 더하기
a = int(input("첫 번째 숫자: "))
b = int(input("두 번째 숫자: "))
print("합계:", a + b)`,
        expected_output: `첫 번째 숫자: 10
두 번째 숫자: 20
합계: 30`,
      },
      {
        title: '나이 계산기',
        code: `birth_year = int(input("태어난 연도: "))
current_year = 2024
age = current_year - birth_year
print("당신의 나이:", age, "살")`,
        expected_output: `태어난 연도: 2000
당신의 나이: 24 살`,
      },
    ],
    keywords: ['input', '입력', '사용자', '키보드', 'int', 'float', '변환'],
  },

  'py-intro-var-what': {
    name: '변수란?',
    description: '상자에 물건 담기 비유, 변수의 개념',
    content: `# 변수란?

## 상자에 물건 담기

변수는 **데이터를 저장하는 상자**입니다.
상자에 이름표를 붙여서, 나중에 그 이름으로 찾을 수 있습니다.

예를 들어:
- "이름"이라고 적힌 상자에 "김철수"를 넣기
- "나이"라고 적힌 상자에 25를 넣기

## 변수 만들기

\`\`\`python
이름 = "김철수"
\`\`\`

- \`이름\`: 변수의 이름 (상자에 붙이는 이름표)
- \`=\`: "저장한다"는 의미 (수학의 '같다'와 다름!)
- \`"김철수"\`: 저장할 값

## 변수 사용하기

저장한 값은 변수 이름으로 꺼내 쓸 수 있습니다.

\`\`\`python
message = "안녕하세요"
print(message)  # "안녕하세요" 출력
\`\`\`

## 변수 값 바꾸기

저장된 값을 다른 값으로 바꿀 수 있습니다.

\`\`\`python
count = 1
print(count)  # 1

count = 2
print(count)  # 2

count = count + 1  # 현재 값에 1 더하기
print(count)  # 3
\`\`\`

## 변수를 쓰는 이유

1. **값을 기억**: 나중에 다시 사용 가능
2. **의미 부여**: \`3.14\`보다 \`원주율\`이 이해하기 쉬움
3. **한 번에 수정**: 여러 곳에서 쓰이는 값을 한 번에 변경

\`\`\`python
# 변수 없이
print(3.14 * 5 * 5)
print(3.14 * 10 * 10)

# 변수 사용
pi = 3.14
print(pi * 5 * 5)
print(pi * 10 * 10)
# pi 값을 바꾸면 모든 계산이 바뀜
\`\`\`

## 정리

- 변수는 데이터를 저장하는 상자
- \`변수이름 = 값\`으로 변수 생성
- 변수 이름으로 값을 사용하거나 변경 가능`,
    runnable_examples: [
      {
        title: '변수에 값 저장하고 출력하기',
        code: `name = "김철수"
print(name)

age = 20
print(age)

# 변수 여러 개 함께 출력
print(name, "님은", age, "살입니다")`,
        expected_output: `김철수
20
김철수 님은 20 살입니다`,
      },
      {
        title: '변수 값 변경하기',
        code: `score = 80
print("처음 점수:", score)

score = 95
print("바뀐 점수:", score)

# 현재 값을 이용해서 변경
score = score + 5
print("보너스 후:", score)`,
        expected_output: `처음 점수: 80
바뀐 점수: 95
보너스 후: 100`,
      },
      {
        title: '변수로 계산하기',
        code: `# 가격 계산
price = 15000
quantity = 3
total = price * quantity

print("단가:", price, "원")
print("수량:", quantity, "개")
print("총액:", total, "원")`,
        expected_output: `단가: 15000 원
수량: 3 개
총액: 45000 원`,
      },
    ],
    keywords: ['변수', '저장', '값', '할당', '대입'],
  },

  'py-intro-var-naming': {
    name: '변수 이름 짓기',
    description: '변수명 규칙, 좋은 이름 짓기',
    content: `# 변수 이름 짓기

## 변수 이름 규칙

Python에서 변수 이름을 지을 때 지켜야 할 규칙이 있습니다.

### 허용되는 것
- 영문자 (a-z, A-Z)
- 숫자 (0-9) - 단, 첫 글자는 안됨
- 밑줄 (_)
- 한글도 가능 (권장하지 않음)

### 허용되지 않는 것
- 숫자로 시작 (1name - 불가)
- 공백 포함 (my name - 불가)
- 특수문자 (my-name, my@name - 불가)
- 예약어 사용 (if, for, print 등 - 불가)

## 올바른 예시 vs 잘못된 예시

\`\`\`python
# 올바른 변수 이름
name = "철수"
user_name = "영희"
userName = "민수"
age2 = 25
_private = "비밀"

# 잘못된 변수 이름 (오류 발생)
# 2nd_name = "둘째"  # 숫자로 시작
# user-name = "영희"  # 하이픈 사용
# my name = "이름"    # 공백 포함
# for = 10            # 예약어
\`\`\`

## Python 스타일 권장사항

Python에서는 **스네이크 케이스**를 권장합니다.

\`\`\`python
# 스네이크 케이스 (Python 권장)
user_name = "홍길동"
total_price = 15000
is_valid = True

# 카멜 케이스 (다른 언어에서 많이 사용)
userName = "홍길동"
totalPrice = 15000
isValid = True
\`\`\`

## 좋은 변수 이름 짓기

변수 이름만 봐도 무슨 값인지 알 수 있어야 합니다.

\`\`\`python
# 나쁜 예
a = 100
b = 3
c = a * b

# 좋은 예
price = 100
quantity = 3
total = price * quantity
\`\`\`

## 정리

- 영문자, 숫자, 밑줄 사용 가능
- 숫자로 시작하면 안 됨
- 공백, 특수문자 사용 불가
- 예약어는 변수 이름으로 사용 불가
- 의미 있는 이름 사용 권장
- Python은 스네이크 케이스 권장 (단어_단어)`,
    runnable_examples: [
      {
        title: '다양한 변수 이름',
        code: `# 좋은 변수 이름들
user_name = "홍길동"
user_age = 25
is_student = True
total_score = 95.5

print("이름:", user_name)
print("나이:", user_age)
print("학생여부:", is_student)
print("총점:", total_score)`,
        expected_output: `이름: 홍길동
나이: 25
학생여부: True
총점: 95.5`,
      },
      {
        title: '의미 있는 이름 vs 무의미한 이름',
        code: `# 나쁜 예 - 무슨 값인지 알기 어려움
a = 10000
b = 3
c = a * b

# 좋은 예 - 한눈에 이해됨
monthly_salary = 10000
months = 3
total_salary = monthly_salary * months

print("총 급여:", total_salary)`,
        expected_output: `총 급여: 30000`,
      },
    ],
    keywords: ['변수명', '이름', '규칙', '스네이크케이스', '예약어'],
  },

  'py-intro-number': {
    name: '숫자',
    description: '정수(int)와 실수(float), 사칙연산',
    content: `# 숫자 자료형

## 두 종류의 숫자

Python에서 숫자는 크게 두 종류입니다:

1. **정수 (int)**: 소수점 없는 숫자
   - 예: 1, 42, -100, 0

2. **실수 (float)**: 소수점 있는 숫자
   - 예: 3.14, -0.5, 2.0

\`\`\`python
age = 25        # 정수 (int)
height = 175.5  # 실수 (float)

print(type(age))     # <class 'int'>
print(type(height))  # <class 'float'>
\`\`\`

## 기본 사칙연산

\`\`\`python
a = 10
b = 3

print(a + b)   # 덧셈: 13
print(a - b)   # 뺄셈: 7
print(a * b)   # 곱셈: 30
print(a / b)   # 나눗셈: 3.333...
\`\`\`

## 특별한 연산자

\`\`\`python
a = 10
b = 3

print(a // b)  # 몫: 3 (소수점 버림)
print(a % b)   # 나머지: 1
print(a ** b)  # 거듭제곱: 1000 (10의 3승)
\`\`\`

## 나눗셈 주의사항

일반 나눗셈 \`/\`는 항상 실수(float)를 반환합니다.

\`\`\`python
print(10 / 2)   # 5.0 (정확히 나눠져도 실수)
print(10 // 2)  # 5 (몫만 원하면 //)
\`\`\`

## 연산 순서

수학과 같은 순서로 계산됩니다: 괄호 > 거듭제곱 > 곱셈/나눗셈 > 덧셈/뺄셈

\`\`\`python
print(2 + 3 * 4)      # 14 (곱셈 먼저)
print((2 + 3) * 4)    # 20 (괄호 먼저)
print(2 ** 3 * 2)     # 16 (거듭제곱 먼저)
\`\`\`

## 정리

- 정수(int): 소수점 없는 숫자
- 실수(float): 소수점 있는 숫자
- 기본 연산: +, -, *, /
- 특수 연산: //(몫), %(나머지), **(거듭제곱)
- 나눗셈(/)은 항상 float 반환`,
    runnable_examples: [
      {
        title: '정수와 실수',
        code: `# 정수
count = 100
temperature = -5

# 실수
pi = 3.14159
rate = 0.05

print("정수:", count, temperature)
print("실수:", pi, rate)
print("타입:", type(count), type(pi))`,
        expected_output: `정수: 100 -5
실수: 3.14159 0.05
타입: <class 'int'> <class 'float'>`,
      },
      {
        title: '사칙연산',
        code: `a = 17
b = 5

print("a + b =", a + b)
print("a - b =", a - b)
print("a * b =", a * b)
print("a / b =", a / b)`,
        expected_output: `a + b = 22
a - b = 12
a * b = 85
a / b = 3.4`,
      },
      {
        title: '몫, 나머지, 거듭제곱',
        code: `a = 17
b = 5

print("17을 5로 나눈 몫:", a // b)
print("17을 5로 나눈 나머지:", a % b)
print("5의 3승:", b ** 3)

# 검증: 몫 * 나눈수 + 나머지 = 원래수
print("검증:", (a // b) * b + (a % b))`,
        expected_output: `17을 5로 나눈 몫: 3
17을 5로 나눈 나머지: 2
5의 3승: 125
검증: 17`,
      },
      {
        title: '실용 예제: 거스름돈 계산',
        code: `# 물건 가격과 지불 금액
price = 3700
paid = 10000
change = paid - price

print("거스름돈:", change, "원")
print("1000원:", change // 1000, "장")
change = change % 1000
print("500원:", change // 500, "개")
change = change % 500
print("100원:", change // 100, "개")`,
        expected_output: `거스름돈: 6300 원
1000원: 6 장
500원: 0 개
100원: 3 개`,
      },
    ],
    keywords: ['숫자', '정수', 'int', '실수', 'float', '사칙연산', '덧셈', '뺄셈', '곱셈', '나눗셈'],
  },

  'py-intro-string': {
    name: '문자열',
    description: '"안녕" + "하세요", 문자열 연결',
    content: `# 문자열

## 글자를 담는 자료형

문자열(string)은 글자들의 나열입니다.
따옴표로 감싸서 만듭니다.

\`\`\`python
name = "홍길동"
message = '안녕하세요'
\`\`\`

큰따옴표("")와 작은따옴표('') 둘 다 사용 가능합니다.

## 문자열 연결 (+)

문자열을 + 로 이어붙일 수 있습니다.

\`\`\`python
first = "안녕"
second = "하세요"
greeting = first + second
print(greeting)  # 안녕하세요
\`\`\`

## 문자열 반복 (*)

문자열을 * 숫자로 반복할 수 있습니다.

\`\`\`python
print("안녕" * 3)  # 안녕안녕안녕
print("-" * 20)    # --------------------
\`\`\`

## 문자열과 숫자

문자열과 숫자는 직접 연결할 수 없습니다.

\`\`\`python
# 오류 발생!
# print("나이: " + 25)

# 해결 방법 1: str()로 변환
print("나이: " + str(25))

# 해결 방법 2: 쉼표 사용
print("나이:", 25)

# 해결 방법 3: f-string (권장)
age = 25
print(f"나이: {age}")
\`\`\`

## f-string (포맷 문자열)

f-string은 문자열 안에 변수를 넣는 가장 편한 방법입니다.

\`\`\`python
name = "철수"
age = 20
print(f"{name}님은 {age}살입니다")
# 출력: 철수님은 20살입니다
\`\`\`

\`f""\` 안에서 \`{변수}\`를 쓰면 변수 값이 들어갑니다.

## 여러 줄 문자열

따옴표 세 개로 여러 줄을 쓸 수 있습니다.

\`\`\`python
poem = """장미는 빨강
제비꽃은 파랑
파이썬은 최고"""
print(poem)
\`\`\`

## 정리

- 문자열: 따옴표로 감싼 글자들
- 연결: + 로 이어붙이기
- 반복: * 숫자로 반복
- f-string: f"텍스트 {변수}" 형식
- 여러 줄: 따옴표 세 개 (\`"""\` 또는 \`'''\`)`,
    runnable_examples: [
      {
        title: '문자열 기본',
        code: `name = "Python"
message = '프로그래밍'

print(name)
print(message)
print(name, message)`,
        expected_output: `Python
프로그래밍
Python 프로그래밍`,
      },
      {
        title: '문자열 연결과 반복',
        code: `# 연결
first = "Hello"
second = "World"
greeting = first + " " + second
print(greeting)

# 반복
line = "-" * 20
print(line)
print("=" * 5 + " 제목 " + "=" * 5)`,
        expected_output: `Hello World
--------------------
===== 제목 =====`,
      },
      {
        title: 'f-string 사용하기',
        code: `name = "김영희"
age = 25
city = "서울"

# f-string으로 깔끔하게 출력
print(f"이름: {name}")
print(f"나이: {age}살")
print(f"사는 곳: {city}")

# 계산도 가능
print(f"내년 나이: {age + 1}살")`,
        expected_output: `이름: 김영희
나이: 25살
사는 곳: 서울
내년 나이: 26살`,
      },
      {
        title: '여러 줄 문자열',
        code: `info = """=== 프로필 ===
이름: 홍길동
직업: 개발자
취미: 코딩
==============="""

print(info)`,
        expected_output: `=== 프로필 ===
이름: 홍길동
직업: 개발자
취미: 코딩
===============`,
      },
    ],
    keywords: ['문자열', 'string', '따옴표', '연결', 'f-string', '포맷'],
  },

  'py-intro-boolean': {
    name: '불리언',
    description: 'True/False, 참과 거짓',
    content: `# 불리언

## 참과 거짓

불리언(Boolean)은 **참(True)** 또는 **거짓(False)** 두 가지 값만 가지는 자료형입니다.

컴퓨터에게 "예/아니오"를 표현하는 방법입니다.

\`\`\`python
is_student = True   # 학생이다
is_adult = False    # 성인이 아니다

print(is_student)  # True
print(is_adult)    # False
\`\`\`

## 비교 연산의 결과

비교 연산을 하면 True 또는 False가 나옵니다.

\`\`\`python
print(5 > 3)    # True (5는 3보다 크다)
print(5 < 3)    # False (5는 3보다 작지 않다)
print(5 == 5)   # True (5와 5는 같다)
print(5 != 3)   # True (5와 3은 다르다)
\`\`\`

## 비교 연산자 모음

- \`==\`: 같다 (등호 두 개!)
- \`!=\`: 다르다
- \`>\`: 크다
- \`<\`: 작다
- \`>=\`: 크거나 같다
- \`<=\`: 작거나 같다

\`\`\`python
age = 20

print(age == 20)  # True
print(age >= 18)  # True
print(age < 15)   # False
\`\`\`

## 주의: = vs ==

- \`=\` 하나: 값을 저장 (대입)
- \`==\` 두 개: 값을 비교

\`\`\`python
a = 5      # a에 5를 저장
print(a == 5)  # a가 5인지 비교 -> True
\`\`\`

## 조건문에서 사용

불리언은 조건문(if)에서 가장 많이 사용됩니다.

\`\`\`python
age = 20
if age >= 18:
    print("성인입니다")
else:
    print("미성년자입니다")
\`\`\`

## 정리

- 불리언: True(참) 또는 False(거짓)
- 비교 연산 결과는 불리언
- ==는 비교, =는 대입
- 조건문에서 참/거짓 판단에 사용`,
    runnable_examples: [
      {
        title: '불리언 기본',
        code: `is_raining = True
is_sunny = False

print("비가 오나요?", is_raining)
print("맑나요?", is_sunny)
print("불리언 타입:", type(is_raining))`,
        expected_output: `비가 오나요? True
맑나요? False
불리언 타입: <class 'bool'>`,
      },
      {
        title: '비교 연산자',
        code: `a = 10
b = 5

print(f"{a} > {b}:", a > b)
print(f"{a} < {b}:", a < b)
print(f"{a} == {b}:", a == b)
print(f"{a} != {b}:", a != b)
print(f"{a} >= 10:", a >= 10)
print(f"{b} <= 5:", b <= 5)`,
        expected_output: `10 > 5: True
10 < 5: False
10 == 5: False
10 != 5: True
10 >= 10: True
5 <= 5: True`,
      },
      {
        title: '문자열 비교',
        code: `name1 = "Python"
name2 = "python"
name3 = "Python"

print("Python == Python:", name1 == name3)
print("Python == python:", name1 == name2)
print("대소문자가 다르면 다른 문자열!")`,
        expected_output: `Python == Python: True
Python == python: False
대소문자가 다르면 다른 문자열!`,
      },
      {
        title: '실용 예제: 자격 검사',
        code: `age = 25
has_license = True

# 여러 조건 검사
is_adult = age >= 18
can_drive = is_adult and has_license

print(f"나이: {age}")
print(f"성인 여부: {is_adult}")
print(f"면허 보유: {has_license}")
print(f"운전 가능: {can_drive}")`,
        expected_output: `나이: 25
성인 여부: True
면허 보유: True
운전 가능: True`,
      },
    ],
    keywords: ['불리언', 'boolean', 'True', 'False', '비교', '연산자'],
  },

  'py-intro-if': {
    name: 'if문 기본',
    description: '만약 ~라면',
    content: `# if문 - 조건 분기

## 만약 ~라면

if문은 **조건에 따라 다른 행동**을 하게 해줍니다.

일상에서:
- "만약 비가 오면 우산을 챙긴다"
- "만약 배가 고프면 밥을 먹는다"

## 기본 구조

\`\`\`python
if 조건:
    실행할 코드
\`\`\`

조건이 True면 들여쓰기된 코드가 실행됩니다.

## 첫 번째 예제

\`\`\`python
age = 20

if age >= 18:
    print("성인입니다")
\`\`\`

age가 18 이상이면 "성인입니다"가 출력됩니다.

## 들여쓰기가 중요!

Python에서 들여쓰기는 매우 중요합니다.
if 안에서 실행할 코드는 반드시 들여쓰기(보통 스페이스 4개)해야 합니다.

\`\`\`python
score = 90

if score >= 80:
    print("합격입니다")     # if에 포함
    print("축하합니다!")    # if에 포함

print("시험 종료")          # if와 관계없이 항상 실행
\`\`\`

## 조건이 False면?

조건이 거짓이면 if 블록은 건너뜁니다.

\`\`\`python
score = 50

if score >= 80:
    print("이 줄은 실행 안 됨")

print("프로그램 끝")  # 이것만 실행됨
\`\`\`

## 정리

- if문: 조건이 참일 때만 코드 실행
- 구조: \`if 조건:\` 다음 줄은 들여쓰기
- 들여쓰기된 부분만 조건에 영향받음
- 조건이 False면 if 블록 건너뜀`,
    runnable_examples: [
      {
        title: '기본 if문',
        code: `temperature = 35

if temperature >= 30:
    print("오늘은 더운 날입니다")
    print("물을 많이 마시세요")

print("날씨 확인 완료")`,
        expected_output: `오늘은 더운 날입니다
물을 많이 마시세요
날씨 확인 완료`,
      },
      {
        title: '조건이 거짓인 경우',
        code: `temperature = 20

if temperature >= 30:
    print("이 줄은 실행되지 않습니다")

print("날씨 확인 완료")`,
        expected_output: `날씨 확인 완료`,
      },
      {
        title: '여러 조건 각각 검사',
        code: `score = 85

if score >= 90:
    print("A등급")

if score >= 80:
    print("B등급 이상")

if score >= 70:
    print("C등급 이상")

print("검사 완료")`,
        expected_output: `B등급 이상
C등급 이상
검사 완료`,
      },
    ],
    keywords: ['if', '조건문', '분기', '들여쓰기', '조건'],
  },

  'py-intro-if-else': {
    name: 'if-else',
    description: '그렇지 않으면',
    content: `# if-else - 둘 중 하나

## 그렇지 않으면

else는 if 조건이 거짓일 때 실행됩니다.

일상에서:
- "만약 비가 오면 우산을 챙기고, **그렇지 않으면** 선글라스를 챙긴다"

## 기본 구조

\`\`\`python
if 조건:
    조건이 참일 때 실행
else:
    조건이 거짓일 때 실행
\`\`\`

## 예제: 성인/미성년자

\`\`\`python
age = 15

if age >= 18:
    print("성인입니다")
else:
    print("미성년자입니다")
\`\`\`

age가 18 미만이므로 "미성년자입니다"가 출력됩니다.

## if만 있을 때 vs if-else

\`\`\`python
# if만 있는 경우 - 조건 거짓이면 아무것도 안 함
score = 50
if score >= 60:
    print("합격")
# 출력 없음

# if-else - 둘 중 하나는 반드시 실행
score = 50
if score >= 60:
    print("합격")
else:
    print("불합격")
# "불합격" 출력
\`\`\`

## 실용 예제

\`\`\`python
money = 5000
price = 3000

if money >= price:
    print("구매 가능합니다")
    change = money - price
    print(f"거스름돈: {change}원")
else:
    print("잔액이 부족합니다")
    need = price - money
    print(f"필요 금액: {need}원")
\`\`\`

## 정리

- else: if 조건이 거짓일 때 실행
- if-else: 둘 중 하나는 반드시 실행됨
- else는 혼자 쓸 수 없음 (항상 if와 함께)`,
    runnable_examples: [
      {
        title: '성인/미성년자 판별',
        code: `age = 16

if age >= 18:
    print("성인입니다")
    print("술을 살 수 있습니다")
else:
    print("미성년자입니다")
    print("술을 살 수 없습니다")`,
        expected_output: `미성년자입니다
술을 살 수 없습니다`,
      },
      {
        title: '합격/불합격',
        code: `score = 75
passing_score = 60

if score >= passing_score:
    print("합격!")
    print(f"합격 점수보다 {score - passing_score}점 높습니다")
else:
    print("불합격...")
    print(f"합격까지 {passing_score - score}점 부족합니다")`,
        expected_output: `합격!
합격 점수보다 15점 높습니다`,
      },
      {
        title: '짝수/홀수 판별',
        code: `number = 17

if number % 2 == 0:
    print(f"{number}은(는) 짝수입니다")
else:
    print(f"{number}은(는) 홀수입니다")`,
        expected_output: `17은(는) 홀수입니다`,
      },
      {
        title: '로그인 검사',
        code: `correct_password = "python123"
input_password = "python123"

if input_password == correct_password:
    print("로그인 성공!")
    print("환영합니다!")
else:
    print("로그인 실패")
    print("비밀번호를 확인해주세요")`,
        expected_output: `로그인 성공!
환영합니다!`,
      },
    ],
    keywords: ['if', 'else', '조건문', '분기', '참', '거짓'],
  },

  'py-intro-elif': {
    name: 'elif',
    description: '여러 조건 검사하기',
    content: `# elif - 여러 조건 검사

## 세 가지 이상의 경우

elif는 "else if"의 줄임말로, 여러 조건을 순서대로 검사합니다.

일상에서:
- "점수가 90점 이상이면 A, 80점 이상이면 B, 70점 이상이면 C, 그 외는 F"

## 기본 구조

\`\`\`python
if 조건1:
    조건1이 참일 때
elif 조건2:
    조건2가 참일 때
elif 조건3:
    조건3이 참일 때
else:
    모두 거짓일 때
\`\`\`

## 성적 등급 예제

\`\`\`python
score = 85

if score >= 90:
    print("A등급")
elif score >= 80:
    print("B등급")
elif score >= 70:
    print("C등급")
elif score >= 60:
    print("D등급")
else:
    print("F등급")
\`\`\`

85점이므로 "B등급"이 출력됩니다.

## 순서가 중요!

조건은 위에서 아래로 검사되고, 처음 참인 조건만 실행됩니다.

\`\`\`python
score = 95

# 잘못된 순서 - 항상 첫 조건에서 걸림
if score >= 60:
    print("D등급")  # 이것만 실행됨!
elif score >= 70:
    print("C등급")
elif score >= 80:
    print("B등급")
elif score >= 90:
    print("A등급")
\`\`\`

높은 점수부터 검사해야 합니다!

## if를 여러 번 쓰는 것과의 차이

\`\`\`python
score = 85

# 여러 if: 조건이 맞으면 전부 실행
if score >= 70:
    print("70점 이상")  # 실행됨
if score >= 80:
    print("80점 이상")  # 실행됨

# if-elif: 하나만 실행
if score >= 70:
    print("70점 이상")  # 실행됨
elif score >= 80:
    print("80점 이상")  # 위에서 걸려서 검사 안 함
\`\`\`

## 정리

- elif: 여러 조건을 순서대로 검사
- 처음 참인 조건의 코드만 실행
- 조건 순서가 중요함 (보통 좁은 범위부터)
- else는 선택사항 (모든 조건이 거짓일 때)`,
    runnable_examples: [
      {
        title: '성적 등급 판정',
        code: `score = 78

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"점수: {score}점")
print(f"등급: {grade}등급")`,
        expected_output: `점수: 78점
등급: C등급`,
      },
      {
        title: '계절 판정',
        code: `month = 7

if month in [12, 1, 2]:
    season = "겨울"
elif month in [3, 4, 5]:
    season = "봄"
elif month in [6, 7, 8]:
    season = "여름"
elif month in [9, 10, 11]:
    season = "가을"
else:
    season = "알 수 없음"

print(f"{month}월은 {season}입니다")`,
        expected_output: `7월은 여름입니다`,
      },
      {
        title: 'BMI 판정',
        code: `height = 1.75  # 미터
weight = 70    # kg
bmi = weight / (height ** 2)

print(f"BMI: {bmi:.1f}")

if bmi < 18.5:
    print("저체중")
elif bmi < 23:
    print("정상")
elif bmi < 25:
    print("과체중")
else:
    print("비만")`,
        expected_output: `BMI: 22.9
정상`,
      },
      {
        title: '가격 할인율',
        code: `total_price = 55000

if total_price >= 100000:
    discount = 0.20
    message = "20% 할인"
elif total_price >= 50000:
    discount = 0.10
    message = "10% 할인"
elif total_price >= 30000:
    discount = 0.05
    message = "5% 할인"
else:
    discount = 0
    message = "할인 없음"

final_price = total_price * (1 - discount)
print(f"주문 금액: {total_price}원")
print(f"적용: {message}")
print(f"최종 금액: {int(final_price)}원")`,
        expected_output: `주문 금액: 55000원
적용: 10% 할인
최종 금액: 49500원`,
      },
    ],
    keywords: ['elif', '조건문', '다중조건', '분기', '순서'],
  },

  'py-intro-for': {
    name: 'for문 기본',
    description: 'for i in range(5): 5번 반복',
    content: `# for문 - 반복하기

## 같은 일을 여러 번

for문은 **같은 코드를 여러 번 반복**할 때 사용합니다.

"안녕"을 5번 출력하고 싶을 때:

\`\`\`python
# 직접 5번 쓰기 (비효율적)
print("안녕")
print("안녕")
print("안녕")
print("안녕")
print("안녕")

# for문 사용 (효율적)
for i in range(5):
    print("안녕")
\`\`\`

## 기본 구조

\`\`\`python
for 변수 in range(횟수):
    반복할 코드
\`\`\`

## range() 함수

range(n)은 0부터 n-1까지의 숫자를 만듭니다.

\`\`\`python
for i in range(5):
    print(i)
# 출력: 0, 1, 2, 3, 4
\`\`\`

range의 다양한 사용법:

\`\`\`python
range(5)        # 0, 1, 2, 3, 4
range(1, 6)     # 1, 2, 3, 4, 5 (시작, 끝)
range(0, 10, 2) # 0, 2, 4, 6, 8 (시작, 끝, 간격)
\`\`\`

## 반복 변수 활용

\`\`\`python
for i in range(1, 6):
    print(f"{i}번째 반복")
\`\`\`

## 리스트 순회

리스트의 각 요소를 하나씩 꺼내올 수 있습니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
for fruit in fruits:
    print(fruit)
\`\`\`

## 정리

- for문: 정해진 횟수만큼 반복
- range(n): 0부터 n-1까지
- range(시작, 끝): 시작부터 끝-1까지
- 리스트도 순회 가능`,
    runnable_examples: [
      {
        title: '기본 반복',
        code: `# 5번 반복
for i in range(5):
    print(f"{i}번째: 안녕하세요!")`,
        expected_output: `0번째: 안녕하세요!
1번째: 안녕하세요!
2번째: 안녕하세요!
3번째: 안녕하세요!
4번째: 안녕하세요!`,
      },
      {
        title: '1부터 시작하기',
        code: `# 1부터 5까지
for i in range(1, 6):
    print(f"{i}번")`,
        expected_output: `1번
2번
3번
4번
5번`,
      },
      {
        title: '구구단',
        code: `dan = 3
print(f"=== {dan}단 ===")
for i in range(1, 10):
    result = dan * i
    print(f"{dan} x {i} = {result}")`,
        expected_output: `=== 3단 ===
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27`,
      },
      {
        title: '리스트 순회',
        code: `fruits = ["사과", "바나나", "오렌지", "포도"]

print("과일 목록:")
for fruit in fruits:
    print(f"- {fruit}")`,
        expected_output: `과일 목록:
- 사과
- 바나나
- 오렌지
- 포도`,
      },
      {
        title: '합계 구하기',
        code: `# 1부터 10까지의 합
total = 0
for i in range(1, 11):
    total = total + i
    print(f"1~{i}까지 합: {total}")`,
        expected_output: `1~1까지 합: 1
1~2까지 합: 3
1~3까지 합: 6
1~4까지 합: 10
1~5까지 합: 15
1~6까지 합: 21
1~7까지 합: 28
1~8까지 합: 36
1~9까지 합: 45
1~10까지 합: 55`,
      },
    ],
    keywords: ['for', '반복문', 'range', '루프', '순회'],
  },

  'py-intro-while': {
    name: 'while문',
    description: '~하는 동안 계속',
    content: `# while문 - 조건 반복

## ~하는 동안 계속

while문은 **조건이 참인 동안 계속 반복**합니다.

for문: "5번 반복해"
while문: "조건이 맞는 동안 계속해"

## 기본 구조

\`\`\`python
while 조건:
    반복할 코드
\`\`\`

## 기본 예제

\`\`\`python
count = 0
while count < 5:
    print(count)
    count = count + 1
# 출력: 0, 1, 2, 3, 4
\`\`\`

## 무한 반복 주의!

조건이 계속 참이면 무한히 반복됩니다.

\`\`\`python
# 위험! 무한 반복
while True:
    print("영원히 반복...")

# 반드시 탈출 조건이 필요
count = 0
while True:
    print(count)
    count += 1
    if count >= 5:
        break  # 반복 탈출
\`\`\`

## while vs for

- for: 횟수가 정해져 있을 때
- while: 언제 끝날지 모를 때, 조건으로 제어할 때

\`\`\`python
# for: 5번 반복 (횟수 고정)
for i in range(5):
    print(i)

# while: 조건이 맞을 때까지
n = 1
while n < 100:
    n = n * 2
print(n)  # 128 (100을 처음 넘는 2의 거듭제곱)
\`\`\`

## 정리

- while: 조건이 참인 동안 반복
- 조건이 거짓이 되면 반복 종료
- 무한 반복 주의 (탈출 조건 필수)
- break: 반복문 즉시 탈출`,
    runnable_examples: [
      {
        title: '기본 while문',
        code: `count = 1
while count <= 5:
    print(f"{count}번째 반복")
    count += 1

print("반복 종료!")`,
        expected_output: `1번째 반복
2번째 반복
3번째 반복
4번째 반복
5번째 반복
반복 종료!`,
      },
      {
        title: '카운트다운',
        code: `count = 5
while count > 0:
    print(count)
    count -= 1
print("발사!")`,
        expected_output: `5
4
3
2
1
발사!`,
      },
      {
        title: '조건 만족할 때까지 반복',
        code: `# 2의 거듭제곱 중 1000을 넘는 첫 번째 수
n = 1
count = 0
while n <= 1000:
    n = n * 2
    count += 1

print(f"2의 {count}승 = {n}")
print(f"1000을 처음 넘는 2의 거듭제곱: {n}")`,
        expected_output: `2의 10승 = 1024
1000을 처음 넘는 2의 거듭제곱: 1024`,
      },
      {
        title: '합계가 목표에 도달할 때까지',
        code: `total = 0
number = 0

while total < 100:
    number += 1
    total += number

print(f"1부터 {number}까지 더하면 {total}")
print(f"처음으로 100을 넘는 순간!")`,
        expected_output: `1부터 14까지 더하면 105
처음으로 100을 넘는 순간!`,
      },
    ],
    keywords: ['while', '반복문', '조건', '무한반복', 'break'],
  },

  'py-intro-func-what': {
    name: '함수란?',
    description: '레시피, 재사용 가능한 코드 묶음',
    content: `# 함수란?

## 코드의 레시피

함수는 **특정 작업을 수행하는 코드 묶음**입니다.

요리 레시피처럼:
- 한 번 만들어 놓으면 계속 사용 가능
- 재료(입력)를 넣으면 요리(결과)가 나옴

## 왜 함수를 쓸까?

**반복 코드 제거**

\`\`\`python
# 함수 없이 - 같은 코드 반복
print("=" * 20)
print("안녕하세요")
print("=" * 20)

print("=" * 20)
print("반갑습니다")
print("=" * 20)

# 함수 사용 - 깔끔!
def greeting(message):
    print("=" * 20)
    print(message)
    print("=" * 20)

greeting("안녕하세요")
greeting("반갑습니다")
\`\`\`

## 함수의 장점

1. **재사용**: 한 번 만들면 여러 번 사용
2. **가독성**: 코드가 읽기 쉬워짐
3. **유지보수**: 수정할 곳이 한 곳

## 이미 쓰고 있는 함수들

우리는 이미 함수를 사용하고 있습니다!

\`\`\`python
print("안녕")    # print 함수
len("Hello")    # len 함수 (길이)
int("123")      # int 함수 (정수 변환)
range(5)        # range 함수
\`\`\`

이런 것들은 Python이 미리 만들어 둔 **내장 함수**입니다.

## 우리도 함수를 만들 수 있다!

\`\`\`python
def say_hello():
    print("안녕하세요!")

say_hello()  # 함수 호출
say_hello()  # 여러 번 호출 가능
\`\`\`

## 정리

- 함수: 특정 작업을 수행하는 코드 묶음
- 장점: 재사용, 가독성, 유지보수
- 내장 함수: print(), len(), int() 등
- 직접 만든 함수도 사용 가능`,
    runnable_examples: [
      {
        title: '함수 없이 vs 함수 사용',
        code: `# 함수 없이 - 반복 코드
print("안녕하세요, 철수님!")
print("환영합니다!")
print()
print("안녕하세요, 영희님!")
print("환영합니다!")
print()

# 함수 사용 - 깔끔
def welcome(name):
    print(f"안녕하세요, {name}님!")
    print("환영합니다!")
    print()

welcome("민수")
welcome("지영")`,
        expected_output: `안녕하세요, 철수님!
환영합니다!

안녕하세요, 영희님!
환영합니다!

안녕하세요, 민수님!
환영합니다!

안녕하세요, 지영님!
환영합니다!
`,
      },
      {
        title: '내장 함수 사용',
        code: `# print - 출력 함수
print("Hello!")

# len - 길이 함수
text = "Python"
print(f"'{text}'의 길이: {len(text)}")

# int, float - 변환 함수
print(int("123"))
print(float("3.14"))

# max, min - 최대/최소 함수
numbers = [3, 1, 4, 1, 5]
print(f"최대값: {max(numbers)}")
print(f"최소값: {min(numbers)}")`,
        expected_output: `Hello!
'Python'의 길이: 6
123
3.14
최대값: 5
최소값: 1`,
      },
    ],
    keywords: ['함수', 'function', '재사용', '코드묶음', '호출'],
  },

  'py-intro-func-def': {
    name: '함수 정의',
    description: 'def 함수이름():',
    content: `# 함수 정의하기

## def 키워드

함수를 만들 때는 \`def\` 키워드를 사용합니다.

\`\`\`python
def 함수이름():
    실행할 코드
\`\`\`

## 첫 번째 함수 만들기

\`\`\`python
def say_hello():
    print("안녕하세요!")
    print("반갑습니다!")

# 함수 호출 (실행)
say_hello()
\`\`\`

## 함수 정의 vs 함수 호출

\`\`\`python
# 함수 정의 - 레시피 작성 (실행 안됨)
def greet():
    print("안녕!")

# 여기까지는 아무것도 출력 안 됨

# 함수 호출 - 레시피 실행
greet()  # 이때 "안녕!" 출력
greet()  # 또 호출하면 또 출력
\`\`\`

## 함수 이름 규칙

변수 이름 규칙과 같습니다:
- 영문자, 숫자, 밑줄 사용
- 숫자로 시작 불가
- 동사로 시작하면 좋음 (say_hello, get_data, calculate_sum)

## 함수 안에 여러 코드

\`\`\`python
def show_menu():
    print("=" * 20)
    print("  메뉴")
    print("=" * 20)
    print("1. 아메리카노")
    print("2. 카페라떼")
    print("3. 녹차")
    print("=" * 20)

show_menu()
\`\`\`

## 정리

- def: 함수를 정의하는 키워드
- 함수이름(): 괄호 필수
- 함수 정의는 실행이 아님 (호출해야 실행)
- 동사로 시작하는 이름 권장`,
    runnable_examples: [
      {
        title: '기본 함수 정의',
        code: `# 함수 정의
def say_hello():
    print("안녕하세요!")

# 함수 호출
print("함수 호출 전")
say_hello()
print("함수 호출 후")`,
        expected_output: `함수 호출 전
안녕하세요!
함수 호출 후`,
      },
      {
        title: '여러 번 호출',
        code: `def draw_line():
    print("-" * 30)

draw_line()
print("Python 프로그래밍")
draw_line()
print("함수 배우기")
draw_line()`,
        expected_output: `------------------------------
Python 프로그래밍
------------------------------
함수 배우기
------------------------------`,
      },
      {
        title: '실용적인 함수',
        code: `def show_profile():
    print("=" * 25)
    print("   프로필 카드")
    print("=" * 25)
    print("이름: 홍길동")
    print("나이: 25세")
    print("직업: 프로그래머")
    print("=" * 25)

# 프로필 출력
show_profile()`,
        expected_output: `=========================
   프로필 카드
=========================
이름: 홍길동
나이: 25세
직업: 프로그래머
=========================`,
      },
    ],
    keywords: ['def', '함수정의', '함수호출', 'function'],
  },

  'py-intro-func-params': {
    name: '매개변수와 반환',
    description: '입력 -> 처리 -> return 출력',
    content: `# 매개변수와 반환

## 매개변수: 함수에 값 전달

매개변수는 함수에 전달하는 입력값입니다.

\`\`\`python
def greet(name):  # name이 매개변수
    print(f"안녕, {name}!")

greet("철수")  # "철수"가 인자(argument)
greet("영희")
\`\`\`

## 여러 매개변수

\`\`\`python
def add(a, b):
    print(f"{a} + {b} = {a + b}")

add(3, 5)   # 3 + 5 = 8
add(10, 20) # 10 + 20 = 30
\`\`\`

## return: 값 반환

함수가 결과를 돌려줄 때 return을 사용합니다.

\`\`\`python
def add(a, b):
    return a + b  # 결과를 반환

result = add(3, 5)  # result에 8 저장
print(result)       # 8
\`\`\`

## print vs return

\`\`\`python
# print: 화면에 출력만 (값을 가져올 수 없음)
def add_print(a, b):
    print(a + b)

x = add_print(3, 5)  # 8 출력
print(x)              # None (값이 없음!)

# return: 값을 돌려줌 (저장 가능)
def add_return(a, b):
    return a + b

y = add_return(3, 5)  # 화면에 출력 안 됨
print(y)               # 8
\`\`\`

## 입력 -> 처리 -> 출력

\`\`\`python
def calculate_area(width, height):
    area = width * height  # 처리
    return area            # 출력

# 사용
room_area = calculate_area(5, 4)
print(f"방 넓이: {room_area}m2")
\`\`\`

## 정리

- 매개변수: 함수가 받는 입력값
- 인자: 함수 호출 시 전달하는 실제 값
- return: 함수의 결과를 반환
- print는 출력, return은 값 전달`,
    runnable_examples: [
      {
        title: '매개변수 사용',
        code: `def greet(name):
    print(f"안녕하세요, {name}님!")

greet("철수")
greet("영희")
greet("민수")`,
        expected_output: `안녕하세요, 철수님!
안녕하세요, 영희님!
안녕하세요, 민수님!`,
      },
      {
        title: '여러 매개변수',
        code: `def introduce(name, age, city):
    print(f"이름: {name}")
    print(f"나이: {age}살")
    print(f"사는 곳: {city}")
    print("-" * 20)

introduce("홍길동", 25, "서울")
introduce("김영희", 30, "부산")`,
        expected_output: `이름: 홍길동
나이: 25살
사는 곳: 서울
--------------------
이름: 김영희
나이: 30살
사는 곳: 부산
--------------------`,
      },
      {
        title: 'return으로 값 반환',
        code: `def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

# 반환값 사용
sum_result = add(10, 20)
mul_result = multiply(5, 6)

print(f"10 + 20 = {sum_result}")
print(f"5 x 6 = {mul_result}")

# 바로 사용도 가능
print(f"3 + 7 = {add(3, 7)}")`,
        expected_output: `10 + 20 = 30
5 x 6 = 30
3 + 7 = 10`,
      },
      {
        title: '실용 예제: 할인 가격 계산',
        code: `def calculate_discount(price, discount_rate):
    discount = price * discount_rate
    final_price = price - discount
    return final_price

# 10% 할인
original = 50000
discounted = calculate_discount(original, 0.1)
print(f"원가: {original}원")
print(f"할인가: {int(discounted)}원")

# 20% 할인
print(f"20% 할인가: {int(calculate_discount(original, 0.2))}원")`,
        expected_output: `원가: 50000원
할인가: 45000원
20% 할인가: 40000원`,
      },
    ],
    keywords: ['매개변수', 'parameter', 'return', '반환', '인자', 'argument'],
  },

  'py-intro-list-what': {
    name: '리스트란?',
    description: '여러 개를 한 줄로 정리, [1, 2, 3]',
    content: `# 리스트란?

## 여러 데이터를 하나로

리스트는 **여러 값을 순서대로 저장**하는 자료형입니다.

학교의 출석부처럼:
- 1번: 김철수
- 2번: 박영희
- 3번: 이민수

\`\`\`python
students = ["김철수", "박영희", "이민수"]
\`\`\`

## 리스트 만들기

대괄호 \`[]\` 안에 값들을 쉼표로 구분합니다.

\`\`\`python
numbers = [1, 2, 3, 4, 5]
fruits = ["사과", "바나나", "오렌지"]
mixed = [1, "hello", True, 3.14]  # 다양한 타입 가능
empty = []  # 빈 리스트
\`\`\`

## 리스트의 특징

1. **순서가 있음**: 첫 번째, 두 번째... 순서 유지
2. **수정 가능**: 나중에 값 변경, 추가, 삭제 가능
3. **다양한 타입**: 숫자, 문자, 불리언 등 섞어서 저장 가능

## 리스트 길이

\`len()\` 함수로 리스트에 몇 개가 있는지 확인합니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
print(len(fruits))  # 3
\`\`\`

## 리스트가 필요한 이유

\`\`\`python
# 리스트 없이 - 변수가 너무 많음!
score1 = 85
score2 = 90
score3 = 78
score4 = 92
score5 = 88

# 리스트 사용 - 깔끔!
scores = [85, 90, 78, 92, 88]
\`\`\`

## 정리

- 리스트: 여러 값을 순서대로 저장
- 대괄호 \`[]\`로 생성
- 쉼표로 값 구분
- \`len()\`으로 길이 확인
- 다양한 타입 저장 가능`,
    runnable_examples: [
      {
        title: '리스트 만들기',
        code: `# 숫자 리스트
numbers = [10, 20, 30, 40, 50]
print("숫자:", numbers)

# 문자열 리스트
fruits = ["사과", "바나나", "오렌지"]
print("과일:", fruits)

# 섞인 리스트
mixed = [1, "hello", True, 3.14]
print("섞인:", mixed)`,
        expected_output: `숫자: [10, 20, 30, 40, 50]
과일: ['사과', '바나나', '오렌지']
섞인: [1, 'hello', True, 3.14]`,
      },
      {
        title: '리스트 길이',
        code: `students = ["철수", "영희", "민수", "지영", "현우"]
print(f"학생 목록: {students}")
print(f"총 학생 수: {len(students)}명")

empty = []
print(f"빈 리스트 길이: {len(empty)}")`,
        expected_output: `학생 목록: ['철수', '영희', '민수', '지영', '현우']
총 학생 수: 5명
빈 리스트 길이: 0`,
      },
      {
        title: '리스트 활용',
        code: `# 점수 리스트로 평균 구하기
scores = [85, 90, 78, 92, 88]
print(f"점수: {scores}")
print(f"총점: {sum(scores)}")
print(f"평균: {sum(scores) / len(scores)}")
print(f"최고점: {max(scores)}")
print(f"최저점: {min(scores)}")`,
        expected_output: `점수: [85, 90, 78, 92, 88]
총점: 433
평균: 86.6
최고점: 92
최저점: 78`,
      },
    ],
    keywords: ['리스트', 'list', '배열', '순서', '저장'],
  },

  'py-intro-list-index': {
    name: '인덱스 접근',
    description: '0번째, 1번째... list[0]',
    content: `# 인덱스 접근

## 번호로 값 꺼내기

리스트의 각 요소는 번호(인덱스)로 접근합니다.
**중요: 번호는 0부터 시작!**

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
#          [0]      [1]       [2]

print(fruits[0])  # 사과 (첫 번째)
print(fruits[1])  # 바나나 (두 번째)
print(fruits[2])  # 오렌지 (세 번째)
\`\`\`

## 왜 0부터 시작할까?

컴퓨터 과학의 전통입니다.
시작점에서 얼마나 떨어져 있는지(offset)를 의미합니다.

- \`[0]\`: 시작점에서 0만큼 떨어짐 (첫 번째)
- \`[1]\`: 시작점에서 1만큼 떨어짐 (두 번째)

## 음수 인덱스

뒤에서부터 셀 때는 음수를 사용합니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
#          [-3]     [-2]      [-1]

print(fruits[-1])  # 오렌지 (마지막)
print(fruits[-2])  # 바나나 (뒤에서 두 번째)
\`\`\`

## 값 변경하기

인덱스로 접근해서 값을 바꿀 수 있습니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
fruits[1] = "딸기"  # 바나나 -> 딸기
print(fruits)  # ["사과", "딸기", "오렌지"]
\`\`\`

## 범위를 벗어나면 오류

없는 인덱스에 접근하면 에러가 발생합니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
# print(fruits[3])  # IndexError!
# print(fruits[10]) # IndexError!
\`\`\`

## 정리

- 인덱스는 0부터 시작
- \`리스트[인덱스]\`로 접근
- 음수 인덱스: 뒤에서부터 (-1이 마지막)
- 인덱스로 값 변경 가능
- 범위 벗어나면 IndexError`,
    runnable_examples: [
      {
        title: '인덱스로 접근하기',
        code: `colors = ["빨강", "주황", "노랑", "초록", "파랑"]
#           [0]     [1]      [2]     [3]     [4]

print("첫 번째:", colors[0])
print("세 번째:", colors[2])
print("마지막:", colors[4])`,
        expected_output: `첫 번째: 빨강
세 번째: 노랑
마지막: 파랑`,
      },
      {
        title: '음수 인덱스',
        code: `animals = ["강아지", "고양이", "토끼", "햄스터"]
#            [-4]       [-3]      [-2]     [-1]

print("마지막:", animals[-1])
print("뒤에서 두 번째:", animals[-2])
print("첫 번째:", animals[-4])`,
        expected_output: `마지막: 햄스터
뒤에서 두 번째: 토끼
첫 번째: 강아지`,
      },
      {
        title: '값 변경하기',
        code: `scores = [80, 75, 90, 85]
print("변경 전:", scores)

# 두 번째 값을 95로 변경
scores[1] = 95
print("변경 후:", scores)

# 마지막 값을 100으로 변경
scores[-1] = 100
print("최종:", scores)`,
        expected_output: `변경 전: [80, 75, 90, 85]
변경 후: [80, 95, 90, 85]
최종: [80, 95, 90, 100]`,
      },
      {
        title: 'for문과 함께 사용',
        code: `students = ["철수", "영희", "민수"]

# 인덱스와 함께 출력
for i in range(len(students)):
    print(f"{i+1}번: {students[i]}")`,
        expected_output: `1번: 철수
2번: 영희
3번: 민수`,
      },
    ],
    keywords: ['인덱스', 'index', '접근', '번호', '음수'],
  },

  'py-intro-list-methods': {
    name: '기본 메서드',
    description: 'append, remove, len',
    content: `# 리스트 기본 메서드

## 메서드란?

메서드는 리스트에 딸린 함수입니다.
\`리스트.메서드()\` 형태로 사용합니다.

## 요소 추가: append()

리스트 끝에 새 요소를 추가합니다.

\`\`\`python
fruits = ["사과", "바나나"]
fruits.append("오렌지")
print(fruits)  # ["사과", "바나나", "오렌지"]
\`\`\`

## 요소 삭제: remove()

특정 값을 찾아서 삭제합니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
fruits.remove("바나나")
print(fruits)  # ["사과", "오렌지"]
\`\`\`

## 인덱스로 삭제: pop()

특정 위치의 요소를 삭제하고 반환합니다.

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
removed = fruits.pop(1)  # 1번 인덱스 삭제
print(removed)  # 바나나
print(fruits)   # ["사과", "오렌지"]

# 인덱스 생략하면 마지막 요소 삭제
last = fruits.pop()
print(last)     # 오렌지
\`\`\`

## 길이 확인: len()

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
print(len(fruits))  # 3
\`\`\`

## 존재 확인: in

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
print("사과" in fruits)    # True
print("포도" in fruits)    # False
\`\`\`

## 인덱스 찾기: index()

\`\`\`python
fruits = ["사과", "바나나", "오렌지"]
print(fruits.index("바나나"))  # 1
\`\`\`

## 정리

- \`append(값)\`: 끝에 추가
- \`remove(값)\`: 값으로 삭제
- \`pop(인덱스)\`: 인덱스로 삭제하고 반환
- \`len(리스트)\`: 길이
- \`값 in 리스트\`: 존재 확인
- \`index(값)\`: 인덱스 찾기`,
    runnable_examples: [
      {
        title: '요소 추가 - append',
        code: `shopping_list = ["우유", "빵"]
print("처음:", shopping_list)

shopping_list.append("계란")
print("계란 추가:", shopping_list)

shopping_list.append("버터")
print("버터 추가:", shopping_list)`,
        expected_output: `처음: ['우유', '빵']
계란 추가: ['우유', '빵', '계란']
버터 추가: ['우유', '빵', '계란', '버터']`,
      },
      {
        title: '요소 삭제 - remove, pop',
        code: `tasks = ["청소", "공부", "운동", "요리"]
print("할 일:", tasks)

# remove: 값으로 삭제
tasks.remove("공부")
print("공부 삭제:", tasks)

# pop: 인덱스로 삭제
done = tasks.pop(0)  # 첫 번째 삭제
print(f"'{done}' 완료:", tasks)

# pop(): 마지막 삭제
last = tasks.pop()
print(f"'{last}' 완료:", tasks)`,
        expected_output: `할 일: ['청소', '공부', '운동', '요리']
공부 삭제: ['청소', '운동', '요리']
'청소' 완료: ['운동', '요리']
'요리' 완료: ['운동']`,
      },
      {
        title: '존재 확인과 인덱스',
        code: `colors = ["빨강", "주황", "노랑", "초록"]

# in으로 존재 확인
print("'노랑' 있나요?", "노랑" in colors)
print("'보라' 있나요?", "보라" in colors)

# index로 위치 찾기
if "노랑" in colors:
    pos = colors.index("노랑")
    print(f"'노랑'의 위치: {pos}번째")`,
        expected_output: `'노랑' 있나요? True
'보라' 있나요? False
'노랑'의 위치: 2번째`,
      },
      {
        title: '종합 예제: 대기 명단',
        code: `waiting = []
print("대기 명단:", waiting)

# 손님 추가
waiting.append("김철수")
waiting.append("박영희")
waiting.append("이민수")
print("현재 대기:", waiting)
print(f"대기 인원: {len(waiting)}명")

# 첫 번째 손님 입장
customer = waiting.pop(0)
print(f"{customer}님 입장!")
print("남은 대기:", waiting)`,
        expected_output: `대기 명단: []
현재 대기: ['김철수', '박영희', '이민수']
대기 인원: 3명
김철수님 입장!
남은 대기: ['박영희', '이민수']`,
      },
    ],
    keywords: ['append', 'remove', 'pop', 'len', 'in', 'index', '메서드'],
  },

  'py-intro-dict-what': {
    name: '딕셔너리란?',
    description: '이름표 붙은 서랍장, {"name": "Kim"}',
    content: `# 딕셔너리란?

## 이름표 붙은 서랍장

딕셔너리는 **키(key)와 값(value)의 쌍**으로 데이터를 저장합니다.

리스트는 번호(0, 1, 2...)로 접근하지만,
딕셔너리는 이름표(키)로 접근합니다.

실생활 예시:
- 주민등록증: "이름" -> "홍길동", "생년월일" -> "1990-01-01"
- 전화번호부: "철수" -> "010-1234-5678"

## 딕셔너리 만들기

중괄호 \`{}\`로 만들고, 키:값 형태로 작성합니다.

\`\`\`python
person = {
    "name": "홍길동",
    "age": 25,
    "city": "서울"
}
\`\`\`

## 왜 딕셔너리를 쓸까?

\`\`\`python
# 리스트로 학생 정보 (순서를 기억해야 함)
student = ["홍길동", 25, "서울"]
print(student[0])  # 이름? 기억해야 함

# 딕셔너리로 학생 정보 (키로 바로 접근)
student = {"name": "홍길동", "age": 25, "city": "서울"}
print(student["name"])  # 명확!
\`\`\`

## 리스트 vs 딕셔너리

| 리스트 | 딕셔너리 |
|--------|----------|
| 순서로 접근 | 키로 접근 |
| [0], [1], [2] | ["name"], ["age"] |
| 순서가 중요할 때 | 의미있는 이름이 필요할 때 |

## 다양한 값 저장

\`\`\`python
product = {
    "name": "아이폰",
    "price": 1500000,
    "in_stock": True,
    "colors": ["실버", "골드", "블랙"]  # 리스트도 값이 될 수 있음
}
\`\`\`

## 정리

- 딕셔너리: 키-값 쌍으로 데이터 저장
- 중괄호 \`{}\`로 생성
- \`{키: 값, 키: 값}\` 형태
- 키로 값에 접근 (번호가 아닌 이름으로!)`,
    runnable_examples: [
      {
        title: '딕셔너리 만들기',
        code: `# 학생 정보
student = {
    "name": "김철수",
    "age": 20,
    "major": "컴퓨터공학",
    "is_graduated": False
}

print(student)
print(type(student))`,
        expected_output: `{'name': '김철수', 'age': 20, 'major': '컴퓨터공학', 'is_graduated': False}
<class 'dict'>`,
      },
      {
        title: '실용 예제: 상품 정보',
        code: `product = {
    "name": "노트북",
    "price": 1200000,
    "brand": "삼성",
    "in_stock": True
}

print("=== 상품 정보 ===")
print(f"상품명: {product['name']}")
print(f"브랜드: {product['brand']}")
print(f"가격: {product['price']:,}원")`,
        expected_output: `=== 상품 정보 ===
상품명: 노트북
브랜드: 삼성
가격: 1,200,000원`,
      },
      {
        title: '리스트 vs 딕셔너리',
        code: `# 리스트: 순서는 알지만 의미를 모름
person_list = ["홍길동", 30, "서울"]
print(f"첫 번째 값: {person_list[0]}")  # 이름인가?

# 딕셔너리: 키로 의미가 명확
person_dict = {"name": "홍길동", "age": 30, "city": "서울"}
print(f"이름: {person_dict['name']}")  # 명확!`,
        expected_output: `첫 번째 값: 홍길동
이름: 홍길동`,
      },
    ],
    keywords: ['딕셔너리', 'dict', 'dictionary', '키', 'key', '값', 'value'],
  },

  'py-intro-dict-access': {
    name: '값 접근',
    description: 'person["name"], person.get("name")',
    content: `# 딕셔너리 값 접근

## 대괄호로 접근

\`딕셔너리[키]\`로 값에 접근합니다.

\`\`\`python
person = {"name": "홍길동", "age": 25}
print(person["name"])  # 홍길동
print(person["age"])   # 25
\`\`\`

## 없는 키로 접근하면 오류

\`\`\`python
person = {"name": "홍길동"}
# print(person["phone"])  # KeyError!
\`\`\`

## 안전한 접근: get()

\`get()\` 메서드는 키가 없어도 오류 없이 None을 반환합니다.

\`\`\`python
person = {"name": "홍길동"}
print(person.get("name"))   # 홍길동
print(person.get("phone"))  # None (오류 없음)
print(person.get("phone", "없음"))  # 기본값: "없음"
\`\`\`

## 값 추가/수정

\`\`\`python
person = {"name": "홍길동"}

# 새 키 추가
person["age"] = 25
print(person)  # {"name": "홍길동", "age": 25}

# 기존 값 수정
person["age"] = 26
print(person)  # {"name": "홍길동", "age": 26}
\`\`\`

## 키 삭제: del

\`\`\`python
person = {"name": "홍길동", "age": 25}
del person["age"]
print(person)  # {"name": "홍길동"}
\`\`\`

## 키 존재 확인: in

\`\`\`python
person = {"name": "홍길동", "age": 25}
print("name" in person)   # True
print("phone" in person)  # False
\`\`\`

## 정리

- \`딕셔너리[키]\`: 값 접근 (없으면 오류)
- \`딕셔너리.get(키)\`: 안전한 접근 (없으면 None)
- \`딕셔너리[키] = 값\`: 추가 또는 수정
- \`del 딕셔너리[키]\`: 삭제
- \`키 in 딕셔너리\`: 존재 확인`,
    runnable_examples: [
      {
        title: '값 접근하기',
        code: `user = {
    "id": "user123",
    "name": "김철수",
    "email": "kim@example.com"
}

# 대괄호로 접근
print("ID:", user["id"])
print("이름:", user["name"])
print("이메일:", user["email"])`,
        expected_output: `ID: user123
이름: 김철수
이메일: kim@example.com`,
      },
      {
        title: 'get()으로 안전하게 접근',
        code: `user = {"name": "홍길동", "age": 25}

# get()은 키가 없어도 오류 없음
print("이름:", user.get("name"))
print("전화:", user.get("phone"))
print("전화(기본값):", user.get("phone", "미등록"))`,
        expected_output: `이름: 홍길동
전화: None
전화(기본값): 미등록`,
      },
      {
        title: '값 추가/수정/삭제',
        code: `profile = {"name": "이영희"}
print("초기:", profile)

# 추가
profile["age"] = 28
profile["city"] = "부산"
print("추가 후:", profile)

# 수정
profile["city"] = "서울"
print("수정 후:", profile)

# 삭제
del profile["age"]
print("삭제 후:", profile)`,
        expected_output: `초기: {'name': '이영희'}
추가 후: {'name': '이영희', 'age': 28, 'city': '부산'}
수정 후: {'name': '이영희', 'age': 28, 'city': '서울'}
삭제 후: {'name': '이영희', 'city': '서울'}`,
      },
      {
        title: '키 존재 확인',
        code: `config = {
    "debug": True,
    "port": 8080
}

# in으로 확인 후 접근
if "debug" in config:
    print(f"디버그 모드: {config['debug']}")

if "timeout" in config:
    print(f"타임아웃: {config['timeout']}")
else:
    print("타임아웃 설정 없음")`,
        expected_output: `디버그 모드: True
타임아웃 설정 없음`,
      },
    ],
    keywords: ['접근', 'get', 'in', '추가', '수정', '삭제', 'del'],
  },
};
