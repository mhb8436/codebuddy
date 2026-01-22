# Exam Master Agent (엑잠 마스터)

## 개요

강사가 설정한 시험 범위에 맞는 평가 문제를 생성하고, 자동 채점 및 성적 리포트를 제공하는 에이전트.

- **복잡도**: LLM 1회 호출 (시험 생성) + Piston 채점 + LLM 1회 호출 (오답 해설)
- **예상 구현 시간**: 5-7일

## 핵심 가치

- 강사의 시험 출제/채점 부담 경감
- 일관된 채점 기준 적용
- 즉각적인 성적 피드백
- 상세한 오답 분석

## Practice Crafter와의 차이

| 구분 | Practice Crafter | Exam Master |
|------|------------------|-------------|
| 목적 | 학습/연습 | 평가 |
| 힌트 | 3단계 제공 | 없음 |
| 재시도 | 무제한 | 1회 |
| 시간 | 제한 없음 | 제한 있음 |
| 피드백 | 실시간 | 제출 후 |

## 동작 흐름

### 시험 생성 (강사)

```
강사가 시험 설정
  - 제목: "1주차 평가"
  - 범위: ["변수와 상수", "조건문"]
  - 문제 수: 10개
  - 시간: 30분
    ↓
LLM 호출 (JSON 형식)
    ↓
시험 저장
    ↓
시작 시간 설정 후 배포
```

### 시험 응시 (학습자)

```
시험 시작
    ↓
타이머 시작
    ↓
문제별 코드 작성
    ↓
[제출] 또는 시간 종료
    ↓
자동 채점 (Piston + 테스트케이스)
    ↓
LLM 오답 해설 생성
    ↓
성적표 표시
```

## API

### 시험 생성 (강사)

```
POST /api/agent/exam/generate
```

```typescript
// 요청
interface GenerateExamRequest {
  title: string;
  topics: string[];
  language: 'javascript' | 'typescript' | 'python';
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
  questionCount: number;      // 5-20
  duration: number;           // 분
}

// 응답
interface Exam {
  id: string;
  title: string;
  topics: string[];
  duration: number;
  totalPoints: number;
  questions: ExamQuestion[];
  status: 'draft' | 'scheduled' | 'active' | 'completed';
}

interface ExamQuestion {
  id: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  title: string;
  description: string;
  requirements: string[];
  testCases: TestCase[];        // 채점용
  sampleAnswer: string;         // 강사용
}
```

### 시험 시작 (학습자)

```
POST /api/exam/:examId/start
```

```typescript
// 응답
interface ExamAttempt {
  attemptId: string;
  examId: string;
  startedAt: string;
  endsAt: string;              // startedAt + duration
  questions: ExamQuestion[];   // testCases 제외
}
```

### 답안 제출

```
POST /api/exam/:examId/submit
```

```typescript
// 요청
interface SubmitRequest {
  attemptId: string;
  answers: {
    questionId: string;
    code: string;
  }[];
}

// 응답
interface ExamResult {
  score: number;
  totalPoints: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timeTaken: number;           // 초
  questionResults: QuestionResult[];
}

interface QuestionResult {
  questionId: string;
  score: number;
  maxPoints: number;
  passed: boolean;
  testResults: TestResult[];
  feedback: string;            // 오답 해설
}
```

### 반 전체 성적 (강사)

```
GET /api/admin/exam/:examId/results
```

```typescript
// 응답
interface ExamStatistics {
  totalStudents: number;
  submitted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  questionAnalysis: {
    questionId: string;
    title: string;
    averageScore: number;
    correctRate: number;
  }[];
  studentResults: {
    userId: string;
    name: string;
    score: number;
    grade: string;
  }[];
}
```

## 백엔드 구현

### 시험 생성

```typescript
// apps/server/src/routes/agent/exam.ts
import { Router } from 'express';
import OpenAI from 'openai';
import { getModelConfig } from '../../config/modelByLevel';
import { EXAM_PROMPTS } from '../../prompts/exam';

const router = Router();

router.post('/generate', requireInstructor, async (req, res) => {
  const { title, topics, language, level, questionCount, duration } = req.body;

  try {
    const config = getModelConfig('beginner_zero'); // 시험 출제는 Claude 사용
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });

    const completion = await client.chat.completions.create({
      model: config.modelName,
      messages: [
        { role: 'system', content: EXAM_PROMPTS.generate[level] },
        { role: 'user', content: buildGeneratePrompt(topics, language, questionCount) }
      ],
      response_format: { type: 'json_object' }
    });

    const examData = JSON.parse(completion.choices[0].message.content);
    
    // DB 저장
    const exam = await saveExam({
      title,
      topics,
      language,
      level,
      duration,
      totalPoints: questionCount * 10,
      questions: examData.questions,
      createdBy: req.user.id,
      status: 'draft'
    });

    res.json(exam);

  } catch (err) {
    res.status(500).json({ error: '시험 생성 실패' });
  }
});

function buildGeneratePrompt(topics: string[], language: string, count: number): string {
  return `시험 범위: ${topics.join(', ')}
프로그래밍 언어: ${language}
문제 수: ${count}개
문제당 배점: 10점

난이도 분포:
- Easy: 40%
- Medium: 40%
- Hard: 20%`;
}
```

### 시험 시작

```typescript
router.post('/:examId/start', async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;

  try {
    const exam = await getExam(examId);
    
    // 이미 응시했는지 확인
    const existing = await getAttempt(examId, userId);
    if (existing) {
      return res.status(400).json({ error: '이미 응시한 시험입니다' });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + exam.duration * 60 * 1000);

    // 응시 기록 생성
    const attempt = await createAttempt({
      examId,
      userId,
      startedAt: now,
      endsAt,
      status: 'in_progress'
    });

    // 문제 반환 (testCases, sampleAnswer 제외)
    const questions = exam.questions.map(q => ({
      id: q.id,
      order: q.order,
      difficulty: q.difficulty,
      points: q.points,
      title: q.title,
      description: q.description,
      requirements: q.requirements
    }));

    res.json({
      attemptId: attempt.id,
      examId,
      startedAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      questions
    });

  } catch (err) {
    res.status(500).json({ error: '시험 시작 실패' });
  }
});
```

### 답안 제출 및 채점

```typescript
router.post('/:examId/submit', async (req, res) => {
  const { examId } = req.params;
  const { attemptId, answers } = req.body;

  try {
    // 시간 확인
    const attempt = await getAttempt(attemptId);
    if (new Date() > new Date(attempt.endsAt)) {
      // 시간 초과여도 채점은 진행 (늦은 제출 표시)
    }

    const exam = await getExam(examId);
    
    // 각 문제 채점
    const questionResults = await Promise.all(
      answers.map(async (answer) => {
        const question = exam.questions.find(q => q.id === answer.questionId);
        return gradeQuestion(question, answer.code, exam.level);
      })
    );

    // 총점 계산
    const score = questionResults.reduce((sum, r) => sum + r.score, 0);
    const totalPoints = exam.totalPoints;
    const percentage = Math.round((score / totalPoints) * 100);
    const grade = calculateGrade(percentage);
    const timeTaken = Math.floor((new Date() - new Date(attempt.startedAt)) / 1000);

    // 결과 저장
    const result = await saveExamResult({
      examId,
      attemptId,
      userId: req.user.id,
      score,
      totalPoints,
      percentage,
      grade,
      timeTaken,
      questionResults
    });

    // 응시 상태 업데이트
    await updateAttempt(attemptId, { status: 'submitted' });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: '제출 실패' });
  }
});

async function gradeQuestion(question: ExamQuestion, code: string, level: string): Promise<QuestionResult> {
  // 1. 코드 실행
  const execResult = await executeCode(code, question.language);

  // 2. 테스트케이스 검증
  const testResults = question.testCases.map(tc => {
    const actualOutput = execResult.output?.trim() || '';
    const expectedOutput = tc.expectedOutput.trim();
    return {
      description: tc.description,
      passed: actualOutput === expectedOutput,
      expectedOutput,
      actualOutput,
      points: tc.points || Math.floor(question.points / question.testCases.length)
    };
  });

  const earnedPoints = testResults
    .filter(r => r.passed)
    .reduce((sum, r) => sum + r.points, 0);
  
  const score = Math.min(earnedPoints, question.points);
  const passed = score === question.points;

  // 3. 오답 해설 생성 (틀린 경우만)
  let feedback = '정확하게 풀었습니다!';
  if (!passed) {
    feedback = await generateFeedback(question, code, testResults, level);
  }

  return {
    questionId: question.id,
    score,
    maxPoints: question.points,
    passed,
    testResults,
    feedback
  };
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

async function generateFeedback(question, code, testResults, level): Promise<string> {
  const config = getModelConfig(level);
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });

  const failedTests = testResults.filter(r => !r.passed);
  
  const completion = await client.chat.completions.create({
    model: config.modelName,
    messages: [
      { role: 'system', content: EXAM_PROMPTS.feedback[level] },
      { role: 'user', content: `문제: ${question.title}
학습자 코드:
${code}

틀린 테스트케이스:
${failedTests.map(t => `- ${t.description}: 기대값 "${t.expectedOutput}", 실제값 "${t.actualOutput}"`).join('\n')}

힌트를 주세요. 답을 직접 알려주지 마세요.` }
    ]
  });

  return completion.choices[0].message.content;
}
```

### 수준별 프롬프트

```typescript
// apps/server/src/prompts/exam.ts

export const EXAM_PROMPTS = {
  generate: {
    beginner_zero: `프로그래밍을 처음 배우는 학습자를 위한 시험 문제를 만드세요.

규칙:
- Easy 60%, Medium 30%, Hard 10%
- 한 문제에 1-2개 개념만
- 테스트케이스 2-3개
- 문제 설명은 매우 친절하게

JSON 형식:
{
  "questions": [
    {
      "id": "q-1",
      "order": 1,
      "difficulty": "easy",
      "points": 10,
      "title": "문제 제목",
      "description": "문제 설명",
      "requirements": ["요구사항1", "요구사항2"],
      "testCases": [
        { "expectedOutput": "출력", "description": "설명", "points": 5 }
      ],
      "sampleAnswer": "정답 코드"
    }
  ]
}`,

    beginner: `프로그래밍 기초를 배우는 학습자를 위한 시험 문제를 만드세요.

규칙:
- Easy 40%, Medium 40%, Hard 20%
- 한 문제에 2-3개 개념
- 테스트케이스 3-5개
- 다양한 문제 유형

JSON 형식: (위와 동일)`,

    beginner_plus: `기본 문법을 아는 학습자를 위한 시험 문제를 만드세요.

규칙:
- Easy 20%, Medium 50%, Hard 30%
- 여러 개념 통합
- 테스트케이스 5-7개
- 실무와 유사한 시나리오

JSON 형식: (위와 동일)`
  },

  feedback: {
    beginner_zero: `학습자가 시험 문제를 틀렸습니다.

규칙:
- 정답을 직접 알려주지 마세요
- 어떤 부분이 틀렸는지 친절하게 설명
- 다시 공부할 방향 제시
- 격려의 말 포함`,

    beginner: `학습자가 시험 문제를 틀렸습니다.

규칙:
- 틀린 테스트케이스를 언급
- 어떤 개념을 다시 확인해야 하는지 안내
- 디버깅 방향 제시`,

    beginner_plus: `학습자가 시험 문제를 틀렸습니다.

규칙:
- 간결하게 틀린 부분 지적
- 관련 개념 언급`
  }
};
```

## 프론트엔드 구현

### 시험 응시 컴포넌트

```typescript
// apps/client/src/components/ExamTaker.tsx
import { useState, useEffect } from 'react';

interface Props {
  exam: Exam;
  attempt: ExamAttempt;
  onSubmit: (answers: Answer[]) => void;
}

export function ExamTaker({ exam, attempt, onSubmit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  // 타이머
  useEffect(() => {
    const endTime = new Date(attempt.endsAt).getTime();
    
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (questionId: string, code: string) => {
    setAnswers({ ...answers, [questionId]: code });
  };

  const handleSubmit = () => {
    const answerList = exam.questions.map(q => ({
      questionId: q.id,
      code: answers[q.id] || ''
    }));
    onSubmit(answerList);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const question = exam.questions[currentIndex];

  return (
    <div className="exam-taker">
      {/* 헤더 */}
      <div className="header">
        <h2>{exam.title}</h2>
        <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* 문제 네비게이션 */}
      <div className="nav">
        {exam.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`${i === currentIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 문제 */}
      <div className="question">
        <div className="question-header">
          <span>문제 {currentIndex + 1}</span>
          <span className={`difficulty ${question.difficulty}`}>
            {question.difficulty}
          </span>
          <span>{question.points}점</span>
        </div>

        <h3>{question.title}</h3>
        <p>{question.description}</p>

        <ul>
          {question.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>

      {/* 코드 에디터 */}
      <textarea
        value={answers[question.id] || ''}
        onChange={e => handleCodeChange(question.id, e.target.value)}
        placeholder="코드를 입력하세요"
      />

      {/* 버튼 */}
      <div className="footer">
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          이전
        </button>
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex === exam.questions.length - 1}
        >
          다음
        </button>
        <button onClick={handleSubmit} className="submit">
          제출
        </button>
      </div>
    </div>
  );
}
```

### 성적표 컴포넌트

```typescript
// apps/client/src/components/ExamResult.tsx

interface Props {
  result: ExamResult;
  exam: Exam;
}

export function ExamResult({ result, exam }: Props) {
  return (
    <div className="exam-result">
      {/* 총점 */}
      <div className="summary">
        <div className={`grade grade-${result.grade}`}>
          {result.grade}
        </div>
        <div className="score">
          {result.score} / {result.totalPoints}점 ({result.percentage}%)
        </div>
        <div className="time">
          소요 시간: {Math.floor(result.timeTaken / 60)}분 {result.timeTaken % 60}초
        </div>
      </div>

      {/* 문제별 결과 */}
      <div className="question-results">
        <h3>문제별 결과</h3>
        
        {result.questionResults.map((qr, i) => {
          const question = exam.questions.find(q => q.id === qr.questionId);
          
          return (
            <div key={qr.questionId} className={`question-result ${qr.passed ? 'passed' : 'failed'}`}>
              <div className="header">
                <span>문제 {i + 1}: {question?.title}</span>
                <span>{qr.score} / {qr.maxPoints}점</span>
              </div>

              {/* 테스트 결과 */}
              <div className="test-results">
                {qr.testResults.map((tr, j) => (
                  <div key={j} className={tr.passed ? 'passed' : 'failed'}>
                    {tr.passed ? 'O' : 'X'} {tr.description}
                  </div>
                ))}
              </div>

              {/* 피드백 */}
              <div className="feedback">
                {qr.feedback}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## UI

### 시험 응시

```
+------------------------------------------------------------------+
|  [1주차 평가]                              남은 시간: 25:30       |
+------------------------------------------------------------------+
|  [1] [2*] [3] [4] [5] [6] [7] [8] [9] [10]   (* = 답안 작성됨)    |
+------------------------------------------------------------------+
|                                                                  |
|  문제 2                                     [Medium]  10점        |
|  ----------------------------------------------------------------|
|  두 수를 더하는 함수를 작성하세요                                  |
|                                                                  |
|  요구사항:                                                        |
|  - 함수 이름: add                                                 |
|  - 매개변수: a, b                                                 |
|  - 반환값: a + b                                                  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  | function add(a, b) {                                       |  |
|  |   return a + b;                                            |  |
|  | }                                                          |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  [이전]                         [다음]              [제출]        |
+------------------------------------------------------------------+
```

### 성적표

```
+------------------------------------------------------------------+
|                         시험 결과                                  |
+------------------------------------------------------------------+
|                                                                  |
|                         [ B ]                                    |
|                                                                  |
|                   85 / 100점 (85%)                               |
|                   소요 시간: 25분 30초                             |
|                                                                  |
+------------------------------------------------------------------+
|  문제별 결과                                                       |
|  ----------------------------------------------------------------|
|                                                                  |
|  [O] 문제 1: 변수 선언하기                          10/10점        |
|      O 기본 출력 / O 값 확인                                       |
|      > 정확하게 풀었습니다!                                        |
|                                                                  |
|  [X] 문제 2: 조건문 작성하기                         5/10점        |
|      O 기본 케이스 / X 경계값 / X 음수                             |
|      > 비교 연산자를 확인해보세요.                                  |
|                                                                  |
+------------------------------------------------------------------+
```

## 데이터베이스 스키마

```sql
-- 시험
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  title VARCHAR(200) NOT NULL,
  topics JSONB NOT NULL,
  language VARCHAR(20) NOT NULL,
  level VARCHAR(20) NOT NULL,
  duration INT NOT NULL,
  total_points INT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  starts_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 시험 문제
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  order_num INT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  points INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  test_cases JSONB NOT NULL,
  sample_answer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 응시 기록
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'in_progress',
  UNIQUE(exam_id, user_id)
);

-- 시험 결과
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total_points INT NOT NULL,
  percentage INT NOT NULL,
  grade VARCHAR(1) NOT NULL,
  time_taken INT NOT NULL,
  question_results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_id, user_id)
);
```

## 파일 구조

```
apps/server/src/
├── routes/agent/
│   └── exam.ts            # 생성 + 시작 + 제출 API
├── prompts/
│   └── exam.ts            # 수준별 프롬프트
└── utils/
    └── codeExecutor.ts    # Piston 래퍼

apps/client/src/
└── components/
    ├── ExamTaker.tsx      # 응시 화면
    └── ExamResult.tsx     # 성적표
```

## 강사용 관리 기능

### 시험 관리 API

```
GET    /api/admin/exams              # 시험 목록
POST   /api/admin/exams              # 시험 생성
PUT    /api/admin/exams/:id          # 시험 수정
DELETE /api/admin/exams/:id          # 시험 삭제
POST   /api/admin/exams/:id/publish  # 시험 배포
GET    /api/admin/exams/:id/results  # 반 전체 성적
```

### 성적 통계 예시

```json
{
  "examId": "exam-001",
  "title": "1주차 평가",
  "statistics": {
    "totalStudents": 30,
    "submitted": 28,
    "averageScore": 72.5,
    "highestScore": 100,
    "lowestScore": 35,
    "gradeDistribution": {
      "A": 5,
      "B": 8,
      "C": 10,
      "D": 3,
      "F": 2
    }
  },
  "questionAnalysis": [
    {
      "questionId": "q-1",
      "title": "변수 선언하기",
      "averageScore": 9.2,
      "correctRate": 0.92
    },
    {
      "questionId": "q-2",
      "title": "조건문 작성하기",
      "averageScore": 6.5,
      "correctRate": 0.65
    }
  ]
}
```
