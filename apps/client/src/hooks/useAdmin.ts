import { useState, useCallback } from 'react';

interface Class {
  id: string;
  name: string;
  invite_code: string;
  max_students: number;
  expires_at: string | null;
  created_at: string;
}

interface SummaryStats {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  estimatedCost: number;
  todayMessages: number;
  todayTokens: number;
  upgradeStats: {
    total: number;
    upgraded: number;
    reasons: Record<string, number>;
  };
}

interface ModelStats {
  model_used: string;
  message_count: number;
  total_tokens: number;
  estimated_cost: number;
}

interface LevelStats {
  level: string;
  user_count: number;
  session_count: number;
  message_count: number;
  total_tokens: number;
}

interface DailyStats {
  date: string;
  message_count: number;
  total_tokens: number;
  unique_users: number;
}

interface UserStats {
  user_id: string;
  user_name: string;
  user_email: string;
  level: string;
  class_name: string | null;
  session_count: number;
  message_count: number;
  total_tokens: number;
}

interface AvailableModel {
  provider: string;
  modelName: string;
  displayName: string;
  description: string;
  costTier: string;
}

interface ModelConfig {
  id: string;
  level: string;
  provider: string;
  model_name: string;
  endpoint: string | null;
  api_key_masked: string | null;
  api_version: string | null;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

interface UpdateModelConfigInput {
  provider?: string;
  modelName?: string;
  endpoint?: string;
  apiKey?: string;
  apiVersion?: string;
}

// Curriculum Types
interface CurriculumLanguage {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface CurriculumConcept {
  id: string;
  topic_id: string;
  name: string;
  description: string | null;
  examples: string[];
  keywords: string[];
  display_order: number;
  is_active: boolean;
}

interface CurriculumTopic {
  id: string;
  stage_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  concepts: CurriculumConcept[];
}

interface CurriculumStage {
  id: string;
  track_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  topics: CurriculumTopic[];
}

interface CurriculumTrack {
  id: string;
  language_id: string;
  name: string;
  description: string | null;
  target_level: string;
  estimated_hours: number;
  display_order: number;
  is_active: boolean;
  stages: CurriculumStage[];
}

interface CreateConceptInput {
  topicId: string;
  name: string;
  description?: string;
  examples?: string[];
  keywords?: string[];
  displayOrder?: number;
}

interface UpdateConceptInput {
  name?: string;
  description?: string;
  examples?: string[];
  keywords?: string[];
  displayOrder?: number;
}

interface CreateTopicInput {
  stageId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

interface UpdateTopicInput {
  name?: string;
  description?: string;
  displayOrder?: number;
}

interface CreateStageInput {
  trackId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

interface UpdateStageInput {
  name?: string;
  description?: string;
  displayOrder?: number;
}

interface UpdateTrackInput {
  name?: string;
  description?: string;
  targetLevel?: string;
  estimatedHours?: number;
  displayOrder?: number;
}

// Learning Progress Types
interface ClassProgressInfo {
  classId: string;
  className: string;
  studentCount: number;
  students: StudentProgress[];
}

interface StudentProgress {
  userId: string;
  userName: string;
  language: string;
  trackId: string;
  progressPercent: number;
  completedTopics: number;
  totalTopics: number;
  lastActivityAt: string | null;
}

interface TrackProgressDetail {
  classId: string;
  className: string;
  language: string;
  trackId: string;
  students: StudentTopicProgress[];
}

interface StudentTopicProgress {
  userId: string;
  userName: string;
  topicId: string;
  status: string;
  practiceCount: number;
  correctCount: number;
  accuracy: number;
  lastPracticedAt: string | null;
  completedAt: string | null;
}

interface StudentDetailProgress {
  userId: string;
  userName: string;
  email: string;
  level: string;
  enrolledTracks: EnrolledTrackProgress[];
}

interface EnrolledTrackProgress {
  language: string;
  trackId: string;
  currentTopicId: string | null;
  progressPercent: number;
  enrolledAt: string;
  lastActivityAt: string;
  topics: TopicProgressItem[];
}

interface TopicProgressItem {
  topicId: string;
  status: string;
  practiceCount: number;
  correctCount: number;
  lastPracticedAt: string | null;
  completedAt: string | null;
}

interface ClassWithStudents extends Class {
  studentCount: number;
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  role: string;
  lastLoginAt: string | null;
}

interface CreateClassInput {
  name: string;
  maxStudents?: number;
  expiresInDays?: number;
}

interface UpdateClassInput {
  name?: string;
  maxStudents?: number;
  expiresAt?: string;
}

export function useAdmin() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudents | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Statistics state
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);

  // Model config state
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);

  // Learning progress state
  const [classProgress, setClassProgress] = useState<ClassProgressInfo | null>(null);
  const [trackProgress, setTrackProgress] = useState<TrackProgressDetail | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentDetailProgress | null>(null);

  // Curriculum state
  const [curriculumLanguages, setCurriculumLanguages] = useState<CurriculumLanguage[]>([]);
  const [curriculumTracks, setCurriculumTracks] = useState<CurriculumTrack[]>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // 반 목록 조회
  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/classes', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('반 목록을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 반 상세 조회 (학생 포함)
  const fetchClassDetails = useCallback(async (classId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('반 정보를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setSelectedClass(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 반 생성
  const createClass = useCallback(async (input: CreateClassInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '반 생성에 실패했습니다');
      }

      const newClass = await response.json();
      setClasses((prev) => [...prev, newClass]);
      return newClass;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 반 수정
  const updateClass = useCallback(async (classId: string, input: UpdateClassInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '반 수정에 실패했습니다');
      }

      const updated = await response.json();
      setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 반 삭제
  const deleteClass = useCallback(async (classId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '반 삭제에 실패했습니다');
      }

      setClasses((prev) => prev.filter((c) => c.id !== classId));
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  // 초대 코드 재생성
  const regenerateInviteCode = useCallback(async (classId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/classes/${classId}/regenerate-code`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '초대 코드 재생성에 실패했습니다');
      }

      const data = await response.json();
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, invite_code: data.inviteCode } : c))
      );
      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => (prev ? { ...prev, invite_code: data.inviteCode } : null));
      }
      return data.inviteCode;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  // 사용자 역할 변경
  const updateUserRole = useCallback(async (userId: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '역할 변경에 실패했습니다');
      }

      const data = await response.json();

      // 선택된 반의 학생 목록 업데이트
      if (selectedClass) {
        setSelectedClass((prev) =>
          prev
            ? {
                ...prev,
                students: prev.students.map((s) =>
                  s.id === userId ? { ...s, role: data.user.role } : s
                ),
              }
            : null
        );
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  // 요약 통계 조회
  const fetchSummaryStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/stats/summary', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('요약 통계를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setSummaryStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 모델별 통계 조회
  const fetchModelStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats/models', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('모델 통계를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setModelStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 수준별 통계 조회
  const fetchLevelStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats/levels', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('수준별 통계를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setLevelStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 일별 통계 조회
  const fetchDailyStats = useCallback(async (days: number = 30) => {
    try {
      const response = await fetch(`/api/admin/stats/daily?days=${days}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('일별 통계를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setDailyStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 사용자별 통계 조회
  const fetchUserStats = useCallback(async (classId?: string) => {
    try {
      const url = classId
        ? `/api/admin/stats/users?classId=${classId}`
        : '/api/admin/stats/users';
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('사용자 통계를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setUserStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 사용 가능한 모델 목록 조회
  const fetchAvailableModels = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/models', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('모델 목록을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setAvailableModels(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 모델 설정 조회
  const fetchModelConfigs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/models/config', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('모델 설정을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setModelConfigs(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 모델 설정 업데이트
  const updateModelConfig = useCallback(async (level: string, input: UpdateModelConfigInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/models/config/${level}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '모델 설정 변경에 실패했습니다');
      }

      const data = await response.json();

      // 설정 목록 새로고침
      await fetchModelConfigs();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchModelConfigs]);

  // 모든 통계 조회
  const fetchAllStats = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSummaryStats(),
        fetchModelStats(),
        fetchLevelStats(),
        fetchDailyStats(),
        fetchUserStats(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSummaryStats, fetchModelStats, fetchLevelStats, fetchDailyStats, fetchUserStats]);

  // 반별 학습 진도 조회
  const fetchClassProgress = useCallback(async (classId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/progress/class/${classId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('학습 진도를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setClassProgress(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 트랙별 상세 진도 조회
  const fetchTrackProgress = useCallback(async (classId: string, language: string, trackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/progress/class/${classId}/track/${language}/${trackId}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error('트랙 진도를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setTrackProgress(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 개별 학생 진도 조회
  const fetchStudentProgress = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/progress/student/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('학생 진도를 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setStudentProgress(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 진도 상태 초기화
  const clearProgress = useCallback(() => {
    setClassProgress(null);
    setTrackProgress(null);
    setStudentProgress(null);
  }, []);

  // ==================== Curriculum Functions ====================

  // 커리큘럼 언어 목록 조회
  const fetchCurriculumLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/curriculum/languages', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('언어 목록을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setCurriculumLanguages(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    }
  }, []);

  // 언어별 전체 커리큘럼 조회
  const fetchCurriculumFull = useCallback(async (language: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/${language}/full`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('커리큘럼을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setCurriculumTracks(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 개념 생성
  const createConcept = useCallback(async (input: CreateConceptInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/curriculum/concepts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '개념 생성에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 개념 수정
  const updateConcept = useCallback(async (conceptId: string, input: UpdateConceptInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/concepts/${conceptId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '개념 수정에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 개념 삭제
  const deleteConcept = useCallback(async (conceptId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/concepts/${conceptId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '개념 삭제에 실패했습니다');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토픽 생성
  const createTopic = useCallback(async (input: CreateTopicInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/curriculum/topics', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '토픽 생성에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토픽 수정
  const updateTopic = useCallback(async (topicId: string, input: UpdateTopicInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/topics/${topicId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '토픽 수정에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토픽 삭제
  const deleteTopic = useCallback(async (topicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/topics/${topicId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '토픽 삭제에 실패했습니다');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 스테이지 생성
  const createStage = useCallback(async (input: CreateStageInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/curriculum/stages', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '스테이지 생성에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 스테이지 수정
  const updateStage = useCallback(async (stageId: string, input: UpdateStageInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/stages/${stageId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '스테이지 수정에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 스테이지 삭제
  const deleteStage = useCallback(async (stageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/stages/${stageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '스테이지 삭제에 실패했습니다');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 트랙 수정
  const updateTrack = useCallback(async (trackId: string, input: UpdateTrackInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/curriculum/tracks/${trackId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '트랙 수정에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 커리큘럼 상태 초기화
  const clearCurriculum = useCallback(() => {
    setCurriculumTracks([]);
  }, []);

  return {
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
    clearSelectedClass: () => setSelectedClass(null),
    // Statistics
    summaryStats,
    modelStats,
    levelStats,
    dailyStats,
    userStats,
    fetchSummaryStats,
    fetchModelStats,
    fetchLevelStats,
    fetchDailyStats,
    fetchUserStats,
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
    updateTrack,
    clearCurriculum,
  };
}
