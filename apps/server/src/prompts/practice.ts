import type { LearnerLevel } from '../config/modelByLevel.js';

const OUTPUT_FORMAT_GUIDE = `
## 테스트케이스 출력 형식 규칙 (매우 중요!)
- expectedOutput은 실제 console.log/print 결과와 정확히 일치해야 합니다
- 여러 번의 console.log는 줄바꿈(\\n)으로 구분됩니다
- 예시:
  - console.log("사과"); console.log("바나나"); → expectedOutput: "사과\\n바나나"
  - console.log(1, 2, 3); → expectedOutput: "1 2 3"
  - for문으로 1,2,3 출력 → expectedOutput: "1\\n2\\n3"
- 배열 출력: console.log([1,2,3]) → expectedOutput: "[ 1, 2, 3 ]" 또는 "[1, 2, 3]"
- 객체 출력: 언어별 기본 형식 사용
- 빈 줄도 \\n으로 표현
- 마지막에 줄바꿈 없음`;

export const PRACTICE_PROMPTS = {
  generate: {
    beginner_zero: `프로그래밍을 처음 배우는 학습자를 위한 연습 문제를 만드세요.

규칙:
- 한 문제에 1개 개념만 다루세요
- 코드 2-5줄로 해결 가능해야 합니다
- 변수 이름, 초기값을 정확히 지정해주세요
- 힌트는 거의 답에 가깝게 친절하게
- 반드시 한국어로 작성하세요
- starterCode에 필요한 변수나 배열을 미리 선언해주세요

${OUTPUT_FORMAT_GUIDE}

JSON 형식으로 응답:
{
  "problems": [
    {
      "id": "prob-1",
      "order": 1,
      "difficulty": "easy",
      "title": "문제 제목",
      "description": "문제 설명 (출력 형식을 명확히 지정)",
      "requirements": ["요구사항1", "요구사항2"],
      "hints": ["힌트1(방향)", "힌트2(구체적)", "힌트3(거의 답)"],
      "starterCode": "// 시작 코드 (변수, 배열 등 미리 선언)\\nconst fruits = ['사과', '바나나', '오렌지'];\\n\\n// 여기에 코드를 작성하세요",
      "testCases": [
        { "input": "입력값 설명", "expectedOutput": "사과\\n바나나\\n오렌지", "description": "각 과일을 한 줄씩 출력" }
      ],
      "sampleAnswer": "// 정답 코드\\nfor (let i = 0; i < fruits.length; i++) {\\n  console.log(fruits[i]);\\n}"
    }
  ]
}`,

    beginner: `프로그래밍 기초를 배우는 학습자를 위한 연습 문제를 만드세요.

규칙:
- 한 문제에 2-3개 개념 조합 가능
- 코드 5-15줄로 해결 가능해야 합니다
- 출력 형식을 명확히 지정하세요
- 힌트는 방향 제시 위주로
- 반드시 한국어로 작성하세요
- starterCode에 필요한 변수나 데이터를 미리 선언해주세요

${OUTPUT_FORMAT_GUIDE}

JSON 형식으로 응답:
{
  "problems": [
    {
      "id": "prob-1",
      "order": 1,
      "difficulty": "easy",
      "title": "문제 제목",
      "description": "문제 설명 (출력 형식을 명확히 지정. 예: '각 숫자를 한 줄에 하나씩 출력하세요')",
      "requirements": ["요구사항1", "요구사항2"],
      "hints": ["힌트1(방향)", "힌트2(구체적)", "힌트3(거의 답)"],
      "starterCode": "// 시작 코드\\nconst numbers = [1, 2, 3, 4, 5];\\n\\n// 여기에 코드를 작성하세요",
      "testCases": [
        { "input": "numbers = [1,2,3,4,5]", "expectedOutput": "1\\n2\\n3\\n4\\n5", "description": "각 숫자를 한 줄씩 출력" }
      ],
      "sampleAnswer": "정답 코드"
    }
  ]
}`,

    beginner_plus: `기본 문법을 아는 학습자를 위한 연습 문제를 만드세요.

규칙:
- 여러 개념을 활용하는 문제 가능
- 코드 10-30줄 예상
- 실무와 비슷한 시나리오 제시
- 힌트는 최소한으로
- 반드시 한국어로 작성하세요
- starterCode에 필요한 데이터와 함수 시그니처를 제공하세요

${OUTPUT_FORMAT_GUIDE}

JSON 형식으로 응답:
{
  "problems": [
    {
      "id": "prob-1",
      "order": 1,
      "difficulty": "medium",
      "title": "문제 제목",
      "description": "문제 설명 (입출력 형식을 명확히 지정)",
      "requirements": ["요구사항1", "요구사항2"],
      "hints": ["힌트1(방향)", "힌트2(구체적)", "힌트3(거의 답)"],
      "starterCode": "// 시작 코드\\nfunction solution(data) {\\n  // 여기에 코드를 작성하세요\\n}\\n\\n// 테스트\\nconst testData = [...];\\nconsole.log(solution(testData));",
      "testCases": [
        { "input": "입력값 설명", "expectedOutput": "기대 출력", "description": "테스트 설명" }
      ],
      "sampleAnswer": "정답 코드"
    }
  ]
}`
  } as Record<LearnerLevel, string>,

  feedback: {
    beginner_zero: `학습자가 연습 문제를 풀었습니다.

규칙:
- 맞으면 크게 칭찬하세요
- 틀려도 격려하세요
- 어디가 틀렸는지 친절하게 알려주세요
- 답을 직접 알려주지 마세요
- 반드시 한국어로 응답하세요`,

    beginner: `학습자가 연습 문제를 풀었습니다.

규칙:
- 맞으면 구체적으로 칭찬
- 틀리면 어느 부분이 틀렸는지 안내
- 개선 방향 제시
- 반드시 한국어로 응답하세요`,

    beginner_plus: `학습자가 연습 문제를 풀었습니다.

규칙:
- 간결하게 결과 전달
- 틀린 부분에 대한 디버깅 힌트
- 더 나은 풀이 방법 제안
- 반드시 한국어로 응답하세요`
  } as Record<LearnerLevel, string>
};

export function buildGeneratePrompt(
  topic: string,
  language: string,
  count: number
): string {
  const langOutputNote = language === 'python'
    ? '- Python에서 print()는 자동으로 줄바꿈됩니다. 여러 print문의 출력은 \\n으로 구분하세요.'
    : '- JavaScript/TypeScript에서 console.log()는 자동으로 줄바꿈됩니다. 여러 console.log의 출력은 \\n으로 구분하세요.';

  return `주제: ${topic}
프로그래밍 언어: ${language}
문제 수: ${count}개

${langOutputNote}

중요:
- testCases의 expectedOutput은 실제 코드 실행 결과와 정확히 일치해야 합니다
- starterCode를 반드시 제공하여 학습자가 바로 코드를 작성할 수 있게 하세요
- sampleAnswer를 실행하면 expectedOutput과 정확히 같은 결과가 나와야 합니다

위 조건에 맞는 연습 문제를 JSON 형식으로 생성해주세요.`;
}

export function buildFeedbackPrompt(
  problemTitle: string,
  problemDescription: string,
  code: string,
  passed: boolean,
  failedTests: string[]
): string {
  if (passed) {
    return `학습자가 문제를 맞혔습니다. 칭찬해주세요.

문제: ${problemTitle}
설명: ${problemDescription}

학습자 코드:
\`\`\`
${code}
\`\`\``;
  } else {
    return `학습자가 문제를 틀렸습니다. 힌트를 주세요 (답은 알려주지 마세요).

문제: ${problemTitle}
설명: ${problemDescription}

학습자 코드:
\`\`\`
${code}
\`\`\`

틀린 테스트케이스: ${failedTests.join(', ')}`;
  }
}
