import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Editor from '@monaco-editor/react';

interface TestCase {
  description: string;
  points: number;
}

interface ExamQuestion {
  id: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  title: string;
  description: string;
  requirements: string[];
  testCases: TestCase[];
  answered?: boolean;
}

interface Exam {
  id: string;
  topics: string[];
  language: string;
  level: string;
  questionCount: number;
  totalPoints: number;
  timeLimit: number;
  questions: ExamQuestion[];
}

interface ExamAttempt {
  attemptId: string;
  examId: string;
  startedAt: string;
  timeLimit: number;
  remainingTime: number;
  status: string;
  questions: ExamQuestion[];
}

interface SubmitResult {
  questionId: string;
  passed: boolean;
  score: number;
  maxScore: number;
  testResults: {
    description: string;
    passed: boolean;
    points: number;
    earnedPoints: number;
  }[];
  feedback: string;
}

interface ExamResult {
  attemptId: string;
  examId: string;
  totalScore: number;
  totalPoints: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: string;
  questionResults: {
    questionId: string;
    title: string;
    maxScore: number;
    score: number;
    passed: boolean;
  }[];
}

const TOPICS = [
  '변수와 상수',
  '조건문 (if/else)',
  '반복문 (for/while)',
  '함수',
  '배열',
  '객체',
];

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
];

type ExamPhase = 'setup' | 'taking' | 'result';

export default function ExamPage() {
  const { user } = useAuth();

  // Phase
  const [phase, setPhase] = useState<ExamPhase>('setup');

  // Setup form state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([TOPICS[0]]);
  const [language, setLanguage] = useState('javascript');
  const [questionCount, setQuestionCount] = useState(3);
  const [timeLimit, setTimeLimit] = useState(30);
  const [level, _setLevel] = useState<'beginner_zero' | 'beginner' | 'beginner_plus'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  // Exam taking state
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState<Map<string, SubmitResult>>(new Map());
  const [remainingTime, setRemainingTime] = useState(0);

  // Result state
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== 'taking' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleGenerateExam = async () => {
    if (selectedTopics.length === 0) {
      alert('최소 1개의 주제를 선택해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agent/exam/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topics: selectedTopics,
          language,
          level,
          questionCount,
          timeLimit,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '시험 생성에 실패했습니다.');
      }

      const examData = await response.json();
      setExam(examData);

      // Start exam
      const startResponse = await fetch(`/api/agent/exam/${examData.id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!startResponse.ok) {
        const error = await startResponse.json();
        throw new Error(error.error || '시험 시작에 실패했습니다.');
      }

      const attemptData = await startResponse.json();
      setAttempt(attemptData);
      setRemainingTime(attemptData.remainingTime * 60); // Convert minutes to seconds
      setPhase('taking');
      setCurrentQuestionIndex(0);
      setCode(getDefaultCode(language));
      setSubmitResults(new Map());
    } catch (error) {
      alert(error instanceof Error ? error.message : '시험 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!exam || !attempt) return;

    const currentQuestion = exam.questions[currentQuestionIndex];
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/agent/exam/${exam.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          attemptId: attempt.attemptId,
          questionId: currentQuestion.id,
          code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '답안 제출에 실패했습니다.');
      }

      const result = await response.json();
      setSubmitResults((prev) => new Map(prev).set(currentQuestion.id, result));
    } catch (error) {
      alert(error instanceof Error ? error.message : '답안 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishExam = async () => {
    if (!exam || !attempt) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/agent/exam/${exam.id}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          attemptId: attempt.attemptId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '시험 종료에 실패했습니다.');
      }

      const result = await response.json();
      setExamResult(result);
      setPhase('result');
    } catch (error) {
      alert(error instanceof Error ? error.message : '시험 종료에 실패했습니다.');
    }
  };

  const handleNextQuestion = () => {
    if (!exam || currentQuestionIndex >= exam.questions.length - 1) return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setCode(getDefaultCode(exam.language));
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    setCurrentQuestionIndex(currentQuestionIndex - 1);
    setCode(getDefaultCode(exam?.language || 'javascript'));
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setCode(getDefaultCode(exam?.language || 'javascript'));
  };

  const handleRestartExam = () => {
    setPhase('setup');
    setExam(null);
    setAttempt(null);
    setExamResult(null);
    setCurrentQuestionIndex(0);
    setCode('');
    setSubmitResults(new Map());
    setRemainingTime(0);
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const currentQuestion = exam?.questions[currentQuestionIndex];
  const currentResult = currentQuestion ? submitResults.get(currentQuestion.id) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        userName={user?.name}
        className={user?.class?.name}
      />

      {phase === 'setup' && (
        /* Exam Setup */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">시험 설정</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시험 범위 (복수 선택 가능)
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleTopicToggle(topic)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedTopics.includes(topic)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로그래밍 언어
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문제 수: {questionCount}개
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제한 시간: {timeLimit}분
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">시험 정보</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>- 선택된 주제: {selectedTopics.join(', ') || '없음'}</li>
                  <li>- 문제 수: {questionCount}개 (문제당 10점, 총 {questionCount * 10}점)</li>
                  <li>- 제한 시간: {timeLimit}분</li>
                  <li>- 시험 중에는 힌트를 볼 수 없습니다</li>
                </ul>
              </div>

              <button
                onClick={handleGenerateExam}
                disabled={isGenerating || selectedTopics.length === 0}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    시험 생성 중...
                  </span>
                ) : (
                  '시험 시작하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'taking' && exam && (
        /* Exam Taking */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Question */}
          <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
            {/* Timer & Progress */}
            <div className="p-4 border-b border-gray-200 bg-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-mono font-bold ${remainingTime < 300 ? 'text-red-600' : 'text-purple-700'}`}>
                    {formatTime(remainingTime)}
                  </span>
                  <span className="text-sm text-gray-600">
                    남은 시간
                  </span>
                </div>
                <button
                  onClick={handleFinishExam}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  시험 종료
                </button>
              </div>

              {/* Question Navigation */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {exam.questions.map((q, idx) => {
                  const result = submitResults.get(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleGoToQuestion(idx)}
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

            {/* Question Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentQuestion?.difficulty || 'easy')}`}>
                    {getDifficultyLabel(currentQuestion?.difficulty || 'easy')}
                  </span>
                  <span className="text-sm text-gray-500">{currentQuestion?.points}점</span>
                </div>

                <h3 className="text-xl font-bold text-gray-800">
                  문제 {currentQuestionIndex + 1}. {currentQuestion?.title}
                </h3>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">문제 설명</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{currentQuestion?.description}</p>
                </div>

                {currentQuestion?.requirements && currentQuestion.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">요구사항</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {currentQuestion.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">테스트 케이스</h4>
                  <div className="space-y-2">
                    {currentQuestion?.testCases.map((tc, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">{tc.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{tc.points}점</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Result */}
                {currentResult && (
                  <div className={`p-4 rounded-lg ${currentResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {currentResult.passed ? (
                        <span className="text-green-600 font-bold">정답!</span>
                      ) : (
                        <span className="text-red-600 font-bold">오답</span>
                      )}
                      <span className="text-sm text-gray-600">
                        {currentResult.score}/{currentResult.maxScore}점
                      </span>
                    </div>
                    {currentResult.feedback && (
                      <p className="text-sm text-gray-700">{currentResult.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="p-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
              >
                이전 문제
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= exam.questions.length - 1}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 disabled:text-gray-300"
              >
                다음 문제
              </button>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col bg-gray-900">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">
                {LANGUAGES.find(l => l.value === exam.language)?.label}
              </span>
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !code.trim()}
                className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '채점 중...' : '답안 제출'}
              </button>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                language={getMonacoLanguage(exam.language)}
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
      )}

      {phase === 'result' && examResult && (
        /* Exam Result */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">시험 결과</h2>

            {/* Grade */}
            <div className="text-center mb-8">
              <div className={`text-8xl font-bold ${getGradeColor(examResult.grade)}`}>
                {examResult.grade}
              </div>
              <div className="text-2xl text-gray-700 mt-2">
                {examResult.totalScore} / {examResult.totalPoints}점
              </div>
              <div className="text-lg text-gray-500">
                ({examResult.percentage}%)
              </div>
            </div>

            {/* Question Results */}
            <div className="space-y-3 mb-8">
              <h3 className="font-medium text-gray-700">문제별 결과</h3>
              {examResult.questionResults.map((qr, idx) => (
                <div
                  key={qr.questionId}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    qr.passed ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      qr.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{qr.title}</span>
                  </div>
                  <span className={qr.passed ? 'text-green-600' : 'text-red-600'}>
                    {qr.score}/{qr.maxScore}점
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleRestartExam}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                새 시험 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
