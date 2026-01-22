import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Router } from 'express';

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

// Import after mocks
import codeMentorRouter from './codeMentor.js';
import { createLLMClient } from '../../services/llmClient.js';
import { CODE_MENTOR_PROMPTS, buildCodeMentorPrompt } from '../../prompts/codeMentor.js';

describe('Code Mentor Agent', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/agent', codeMentorRouter);
    vi.clearAllMocks();
  });

  describe('POST /api/agent/code-mentor', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/agent/code-mentor')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('code, language, output, level은 필수입니다.');
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app)
        .post('/api/agent/code-mentor')
        .send({
          code: 'console.log("Hello")',
          language: 'ruby',
          output: 'Hello',
          level: 'beginner_zero',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('지원하지 않는 언어입니다.');
    });

    it('should return 400 for invalid level', async () => {
      const response = await request(app)
        .post('/api/agent/code-mentor')
        .send({
          code: 'console.log("Hello")',
          language: 'javascript',
          output: 'Hello',
          level: 'advanced',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('유효하지 않은 학습 수준입니다.');
    });

    it('should stream response for valid request', async () => {
      // Mock the stream response
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: '잘' } }] };
          yield { choices: [{ delta: { content: '했어요!' } }] };
          yield { choices: [{ delta: { content: ' 개선점이 있어요.' } }] };
        },
      };

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue(mockStream),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/code-mentor')
        .send({
          code: 'let x = 10; console.log(x)',
          language: 'javascript',
          output: '10',
          level: 'beginner_zero',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.text).toContain('data: {"content":"잘"}');
      expect(response.text).toContain('data: {"content":"했어요!"}');
      expect(response.text).toContain('data: {"content":" 개선점이 있어요."}');
      expect(response.text).toContain('data: [DONE]');
    });

    it('should handle API errors gracefully', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('API Error')),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      const response = await request(app)
        .post('/api/agent/code-mentor')
        .send({
          code: 'console.log("Hello")',
          language: 'javascript',
          output: 'Hello',
          level: 'beginner_zero',
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('data: {"error":"API Error"}');
      expect(response.text).toContain('data: [DONE]');
    });

    it('should accept all valid languages', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Good!' } }] };
        },
      };

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue(mockStream),
          },
        },
      };

      vi.mocked(createLLMClient).mockReturnValue(mockClient as any);

      for (const lang of ['javascript', 'typescript', 'python']) {
        const response = await request(app)
          .post('/api/agent/code-mentor')
          .send({
            code: 'print("Hello")',
            language: lang,
            output: 'Hello',
            level: 'beginner',
          });

        expect(response.status).toBe(200);
      }
    });
  });

  describe('CODE_MENTOR_PROMPTS', () => {
    it('should have prompts for all levels', () => {
      expect(CODE_MENTOR_PROMPTS.beginner_zero).toBeDefined();
      expect(CODE_MENTOR_PROMPTS.beginner).toBeDefined();
      expect(CODE_MENTOR_PROMPTS.beginner_plus).toBeDefined();
    });

    it('should have Code Mentor content in prompts', () => {
      expect(CODE_MENTOR_PROMPTS.beginner_zero).toContain('Code Mentor');
      expect(CODE_MENTOR_PROMPTS.beginner).toContain('Code Mentor');
      expect(CODE_MENTOR_PROMPTS.beginner_plus).toContain('Code Mentor');
    });

    it('should have Korean instructions in prompts', () => {
      expect(CODE_MENTOR_PROMPTS.beginner_zero).toContain('한국어');
      expect(CODE_MENTOR_PROMPTS.beginner).toContain('한국어');
      expect(CODE_MENTOR_PROMPTS.beginner_plus).toContain('한국어');
    });

    it('should have level-appropriate guidelines', () => {
      // beginner_zero: simple tips only
      expect(CODE_MENTOR_PROMPTS.beginner_zero).toContain('1개만');

      // beginner: 2-3 improvements
      expect(CODE_MENTOR_PROMPTS.beginner).toContain('2-3개');

      // beginner_plus: best practices and refactoring
      expect(CODE_MENTOR_PROMPTS.beginner_plus).toContain('Before/After');
    });
  });

  describe('buildCodeMentorPrompt', () => {
    it('should build prompt with code, language, and output', () => {
      const prompt = buildCodeMentorPrompt(
        'console.log("Hello")',
        'javascript',
        'Hello'
      );

      expect(prompt).toContain('javascript');
      expect(prompt).toContain('console.log("Hello")');
      expect(prompt).toContain('Hello');
      expect(prompt).toContain('정상 동작합니다');
    });

    it('should include topic when provided', () => {
      const prompt = buildCodeMentorPrompt(
        'const age = 25',
        'javascript',
        '25',
        '변수와 상수'
      );

      expect(prompt).toContain('변수와 상수');
    });

    it('should use "일반" when topic is not provided', () => {
      const prompt = buildCodeMentorPrompt(
        'const x = 1',
        'javascript',
        '1'
      );

      expect(prompt).toContain('일반');
    });
  });
});
