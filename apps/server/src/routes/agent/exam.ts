import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getModelConfig, type LearnerLevel } from '../../config/modelByLevel.js';
import { createLLMClient } from '../../services/llmClient.js';
import { EXAM_PROMPTS, buildExamGeneratePrompt, buildExamFeedbackPrompt, calculateGrade } from '../../prompts/exam.js';
import { executeCode } from '../../utils/codeExecutor.js';
import { authenticate } from '../../middleware/auth.js';
import * as curriculumService from '../../services/curriculumService.js';
import { questionBankRepository, type QuestionBankItem } from '../../db/repositories/questionBankRepository.js';

const router = Router();

// In-memory storage for exams (in production, use database)
const exams = new Map<string, Exam>();
const examAttempts = new Map<string, ExamAttempt>();
const examQuestions = new Map<string, ExamQuestion>();

interface TestCase {
  expectedOutput: string;
  description: string;
  points: number;
  input?: string;
}

interface ExamQuestion {
  id: string;
  examId: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  title: string;
  description: string;
  requirements: string[];
  testCases: TestCase[];
  sampleAnswer: string;
  language: string;
}

interface Exam {
  id: string;
  topics: string[];
  language: string;
  level: LearnerLevel;
  trackId?: string;
  topicIds?: string[];
  questionCount: number;
  totalPoints: number;
  timeLimit: number; // in minutes
  questions: ExamQuestion[];
  createdAt: Date;
}

interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startedAt: Date;
  submittedAt?: Date;
  answers: Map<string, AnswerSubmission>;
  score?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'in_progress' | 'submitted' | 'graded';
}

interface AnswerSubmission {
  questionId: string;
  code: string;
  submittedAt: Date;
  score?: number;
  passed?: boolean;
  feedback?: string;
  testResults?: TestResult[];
}

interface TestResult {
  description: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  points: number;
  earnedPoints: number;
}

interface GenerateExamRequest {
  topics: string[];
  language: 'javascript' | 'typescript' | 'python';
  level: LearnerLevel;
  questionCount: number;
  timeLimit?: number;
  trackId?: string;
  topicIds?: string[];
}

interface SubmitAnswerRequest {
  questionId: string;
  code: string;
}

/**
 * @swagger
 * /api/agent/exam/generate:
 *   post:
 *     summary: Exam Master - 시험 문제 생성
 *     description: 주제와 수준에 맞는 시험 문제 세트를 자동 생성
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
 *               - topics
 *               - language
 *               - level
 *               - questionCount
 *             properties:
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 시험 범위 주제들
 *               language:
 *                 type: string
 *                 enum: [javascript, typescript, python]
 *               level:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *               questionCount:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *               timeLimit:
 *                 type: number
 *                 description: 시험 시간 (분)
 *     responses:
 *       200:
 *         description: 생성된 시험
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.post('/exam/generate', authenticate, async (req: Request, res: Response) => {
  const { topics, language, level, questionCount, timeLimit = 60, trackId, topicIds } = req.body as GenerateExamRequest;

  // Validation
  if (!topics || !Array.isArray(topics) || topics.length === 0 || !language || !level || !questionCount) {
    res.status(400).json({ error: 'topics, language, level, questionCount는 필수입니다.' });
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

  if (questionCount < 1 || questionCount > 10) {
    res.status(400).json({ error: '문제 수는 1-10개 사이여야 합니다.' });
    return;
  }

  try {
    const examId = uuidv4();
    let totalPoints = 0;
    let questionList: ExamQuestion[] = [];

    // 1. 문제 은행에서 먼저 문제 가져오기 시도
    if (trackId && topicIds && topicIds.length > 0) {
      console.log(`[Exam Master] Trying to fetch questions from bank for track: ${trackId}, topics: ${topicIds.join(', ')}`);

      // 승인된 문제 수 확인
      const availableCount = await questionBankRepository.getApprovedCountByTopics(language, trackId, topicIds);
      console.log(`[Exam Master] Available approved questions: ${availableCount}, requested: ${questionCount}`);

      if (availableCount >= questionCount) {
        // 문제 은행에서 충분한 문제 가져오기
        const bankQuestions = await questionBankRepository.getRandomQuestionsFromTopics(
          language,
          trackId,
          topicIds,
          questionCount
        );

        questionList = bankQuestions.map((q: QuestionBankItem, index: number) => {
          totalPoints += q.points;
          const question: ExamQuestion = {
            id: uuidv4(),
            examId,
            order: index + 1,
            difficulty: q.difficulty,
            points: q.points,
            title: q.title,
            description: q.description,
            requirements: q.requirements || [],
            testCases: (q.test_cases || []).map(tc => ({
              expectedOutput: tc.expectedOutput,
              description: tc.description,
              points: tc.points,
              input: tc.input
            })),
            sampleAnswer: q.sample_answer || '',
            language
          };
          examQuestions.set(question.id, question);
          return question;
        });

        console.log(`[Exam Master] Successfully fetched ${questionList.length} questions from bank`);
      } else if (availableCount > 0) {
        // 일부만 문제 은행에서 가져오고 나머지는 LLM으로 생성
        console.log(`[Exam Master] Partial bank fetch: ${availableCount} from bank, ${questionCount - availableCount} from LLM`);

        const bankQuestions = await questionBankRepository.getRandomQuestionsFromTopics(
          language,
          trackId,
          topicIds,
          availableCount
        );

        questionList = bankQuestions.map((q: QuestionBankItem, index: number) => {
          totalPoints += q.points;
          const question: ExamQuestion = {
            id: uuidv4(),
            examId,
            order: index + 1,
            difficulty: q.difficulty,
            points: q.points,
            title: q.title,
            description: q.description,
            requirements: q.requirements || [],
            testCases: (q.test_cases || []).map(tc => ({
              expectedOutput: tc.expectedOutput,
              description: tc.description,
              points: tc.points,
              input: tc.input
            })),
            sampleAnswer: q.sample_answer || '',
            language
          };
          examQuestions.set(question.id, question);
          return question;
        });

        // 나머지 문제는 LLM으로 생성
        const remainingCount = questionCount - questionList.length;
        const llmQuestions = await generateQuestionsFromLLM(
          topics, language, level, remainingCount, trackId, topicIds
        );

        for (const q of llmQuestions) {
          const questionId = uuidv4();
          totalPoints += q.points;
          const question: ExamQuestion = {
            id: questionId,
            examId,
            order: questionList.length + 1,
            difficulty: q.difficulty,
            points: q.points,
            title: q.title,
            description: q.description,
            requirements: q.requirements || [],
            testCases: q.testCases,
            sampleAnswer: q.sampleAnswer || '',
            language
          };
          examQuestions.set(questionId, question);
          questionList.push(question);
        }
      }
    }

    // 2. 문제 은행에서 가져오지 못한 경우 LLM으로 생성
    if (questionList.length === 0) {
      console.log(`[Exam Master] No questions from bank, generating ${questionCount} via LLM`);

      const llmQuestions = await generateQuestionsFromLLM(
        topics, language, level, questionCount, trackId, topicIds
      );

      for (const q of llmQuestions) {
        const questionId = uuidv4();
        totalPoints += q.points;
        const question: ExamQuestion = {
          id: questionId,
          examId,
          order: questionList.length + 1,
          difficulty: q.difficulty,
          points: q.points,
          title: q.title,
          description: q.description,
          requirements: q.requirements || [],
          testCases: q.testCases,
          sampleAnswer: q.sampleAnswer || '',
          language
        };
        examQuestions.set(questionId, question);
        questionList.push(question);
      }
    }

    if (questionList.length === 0) {
      res.status(500).json({ error: '시험 문제 생성에 실패했습니다.' });
      return;
    }

    const exam: Exam = {
      id: examId,
      topics,
      language,
      level,
      trackId,
      topicIds,
      questionCount,
      totalPoints,
      timeLimit,
      questions: questionList,
      createdAt: new Date()
    };

    exams.set(examId, exam);

    console.log(`[Exam Master] Generated exam ${examId} with ${questionList.length} questions, total ${totalPoints} points`);

    res.json({
      id: exam.id,
      topics: exam.topics,
      language: exam.language,
      level: exam.level,
      questionCount: exam.questionCount,
      totalPoints: exam.totalPoints,
      timeLimit: exam.timeLimit,
      questions: questionList.map(q => ({
        id: q.id,
        order: q.order,
        difficulty: q.difficulty,
        points: q.points,
        title: q.title,
        description: q.description,
        requirements: q.requirements,
        testCases: q.testCases.map(tc => ({
          description: tc.description,
          points: tc.points
        }))
      }))
    });

  } catch (err) {
    console.error('[Exam Master] Generate error:', err);
    const errorMessage = err instanceof Error ? err.message : '시험 문제 생성에 실패했습니다.';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * @swagger
 * /api/agent/exam/{examId}/start:
 *   post:
 *     summary: 시험 시작
 *     description: 시험 응시 시작
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: 시험 ID
 *     responses:
 *       200:
 *         description: 시험 시작됨
 *       404:
 *         description: 시험을 찾을 수 없음
 */
router.post('/exam/:examId/start', authenticate, async (req: Request, res: Response) => {
  const exam = exams.get(req.params.examId);

  if (!exam) {
    res.status(404).json({ error: '시험을 찾을 수 없습니다.' });
    return;
  }

  const userId = (req as any).user?.id || 'anonymous';

  // Check if already has an active attempt
  const existingAttempt = Array.from(examAttempts.values()).find(
    a => a.examId === exam.id && a.userId === userId && a.status === 'in_progress'
  );

  if (existingAttempt) {
    // Return existing attempt
    const elapsed = Math.floor((Date.now() - existingAttempt.startedAt.getTime()) / 1000 / 60);
    const remaining = Math.max(0, exam.timeLimit - elapsed);

    res.json({
      attemptId: existingAttempt.id,
      examId: exam.id,
      startedAt: existingAttempt.startedAt,
      timeLimit: exam.timeLimit,
      remainingTime: remaining,
      status: existingAttempt.status,
      questions: exam.questions.map(q => ({
        id: q.id,
        order: q.order,
        difficulty: q.difficulty,
        points: q.points,
        title: q.title,
        description: q.description,
        requirements: q.requirements,
        testCases: q.testCases.map(tc => ({
          description: tc.description,
          points: tc.points
        })),
        answered: existingAttempt.answers.has(q.id)
      }))
    });
    return;
  }

  // Create new attempt
  const attemptId = uuidv4();
  const attempt: ExamAttempt = {
    id: attemptId,
    examId: exam.id,
    userId,
    startedAt: new Date(),
    answers: new Map(),
    status: 'in_progress'
  };

  examAttempts.set(attemptId, attempt);

  console.log(`[Exam Master] User ${userId} started exam ${exam.id}, attempt ${attemptId}`);

  res.json({
    attemptId: attempt.id,
    examId: exam.id,
    startedAt: attempt.startedAt,
    timeLimit: exam.timeLimit,
    remainingTime: exam.timeLimit,
    status: attempt.status,
    questions: exam.questions.map(q => ({
      id: q.id,
      order: q.order,
      difficulty: q.difficulty,
      points: q.points,
      title: q.title,
      description: q.description,
      requirements: q.requirements,
      testCases: q.testCases.map(tc => ({
        description: tc.description,
        points: tc.points
      })),
      answered: false
    }))
  });
});

/**
 * @swagger
 * /api/agent/exam/{examId}/submit:
 *   post:
 *     summary: 답안 제출 및 채점
 *     description: 문제별 답안을 제출하고 채점 결과 받기
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: 시험 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attemptId
 *               - questionId
 *               - code
 *             properties:
 *               attemptId:
 *                 type: string
 *               questionId:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: 채점 결과
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 시험 또는 문제를 찾을 수 없음
 */
router.post('/exam/:examId/submit', authenticate, async (req: Request, res: Response) => {
  const { attemptId, questionId, code } = req.body as SubmitAnswerRequest & { attemptId: string };

  if (!attemptId || !questionId || !code) {
    res.status(400).json({ error: 'attemptId, questionId, code는 필수입니다.' });
    return;
  }

  const exam = exams.get(req.params.examId);
  if (!exam) {
    res.status(404).json({ error: '시험을 찾을 수 없습니다.' });
    return;
  }

  const attempt = examAttempts.get(attemptId);
  if (!attempt || attempt.examId !== exam.id) {
    res.status(404).json({ error: '시험 응시 정보를 찾을 수 없습니다.' });
    return;
  }

  if (attempt.status !== 'in_progress') {
    res.status(400).json({ error: '이미 제출된 시험입니다.' });
    return;
  }

  // Check time limit
  const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000 / 60);
  if (elapsed > exam.timeLimit) {
    res.status(400).json({ error: '시험 시간이 초과되었습니다.' });
    return;
  }

  const question = examQuestions.get(questionId);
  if (!question || question.examId !== exam.id) {
    res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    return;
  }

  try {
    console.log(`[Exam Master] Grading question ${questionId} for attempt ${attemptId}`);

    // Execute code
    const execResult = await executeCode(code, question.language);

    // Check test cases
    const testResults: TestResult[] = question.testCases.map(tc => {
      const actualOutput = execResult.output?.trim() || '';
      const expectedOutput = tc.expectedOutput.trim();
      const passed = actualOutput === expectedOutput;
      return {
        description: tc.description,
        passed,
        expectedOutput,
        actualOutput,
        points: tc.points,
        earnedPoints: passed ? tc.points : 0
      };
    });

    const earnedPoints = testResults.reduce((sum, r) => sum + r.earnedPoints, 0);
    const passed = earnedPoints === question.points && execResult.exitCode === 0;

    // Generate feedback for wrong answers
    let feedback = '';
    const config = getModelConfig(exam.level);

    if (!passed && config.apiKey && config.baseURL) {
      try {
        const client = createLLMClient(config);
        const failedTests = testResults
          .filter(r => !r.passed)
          .map(r => ({
            description: r.description,
            expectedOutput: r.expectedOutput,
            actualOutput: r.actualOutput
          }));

        const feedbackPrompt = buildExamFeedbackPrompt(
          question.title,
          question.description,
          code,
          failedTests
        );

        const completion = await client.chat.completions.create({
          model: config.modelName,
          messages: [
            { role: 'system', content: EXAM_PROMPTS.feedback[exam.level] },
            { role: 'user', content: feedbackPrompt }
          ]
        });

        feedback = completion.choices[0]?.message?.content || '';
      } catch (feedbackErr) {
        console.error('[Exam Master] Feedback generation error:', feedbackErr);
        feedback = '다시 확인해보세요.';
      }
    } else if (passed) {
      feedback = '정답입니다!';
    }

    // Save answer
    const submission: AnswerSubmission = {
      questionId,
      code,
      submittedAt: new Date(),
      score: earnedPoints,
      passed,
      feedback,
      testResults
    };

    attempt.answers.set(questionId, submission);

    console.log(`[Exam Master] Question ${questionId}: ${passed ? 'PASSED' : 'FAILED'} (${earnedPoints}/${question.points} points)`);

    res.json({
      questionId,
      passed,
      score: earnedPoints,
      maxScore: question.points,
      testResults: testResults.map(r => ({
        description: r.description,
        passed: r.passed,
        points: r.points,
        earnedPoints: r.earnedPoints
      })),
      feedback,
      executionError: execResult.error || null
    });

  } catch (err) {
    console.error('[Exam Master] Submit error:', err);
    const errorMessage = err instanceof Error ? err.message : '채점에 실패했습니다.';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * @swagger
 * /api/agent/exam/{examId}/finish:
 *   post:
 *     summary: 시험 종료 및 최종 결과
 *     description: 시험을 종료하고 최종 점수와 등급 확인
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attemptId
 *             properties:
 *               attemptId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 최종 결과
 *       404:
 *         description: 시험을 찾을 수 없음
 */
router.post('/exam/:examId/finish', authenticate, async (req: Request, res: Response) => {
  const { attemptId } = req.body;

  if (!attemptId) {
    res.status(400).json({ error: 'attemptId는 필수입니다.' });
    return;
  }

  const exam = exams.get(req.params.examId);
  if (!exam) {
    res.status(404).json({ error: '시험을 찾을 수 없습니다.' });
    return;
  }

  const attempt = examAttempts.get(attemptId);
  if (!attempt || attempt.examId !== exam.id) {
    res.status(404).json({ error: '시험 응시 정보를 찾을 수 없습니다.' });
    return;
  }

  if (attempt.status === 'graded') {
    // Return existing result
    res.json({
      attemptId: attempt.id,
      examId: exam.id,
      totalScore: attempt.score,
      totalPoints: exam.totalPoints,
      percentage: Math.round((attempt.score! / exam.totalPoints) * 100),
      grade: attempt.grade,
      status: attempt.status,
      submittedAt: attempt.submittedAt
    });
    return;
  }

  // Calculate final score
  let totalScore = 0;
  const questionResults = exam.questions.map(q => {
    const answer = attempt.answers.get(q.id);
    const score = answer?.score || 0;
    totalScore += score;
    return {
      questionId: q.id,
      title: q.title,
      maxScore: q.points,
      score,
      passed: answer?.passed || false
    };
  });

  const percentage = Math.round((totalScore / exam.totalPoints) * 100);
  const grade = calculateGrade(percentage);

  // Update attempt
  attempt.status = 'graded';
  attempt.submittedAt = new Date();
  attempt.score = totalScore;
  attempt.grade = grade;

  console.log(`[Exam Master] Exam ${exam.id} finished: ${totalScore}/${exam.totalPoints} (${percentage}%) - Grade ${grade}`);

  res.json({
    attemptId: attempt.id,
    examId: exam.id,
    totalScore,
    totalPoints: exam.totalPoints,
    percentage,
    grade,
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    questionResults
  });
});

/**
 * @swagger
 * /api/agent/exam/{id}:
 *   get:
 *     summary: 시험 정보 조회
 *     description: 시험 상세 정보 조회
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 시험 ID
 *     responses:
 *       200:
 *         description: 시험 정보
 *       404:
 *         description: 시험을 찾을 수 없음
 */
router.get('/exam/:id', authenticate, async (req: Request, res: Response) => {
  const exam = exams.get(req.params.id);

  if (!exam) {
    res.status(404).json({ error: '시험을 찾을 수 없습니다.' });
    return;
  }

  res.json({
    id: exam.id,
    topics: exam.topics,
    language: exam.language,
    level: exam.level,
    questionCount: exam.questionCount,
    totalPoints: exam.totalPoints,
    timeLimit: exam.timeLimit,
    createdAt: exam.createdAt,
    questions: exam.questions.map(q => ({
      id: q.id,
      order: q.order,
      difficulty: q.difficulty,
      points: q.points,
      title: q.title,
      description: q.description,
      requirements: q.requirements,
      testCases: q.testCases.map(tc => ({
        description: tc.description,
        points: tc.points
      }))
    }))
  });
});

/**
 * LLM으로 시험 문제 생성 헬퍼 함수
 */
interface GeneratedQuestion {
  title: string;
  description: string;
  requirements: string[];
  testCases: TestCase[];
  sampleAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

async function generateQuestionsFromLLM(
  topics: string[],
  language: string,
  level: LearnerLevel,
  questionCount: number,
  trackId?: string,
  topicIds?: string[]
): Promise<GeneratedQuestion[]> {
  const config = getModelConfig(level);

  if (!config.apiKey || !config.baseURL) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  const client = createLLMClient(config);

  // Get curriculum context if trackId and topicIds are provided
  let curriculumContext = '';
  if (trackId && topicIds && topicIds.length > 0) {
    const contextPromises = topicIds.map(topicId =>
      curriculumService.getTopicContext(language, trackId, topicId)
    );
    const contextResults = await Promise.all(contextPromises);
    const contexts = contextResults.filter(Boolean);

    if (contexts.length > 0) {
      curriculumContext = `\n\n## 커리큘럼 컨텍스트\n${contexts.join('\n\n---\n\n')}`;
      console.log(`[Exam Master] Using curriculum context for track: ${trackId}, topics: ${topicIds.join(', ')}`);
    }
  }

  const systemPrompt = EXAM_PROMPTS.generate[level] + curriculumContext;
  const userPrompt = buildExamGeneratePrompt(topics, language, questionCount);

  console.log(`[Exam Master] Generating ${questionCount} questions via LLM for topics: ${topics.join(', ')}, level: ${level}`);

  const completion = await client.chat.completions.create({
    model: config.modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('시험 문제 생성에 실패했습니다.');
  }

  let generatedQuestions;
  try {
    generatedQuestions = JSON.parse(content);
  } catch {
    console.error('[Exam Master] Failed to parse JSON:', content);
    throw new Error('문제 형식이 올바르지 않습니다.');
  }

  return (generatedQuestions.questions || []).map((q: any) => ({
    title: q.title,
    description: q.description,
    requirements: q.requirements || [],
    testCases: (q.testCases || []).map((tc: any) => ({
      expectedOutput: tc.expectedOutput,
      description: tc.description,
      points: tc.points || 5,
      input: tc.input
    })),
    sampleAnswer: q.sampleAnswer || '',
    difficulty: q.difficulty || 'easy',
    points: q.points || 10
  }));
}

export default router;

// Export for testing
export { exams, examAttempts, examQuestions };
