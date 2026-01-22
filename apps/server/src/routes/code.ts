import { Router } from 'express';
import PQueue from 'p-queue';

const router = Router();

const executionQueue = new PQueue({ concurrency: 10 });

const PISTON_URL = process.env.PISTON_API_URL || 'http://localhost:2000';

// 언어 설정 (Piston API용 매핑 포함)
interface LanguageConfig {
  pistonName: string;  // Piston에서 사용하는 언어 이름
  version: string;
  fileName: string;
}

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  javascript: {
    pistonName: 'javascript',  // Piston은 node도 javascript로 인식
    version: '*',  // 최신 버전 사용
    fileName: 'main.js',
  },
  typescript: {
    pistonName: 'typescript',
    version: '*',
    fileName: 'main.ts',
  },
  python: {
    pistonName: 'python',
    version: '*',
    fileName: 'main.py',
  },
};

/**
 * @swagger
 * /code/runtimes:
 *   get:
 *     summary: 런타임 목록
 *     description: 사용 가능한 프로그래밍 언어 런타임 목록
 *     tags: [Code]
 *     responses:
 *       200:
 *         description: 런타임 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                   version:
 *                     type: string
 *                   aliases:
 *                     type: array
 *                     items:
 *                       type: string
 *       503:
 *         description: Piston 서버 연결 실패
 */
router.get('/runtimes', async (req, res) => {
  try {
    const response = await fetch(`${PISTON_URL}/api/v2/runtimes`);

    if (!response.ok) {
      throw new Error('Failed to fetch runtimes');
    }

    const runtimes = await response.json() as Array<{
      language: string;
      version: string;
      aliases: string[];
    }>;

    // 지원하는 언어만 필터링
    const supported = runtimes.filter((r) =>
      ['javascript', 'typescript', 'python', 'node'].includes(r.language)
    );

    res.json(supported);
  } catch (error) {
    console.error('Failed to fetch runtimes:', error);
    res.status(503).json({
      error: 'Piston 서버에 연결할 수 없습니다',
      message: 'Docker에서 Piston이 실행 중인지 확인하세요',
    });
  }
});

/**
 * @swagger
 * /code/health:
 *   get:
 *     summary: Piston 서버 상태
 *     description: 코드 실행 서버(Piston) 연결 상태 확인
 *     tags: [Code]
 *     responses:
 *       200:
 *         description: 서버 정상
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 pistonUrl:
 *                   type: string
 *       503:
 *         description: Piston 서버 연결 실패
 */
router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${PISTON_URL}/api/v2/runtimes`, {
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      res.json({ status: 'ok', pistonUrl: PISTON_URL });
    } else {
      res.status(503).json({ status: 'error', message: 'Piston not responding' });
    }
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'Piston 서버에 연결할 수 없습니다',
      pistonUrl: PISTON_URL,
    });
  }
});

/**
 * @swagger
 * /code/execute:
 *   post:
 *     summary: 코드 실행
 *     description: JavaScript, TypeScript, Python 코드 실행
 *     tags: [Code]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [language, code]
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [javascript, typescript, python]
 *                 description: 프로그래밍 언어
 *               code:
 *                 type: string
 *                 description: 실행할 코드 (최대 10KB)
 *                 example: console.log("Hello, World!");
 *     responses:
 *       200:
 *         description: 실행 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   description: 표준 출력
 *                 error:
 *                   type: string
 *                   description: 표준 에러
 *                 exitCode:
 *                   type: integer
 *                   description: 종료 코드
 *                 executionTime:
 *                   type: integer
 *                   description: 실행 시간 (ms)
 *                 language:
 *                   type: string
 *                 version:
 *                   type: string
 *       400:
 *         description: 잘못된 요청 (언어/코드 누락, 지원하지 않는 언어, 코드 크기 초과)
 *       408:
 *         description: 실행 시간 초과
 *       503:
 *         description: Piston 서버 연결 실패
 */
router.post('/execute', async (req, res) => {
  const { language, code } = req.body as {
    language: 'javascript' | 'typescript' | 'python';
    code: string;
  };

  if (!language || !code) {
    return res.status(400).json({ error: '언어와 코드를 입력해주세요' });
  }

  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    return res.status(400).json({ error: '지원하지 않는 언어입니다' });
  }

  // 코드 길이 제한 (10KB)
  if (code.length > 10240) {
    return res.status(400).json({ error: '코드가 너무 깁니다 (최대 10KB)' });
  }

  try {
    const result = await executionQueue.add(async () => {
      const startTime = Date.now();

      const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: config.pistonName,
          version: config.version,
          files: [{ name: config.fileName, content: code }],
          run_timeout: 3000,           // 3초 타임아웃 (Piston 기본 제한)
          compile_timeout: 3000,       // 컴파일 3초 타임아웃
          run_memory_limit: 128000000, // 128MB 메모리 제한
        }),
        signal: AbortSignal.timeout(15000), // 전체 요청 15초 타임아웃
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Piston error: ${errorText}`);
      }

      const data = await response.json() as {
        language: string;
        version: string;
        run?: { stdout?: string; stderr?: string; code?: number; signal?: string };
        compile?: { stdout?: string; stderr?: string; code?: number };
      };

      const executionTime = Date.now() - startTime;

      // 컴파일 에러 처리 (TypeScript 등)
      if (data.compile && data.compile.code !== 0) {
        return {
          output: '',
          error: data.compile.stderr || data.compile.stdout || '컴파일 오류',
          exitCode: data.compile.code || 1,
          executionTime,
          language: data.language,
          version: data.version,
        };
      }

      // 실행 결과
      return {
        output: data.run?.stdout || '',
        error: data.run?.stderr || '',
        exitCode: data.run?.code ?? 0,
        signal: data.run?.signal,
        executionTime,
        language: data.language,
        version: data.version,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Code execution error:', error);

    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return res.status(408).json({ error: '실행 시간이 초과되었습니다' });
      }
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        return res.status(503).json({
          error: 'Piston 서버에 연결할 수 없습니다',
          message: 'Docker에서 Piston이 실행 중인지 확인하세요',
        });
      }
    }

    res.status(500).json({ error: '코드 실행에 실패했습니다' });
  }
});

export default router;
