import PQueue from 'p-queue';

const PISTON_URL = process.env.PISTON_API_URL || 'http://localhost:2000';
const executionQueue = new PQueue({ concurrency: 10 });

interface LanguageConfig {
  pistonName: string;
  version: string;
  fileName: string;
}

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  javascript: {
    pistonName: 'javascript',
    version: '*',
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

export interface ExecuteResult {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
  language?: string;
  version?: string;
}

export async function executeCode(
  code: string,
  language: string
): Promise<ExecuteResult> {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return executionQueue.add(async () => {
    const startTime = Date.now();

    const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.pistonName,
        version: config.version,
        files: [{ name: config.fileName, content: code }],
        run_timeout: 3000,
        compile_timeout: 3000,
        run_memory_limit: 128000000,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Piston error: ${errorText}`);
    }

    const data = await response.json() as {
      language: string;
      version: string;
      run?: { stdout?: string; stderr?: string; code?: number };
      compile?: { stdout?: string; stderr?: string; code?: number };
    };

    const executionTime = Date.now() - startTime;

    // Handle compile error (TypeScript, etc.)
    if (data.compile && data.compile.code !== 0) {
      return {
        output: '',
        error: data.compile.stderr || data.compile.stdout || 'Compile error',
        exitCode: data.compile.code || 1,
        executionTime,
        language: data.language,
        version: data.version,
      };
    }

    return {
      output: data.run?.stdout || '',
      error: data.run?.stderr || '',
      exitCode: data.run?.code ?? 0,
      executionTime,
      language: data.language,
      version: data.version,
    };
  }) as Promise<ExecuteResult>;
}
