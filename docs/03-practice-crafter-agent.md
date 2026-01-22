# Practice Crafter Agent (프랙티스 크래프터)

## 개요

강사가 설정한 학습 주제에 맞는 연습 문제를 자동 생성하고, 힌트 제공 및 자동 채점을 수행하는 에이전트.

- **복잡도**: LLM 1회 호출 (문제 생성) + Piston 채점 + LLM 1회 호출 (피드백)
- **예상 구현 시간**: 4-5일

## 핵심 가치

- 강사의 문제 출제 부담 경감
- 학습 주제에 맞는 맞춤형 문제 생성
- 수준별 난이도 자동 조절
- 힌트 제공으로 자력 해결 유도

## 동작 흐름

### 문제 생성

```
강사가 주제/수준/문제수 설정
    ↓
LLM 호출 (JSON 형식 응답)
    ↓
문제 세트 저장
    ↓
학습자에게 배포
```

### 문제 풀이

```
문제 표시
    ↓
학습자 코드 작성
    ↓
[힌트] 클릭 시 단계별 힌트 표시 (미리 생성된 힌트)
    ↓
[제출] 클릭
    ↓
Piston 코드 실행
    ↓
테스트케이스 검증
    ↓
LLM 피드백 생성
    ↓
결과 표시
```

## API

### 문제 생성

```
POST /api/agent/practice/generate
```

```typescript
// 요청
interface GenerateRequest {
  topic: string;              // "변수와 상수"
  language: 'javascript' | 'typescript' | 'python';
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
  count: number;              // 1-10
}

// 응답
interface PracticeSet {
  id: string;
  topic: string;
  problems: Problem[];
}

interface Problem {
  id: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  requirements: string[];
  hints: string[];            // 3단계 힌트 (미리 생성)
  testCases: TestCase[];
  sampleAnswer: string;       // 강사용
}

interface TestCase {
  input?: string;
  expectedOutput: string;
  description: string;
}
```

### 채점

```
POST /api/agent/practice/grade
```

```typescript
// 요청
interface GradeRequest {
  problemId: string;
  code: string;
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
}

// 응답
interface GradeResult {
  passed: boolean;
  score: number;              // 0-100
  testResults: TestResult[];
  feedback: string;           // LLM 생성 피드백
}

interface TestResult {
  description: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
}
```

## 백엔드 구현

### 문제 생성 라우트

```typescript
// apps/server/src/routes/agent/practice.ts
import { Router } from 'express';
import OpenAI from 'openai';
import { getModelConfig } from '../../config/modelByLevel';
import { PRACTICE_PROMPTS } from '../../prompts/practice';

const router = Router();

router.post('/generate', async (req, res) => {
  const { topic, language, level, count } = req.body;

  try {
    const config = getModelConfig(level);
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });

    const completion = await client.chat.completions.create({
      model: config.modelName,
      messages: [
        { role: 'system', content: PRACTICE_PROMPTS.generate[level] },
        { role: 'user', content: `주제: ${topic}\n언어: ${language}\n문제 수: ${count}` }
      ],
      response_format: { type: 'json_object' }
    });

    const problems = JSON.parse(completion.choices[0].message.content);
    
    // DB 저장
    const practiceSet = await savePracticeSet({
      topic,
      language,
      level,
      problems: problems.problems
    });

    res.json(practiceSet);

  } catch (err) {
    res.status(500).json({ error: '문제 생성 실패' });
  }
});

export default router;
```

### 채점 라우트

```typescript
// apps/server/src/routes/agent/practice.ts (계속)

router.post('/grade', async (req, res) => {
  const { problemId, code, level } = req.body;

  try {
    // 1. 문제 조회
    const problem = await getProblemById(problemId);

    // 2. 코드 실행
    const execResult = await executeCode(code, problem.language);

    // 3. 테스트케이스 검증
    const testResults = problem.testCases.map(tc => {
      const actualOutput = execResult.output?.trim() || '';
      const expectedOutput = tc.expectedOutput.trim();
      return {
        description: tc.description,
        passed: actualOutput === expectedOutput,
        expectedOutput,
        actualOutput
      };
    });

    const passedCount = testResults.filter(r => r.passed).length;
    const score = Math.round((passedCount / testResults.length) * 100);
    const passed = score === 100;

    // 4. LLM 피드백 생성
    const feedback = await generateFeedback(problem, code, testResults, passed, level);

    res.json({
      passed,
      score,
      testResults,
      feedback
    });

  } catch (err) {
    res.status(500).json({ error: '채점 실패' });
  }
});

async function generateFeedback(
  problem: Problem,
  code: string,
  testResults: TestResult[],
  passed: boolean,
  level: string
): Promise<string> {
  const config = getModelConfig(level);
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });

  const prompt = passed
    ? `학습자가 문제를 맞혔습니다. 칭찬해주세요.\n\n문제: ${problem.title}\n코드:\n${code}`
    : `학습자가 문제를 틀렸습니다. 힌트를 주세요 (답은 알려주지 마세요).\n\n문제: ${problem.title}\n코드:\n${code}\n\n틀린 테스트케이스: ${testResults.filter(r => !r.passed).map(r => r.description).join(', ')}`;

  const completion = await client.chat.completions.create({
    model: config.modelName,
    messages: [
      { role: 'system', content: PRACTICE_PROMPTS.feedback[level] },
      { role: 'user', content: prompt }
    ]
  });

  return completion.choices[0].message.content;
}
```

### 코드 실행 유틸리티

```typescript
// apps/server/src/utils/codeExecutor.ts

const PISTON_URL = process.env.PISTON_API_URL || 'http://localhost:2000';

interface ExecuteResult {
  output: string;
  error: string;
  exitCode: number;
}

export async function executeCode(code: string, language: string): Promise<ExecuteResult> {
  const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: language,
      version: '*',
      files: [{ content: code }],
      run_timeout: 5000,
      run_memory_limit: 128000000
    })
  });

  const result = await response.json();

  return {
    output: result.run?.stdout || '',
    error: result.run?.stderr || '',
    exitCode: result.run?.code || 0
  };
}
```

### 수준별 프롬프트

```typescript
// apps/server/src/prompts/practice.ts

export const PRACTICE_PROMPTS = {
  generate: {
    beginner_zero: `프로그래밍을 처음 배우는 학습자를 위한 연습 문제를 만드세요.

규칙:
- 한 문제에 1개 개념만 다루세요
- 코드 2-5줄로 해결 가능해야 합니다
- 변수 이름, 값을 정확히 지정해주세요
- 힌트는 거의 답에 가깝게 친절하게

JSON 형식:
{
  "problems": [
    {
      "id": "prob-1",
      "order": 1,
      "difficulty": "easy",
      "title": "문제 제목",
      "description": "문제 설명",
      "requirements": ["요구사항1", "요구사항2"],
      "hints": ["힌트1(방향)", "힌트2(구체적)", "힌트3(거의 답)"],
      "testCases": [
        { "expectedOutput": "기대출력", "description": "설명" }
      ],
      "sampleAnswer": "예시 정답 코드"
    }
  ]
}`,

    beginner: `프로그래밍 기초를 배우는 학습자를 위한 연습 문제를 만드세요.

규칙:
- 한 문제에 2-3개 개념 조합 가능
- 코드 5-15줄로 해결 가능해야 합니다
- 출력 형식을 지정할 수 있습니다
- 힌트는 방향 제시 위주로

JSON 형식: (위와 동일)`,

    beginner_plus: `기본 문법을 아는 학습자를 위한 연습 문제를 만드세요.

규칙:
- 여러 개념을 활용하는 문제 가능
- 코드 10-30줄 예상
- 실무와 비슷한 시나리오 제시
- 힌트는 최소한으로

JSON 형식: (위와 동일)`
  },

  feedback: {
    beginner_zero: `학습자가 문제를 풀었습니다.

규칙:
- 맞으면 크게 칭찬하세요
- 틀려도 격려하세요
- 어디가 틀렸는지 친절하게 알려주세요
- 답을 직접 알려주지 마세요`,

    beginner: `학습자가 문제를 풀었습니다.

규칙:
- 맞으면 구체적으로 칭찬
- 틀리면 어느 부분이 틀렸는지 안내
- 개선 방향 제시`,

    beginner_plus: `학습자가 문제를 풀었습니다.

규칙:
- 간결하게 결과 전달
- 틀린 부분에 대한 디버깅 힌트
- 더 나은 풀이 방법 제안`
  }
};
```

## 프론트엔드 구현

### 문제 풀이 컴포넌트

```typescript
// apps/client/src/components/PracticeProblem.tsx
import { useState } from 'react';

interface Props {
  problem: Problem;
  level: string;
  onComplete: () => void;
}

export function PracticeProblem({ problem, level, onComplete }: Props) {
  const [code, setCode] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showHint = () => {
    if (hintLevel < 3) {
      setHintLevel(hintLevel + 1);
    }
  };

  const submit = async () => {
    setIsSubmitting(true);

    const res = await fetch('/api/agent/practice/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: problem.id, code, level })
    });

    const gradeResult = await res.json();
    setResult(gradeResult);
    setIsSubmitting(false);

    if (gradeResult.passed) {
      onComplete();
    }
  };

  return (
    <div className="practice-problem">
      {/* 문제 */}
      <div className="problem-header">
        <h3>{problem.title}</h3>
        <span className={`difficulty ${problem.difficulty}`}>
          {problem.difficulty}
        </span>
      </div>

      <p>{problem.description}</p>

      <ul className="requirements">
        {problem.requirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>

      {/* 코드 에디터 */}
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="코드를 입력하세요"
      />

      {/* 버튼 */}
      <div className="actions">
        <button onClick={showHint} disabled={hintLevel >= 3}>
          힌트 ({hintLevel}/3)
        </button>
        <button onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? '채점 중...' : '제출'}
        </button>
      </div>

      {/* 힌트 표시 */}
      {hintLevel > 0 && (
        <div className="hint">
          <strong>힌트 {hintLevel}:</strong> {problem.hints[hintLevel - 1]}
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className={`result ${result.passed ? 'passed' : 'failed'}`}>
          <div className="score">
            {result.passed ? '정답!' : '다시 도전!'} ({result.score}점)
          </div>
          <div className="feedback">{result.feedback}</div>
        </div>
      )}
    </div>
  );
}
```

### 문제 세트 컴포넌트

```typescript
// apps/client/src/components/PracticeSet.tsx
import { useState } from 'react';
import { PracticeProblem } from './PracticeProblem';

interface Props {
  practiceSet: PracticeSet;
  level: string;
}

export function PracticeSet({ practiceSet, level }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const handleComplete = () => {
    const problemId = practiceSet.problems[currentIndex].id;
    setCompleted([...completed, problemId]);
  };

  const problem = practiceSet.problems[currentIndex];

  return (
    <div className="practice-set">
      <h2>{practiceSet.topic} 연습</h2>
      
      <div className="progress">
        {completed.length} / {practiceSet.problems.length} 완료
      </div>

      {/* 문제 네비게이션 */}
      <div className="nav">
        {practiceSet.problems.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setCurrentIndex(i)}
            className={`${i === currentIndex ? 'active' : ''} ${completed.includes(p.id) ? 'completed' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 현재 문제 */}
      <PracticeProblem
        problem={problem}
        level={level}
        onComplete={handleComplete}
      />

      {/* 이전/다음 */}
      <div className="navigation">
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          이전
        </button>
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex === practiceSet.problems.length - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}
```

## UI

```
+--------------------------------------------------+
|  [변수와 상수] 연습                1 / 3 완료      |
|  [1] [2] [3]                                      |
+--------------------------------------------------+
|                                                  |
|  문제 1: 변수 만들고 출력하기              [Easy]  |
|  ------------------------------------------------|
|  나이를 저장하는 변수를 만들고 출력하세요          |
|                                                  |
|  요구사항:                                        |
|  - 변수 이름은 age로 하세요                       |
|  - 값은 25로 설정하세요                          |
|  - console.log로 출력하세요                      |
|                                                  |
|  +--------------------------------------------+  |
|  | let age = 25                               |  |
|  | console.log(age)                           |  |
|  +--------------------------------------------+  |
|                                                  |
|  [힌트 (0/3)]                         [제출]     |
|                                                  |
|  +--------------------------------------------+  |
|  | 정답! (100점)                              |  |
|  | 잘했어요! 변수를 만들고 출력하는 방법을      |  |
|  | 잘 이해했네요!                             |  |
|  +--------------------------------------------+  |
|                                                  |
|  [이전]                                 [다음]   |
+--------------------------------------------------+
```

## 데이터베이스 스키마

```sql
-- 연습 문제 세트
CREATE TABLE practice_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  topic VARCHAR(100) NOT NULL,
  language VARCHAR(20) NOT NULL,
  level VARCHAR(20) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 문제
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_set_id UUID REFERENCES practice_sets(id) ON DELETE CASCADE,
  order_num INT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  hints JSONB NOT NULL,
  test_cases JSONB NOT NULL,
  sample_answer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 풀이 기록
CREATE TABLE problem_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  score INT NOT NULL,
  hints_used INT DEFAULT 0,
  feedback TEXT,
  attempted_at TIMESTAMP DEFAULT NOW()
);
```

## 파일 구조

```
apps/server/src/
├── routes/agent/
│   └── practice.ts        # 생성 + 채점 API
├── prompts/
│   └── practice.ts        # 수준별 프롬프트
└── utils/
    └── codeExecutor.ts    # Piston 래퍼

apps/client/src/
└── components/
    ├── PracticeProblem.tsx
    └── PracticeSet.tsx
```

## 문제 예시

### 초초보: 변수 선언

```json
{
  "title": "변수 만들고 출력하기",
  "description": "나이를 저장하는 변수를 만들고 출력하세요",
  "requirements": [
    "변수 이름은 age로 하세요",
    "값은 25로 설정하세요",
    "console.log로 출력하세요"
  ],
  "hints": [
    "변수를 만들려면 let 또는 const를 사용해요",
    "let age = 25 형태로 작성해보세요",
    "console.log(age)로 출력할 수 있어요"
  ],
  "testCases": [
    { "expectedOutput": "25", "description": "age 변수 출력" }
  ]
}
```

### 초보: 두 수 더하기

```json
{
  "title": "두 변수 더해서 출력하기",
  "description": "사과와 오렌지 개수를 더해서 출력하세요",
  "requirements": [
    "appleCount는 5로 설정",
    "orangeCount는 3으로 설정",
    "총합을 '총 과일: X개' 형식으로 출력"
  ],
  "hints": [
    "두 개의 변수를 만들어야 해요",
    "문자열과 숫자를 + 로 연결할 수 있어요",
    "console.log('총 과일: ' + (appleCount + orangeCount) + '개')"
  ],
  "testCases": [
    { "expectedOutput": "총 과일: 8개", "description": "총합 출력" }
  ]
}
```
