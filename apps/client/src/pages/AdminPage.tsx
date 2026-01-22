import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useQuestionBank } from '../hooks/useQuestionBank';

type Tab = 'classes' | 'students' | 'stats' | 'models' | 'progress' | 'question-bank' | 'curriculum';

const LEVEL_LABELS: Record<string, string> = {
  beginner_zero: '초초보',
  beginner: '초보',
  beginner_plus: '조금아는초보',
};

const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-5': 'Claude Sonnet 4.5',
  'claude-haiku-4-5': 'Claude Haiku 4.5',
  'gpt-5-mini': 'GPT-5 Mini',
  'gpt-5-nano': 'GPT-5 Nano',
  'gpt-4.1-mini': 'GPT-4.1 Mini',
  'o3-mini': 'O3 Mini',
  'unknown': '알 수 없음',
};

const COST_TIER_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: '고비용', color: 'bg-red-100 text-red-800' },
  medium: { label: '중비용', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: '저비용', color: 'bg-green-100 text-green-800' },
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const {
    classes,
    selectedClass,
    isLoading,
    error,
    fetchClasses,
    fetchClassDetails,
    createClass,
    updateClass,
    deleteClass,
    regenerateInviteCode,
    updateUserRole,
    clearSelectedClass,
    // Statistics
    summaryStats,
    modelStats,
    levelStats,
    dailyStats,
    userStats,
    fetchAllStats,
    // Model config
    availableModels,
    modelConfigs,
    fetchAvailableModels,
    fetchModelConfigs,
    updateModelConfig,
    // Learning progress
    classProgress,
    trackProgress,
    studentProgress,
    fetchClassProgress,
    fetchTrackProgress,
    fetchStudentProgress,
    clearProgress,
    // Curriculum management
    curriculumLanguages,
    curriculumTracks,
    fetchCurriculumLanguages,
    fetchCurriculumFull,
    createConcept,
    updateConcept,
    deleteConcept,
    createTopic,
    updateTopic,
    deleteTopic,
    createStage,
    updateStage,
    deleteStage,
    clearCurriculum,
  } = useAdmin();

  const {
    isLoading: qbIsLoading,
    error: qbError,
    languages,
    tracks: qbTracks,
    stats: qbStats,
    questions,
    jobs,
    selectedQuestion,
    setSelectedQuestion,
    fetchLanguages,
    fetchTracks,
    fetchStats,
    fetchQuestions,
    generateQuestions,
    fetchJobs,
    updateQuestionStatus,
    deleteQuestion,
    bulkApprove,
    clearQuestions,
  } = useQuestionBank();

  const [activeTab, setActiveTab] = useState<Tab>('classes');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<{ id: string; name: string; maxStudents: number } | null>(null);

  // 모델 설정 편집 상태
  const [editingModelConfig, setEditingModelConfig] = useState<{
    level: string;
    endpoint: string;
    apiKey: string;
    apiVersion: string;
  } | null>(null);
  const [showModelConfigModal, setShowModelConfigModal] = useState(false);

  // 새 반 생성 폼
  const [newClassName, setNewClassName] = useState('');
  const [newMaxStudents, setNewMaxStudents] = useState(30);
  const [newExpiresInDays, setNewExpiresInDays] = useState<number | ''>('');

  // 진도 관리 상태
  const [progressClassId, setProgressClassId] = useState<string>('');
  const [progressView, setProgressView] = useState<'overview' | 'track' | 'student'>('overview');
  const [selectedTrack, setSelectedTrack] = useState<{ language: string; trackId: string } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // 문제 은행 상태
  const [qbLanguage, setQbLanguage] = useState<string>('');
  const [qbTrackId, setQbTrackId] = useState<string>('');
  const [qbTopicId, setQbTopicId] = useState<string>('');
  const [qbStatusFilter, setQbStatusFilter] = useState<string>('');
  const [qbDifficultyFilter, setQbDifficultyFilter] = useState<string>('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateConfig, setGenerateConfig] = useState({ easy: 3, medium: 3, hard: 2 });
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // 커리큘럼 관리 상태
  const [currLanguage, setCurrLanguage] = useState<string>('');
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingConcept, setEditingConcept] = useState<{
    id?: string;
    topicId: string;
    name: string;
    description: string;
    keywords: string;
    examples: string[];
    displayOrder: number;
  } | null>(null);
  const [editingTopic, setEditingTopic] = useState<{
    id?: string;
    stageId: string;
    name: string;
    displayOrder: number;
  } | null>(null);
  const [editingStage, setEditingStage] = useState<{
    id?: string;
    trackId: string;
    name: string;
    displayOrder: number;
  } | null>(null);

  // 삭제 확인 모달 상태
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: 'concept' | 'topic' | 'stage' | null;
    id: string;
    name: string;
    message: string;
  }>({ show: false, type: null, id: '', name: '', message: '' });

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchAllStats();
    }
  }, [activeTab, fetchAllStats]);

  useEffect(() => {
    if (activeTab === 'models') {
      fetchAvailableModels();
      fetchModelConfigs();
    }
  }, [activeTab, fetchAvailableModels, fetchModelConfigs]);

  // 진도 탭에서 반 선택 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'progress' && progressClassId) {
      if (progressView === 'overview') {
        fetchClassProgress(progressClassId);
      } else if (progressView === 'track' && selectedTrack) {
        fetchTrackProgress(progressClassId, selectedTrack.language, selectedTrack.trackId);
      } else if (progressView === 'student' && selectedStudentId) {
        fetchStudentProgress(selectedStudentId);
      }
    }
  }, [activeTab, progressClassId, progressView, selectedTrack, selectedStudentId, fetchClassProgress, fetchTrackProgress, fetchStudentProgress]);

  // 탭 변경 시 진도 상태 초기화
  useEffect(() => {
    if (activeTab !== 'progress') {
      clearProgress();
      setProgressClassId('');
      setProgressView('overview');
      setSelectedTrack(null);
      setSelectedStudentId(null);
    }
  }, [activeTab, clearProgress]);

  // 문제 은행 탭 진입 시 언어 목록 로드
  useEffect(() => {
    if (activeTab === 'question-bank') {
      fetchLanguages();
      fetchJobs();
    }
  }, [activeTab, fetchLanguages, fetchJobs]);

  // 문제 은행 - 언어 선택 시 트랙 목록 로드
  useEffect(() => {
    if (qbLanguage) {
      fetchTracks(qbLanguage);
      setQbTrackId('');
      setQbTopicId('');
      clearQuestions();
    }
  }, [qbLanguage, fetchTracks, clearQuestions]);

  // 문제 은행 - 트랙 선택 시 통계 로드
  useEffect(() => {
    if (qbLanguage && qbTrackId) {
      fetchStats(qbLanguage, qbTrackId);
      setQbTopicId('');
      clearQuestions();
    }
  }, [qbLanguage, qbTrackId, fetchStats, clearQuestions]);

  // 문제 은행 - 토픽 선택 시 문제 목록 로드
  useEffect(() => {
    if (qbLanguage && qbTrackId && qbTopicId) {
      fetchQuestions(qbLanguage, qbTrackId, qbTopicId, qbStatusFilter || undefined, qbDifficultyFilter || undefined);
      setSelectedQuestionIds(new Set());
    }
  }, [qbLanguage, qbTrackId, qbTopicId, qbStatusFilter, qbDifficultyFilter, fetchQuestions]);

  // 커리큘럼 탭 진입 시 언어 목록 로드
  useEffect(() => {
    if (activeTab === 'curriculum') {
      fetchCurriculumLanguages();
    }
  }, [activeTab, fetchCurriculumLanguages]);

  // 커리큘럼 - 언어 선택 시 전체 데이터 로드
  useEffect(() => {
    if (currLanguage && activeTab === 'curriculum') {
      fetchCurriculumFull(currLanguage);
    }
  }, [currLanguage, activeTab, fetchCurriculumFull]);

  // 커리큘럼 탭 변경 시 상태 초기화
  useEffect(() => {
    if (activeTab !== 'curriculum') {
      clearCurriculum();
      setCurrLanguage('');
      setExpandedTracks(new Set());
      setExpandedStages(new Set());
      setExpandedTopics(new Set());
    }
  }, [activeTab, clearCurriculum]);

  // 문제 은행 핸들러
  const handleGenerateQuestions = async () => {
    if (!qbLanguage || !qbTrackId || !qbTopicId) return;
    const topicStat = qbStats.find((s) => s.topic_id === qbTopicId);
    const topicName = topicStat?.topic_name || qbTopicId;
    try {
      await generateQuestions(qbLanguage, qbTrackId, qbTopicId, topicName, generateConfig);
      setShowGenerateModal(false);
      fetchJobs();
      alert('문제 생성 작업이 시작되었습니다. 잠시 후 새로고침하세요.');
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleApproveQuestion = async (questionId: string) => {
    try {
      await updateQuestionStatus(questionId, 'approved');
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleRejectQuestion = async (questionId: string) => {
    if (!confirm('이 문제를 거부하시겠습니까?')) return;
    try {
      await updateQuestionStatus(questionId, 'rejected');
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('이 문제를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;
    try {
      await deleteQuestion(questionId);
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleBulkApprove = async () => {
    if (selectedQuestionIds.size === 0) return;
    if (!confirm(`${selectedQuestionIds.size}개의 문제를 승인하시겠습니까?`)) return;
    try {
      await bulkApprove(Array.from(selectedQuestionIds));
      setSelectedQuestionIds(new Set());
      fetchStats(qbLanguage, qbTrackId);
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllPending = () => {
    const pendingIds = questions.filter((q) => q.status === 'pending').map((q) => q.id);
    setSelectedQuestionIds(new Set(pendingIds));
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClass({
        name: newClassName,
        maxStudents: newMaxStudents,
        expiresInDays: newExpiresInDays || undefined,
      });
      setShowCreateModal(false);
      setNewClassName('');
      setNewMaxStudents(30);
      setNewExpiresInDays('');
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      await updateClass(editingClass.id, {
        name: editingClass.name,
        maxStudents: editingClass.maxStudents,
      });
      setShowEditModal(false);
      setEditingClass(null);
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`"${className}" 반을 삭제하시겠습니까?\n\n모든 학생과 데이터가 삭제됩니다.`)) return;
    try {
      await deleteClass(classId);
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const handleRegenerateCode = async (classId: string) => {
    if (!confirm('새 초대 코드를 생성하시겠습니까?\n\n기존 코드는 더 이상 사용할 수 없습니다.')) return;
    try {
      const newCode = await regenerateInviteCode(classId);
      alert(`새 초대 코드: ${newCode}`);
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  const handleModelChange = async (level: string, modelName: string) => {
    const selectedModel = availableModels.find((m) => m.modelName === modelName);
    if (!selectedModel) return;

    try {
      await updateModelConfig(level, {
        provider: selectedModel.provider,
        modelName,
      });
      alert('모델 설정이 변경되었습니다');
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const handleOpenModelConfigEdit = (level: string) => {
    const config = modelConfigs.find((c) => c.level === level);
    setEditingModelConfig({
      level,
      endpoint: config?.endpoint || '',
      apiKey: '',  // 보안상 빈 값으로 시작 (새로 입력해야 함)
      apiVersion: config?.api_version || '',
    });
    setShowModelConfigModal(true);
  };

  const handleSaveModelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModelConfig) return;

    try {
      const input: { endpoint?: string; apiKey?: string; apiVersion?: string } = {};

      if (editingModelConfig.endpoint) {
        input.endpoint = editingModelConfig.endpoint;
      }
      if (editingModelConfig.apiKey) {
        input.apiKey = editingModelConfig.apiKey;
      }
      if (editingModelConfig.apiVersion !== undefined) {
        input.apiVersion = editingModelConfig.apiVersion;
      }

      if (Object.keys(input).length === 0) {
        alert('변경할 내용이 없습니다');
        return;
      }

      await updateModelConfig(editingModelConfig.level, input);
      alert('모델 설정이 저장되었습니다');
      setShowModelConfigModal(false);
      setEditingModelConfig(null);
    } catch {
      // 에러는 useAdmin에서 처리됨
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 커리큘럼 핸들러
  const toggleExpand = (type: 'track' | 'stage' | 'topic', id: string) => {
    const setFn = type === 'track' ? setExpandedTracks : type === 'stage' ? setExpandedStages : setExpandedTopics;
    setFn((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSaveConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConcept) return;
    try {
      const data = {
        name: editingConcept.name,
        description: editingConcept.description,
        keywords: editingConcept.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        examples: editingConcept.examples.filter((ex) => ex.trim()),
        displayOrder: editingConcept.displayOrder,
      };
      if (editingConcept.id) {
        await updateConcept(editingConcept.id, data);
      } else {
        await createConcept({ ...data, topicId: editingConcept.topicId });
      }
      setShowConceptModal(false);
      setEditingConcept(null);
      fetchCurriculumFull(currLanguage);
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleDeleteConcept = (conceptId: string, conceptName: string) => {
    setDeleteConfirm({
      show: true,
      type: 'concept',
      id: conceptId,
      name: conceptName,
      message: `"${conceptName}" 개념을 삭제하시겠습니까?`,
    });
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    try {
      const data = {
        name: editingTopic.name,
        displayOrder: editingTopic.displayOrder,
      };
      if (editingTopic.id) {
        await updateTopic(editingTopic.id, data);
      } else {
        await createTopic({ ...data, stageId: editingTopic.stageId });
      }
      setShowTopicModal(false);
      setEditingTopic(null);
      fetchCurriculumFull(currLanguage);
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleDeleteTopic = (topicId: string, topicName: string) => {
    setDeleteConfirm({
      show: true,
      type: 'topic',
      id: topicId,
      name: topicName,
      message: `"${topicName}" 토픽과 하위 모든 개념을 삭제하시겠습니까?`,
    });
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;
    try {
      const data = {
        name: editingStage.name,
        displayOrder: editingStage.displayOrder,
      };
      if (editingStage.id) {
        await updateStage(editingStage.id, data);
      } else {
        await createStage({ ...data, trackId: editingStage.trackId });
      }
      setShowStageModal(false);
      setEditingStage(null);
      fetchCurriculumFull(currLanguage);
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  const handleDeleteStage = (stageId: string, stageName: string) => {
    setDeleteConfirm({
      show: true,
      type: 'stage',
      id: stageId,
      name: stageName,
      message: `"${stageName}" 스테이지와 하위 모든 토픽/개념을 삭제하시겠습니까?`,
    });
  };

  // 삭제 확인 모달에서 확인 클릭 시 실행
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.type || !deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === 'concept') {
        await deleteConcept(deleteConfirm.id);
      } else if (deleteConfirm.type === 'topic') {
        await deleteTopic(deleteConfirm.id);
      } else if (deleteConfirm.type === 'stage') {
        await deleteStage(deleteConfirm.id);
      }
      fetchCurriculumFull(currLanguage);
    } catch {
      // 에러는 hook에서 처리됨
    } finally {
      setDeleteConfirm({ show: false, type: null, id: '', name: '', message: '' });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">CodeBuddy 관리자</h1>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {user?.role === 'admin' ? '관리자' : '강사'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              메인으로
            </Link>
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            <button
              onClick={() => { setActiveTab('classes'); clearSelectedClass(); }}
              className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'classes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              반 관리
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              학생 관리
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              사용량 통계
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              학습 진도
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('models')}
                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'models'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                모델 설정
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('question-bank')}
                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'question-bank'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                문제 은행
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'curriculum'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                커리큘럼 관리
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'classes' && (
          <div>
            {/* 반 관리 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">반 목록</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  + 새 반 만들기
                </button>
              )}
            </div>

            {/* 반 목록 */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">로딩 중...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                등록된 반이 없습니다.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{cls.name}</h3>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingClass({
                                id: cls.id,
                                name: cls.name,
                                maxStudents: cls.max_students,
                              });
                              setShowEditModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id, cls.name)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="삭제"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>초대 코드</span>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded font-mono">
                            {cls.invite_code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(cls.invite_code)}
                            className="text-blue-600 hover:text-blue-800"
                            title="복사"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleRegenerateCode(cls.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title="코드 재생성"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>정원</span>
                        <span>{cls.max_students}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>만료일</span>
                        <span>{formatDate(cls.expires_at)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        fetchClassDetails(cls.id);
                        setActiveTab('students');
                      }}
                      className="mt-4 w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                    >
                      학생 목록 보기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            {!selectedClass ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">반을 선택해주세요</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => fetchClassDetails(cls.id)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {cls.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearSelectedClass}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedClass.name}
                    </h2>
                    <span className="text-sm text-gray-500">
                      ({selectedClass.studentCount}/{selectedClass.max_students}명)
                    </span>
                  </div>
                </div>

                {selectedClass.students.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    등록된 학생이 없습니다.
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            이름
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            이메일
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            수준
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            역할
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            마지막 로그인
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedClass.students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.email}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded ${
                                student.level === 'beginner_zero'
                                  ? 'bg-green-100 text-green-800'
                                  : student.level === 'beginner'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                              }`}>
                                {student.level === 'beginner_zero'
                                  ? '초초보'
                                  : student.level === 'beginner'
                                    ? '초보'
                                    : '조금아는초보'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {isAdmin ? (
                                <select
                                  value={student.role}
                                  onChange={(e) => handleRoleChange(student.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="student">학생</option>
                                  <option value="instructor">강사</option>
                                  <option value="admin">관리자</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-1 text-xs rounded ${
                                  student.role === 'admin'
                                    ? 'bg-red-100 text-red-800'
                                    : student.role === 'instructor'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {student.role === 'admin'
                                    ? '관리자'
                                    : student.role === 'instructor'
                                      ? '강사'
                                      : '학생'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(student.lastLoginAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            {summaryStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">총 학생 수</div>
                  <div className="text-2xl font-bold text-gray-900">{summaryStats.totalUsers}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">총 세션 수</div>
                  <div className="text-2xl font-bold text-gray-900">{summaryStats.totalSessions}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">총 메시지 수</div>
                  <div className="text-2xl font-bold text-gray-900">{summaryStats.totalMessages.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">예상 비용</div>
                  <div className="text-2xl font-bold text-green-600">${summaryStats.estimatedCost.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* 오늘의 통계 + 업그레이드 통계 */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">오늘의 사용량</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">메시지</div>
                      <div className="text-xl font-bold">{summaryStats.todayMessages}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">토큰</div>
                      <div className="text-xl font-bold">{summaryStats.todayTokens.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">모델 업그레이드 현황</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">총 세션</div>
                      <div className="text-xl font-bold">{summaryStats.upgradeStats.total}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">업그레이드됨</div>
                      <div className="text-xl font-bold text-green-600">{summaryStats.upgradeStats.upgraded}</div>
                    </div>
                  </div>
                  {Object.keys(summaryStats.upgradeStats.reasons).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">업그레이드 사유</div>
                      {Object.entries(summaryStats.upgradeStats.reasons).map(([reason, count]) => (
                        <div key={reason} className="text-sm flex justify-between">
                          <span>{reason}</span>
                          <span className="font-medium">{count}회</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 모델별 통계 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">모델별 사용량</h3>
              {modelStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">데이터가 없습니다</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">모델</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">메시지</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">토큰</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">예상 비용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelStats.map((stat) => (
                        <tr key={stat.model_used} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{MODEL_LABELS[stat.model_used] || stat.model_used}</td>
                          <td className="py-2 text-sm text-right">{stat.message_count.toLocaleString()}</td>
                          <td className="py-2 text-sm text-right">{stat.total_tokens.toLocaleString()}</td>
                          <td className="py-2 text-sm text-right text-green-600">${stat.estimated_cost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 수준별 통계 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">수준별 사용량</h3>
              {levelStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">데이터가 없습니다</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">수준</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">학생 수</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">세션</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">메시지</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">토큰</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levelStats.map((stat) => (
                        <tr key={stat.level} className="border-b border-gray-100">
                          <td className="py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              stat.level === 'beginner_zero'
                                ? 'bg-green-100 text-green-800'
                                : stat.level === 'beginner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}>
                              {LEVEL_LABELS[stat.level] || stat.level}
                            </span>
                          </td>
                          <td className="py-2 text-sm text-right">{stat.user_count}</td>
                          <td className="py-2 text-sm text-right">{stat.session_count}</td>
                          <td className="py-2 text-sm text-right">{stat.message_count.toLocaleString()}</td>
                          <td className="py-2 text-sm text-right">{stat.total_tokens.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 일별 통계 (최근 7일) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">일별 사용량 (최근 7일)</h3>
              {dailyStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">데이터가 없습니다</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">날짜</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">사용자</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">메시지</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">토큰</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyStats.slice(0, 7).map((stat) => (
                        <tr key={stat.date} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{stat.date}</td>
                          <td className="py-2 text-sm text-right">{stat.unique_users}</td>
                          <td className="py-2 text-sm text-right">{stat.message_count.toLocaleString()}</td>
                          <td className="py-2 text-sm text-right">{stat.total_tokens.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 사용자별 통계 (상위 10명) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">사용자별 사용량 (상위 10명)</h3>
              {userStats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">데이터가 없습니다</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">이름</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">반</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">수준</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">세션</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">메시지</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">토큰</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userStats.slice(0, 10).map((stat) => (
                        <tr key={stat.user_id} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{stat.user_name}</td>
                          <td className="py-2 text-sm text-gray-500">{stat.class_name || '-'}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              stat.level === 'beginner_zero'
                                ? 'bg-green-100 text-green-800'
                                : stat.level === 'beginner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}>
                              {LEVEL_LABELS[stat.level] || stat.level}
                            </span>
                          </td>
                          <td className="py-2 text-sm text-right">{stat.session_count}</td>
                          <td className="py-2 text-sm text-right">{stat.message_count.toLocaleString()}</td>
                          <td className="py-2 text-sm text-right">{stat.total_tokens.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* 반 선택 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">반 선택:</label>
                <select
                  value={progressClassId}
                  onChange={(e) => {
                    setProgressClassId(e.target.value);
                    setProgressView('overview');
                    setSelectedTrack(null);
                    setSelectedStudentId(null);
                    clearProgress();
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">반을 선택하세요</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>

                {/* 뒤로 가기 버튼 (상세 뷰에서) */}
                {progressView !== 'overview' && (
                  <button
                    onClick={() => {
                      setProgressView('overview');
                      setSelectedTrack(null);
                      setSelectedStudentId(null);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    전체 현황으로
                  </button>
                )}
              </div>
            </div>

            {/* 반 미선택 시 안내 */}
            {!progressClassId && (
              <div className="text-center py-12 text-gray-500">
                학습 진도를 확인할 반을 선택해주세요.
              </div>
            )}

            {/* 로딩 중 */}
            {isLoading && progressClassId && (
              <div className="text-center py-12 text-gray-500">로딩 중...</div>
            )}

            {/* 전체 현황 뷰 */}
            {progressView === 'overview' && classProgress && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classProgress.className} - 학습 현황
                  </h3>
                  <span className="text-sm text-gray-500">
                    총 {classProgress.studentCount}명
                  </span>
                </div>

                {classProgress.students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                    아직 학습을 시작한 학생이 없습니다.
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">언어/트랙</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">진도율</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">완료 토픽</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">최근 활동</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상세</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {classProgress.students.map((student, idx) => (
                          <tr key={`${student.userId}-${student.language}-${student.trackId}-${idx}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{student.userName}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                {student.language.toUpperCase()} / {student.trackId}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      student.progressPercent >= 80
                                        ? 'bg-green-500'
                                        : student.progressPercent >= 50
                                          ? 'bg-yellow-500'
                                          : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${student.progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{student.progressPercent}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.completedTopics}/{student.totalTopics}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {student.lastActivityAt ? formatDate(student.lastActivityAt) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedTrack({ language: student.language, trackId: student.trackId });
                                    setProgressView('track');
                                  }}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  트랙 상세
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStudentId(student.userId);
                                    setProgressView('student');
                                  }}
                                  className="text-xs text-green-600 hover:underline"
                                >
                                  학생 상세
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 트랙 상세 뷰 */}
            {progressView === 'track' && trackProgress && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trackProgress.className} - {trackProgress.language.toUpperCase()} / {trackProgress.trackId}
                  </h3>
                </div>

                {trackProgress.students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                    이 트랙을 학습한 학생이 없습니다.
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">토픽</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연습 횟수</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">정확도</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">완료일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {trackProgress.students.map((student, idx) => (
                          <tr key={`${student.userId}-${student.topicId}-${idx}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{student.userName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.topicId}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded ${
                                student.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : student.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status === 'completed' ? '완료' : student.status === 'in_progress' ? '진행중' : '미시작'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.practiceCount}회</td>
                            <td className="px-4 py-3">
                              {student.practiceCount > 0 ? (
                                <span className={`text-sm font-medium ${
                                  student.accuracy >= 80 ? 'text-green-600' : student.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {student.accuracy}%
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {student.completedAt ? formatDate(student.completedAt) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 학생 상세 뷰 */}
            {progressView === 'student' && studentProgress && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {studentProgress.userName}의 학습 현황
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    studentProgress.level === 'beginner_zero'
                      ? 'bg-green-100 text-green-800'
                      : studentProgress.level === 'beginner'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                  }`}>
                    {LEVEL_LABELS[studentProgress.level] || studentProgress.level}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{studentProgress.email}</p>

                {studentProgress.enrolledTracks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                    등록된 학습 트랙이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentProgress.enrolledTracks.map((track) => (
                      <div key={`${track.language}-${track.trackId}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {track.language.toUpperCase()}
                            </span>
                            <span className="font-medium text-gray-900">{track.trackId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  track.progressPercent >= 80
                                    ? 'bg-green-500'
                                    : track.progressPercent >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-blue-500'
                                }`}
                                style={{ width: `${track.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{track.progressPercent}%</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                          등록일: {formatDate(track.enrolledAt)} | 최근 활동: {formatDate(track.lastActivityAt)}
                        </div>

                        {track.topics.length > 0 && (
                          <div className="border-t border-gray-100 pt-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-gray-500">
                                  <th className="text-left py-1">토픽</th>
                                  <th className="text-left py-1">상태</th>
                                  <th className="text-left py-1">연습</th>
                                  <th className="text-left py-1">정답</th>
                                </tr>
                              </thead>
                              <tbody>
                                {track.topics.map((topic) => (
                                  <tr key={topic.topicId} className="border-t border-gray-50">
                                    <td className="py-2 text-gray-700">{topic.topicId}</td>
                                    <td className="py-2">
                                      {topic.status === 'completed' ? (
                                        <span className="text-green-600">✓ 완료</span>
                                      ) : topic.status === 'in_progress' ? (
                                        <span className="text-yellow-600">진행중</span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="py-2 text-gray-600">{topic.practiceCount}회</td>
                                    <td className="py-2 text-gray-600">
                                      {topic.practiceCount > 0
                                        ? `${topic.correctCount}/${topic.practiceCount}`
                                        : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'models' && isAdmin && (
          <div className="space-y-6">
            {/* 현재 수준별 모델 설정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">수준별 모델 설정</h3>
              <p className="text-sm text-gray-500 mb-6">
                각 학습 수준에 사용할 AI 모델을 설정합니다. 변경 사항은 즉시 적용됩니다.
              </p>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
              ) : (
                <div className="space-y-6">
                  {['beginner_zero', 'beginner', 'beginner_plus'].map((level) => {
                    const config = modelConfigs.find((c) => c.level === level);
                    const currentModel = config?.model_name || '';

                    return (
                      <div key={level} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-sm font-medium rounded ${
                              level === 'beginner_zero'
                                ? 'bg-green-100 text-green-800'
                                : level === 'beginner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}>
                              {LEVEL_LABELS[level]}
                            </span>
                            <span className="text-sm text-gray-500">
                              {level === 'beginner_zero' && '프로그래밍을 처음 접하는 완전 초보자'}
                              {level === 'beginner' && '기본 개념은 알지만 아직 익숙하지 않은 초보자'}
                              {level === 'beginner_plus' && '기본 문법을 알고 심화 학습이 필요한 학습자'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenModelConfigEdit(level)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                          >
                            엔드포인트 설정
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 모델 선택 */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">모델</label>
                            <select
                              value={currentModel}
                              onChange={(e) => handleModelChange(level, e.target.value)}
                              disabled={isLoading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                            >
                              {availableModels.map((model) => (
                                <option key={model.modelName} value={model.modelName}>
                                  {model.displayName}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 엔드포인트 표시 */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">엔드포인트</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate" title={config?.endpoint || '미설정'}>
                              {config?.endpoint ? (
                                <span className="font-mono text-xs">{config.endpoint}</span>
                              ) : (
                                <span className="text-gray-400 italic">미설정 (환경변수 사용)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* API 키 및 버전 정보 */}
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <span>API 키:</span>
                            <code className="px-1 py-0.5 bg-gray-100 rounded">
                              {config?.api_key_masked || '미설정'}
                            </code>
                          </div>
                          {config?.api_version && (
                            <div className="flex items-center gap-1">
                              <span>버전:</span>
                              <code className="px-1 py-0.5 bg-gray-100 rounded">
                                {config.api_version}
                              </code>
                            </div>
                          )}
                          <div className="ml-auto">
                            마지막 변경: {formatDate(config?.updated_at || null)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 사용 가능한 모델 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">사용 가능한 모델</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">모델명</th>
                      <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">제공자</th>
                      <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">설명</th>
                      <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">비용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableModels.map((model) => (
                      <tr key={model.modelName} className="border-b border-gray-100">
                        <td className="py-3">
                          <span className="font-medium text-gray-900">{model.displayName}</span>
                          <div className="text-xs text-gray-400">{model.modelName}</div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {model.provider === 'azure-ai-foundry' ? 'Azure AI Foundry' : 'Azure OpenAI'}
                        </td>
                        <td className="py-3 text-sm text-gray-600">{model.description}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded ${COST_TIER_LABELS[model.costTier]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {COST_TIER_LABELS[model.costTier]?.label || model.costTier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 권장 설정 가이드 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">권장 설정 가이드</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>초초보:</strong> Claude Sonnet 4.5 권장 - 비유와 개념 설명에 최적화</li>
                <li>• <strong>초보:</strong> GPT-5 Mini 권장 - 품질과 비용의 균형</li>
                <li>• <strong>조금아는초보:</strong> GPT-5 Nano 권장 - 빠른 응답과 최저 비용</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'question-bank' && isAdmin && (
          <div className="space-y-6">
            {/* 문제 은행 에러 메시지 */}
            {qbError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {qbError}
              </div>
            )}

            {/* 필터 영역 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">언어</label>
                  <select
                    value={qbLanguage}
                    onChange={(e) => setQbLanguage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">언어 선택</option>
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">트랙</label>
                  <select
                    value={qbTrackId}
                    onChange={(e) => setQbTrackId(e.target.value)}
                    disabled={!qbLanguage}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                  >
                    <option value="">트랙 선택</option>
                    {qbTracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">토픽</label>
                  <select
                    value={qbTopicId}
                    onChange={(e) => setQbTopicId(e.target.value)}
                    disabled={!qbTrackId}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                  >
                    <option value="">토픽 선택</option>
                    {qbTracks.find((t) => t.id === qbTrackId)?.stages.flatMap((s) =>
                      s.topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {s.name} &gt; {topic.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">상태</label>
                  <select
                    value={qbStatusFilter}
                    onChange={(e) => setQbStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="pending">대기중</option>
                    <option value="approved">승인됨</option>
                    <option value="rejected">거부됨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">난이도</label>
                  <select
                    value={qbDifficultyFilter}
                    onChange={(e) => setQbDifficultyFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>

                {qbTopicId && (
                  <div className="ml-auto">
                    <button
                      onClick={() => setShowGenerateModal(true)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      + 문제 생성
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 토픽별 통계 */}
            {qbTrackId && qbStats.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">토픽별 문제 현황</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">토픽</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">쉬움</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">보통</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">어려움</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">전체</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">대기중</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">승인됨</th>
                        <th className="text-center py-2 text-xs font-medium text-gray-500">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qbStats.map((stat) => (
                        <tr
                          key={stat.topic_id}
                          className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${qbTopicId === stat.topic_id ? 'bg-blue-50' : ''}`}
                          onClick={() => setQbTopicId(stat.topic_id)}
                        >
                          <td className="py-2 text-gray-700">{stat.topic_name}</td>
                          <td className="py-2 text-center">
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                              {stat.easy_count}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                              {stat.medium_count}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                              {stat.hard_count}
                            </span>
                          </td>
                          <td className="py-2 text-center font-medium">{stat.total_count}</td>
                          <td className="py-2 text-center">
                            {stat.pending_count > 0 && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                                {stat.pending_count}
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              {stat.approved_count}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQbTopicId(stat.topic_id);
                                setShowGenerateModal(true);
                              }}
                              className="text-xs text-green-600 hover:underline"
                            >
                              생성
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 문제 목록 */}
            {qbTopicId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    문제 목록 ({questions.length}개)
                  </h3>
                  {questions.some((q) => q.status === 'pending') && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllPending}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        대기중 전체 선택
                      </button>
                      {selectedQuestionIds.size > 0 && (
                        <button
                          onClick={handleBulkApprove}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          {selectedQuestionIds.size}개 일괄 승인
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {qbIsLoading ? (
                  <div className="text-center py-8 text-gray-500">로딩 중...</div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    문제가 없습니다. "문제 생성" 버튼을 클릭하여 LLM으로 문제를 생성하세요.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className={`border rounded-lg p-4 ${
                          selectedQuestion?.id === q.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {q.status === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedQuestionIds.has(q.id)}
                              onChange={() => toggleQuestionSelection(q.id)}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {q.difficulty === 'easy' ? '쉬움' : q.difficulty === 'medium' ? '보통' : '어려움'}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                q.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                q.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {q.status === 'pending' ? '대기중' : q.status === 'approved' ? '승인됨' : '거부됨'}
                              </span>
                              <span className="text-xs text-gray-500">{q.points}점</span>
                            </div>
                            <h4
                              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                              onClick={() => setSelectedQuestion(selectedQuestion?.id === q.id ? null : q)}
                            >
                              {q.title}
                            </h4>
                            {selectedQuestion?.id === q.id && (
                              <div className="mt-3 space-y-3 text-sm">
                                <div>
                                  <div className="text-xs font-medium text-gray-500 mb-1">설명</div>
                                  <p className="text-gray-700 whitespace-pre-wrap">{q.description}</p>
                                </div>
                                {q.requirements.length > 0 && (
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">요구사항</div>
                                    <ul className="list-disc list-inside text-gray-700">
                                      {q.requirements.map((r, i) => (
                                        <li key={i}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {q.test_cases.length > 0 && (
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">테스트 케이스</div>
                                    <div className="space-y-2">
                                      {q.test_cases.map((tc, i) => (
                                        <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                                          <div className="font-medium">{tc.description} ({tc.points}점)</div>
                                          {tc.input && <div className="text-gray-600">입력: {tc.input}</div>}
                                          <div className="text-gray-600">예상 출력: {tc.expectedOutput}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {q.sample_answer && (
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">샘플 정답</div>
                                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                                      {q.sample_answer}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {q.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveQuestion(q.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="승인"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleRejectQuestion(q.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="거부"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="삭제"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 생성 작업 현황 */}
            {jobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">생성 작업 현황</h3>
                  <button
                    onClick={fetchJobs}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    새로고침
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">토픽</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">설정</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">상태</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">생성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.slice(0, 10).map((job) => (
                        <tr key={job.id} className="border-b border-gray-100">
                          <td className="py-2 text-gray-700">
                            {job.language.toUpperCase()} / {job.track_id} / {job.topic_name}
                          </td>
                          <td className="py-2 text-xs text-gray-500">
                            쉬움:{job.difficulty_config.easy} 보통:{job.difficulty_config.medium} 어려움:{job.difficulty_config.hard}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              job.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {job.status === 'pending' ? '대기' :
                               job.status === 'in_progress' ? '진행중' :
                               job.status === 'completed' ? '완료' : '실패'}
                            </span>
                            {job.error_message && (
                              <span className="ml-2 text-xs text-red-600">{job.error_message}</span>
                            )}
                          </td>
                          <td className="py-2 text-xs text-gray-500">
                            {new Date(job.created_at).toLocaleString('ko-KR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 커리큘럼 관리 탭 */}
        {activeTab === 'curriculum' && isAdmin && (
          <div className="space-y-6">
            {/* 언어 선택 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">언어</label>
                  <select
                    value={currLanguage}
                    onChange={(e) => setCurrLanguage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">언어 선택</option>
                    {curriculumLanguages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 커리큘럼 트리 뷰 */}
            {currLanguage && curriculumTracks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">커리큘럼 구조</h3>
                <div className="space-y-2">
                  {curriculumTracks.map((track) => (
                    <div key={track.id} className="border border-gray-200 rounded-lg">
                      {/* 트랙 헤더 */}
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleExpand('track', track.id)}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${expandedTracks.has(track.id) ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-medium text-gray-900">{track.name}</span>
                          <span className="text-xs text-gray-500">({track.target_level})</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStage({ trackId: track.id, name: '', displayOrder: (track.stages?.length || 0) + 1 });
                            setShowStageModal(true);
                          }}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          + 스테이지
                        </button>
                      </div>

                      {/* 스테이지 목록 */}
                      {expandedTracks.has(track.id) && track.stages && (
                        <div className="pl-4">
                          {track.stages.map((stage) => (
                            <div key={stage.id} className="border-l-2 border-gray-200">
                              {/* 스테이지 헤더 */}
                              <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleExpand('stage', stage.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedStages.has(stage.id) ? 'rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span className="text-gray-800">{stage.name}</span>
                                  <span className="text-xs text-gray-400">#{stage.display_order}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingStage({ id: stage.id, trackId: track.id, name: stage.name, displayOrder: stage.display_order });
                                      setShowStageModal(true);
                                    }}
                                    className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStage(stage.id, stage.name);
                                    }}
                                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTopic({ stageId: stage.id, name: '', displayOrder: (stage.topics?.length || 0) + 1 });
                                      setShowTopicModal(true);
                                    }}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  >
                                    + 토픽
                                  </button>
                                </div>
                              </div>

                              {/* 토픽 목록 */}
                              {expandedStages.has(stage.id) && stage.topics && (
                                <div className="pl-4">
                                  {stage.topics.map((topic) => (
                                    <div key={topic.id} className="border-l-2 border-gray-100">
                                      {/* 토픽 헤더 */}
                                      <div
                                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleExpand('topic', topic.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <svg
                                            className={`w-3 h-3 text-gray-400 transition-transform ${expandedTopics.has(topic.id) ? 'rotate-90' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                          <span className="text-sm text-gray-700">{topic.name}</span>
                                          <span className="text-xs text-gray-400">#{topic.display_order}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingTopic({ id: topic.id, stageId: stage.id, name: topic.name, displayOrder: topic.display_order });
                                              setShowTopicModal(true);
                                            }}
                                            className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                                          >
                                            수정
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTopic(topic.id, topic.name);
                                            }}
                                            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                          >
                                            삭제
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingConcept({
                                                topicId: topic.id,
                                                name: '',
                                                description: '',
                                                keywords: '',
                                                examples: [''],
                                                displayOrder: (topic.concepts?.length || 0) + 1,
                                              });
                                              setShowConceptModal(true);
                                            }}
                                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                          >
                                            + 개념
                                          </button>
                                        </div>
                                      </div>

                                      {/* 개념 목록 */}
                                      {expandedTopics.has(topic.id) && topic.concepts && (
                                        <div className="pl-6 pb-2">
                                          {topic.concepts.map((concept) => (
                                            <div
                                              key={concept.id}
                                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                                <span className="text-sm text-gray-600">{concept.name}</span>
                                                <span className="text-xs text-gray-400">#{concept.display_order}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <button
                                                  onClick={() => {
                                                    setEditingConcept({
                                                      id: concept.id,
                                                      topicId: topic.id,
                                                      name: concept.name,
                                                      description: concept.description || '',
                                                      keywords: Array.isArray(concept.keywords) ? concept.keywords.join(', ') : '',
                                                      examples: Array.isArray(concept.examples) && concept.examples.length > 0 ? concept.examples : [''],
                                                      displayOrder: concept.display_order,
                                                    });
                                                    setShowConceptModal(true);
                                                  }}
                                                  className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                  수정
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteConcept(concept.id, concept.name)}
                                                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                  삭제
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                          {(!topic.concepts || topic.concepts.length === 0) && (
                                            <p className="text-xs text-gray-400 p-2">개념이 없습니다</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {(!stage.topics || stage.topics.length === 0) && (
                                    <p className="text-xs text-gray-400 p-2 pl-6">토픽이 없습니다</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {(!track.stages || track.stages.length === 0) && (
                            <p className="text-xs text-gray-400 p-3">스테이지가 없습니다</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currLanguage && curriculumTracks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                이 언어에 등록된 커리큘럼이 없습니다.
              </div>
            )}

            {!currLanguage && (
              <div className="text-center py-12 text-gray-500">
                언어를 선택하세요.
              </div>
            )}
          </div>
        )}
      </main>

      {/* 문제 생성 모달 */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">문제 생성</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                LLM을 사용하여 선택한 토픽에 대한 문제를 자동 생성합니다.
                생성된 문제는 대기 상태로 저장되며, 검토 후 승인해야 시험에 출제됩니다.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    쉬움
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={generateConfig.easy}
                    onChange={(e) => setGenerateConfig({ ...generateConfig, easy: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보통
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={generateConfig.medium}
                    onChange={(e) => setGenerateConfig({ ...generateConfig, medium: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    어려움
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={generateConfig.hard}
                    onChange={(e) => setGenerateConfig({ ...generateConfig, hard: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                총 {generateConfig.easy + generateConfig.medium + generateConfig.hard}개의 문제가 생성됩니다.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleGenerateQuestions}
                disabled={qbIsLoading || (generateConfig.easy + generateConfig.medium + generateConfig.hard === 0)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                생성 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 반 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">새 반 만들기</h3>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    반 이름 *
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="예: 웹개발 심화반"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정원
                  </label>
                  <input
                    type="number"
                    value={newMaxStudents}
                    onChange={(e) => setNewMaxStudents(parseInt(e.target.value) || 30)}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    초대 코드 유효 기간 (일)
                  </label>
                  <input
                    type="number"
                    value={newExpiresInDays}
                    onChange={(e) => setNewExpiresInDays(e.target.value ? parseInt(e.target.value) : '')}
                    min={1}
                    placeholder="비워두면 무제한"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!newClassName.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 반 수정 모달 */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">반 수정</h3>
            </div>
            <form onSubmit={handleUpdateClass}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    반 이름
                  </label>
                  <input
                    type="text"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정원
                  </label>
                  <input
                    type="number"
                    value={editingClass.maxStudents}
                    onChange={(e) => setEditingClass({ ...editingClass, maxStudents: parseInt(e.target.value) || 30 })}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingClass(null); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!editingClass.name.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모델 설정 편집 모달 */}
      {showModelConfigModal && editingModelConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                엔드포인트 설정 - {LEVEL_LABELS[editingModelConfig.level]}
              </h3>
            </div>
            <form onSubmit={handleSaveModelConfig}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    엔드포인트 URL
                  </label>
                  <input
                    type="url"
                    value={editingModelConfig.endpoint}
                    onChange={(e) => setEditingModelConfig({ ...editingModelConfig, endpoint: e.target.value })}
                    placeholder="https://your-instance.openai.azure.com/openai/deployments/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Azure OpenAI 또는 Azure AI Foundry 엔드포인트 URL을 입력하세요.
                    비워두면 환경변수 값을 사용합니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API 키
                  </label>
                  <input
                    type="password"
                    value={editingModelConfig.apiKey}
                    onChange={(e) => setEditingModelConfig({ ...editingModelConfig, apiKey: e.target.value })}
                    placeholder="새 API 키를 입력하세요 (변경 시에만)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    보안상 기존 키는 표시되지 않습니다. 변경하려면 새 키를 입력하세요.
                    비워두면 기존 값이 유지됩니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API 버전 (선택)
                  </label>
                  <input
                    type="text"
                    value={editingModelConfig.apiVersion}
                    onChange={(e) => setEditingModelConfig({ ...editingModelConfig, apiVersion: e.target.value })}
                    placeholder="예: 2025-01-01-preview"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Azure OpenAI API 버전. 비워두면 기본값을 사용합니다.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModelConfigModal(false); setEditingModelConfig(null); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 개념 생성/수정 모달 */}
      {showConceptModal && editingConcept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingConcept.id ? '개념 수정' : '개념 추가'}
              </h3>
            </div>
            <form onSubmit={handleSaveConcept}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={editingConcept.name}
                    onChange={(e) => setEditingConcept({ ...editingConcept, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: let과 const"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    value={editingConcept.description}
                    onChange={(e) => setEditingConcept({ ...editingConcept, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="개념에 대한 설명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">키워드 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={editingConcept.keywords}
                    onChange={(e) => setEditingConcept({ ...editingConcept, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 변수, 상수, let, const, 스코프"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">코드 예시</label>
                  {editingConcept.examples.map((example, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <textarea
                        value={example}
                        onChange={(e) => {
                          const newExamples = [...editingConcept.examples];
                          newExamples[idx] = e.target.value;
                          setEditingConcept({ ...editingConcept, examples: newExamples });
                        }}
                        rows={3}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="코드 예시를 입력하세요"
                      />
                      {editingConcept.examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newExamples = editingConcept.examples.filter((_, i) => i !== idx);
                            setEditingConcept({ ...editingConcept, examples: newExamples });
                          }}
                          className="px-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditingConcept({ ...editingConcept, examples: [...editingConcept.examples, ''] })}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + 예시 추가
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                  <input
                    type="number"
                    value={editingConcept.displayOrder}
                    onChange={(e) => setEditingConcept({ ...editingConcept, displayOrder: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowConceptModal(false); setEditingConcept(null); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!editingConcept.name.trim() || isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 토픽 생성/수정 모달 */}
      {showTopicModal && editingTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingTopic.id ? '토픽 수정' : '토픽 추가'}
              </h3>
            </div>
            <form onSubmit={handleSaveTopic}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={editingTopic.name}
                    onChange={(e) => setEditingTopic({ ...editingTopic, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 변수와 상수"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                  <input
                    type="number"
                    value={editingTopic.displayOrder}
                    onChange={(e) => setEditingTopic({ ...editingTopic, displayOrder: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowTopicModal(false); setEditingTopic(null); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!editingTopic.name.trim() || isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 스테이지 생성/수정 모달 */}
      {showStageModal && editingStage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingStage.id ? '스테이지 수정' : '스테이지 추가'}
              </h3>
            </div>
            <form onSubmit={handleSaveStage}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={editingStage.name}
                    onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 기초 문법"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                  <input
                    type="number"
                    value={editingStage.displayOrder}
                    onChange={(e) => setEditingStage({ ...editingStage, displayOrder: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowStageModal(false); setEditingStage(null); }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!editingStage.name.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">삭제 확인</h3>
            <p className="text-gray-700 mb-6">{deleteConfirm.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm({ show: false, type: null, id: '', name: '', message: '' })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
