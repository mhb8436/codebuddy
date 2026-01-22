# Debug Buddy Agent (디버그 버디)

## 개요

학습자가 코드 실행 중 에러를 만났을 때 수준별 맞춤 도움을 제공하는 에이전트.

- **복잡도**: LLM 1회 호출
- **예상 구현 시간**: 2-3일

## 핵심 가치

- 에러 발생 시 학습 포기 방지
- 에러 메시지를 학습자 수준에 맞게 번역
- 답을 직접 주지 않고 해결 방향 제시

## 동작 흐름

```
학습자 코드 작성
    ↓
[실행] 버튼 클릭
    ↓
Piston API 실행
    ↓
에러 발생 (stderr)
    ↓
[Debug Buddy] 버튼 활성화
    ↓
클릭 시 LLM 호출 (수준별 프롬프트)
    ↓
SSE 스트리밍 응답
```

## API

### 엔드포인트

```
POST /api/agent/debug-buddy
```

### 요청

```typescript
interface DebugBuddyRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  error: string;
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
  topic?: string;  // 현재 학습 주제
}
```

### 응답 (SSE 스트리밍)

```
data: {"content":"컴"}\n\n
data: {"content":"퓨"}\n\n
data: {"content":"터"}\n\n
...
data: [DONE]\n\n
```

## 백엔드 구현

### 라우트

```typescript
// apps/server/src/routes/agent/debugBuddy.ts
import { Router } from 'express';
import OpenAI from 'openai';
import { getModelConfig } from '../../config/modelByLevel';
import { DEBUG_BUDDY_PROMPTS } from '../../prompts/debugBuddy';

const router = Router();

router.post('/debug-buddy', async (req, res) => {
  const { code, language, error, level, topic } = req.body;

  // SSE 헤더
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
        { role: 'system', content: DEBUG_BUDDY_PROMPTS[level] },
        { role: 'user', content: buildUserPrompt(code, language, error, topic) }
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

function buildUserPrompt(code: string, language: string, error: string, topic?: string): string {
  return `현재 학습 주제: ${topic || '일반'}
프로그래밍 언어: ${language}

학습자가 작성한 코드:
\`\`\`${language}
${code}
\`\`\`

발생한 에러:
\`\`\`
${error}
\`\`\`

이 에러를 학습자가 이해하고 스스로 해결할 수 있도록 도와주세요.`;
}

export default router;
```

### 수준별 프롬프트

```typescript
// apps/server/src/prompts/debugBuddy.ts

export const DEBUG_BUDDY_PROMPTS = {
  beginner_zero: `당신은 Debug Buddy입니다. 프로그래밍을 처음 배우는 학습자를 돕습니다.

규칙:
- 에러 메시지를 일상 언어로 번역하세요
- 비유를 사용해서 설명하세요
- 한 번에 하나의 문제만 지적하세요
- 어디를 봐야 하는지 구체적으로 알려주세요
- 답을 직접 주지 말고 방향만 제시하세요
- 격려의 말을 포함하세요

예시:
"ReferenceError: x is not defined"
-> "컴퓨터가 'x'라는 이름을 찾고 있는데, 아직 그 이름을 만들어주지 않았어요. 
   변수를 먼저 만들어야 사용할 수 있답니다. 
   혹시 let이나 const로 x를 만드는 코드가 있는지 확인해볼까요?"`,

  beginner: `당신은 Debug Buddy입니다. 프로그래밍 기초를 배우는 학습자를 돕습니다.

규칙:
- 에러 유형과 의미를 설명하세요
- 에러가 발생한 라인을 알려주세요
- 확인해볼 포인트를 제시하세요
- 답을 직접 주지 말고 방향을 제시하세요

예시:
"ReferenceError: x is not defined"
-> "ReferenceError는 존재하지 않는 변수를 사용할 때 발생해요.
   3번째 줄에서 x를 사용하고 있는데, 그 전에 x를 선언했는지 확인해보세요.
   변수 이름에 오타가 있을 수도 있어요."`,

  beginner_plus: `당신은 Debug Buddy입니다. 기본 문법을 아는 학습자를 돕습니다.

규칙:
- 에러 메시지 해석을 유도하세요
- 디버깅 방법을 알려주세요
- 관련 심화 개념을 언급하세요
- 스스로 해결하도록 유도하세요

예시:
"ReferenceError: x is not defined"
-> "ReferenceError입니다. 스코프를 확인해보세요.
   x가 선언된 위치와 사용하는 위치의 스코프가 다를 수 있어요.
   console.log로 변수 존재 여부를 확인해보는 것도 좋은 디버깅 방법입니다."`
};
```

### 모델 설정

```typescript
// apps/server/src/config/modelByLevel.ts

export type LearnerLevel = 'beginner_zero' | 'beginner' | 'beginner_plus';

interface ModelConfig {
  baseURL: string;
  apiKey: string;
  modelName: string;
}

export function getModelConfig(level: LearnerLevel): ModelConfig {
  const configs: Record<LearnerLevel, ModelConfig> = {
    // 초초보: Claude (설명력 최우선)
    beginner_zero: {
      baseURL: process.env.AZURE_AI_ENDPOINT!,
      apiKey: process.env.AZURE_AI_API_KEY!,
      modelName: 'claude-sonnet-4-5'
    },
    // 초보: GPT-4o-mini (가성비)
    beginner: {
      baseURL: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      modelName: 'gpt-4o-mini'
    },
    // 조금아는초보: GPT-4o-mini (빠른 응답)
    beginner_plus: {
      baseURL: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      modelName: 'gpt-4o-mini'
    }
  };

  return configs[level];
}
```

## 프론트엔드 구현

### 컴포넌트

```typescript
// apps/client/src/components/DebugBuddy.tsx
import { useState } from 'react';

interface Props {
  code: string;
  language: string;
  error: string;
  level: string;
  topic?: string;
}

export function DebugBuddy({ code, language, error, level, topic }: Props) {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askHelp = async () => {
    setIsLoading(true);
    setResponse('');

    const res = await fetch('/api/agent/debug-buddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, error, level, topic })
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
    <div className="debug-buddy">
      <button onClick={askHelp} disabled={isLoading}>
        {isLoading ? '분석 중...' : 'Debug Buddy 도움받기'}
      </button>

      {response && (
        <div className="response">
          <strong>Debug Buddy</strong>
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

      {output && <pre>{output}</pre>}
      
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
|  2 | console.log(y)         |                   |
|      -------------------     |                   |
|                              |                   |
|  [에러 출력]                  |                   |
|  ReferenceError:             |                   |
|  y is not defined            |                   |
|                              |                   |
|  [Debug Buddy 도움받기]       |                   |
|                              |                   |
|  +------------------------+  |                   |
|  | Debug Buddy            |  |                   |
|  |------------------------|  |                   |
|  | 컴퓨터가 'y'라는 이름을 |  |                   |
|  | 찾고 있는데, 아직       |  |                   |
|  | 만들어주지 않았어요.    |  |                   |
|  |                        |  |                   |
|  | 2번째 줄을 보세요.      |  |                   |
|  | y를 출력하려고 하는데   |  |                   |
|  | x는 만들었지만 y는      |  |                   |
|  | 없네요!                 |  |                   |
|  +------------------------+  |                   |
+--------------------------------------------------+
```

## 주요 에러 패턴

### JavaScript/TypeScript

| 에러 | 흔한 원인 | 힌트 방향 |
|------|----------|----------|
| SyntaxError | 괄호, 따옴표 누락 | 짝 확인 유도 |
| ReferenceError | 미선언 변수 | 선언 여부, 오타 확인 |
| TypeError | 잘못된 타입 연산 | 변수 값 확인 유도 |

### Python

| 에러 | 흔한 원인 | 힌트 방향 |
|------|----------|----------|
| IndentationError | 들여쓰기 불일치 | 탭/스페이스 확인 |
| NameError | 미선언 변수 | 선언 여부, 오타 확인 |
| TypeError | 타입 불일치 | 변수 타입 확인 |

## 파일 구조

```
apps/server/src/
├── routes/agent/
│   └── debugBuddy.ts      # API 라우트
├── prompts/
│   └── debugBuddy.ts      # 수준별 프롬프트
└── config/
    └── modelByLevel.ts    # 모델 설정

apps/client/src/
└── components/
    ├── DebugBuddy.tsx     # Debug Buddy 컴포넌트
    └── CodeEditor.tsx     # 에디터 통합
```

## 테스트 시나리오

### 시나리오 1: 미선언 변수 (초초보)

```javascript
// 코드
let x = 10
console.log(y)

// 에러
ReferenceError: y is not defined

// 기대 응답
"컴퓨터가 'y'를 찾고 있는데 없대요. 
1번 줄에서 x는 만들었는데 y는 안 만들었네요.
혹시 x를 출력하고 싶었던 건 아닐까요?"
```

### 시나리오 2: 문법 오류 (초보)

```javascript
// 코드
if (x > 5 {
  console.log("big")
}

// 에러
SyntaxError: Unexpected token '{'

// 기대 응답
"SyntaxError는 문법 오류에요.
2번째 줄의 if문 조건 괄호를 확인해보세요.
괄호가 제대로 닫혔는지 확인해볼까요?"
```
