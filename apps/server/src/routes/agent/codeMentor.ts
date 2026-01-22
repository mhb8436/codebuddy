import { Router, Request, Response } from 'express';
import { getModelConfig, type LearnerLevel } from '../../config/modelByLevel.js';
import { createLLMClient } from '../../services/llmClient.js';
import { CODE_MENTOR_PROMPTS, buildCodeMentorPrompt } from '../../prompts/codeMentor.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

interface CodeMentorRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  output: string;
  level: LearnerLevel;
  topic?: string;
}

/**
 * @swagger
 * /api/agent/code-mentor:
 *   post:
 *     summary: Code Mentor - 코드 리뷰 및 개선점 제안
 *     description: 정상 실행된 코드를 학습자 수준에 맞게 리뷰하고 개선점을 제안
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
 *               - code
 *               - language
 *               - output
 *               - level
 *             properties:
 *               code:
 *                 type: string
 *                 description: 학습자가 작성한 코드
 *               language:
 *                 type: string
 *                 enum: [javascript, typescript, python]
 *               output:
 *                 type: string
 *                 description: 실행 결과 출력
 *               level:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *               topic:
 *                 type: string
 *                 description: 현재 학습 주제 (선택)
 *     responses:
 *       200:
 *         description: SSE 스트리밍 응답
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.post('/code-mentor', authenticate, async (req: Request, res: Response) => {
  const { code, language, output, level, topic } = req.body as CodeMentorRequest;

  // 유효성 검사
  if (!code || !language || !output || !level) {
    res.status(400).json({ error: 'code, language, output, level은 필수입니다.' });
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

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const config = getModelConfig(level);

    // API 키 미설정 시 친절한 오류 메시지
    if (!config.apiKey || !config.baseURL) {
      const message = `API 키가 설정되지 않았습니다.\n\n환경 변수를 확인해주세요:\n- AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY`;
      res.write(`data: ${JSON.stringify({ content: message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const client = createLLMClient(config);
    const systemPrompt = CODE_MENTOR_PROMPTS[level];
    const userPrompt = buildCodeMentorPrompt(code, language, output, topic);

    console.log(`[Code Mentor] Level: ${level}, Model: ${config.modelName}`);

    const stream = await client.chat.completions.create({
      model: config.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
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
    console.error('[Code Mentor] Error:', err);
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

export default router;
