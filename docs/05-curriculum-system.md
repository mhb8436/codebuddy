# Code Buddy 커리큘럼 시스템 통합 설계

## 개요

기존 Code Buddy의 4개 에이전트(Debug Buddy, Code Mentor, Practice Crafter, Exam Master)에 단계별 학습 커리큘럼을 통합하여 자기 주도 학습을 가이드하는 시스템.

## 현재 구조 vs 통합 후 구조

### 현재

```
학습자 → 코드 에디터 → 에이전트들 (주제 없이 자유롭게)
```

### 통합 후

```
학습자 → 언어/트랙 선택 → 단계별 주제 학습 → 에이전트들 (주제 맥락 포함)
                              ↓
                        진도 추적 + 다음 주제 추천
```

## 커리큘럼 구조

### 계층

```
Language (언어: JavaScript, Python, TypeScript)
  └── Track (트랙: 기초, 심화)
        └── Stage (단계: 1단계, 2단계...)
              └── Topic (주제: 변수와 상수)
                    └── Concept (개념: let, const)
```

### 학습 흐름

```
주제 선택
    ↓
개념 설명 (간단한 텍스트)
    ↓
코드 에디터에서 실습
    ├── 에러 발생 → Debug Buddy (주제 맥락 포함)
    └── 성공 → Code Mentor (주제 맥락 포함)
    ↓
연습 문제 (Practice Crafter - 해당 주제)
    ↓
주제 완료 → 다음 주제 추천
    ↓
단계 완료 → 시험 (Exam Master - 해당 단계 범위)
```

---

## 파일 구조

```
apps/server/
├── config/
│   └── curriculum/
│       ├── javascript.yaml
│       ├── python.yaml
│       └── typescript.yaml
├── src/
│   ├── services/
│   │   └── curriculumService.ts
│   ├── routes/
│   │   ├── curriculum.ts          # 신규
│   │   └── agent/
│   │       ├── debugBuddy.ts      # 수정 (topic 파라미터 추가)
│   │       ├── codeMentor.ts      # 수정 (topic 파라미터 추가)
│   │       ├── practice.ts        # 수정 (topic 연동)
│   │       └── exam.ts            # 수정 (stage 범위 연동)
│   └── db/
│       └── migrations/
│           └── 005_curriculum.sql  # 신규

apps/client/src/
├── pages/
│   ├── curriculum/
│   │   ├── index.tsx              # 언어/트랙 선택
│   │   └── [language]/
│   │       └── [trackId]/
│   │           ├── index.tsx      # 진도 대시보드
│   │           └── [topicId].tsx  # 주제 학습 페이지
├── components/
│   ├── curriculum/
│   │   ├── LanguageSelector.tsx
│   │   ├── TrackSelector.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StageMap.tsx
│   │   └── TopicCard.tsx
│   └── learning/
│       └── TopicLearningPage.tsx  # 주제 학습 통합 페이지
```

---

## 1. 커리큘럼 YAML 파일

### JavaScript

```yaml
# apps/server/config/curriculum/javascript.yaml

language: javascript
display_name: JavaScript
version: "1.0"

tracks:
  basic:
    display_name: 기초 과정
    description: 프로그래밍을 처음 배우는 분을 위한 과정
    estimated_hours: 20
    
    stages:
      - id: stage_1
        name: 프로그래밍 시작
        description: 프로그래밍의 기본 개념을 배웁니다
        
        topics:
          - id: variables
            name: 변수와 상수
            description: 데이터를 저장하는 방법을 배웁니다
            estimated_minutes: 30
            concepts:
              - name: let으로 변수 선언
                example: |
                  let age = 25;
                  age = 26; // 변경 가능
              - name: const로 상수 선언
                example: |
                  const name = "철수";
                  // name = "영희"; // 에러! 변경 불가
              - name: 변수 이름 규칙
                example: |
                  // 좋은 예
                  let userName = "철수";
                  let totalCount = 10;
                  
                  // 나쁜 예
                  let x = "철수";
                  let a = 10;
            practice_keywords:
              - 변수
              - 상수
              - let
              - const
            prerequisites: []
            
          - id: data_types
            name: 데이터 타입
            description: JavaScript의 기본 데이터 타입을 배웁니다
            estimated_minutes: 45
            concepts:
              - name: 숫자 (Number)
                example: |
                  let count = 10;
                  let price = 99.99;
                  let result = count + price; // 109.99
              - name: 문자열 (String)
                example: |
                  let greeting = "안녕하세요";
                  let name = '철수';
                  let message = `${name}님, ${greeting}`;
              - name: 불리언 (Boolean)
                example: |
                  let isStudent = true;
                  let hasJob = false;
            practice_keywords:
              - 숫자
              - 문자열
              - 타입
              - Number
              - String
              - Boolean
            prerequisites:
              - variables

          - id: operators
            name: 연산자
            description: 산술, 비교, 논리 연산자를 배웁니다
            estimated_minutes: 40
            concepts:
              - name: 산술 연산자
                example: |
                  let a = 10 + 5;  // 15
                  let b = 10 - 5;  // 5
                  let c = 10 * 5;  // 50
                  let d = 10 / 5;  // 2
                  let e = 10 % 3;  // 1 (나머지)
              - name: 비교 연산자
                example: |
                  10 > 5   // true
                  10 < 5   // false
                  10 === 10 // true (값과 타입 모두 비교)
                  10 !== 5  // true
              - name: 논리 연산자
                example: |
                  true && false  // false (AND)
                  true || false  // true (OR)
                  !true          // false (NOT)
            practice_keywords:
              - 연산자
              - 산술
              - 비교
              - 논리
            prerequisites:
              - data_types

      - id: stage_2
        name: 흐름 제어
        description: 프로그램의 흐름을 제어하는 방법을 배웁니다
        
        topics:
          - id: conditionals
            name: 조건문
            description: 조건에 따라 다른 코드를 실행합니다
            estimated_minutes: 50
            concepts:
              - name: if문
                example: |
                  let age = 20;
                  if (age >= 18) {
                    console.log("성인입니다");
                  }
              - name: if-else문
                example: |
                  let score = 75;
                  if (score >= 60) {
                    console.log("합격");
                  } else {
                    console.log("불합격");
                  }
              - name: else if문
                example: |
                  let score = 85;
                  if (score >= 90) {
                    console.log("A");
                  } else if (score >= 80) {
                    console.log("B");
                  } else if (score >= 70) {
                    console.log("C");
                  } else {
                    console.log("F");
                  }
            practice_keywords:
              - 조건문
              - if
              - else
            prerequisites:
              - operators
              
          - id: loops
            name: 반복문
            description: 코드를 반복 실행합니다
            estimated_minutes: 60
            concepts:
              - name: for문
                example: |
                  for (let i = 0; i < 5; i++) {
                    console.log(i); // 0, 1, 2, 3, 4
                  }
              - name: while문
                example: |
                  let count = 0;
                  while (count < 5) {
                    console.log(count);
                    count++;
                  }
              - name: break와 continue
                example: |
                  for (let i = 0; i < 10; i++) {
                    if (i === 5) break;    // 반복 종료
                    if (i % 2 === 0) continue; // 다음 반복으로
                    console.log(i); // 1, 3
                  }
            practice_keywords:
              - 반복문
              - for
              - while
              - break
              - continue
            prerequisites:
              - conditionals

      - id: stage_3
        name: 코드 구조화
        description: 재사용 가능한 코드를 작성하는 방법을 배웁니다
        
        topics:
          - id: functions
            name: 함수
            description: 코드를 재사용 가능한 단위로 묶습니다
            estimated_minutes: 60
            concepts:
              - name: 함수 선언
                example: |
                  function greet(name) {
                    console.log("안녕, " + name);
                  }
                  greet("철수"); // 안녕, 철수
              - name: 반환값
                example: |
                  function add(a, b) {
                    return a + b;
                  }
                  let result = add(3, 5); // 8
              - name: 화살표 함수
                example: |
                  const multiply = (a, b) => a * b;
                  let result = multiply(3, 5); // 15
            practice_keywords:
              - 함수
              - function
              - return
              - 화살표
            prerequisites:
              - loops
              
          - id: arrays
            name: 배열
            description: 여러 데이터를 하나의 변수에 저장합니다
            estimated_minutes: 60
            concepts:
              - name: 배열 생성
                example: |
                  let fruits = ["사과", "바나나", "오렌지"];
                  let numbers = [1, 2, 3, 4, 5];
              - name: 인덱스 접근
                example: |
                  let fruits = ["사과", "바나나", "오렌지"];
                  console.log(fruits[0]); // 사과
                  console.log(fruits[1]); // 바나나
                  console.log(fruits.length); // 3
              - name: 배열 메서드
                example: |
                  let fruits = ["사과"];
                  fruits.push("바나나");  // 추가
                  fruits.pop();           // 마지막 제거
                  console.log(fruits);    // ["사과"]
            practice_keywords:
              - 배열
              - array
              - push
              - pop
            prerequisites:
              - functions

          - id: objects
            name: 객체
            description: 관련된 데이터를 하나로 묶습니다
            estimated_minutes: 50
            concepts:
              - name: 객체 생성
                example: |
                  let person = {
                    name: "철수",
                    age: 25,
                    isStudent: true
                  };
              - name: 속성 접근
                example: |
                  let person = { name: "철수", age: 25 };
                  console.log(person.name);    // 철수
                  console.log(person["age"]);  // 25
              - name: 속성 추가/수정
                example: |
                  let person = { name: "철수" };
                  person.age = 25;        // 추가
                  person.name = "영희";   // 수정
            practice_keywords:
              - 객체
              - object
              - 속성
            prerequisites:
              - arrays
```

### Python

```yaml
# apps/server/config/curriculum/python.yaml

language: python
display_name: Python
version: "1.0"

tracks:
  basic:
    display_name: 기초 과정
    description: Python으로 프로그래밍을 시작하는 분을 위한 과정
    estimated_hours: 20
    
    stages:
      - id: stage_1
        name: 프로그래밍 시작
        description: Python 프로그래밍의 기본을 배웁니다
        
        topics:
          - id: variables
            name: 변수
            description: 데이터를 저장하는 방법을 배웁니다
            estimated_minutes: 30
            concepts:
              - name: 변수 선언
                example: |
                  age = 25
                  name = "철수"
                  is_student = True
              - name: 변수 이름 규칙
                example: |
                  # 좋은 예 (스네이크 케이스)
                  user_name = "철수"
                  total_count = 10
                  
                  # 나쁜 예
                  x = "철수"
                  a = 10
              - name: 동적 타이핑
                example: |
                  x = 10      # 숫자
                  x = "hello" # 문자열로 변경 가능
                  print(type(x))  # <class 'str'>
            practice_keywords:
              - 변수
              - 할당
              - type
            prerequisites: []
            
          - id: data_types
            name: 데이터 타입
            description: Python의 기본 데이터 타입을 배웁니다
            estimated_minutes: 45
            concepts:
              - name: 숫자 (int, float)
                example: |
                  count = 10       # int
                  price = 99.99    # float
                  result = count + price  # 109.99
              - name: 문자열 (str)
                example: |
                  greeting = "안녕하세요"
                  name = '철수'
                  message = f"{name}님, {greeting}"  # f-string
              - name: 불리언 (bool)
                example: |
                  is_student = True
                  has_job = False
            practice_keywords:
              - 숫자
              - 문자열
              - 타입
              - int
              - str
              - bool
            prerequisites:
              - variables

          - id: operators
            name: 연산자
            description: 산술, 비교, 논리 연산자를 배웁니다
            estimated_minutes: 40
            concepts:
              - name: 산술 연산자
                example: |
                  a = 10 + 5   # 15
                  b = 10 - 5   # 5
                  c = 10 * 5   # 50
                  d = 10 / 5   # 2.0
                  e = 10 // 3  # 3 (정수 나눗셈)
                  f = 10 % 3   # 1 (나머지)
                  g = 2 ** 3   # 8 (거듭제곱)
              - name: 비교 연산자
                example: |
                  10 > 5   # True
                  10 < 5   # False
                  10 == 10 # True
                  10 != 5  # True
              - name: 논리 연산자
                example: |
                  True and False  # False
                  True or False   # True
                  not True        # False
            practice_keywords:
              - 연산자
              - 산술
              - 비교
              - 논리
            prerequisites:
              - data_types

      - id: stage_2
        name: 흐름 제어
        description: 프로그램의 흐름을 제어하는 방법을 배웁니다
        
        topics:
          - id: conditionals
            name: 조건문
            description: 조건에 따라 다른 코드를 실행합니다
            estimated_minutes: 50
            concepts:
              - name: if문
                example: |
                  age = 20
                  if age >= 18:
                      print("성인입니다")
              - name: if-else문
                example: |
                  score = 75
                  if score >= 60:
                      print("합격")
                  else:
                      print("불합격")
              - name: elif문
                example: |
                  score = 85
                  if score >= 90:
                      print("A")
                  elif score >= 80:
                      print("B")
                  elif score >= 70:
                      print("C")
                  else:
                      print("F")
            practice_keywords:
              - 조건문
              - if
              - elif
              - else
            prerequisites:
              - operators
              
          - id: loops
            name: 반복문
            description: 코드를 반복 실행합니다
            estimated_minutes: 60
            concepts:
              - name: for문과 range
                example: |
                  for i in range(5):
                      print(i)  # 0, 1, 2, 3, 4
                  
                  for i in range(1, 6):
                      print(i)  # 1, 2, 3, 4, 5
              - name: while문
                example: |
                  count = 0
                  while count < 5:
                      print(count)
                      count += 1
              - name: break와 continue
                example: |
                  for i in range(10):
                      if i == 5:
                          break  # 반복 종료
                      if i % 2 == 0:
                          continue  # 다음 반복으로
                      print(i)  # 1, 3
            practice_keywords:
              - 반복문
              - for
              - while
              - range
              - break
              - continue
            prerequisites:
              - conditionals

      - id: stage_3
        name: 코드 구조화
        description: 재사용 가능한 코드를 작성하는 방법을 배웁니다
        
        topics:
          - id: functions
            name: 함수
            description: 코드를 재사용 가능한 단위로 묶습니다
            estimated_minutes: 60
            concepts:
              - name: 함수 정의
                example: |
                  def greet(name):
                      print(f"안녕, {name}")
                  
                  greet("철수")  # 안녕, 철수
              - name: 반환값
                example: |
                  def add(a, b):
                      return a + b
                  
                  result = add(3, 5)  # 8
              - name: 기본값 매개변수
                example: |
                  def greet(name, greeting="안녕"):
                      print(f"{greeting}, {name}")
                  
                  greet("철수")           # 안녕, 철수
                  greet("철수", "하이")   # 하이, 철수
            practice_keywords:
              - 함수
              - def
              - return
            prerequisites:
              - loops
              
          - id: lists
            name: 리스트
            description: 여러 데이터를 하나의 변수에 저장합니다
            estimated_minutes: 60
            concepts:
              - name: 리스트 생성
                example: |
                  fruits = ["사과", "바나나", "오렌지"]
                  numbers = [1, 2, 3, 4, 5]
              - name: 인덱스와 슬라이싱
                example: |
                  fruits = ["사과", "바나나", "오렌지"]
                  print(fruits[0])    # 사과
                  print(fruits[-1])   # 오렌지
                  print(fruits[0:2])  # ["사과", "바나나"]
              - name: 리스트 메서드
                example: |
                  fruits = ["사과"]
                  fruits.append("바나나")  # 추가
                  fruits.pop()             # 마지막 제거
                  print(len(fruits))       # 1
            practice_keywords:
              - 리스트
              - list
              - append
              - pop
            prerequisites:
              - functions

          - id: dictionaries
            name: 딕셔너리
            description: 키-값 쌍으로 데이터를 저장합니다
            estimated_minutes: 50
            concepts:
              - name: 딕셔너리 생성
                example: |
                  person = {
                      "name": "철수",
                      "age": 25,
                      "is_student": True
                  }
              - name: 값 접근
                example: |
                  person = {"name": "철수", "age": 25}
                  print(person["name"])      # 철수
                  print(person.get("age"))   # 25
              - name: 값 추가/수정
                example: |
                  person = {"name": "철수"}
                  person["age"] = 25       # 추가
                  person["name"] = "영희"  # 수정
            practice_keywords:
              - 딕셔너리
              - dict
              - 키
              - 값
            prerequisites:
              - lists
```

---

## 2. 백엔드 구현

### 커리큘럼 서비스

```typescript
// apps/server/src/services/curriculumService.ts
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

// 타입 정의
interface Concept {
  name: string;
  example: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  estimated_minutes: number;
  concepts: Concept[];
  practice_keywords: string[];
  prerequisites: string[];
}

interface Stage {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

interface Track {
  display_name: string;
  description: string;
  estimated_hours: number;
  stages: Stage[];
}

interface Curriculum {
  language: string;
  display_name: string;
  version: string;
  tracks: Record<string, Track>;
}

class CurriculumService {
  private curricula: Map<string, Curriculum> = new Map();
  private curriculumDir: string;
  
  constructor() {
    this.curriculumDir = path.join(__dirname, '../../config/curriculum');
    this.loadAll();
  }
  
  private loadAll(): void {
    const files = fs.readdirSync(this.curriculumDir)
      .filter(f => f.endsWith('.yaml'));
    
    for (const file of files) {
      const filePath = path.join(this.curriculumDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const curriculum = yaml.load(content) as Curriculum;
      this.curricula.set(curriculum.language, curriculum);
    }
    
    console.log(`Loaded ${this.curricula.size} curricula`);
  }
  
  // 언어 목록
  getLanguages(): { id: string; name: string }[] {
    return Array.from(this.curricula.values()).map(c => ({
      id: c.language,
      name: c.display_name
    }));
  }
  
  // 트랙 목록
  getTracks(language: string): { id: string; track: Track }[] {
    const curriculum = this.curricula.get(language);
    if (!curriculum) return [];
    
    return Object.entries(curriculum.tracks).map(([id, track]) => ({
      id,
      track
    }));
  }
  
  // 단계 목록
  getStages(language: string, trackId: string): Stage[] {
    const curriculum = this.curricula.get(language);
    if (!curriculum) return [];
    return curriculum.tracks[trackId]?.stages || [];
  }
  
  // 주제 상세
  getTopic(language: string, trackId: string, topicId: string): Topic | null {
    const stages = this.getStages(language, trackId);
    for (const stage of stages) {
      const topic = stage.topics.find(t => t.id === topicId);
      if (topic) return topic;
    }
    return null;
  }
  
  // 주제가 속한 단계 찾기
  getStageForTopic(language: string, trackId: string, topicId: string): Stage | null {
    const stages = this.getStages(language, trackId);
    for (const stage of stages) {
      if (stage.topics.some(t => t.id === topicId)) {
        return stage;
      }
    }
    return null;
  }
  
  // 다음 주제 추천
  getNextTopic(language: string, trackId: string, completedTopics: string[]): Topic | null {
    const stages = this.getStages(language, trackId);
    
    for (const stage of stages) {
      for (const topic of stage.topics) {
        if (completedTopics.includes(topic.id)) continue;
        
        const prereqsMet = topic.prerequisites.every(p => completedTopics.includes(p));
        if (prereqsMet) {
          return topic;
        }
      }
    }
    
    return null;
  }
  
  // 학습 진도
  getProgress(language: string, trackId: string, completedTopics: string[]): {
    completed: number;
    total: number;
    percentage: number;
    currentStage: Stage | null;
    completedStages: string[];
  } {
    const stages = this.getStages(language, trackId);
    const allTopics = stages.flatMap(s => s.topics);
    const total = allTopics.length;
    const completed = completedTopics.filter(t => 
      allTopics.some(at => at.id === t)
    ).length;
    
    // 완료된 단계
    const completedStages: string[] = [];
    let currentStage: Stage | null = null;
    
    for (const stage of stages) {
      const stageTopicIds = stage.topics.map(t => t.id);
      const stageCompleted = stageTopicIds.every(id => completedTopics.includes(id));
      
      if (stageCompleted) {
        completedStages.push(stage.id);
      } else if (!currentStage) {
        currentStage = stage;
      }
    }
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      currentStage,
      completedStages
    };
  }
  
  // 단계의 모든 주제 ID
  getStageTopicIds(language: string, trackId: string, stageId: string): string[] {
    const stages = this.getStages(language, trackId);
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.topics.map(t => t.id) : [];
  }
  
  // 단계까지의 모든 주제 (시험 범위용)
  getTopicsUpToStage(language: string, trackId: string, stageId: string): Topic[] {
    const stages = this.getStages(language, trackId);
    const topics: Topic[] = [];
    
    for (const stage of stages) {
      topics.push(...stage.topics);
      if (stage.id === stageId) break;
    }
    
    return topics;
  }
}

export const curriculumService = new CurriculumService();
```

### API 라우트

```typescript
// apps/server/src/routes/curriculum.ts
import { Router } from 'express';
import { curriculumService } from '../services/curriculumService';
import { db } from '../db';

const router = Router();

// 언어 목록
router.get('/languages', (req, res) => {
  const languages = curriculumService.getLanguages();
  res.json(languages);
});

// 트랙 목록
router.get('/:language/tracks', (req, res) => {
  const tracks = curriculumService.getTracks(req.params.language);
  res.json(tracks);
});

// 단계 목록 (진도 포함)
router.get('/:language/:trackId/stages', async (req, res) => {
  const { language, trackId } = req.params;
  const userId = req.user?.id;
  
  const stages = curriculumService.getStages(language, trackId);
  
  // 로그인한 경우 진도 정보 추가
  if (userId) {
    const completed = await getCompletedTopics(userId, language, trackId);
    const progress = curriculumService.getProgress(language, trackId, completed);
    
    res.json({
      stages,
      progress,
      completedTopics: completed
    });
  } else {
    res.json({ stages });
  }
});

// 주제 상세
router.get('/:language/:trackId/topics/:topicId', (req, res) => {
  const { language, trackId, topicId } = req.params;
  
  const topic = curriculumService.getTopic(language, trackId, topicId);
  if (!topic) {
    return res.status(404).json({ error: '주제를 찾을 수 없습니다' });
  }
  
  const stage = curriculumService.getStageForTopic(language, trackId, topicId);
  
  res.json({
    topic,
    stage: stage ? { id: stage.id, name: stage.name } : null
  });
});

// 학습 진도
router.get('/:language/:trackId/progress', async (req, res) => {
  const userId = req.user.id;
  const { language, trackId } = req.params;
  
  const completedTopics = await getCompletedTopics(userId, language, trackId);
  const progress = curriculumService.getProgress(language, trackId, completedTopics);
  const nextTopic = curriculumService.getNextTopic(language, trackId, completedTopics);
  
  res.json({
    ...progress,
    nextTopic,
    completedTopics
  });
});

// 주제 완료 처리
router.post('/:language/:trackId/topics/:topicId/complete', async (req, res) => {
  const userId = req.user.id;
  const { language, trackId, topicId } = req.params;
  
  // 선수 조건 확인
  const topic = curriculumService.getTopic(language, trackId, topicId);
  if (!topic) {
    return res.status(404).json({ error: '주제를 찾을 수 없습니다' });
  }
  
  const completedTopics = await getCompletedTopics(userId, language, trackId);
  const prereqsMet = topic.prerequisites.every(p => completedTopics.includes(p));
  
  if (!prereqsMet) {
    return res.status(400).json({ error: '선수 주제를 먼저 완료해주세요' });
  }
  
  await markTopicCompleted(userId, language, trackId, topicId);
  
  // 다음 주제 추천
  const updatedCompleted = [...completedTopics, topicId];
  const nextTopic = curriculumService.getNextTopic(language, trackId, updatedCompleted);
  
  res.json({
    success: true,
    nextTopic
  });
});

// DB 헬퍼 함수
async function getCompletedTopics(userId: string, language: string, trackId: string): Promise<string[]> {
  const rows = await db.query(
    `SELECT topic_id FROM learning_progress 
     WHERE user_id = $1 AND language = $2 AND track_id = $3`,
    [userId, language, trackId]
  );
  return rows.map(r => r.topic_id);
}

async function markTopicCompleted(userId: string, language: string, trackId: string, topicId: string): Promise<void> {
  await db.query(
    `INSERT INTO learning_progress (user_id, language, track_id, topic_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, language, track_id, topic_id) DO NOTHING`,
    [userId, language, trackId, topicId]
  );
}

export default router;
```

### 기존 에이전트 수정

```typescript
// apps/server/src/routes/agent/debugBuddy.ts (수정)

router.post('/debug-buddy', async (req, res) => {
  const { code, language, error, level, trackId, topicId } = req.body;
  
  // 주제 맥락 가져오기
  let topicContext = '';
  if (trackId && topicId) {
    const topic = curriculumService.getTopic(language, trackId, topicId);
    if (topic) {
      topicContext = `
현재 학습 주제: ${topic.name}
학습 중인 개념:
${topic.concepts.map(c => `- ${c.name}`).join('\n')}
`;
    }
  }
  
  // ... 기존 코드 ...
  
  const userPrompt = `${topicContext}
프로그래밍 언어: ${language}

학습자가 작성한 코드:
\`\`\`${language}
${code}
\`\`\`

발생한 에러:
\`\`\`
${error}
\`\`\`

${topicContext ? '현재 학습 중인 개념과 연관지어 설명해주세요.' : ''}`;

  // ... LLM 호출 ...
});
```

```typescript
// apps/server/src/routes/agent/practice.ts (수정)

router.post('/generate', async (req, res) => {
  const { language, level, count, trackId, topicId } = req.body;
  
  // 주제 정보 가져오기
  const topic = curriculumService.getTopic(language, trackId, topicId);
  if (!topic) {
    return res.status(404).json({ error: '주제를 찾을 수 없습니다' });
  }
  
  const prompt = `
주제: ${topic.name}
설명: ${topic.description}
학습 개념:
${topic.concepts.map(c => `- ${c.name}\n  예시: ${c.example}`).join('\n')}

프로그래밍 언어: ${language}
문제 수: ${count}

위 개념들을 연습할 수 있는 문제를 만들어주세요.
`;

  // ... LLM 호출 ...
});
```

```typescript
// apps/server/src/routes/agent/exam.ts (수정)

router.post('/generate', requireInstructor, async (req, res) => {
  const { title, language, level, questionCount, duration, trackId, stageId } = req.body;
  
  // 단계까지의 모든 주제 가져오기
  const topics = curriculumService.getTopicsUpToStage(language, trackId, stageId);
  
  const topicNames = topics.map(t => t.name);
  const allConcepts = topics.flatMap(t => t.concepts.map(c => c.name));
  
  const prompt = `
시험 범위: ${topicNames.join(', ')}
평가할 개념: ${allConcepts.join(', ')}
프로그래밍 언어: ${language}
문제 수: ${questionCount}개

위 범위에서 시험 문제를 만들어주세요.
`;

  // ... LLM 호출 ...
});
```

---

## 3. 데이터베이스

```sql
-- apps/server/src/db/migrations/005_curriculum.sql

-- 학습 진도
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(20) NOT NULL,
  track_id VARCHAR(50) NOT NULL,
  topic_id VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, language, track_id, topic_id)
);

-- 주제별 학습 통계
CREATE TABLE topic_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(20) NOT NULL,
  track_id VARCHAR(50) NOT NULL,
  topic_id VARCHAR(50) NOT NULL,
  code_runs INT DEFAULT 0,
  debug_buddy_used INT DEFAULT 0,
  code_mentor_used INT DEFAULT 0,
  practice_attempts INT DEFAULT 0,
  practice_passed INT DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, language, track_id, topic_id)
);

-- 인덱스
CREATE INDEX idx_progress_user ON learning_progress(user_id);
CREATE INDEX idx_progress_lang_track ON learning_progress(language, track_id);
CREATE INDEX idx_stats_user ON topic_stats(user_id);
```

---

## 4. 프론트엔드 구현

### 페이지 구조

```typescript
// apps/client/src/pages/curriculum/index.tsx
// 언어 선택 페이지

export default function CurriculumPage() {
  const [languages, setLanguages] = useState([]);
  
  useEffect(() => {
    fetch('/api/curriculum/languages')
      .then(r => r.json())
      .then(setLanguages);
  }, []);
  
  return (
    <div className="curriculum-page">
      <h1>학습할 언어를 선택하세요</h1>
      
      <div className="language-grid">
        {languages.map(lang => (
          <Link key={lang.id} href={`/curriculum/${lang.id}`}>
            <div className="language-card">
              <img src={`/icons/${lang.id}.svg`} alt={lang.name} />
              <h2>{lang.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// apps/client/src/pages/curriculum/[language]/[trackId]/index.tsx
// 학습 대시보드

export default function TrackDashboard() {
  const router = useRouter();
  const { language, trackId } = router.query;
  
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (language && trackId) {
      fetch(`/api/curriculum/${language}/${trackId}/stages`)
        .then(r => r.json())
        .then(setData);
    }
  }, [language, trackId]);
  
  if (!data) return <div>로딩 중...</div>;
  
  const { stages, progress, completedTopics } = data;
  
  return (
    <div className="track-dashboard">
      {/* 진도 요약 */}
      <div className="progress-summary">
        <h2>{language} 기초 과정</h2>
        <ProgressBar value={progress.percentage} />
        <p>{progress.completed} / {progress.total} 완료</p>
        {progress.currentStage && (
          <p>현재 단계: {progress.currentStage.name}</p>
        )}
      </div>
      
      {/* 다음 학습 추천 */}
      {progress.nextTopic && (
        <NextTopicCard
          topic={progress.nextTopic}
          language={language}
          trackId={trackId}
        />
      )}
      
      {/* 전체 커리큘럼 맵 */}
      <div className="curriculum-map">
        <h3>전체 커리큘럼</h3>
        {stages.map(stage => (
          <StageSection
            key={stage.id}
            stage={stage}
            completedTopics={completedTopics}
            language={language}
            trackId={trackId}
          />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// apps/client/src/pages/curriculum/[language]/[trackId]/[topicId].tsx
// 주제 학습 페이지

export default function TopicLearningPage() {
  const router = useRouter();
  const { language, trackId, topicId } = router.query;
  
  const [topic, setTopic] = useState(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice'>('learn');
  
  useEffect(() => {
    if (language && trackId && topicId) {
      fetch(`/api/curriculum/${language}/${trackId}/topics/${topicId}`)
        .then(r => r.json())
        .then(data => setTopic(data.topic));
    }
  }, [language, trackId, topicId]);
  
  if (!topic) return <div>로딩 중...</div>;
  
  return (
    <div className="topic-learning">
      {/* 헤더 */}
      <div className="topic-header">
        <h1>{topic.name}</h1>
        <p>{topic.description}</p>
        <span>{topic.estimated_minutes}분 예상</span>
      </div>
      
      {/* 탭 */}
      <div className="tabs">
        <button
          className={activeTab === 'learn' ? 'active' : ''}
          onClick={() => setActiveTab('learn')}
        >
          개념 학습
        </button>
        <button
          className={activeTab === 'practice' ? 'active' : ''}
          onClick={() => setActiveTab('practice')}
        >
          연습 문제
        </button>
      </div>
      
      {/* 개념 학습 탭 */}
      {activeTab === 'learn' && (
        <div className="learn-section">
          {/* 개념 설명 */}
          <div className="concepts">
            {topic.concepts.map((concept, i) => (
              <ConceptCard key={i} concept={concept} />
            ))}
          </div>
          
          {/* 코드 에디터 (실습) */}
          <div className="practice-editor">
            <h3>직접 해보기</h3>
            <CodeEditor
              language={language}
              level={userLevel}
              trackId={trackId}
              topicId={topicId}
            />
          </div>
        </div>
      )}
      
      {/* 연습 문제 탭 */}
      {activeTab === 'practice' && (
        <PracticeSection
          language={language}
          trackId={trackId}
          topicId={topicId}
          level={userLevel}
        />
      )}
      
      {/* 완료 버튼 */}
      <div className="complete-section">
        <button onClick={handleComplete}>
          이 주제 완료하기
        </button>
      </div>
    </div>
  );
}
```

### 컴포넌트

```typescript
// apps/client/src/components/curriculum/ConceptCard.tsx

interface Props {
  concept: {
    name: string;
    example: string;
  };
}

export function ConceptCard({ concept }: Props) {
  return (
    <div className="concept-card">
      <h4>{concept.name}</h4>
      <pre>
        <code>{concept.example}</code>
      </pre>
    </div>
  );
}
```

```typescript
// apps/client/src/components/curriculum/StageSection.tsx

interface Props {
  stage: Stage;
  completedTopics: string[];
  language: string;
  trackId: string;
}

export function StageSection({ stage, completedTopics, language, trackId }: Props) {
  const allCompleted = stage.topics.every(t => completedTopics.includes(t.id));
  
  return (
    <div className={`stage-section ${allCompleted ? 'completed' : ''}`}>
      <h4>
        {allCompleted && <span className="check">V</span>}
        {stage.name}
      </h4>
      <p>{stage.description}</p>
      
      <div className="topic-list">
        {stage.topics.map(topic => (
          <Link
            key={topic.id}
            href={`/curriculum/${language}/${trackId}/${topic.id}`}
          >
            <div className={`topic-item ${completedTopics.includes(topic.id) ? 'completed' : ''}`}>
              {completedTopics.includes(topic.id) && <span>V</span>}
              {topic.name}
              <span className="time">{topic.estimated_minutes}분</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// apps/client/src/components/learning/CodeEditor.tsx (수정)

interface Props {
  language: string;
  level: string;
  trackId?: string;
  topicId?: string;
}

export function CodeEditor({ language, level, trackId, topicId }: Props) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  // Debug Buddy 호출 시 주제 정보 포함
  const askDebugBuddy = async () => {
    const res = await fetch('/api/agent/debug-buddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        error,
        level,
        trackId,  // 추가
        topicId   // 추가
      })
    });
    // ... SSE 처리 ...
  };

  // Code Mentor 호출 시 주제 정보 포함
  const askCodeMentor = async () => {
    const res = await fetch('/api/agent/code-mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        output,
        level,
        trackId,  // 추가
        topicId   // 추가
      })
    });
    // ... SSE 처리 ...
  };

  // ... 나머지 코드 ...
}
```

---

## 5. UI 예시

### 학습 대시보드

```
+------------------------------------------------------------------+
|  JavaScript 기초 과정                                              |
+------------------------------------------------------------------+
|                                                                  |
|  [================--------] 6 / 10 완료 (60%)                    |
|  현재 단계: 흐름 제어                                              |
|                                                                  |
+------------------------------------------------------------------+
|  다음 학습                                                        |
|  +------------------------------------------------------------+  |
|  | 반복문                                         30분 예상     |  |
|  | for문, while문, break와 continue를 배웁니다                  |  |
|  |                                          [학습 시작]         |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
|  전체 커리큘럼                                                    |
|  ----------------------------------------------------------------|
|                                                                  |
|  [V] 1단계: 프로그래밍 시작                                       |
|      [V] 변수와 상수                               30분           |
|      [V] 데이터 타입                               45분           |
|      [V] 연산자                                    40분           |
|                                                                  |
|  [ ] 2단계: 흐름 제어                                             |
|      [V] 조건문                                    50분           |
|      [ ] 반복문  <-- 현재                          60분           |
|                                                                  |
|  [ ] 3단계: 코드 구조화                                           |
|      [ ] 함수                                      60분           |
|      [ ] 배열                                      60분           |
|      [ ] 객체                                      50분           |
|                                                                  |
+------------------------------------------------------------------+
```

### 주제 학습 페이지

```
+------------------------------------------------------------------+
|  반복문                                              60분 예상    |
|  코드를 반복 실행합니다                                           |
+------------------------------------------------------------------+
|  [개념 학습]  [연습 문제]                                         |
+------------------------------------------------------------------+
|                                                                  |
|  for문                                                           |
|  +------------------------------------------------------------+  |
|  | for (let i = 0; i < 5; i++) {                              |  |
|  |   console.log(i); // 0, 1, 2, 3, 4                         |  |
|  | }                                                          |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  while문                                                         |
|  +------------------------------------------------------------+  |
|  | let count = 0;                                             |  |
|  | while (count < 5) {                                        |  |
|  |   console.log(count);                                      |  |
|  |   count++;                                                 |  |
|  | }                                                          |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  break와 continue                                                |
|  +------------------------------------------------------------+  |
|  | for (let i = 0; i < 10; i++) {                             |  |
|  |   if (i === 5) break;                                      |  |
|  |   if (i % 2 === 0) continue;                               |  |
|  |   console.log(i); // 1, 3                                  |  |
|  | }                                                          |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
|  직접 해보기                                                      |
|  +------------------------------------------------------------+  |
|  | // 1부터 5까지 출력해보세요                                 |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|  [실행]                                                          |
|                                                                  |
|  [이 주제 완료하기]                                               |
+------------------------------------------------------------------+
```

---

## 구현 순서

| 순서 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | YAML 파일 작성 (JS, Python) | 2-3시간 |
| 2 | curriculumService.ts | 2-3시간 |
| 3 | curriculum.ts 라우트 | 2-3시간 |
| 4 | DB 마이그레이션 | 30분 |
| 5 | 기존 에이전트 수정 (topic 파라미터 추가) | 2시간 |
| 6 | 프론트엔드 페이지 | 1일 |
| 7 | 테스트 | 반나절 |

**총 예상: 3-4일**

