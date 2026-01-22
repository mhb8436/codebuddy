import { Router } from 'express';
import { getModelConfig } from '../config/modelByLevel.js';
import { createLLMClient } from '../services/llmClient.js';
import { SYSTEM_PROMPTS } from '../config/systemPrompts.js';
import { chatRepository } from '../db/repositories/index.js';
import { authenticate } from '../middleware/auth.js';
import { getAdaptiveModelConfig, clearSessionContext } from '../services/adaptiveModel.js';
import type { LearnerLevel } from '../config/modelByLevel.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /chat/sessions:
 *   get:
 *     summary: 채팅 세션 목록
 *     description: 현재 사용자의 모든 채팅 세션 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 세션 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatSession'
 *       401:
 *         description: 인증 필요
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await chatRepository.findSessionsByUserId(req.user!.id);
    res.json(sessions);
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ message: '세션 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /chat/sessions:
 *   post:
 *     summary: 새 채팅 세션 생성
 *     description: 새로운 채팅 세션 생성
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 세션 제목
 *                 example: JavaScript 질문
 *     responses:
 *       201:
 *         description: 세션 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatSession'
 *       401:
 *         description: 인증 필요
 */
router.post('/sessions', async (req, res) => {
  try {
    const { title } = req.body;
    const session = await chatRepository.createSession({
      userId: req.user!.id,
      title: title || '새 대화',
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: '세션 생성 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /chat/sessions/{id}:
 *   get:
 *     summary: 세션 상세 조회
 *     description: 특정 세션의 모든 메시지 포함 상세 정보 조회
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 세션 ID
 *     responses:
 *       200:
 *         description: 세션 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   $ref: '#/components/schemas/ChatSession'
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 세션을 찾을 수 없음
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const result = await chatRepository.getSessionWithMessages(req.params.id);

    if (!result) {
      return res.status(404).json({ message: '세션을 찾을 수 없습니다' });
    }

    // Verify ownership
    if (result.session.user_id !== req.user!.id) {
      return res.status(403).json({ message: '접근 권한이 없습니다' });
    }

    res.json(result);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: '세션 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /chat/sessions/{id}:
 *   put:
 *     summary: 세션 제목 수정
 *     description: 채팅 세션의 제목 변경
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 세션을 찾을 수 없음
 */
router.put('/sessions/:id', async (req, res) => {
  try {
    const { title } = req.body;

    // Verify ownership first
    const session = await chatRepository.findSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: '세션을 찾을 수 없습니다' });
    }
    if (session.user_id !== req.user!.id) {
      return res.status(403).json({ message: '접근 권한이 없습니다' });
    }

    const updated = await chatRepository.updateSessionTitle(req.params.id, title);
    res.json(updated);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: '세션 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /chat/sessions/{id}:
 *   delete:
 *     summary: 세션 삭제
 *     description: 채팅 세션 및 모든 메시지 삭제
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 세션을 찾을 수 없음
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    // Verify ownership first
    const session = await chatRepository.findSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: '세션을 찾을 수 없습니다' });
    }
    if (session.user_id !== req.user!.id) {
      return res.status(403).json({ message: '접근 권한이 없습니다' });
    }

    await chatRepository.deleteSession(req.params.id);
    // Clear adaptive model session context
    clearSessionContext(req.params.id);
    res.json({ message: '세션이 삭제되었습니다' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: '세션 삭제 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: 메시지 전송 (스트리밍)
 *     description: AI에게 메시지를 보내고 SSE 스트리밍으로 응답 수신
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 format: uuid
 *                 description: 기존 세션 ID (없으면 새 세션 생성)
 *               message:
 *                 type: string
 *                 description: 사용자 메시지
 *                 example: for문이 뭐야?
 *               level:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *                 default: beginner
 *                 description: 학습 수준
 *               curriculumContext:
 *                 type: string
 *                 description: 커리큘럼 컨텍스트 (학습 중인 토픽 정보)
 *               codeContext:
 *                 type: string
 *                 description: 코드 에디터의 현재 코드 (AI가 코드 참조 시 사용)
 *     responses:
 *       200:
 *         description: SSE 스트리밍 응답
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: |
 *                 Server-Sent Events 형식
 *                 - data: {"sessionId": "..."} (새 세션인 경우)
 *                 - data: {"modelInfo": {...}} (모델 정보)
 *                 - data: {"content": "..."} (응답 내용)
 *                 - data: [DONE] (완료)
 *       400:
 *         description: 메시지 없음
 *       401:
 *         description: 인증 필요
 */
router.post('/', async (req, res) => {
  const { sessionId, message, level = 'beginner', curriculumContext, codeContext } = req.body as {
    sessionId?: string;
    message: string;
    level: LearnerLevel;
    curriculumContext?: string;
    codeContext?: string;
  };

  if (!message) {
    return res.status(400).json({ message: '메시지를 입력해주세요' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      // Create new session with first message as title
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      const session = await chatRepository.createSession({
        userId: req.user!.id,
        title,
      });
      currentSessionId = session.id;
      // Send session ID to client
      res.write(`data: ${JSON.stringify({ sessionId: currentSessionId })}\n\n`);
    } else {
      // Verify session ownership
      const session = await chatRepository.findSessionById(currentSessionId);
      if (!session || session.user_id !== req.user!.id) {
        res.write(`data: ${JSON.stringify({ error: '세션에 접근할 수 없습니다' })}\n\n`);
        res.end();
        return;
      }
    }

    // Get previous messages from DB
    const previousMessages = await chatRepository.findMessagesBySessionId(currentSessionId);
    const chatHistory = previousMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Save user message
    await chatRepository.createMessage({
      sessionId: currentSessionId,
      role: 'user',
      content: message,
    });

    // Build messages for API
    const apiMessages = [
      ...chatHistory,
      { role: 'user' as const, content: message },
    ];

    // Get adaptive model config (may upgrade based on frustration detection)
    const { config, upgraded, reason } = getAdaptiveModelConfig(currentSessionId, level, message);

    // Check if API key is configured
    if (!config.apiKey) {
      res.write(`data: ${JSON.stringify({ error: `${level} 수준의 모델이 설정되지 않았습니다. 관리자에게 문의하세요.` })}\n\n`);
      res.end();
      return;
    }

    const client = createLLMClient(config);

    // Send model info to client (include upgrade notification if applicable)
    res.write(`data: ${JSON.stringify({
      modelInfo: {
        name: config.modelName,
        provider: config.provider,
        upgraded,
        upgradeReason: reason
      }
    })}\n\n`);

    // Stream response
    let assistantContent = '';
    let totalTokens = 0;

    // Use beginner_zero prompts if model was upgraded
    const effectiveLevel = upgraded ? 'beginner_zero' : level;

    // Build system prompt with optional curriculum context and code context
    const baseSystemPrompt = SYSTEM_PROMPTS[effectiveLevel];
    let systemPrompt = baseSystemPrompt;

    if (curriculumContext) {
      systemPrompt += `\n\n${curriculumContext}`;
    }

    if (codeContext && codeContext.trim()) {
      systemPrompt += `\n\n[학습자의 현재 코드]\n학습자가 오른쪽 코드 에디터에 다음 코드를 작성했습니다. 학습자가 "이 코드", "이거", "코드" 등을 언급하면 아래 코드를 참조해서 설명해주세요:\n\`\`\`\n${codeContext}\n\`\`\``;
    }

    const stream = await client.chat.completions.create({
      model: config.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...apiMessages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        assistantContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
      // Capture token usage from the final chunk
      if (chunk.usage) {
        totalTokens = chunk.usage.total_tokens || 0;
      }
    }

    // Save assistant message with token usage
    await chatRepository.createMessage({
      sessionId: currentSessionId,
      role: 'assistant',
      content: assistantContent,
      modelUsed: config.modelName,
      tokensUsed: totalTokens,
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: '응답 생성 중 오류가 발생했습니다' })}\n\n`);
    res.end();
  }
});

export default router;
