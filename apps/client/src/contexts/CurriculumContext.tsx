import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Concept {
  id: string;
  name: string;
  description: string;
  content: string | null;
  runnable_examples: Array<{
    title: string;
    code: string;
    expected_output?: string;
  }>;
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
  stages: Stage[];
}

export interface TopicNavigation {
  previous: { topicId: string; name: string } | null;
  next: { topicId: string; name: string } | null;
}

export interface CurriculumSelection {
  language: string;
  languageName: string;
  trackId: string;
  trackName: string;
  topicId: string;
  topicName: string;
}

export type LearnerLevel = 'beginner_zero' | 'beginner' | 'beginner_plus';

interface CurriculumContextType {
  // Current selection
  selection: CurriculumSelection | null;
  currentTrack: Track | null;
  currentTopic: Topic | null;
  topicNavigation: TopicNavigation | null;

  // Current level from track (for AI system prompt)
  currentLevel: LearnerLevel;

  // Actions
  selectTopic: (language: string, trackId: string, topicId: string) => Promise<void>;
  clearSelection: () => void;
  navigateToNextTopic: () => Promise<void>;
  navigateToPreviousTopic: () => Promise<void>;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Context for AI
  getContextForAI: () => string;
}

const CurriculumContext = createContext<CurriculumContextType | null>(null);

const STORAGE_KEY = 'codebuddy_curriculum_selection';

export function CurriculumProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<CurriculumSelection | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicNavigation, setTopicNavigation] = useState<TopicNavigation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Load topic data when selection exists
  useEffect(() => {
    if (selection) {
      loadTopicData(selection.language, selection.trackId, selection.topicId);
    }
  }, []);

  const loadTopicData = async (language: string, trackId: string, topicId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch track data
      const trackResponse = await fetch(
        `/api/curriculum/${language}/tracks/${trackId}`,
        { headers: getAuthHeaders() }
      );

      if (!trackResponse.ok) {
        throw new Error('트랙 정보를 불러오는데 실패했습니다.');
      }

      const trackData = await trackResponse.json();
      setCurrentTrack(trackData.track);

      // Fetch topic data with navigation
      const topicResponse = await fetch(
        `/api/curriculum/${language}/tracks/${trackId}/topics/${topicId}`,
        { headers: getAuthHeaders() }
      );

      if (!topicResponse.ok) {
        throw new Error('토픽 정보를 불러오는데 실패했습니다.');
      }

      const topicData = await topicResponse.json();
      setCurrentTopic(topicData.topic);
      setTopicNavigation(topicData.navigation);

    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectTopic = useCallback(async (language: string, trackId: string, topicId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch language info
      const langResponse = await fetch('/api/curriculum/languages', {
        headers: getAuthHeaders(),
      });
      const langData = await langResponse.json();
      const languageInfo = langData.languages.find((l: { id: string; name: string }) => l.id === language);

      // Fetch track info
      const trackResponse = await fetch(
        `/api/curriculum/${language}/tracks/${trackId}`,
        { headers: getAuthHeaders() }
      );

      if (!trackResponse.ok) {
        throw new Error('트랙 정보를 불러오는데 실패했습니다.');
      }

      const trackData = await trackResponse.json();
      setCurrentTrack(trackData.track);

      // Fetch topic data with navigation
      const topicResponse = await fetch(
        `/api/curriculum/${language}/tracks/${trackId}/topics/${topicId}`,
        { headers: getAuthHeaders() }
      );

      if (!topicResponse.ok) {
        throw new Error('토픽 정보를 불러오는데 실패했습니다.');
      }

      const topicData = await topicResponse.json();
      setCurrentTopic(topicData.topic);
      setTopicNavigation(topicData.navigation);

      // Save selection
      const newSelection: CurriculumSelection = {
        language,
        languageName: languageInfo?.name || language,
        trackId,
        trackName: trackData.track.name,
        topicId,
        topicName: topicData.topic.name,
      };

      setSelection(newSelection);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));

    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setCurrentTrack(null);
    setCurrentTopic(null);
    setTopicNavigation(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const navigateToNextTopic = useCallback(async () => {
    if (!selection || !topicNavigation?.next) return;
    await selectTopic(selection.language, selection.trackId, topicNavigation.next.topicId);
  }, [selection, topicNavigation, selectTopic]);

  const navigateToPreviousTopic = useCallback(async () => {
    if (!selection || !topicNavigation?.previous) return;
    await selectTopic(selection.language, selection.trackId, topicNavigation.previous.topicId);
  }, [selection, topicNavigation, selectTopic]);

  const getContextForAI = useCallback(() => {
    if (!selection || !currentTopic) return '';

    const concepts = currentTopic.concepts.map(c => {
      const examples = c.examples.length > 0
        ? `\n예시:\n${c.examples.map(e => '```\n' + e + '\n```').join('\n')}`
        : '';
      return `### ${c.name}\n${c.description}\n키워드: ${c.keywords.join(', ')}${examples}`;
    }).join('\n\n');

    return `
## 현재 학습 중인 내용
- 언어: ${selection.languageName}
- 트랙: ${selection.trackName}
- 토픽: ${selection.topicName}

## 이 토픽에서 배우는 개념들
${concepts}

## 지침
- 위 토픽과 개념에 집중하여 답변해주세요.
- 학습자가 현재 배우고 있는 내용과 연관지어 설명해주세요.
- 예시 코드는 ${selection.languageName}로 작성해주세요.
`;
  }, [selection, currentTopic]);

  // Derive level from current track
  const currentLevel: LearnerLevel = (currentTrack?.targetLevel as LearnerLevel) || 'beginner';

  return (
    <CurriculumContext.Provider
      value={{
        selection,
        currentTrack,
        currentTopic,
        topicNavigation,
        currentLevel,
        selectTopic,
        clearSelection,
        navigateToNextTopic,
        navigateToPreviousTopic,
        isLoading,
        error,
        getContextForAI,
      }}
    >
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculumContext() {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculumContext must be used within a CurriculumProvider');
  }
  return context;
}
