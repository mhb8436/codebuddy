import { useState } from 'react';

interface CodeMentorProps {
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  output: string;
  level: string;
  topic?: string;
}

export default function CodeMentor({ code, language, output, level, topic }: CodeMentorProps) {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askReview = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/agent/code-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, language, output, level, topic })
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
    <div className="code-mentor mt-2">
      {!response ? (
        <button
          onClick={askReview}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              리뷰 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Code Mentor 리뷰받기
            </>
          )}
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold text-sm">Code Mentor</span>
              <span className="text-xs text-blue-400">AI 코드 리뷰어</span>
            </div>
            <button
              onClick={reset}
              className="text-blue-400 hover:text-blue-600 text-xs"
            >
              닫기
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {response}
            {isLoading && (
              <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
