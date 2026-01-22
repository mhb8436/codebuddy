import * as curriculumRepo from '../db/repositories/curriculumRepository.js';

// ========================================
// Type Definitions (기존 API 호환성 유지)
// ========================================

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
  targetLevel: 'beginner_zero' | 'beginner' | 'beginner_plus';
  estimatedHours: number;
  prerequisites?: string[];
  stages: Stage[];
  stageCount?: number;
}

export interface Curriculum {
  language: string;
  displayName: string;
  description: string;
  tracks: Track[];
}

// ========================================
// Helper: DB 데이터를 API 형식으로 변환
// ========================================

function mapDbConceptToApi(dbConcept: curriculumRepo.CurriculumConcept): Concept {
  return {
    id: dbConcept.id,
    name: dbConcept.name,
    description: dbConcept.description || '',
    examples: Array.isArray(dbConcept.examples) ? dbConcept.examples : [],
    keywords: Array.isArray(dbConcept.keywords) ? dbConcept.keywords : [],
  };
}

function mapDbTopicToApi(dbTopic: curriculumRepo.TopicWithConcepts): Topic {
  return {
    id: dbTopic.id,
    name: dbTopic.name,
    order: dbTopic.display_order,
    concepts: dbTopic.concepts.map(mapDbConceptToApi),
  };
}

function mapDbStageToApi(dbStage: curriculumRepo.StageWithTopics): Stage {
  return {
    id: dbStage.id,
    name: dbStage.name,
    order: dbStage.display_order,
    topics: dbStage.topics.map(mapDbTopicToApi),
  };
}

function mapDbTrackToApi(dbTrack: curriculumRepo.TrackWithStages): Track {
  return {
    id: dbTrack.id,
    name: dbTrack.name,
    description: dbTrack.description || '',
    targetLevel: dbTrack.target_level as 'beginner_zero' | 'beginner' | 'beginner_plus',
    estimatedHours: dbTrack.estimated_hours,
    prerequisites: Array.isArray(dbTrack.prerequisites) ? dbTrack.prerequisites : [],
    stages: dbTrack.stages.map(mapDbStageToApi),
    stageCount: dbTrack.stageCount,
  };
}

// ========================================
// Public API Functions
// ========================================

/**
 * 특정 언어의 커리큘럼 로드
 */
export async function loadCurriculum(language: string): Promise<Curriculum | null> {
  const dbLanguage = await curriculumRepo.getLanguageById(language);
  if (!dbLanguage) return null;

  const tracks = await curriculumRepo.getFullCurriculum(language);

  return {
    language: dbLanguage.id,
    displayName: dbLanguage.name,
    description: dbLanguage.description || '',
    tracks: tracks.map(mapDbTrackToApi),
  };
}

/**
 * 모든 커리큘럼 로드
 */
export async function loadAllCurriculums(): Promise<Curriculum[]> {
  const languages = await curriculumRepo.getAllLanguages();
  const curriculums: Curriculum[] = [];

  for (const lang of languages) {
    const curriculum = await loadCurriculum(lang.id);
    if (curriculum) {
      curriculums.push(curriculum);
    }
  }

  return curriculums;
}

/**
 * 사용 가능한 언어 목록
 */
export async function getAvailableLanguages(): Promise<{ id: string; name: string; description: string }[]> {
  const languages = await curriculumRepo.getAllLanguages();
  return languages.map((lang) => ({
    id: lang.id,
    name: lang.name,
    description: lang.description || '',
  }));
}

/**
 * 특정 언어의 트랙 목록
 */
export async function getTracks(language: string): Promise<Track[]> {
  const tracks = await curriculumRepo.getFullCurriculum(language);
  return tracks.map(mapDbTrackToApi);
}

/**
 * 특정 트랙 조회
 */
export async function getTrack(language: string, trackId: string): Promise<Track | null> {
  // 트랙이 해당 언어에 속하는지 검증
  const isValid = await curriculumRepo.validateTrackBelongsToLanguage(trackId, language);
  if (!isValid) return null;

  const track = await curriculumRepo.getTrackWithDetails(trackId);
  if (!track) return null;

  return mapDbTrackToApi(track);
}

/**
 * 특정 스테이지 조회
 */
export async function getStage(language: string, trackId: string, stageId: string): Promise<Stage | null> {
  const track = await getTrack(language, trackId);
  if (!track) return null;

  return track.stages.find((s) => s.id === stageId) || null;
}

/**
 * 특정 토픽 조회
 */
export async function getTopic(language: string, trackId: string, topicId: string): Promise<Topic | null> {
  // 토픽이 해당 트랙에 속하는지 검증
  const isValid = await curriculumRepo.validateTopicBelongsToTrack(topicId, trackId);
  if (!isValid) return null;

  const topic = await curriculumRepo.getTopicWithDetails(topicId);
  if (!topic) return null;

  return mapDbTopicToApi(topic);
}

/**
 * 특정 개념 조회
 */
export async function getConcept(
  language: string,
  trackId: string,
  topicId: string,
  conceptId: string
): Promise<Concept | null> {
  const topic = await getTopic(language, trackId, topicId);
  if (!topic) return null;

  return topic.concepts.find((c) => c.id === conceptId) || null;
}

/**
 * 토픽의 컨텍스트 정보 (AI 프롬프트용)
 */
export async function getTopicContext(
  language: string,
  trackId: string,
  topicId: string
): Promise<string | null> {
  const curriculum = await loadCurriculum(language);
  const track = await getTrack(language, trackId);
  const topic = await getTopic(language, trackId, topicId);

  if (!curriculum || !track || !topic) return null;

  const concepts = topic.concepts
    .map((c) => {
      const examples = c.examples.map((ex) => `\`\`\`${language}\n${ex}\n\`\`\``).join('\n');
      return `### ${c.name}\n${c.description}\n\n**예시:**\n${examples}`;
    })
    .join('\n\n');

  return `
## 현재 학습 주제: ${topic.name}

**언어:** ${curriculum.displayName}
**트랙:** ${track.name}
**대상 수준:** ${track.targetLevel}

### 학습 개념
${concepts}

### 관련 키워드
${topic.concepts.flatMap((c) => c.keywords).join(', ')}
`;
}

/**
 * 트랙 내 다음 토픽 찾기
 */
export async function getNextTopic(
  language: string,
  trackId: string,
  currentTopicId: string
): Promise<{ stageId: string; topicId: string; topic: Topic } | null> {
  const nav = await curriculumRepo.getTopicNavigation(trackId, currentTopicId);
  if (!nav.next) return null;

  const topic = await getTopic(language, trackId, nav.next.id);
  if (!topic) return null;

  // stage 정보 가져오기
  const fullPath = await curriculumRepo.getTopicFullPath(nav.next.id);
  if (!fullPath) return null;

  return {
    stageId: fullPath.stage_id,
    topicId: nav.next.id,
    topic,
  };
}

/**
 * 트랙 내 이전 토픽 찾기
 */
export async function getPreviousTopic(
  language: string,
  trackId: string,
  currentTopicId: string
): Promise<{ stageId: string; topicId: string; topic: Topic } | null> {
  const nav = await curriculumRepo.getTopicNavigation(trackId, currentTopicId);
  if (!nav.previous) return null;

  const topic = await getTopic(language, trackId, nav.previous.id);
  if (!topic) return null;

  // stage 정보 가져오기
  const fullPath = await curriculumRepo.getTopicFullPath(nav.previous.id);
  if (!fullPath) return null;

  return {
    stageId: fullPath.stage_id,
    topicId: nav.previous.id,
    topic,
  };
}

/**
 * 트랙의 전체 토픽 목록 (순서대로)
 */
export async function getAllTopicsInTrack(
  language: string,
  trackId: string
): Promise<{ stageId: string; stageName: string; topicId: string; topicName: string; order: number }[]> {
  return curriculumRepo.getAllTopicsInTrack(trackId);
}

/**
 * 키워드로 관련 토픽 검색
 */
export async function searchTopicsByKeyword(
  language: string,
  keyword: string
): Promise<{ trackId: string; trackName: string; topicId: string; topicName: string; relevance: number }[]> {
  const results = await curriculumRepo.searchTopicsByKeyword(language, keyword);

  // DB 검색 결과를 기존 API 형식으로 변환
  return results.map((r) => ({
    trackId: r.track_id,
    trackName: r.track_name,
    topicId: r.topic_id,
    topicName: r.topic_name,
    relevance: 1, // DB 검색에서는 단순 match이므로 기본값 1
  }));
}

/**
 * 캐시 초기화 (DB 기반이므로 더 이상 필요 없지만 API 호환성 유지)
 */
export function clearCache(): void {
  // DB 기반이므로 캐시 없음
  console.log('[Curriculum] Cache clear requested (no-op in DB mode)');
}

/**
 * 커리큘럼 통계
 */
export async function getCurriculumStats(language: string): Promise<{
  totalTracks: number;
  totalStages: number;
  totalTopics: number;
  totalConcepts: number;
  estimatedHours: number;
} | null> {
  const isValid = await curriculumRepo.validateLanguageExists(language);
  if (!isValid) return null;

  const stats = await curriculumRepo.getCurriculumStats(language);

  return {
    totalTracks: stats.trackCount,
    totalStages: stats.stageCount,
    totalTopics: stats.topicCount,
    totalConcepts: stats.conceptCount,
    estimatedHours: stats.totalEstimatedHours,
  };
}

// ========================================
// Validation Functions (추가)
// ========================================

/**
 * 언어 존재 여부 확인
 */
export async function validateLanguage(languageId: string): Promise<boolean> {
  return curriculumRepo.validateLanguageExists(languageId);
}

/**
 * 트랙 존재 여부 확인
 */
export async function validateTrack(trackId: string): Promise<boolean> {
  return curriculumRepo.validateTrackExists(trackId);
}

/**
 * 토픽 존재 여부 확인
 */
export async function validateTopic(topicId: string): Promise<boolean> {
  return curriculumRepo.validateTopicExists(topicId);
}

/**
 * 트랙이 언어에 속하는지 확인
 */
export async function validateTrackInLanguage(trackId: string, languageId: string): Promise<boolean> {
  return curriculumRepo.validateTrackBelongsToLanguage(trackId, languageId);
}

/**
 * 토픽이 트랙에 속하는지 확인
 */
export async function validateTopicInTrack(topicId: string, trackId: string): Promise<boolean> {
  return curriculumRepo.validateTopicBelongsToTrack(topicId, trackId);
}

// ========================================
// Admin Functions (추가)
// ========================================

/**
 * YAML 데이터를 DB로 임포트 (마이그레이션용)
 */
export async function importFromYaml(data: {
  language: {
    id: string;
    name: string;
    description?: string;
  };
  tracks: {
    id: string;
    name: string;
    description?: string;
    targetLevel?: string;
    estimatedHours?: number;
    prerequisites?: string[];
    stages: {
      id: string;
      name: string;
      order: number;
      topics: {
        id: string;
        name: string;
        order: number;
        concepts: {
          id: string;
          name: string;
          description?: string;
          examples?: string[];
          keywords?: string[];
        }[];
      }[];
    }[];
  }[];
}): Promise<void> {
  await curriculumRepo.bulkImportCurriculum(data);
}

/**
 * 토픽의 전체 경로 정보 조회 (track, stage 포함)
 */
export async function getTopicFullPath(topicId: string): Promise<{
  topicId: string;
  topicName: string;
  stageId: string;
  stageName: string;
  trackId: string;
  trackName: string;
  languageId: string;
  languageName: string;
} | null> {
  const path = await curriculumRepo.getTopicFullPath(topicId);
  if (!path) return null;

  return {
    topicId: path.topic_id,
    topicName: path.topic_name,
    stageId: path.stage_id,
    stageName: path.stage_name,
    trackId: path.track_id,
    trackName: path.track_name,
    languageId: path.language_id,
    languageName: path.language_name,
  };
}
