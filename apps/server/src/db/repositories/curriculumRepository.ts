import { query, transaction } from '../index.js';

// ========================================
// Type Definitions
// ========================================

export interface CurriculumLanguage {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CurriculumTrack {
  id: string;
  language_id: string;
  name: string;
  description: string | null;
  target_level: string;
  estimated_hours: number;
  prerequisites: string[];
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CurriculumStage {
  id: string;
  track_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CurriculumTopic {
  id: string;
  stage_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CurriculumConcept {
  id: string;
  topic_id: string;
  name: string;
  description: string | null;
  content: string | null;
  runnable_examples: Array<{
    title: string;
    code: string;
    expected_output?: string;
  }>;
  examples: string[];
  keywords: string[];
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TopicFullPath {
  topic_id: string;
  topic_name: string;
  topic_order: number;
  stage_id: string;
  stage_name: string;
  stage_order: number;
  track_id: string;
  track_name: string;
  target_level: string;
  language_id: string;
  language_name: string;
}

// Nested types for API responses
export interface ConceptWithDetails extends CurriculumConcept {}

export interface TopicWithConcepts extends CurriculumTopic {
  concepts: ConceptWithDetails[];
}

export interface StageWithTopics extends CurriculumStage {
  topics: TopicWithConcepts[];
}

export interface TrackWithStages extends CurriculumTrack {
  stages: StageWithTopics[];
  stageCount?: number;
}

export interface LanguageWithTracks extends CurriculumLanguage {
  tracks?: TrackWithStages[];
}

// ========================================
// Language Operations
// ========================================

export async function getAllLanguages(): Promise<CurriculumLanguage[]> {
  const result = await query<CurriculumLanguage>(
    `SELECT * FROM curriculum_languages
     WHERE is_active = true
     ORDER BY display_order, name`
  );
  return result.rows;
}

export async function getLanguageById(id: string): Promise<CurriculumLanguage | null> {
  const result = await query<CurriculumLanguage>(
    `SELECT * FROM curriculum_languages WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createLanguage(data: {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
}): Promise<CurriculumLanguage> {
  const result = await query<CurriculumLanguage>(
    `INSERT INTO curriculum_languages (id, name, description, display_order)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.id, data.name, data.description || null, data.display_order || 0]
  );
  return result.rows[0];
}

// ========================================
// Track Operations
// ========================================

export async function getTracksByLanguage(languageId: string): Promise<CurriculumTrack[]> {
  const result = await query<CurriculumTrack>(
    `SELECT * FROM curriculum_tracks
     WHERE language_id = $1 AND is_active = true
     ORDER BY display_order, name`,
    [languageId]
  );
  return result.rows;
}

export async function getTrackById(trackId: string): Promise<CurriculumTrack | null> {
  const result = await query<CurriculumTrack>(
    `SELECT * FROM curriculum_tracks WHERE id = $1`,
    [trackId]
  );
  return result.rows[0] || null;
}

export async function createTrack(data: {
  id: string;
  language_id: string;
  name: string;
  description?: string;
  target_level?: string;
  estimated_hours?: number;
  prerequisites?: string[];
  display_order?: number;
}): Promise<CurriculumTrack> {
  const result = await query<CurriculumTrack>(
    `INSERT INTO curriculum_tracks
     (id, language_id, name, description, target_level, estimated_hours, prerequisites, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.id,
      data.language_id,
      data.name,
      data.description || null,
      data.target_level || 'beginner',
      data.estimated_hours || 10,
      JSON.stringify(data.prerequisites || []),
      data.display_order || 0,
    ]
  );
  return result.rows[0];
}

// ========================================
// Stage Operations
// ========================================

export async function getStagesByTrack(trackId: string): Promise<CurriculumStage[]> {
  const result = await query<CurriculumStage>(
    `SELECT * FROM curriculum_stages
     WHERE track_id = $1 AND is_active = true
     ORDER BY display_order, name`,
    [trackId]
  );
  return result.rows;
}

export async function getStageById(stageId: string): Promise<CurriculumStage | null> {
  const result = await query<CurriculumStage>(
    `SELECT * FROM curriculum_stages WHERE id = $1`,
    [stageId]
  );
  return result.rows[0] || null;
}

export async function createStage(data: {
  id: string;
  track_id: string;
  name: string;
  description?: string;
  display_order?: number;
}): Promise<CurriculumStage> {
  const result = await query<CurriculumStage>(
    `INSERT INTO curriculum_stages (id, track_id, name, description, display_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.id, data.track_id, data.name, data.description || null, data.display_order || 0]
  );
  return result.rows[0];
}

// ========================================
// Topic Operations
// ========================================

export async function getTopicsByStage(stageId: string): Promise<CurriculumTopic[]> {
  const result = await query<CurriculumTopic>(
    `SELECT * FROM curriculum_topics
     WHERE stage_id = $1 AND is_active = true
     ORDER BY display_order, name`,
    [stageId]
  );
  return result.rows;
}

export async function getTopicById(topicId: string): Promise<CurriculumTopic | null> {
  const result = await query<CurriculumTopic>(
    `SELECT * FROM curriculum_topics WHERE id = $1`,
    [topicId]
  );
  return result.rows[0] || null;
}

export async function getTopicsByTrack(trackId: string): Promise<CurriculumTopic[]> {
  const result = await query<CurriculumTopic>(
    `SELECT t.* FROM curriculum_topics t
     JOIN curriculum_stages s ON t.stage_id = s.id
     WHERE s.track_id = $1 AND t.is_active = true AND s.is_active = true
     ORDER BY s.display_order, t.display_order`,
    [trackId]
  );
  return result.rows;
}

export async function createTopic(data: {
  id: string;
  stage_id: string;
  name: string;
  description?: string;
  display_order?: number;
}): Promise<CurriculumTopic> {
  const result = await query<CurriculumTopic>(
    `INSERT INTO curriculum_topics (id, stage_id, name, description, display_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.id, data.stage_id, data.name, data.description || null, data.display_order || 0]
  );
  return result.rows[0];
}

// ========================================
// Concept Operations
// ========================================

export async function getConceptsByTopic(topicId: string): Promise<CurriculumConcept[]> {
  const result = await query<CurriculumConcept>(
    `SELECT * FROM curriculum_concepts
     WHERE topic_id = $1 AND is_active = true
     ORDER BY display_order, name`,
    [topicId]
  );
  return result.rows;
}

export async function getConceptById(conceptId: string): Promise<CurriculumConcept | null> {
  const result = await query<CurriculumConcept>(
    `SELECT * FROM curriculum_concepts WHERE id = $1`,
    [conceptId]
  );
  return result.rows[0] || null;
}

export async function createConcept(data: {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  examples?: string[];
  keywords?: string[];
  display_order?: number;
}): Promise<CurriculumConcept> {
  const result = await query<CurriculumConcept>(
    `INSERT INTO curriculum_concepts
     (id, topic_id, name, description, examples, keywords, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.id,
      data.topic_id,
      data.name,
      data.description || null,
      JSON.stringify(data.examples || []),
      JSON.stringify(data.keywords || []),
      data.display_order || 0,
    ]
  );
  return result.rows[0];
}

// ========================================
// Aggregated Queries
// ========================================

export async function getFullCurriculum(languageId: string): Promise<TrackWithStages[]> {
  // Get all tracks for the language
  const tracks = await getTracksByLanguage(languageId);

  const result: TrackWithStages[] = [];

  for (const track of tracks) {
    const stages = await getStagesByTrack(track.id);
    const stagesWithTopics: StageWithTopics[] = [];

    for (const stage of stages) {
      const topics = await getTopicsByStage(stage.id);
      const topicsWithConcepts: TopicWithConcepts[] = [];

      for (const topic of topics) {
        const concepts = await getConceptsByTopic(topic.id);
        topicsWithConcepts.push({
          ...topic,
          concepts,
        });
      }

      stagesWithTopics.push({
        ...stage,
        topics: topicsWithConcepts,
      });
    }

    result.push({
      ...track,
      stages: stagesWithTopics,
      stageCount: stagesWithTopics.length,
    });
  }

  return result;
}

export async function getTrackWithDetails(trackId: string): Promise<TrackWithStages | null> {
  const track = await getTrackById(trackId);
  if (!track) return null;

  const stages = await getStagesByTrack(trackId);
  const stagesWithTopics: StageWithTopics[] = [];

  for (const stage of stages) {
    const topics = await getTopicsByStage(stage.id);
    const topicsWithConcepts: TopicWithConcepts[] = [];

    for (const topic of topics) {
      const concepts = await getConceptsByTopic(topic.id);
      topicsWithConcepts.push({
        ...topic,
        concepts,
      });
    }

    stagesWithTopics.push({
      ...stage,
      topics: topicsWithConcepts,
    });
  }

  return {
    ...track,
    stages: stagesWithTopics,
    stageCount: stagesWithTopics.length,
  };
}

export async function getTopicWithDetails(topicId: string): Promise<TopicWithConcepts | null> {
  const topic = await getTopicById(topicId);
  if (!topic) return null;

  const concepts = await getConceptsByTopic(topicId);
  return {
    ...topic,
    concepts,
  };
}

export async function getTopicFullPath(topicId: string): Promise<TopicFullPath | null> {
  const result = await query<TopicFullPath>(
    `SELECT * FROM curriculum_topic_full_path WHERE topic_id = $1`,
    [topicId]
  );
  return result.rows[0] || null;
}

export async function getAllTopicsInTrack(trackId: string): Promise<{
  stageId: string;
  stageName: string;
  topicId: string;
  topicName: string;
  order: number;
}[]> {
  const result = await query<{
    stage_id: string;
    stage_name: string;
    topic_id: string;
    topic_name: string;
    absolute_order: number;
  }>(
    `SELECT
      s.id as stage_id,
      s.name as stage_name,
      t.id as topic_id,
      t.name as topic_name,
      (s.display_order * 1000 + t.display_order) as absolute_order
     FROM curriculum_topics t
     JOIN curriculum_stages s ON t.stage_id = s.id
     WHERE s.track_id = $1 AND t.is_active = true AND s.is_active = true
     ORDER BY s.display_order, t.display_order`,
    [trackId]
  );

  return result.rows.map((row, index) => ({
    stageId: row.stage_id,
    stageName: row.stage_name,
    topicId: row.topic_id,
    topicName: row.topic_name,
    order: index + 1,
  }));
}

// Topic navigation
export async function getTopicNavigation(
  trackId: string,
  currentTopicId: string
): Promise<{
  previous: { id: string; name: string } | null;
  next: { id: string; name: string } | null;
}> {
  const topics = await getAllTopicsInTrack(trackId);
  const currentIndex = topics.findIndex((t) => t.topicId === currentTopicId);

  return {
    previous:
      currentIndex > 0
        ? { id: topics[currentIndex - 1].topicId, name: topics[currentIndex - 1].topicName }
        : null,
    next:
      currentIndex < topics.length - 1
        ? { id: topics[currentIndex + 1].topicId, name: topics[currentIndex + 1].topicName }
        : null,
  };
}

// ========================================
// Search Operations
// ========================================

export async function searchTopicsByKeyword(
  languageId: string,
  keyword: string
): Promise<TopicFullPath[]> {
  const result = await query<TopicFullPath>(
    `SELECT fp.* FROM curriculum_topic_full_path fp
     JOIN curriculum_concepts c ON c.topic_id = fp.topic_id
     WHERE fp.language_id = $1
       AND (
         fp.topic_name ILIKE $2
         OR c.name ILIKE $2
         OR c.description ILIKE $2
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements_text(c.keywords) kw
           WHERE kw ILIKE $2
         )
       )
     GROUP BY fp.topic_id, fp.topic_name, fp.topic_order,
              fp.stage_id, fp.stage_name, fp.stage_order,
              fp.track_id, fp.track_name, fp.target_level,
              fp.language_id, fp.language_name
     ORDER BY fp.track_name, fp.stage_order, fp.topic_order`,
    [languageId, `%${keyword}%`]
  );
  return result.rows;
}

// ========================================
// Statistics
// ========================================

export async function getCurriculumStats(languageId: string): Promise<{
  trackCount: number;
  stageCount: number;
  topicCount: number;
  conceptCount: number;
  totalEstimatedHours: number;
}> {
  const result = await query<{
    track_count: string;
    stage_count: string;
    topic_count: string;
    concept_count: string;
    total_hours: string;
  }>(
    `SELECT
      COUNT(DISTINCT tr.id) as track_count,
      COUNT(DISTINCT s.id) as stage_count,
      COUNT(DISTINCT t.id) as topic_count,
      COUNT(DISTINCT c.id) as concept_count,
      COALESCE(SUM(DISTINCT tr.estimated_hours), 0) as total_hours
     FROM curriculum_tracks tr
     LEFT JOIN curriculum_stages s ON s.track_id = tr.id AND s.is_active = true
     LEFT JOIN curriculum_topics t ON t.stage_id = s.id AND t.is_active = true
     LEFT JOIN curriculum_concepts c ON c.topic_id = t.id AND c.is_active = true
     WHERE tr.language_id = $1 AND tr.is_active = true`,
    [languageId]
  );

  const row = result.rows[0];
  return {
    trackCount: parseInt(row.track_count) || 0,
    stageCount: parseInt(row.stage_count) || 0,
    topicCount: parseInt(row.topic_count) || 0,
    conceptCount: parseInt(row.concept_count) || 0,
    totalEstimatedHours: parseInt(row.total_hours) || 0,
  };
}

// ========================================
// Update Operations
// ========================================

export async function updateConcept(
  conceptId: string,
  data: {
    name?: string;
    description?: string;
    examples?: string[];
    keywords?: string[];
    display_order?: number;
    is_active?: boolean;
  }
): Promise<CurriculumConcept | null> {
  const setClauses: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.examples !== undefined) {
    setClauses.push(`examples = $${paramIndex++}`);
    values.push(JSON.stringify(data.examples));
  }
  if (data.keywords !== undefined) {
    setClauses.push(`keywords = $${paramIndex++}`);
    values.push(JSON.stringify(data.keywords));
  }
  if (data.display_order !== undefined) {
    setClauses.push(`display_order = $${paramIndex++}`);
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = NOW()');
  values.push(conceptId);

  const result = await query<CurriculumConcept>(
    `UPDATE curriculum_concepts
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteConcept(conceptId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM curriculum_concepts WHERE id = $1`,
    [conceptId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateTopic(
  topicId: string,
  data: {
    name?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
  }
): Promise<CurriculumTopic | null> {
  const setClauses: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.display_order !== undefined) {
    setClauses.push(`display_order = $${paramIndex++}`);
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = NOW()');
  values.push(topicId);

  const result = await query<CurriculumTopic>(
    `UPDATE curriculum_topics
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteTopic(topicId: string): Promise<boolean> {
  // Also delete related concepts
  await query(`DELETE FROM curriculum_concepts WHERE topic_id = $1`, [topicId]);

  const result = await query(
    `DELETE FROM curriculum_topics WHERE id = $1`,
    [topicId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateStage(
  stageId: string,
  data: {
    name?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
  }
): Promise<CurriculumStage | null> {
  const setClauses: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.display_order !== undefined) {
    setClauses.push(`display_order = $${paramIndex++}`);
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = NOW()');
  values.push(stageId);

  const result = await query<CurriculumStage>(
    `UPDATE curriculum_stages
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteStage(stageId: string): Promise<boolean> {
  // Get all topics in this stage
  const topics = await query<{ id: string }>(
    `SELECT id FROM curriculum_topics WHERE stage_id = $1`,
    [stageId]
  );

  // Delete concepts for each topic
  for (const topic of topics.rows) {
    await query(`DELETE FROM curriculum_concepts WHERE topic_id = $1`, [topic.id]);
  }

  // Delete topics
  await query(`DELETE FROM curriculum_topics WHERE stage_id = $1`, [stageId]);

  // Delete stage
  const result = await query(
    `DELETE FROM curriculum_stages WHERE id = $1`,
    [stageId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateTrack(
  trackId: string,
  data: {
    name?: string;
    description?: string;
    target_level?: string;
    estimated_hours?: number;
    prerequisites?: string[];
    display_order?: number;
    is_active?: boolean;
  }
): Promise<CurriculumTrack | null> {
  const setClauses: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.target_level !== undefined) {
    setClauses.push(`target_level = $${paramIndex++}`);
    values.push(data.target_level);
  }
  if (data.estimated_hours !== undefined) {
    setClauses.push(`estimated_hours = $${paramIndex++}`);
    values.push(data.estimated_hours);
  }
  if (data.prerequisites !== undefined) {
    setClauses.push(`prerequisites = $${paramIndex++}`);
    values.push(JSON.stringify(data.prerequisites));
  }
  if (data.display_order !== undefined) {
    setClauses.push(`display_order = $${paramIndex++}`);
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = NOW()');
  values.push(trackId);

  const result = await query<CurriculumTrack>(
    `UPDATE curriculum_tracks
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

// ========================================
// Validation - Check if IDs exist
// ========================================

export async function validateLanguageExists(languageId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM curriculum_languages WHERE id = $1 AND is_active = true) as exists`,
    [languageId]
  );
  return result.rows[0].exists;
}

export async function validateTrackExists(trackId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM curriculum_tracks WHERE id = $1 AND is_active = true) as exists`,
    [trackId]
  );
  return result.rows[0].exists;
}

export async function validateTopicExists(topicId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM curriculum_topics WHERE id = $1 AND is_active = true) as exists`,
    [topicId]
  );
  return result.rows[0].exists;
}

export async function validateTrackBelongsToLanguage(
  trackId: string,
  languageId: string
): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM curriculum_tracks
      WHERE id = $1 AND language_id = $2 AND is_active = true
    ) as exists`,
    [trackId, languageId]
  );
  return result.rows[0].exists;
}

export async function validateTopicBelongsToTrack(
  topicId: string,
  trackId: string
): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM curriculum_topics t
      JOIN curriculum_stages s ON t.stage_id = s.id
      WHERE t.id = $1 AND s.track_id = $2 AND t.is_active = true AND s.is_active = true
    ) as exists`,
    [topicId, trackId]
  );
  return result.rows[0].exists;
}

// ========================================
// Bulk Import (for YAML migration)
// ========================================

export async function bulkImportCurriculum(data: {
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
  await transaction(async (client) => {
    // 1. Insert language
    await client.query(
      `INSERT INTO curriculum_languages (id, name, description, display_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         updated_at = NOW()`,
      [data.language.id, data.language.name, data.language.description || null, 0]
    );

    // 2. Insert tracks
    for (let trackIndex = 0; trackIndex < data.tracks.length; trackIndex++) {
      const track = data.tracks[trackIndex];
      await client.query(
        `INSERT INTO curriculum_tracks
         (id, language_id, name, description, target_level, estimated_hours, prerequisites, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           target_level = EXCLUDED.target_level,
           estimated_hours = EXCLUDED.estimated_hours,
           prerequisites = EXCLUDED.prerequisites,
           display_order = EXCLUDED.display_order,
           updated_at = NOW()`,
        [
          track.id,
          data.language.id,
          track.name,
          track.description || null,
          track.targetLevel || 'beginner',
          track.estimatedHours || 10,
          JSON.stringify(track.prerequisites || []),
          trackIndex,
        ]
      );

      // 3. Insert stages
      for (const stage of track.stages) {
        await client.query(
          `INSERT INTO curriculum_stages (id, track_id, name, display_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             display_order = EXCLUDED.display_order,
             updated_at = NOW()`,
          [stage.id, track.id, stage.name, stage.order]
        );

        // 4. Insert topics
        for (const topic of stage.topics) {
          await client.query(
            `INSERT INTO curriculum_topics (id, stage_id, name, display_order)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               display_order = EXCLUDED.display_order,
               updated_at = NOW()`,
            [topic.id, stage.id, topic.name, topic.order]
          );

          // 5. Insert concepts
          for (let conceptIndex = 0; conceptIndex < topic.concepts.length; conceptIndex++) {
            const concept = topic.concepts[conceptIndex];
            await client.query(
              `INSERT INTO curriculum_concepts
               (id, topic_id, name, description, examples, keywords, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 description = EXCLUDED.description,
                 examples = EXCLUDED.examples,
                 keywords = EXCLUDED.keywords,
                 display_order = EXCLUDED.display_order,
                 updated_at = NOW()`,
              [
                concept.id,
                topic.id,
                concept.name,
                concept.description || null,
                JSON.stringify(concept.examples || []),
                JSON.stringify(concept.keywords || []),
                conceptIndex,
              ]
            );
          }
        }
      }
    }
  });
}
