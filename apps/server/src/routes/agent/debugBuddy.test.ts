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
import debugBuddyRouter from './debugBuddy.js';
import { createLLMClient } from '../../services/llmClient.js';
import { DEBUG_BUDDY_PROMPTS, buildDebugBuddyPrompt } from '../../prompts/debugBuddy.js';

describe('Debug Buddy Agent', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/agent', debugBuddyRouter);
    vi.clearAllMocks();
  });

  describe('POST /api/agent/debug-buddy', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/agent/debug-buddy')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('code, language, error, level은 필수입니다.');
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app)
        .post('/api/agent/debug-buddy')
        .send({
          code: 'console.log(x)',
          language: 'ruby',
          error: 'ReferenceError: x is not defined',
          level: 'beginner_zero',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('지원하지 않는 언어입니다.');
    });

    it('should return 400 for invalid level', async () => {
      const response = await request(app)
        .post('/api/agent/debug-buddy')
        .send({
          code: 'console.log(x)',
          language: 'javascript',
          error: 'ReferenceError: x is not defined',
          level: 'advanced',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('유효하지 않은 학습 수준입니다.');
    });

    it('should stream response for valid request', async () => {
      // Mock the stream response
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: '에러' } }] };
          yield { choices: [{ delta: { content: '가 ' } }] };
          yield { choices: [{ delta: { content: '발생했습니다.' } }] };
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
        .post('/api/agent/debug-buddy')
        .send({
          code: 'console.log(x)',
          language: 'javascript',
          error: 'ReferenceError: x is not defined',
          level: 'beginner_zero',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.text).toContain('data: {"content":"에러"}');
      expect(response.text).toContain('data: {"content":"가 "}');
      expect(response.text).toContain('data: {"content":"발생했습니다."}');
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
        .post('/api/agent/debug-buddy')
        .send({
          code: 'console.log(x)',
          language: 'javascript',
          error: 'ReferenceError: x is not defined',
          level: 'beginner_zero',
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('data: {"error":"API Error"}');
      expect(response.text).toContain('data: [DONE]');
    });
  });

  describe('DEBUG_BUDDY_PROMPTS', () => {
    it('should have prompts for all levels', () => {
      expect(DEBUG_BUDDY_PROMPTS.beginner_zero).toBeDefined();
      expect(DEBUG_BUDDY_PROMPTS.beginner).toBeDefined();
      expect(DEBUG_BUDDY_PROMPTS.beginner_plus).toBeDefined();
    });

    it('should have Korean content in prompts', () => {
      expect(DEBUG_BUDDY_PROMPTS.beginner_zero).toContain('Debug Buddy');
      expect(DEBUG_BUDDY_PROMPTS.beginner).toContain('Debug Buddy');
      expect(DEBUG_BUDDY_PROMPTS.beginner_plus).toContain('Debug Buddy');
    });
  });

  describe('buildDebugBuddyPrompt', () => {
    it('should build prompt with code, language, and error', () => {
      const prompt = buildDebugBuddyPrompt(
        'console.log(x)',
        'javascript',
        'ReferenceError: x is not defined'
      );

      expect(prompt).toContain('javascript');
      expect(prompt).toContain('console.log(x)');
      expect(prompt).toContain('ReferenceError: x is not defined');
    });

    it('should include topic when provided', () => {
      const prompt = buildDebugBuddyPrompt(
        'console.log(x)',
        'javascript',
        'ReferenceError: x is not defined',
        '변수와 상수'
      );

      expect(prompt).toContain('변수와 상수');
    });
  });
});
