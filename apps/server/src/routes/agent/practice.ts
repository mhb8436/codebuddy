import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getModelConfig, type LearnerLevel } from '../../config/modelByLevel.js';
import { createLLMClient } from '../../services/llmClient.js';
import { PRACTICE_PROMPTS, buildFeedbackPrompt } from '../../prompts/practice.js';
import { executeCode } from '../../utils/codeExecutor.js';
import { authenticate } from '../../middleware/auth.js';
import { questionBankRepository } from '../../db/repositories/questionBankRepository.js';

const router = Router();

// In-memory storage for practice sets (in production, use database)
const practiceSets = new Map<string, PracticeSet>();
const problems = new Map<string, Problem>();

interface TestCase {
  expectedOutput: string;
  description: string;
  input?: string;
}

interface Problem {
  id: string;
  practiceSetId: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  requirements: string[];
  hints: string[];
  testCases: TestCase[];
  sampleAnswer: string;
  language: string;
}

interface PracticeSet {
  id: string;
  topic: string;
  language: string;
  level: LearnerLevel;
  trackId?: string;
  topicId?: string;
  problems: Problem[];
  createdAt: Date;
}

interface GenerateRequest {
  topic: string;
  language: 'javascript' | 'typescript' | 'python';
  level: LearnerLevel;
  count: number;
  trackId?: string;
  topicId?: string;
}

interface GradeRequest {
  problemId: string;
  code: string;
  level: LearnerLevel;
}

interface TestResult {
  description: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
}

/**
 * @swagger
 * /api/agent/practice/generate:
 *   post:
 *     summary: Practice Crafter - 연습 문제 생성
 *     description: 문제 은행에서 랜덤으로 연습 문제 세트를 가져옴 (즉시 응답)
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - language
 *               - level
 *               - count
 *             properties:
 *               topic:
 *                 type: string
 *                 description: 학습 주제
 *               language:
 *                 type: string
 *                 enum: [javascript, typescript, python]
 *               level:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *               count:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *               trackId:
 *                 type: string
 *                 description: 트랙 ID (필수)
 *               topicId:
 *                 type: string
 *                 description: 토픽 ID (필수)
 *     responses:
 *       200:
 *         description: 문제 은행에서 가져온 문제 세트
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 문제 은행에 문제가 부족함
 *       500:
 *         description: 서버 오류
 */
router.post('/practice/generate', authenticate, async (req: Request, res: Response) => {
  const { topic, language, level, count, trackId, topicId } = req.body as GenerateRequest;

  // Validation
  if (!topic || !language || !level || !count) {
    res.status(400).json({ error: 'topic, language, level, count는 필수입니다.' });
    return;
  }

  // trackId와 topicId는 문제 은행에서 가져오기 위해 필수
  if (!trackId || !topicId) {
    res.status(400).json({ error: 'trackId와 topicId는 필수입니다.' });
    return;
  }

  const validLanguages = ['javascript', 'typescript', 'python'];
  if (!validLanguages.includes(language)) {
    res.status(400).json({ error: '지원하지 않는 언어입니다.' });
    return;
  }

  const validLevels: LearnerLevel[] = ['beginner_zero', 'beginner', 'beginner_plus'];
  if (!validLevels.includes(level)) {
    res.status(400).json({ error: '유효하지 않은 학습 수준입니다.' });
    return;
  }

  if (count < 1 || count > 10) {
    res.status(400).json({ error: '문제 수는 1-10개 사이여야 합니다.' });
    return;
  }

  try {
    console.log(`[Practice Crafter] Fetching ${count} problems from Question Bank for topic: ${topicId}`);

    // 문제 은행에서 승인된 문제를 랜덤으로 가져오기
    const bankQuestions = await questionBankRepository.getRandomQuestions(
      language,
      trackId,
      topicId,
      count
    );

    if (bankQuestions.length === 0) {
      res.status(404).json({
        error: '문제 은행에 승인된 문제가 없습니다. 관리자에게 문의하세요.',
        availableCount: 0,
        requestedCount: count
      });
      return;
    }

    if (bankQuestions.length < count) {
      console.log(`[Practice Crafter] Only ${bankQuestions.length} questions available (requested: ${count})`);
    }

    // Create practice set from Question Bank
    const practiceSetId = uuidv4();
    const problemList: Problem[] = bankQuestions.map((q, index) => {
      const problemId = uuidv4();
      const problem: Problem = {
        id: problemId,
        practiceSetId,
        order: index + 1,
        difficulty: q.difficulty,
        title: q.title,
        description: q.description,
        requirements: q.requirements || [],
        hints: [], // 문제 은행에는 hints가 없으므로 빈 배열
        testCases: (q.test_cases || []).map(tc => ({
          description: tc.description,
          expectedOutput: tc.expectedOutput,
          input: tc.input
        })),
        sampleAnswer: q.sample_answer || '',
        language: q.language
      };
      problems.set(problemId, problem);
      return problem;
    });

    const practiceSet: PracticeSet = {
      id: practiceSetId,
      topic,
      language,
      level,
      trackId,
      topicId,
      problems: problemList,
      createdAt: new Date()
    };

    practiceSets.set(practiceSetId, practiceSet);

    console.log(`[Practice Crafter] Created practice set ${practiceSetId} with ${problemList.length} problems from Question Bank`);

    res.json({
      id: practiceSet.id,
      topic: practiceSet.topic,
      language: practiceSet.language,
      level: practiceSet.level,
      trackId: practiceSet.trackId,
      topicId: practiceSet.topicId,
      source: 'question_bank', // 문제 출처 표시
      problems: problemList.map(p => ({
        id: p.id,
        order: p.order,
        difficulty: p.difficulty,
        title: p.title,
        description: p.description,
        requirements: p.requirements,
        hints: p.hints,
        testCases: p.testCases.map(tc => ({
          description: tc.description,
          expectedOutput: tc.expectedOutput
        }))
      }))
    });

  } catch (err) {
    console.error('[Practice Crafter] Generate error:', err);
    const errorMessage = err instanceof Error ? err.message : '문제 가져오기에 실패했습니다.';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * @swagger
 * /api/agent/practice/grade:
 *   post:
 *     summary: Practice Crafter - 답안 채점
 *     description: 제출된 코드를 실행하고 테스트케이스 검증 후 피드백 제공
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - problemId
 *               - code
 *               - level
 *             properties:
 *               problemId:
 *                 type: string
 *                 description: 문제 ID
 *               code:
 *                 type: string
 *                 description: 제출한 코드
 *               level:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *     responses:
 *       200:
 *         description: 채점 결과
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 문제를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/practice/grade', authenticate, async (req: Request, res: Response) => {
  const { problemId, code, level } = req.body as GradeRequest;

  // Validation
  if (!problemId || !code || !level) {
    res.status(400).json({ error: 'problemId, code, level은 필수입니다.' });
    return;
  }

  const validLevels: LearnerLevel[] = ['beginner_zero', 'beginner', 'beginner_plus'];
  if (!validLevels.includes(level)) {
    res.status(400).json({ error: '유효하지 않은 학습 수준입니다.' });
    return;
  }

  // Find problem
  const problem = problems.get(problemId);
  if (!problem) {
    res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    return;
  }

  try {
    console.log(`[Practice Crafter] Grading problem ${problemId}`);

    // Execute code
    const execResult = await executeCode(code, problem.language);

    // Check test cases
    const testResults: TestResult[] = problem.testCases.map(tc => {
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
    const score = testResults.length > 0
      ? Math.round((passedCount / testResults.length) * 100)
      : (execResult.exitCode === 0 ? 100 : 0);
    const passed = score === 100 && execResult.exitCode === 0;

    // Generate feedback using LLM
    const config = getModelConfig(level);
    let feedback = '';

    if (config.apiKey && config.baseURL) {
      try {
        const client = createLLMClient(config);
        const failedTests = testResults.filter(r => !r.passed).map(r => r.description);
        const feedbackPrompt = buildFeedbackPrompt(
          problem.title,
          problem.description,
          code,
          passed,
          failedTests
        );

        const completion = await client.chat.completions.create({
          model: config.modelName,
          messages: [
            { role: 'system', content: PRACTICE_PROMPTS.feedback[level] },
            { role: 'user', content: feedbackPrompt }
          ]
        });

        feedback = completion.choices[0]?.message?.content || '';
      } catch (feedbackErr) {
        console.error('[Practice Crafter] Feedback generation error:', feedbackErr);
        feedback = passed ? '잘했어요!' : '다시 도전해보세요!';
      }
    } else {
      feedback = passed ? '정답입니다!' : '다시 도전해보세요.';
    }

    console.log(`[Practice Crafter] Graded problem ${problemId}: ${passed ? 'PASSED' : 'FAILED'} (${score}%)`);

    res.json({
      passed,
      score,
      testResults,
      feedback,
      executionError: execResult.error || null,
      exitCode: execResult.exitCode
    });

  } catch (err) {
    console.error('[Practice Crafter] Grade error:', err);
    const errorMessage = err instanceof Error ? err.message : '채점에 실패했습니다.';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * @swagger
 * /api/agent/practice/{id}:
 *   get:
 *     summary: 연습 문제 세트 조회
 *     description: 생성된 연습 문제 세트 조회
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 문제 세트 ID
 *     responses:
 *       200:
 *         description: 문제 세트
 *       404:
 *         description: 문제 세트를 찾을 수 없음
 */
router.get('/practice/:id', authenticate, async (req: Request, res: Response) => {
  const practiceSet = practiceSets.get(req.params.id);

  if (!practiceSet) {
    res.status(404).json({ error: '문제 세트를 찾을 수 없습니다.' });
    return;
  }

  res.json({
    id: practiceSet.id,
    topic: practiceSet.topic,
    language: practiceSet.language,
    level: practiceSet.level,
    problems: practiceSet.problems.map(p => ({
      id: p.id,
      order: p.order,
      difficulty: p.difficulty,
      title: p.title,
      description: p.description,
      requirements: p.requirements,
      hints: p.hints,
      testCases: p.testCases.map(tc => ({
        description: tc.description,
        expectedOutput: tc.expectedOutput
      }))
    }))
  });
});

/**
 * @swagger
 * /api/agent/practice/problem/{id}/hint:
 *   get:
 *     summary: 힌트 조회
 *     description: 특정 문제의 힌트 조회
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 문제 ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: number
 *         description: 힌트 레벨 (1-3)
 *     responses:
 *       200:
 *         description: 힌트
 *       404:
 *         description: 문제를 찾을 수 없음
 */
router.get('/practice/problem/:id/hint', authenticate, async (req: Request, res: Response) => {
  const problem = problems.get(req.params.id);

  if (!problem) {
    res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    return;
  }

  const hintLevel = parseInt(req.query.level as string) || 1;
  const hintIndex = Math.min(hintLevel, problem.hints.length) - 1;

  if (hintIndex < 0 || hintIndex >= problem.hints.length) {
    res.status(400).json({ error: '유효하지 않은 힌트 레벨입니다.' });
    return;
  }

  res.json({
    level: hintIndex + 1,
    maxLevel: problem.hints.length,
    hint: problem.hints[hintIndex]
  });
});

export default router;

// Export for testing
export { practiceSets, problems };
