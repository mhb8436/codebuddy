import { useState } from 'react';

interface DebugBuddyProps {
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  error: string;
  level: string;
  topic?: string;
}

export default function DebugBuddy({ code, language, error, level, topic }: DebugBuddyProps) {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askHelp = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/agent/debug-buddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, error, level, topic })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setResponse(`오류: ${errorData.error || '요청 실패'}`);
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setResponse('스트리밍을 읽을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setResponse(prev => prev + parsed.content);
              } else if (parsed.error) {
                setResponse(prev => prev + `\n오류: ${parsed.error}`);
              }
            } catch {
              // JSON 파싱 실패 무시
            }
          }
        }
      }
    } catch (err) {
      setResponse(`네트워크 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResponse('');
  };

  return (
    <div className="debug-buddy mt-2">
      {!response ? (
        <button
          onClick={askHelp}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
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
              분석 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Debug Buddy 도움받기
            </>
          )}
        </button>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 font-semibold text-sm">Debug Buddy</span>
              <span className="text-xs text-orange-400">AI 디버깅 도우미</span>
            </div>
            <button
              onClick={reset}
              className="text-orange-400 hover:text-orange-600 text-xs"
            >
              닫기
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {response}
            {isLoading && (
              <span className="inline-block w-2 h-4 bg-orange-400 animate-pulse ml-1" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
