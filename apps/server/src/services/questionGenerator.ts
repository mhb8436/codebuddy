import { getModelConfig, type LearnerLevel } from '../config/modelByLevel.js';
import { createLLMClient } from './llmClient.js';
import { questionBankRepository, questionGenerationJobRepository } from '../db/repositories/questionBankRepository.js';
import * as curriculumService from './curriculumService.js';

interface GeneratedQuestion {
  title: string;
  description: string;
  requirements: string[];
  testCases: {
    description: string;
    expectedOutput: string;
    points: number;
    input?: string;
  }[];
  sampleAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

const QUESTION_BANK_SYSTEM_PROMPT = `당신은 프로그래밍 교육용 문제 출제 전문가입니다.
주어진 토픽에 대해 학습자 수준에 맞는 코딩 문제를 생성합니다.

문제 출제 원칙:
1. 실제로 코드를 작성하고 실행할 수 있는 문제여야 합니다
2. 테스트 케이스는 구체적인 입출력 예시를 포함해야 합니다
3. 난이도에 따라 문제 복잡도를 조절합니다:
   - easy: 기본 개념을 확인하는 간단한 문제 (1-2개 개념)
   - medium: 여러 개념을 조합하는 문제 (2-3개 개념)
   - hard: 응용력이 필요한 문제 (3개 이상 개념 또는 알고리즘 응용)
4. 문제 설명은 학습자가 이해하기 쉽게 작성합니다
5. 요구사항은 명확하고 구체적이어야 합니다

응답 형식은 반드시 JSON으로:
{
  "questions": [
    {
      "title": "문제 제목",
      "description": "문제 설명 (충분히 상세하게)",
      "requirements": ["요구사항1", "요구사항2"],
      "testCases": [
        {
          "description": "테스트 설명",
          "expectedOutput": "기대 출력값",
          "points": 5,
          "input": "입력값 (있는 경우)"
        }
      ],
      "sampleAnswer": "// 샘플 정답 코드",
      "difficulty": "easy|medium|hard",
      "points": 10
    }
  ]
}`;

function buildGeneratePrompt(
  topicName: string,
  language: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number,
  curriculumContext?: string,
  existingTitles?: string[]
): string {
  const difficultyDescriptions = {
    easy: '쉬운 난이도 - 기본 개념을 확인하는 간단한 문제',
    medium: '보통 난이도 - 여러 개념을 조합하는 문제',
    hard: '어려운 난이도 - 응용력이 필요한 문제',
  };

  let prompt = `토픽: ${topicName}
언어: ${language}
난이도: ${difficultyDescriptions[difficulty]}
문제 수: ${count}개

${count}개의 ${difficulty} 난이도 문제를 생성해주세요.
각 문제는 서로 다른 측면을 다루어야 합니다.`;

  if (curriculumContext) {
    prompt += `\n\n참고 커리큘럼 내용:\n${curriculumContext}`;
  }

  // 기존 문제와 중복 방지
  if (existingTitles && existingTitles.length > 0) {
    prompt += `\n\n⚠️ 중요: 아래 기존 문제들과 중복되지 않는 새로운 문제를 생성해주세요.
기존에 출제된 문제 목록 (${existingTitles.length}개):
${existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

위 문제들과 다른 관점, 다른 상황, 다른 유형의 문제를 만들어주세요.`;
  }

  return prompt;
}

/**
 * 백그라운드에서 문제 생성 작업 처리
 */
export async function processGenerationJob(jobId: string): Promise<void> {
  console.log(`[QuestionGenerator] Starting job ${jobId}`);

  // 작업 상태를 in_progress로 변경
  await questionGenerationJobRepository.updateStatus(jobId, 'in_progress');

  try {
    const job = await questionGenerationJobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const { language, track_id, topic_id, topic_name, difficulty_config, created_by } = job;

    // 커리큘럼 컨텍스트 가져오기
    const curriculumContext = await curriculumService.getTopicContext(language, track_id, topic_id);

    // LLM 클라이언트 설정 (beginner_zero 레벨 - Claude 사용)
    const config = getModelConfig('beginner_zero');
    if (!config.apiKey || !config.baseURL) {
      throw new Error('LLM API configuration is missing');
    }

    const client = createLLMClient(config);

    // 기존 문제 목록 조회 (중복 방지용)
    const existingQuestions = await questionBankRepository.findByTopic(language, track_id, topic_id);
    const existingTitles = existingQuestions.map(q => q.title);

    if (existingTitles.length > 0) {
      console.log(`[QuestionGenerator] Found ${existingTitles.length} existing questions for deduplication`);
    }

    // 난이도별로 문제 생성
    const allQuestions: Array<GeneratedQuestion & { difficulty: 'easy' | 'medium' | 'hard' }> = [];

    for (const [difficulty, count] of Object.entries(difficulty_config) as [
      'easy' | 'medium' | 'hard',
      number
    ][]) {
      if (!count || count <= 0) continue;

      console.log(`[QuestionGenerator] Generating ${count} ${difficulty} questions for ${topic_name}`);

      const userPrompt = buildGeneratePrompt(
        topic_name,
        language,
        difficulty,
        count,
        curriculumContext || undefined,
        existingTitles
      );

      try {
        const completion = await client.chat.completions.create({
          model: config.modelName,
          messages: [
            { role: 'system', content: QUESTION_BANK_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          console.error(`[QuestionGenerator] No content returned for ${difficulty} questions`);
          continue;
        }

        const parsed = JSON.parse(content);
        const questions = (parsed.questions || []) as GeneratedQuestion[];

        for (const q of questions) {
          allQuestions.push({
            ...q,
            difficulty,
            points: q.points || getDefaultPoints(difficulty),
          });
        }
      } catch (err) {
        console.error(`[QuestionGenerator] Error generating ${difficulty} questions:`, err);
        // 부분 실패는 계속 진행
      }
    }

    if (allQuestions.length === 0) {
      throw new Error('No questions were generated');
    }

    // 문제 은행에 저장
    const questionsToSave = allQuestions.map((q) => ({
      language,
      trackId: track_id,
      topicId: topic_id,
      difficulty: q.difficulty,
      points: q.points,
      title: q.title,
      description: q.description,
      requirements: q.requirements || [],
      testCases: q.testCases || [],
      sampleAnswer: q.sampleAnswer || '',
      createdBy: created_by,
      status: 'pending' as const,
    }));

    await questionBankRepository.createMany(questionsToSave);

    console.log(`[QuestionGenerator] Job ${jobId} completed: ${allQuestions.length} questions saved`);

    // 작업 완료
    await questionGenerationJobRepository.updateStatus(jobId, 'completed');
  } catch (error) {
    console.error(`[QuestionGenerator] Job ${jobId} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await questionGenerationJobRepository.updateStatus(jobId, 'failed', errorMessage);
  }
}

function getDefaultPoints(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 15;
    case 'hard':
      return 20;
    default:
      return 10;
  }
}

/**
 * 대기 중인 작업 처리 (스케줄러용)
 */
export async function processPendingJobs(): Promise<void> {
  const pendingJobs = await questionGenerationJobRepository.findPending();

  for (const job of pendingJobs) {
    try {
      await processGenerationJob(job.id);
    } catch (err) {
      console.error(`[QuestionGenerator] Failed to process job ${job.id}:`, err);
    }
  }
}
