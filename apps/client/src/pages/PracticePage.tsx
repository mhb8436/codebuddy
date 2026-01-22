import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Editor from '@monaco-editor/react';

interface TestCase {
  description: string;
  expectedOutput: string;
}

interface Problem {
  id: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  requirements: string[];
  hints: string[];
  testCases: TestCase[];
}

interface PracticeSet {
  id: string;
  topic: string;
  language: string;
  level: string;
  problems: Problem[];
}

interface GradeResult {
  passed: boolean;
  score: number;
  testResults: {
    description: string;
    passed: boolean;
    expectedOutput: string;
    actualOutput: string;
  }[];
  feedback: string;
}

const TOPICS = [
  '변수와 상수',
  '조건문 (if/else)',
  '반복문 (for/while)',
  '함수',
  '배열',
  '객체',
  '문자열 처리',
];

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
];

export default function PracticePage() {
  const { user } = useAuth();

  // Generate form state
  const [topic, setTopic] = useState(TOPICS[0]);
  const [language, setLanguage] = useState('javascript');
  const [count, setCount] = useState(3);
  const [level, _setLevel] = useState<'beginner_zero' | 'beginner' | 'beginner_plus'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  // Practice state
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [code, setCode] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [_currentHint, setCurrentHint] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGradeResult(null);
    setHintLevel(0);
    setCurrentHint('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agent/practice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          language,
          level,
          count,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '문제 생성에 실패했습니다.');
      }

      const data = await response.json();
      setPracticeSet(data);
      setCurrentProblemIndex(0);
      setCode(getDefaultCode(language));
    } catch (error) {
      alert(error instanceof Error ? error.message : '문제 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGrade = async () => {
    if (!practiceSet) return;

    const currentProblem = practiceSet.problems[currentProblemIndex];
    setIsGrading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agent/practice/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          code,
          level,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '채점에 실패했습니다.');
      }

      const result = await response.json();
      setGradeResult(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : '채점에 실패했습니다.');
    } finally {
      setIsGrading(false);
    }
  };

  const _handleGetHint = async () => {
    if (!practiceSet) return;

    const currentProblem = practiceSet.problems[currentProblemIndex];
    const nextHintLevel = hintLevel + 1;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/agent/practice/problem/${currentProblem.id}/hint?level=${nextHintLevel}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '힌트를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setHintLevel(data.level);
      setCurrentHint(data.hint);
    } catch (error) {
      alert(error instanceof Error ? error.message : '힌트를 가져오는데 실패했습니다.');
    }
  };
  void _handleGetHint; // TODO: 빠른 LLM 연결 시 활성화

  const handleNextProblem = () => {
    if (!practiceSet || currentProblemIndex >= practiceSet.problems.length - 1) return;
    setCurrentProblemIndex(currentProblemIndex + 1);
    setCode(getDefaultCode(practiceSet.language));
    setGradeResult(null);
    setHintLevel(0);
    setCurrentHint('');
  };

  const handlePrevProblem = () => {
    if (currentProblemIndex <= 0) return;
    setCurrentProblemIndex(currentProblemIndex - 1);
    setCode(getDefaultCode(practiceSet?.language || 'javascript'));
    setGradeResult(null);
    setHintLevel(0);
    setCurrentHint('');
  };

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return '// 여기에 코드를 작성하세요\n\n';
      case 'typescript':
        return '// 여기에 코드를 작성하세요\n\n';
      case 'python':
        return '# 여기에 코드를 작성하세요\n\n';
      default:
        return '';
    }
  };

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'python':
        return 'python';
      default:
        return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
      default:
        return difficulty;
    }
  };

  const currentProblem = practiceSet?.problems[currentProblemIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        userName={user?.name}
        className={user?.class?.name}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Generator / Problem View */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          {!practiceSet ? (
            /* Problem Generator */
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">연습 문제 생성</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학습 주제
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로그래밍 언어
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문제 수: {count}개
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1개</span>
                    <span>10개</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      문제 생성 중...
                    </span>
                  ) : (
                    '문제 생성하기'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Problem View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Problem Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {practiceSet.topic} - {currentProblemIndex + 1} / {practiceSet.problems.length}
                  </span>
                  <button
                    onClick={() => {
                      setPracticeSet(null);
                      setGradeResult(null);
                      setHintLevel(0);
                      setCurrentHint('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    새 문제 세트
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentProblem?.difficulty || 'easy')}`}>
                    {getDifficultyLabel(currentProblem?.difficulty || 'easy')}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">
                    {currentProblem?.title}
                  </h3>
                </div>
              </div>

              {/* Problem Content */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">문제 설명</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{currentProblem?.description}</p>
                  </div>

                  {currentProblem?.requirements && currentProblem.requirements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">요구사항</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {currentProblem.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">테스트 케이스</h4>
                    <div className="space-y-2">
                      {currentProblem?.testCases.map((tc, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">{tc.description}</p>
                          <p className="text-sm font-mono text-gray-800 mt-1">
                            기대 출력: <code className="bg-gray-200 px-1 rounded">{tc.expectedOutput}</code>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hint Section - TODO: 빠른 LLM 연결 시 활성화 */}
                  {/* <div>
                    <button
                      onClick={_handleGetHint}
                      disabled={hintLevel >= (currentProblem?.hints?.length || 0)}
                      className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400"
                    >
                      {hintLevel === 0 ? '힌트 보기' : `다음 힌트 보기 (${hintLevel}/${currentProblem?.hints?.length || 0})`}
                    </button>
                    {_currentHint && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{_currentHint}</p>
                      </div>
                    )}
                  </div> */}

                  {/* Grade Result */}
                  {gradeResult && (
                    <div className={`p-4 rounded-lg ${gradeResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {gradeResult.passed ? (
                          <span className="text-green-600 font-bold">정답입니다!</span>
                        ) : (
                          <span className="text-red-600 font-bold">다시 시도해보세요</span>
                        )}
                        <span className="text-sm text-gray-600">점수: {gradeResult.score}점</span>
                      </div>
                      {gradeResult.feedback && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{gradeResult.feedback}</p>
                      )}
                      {!gradeResult.passed && gradeResult.testResults && (
                        <div className="mt-3 space-y-2">
                          {gradeResult.testResults.map((tr, idx) => (
                            <div key={idx} className={`text-sm p-2 rounded ${tr.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                              <span className={tr.passed ? 'text-green-700' : 'text-red-700'}>
                                {tr.passed ? '✓' : '✗'} {tr.description}
                              </span>
                              {!tr.passed && (
                                <div className="mt-1 text-xs text-gray-600">
                                  기대값: {tr.expectedOutput} / 실제값: {tr.actualOutput}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Problem Navigation */}
              <div className="p-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={handlePrevProblem}
                  disabled={currentProblemIndex === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                >
                  이전 문제
                </button>
                <button
                  onClick={handleNextProblem}
                  disabled={currentProblemIndex >= practiceSet.problems.length - 1}
                  className="px-4 py-2 text-green-600 hover:text-green-700 disabled:text-gray-300"
                >
                  다음 문제
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <span className="text-gray-300 text-sm font-medium">
              {practiceSet ? LANGUAGES.find(l => l.value === practiceSet.language)?.label : 'JavaScript'}
            </span>
            <button
              onClick={handleGrade}
              disabled={!practiceSet || isGrading || !code.trim()}
              className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isGrading ? '채점 중...' : '제출하기'}
            </button>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={getMonacoLanguage(practiceSet?.language || 'javascript')}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
