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
import practiceRouter, { practiceSets, problems } from './practice.js';
import { createLLMClient } from '../../services/llmClient.js';
import { executeCode } from '../../utils/codeExecutor.js';
import { PRACTICE_PROMPTS, buildGeneratePrompt, buildFeedbackPrompt } from '../../prompts/practice.js';

describe('Practice Crafter Agent', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/agent', practiceRouter);
    vi.clearAllMocks();
    // Clear in-memory storage
    practiceSets.clear();
    problems.clear();
  });

  describe('POST /api/agent/practice/generate', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/agent/practice/generate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('topic, language, level, count는 필수입니다.');
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app)
        .post('/api/agent/practice/generate')
        .send({
          topic: '변수와 상수',
          language: 'ruby',
          level: 'beginner_zero',
          count: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('지원하지 않는 언어입니다.');
    });

    it('should return 400 for invalid level', async () => {
      const response = await request(app)
        .post('/api/agent/practice/generate')
        .send({
          topic: '변수와 상수',
          language: 'javascript',
          level: 'expert',
          count: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('유효하지 않은 학습 수준입니다.');
    });

    it('should return 400 for invalid count', async () => {
      const response = await request(app)
        .post('/api/agent/practice/generate')
        .send({
          topic: '변수와 상수',
          language: 'javascript',
          level: 'beginner_zero',
          count: 15
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('문제 수는 1-10개 사이여야 합니다.');
    });

    it('should generate problems successfully', async () => {
      const mockProblems = {
        problems: [
          {
            id: 'prob-1',
            order: 1,
            difficulty: 'easy',
            title: '변수 만들기',
            description: '변수를 만들어보세요',
            requirements: ['변수 이름은 age로', '값은 25로'],
            hints: ['let을 사용해보세요', 'let age = 25'],
            testCases: [{ expectedOutput: '25', description: 'age 출력' }],
            sampleAnswer: 'let age = 25; console.log(age);'
          }
        ]
      };

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: JSON.stringify(mockProblems) } }]
            }),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/practice/generate')
        .send({
          topic: '변수와 상수',
          language: 'javascript',
          level: 'beginner_zero',
          count: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.topic).toBe('변수와 상수');
      expect(response.body.problems).toHaveLength(1);
      expect(response.body.problems[0].title).toBe('변수 만들기');
    });
  });

  describe('POST /api/agent/practice/grade', () => {
    beforeEach(() => {
      // Add a test problem
      const problemId = 'test-problem-id';
      problems.set(problemId, {
        id: problemId,
        practiceSetId: 'test-set-id',
        order: 1,
        difficulty: 'easy',
        title: '변수 만들기',
        description: '변수를 만들어보세요',
        requirements: ['변수 이름은 age로'],
        hints: ['let을 사용해보세요'],
        testCases: [{ expectedOutput: '25', description: 'age 출력' }],
        sampleAnswer: 'let age = 25; console.log(age);',
        language: 'javascript'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/agent/practice/grade')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('problemId, code, level은 필수입니다.');
    });

    it('should return 404 for non-existent problem', async () => {
      const response = await request(app)
        .post('/api/agent/practice/grade')
        .send({
          problemId: 'non-existent-id',
          code: 'console.log(25)',
          level: 'beginner_zero'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('문제를 찾을 수 없습니다.');
    });

    it('should grade correct answer with 100 score', async () => {
      vi.mocked(executeCode).mockResolvedValue({
        output: '25\n',
        error: '',
        exitCode: 0,
        executionTime: 100
      });

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '잘했어요!' } }]
            }),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/practice/grade')
        .send({
          problemId: 'test-problem-id',
          code: 'let age = 25; console.log(age);',
          level: 'beginner_zero'
        });

      expect(response.status).toBe(200);
      expect(response.body.passed).toBe(true);
      expect(response.body.score).toBe(100);
      expect(response.body.feedback).toBe('잘했어요!');
    });

    it('should grade incorrect answer with 0 score', async () => {
      vi.mocked(executeCode).mockResolvedValue({
        output: '30\n',
        error: '',
        exitCode: 0,
        executionTime: 100
      });

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '다시 도전해보세요!' } }]
            }),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/practice/grade')
        .send({
          problemId: 'test-problem-id',
          code: 'let age = 30; console.log(age);',
          level: 'beginner_zero'
        });

      expect(response.status).toBe(200);
      expect(response.body.passed).toBe(false);
      expect(response.body.score).toBe(0);
      expect(response.body.testResults[0].passed).toBe(false);
    });
  });

  describe('GET /api/agent/practice/:id', () => {
    it('should return 404 for non-existent practice set', async () => {
      const response = await request(app)
        .get('/api/agent/practice/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('문제 세트를 찾을 수 없습니다.');
    });

    it('should return practice set', async () => {
      // Add a test practice set
      const practiceSetId = 'test-set-id';
      practiceSets.set(practiceSetId, {
        id: practiceSetId,
        topic: '변수와 상수',
        language: 'javascript',
        level: 'beginner_zero',
        problems: [],
        createdAt: new Date()
      });

      const response = await request(app)
        .get(`/api/agent/practice/${practiceSetId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(practiceSetId);
      expect(response.body.topic).toBe('변수와 상수');
    });
  });

  describe('GET /api/agent/practice/problem/:id/hint', () => {
    beforeEach(() => {
      // Add a test problem with hints
      const problemId = 'test-problem-id';
      problems.set(problemId, {
        id: problemId,
        practiceSetId: 'test-set-id',
        order: 1,
        difficulty: 'easy',
        title: '변수 만들기',
        description: '변수를 만들어보세요',
        requirements: ['변수 이름은 age로'],
        hints: ['힌트1: let을 사용해보세요', '힌트2: let age = ...', '힌트3: let age = 25'],
        testCases: [{ expectedOutput: '25', description: 'age 출력' }],
        sampleAnswer: 'let age = 25; console.log(age);',
        language: 'javascript'
      });
    });

    it('should return 404 for non-existent problem', async () => {
      const response = await request(app)
        .get('/api/agent/practice/problem/non-existent-id/hint');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('문제를 찾을 수 없습니다.');
    });

    it('should return hint level 1 by default', async () => {
      const response = await request(app)
        .get('/api/agent/practice/problem/test-problem-id/hint');

      expect(response.status).toBe(200);
      expect(response.body.level).toBe(1);
      expect(response.body.hint).toBe('힌트1: let을 사용해보세요');
    });

    it('should return specified hint level', async () => {
      const response = await request(app)
        .get('/api/agent/practice/problem/test-problem-id/hint?level=2');

      expect(response.status).toBe(200);
      expect(response.body.level).toBe(2);
      expect(response.body.hint).toBe('힌트2: let age = ...');
    });

    it('should return max hint level', async () => {
      const response = await request(app)
        .get('/api/agent/practice/problem/test-problem-id/hint?level=3');

      expect(response.status).toBe(200);
      expect(response.body.level).toBe(3);
      expect(response.body.maxLevel).toBe(3);
      expect(response.body.hint).toBe('힌트3: let age = 25');
    });
  });

  describe('PRACTICE_PROMPTS', () => {
    it('should have generate prompts for all levels', () => {
      expect(PRACTICE_PROMPTS.generate.beginner_zero).toBeDefined();
      expect(PRACTICE_PROMPTS.generate.beginner).toBeDefined();
      expect(PRACTICE_PROMPTS.generate.beginner_plus).toBeDefined();
    });

    it('should have feedback prompts for all levels', () => {
      expect(PRACTICE_PROMPTS.feedback.beginner_zero).toBeDefined();
      expect(PRACTICE_PROMPTS.feedback.beginner).toBeDefined();
      expect(PRACTICE_PROMPTS.feedback.beginner_plus).toBeDefined();
    });

    it('should have Korean instructions in prompts', () => {
      expect(PRACTICE_PROMPTS.generate.beginner_zero).toContain('한국어');
      expect(PRACTICE_PROMPTS.feedback.beginner_zero).toContain('한국어');
    });
  });

  describe('buildGeneratePrompt', () => {
    it('should build generate prompt with topic, language, and count', () => {
      const prompt = buildGeneratePrompt('변수와 상수', 'javascript', 3);

      expect(prompt).toContain('변수와 상수');
      expect(prompt).toContain('javascript');
      expect(prompt).toContain('3');
    });
  });

  describe('buildFeedbackPrompt', () => {
    it('should build praise prompt for correct answer', () => {
      const prompt = buildFeedbackPrompt(
        '변수 만들기',
        '변수를 만들어보세요',
        'let age = 25;',
        true,
        []
      );

      expect(prompt).toContain('맞혔습니다');
      expect(prompt).toContain('칭찬');
    });

    it('should build hint prompt for incorrect answer', () => {
      const prompt = buildFeedbackPrompt(
        '변수 만들기',
        '변수를 만들어보세요',
        'let age = 30;',
        false,
        ['age 출력']
      );

      expect(prompt).toContain('틀렸습니다');
      expect(prompt).toContain('답은 알려주지 마세요');
      expect(prompt).toContain('age 출력');
    });
  });
});
