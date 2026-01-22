# Code Mentor Agent (코드 멘토)

## 개요

학습자가 작성한 코드가 정상 실행되었을 때 더 나은 코드 작성법을 안내하는 에이전트.

- **복잡도**: LLM 1회 호출
- **예상 구현 시간**: 2-3일

## 핵심 가치

- 동작하는 코드와 좋은 코드의 차이 인식
- 초보 단계에서 좋은 습관 형성
- 칭찬과 개선점을 균형있게 제공

## Debug Buddy와의 차이

| 구분 | Debug Buddy | Code Mentor |
|------|-------------|-------------|
| 트리거 | 에러 발생 시 | 실행 성공 시 |
| 목적 | 에러 해결 | 코드 품질 향상 |
| 톤 | 문제 해결 | 칭찬 + 개선 제안 |

## 동작 흐름

```
학습자 코드 작성
    ↓
[실행] 버튼 클릭
    ↓
Piston API 실행 성공
    ↓
[Code Mentor] 버튼 활성화
    ↓
클릭 시 LLM 호출 (수준별 프롬프트)
    ↓
SSE 스트리밍 응답
```

## API

### 엔드포인트

```
POST /api/agent/code-mentor
```

### 요청

```typescript
interface CodeMentorRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  output: string;
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
  topic?: string;
}
```

### 응답 (SSE 스트리밍)

```
data: {"content":"잘"}\n\n
data: {"content":"했"}\n\n
...
data: [DONE]\n\n
```

## 백엔드 구현

### 라우트

```typescript
// apps/server/src/routes/agent/codeMentor.ts
import { Router } from 'express';
import OpenAI from 'openai';
import { getModelConfig } from '../../config/modelByLevel';
import { CODE_MENTOR_PROMPTS } from '../../prompts/codeMentor';

const router = Router();

router.post('/code-mentor', async (req, res) => {
  const { code, language, output, level, topic } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const config = getModelConfig(level);
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });

    const stream = await client.chat.completions.create({
      model: config.modelName,
      messages: [
        { role: 'system', content: CODE_MENTOR_PROMPTS[level] },
        { role: 'user', content: buildUserPrompt(code, language, output, topic) }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: '처리 실패' })}\n\n`);
    res.end();
  }
});

function buildUserPrompt(code: string, language: string, output: string, topic?: string): string {
  return `현재 학습 주제: ${topic || '일반'}
프로그래밍 언어: ${language}

학습자가 작성한 코드:
\`\`\`${language}
${code}
\`\`\`

실행 결과:
\`\`\`
${output}
\`\`\`

코드가 정상 동작합니다. 이 코드를 리뷰하고 개선점을 제안해주세요.`;
}

export default router;
```

### 수준별 프롬프트

```typescript
// apps/server/src/prompts/codeMentor.ts

export const CODE_MENTOR_PROMPTS = {
  beginner_zero: `당신은 Code Mentor입니다. 프로그래밍을 처음 배우는 학습자의 코드를 리뷰합니다.

규칙:
- 코드가 동작한다는 것을 크게 칭찬하세요
- 개선점은 딱 1개만 제안하세요
- 변수 이름 개선 정도만 언급하세요
- 복잡한 개념은 언급하지 마세요

형식:
1. 칭찬 (코드 동작 + 잘한 점)
2. 팁 1개 (아주 간단한 것)
3. 격려 한마디

예시:
"와! 코드가 잘 동작하네요!
한 가지 팁: 변수 이름 x 대신 age라고 쓰면 나중에 코드를 다시 볼 때 바로 알 수 있어요.
계속 이렇게 하면 금방 프로 개발자가 될 거예요!"`,

  beginner: `당신은 Code Mentor입니다. 프로그래밍 기초를 배우는 학습자의 코드를 리뷰합니다.

규칙:
- 잘한 점을 먼저 언급하세요
- 개선점은 2-3개까지만 제안하세요
- let vs const, 네이밍, 코드 구조를 봐주세요
- 왜 그렇게 하면 좋은지 이유를 설명하세요

형식:
1. 칭찬 (구체적으로 뭘 잘했는지)
2. 개선점 2-3개
3. 각 개선점에 대한 이유
4. 마무리 격려

예시:
"코드가 잘 동작하네요! 몇 가지 개선하면 더 좋을 것 같아요.

1. const 사용: age는 변하지 않으니까 let 대신 const를 쓰면 좋아요.
2. 변수 이름: x보다 age가 더 명확해요.

이렇게 하면 다른 사람이 봐도 이해하기 쉬운 코드가 됩니다!"`,

  beginner_plus: `당신은 Code Mentor입니다. 기본 문법을 아는 학습자의 코드를 리뷰합니다.

규칙:
- 잘한 점은 간결하게 인정
- 실무 패턴과 베스트 프랙티스를 제안하세요
- Before/After 예시를 보여주세요
- 함수형 프로그래밍, 클린 코드 원칙을 언급하세요

형식:
1. 간단한 칭찬
2. 개선점 2-3개 (실무 관점)
3. 리팩토링 예시 (Before -> After)

예시:
"잘 동작해요! 더 발전시킬 수 있는 부분:

1. map 사용: forEach로 새 배열 만드는 대신 map이 더 간결해요.

Before:
const result = [];
arr.forEach(x => result.push(x * 2));

After:
const result = arr.map(x => x * 2);

함수형 프로그래밍의 기본이니 익혀두면 좋습니다!"`
};
```

## 프론트엔드 구현

### 컴포넌트

```typescript
// apps/client/src/components/CodeMentor.tsx
import { useState } from 'react';

interface Props {
  code: string;
  language: string;
  output: string;
  level: string;
  topic?: string;
}

export function CodeMentor({ code, language, output, level, topic }: Props) {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askReview = async () => {
    setIsLoading(true);
    setResponse('');

    const res = await fetch('/api/agent/code-mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, output, level, topic })
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const { content } = JSON.parse(line.slice(6));
            if (content) setResponse(prev => prev + content);
          } catch {}
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="code-mentor">
      <button onClick={askReview} disabled={isLoading}>
        {isLoading ? '리뷰 중...' : 'Code Mentor 리뷰받기'}
      </button>

      {response && (
        <div className="response">
          <strong>Code Mentor</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
```

### 코드 에디터 통합

```typescript
// apps/client/src/components/CodeEditor.tsx
import { DebugBuddy } from './DebugBuddy';
import { CodeMentor } from './CodeMentor';

export function CodeEditor({ level, topic }: { level: string; topic?: string }) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const executeCode = async () => {
    const result = await fetch('/api/code/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language: 'javascript' })
    }).then(r => r.json());

    setOutput(result.output || '');
    setError(result.error || '');
  };

  return (
    <div>
      <textarea value={code} onChange={e => setCode(e.target.value)} />
      <button onClick={executeCode}>실행</button>

      {/* 실행 성공 시 Code Mentor */}
      {output && !error && (
        <>
          <pre>{output}</pre>
          <CodeMentor
            code={code}
            language="javascript"
            output={output}
            level={level}
            topic={topic}
          />
        </>
      )}
      
      {/* 에러 시 Debug Buddy */}
      {error && (
        <>
          <pre className="error">{error}</pre>
          <DebugBuddy
            code={code}
            language="javascript"
            error={error}
            level={level}
            topic={topic}
          />
        </>
      )}
    </div>
  );
}
```

## UI

```
+--------------------------------------------------+
|      코드 에디터              |                   |
|      [JS v] [실행]           |                   |
|      -------------------     |                   |
|  1 | let x = 10             |                   |
|  2 | let y = 20             |                   |
|  3 | console.log(x + y)     |                   |
|      -------------------     |                   |
|                              |                   |
|  [실행 결과]                  |                   |
|  30                          |                   |
|                              |                   |
|  [Code Mentor 리뷰받기]       |                   |
|                              |                   |
|  +------------------------+  |                   |
|  | Code Mentor            |  |                   |
|  |------------------------|  |                   |
|  | 잘했어요! 두 개의 변수를 |  |                   |
|  | 만들고 더하기까지       |  |                   |
|  | 성공했네요!             |  |                   |
|  |                        |  |                   |
|  | 팁 하나: x, y보다       |  |                   |
|  | appleCount, orangeCount |  |                   |
|  | 처럼 의미있는 이름을    |  |                   |
|  | 쓰면 더 좋아요!         |  |                   |
|  +------------------------+  |                   |
+--------------------------------------------------+
```

## 리뷰 기준

### 수준별 리뷰 포인트

| 수준 | 리뷰 포인트 |
|------|------------|
| 초초보 | 변수 이름 (x -> age) |
| 초보 | let vs const, 네이밍, 코드 구조 |
| 조금아는초보 | 함수형 패턴, 에러 처리, 재사용성 |

### 공통 체크리스트

- [ ] 변수 이름이 의미있는가?
- [ ] const/let 적절히 사용했는가?
- [ ] 불필요한 코드가 없는가?
- [ ] 들여쓰기가 일관적인가?

## 파일 구조

```
apps/server/src/
├── routes/agent/
│   └── codeMentor.ts      # API 라우트
└── prompts/
    └── codeMentor.ts      # 수준별 프롬프트

apps/client/src/
└── components/
    ├── CodeMentor.tsx     # Code Mentor 컴포넌트
    └── CodeEditor.tsx     # 에디터 통합 (Debug Buddy + Code Mentor)
```

## 테스트 시나리오

### 시나리오 1: 변수 네이밍 (초초보)

```javascript
// 코드
let x = 10
let y = 20
console.log(x + y)

// 출력
30

// 기대 응답
"잘했어요! 변수 두 개 만들고 더하기까지 성공했네요!

팁 하나: x, y 대신 appleCount, orangeCount처럼 
이름을 지으면 나중에 봐도 뭔지 바로 알 수 있어요."
```

### 시나리오 2: let vs const (초보)

```javascript
// 코드
let name = "철수"
let age = 25
console.log(name + "는 " + age + "살입니다")

// 출력
철수는 25살입니다

// 기대 응답
"코드가 잘 동작하네요!

개선 포인트:
1. const 사용: name과 age가 바뀌지 않으니까 let 대신 const를 쓰면 좋아요.
2. 템플릿 리터럴: 백틱을 쓰면 더 읽기 쉬워요.
   -> console.log(\`${name}는 ${age}살입니다\`)"
```

### 시나리오 3: 함수형 패턴 (조금아는초보)

```javascript
// 코드
const numbers = [1, 2, 3, 4, 5]
const doubled = []
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2)
}
console.log(doubled)

// 출력
[2, 4, 6, 8, 10]

// 기대 응답
"잘 동작해요! 더 나은 방법:

map()을 쓰면 같은 작업을 한 줄로 할 수 있어요.

Before:
const doubled = []
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2)
}

After:
const doubled = numbers.map(n => n * 2)"
```

## Debug Buddy + Code Mentor 통합 흐름

```
코드 실행
    ↓
에러 발생? ──Yes──> Debug Buddy
    │
    No
    ↓
Code Mentor
```
