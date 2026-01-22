import { useState, useCallback } from 'react';

interface ProgressResponse {
  message: string;
  progress?: {
    topicId: string;
    status?: string;
    practiceCount?: number;
    correctCount?: number;
    accuracy?: number;
    completedAt?: string;
  };
  trackProgress?: {
    completedTopics: number;
    totalTopics: number;
    progressPercent: number;
  };
  nextTopic?: {
    topicId: string;
    name: string;
  } | null;
}

export function useProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // 트랙 등록
  const enrollTrack = useCallback(async (language: string, trackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curriculum/progress/enroll', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ language, trackId }),
      });

      if (!response.ok) {
        throw new Error('트랙 등록에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토픽 학습 시작
  const startTopic = useCallback(async (language: string, trackId: string, topicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curriculum/progress/start', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ language, trackId, topicId }),
      });

      if (!response.ok) {
        throw new Error('토픽 시작 기록에 실패했습니다');
      }

      return await response.json() as ProgressResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 연습 결과 기록
  const recordPractice = useCallback(async (
    language: string,
    trackId: string,
    topicId: string,
    isCorrect: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curriculum/progress/practice', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ language, trackId, topicId, isCorrect }),
      });

      if (!response.ok) {
        throw new Error('연습 결과 기록에 실패했습니다');
      }

      return await response.json() as ProgressResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토픽 완료
  const completeTopic = useCallback(async (language: string, trackId: string, topicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curriculum/progress/complete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ language, trackId, topicId }),
      });

      if (!response.ok) {
        throw new Error('토픽 완료 처리에 실패했습니다');
      }

      return await response.json() as ProgressResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 내 진도 조회
  const fetchMyProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curriculum/progress/my', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('진도 조회에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 특정 트랙 진도 조회
  const fetchTrackProgress = useCallback(async (language: string, trackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/curriculum/progress/${language}/${trackId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('트랙 진도 조회에 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    enrollTrack,
    startTopic,
    recordPractice,
    completeTopic,
    fetchMyProgress,
    fetchTrackProgress,
  };
}
