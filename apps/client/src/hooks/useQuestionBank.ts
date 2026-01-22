import { useState, useCallback } from 'react';

export interface QuestionBankStats {
  language: string;
  track_id: string;
  topic_id: string;
  topic_name: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  total_count: number;
  pending_count: number;
  approved_count: number;
}

export interface QuestionBankItem {
  id: string;
  language: string;
  track_id: string;
  topic_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  title: string;
  description: string;
  requirements: string[];
  test_cases: {
    description: string;
    expectedOutput: string;
    points: number;
    input?: string;
  }[];
  sample_answer: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationJob {
  id: string;
  language: string;
  track_id: string;
  topic_id: string;
  topic_name: string;
  difficulty_config: {
    easy: number;
    medium: number;
    hard: number;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_by: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface TrackInfo {
  id: string;
  name: string;
  description: string;
  targetLevel: string;
  stages: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
    }[];
  }[];
}

interface CurriculumLanguage {
  id: string;
  name: string;
  description: string;
}

export function useQuestionBank() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 커리큘럼 관련 상태
  const [languages, setLanguages] = useState<CurriculumLanguage[]>([]);
  const [tracks, setTracks] = useState<TrackInfo[]>([]);

  // 문제 은행 상태
  const [stats, setStats] = useState<QuestionBankStats[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBankItem | null>(null);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/curriculum/languages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.json();
      // API returns { languages: [...] }, extract the array
      setLanguages(Array.isArray(data) ? data : (data.languages || []));
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  }, []);

  const fetchTracks = useCallback(async (language: string) => {
    try {
      const response = await fetch(`/api/curriculum/${language}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tracks');
      const data = await response.json();
      // API returns { curriculum: { tracks: [...] } }, extract the tracks array
      const curriculum = data.curriculum || data;
      setTracks(curriculum.tracks || []);
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  }, []);

  const fetchStats = useCallback(async (language: string, trackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/question-bank/stats/${language}/${trackId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (
    language: string,
    trackId: string,
    topicId: string,
    status?: string,
    difficulty?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (difficulty) params.append('difficulty', difficulty);

      const url = `/api/admin/question-bank/${language}/${trackId}/${topicId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateQuestions = useCallback(async (
    language: string,
    trackId: string,
    topicId: string,
    topicName: string,
    difficultyConfig: { easy: number; medium: number; hard: number }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/question-bank/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          language,
          trackId,
          topicId,
          topicName,
          difficultyConfig,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate questions');
      }
      const data = await response.json();
      return data.job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/question-bank/jobs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuestionStatus = useCallback(async (
    questionId: string,
    status: 'approved' | 'rejected'
  ) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/question-bank/${questionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updated = await response.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? updated : q))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const updateQuestion = useCallback(async (
    questionId: string,
    data: Partial<{
      title: string;
      description: string;
      requirements: string[];
      testCases: QuestionBankItem['test_cases'];
      sampleAnswer: string;
      points: number;
      difficulty: 'easy' | 'medium' | 'hard';
    }>
  ) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/question-bank/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update question');
      const updated = await response.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? updated : q))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const deleteQuestion = useCallback(async (questionId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/question-bank/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete question');
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const bulkApprove = useCallback(async (questionIds: string[]) => {
    setError(null);
    try {
      const response = await fetch('/api/admin/question-bank/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ questionIds }),
      });
      if (!response.ok) throw new Error('Failed to bulk approve');
      const data = await response.json();
      setQuestions((prev) =>
        prev.map((q) =>
          questionIds.includes(q.id) ? { ...q, status: 'approved' as const } : q
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const clearQuestions = useCallback(() => {
    setQuestions([]);
    setSelectedQuestion(null);
  }, []);

  return {
    isLoading,
    error,
    // Curriculum
    languages,
    tracks,
    fetchLanguages,
    fetchTracks,
    // Question Bank
    stats,
    questions,
    jobs,
    selectedQuestion,
    setSelectedQuestion,
    fetchStats,
    fetchQuestions,
    generateQuestions,
    fetchJobs,
    updateQuestionStatus,
    updateQuestion,
    deleteQuestion,
    bulkApprove,
    clearQuestions,
  };
}
