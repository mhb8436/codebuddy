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
- 마지막에 줄바꿈 없음`;

export const EXAM_PROMPTS = {
  generate: {
    beginner_zero: `프로그래밍을 처음 배우는 학습자를 위한 시험 문제를 만드세요.

규칙:
- Easy 60%, Medium 30%, Hard 10%
- 한 문제에 1-2개 개념만
- 테스트케이스 2-3개
- 문제 설명은 매우 친절하게
- 반드시 한국어로 작성하세요
- starterCode에 필요한 변수나 배열을 미리 선언해주세요

${OUTPUT_FORMAT_GUIDE}

JSON 형식으로 응답:
{
  "questions": [
    {
      "id": "q-1",
      "order": 1,
      "difficulty": "easy",
      "points": 10,
      "title": "문제 제목",
      "description": "문제 설명 (출력 형식을 명확히 지정)",
      "requirements": ["요구사항1", "요구사항2"],
      "starterCode": "// 시작 코드\\nconst numbers = [1, 2, 3];\\n\\n// 여기에 코드를 작성하세요",
      "testCases": [
        { "input": "입력값 설명", "expectedOutput": "1\\n2\\n3", "description": "각 숫자를 한 줄씩 출력", "points": 5 }
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
- 반드시 한국어로 작성하세요
- starterCode에 필요한 변수나 데이터를 미리 선언해주세요

${OUTPUT_FORMAT_GUIDE}

JSON 형식으로 응답:
{
  "questions": [
    {
      "id": "q-1",
      "order": 1,
      "difficulty": "easy",
      "points": 10,
      "title": "문제 제목",
      "description": "문제 설명 (출력 형식을 명확히 지정. 예: '각 결과를 한 줄에 하나씩 출력하세요')",
      "requirements": ["요구사항1", "요구사항2"],
      "starterCode": "// 시작 코드\\nconst data = [...];\\n\\n// 여기에 코드를 작성하세요",
      "testCases": [
        { "input": "data = [1,2,3]", "expectedOutput": "기대출력", "description": "설명", "points": 3 }
      ],
      "sampleAnswer": "정답 코드"
    }
  ]
}`,

    beginner_plus: `기본 문법을 아는 학습자를 위한 시험 문제를 만드세요.

규칙:
- Easy 20%, Medium 50%, Hard 30%
- 여러 개념 통합
- 테스트케이스 5-7개
- 실무와 유사한 시나리오
- 반드시 한국어로 작성하세요
- starterCode에 함수 시그니처와 테스트 데이터를 제공하세요

${OUTPUT_FORMAT_GUIDE}

JSON 형식으로 응답:
{
  "questions": [
    {
      "id": "q-1",
      "order": 1,
      "difficulty": "medium",
      "points": 10,
      "title": "문제 제목",
      "description": "문제 설명 (입출력 형식을 명확히 지정)",
      "requirements": ["요구사항1", "요구사항2"],
      "starterCode": "// 시작 코드\\nfunction solution(input) {\\n  // 여기에 코드를 작성하세요\\n}\\n\\nconsole.log(solution(testInput));",
      "testCases": [
        { "input": "입력값 설명", "expectedOutput": "기대출력", "description": "설명", "points": 2 }
      ],
      "sampleAnswer": "정답 코드"
    }
  ]
}`
  } as Record<LearnerLevel, string>,

  feedback: {
    beginner_zero: `학습자가 시험 문제를 틀렸습니다.

규칙:
- 정답을 직접 알려주지 마세요
- 어떤 부분이 틀렸는지 친절하게 설명
- 다시 공부할 방향 제시
- 격려의 말 포함
- 반드시 한국어로 응답하세요`,

    beginner: `학습자가 시험 문제를 틀렸습니다.

규칙:
- 틀린 테스트케이스를 언급
- 어떤 개념을 다시 확인해야 하는지 안내
- 디버깅 방향 제시
- 반드시 한국어로 응답하세요`,

    beginner_plus: `학습자가 시험 문제를 틀렸습니다.

규칙:
- 간결하게 틀린 부분 지적
- 관련 개념 언급
- 반드시 한국어로 응답하세요`
  } as Record<LearnerLevel, string>
};

export function buildExamGeneratePrompt(
  topics: string[],
  language: string,
  questionCount: number
): string {
  const langOutputNote = language === 'python'
    ? '- Python에서 print()는 자동으로 줄바꿈됩니다. 여러 print문의 출력은 \\n으로 구분하세요.'
    : '- JavaScript/TypeScript에서 console.log()는 자동으로 줄바꿈됩니다. 여러 console.log의 출력은 \\n으로 구분하세요.';

  return `시험 범위: ${topics.join(', ')}
프로그래밍 언어: ${language}
문제 수: ${questionCount}개
문제당 배점: 10점

${langOutputNote}

중요:
- testCases의 expectedOutput은 실제 코드 실행 결과와 정확히 일치해야 합니다
- starterCode를 반드시 제공하여 학습자가 바로 코드를 작성할 수 있게 하세요
- sampleAnswer를 실행하면 expectedOutput과 정확히 같은 결과가 나와야 합니다

난이도 분포에 맞게 문제를 생성해주세요.`;
}

export function buildExamFeedbackPrompt(
  questionTitle: string,
  questionDescription: string,
  code: string,
  failedTests: { description: string; expectedOutput: string; actualOutput: string }[]
): string {
  return `문제: ${questionTitle}
설명: ${questionDescription}

학습자 코드:
\`\`\`
${code}
\`\`\`

틀린 테스트케이스:
${failedTests.map(t => `- ${t.description}: 기대값 "${t.expectedOutput}", 실제값 "${t.actualOutput}"`).join('\n')}

힌트를 주세요. 답을 직접 알려주지 마세요.`;
}

export function calculateGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
