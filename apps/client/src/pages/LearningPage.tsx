import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { useCurriculumContext } from '../contexts/CurriculumContext';
import { useProgress } from '../hooks/useProgress';
import Header from '../components/Header';
import ChatPanel from '../components/ChatPanel';
import CodeEditor from '../components/CodeEditor';

type Tab = 'concept' | 'chat' | 'practice' | 'exam';

export default function LearningPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selection,
    currentTopic,
    currentLevel,
    topicNavigation,
    isLoading,
    error,
    navigateToNextTopic,
    navigateToPreviousTopic,
    getContextForAI,
  } = useCurriculumContext();

  const [activeTab, setActiveTab] = useState<Tab>('concept');
  const [practiceSet, setPracticeSet] = useState<any>(null);
  const [examSet, setExamSet] = useState<any>(null);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [editorCode, setEditorCode] = useState<string>('');  // 코드 에디터 상태
  const [conceptEditorCode, setConceptEditorCode] = useState<string>('// 예제 코드를 클릭하면 여기에 로드됩니다\n// 코드를 수정하고 실행해보세요!\n');  // 개념 학습 탭 코드 에디터

  // Progress tracking
  const { startTopic, recordPractice, completeTopic } = useProgress();
  const startedTopicRef = useRef<string | null>(null);

  // Redirect to curriculum if no selection
  useEffect(() => {
    if (!selection && !isLoading) {
      navigate('/curriculum');
    }
  }, [selection, isLoading, navigate]);

  // Record topic start when selection changes
  useEffect(() => {
    if (selection && selection.topicId !== startedTopicRef.current) {
      startedTopicRef.current = selection.topicId;
      startTopic(selection.language, selection.trackId, selection.topicId);
    }
  }, [selection, startTopic]);

  // Handle navigating to next topic with completion
  const handleNavigateToNextTopic = async () => {
    if (selection) {
      await completeTopic(selection.language, selection.trackId, selection.topicId);
    }
    navigateToNextTopic();
  };

  // Handle practice result recording
  const handlePracticeResult = async (isCorrect: boolean) => {
    if (selection) {
      await recordPractice(selection.language, selection.trackId, selection.topicId, isCorrect);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const generatePractice = async () => {
    if (!selection) return;

    setIsPracticeLoading(true);
    try {
      const response = await fetch('/api/agent/practice/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topic: selection.topicName,
          language: selection.language,
          level: currentLevel,
          count: 3, // 기본 3문제 생성
          trackId: selection.trackId,
          topicId: selection.topicId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPracticeSet(data);
      } else {
        const errorData = await response.json();
        console.error('Practice generation failed:', errorData);
      }
    } catch (err) {
      console.error('Failed to generate practice:', err);
    } finally {
      setIsPracticeLoading(false);
    }
  };

  const generateExam = async () => {
    if (!selection) return;

    setIsExamLoading(true);
    try {
      const response = await fetch('/api/agent/exam/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topics: [selection.topicName],
          language: selection.language,
          level: currentLevel,
          questionCount: 5,
          trackId: selection.trackId,
          topicIds: [selection.topicId],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExamSet(data);
      }
    } catch (err) {
      console.error('Failed to generate exam:', err);
    } finally {
      setIsExamLoading(false);
    }
  };

  const tabs = [
    { id: 'concept' as Tab, label: '개념 학습', icon: '📚' },
    { id: 'chat' as Tab, label: 'AI 튜터', icon: '💬' },
    { id: 'practice' as Tab, label: '연습문제', icon: '✏️' },
    { id: 'exam' as Tab, label: '시험', icon: '📝' },
  ];

  if (!selection) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        userName={user?.name}
        className={user?.class?.name || undefined}
      />

      {/* Topic Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => navigate(`/?lang=${selection.language}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {selection.languageName}
                </button>
                <span className="text-gray-400">›</span>
                <button
                  onClick={() => navigate(`/?lang=${selection.language}&track=${selection.trackId}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {selection.trackName}
                </button>
                <span className="text-gray-400">›</span>
                <span className="text-gray-900 font-semibold">{selection.topicName}</span>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              {topicNavigation?.previous && (
                <button
                  onClick={navigateToPreviousTopic}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전
                </button>
              )}
              {topicNavigation?.next && (
                <button
                  onClick={handleNavigateToNextTopic}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  다음
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => navigate('/curriculum')}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
              >
                커리큘럼으로
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-600">{error}</div>
          </div>
        ) : (
          <>
            {/* Concept Tab */}
            {activeTab === 'concept' && currentTopic && (
              <div className="h-full flex">
                {/* 왼쪽: 개념 설명 */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="max-w-3xl space-y-6">
                    {currentTopic.concepts.map((concept: any) => (
                      <div key={concept.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{concept.name}</h3>
                        <p className="text-gray-600 mb-4">{concept.description}</p>

                        {/* Keywords */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {concept.keywords.map((keyword: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>

                        {/* Content - Markdown 렌더링 */}
                        {concept.content && (
                          <div className="prose prose-slate max-w-none mb-6">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({ className, children, ...props }: any) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const isInline = !match;
                                  const codeString = String(children).replace(/\n$/, '');
                                  return isInline ? (
                                    <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <div className="relative group">
                                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                      <button
                                        onClick={() => setConceptEditorCode(codeString)}
                                        className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
                                      >
                                        에디터에 로드
                                      </button>
                                    </div>
                                  );
                                },
                                pre: ({ children }) => <>{children}</>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">{children}</h3>,
                                p: ({ children }) => <p className="text-gray-600 mb-3 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-600 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-600">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                              }}
                            >
                              {concept.content}
                            </ReactMarkdown>
                          </div>
                        )}

                        {/* Runnable Examples */}
                        {concept.runnable_examples && concept.runnable_examples.length > 0 && (
                          <div className="space-y-4 mb-6">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="text-green-600">▶</span> 실행 가능한 예제
                            </h4>
                            {concept.runnable_examples.map((example: any, idx: number) => (
                              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden group relative">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">{example.title}</span>
                                  <button
                                    onClick={() => setConceptEditorCode(example.code)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                  >
                                    <span>▶</span> 에디터에서 실행
                                  </button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                                {example.expected_output && (
                                  <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
                                    <span className="text-xs text-gray-400">예상 출력: </span>
                                    <span className="text-xs text-green-400 font-mono">{example.expected_output}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Legacy Examples (기존 예시 코드) */}
                        {concept.examples && concept.examples.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">예시 코드</h4>
                            {concept.examples.map((example: any, idx: number) => {
                              const codeStr = typeof example === 'string' ? example : example.code;
                              return (
                                <div key={idx} className="relative group">
                                  {typeof example !== 'string' && example.description && (
                                    <p className="text-sm text-gray-500 mb-1">{example.description}</p>
                                  )}
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                    <code>{codeStr}</code>
                                  </pre>
                                  <button
                                    onClick={() => setConceptEditorCode(codeStr)}
                                    className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
                                  >
                                    에디터에 로드
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Quick Actions */}
                    <div className="flex gap-4 pt-4 pb-6">
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>💬</span>
                        AI에게 질문하기
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('practice');
                          if (!practiceSet) generatePractice();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <span>✏️</span>
                        연습문제 풀기
                      </button>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 코드 에디터 */}
                <div className="w-[450px] border-l border-gray-200 flex flex-col bg-white">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-green-600">▶</span> 코드 실행기
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">예제 코드를 클릭하여 직접 실행해보세요</p>
                  </div>
                  <div className="flex-1">
                    <CodeEditor
                      fixedLanguage={selection?.language as 'javascript' | 'typescript' | 'python'}
                      initialCode={conceptEditorCode}
                      showLanguageSelector={false}
                      onCodeChange={setConceptEditorCode}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-full flex">
                <div className="flex-1">
                  <ChatPanel
                    level={currentLevel}
                    curriculumContext={getContextForAI()}
                    codeContext={editorCode}
                    standalone
                  />
                </div>
                <div className="w-[450px] border-l border-gray-200">
                  <CodeEditor
                    fixedLanguage={selection.language as 'javascript' | 'typescript' | 'python'}
                    initialCode={currentTopic?.concepts[0]?.examples[0] || ''}
                    showLanguageSelector={false}
                    onCodeChange={setEditorCode}
                  />
                </div>
              </div>
            )}

            {/* Practice Tab */}
            {activeTab === 'practice' && (
              <div className="h-full p-6">
                {isPracticeLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4" />
                    <p className="text-gray-600">연습문제를 생성하고 있습니다...</p>
                  </div>
                ) : practiceSet ? (
                  <PracticeContent practiceSet={practiceSet} onRegenerate={generatePractice} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-6xl mb-4">✏️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">연습문제 생성</h3>
                    <p className="text-gray-600 mb-6 text-center">
                      "{selection.topicName}" 토픽에 대한<br />
                      맞춤형 연습문제를 생성합니다.
                    </p>
                    <button
                      onClick={generatePractice}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      연습문제 생성하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Exam Tab */}
            {activeTab === 'exam' && (
              <div className="h-full overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                  {isExamLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
                      <p className="text-gray-600">시험 문제를 생성하고 있습니다...</p>
                    </div>
                  ) : examSet ? (
                    <ExamContent examSet={examSet} onRegenerate={generateExam} onRecordPractice={handlePracticeResult} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">시험 보기</h3>
                      <p className="text-gray-600 mb-6 text-center">
                        "{selection.topicName}" 토픽에 대한<br />
                        실력 테스트를 진행합니다.
                      </p>
                      <button
                        onClick={generateExam}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        시험 시작하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Practice Content Component
function PracticeContent({ practiceSet, onRegenerate }: { practiceSet: any; onRegenerate: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [_showSolution, setShowSolution] = useState(false);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    feedback: string;
    testResults?: Array<{ description: string; passed: boolean; expectedOutput: string; actualOutput: string }>;
  } | null>(null);

  const problems = practiceSet.problems || [];
  const currentProblem = problems[currentIndex];

  // 문제가 바뀔 때 코드 초기화
  useEffect(() => {
    setCode(currentProblem?.starterCode || '// 여기에 코드를 작성하세요\n');
    setResult(null);
    setShowHint(false);
    setShowSolution(false);
  }, [currentIndex, currentProblem?.starterCode]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/agent/practice/grade', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          problemId: currentProblem.id,
          code,
          level: practiceSet.level || 'beginner',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setResult({
          passed: false,
          score: 0,
          feedback: errorData.error || '채점에 실패했습니다.',
        });
      }
    } catch (err) {
      console.error('Failed to grade:', err);
      setResult({
        passed: false,
        score: 0,
        feedback: '채점 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentProblem) {
    return <div className="text-gray-600">문제가 없습니다.</div>;
  }

  return (
    <div className="flex gap-6 h-full">
      {/* 왼쪽: 문제 설명 */}
      <div className="w-1/2 space-y-4 overflow-auto">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              문제 {currentIndex + 1} / {problems.length}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded ${
              currentProblem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              currentProblem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentProblem.difficulty === 'easy' ? '쉬움' :
               currentProblem.difficulty === 'medium' ? '보통' : '어려움'}
            </span>
          </div>
          <button
            onClick={onRegenerate}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            새 문제 생성
          </button>
        </div>

        {/* Problem */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentProblem.title}</h3>
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{currentProblem.description}</p>

          {/* Requirements */}
          {currentProblem.requirements && currentProblem.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">요구사항</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {currentProblem.requirements.map((req: string, idx: number) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Test Cases */}
          {currentProblem.testCases && currentProblem.testCases.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">테스트 케이스</h4>
              <div className="space-y-2">
                {currentProblem.testCases.map((tc: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                    <div className="text-gray-600">{tc.description}</div>
                    <div className="text-gray-500 mt-1">예상 출력: <code className="bg-gray-200 px-1 rounded">{tc.expectedOutput}</code></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint */}
          {currentProblem.hints && currentProblem.hints.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showHint ? '힌트 숨기기' : '💡 힌트 보기'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                  {currentProblem.hints[0]}
                </div>
              )}
            </div>
          )}

          {/* Solution - TODO: 빠른 LLM 연결 시 활성화 */}
          {/* <div className="mt-4">
            <button
              onClick={() => setShowSolution(!_showSolution)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {_showSolution ? '정답 숨기기' : '📝 정답 보기'}
            </button>
            {_showSolution && currentProblem.solution && (
              <div className="mt-2">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{currentProblem.solution}</code>
                </pre>
                {currentProblem.explanation && (
                  <p className="mt-2 text-sm text-gray-600">{currentProblem.explanation}</p>
                )}
              </div>
            )}
          </div> */}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 이전 문제
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(problems.length - 1, currentIndex + 1))}
            disabled={currentIndex === problems.length - 1}
            className={`px-4 py-2 rounded-lg transition-all ${
              result?.passed && currentIndex < problems.length - 1
                ? 'bg-green-600 text-white hover:bg-green-700 font-medium animate-pulse'
                : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            다음 문제 →
          </button>
        </div>
      </div>

      {/* 오른쪽: 코드 에디터 및 결과 */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* 코드 에디터 */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
            <span className="text-sm font-medium text-gray-700">
              {practiceSet.language === 'javascript' ? 'JavaScript' :
               practiceSet.language === 'typescript' ? 'TypeScript' : 'Python'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim() || result?.passed}
              className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  채점 중...
                </>
              ) : result?.passed ? (
                '✓ 정답'
              ) : (
                '제출하기'
              )}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
            placeholder="// 여기에 코드를 작성하세요"
            spellCheck={false}
          />
        </div>

        {/* 결과 */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.passed
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl`}>{result.passed ? '✅' : '❌'}</span>
              <span className={`font-semibold ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                {result.passed ? '정답입니다!' : '다시 시도해보세요'}
              </span>
              <span className="ml-auto text-sm text-gray-600">
                점수: {result.score}점
              </span>
            </div>

            {/* 테스트 결과 */}
            {result.testResults && result.testResults.length > 0 && (
              <div className="mb-3 space-y-1">
                {result.testResults.map((tr, idx) => (
                  <div key={idx} className={`text-sm flex items-center gap-2 ${tr.passed ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{tr.passed ? '✓' : '✗'}</span>
                    <span>{tr.description}</span>
                    {!tr.passed && (
                      <span className="text-gray-500">
                        (예상: {tr.expectedOutput}, 실제: {tr.actualOutput || '없음'})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 피드백 */}
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Exam Content Component - 코딩 문제 형식
function ExamContent({ examSet, onRegenerate, onRecordPractice }: {
  examSet: any;
  onRegenerate: () => void;
  onRecordPractice: (isCorrect: boolean) => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [codes, setCodes] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const questions = examSet.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // 시험 시작
  const startExam = async () => {
    // 먼저 시험을 시작 (UI 전환)
    setIsStarted(true);

    // API 호출은 별도로 시도 (실패해도 시험은 진행)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/agent/exam/${examSet.id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAttemptId(data.attemptId);
      }
    } catch (err) {
      console.error('Failed to start exam (API):', err);
      // API 실패해도 시험은 계속 진행 가능
    }
  };

  // 답안 제출
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const code = codes[currentQuestionIndex] || '';
    if (!code.trim()) {
      alert('코드를 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/agent/exam/${examSet.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          attemptId: attemptId || examSet.id,
          questionId: currentQuestion.id,
          code,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setResults(prev => ({ ...prev, [currentQuestionIndex]: result }));
        onRecordPractice(result.passed);
      } else {
        // API 실패 시 기본 결과 표시
        setResults(prev => ({
          ...prev,
          [currentQuestionIndex]: {
            passed: false,
            score: 0,
            maxScore: currentQuestion.points,
            feedback: '채점 서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.'
          }
        }));
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      // 오류 시에도 피드백 표시
      setResults(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          passed: false,
          score: 0,
          maxScore: currentQuestion.points,
          feedback: '채점 서버에 연결할 수 없습니다.'
        }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 시험 시작 전 화면
  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">시험 준비 완료</h3>
        <p className="text-gray-600 mb-2">{questions.length}개 문제 | 총 {examSet.totalPoints}점</p>
        <p className="text-gray-500 text-sm mb-6">제한시간: {examSet.timeLimit}분</p>
        <button
          onClick={startExam}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          시험 시작
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">시험</h3>
          <p className="text-sm text-gray-500">{questions.length}문제 | 총 {examSet.totalPoints}점</p>
        </div>
        <div className="flex gap-2">
          {questions.map((_: any, idx: number) => {
            const result = results[idx];
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  idx === currentQuestionIndex
                    ? 'bg-purple-600 text-white'
                    : result
                    ? result.passed
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </span>
            <span className="text-sm text-gray-500">{currentQuestion.points}점</span>
          </div>

          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            문제 {currentQuestionIndex + 1}. {currentQuestion.title}
          </h4>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{currentQuestion.description}</p>

          {currentQuestion.requirements && currentQuestion.requirements.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">요구사항</h5>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                {currentQuestion.requirements.map((req: string, idx: number) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">테스트 케이스</h5>
              <div className="space-y-2">
                {currentQuestion.testCases.map((tc: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                    <span className="text-gray-600">{tc.description}</span>
                    <span className="text-gray-400 ml-2">({tc.points}점)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2">코드 작성</h5>
            <textarea
              value={codes[currentQuestionIndex] || ''}
              onChange={(e) => setCodes(prev => ({ ...prev, [currentQuestionIndex]: e.target.value }))}
              placeholder="// 여기에 코드를 작성하세요"
              className="w-full h-48 p-3 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
              disabled={!!results[currentQuestionIndex]}
            />
          </div>

          {/* Result */}
          {results[currentQuestionIndex] && (
            <div className={`p-4 rounded-lg mb-4 ${
              results[currentQuestionIndex].passed
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {results[currentQuestionIndex].passed ? (
                  <span className="text-green-600 font-bold">✓ 정답!</span>
                ) : (
                  <span className="text-red-600 font-bold">✗ 오답</span>
                )}
                <span className="text-sm text-gray-600">
                  {results[currentQuestionIndex].score}/{results[currentQuestionIndex].maxScore}점
                </span>
              </div>
              {results[currentQuestionIndex].feedback && (
                <p className="text-sm text-gray-700">{results[currentQuestionIndex].feedback}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
              >
                이전
              </button>
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 disabled:text-gray-300"
              >
                다음
              </button>
            </div>
            {!results[currentQuestionIndex] ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !codes[currentQuestionIndex]?.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '채점 중...' : '제출하기'}
              </button>
            ) : (
              <button
                onClick={onRegenerate}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                새 시험
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
