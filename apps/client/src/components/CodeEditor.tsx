import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import DebugBuddy from './DebugBuddy';
import CodeMentor from './CodeMentor';
import { useAuth } from '../contexts/AuthContext';

type Language = 'javascript' | 'typescript' | 'python';

interface CodeEditorProps {
  fixedLanguage?: Language;        // 고정 언어 (주어지면 선택 불가)
  initialCode?: string;            // 토픽별 초기 코드
  showLanguageSelector?: boolean;  // 기본값 true
  onCodeChange?: (code: string) => void;  // 코드 변경 콜백 (외부 상태 연동용)
}

interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
  language?: string;
  version?: string;
  signal?: string;
}

const LANGUAGE_CONFIG: Record<Language, { label: string; icon: string; defaultCode: string }> = {
  javascript: {
    label: 'JavaScript',
    icon: 'JS',
    defaultCode: `// JavaScript 코드를 입력하세요
console.log("Hello, World!");

// 예시: 1부터 5까지 출력
for (let i = 1; i <= 5; i++) {
  console.log(i);
}`,
  },
  typescript: {
    label: 'TypeScript',
    icon: 'TS',
    defaultCode: `// TypeScript 코드를 입력하세요
const message: string = "Hello, World!";
console.log(message);

// 예시: 타입이 있는 함수
function greet(name: string): string {
  return \`안녕하세요, \${name}님!\`;
}

console.log(greet("학생"));`,
  },
  python: {
    label: 'Python',
    icon: 'PY',
    defaultCode: `# Python 코드를 입력하세요
print("Hello, World!")

# 예시: 1부터 5까지 출력
for i in range(1, 6):
    print(i)`,
  },
};

export default function CodeEditor({
  fixedLanguage,
  initialCode,
  showLanguageSelector = true,
  onCodeChange
}: CodeEditorProps = {}) {
  const { user } = useAuth();
  const effectiveLanguage = fixedLanguage || 'javascript';
  const [language, setLanguage] = useState<Language>(effectiveLanguage);
  const [code, setCode] = useState(initialCode || LANGUAGE_CONFIG[effectiveLanguage].defaultCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pistonStatus, setPistonStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // fixedLanguage나 initialCode가 변경되면 업데이트
  useEffect(() => {
    if (fixedLanguage) {
      setLanguage(fixedLanguage);
    }
  }, [fixedLanguage]);

  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
      onCodeChange?.(initialCode);
    }
  }, [initialCode, onCodeChange]);

  // Piston 서버 상태 확인
  useEffect(() => {
    const checkPiston = async () => {
      try {
        const response = await fetch('/api/code/health');
        if (response.ok) {
          setPistonStatus('ok');
        } else {
          setPistonStatus('error');
        }
      } catch {
        setPistonStatus('error');
      }
    };

    checkPiston();
    // 30초마다 상태 확인
    const interval = setInterval(checkPiston, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    const newCode = LANGUAGE_CONFIG[newLanguage].defaultCode;
    setCode(newCode);
    onCodeChange?.(newCode);
    setResult(null);
  };

  const handleRun = async () => {
    if (pistonStatus === 'error') {
      setResult({
        output: '',
        error: 'Piston 서버에 연결할 수 없습니다.\nDocker에서 Piston이 실행 중인지 확인하세요.\n\n$ docker-compose up -d piston',
        exitCode: 1,
        executionTime: 0,
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          output: '',
          error: data.error || data.message || '알 수 없는 오류가 발생했습니다.',
          exitCode: 1,
          executionTime: 0,
        });
      } else {
        setResult(data);
      }
    } catch {
      setResult({
        output: '',
        error: '코드 실행 중 네트워크 오류가 발생했습니다.',
        exitCode: 1,
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 키보드 단축키 (Ctrl+Enter로 실행)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isRunning) {
        handleRun();
      }
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const hasError = result && (result.error || result.exitCode !== 0);

  return (
    <div className="h-full flex flex-col" onKeyDown={handleKeyDown}>
      {/* 툴바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* 언어 선택 (showLanguageSelector가 true이고 fixedLanguage가 없을 때만 선택 가능) */}
          <div className="flex gap-1">
            {showLanguageSelector && !fixedLanguage ? (
              (Object.keys(LANGUAGE_CONFIG) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    language === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-300'
                  } disabled:opacity-50`}
                  title={LANGUAGE_CONFIG[lang].label}
                >
                  {LANGUAGE_CONFIG[lang].icon}
                </button>
              ))
            ) : (
              <span className="px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white">
                {LANGUAGE_CONFIG[language].icon}
              </span>
            )}
          </div>

          {/* Piston 상태 표시 */}
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                pistonStatus === 'ok'
                  ? 'bg-green-500'
                  : pistonStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
              }`}
            />
            <span className="text-gray-500">
              {pistonStatus === 'ok'
                ? 'Piston 연결됨'
                : pistonStatus === 'error'
                  ? 'Piston 연결 안됨'
                  : '확인 중...'}
            </span>
          </div>
        </div>

        {/* 실행 버튼 */}
        <button
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
          className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              실행 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              실행
            </>
          )}
        </button>
      </div>

      {/* 에디터 영역 */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => {
            const newCode = value || '';
            setCode(newCode);
            onCodeChange?.(newCode);
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 10 },
          }}
        />
      </div>

      {/* 실행 결과 영역 */}
      <div className="h-1/3 border-t border-gray-700 flex flex-col">
        {/* 결과 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">실행 결과</span>
            {result && (
              <span
                className={`px-2 py-0.5 text-xs rounded ${
                  hasError ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                }`}
              >
                {hasError ? '오류' : '성공'}
              </span>
            )}
          </div>
          {result && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {result.version && (
                <span>
                  {result.language} {result.version}
                </span>
              )}
              <span>{formatTime(result.executionTime)}</span>
            </div>
          )}
        </div>

        {/* 결과 내용 */}
        <pre
          className={`flex-1 overflow-auto p-4 bg-gray-900 font-mono text-sm whitespace-pre-wrap ${
            hasError ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {!result && (
            <span className="text-gray-500">
              코드를 실행하면 결과가 여기에 표시됩니다.
              {'\n'}
              단축키: Ctrl+Enter (또는 Cmd+Enter)
            </span>
          )}
          {result && hasError && result.error}
          {result && !hasError && (result.output || '(출력 없음)')}
        </pre>

        {/* Debug Buddy - 에러 발생 시 도움받기 */}
        {result && hasError && result.error && user && (
          <div className="px-4 pb-4 bg-gray-900">
            <DebugBuddy
              code={code}
              language={language}
              error={result.error}
              level={user.level || 'beginner'}
            />
          </div>
        )}

        {/* Code Mentor - 실행 성공 시 코드 리뷰 */}
        {result && !hasError && result.output && user && (
          <div className="px-4 pb-4 bg-gray-900">
            <CodeMentor
              code={code}
              language={language}
              output={result.output}
              level={user.level || 'beginner'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
