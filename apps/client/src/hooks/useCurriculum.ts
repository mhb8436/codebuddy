import { useState, useCallback } from 'react';

export interface Concept {
  id: string;
  name: string;
  description: string;
  examples: string[];
  keywords: string[];
}

export interface Topic {
  id: string;
  name: string;
  order: number;
  concepts: Concept[];
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  topics: Topic[];
}

export interface Track {
  id: string;
  name: string;
  description: string;
  targetLevel: string;
  estimatedHours: number;
  prerequisites?: string[];
  stages: Stage[];
  stageCount?: number;
}

export interface Language {
  id: string;
  name: string;
  description: string;
}

export interface TopicNavigation {
  previous: { topicId: string; name: string } | null;
  next: { topicId: string; name: string } | null;
}

export interface TopicListItem {
  stageId: string;
  stageName: string;
  topicId: string;
  topicName: string;
  order: number;
}

export function useCurriculum() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicNavigation, setTopicNavigation] = useState<TopicNavigation | null>(null);
  const [topicList, setTopicList] = useState<TopicListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Fetch available languages
  const fetchLanguages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/curriculum/languages', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages);
      } else {
        throw new Error('언어 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tracks for a language
  const fetchTracks = useCallback(async (language: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/curriculum/${language}/tracks`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks);
      } else {
        throw new Error('트랙 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch track detail
  const fetchTrack = useCallback(async (language: string, trackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/curriculum/${language}/tracks/${trackId}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentTrack(data.track);
      } else {
        throw new Error('트랙 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all topics in a track
  const fetchTopicList = useCallback(async (language: string, trackId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/curriculum/${language}/tracks/${trackId}/topics`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTopicList(data.topics);
      } else {
        throw new Error('토픽 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch topic detail with navigation
  const fetchTopic = useCallback(async (language: string, trackId: string, topicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/curriculum/${language}/tracks/${trackId}/topics/${topicId}`,
        { headers: getAuthHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentTopic(data.topic);
        setTopicNavigation(data.navigation);
      } else {
        throw new Error('토픽 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search topics by keyword
  const searchTopics = useCallback(async (language: string, query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/curriculum/${language}/search?q=${encodeURIComponent(query)}`,
        { headers: getAuthHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        return data.results;
      } else {
        throw new Error('검색에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear state
  const clearState = useCallback(() => {
    setCurrentTrack(null);
    setCurrentTopic(null);
    setTopicNavigation(null);
    setTopicList([]);
  }, []);

  return {
    languages,
    tracks,
    currentTrack,
    currentTopic,
    topicNavigation,
    topicList,
    isLoading,
    error,
    fetchLanguages,
    fetchTracks,
    fetchTrack,
    fetchTopicList,
    fetchTopic,
    searchTopics,
    clearState,
  };
}
