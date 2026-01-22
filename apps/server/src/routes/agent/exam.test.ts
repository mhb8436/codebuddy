import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234')
}));

// Mock dependencies
vi.mock('../../config/modelByLevel.js', () => ({
  getModelConfig: vi.fn(() => ({
    provider: 'azure-openai',
    baseURL: 'https://test.openai.azure.com',
    apiKey: 'test-api-key',
    modelName: 'gpt-5-mini',
  })),
}));

vi.mock('../../services/llmClient.js', () => ({
  createLLMClient: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

vi.mock('../../middleware/auth.js', () => ({
  authenticate: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    (req as any).user = { id: 'test-user-id', level: 'beginner_zero' };
    next();
  },
}));

vi.mock('../../utils/codeExecutor.js', () => ({
  executeCode: vi.fn(),
}));

// Import after mocks
import examRouter, { exams, examAttempts, examQuestions } from './exam.js';
import { createLLMClient } from '../../services/llmClient.js';
import { executeCode } from '../../utils/codeExecutor.js';
import { EXAM_PROMPTS, buildExamGeneratePrompt, buildExamFeedbackPrompt, calculateGrade } from '../../prompts/exam.js';

describe('Exam Master Agent', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/agent', examRouter);
    vi.clearAllMocks();
    // Clear in-memory storage
    exams.clear();
    examAttempts.clear();
    examQuestions.clear();
  });

  describe('POST /api/agent/exam/generate', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/agent/exam/generate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('topics, language, level, questionCount는 필수입니다.');
    });

    it('should return 400 for empty topics array', async () => {
      const response = await request(app)
        .post('/api/agent/exam/generate')
        .send({
          topics: [],
          language: 'javascript',
          level: 'beginner_zero',
          questionCount: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('topics, language, level, questionCount는 필수입니다.');
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app)
        .post('/api/agent/exam/generate')
        .send({
          topics: ['변수', '조건문'],
          language: 'ruby',
          level: 'beginner_zero',
          questionCount: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('지원하지 않는 언어입니다.');
    });

    it('should return 400 for invalid level', async () => {
      const response = await request(app)
        .post('/api/agent/exam/generate')
        .send({
          topics: ['변수', '조건문'],
          language: 'javascript',
          level: 'expert',
          questionCount: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('유효하지 않은 학습 수준입니다.');
    });

    it('should return 400 for invalid questionCount', async () => {
      const response = await request(app)
        .post('/api/agent/exam/generate')
        .send({
          topics: ['변수', '조건문'],
          language: 'javascript',
          level: 'beginner_zero',
          questionCount: 15
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('문제 수는 1-10개 사이여야 합니다.');
    });

    it('should generate exam successfully', async () => {
      const mockQuestions = {
        questions: [
          {
            id: 'q-1',
            order: 1,
            difficulty: 'easy',
            points: 10,
            title: '변수 선언하기',
            description: '이름을 저장하는 변수를 만드세요',
            requirements: ['변수 이름은 name으로'],
            testCases: [
              { expectedOutput: 'Kim', description: 'name 출력', points: 10 }
            ],
            sampleAnswer: 'let name = "Kim"; console.log(name);'
          }
        ]
      };

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: JSON.stringify(mockQuestions) } }]
            }),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/exam/generate')
        .send({
          topics: ['변수', '조건문'],
          language: 'javascript',
          level: 'beginner_zero',
          questionCount: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.topics).toEqual(['변수', '조건문']);
      expect(response.body.questions).toHaveLength(1);
      expect(response.body.questions[0].title).toBe('변수 선언하기');
      expect(response.body.totalPoints).toBe(10);
    });
  });

  describe('POST /api/agent/exam/:examId/start', () => {
    beforeEach(() => {
      // Add a test exam
      const examId = 'test-exam-id';
      exams.set(examId, {
        id: examId,
        topics: ['변수', '조건문'],
        language: 'javascript',
        level: 'beginner_zero',
        questionCount: 1,
        totalPoints: 10,
        timeLimit: 60,
        questions: [{
          id: 'test-question-id',
          examId,
          order: 1,
          difficulty: 'easy',
          points: 10,
          title: '변수 선언하기',
          description: '변수를 만드세요',
          requirements: ['변수 이름은 name으로'],
          testCases: [{ expectedOutput: 'Kim', description: 'name 출력', points: 10 }],
          sampleAnswer: 'let name = "Kim";',
          language: 'javascript'
        }],
        createdAt: new Date()
      });

      examQuestions.set('test-question-id', {
        id: 'test-question-id',
        examId,
        order: 1,
        difficulty: 'easy',
        points: 10,
        title: '변수 선언하기',
        description: '변수를 만드세요',
        requirements: ['변수 이름은 name으로'],
        testCases: [{ expectedOutput: 'Kim', description: 'name 출력', points: 10 }],
        sampleAnswer: 'let name = "Kim";',
        language: 'javascript'
      });
    });

    it('should return 404 for non-existent exam', async () => {
      const response = await request(app)
        .post('/api/agent/exam/non-existent-id/start');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('시험을 찾을 수 없습니다.');
    });

    it('should start exam successfully', async () => {
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/start');

      expect(response.status).toBe(200);
      expect(response.body.examId).toBe('test-exam-id');
      expect(response.body.timeLimit).toBe(60);
      expect(response.body.remainingTime).toBe(60);
      expect(response.body.status).toBe('in_progress');
      expect(response.body.questions).toHaveLength(1);
    });

    it('should return existing attempt if already started', async () => {
      // Start exam first time
      await request(app)
        .post('/api/agent/exam/test-exam-id/start');

      // Start again
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/start');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });
  });

  describe('POST /api/agent/exam/:examId/submit', () => {
    let attemptId: string;

    beforeEach(async () => {
      // Add a test exam
      const examId = 'test-exam-id';
      exams.set(examId, {
        id: examId,
        topics: ['변수'],
        language: 'javascript',
        level: 'beginner_zero',
        questionCount: 1,
        totalPoints: 10,
        timeLimit: 60,
        questions: [{
          id: 'test-question-id',
          examId,
          order: 1,
          difficulty: 'easy',
          points: 10,
          title: '변수 선언하기',
          description: '변수를 만드세요',
          requirements: ['변수 이름은 name으로'],
          testCases: [{ expectedOutput: 'Kim', description: 'name 출력', points: 10 }],
          sampleAnswer: 'let name = "Kim";',
          language: 'javascript'
        }],
        createdAt: new Date()
      });

      examQuestions.set('test-question-id', {
        id: 'test-question-id',
        examId,
        order: 1,
        difficulty: 'easy',
        points: 10,
        title: '변수 선언하기',
        description: '변수를 만드세요',
        requirements: ['변수 이름은 name으로'],
        testCases: [{ expectedOutput: 'Kim', description: 'name 출력', points: 10 }],
        sampleAnswer: 'let name = "Kim";',
        language: 'javascript'
      });

      // Start exam to get attemptId
      attemptId = 'test-attempt-id';
      examAttempts.set(attemptId, {
        id: attemptId,
        examId,
        userId: 'test-user-id',
        startedAt: new Date(),
        answers: new Map(),
        status: 'in_progress'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/submit')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('attemptId, questionId, code는 필수입니다.');
    });

    it('should return 404 for non-existent exam', async () => {
      const response = await request(app)
        .post('/api/agent/exam/non-existent-id/submit')
        .send({
          attemptId: 'test-attempt-id',
          questionId: 'test-question-id',
          code: 'let name = "Kim"; console.log(name);'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('시험을 찾을 수 없습니다.');
    });

    it('should return 404 for non-existent attempt', async () => {
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/submit')
        .send({
          attemptId: 'non-existent-attempt',
          questionId: 'test-question-id',
          code: 'let name = "Kim"; console.log(name);'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('시험 응시 정보를 찾을 수 없습니다.');
    });

    it('should grade correct answer with full score', async () => {
      vi.mocked(executeCode).mockResolvedValue({
        output: 'Kim\n',
        error: '',
        exitCode: 0,
        executionTime: 100
      });

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '정답입니다!' } }]
            }),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/submit')
        .send({
          attemptId: attemptId,
          questionId: 'test-question-id',
          code: 'let name = "Kim"; console.log(name);'
        });

      expect(response.status).toBe(200);
      expect(response.body.passed).toBe(true);
      expect(response.body.score).toBe(10);
      expect(response.body.maxScore).toBe(10);
    });

    it('should grade incorrect answer with 0 score', async () => {
      vi.mocked(executeCode).mockResolvedValue({
        output: 'Lee\n',
        error: '',
        exitCode: 0,
        executionTime: 100
      });

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '다시 확인해보세요.' } }]
            }),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/submit')
        .send({
          attemptId: attemptId,
          questionId: 'test-question-id',
          code: 'let name = "Lee"; console.log(name);'
        });

      expect(response.status).toBe(200);
      expect(response.body.passed).toBe(false);
      expect(response.body.score).toBe(0);
      expect(response.body.testResults[0].passed).toBe(false);
    });
  });

  describe('POST /api/agent/exam/:examId/finish', () => {
    let attemptId: string;

    beforeEach(() => {
      const examId = 'test-exam-id';
      exams.set(examId, {
        id: examId,
        topics: ['변수'],
        language: 'javascript',
        level: 'beginner_zero',
        questionCount: 2,
        totalPoints: 20,
        timeLimit: 60,
        questions: [
          {
            id: 'q1',
            examId,
            order: 1,
            difficulty: 'easy',
            points: 10,
            title: '문제 1',
            description: '설명 1',
            requirements: [],
            testCases: [{ expectedOutput: '1', description: '테스트 1', points: 10 }],
            sampleAnswer: '',
            language: 'javascript'
          },
          {
            id: 'q2',
            examId,
            order: 2,
            difficulty: 'easy',
            points: 10,
            title: '문제 2',
            description: '설명 2',
            requirements: [],
            testCases: [{ expectedOutput: '2', description: '테스트 2', points: 10 }],
            sampleAnswer: '',
            language: 'javascript'
          }
        ],
        createdAt: new Date()
      });

      attemptId = 'test-attempt-id';
      const answers = new Map();
      answers.set('q1', {
        questionId: 'q1',
        code: 'console.log(1)',
        submittedAt: new Date(),
        score: 10,
        passed: true
      });
      answers.set('q2', {
        questionId: 'q2',
        code: 'console.log(3)',
        submittedAt: new Date(),
        score: 0,
        passed: false
      });

      examAttempts.set(attemptId, {
        id: attemptId,
        examId,
        userId: 'test-user-id',
        startedAt: new Date(),
        answers,
        status: 'in_progress'
      });
    });

    it('should return 400 if attemptId is missing', async () => {
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/finish')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('attemptId는 필수입니다.');
    });

    it('should return 404 for non-existent exam', async () => {
      const response = await request(app)
        .post('/api/agent/exam/non-existent-id/finish')
        .send({ attemptId: 'test-attempt-id' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('시험을 찾을 수 없습니다.');
    });

    it('should calculate final grade correctly', async () => {
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/finish')
        .send({ attemptId: attemptId });

      expect(response.status).toBe(200);
      expect(response.body.totalScore).toBe(10);
      expect(response.body.totalPoints).toBe(20);
      expect(response.body.percentage).toBe(50);
      expect(response.body.grade).toBe('F');
      expect(response.body.status).toBe('graded');
    });

    it('should return existing result if already graded', async () => {
      // Finish first time
      await request(app)
        .post('/api/agent/exam/test-exam-id/finish')
        .send({ attemptId: attemptId });

      // Finish again
      const response = await request(app)
        .post('/api/agent/exam/test-exam-id/finish')
        .send({ attemptId: attemptId });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('graded');
    });
  });

  describe('GET /api/agent/exam/:id', () => {
    it('should return 404 for non-existent exam', async () => {
      const response = await request(app)
        .get('/api/agent/exam/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('시험을 찾을 수 없습니다.');
    });

    it('should return exam details', async () => {
      const examId = 'test-exam-id';
      exams.set(examId, {
        id: examId,
        topics: ['변수', '조건문'],
        language: 'javascript',
        level: 'beginner_zero',
        questionCount: 1,
        totalPoints: 10,
        timeLimit: 60,
        questions: [{
          id: 'q1',
          examId,
          order: 1,
          difficulty: 'easy',
          points: 10,
          title: '변수 선언하기',
          description: '변수를 만드세요',
          requirements: ['req1'],
          testCases: [{ expectedOutput: 'out', description: 'test', points: 10 }],
          sampleAnswer: 'code',
          language: 'javascript'
        }],
        createdAt: new Date()
      });

      const response = await request(app)
        .get(`/api/agent/exam/${examId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(examId);
      expect(response.body.topics).toEqual(['변수', '조건문']);
      expect(response.body.questions).toHaveLength(1);
    });
  });

  describe('EXAM_PROMPTS', () => {
    it('should have generate prompts for all levels', () => {
      expect(EXAM_PROMPTS.generate.beginner_zero).toBeDefined();
      expect(EXAM_PROMPTS.generate.beginner).toBeDefined();
      expect(EXAM_PROMPTS.generate.beginner_plus).toBeDefined();
    });

    it('should have feedback prompts for all levels', () => {
      expect(EXAM_PROMPTS.feedback.beginner_zero).toBeDefined();
      expect(EXAM_PROMPTS.feedback.beginner).toBeDefined();
      expect(EXAM_PROMPTS.feedback.beginner_plus).toBeDefined();
    });

    it('should have Korean instructions in prompts', () => {
      expect(EXAM_PROMPTS.generate.beginner_zero).toContain('한국어');
      expect(EXAM_PROMPTS.feedback.beginner_zero).toContain('한국어');
    });
  });

  describe('buildExamGeneratePrompt', () => {
    it('should build generate prompt with topics, language, and count', () => {
      const prompt = buildExamGeneratePrompt(['변수', '조건문'], 'javascript', 3);

      expect(prompt).toContain('변수');
      expect(prompt).toContain('조건문');
      expect(prompt).toContain('javascript');
      expect(prompt).toContain('3');
    });
  });

  describe('buildExamFeedbackPrompt', () => {
    it('should build feedback prompt with failed tests', () => {
      const prompt = buildExamFeedbackPrompt(
        '변수 만들기',
        '변수를 만들어보세요',
        'let age = 30;',
        [{ description: 'age 출력', expectedOutput: '25', actualOutput: '30' }]
      );

      expect(prompt).toContain('변수 만들기');
      expect(prompt).toContain('let age = 30');
      expect(prompt).toContain('age 출력');
      expect(prompt).toContain('25');
      expect(prompt).toContain('30');
    });
  });

  describe('calculateGrade', () => {
    it('should return A for 90% or above', () => {
      expect(calculateGrade(90)).toBe('A');
      expect(calculateGrade(95)).toBe('A');
      expect(calculateGrade(100)).toBe('A');
    });

    it('should return B for 80-89%', () => {
      expect(calculateGrade(80)).toBe('B');
      expect(calculateGrade(85)).toBe('B');
      expect(calculateGrade(89)).toBe('B');
    });

    it('should return C for 70-79%', () => {
      expect(calculateGrade(70)).toBe('C');
      expect(calculateGrade(75)).toBe('C');
      expect(calculateGrade(79)).toBe('C');
    });

    it('should return D for 60-69%', () => {
      expect(calculateGrade(60)).toBe('D');
      expect(calculateGrade(65)).toBe('D');
      expect(calculateGrade(69)).toBe('D');
    });

    it('should return F for below 60%', () => {
      expect(calculateGrade(0)).toBe('F');
      expect(calculateGrade(50)).toBe('F');
      expect(calculateGrade(59)).toBe('F');
    });
  });
});
