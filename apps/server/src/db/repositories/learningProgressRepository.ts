import { query, transaction } from '../index.js';

// 타입 정의
export interface LearningProgress {
  id: string;
  user_id: string;
  language: string;
  track_id: string;
  topic_id: string;
  concept_id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  practice_count: number;
  correct_count: number;
  last_practiced_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface TopicStats {
  id: string;
  language: string;
  track_id: string;
  topic_id: string;
  total_attempts: number;
  total_correct: number;
  total_users: number;
  avg_completion_time: number | null;
  difficulty_score: number | null;
  updated_at: Date;
}

export interface UserTrackEnrollment {
  id: string;
  user_id: string;
  language: string;
  track_id: string;
  current_topic_id: string | null;
  progress_percent: number;
  enrolled_at: Date;
  last_activity_at: Date;
}

// Learning Progress Repository
export const learningProgressRepository = {
  /**
   * 사용자의 특정 토픽 진도 조회
   */
  async findByUserAndTopic(
    userId: string,
    language: string,
    trackId: string,
    topicId: string
  ): Promise<LearningProgress | null> {
    const result = await query<LearningProgress>(
      `SELECT * FROM learning_progress
       WHERE user_id = $1 AND language = $2 AND track_id = $3 AND topic_id = $4`,
      [userId, language, trackId, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * 사용자의 트랙 내 모든 진도 조회
   */
  async findByUserAndTrack(
    userId: string,
    language: string,
    trackId: string
  ): Promise<LearningProgress[]> {
    const result = await query<LearningProgress>(
      `SELECT * FROM learning_progress
       WHERE user_id = $1 AND language = $2 AND track_id = $3
       ORDER BY created_at`,
      [userId, language, trackId]
    );
    return result.rows;
  },

  /**
   * 진도 생성 또는 업데이트
   */
  async upsert(data: {
    userId: string;
    language: string;
    trackId: string;
    topicId: string;
    conceptId?: string;
    status?: 'not_started' | 'in_progress' | 'completed';
    practiceCount?: number;
    correctCount?: number;
  }): Promise<LearningProgress> {
    const result = await query<LearningProgress>(
      `INSERT INTO learning_progress (user_id, language, track_id, topic_id, concept_id, status, practice_count, correct_count, last_practiced_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (user_id, language, track_id, topic_id)
       DO UPDATE SET
         concept_id = COALESCE($5, learning_progress.concept_id),
         status = COALESCE($6, learning_progress.status),
         practice_count = learning_progress.practice_count + COALESCE($7, 0),
         correct_count = learning_progress.correct_count + COALESCE($8, 0),
         last_practiced_at = NOW(),
         updated_at = NOW(),
         completed_at = CASE WHEN $6 = 'completed' THEN NOW() ELSE learning_progress.completed_at END
       RETURNING *`,
      [
        data.userId,
        data.language,
        data.trackId,
        data.topicId,
        data.conceptId || null,
        data.status || 'not_started',
        data.practiceCount || 0,
        data.correctCount || 0,
      ]
    );
    return result.rows[0];
  },

  /**
   * 연습 결과 기록
   */
  async recordPractice(
    userId: string,
    language: string,
    trackId: string,
    topicId: string,
    isCorrect: boolean
  ): Promise<LearningProgress> {
    return this.upsert({
      userId,
      language,
      trackId,
      topicId,
      status: 'in_progress',
      practiceCount: 1,
      correctCount: isCorrect ? 1 : 0,
    });
  },

  /**
   * 토픽 완료 표시
   */
  async markCompleted(
    userId: string,
    language: string,
    trackId: string,
    topicId: string
  ): Promise<LearningProgress> {
    const result = await query<LearningProgress>(
      `UPDATE learning_progress
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE user_id = $1 AND language = $2 AND track_id = $3 AND topic_id = $4
       RETURNING *`,
      [userId, language, trackId, topicId]
    );

    if (result.rows.length === 0) {
      // 진도가 없으면 새로 생성
      return this.upsert({
        userId,
        language,
        trackId,
        topicId,
        status: 'completed',
      });
    }

    return result.rows[0];
  },

  /**
   * 사용자의 완료된 토픽 수 조회
   */
  async getCompletedCount(userId: string, language: string, trackId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) FROM learning_progress
       WHERE user_id = $1 AND language = $2 AND track_id = $3 AND status = 'completed'`,
      [userId, language, trackId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  /**
   * 반별 학생 진도 현황 조회 (강사용)
   */
  async getClassProgress(classId: string): Promise<{
    userId: string;
    userName: string;
    language: string;
    trackId: string;
    progressPercent: number;
    completedTopics: number;
    totalTopics: number;
    lastActivityAt: Date | null;
  }[]> {
    const result = await query<{
      user_id: string;
      user_name: string;
      language: string;
      track_id: string;
      progress_percent: number;
      completed_topics: string;
      total_topics: string;
      last_activity_at: Date | null;
    }>(
      `SELECT
        u.id as user_id,
        u.name as user_name,
        ute.language,
        ute.track_id,
        ute.progress_percent,
        COALESCE(
          (SELECT COUNT(*) FROM learning_progress lp
           WHERE lp.user_id = u.id
           AND lp.language = ute.language
           AND lp.track_id = ute.track_id
           AND lp.status = 'completed'), 0
        ) as completed_topics,
        COALESCE(
          (SELECT COUNT(*) FROM learning_progress lp
           WHERE lp.user_id = u.id
           AND lp.language = ute.language
           AND lp.track_id = ute.track_id), 0
        ) as total_topics,
        ute.last_activity_at
      FROM users u
      JOIN user_track_enrollment ute ON u.id = ute.user_id
      WHERE u.class_id = $1
      ORDER BY u.name, ute.language, ute.track_id`,
      [classId]
    );

    return result.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name,
      language: row.language,
      trackId: row.track_id,
      progressPercent: row.progress_percent || 0,
      completedTopics: parseInt(row.completed_topics, 10),
      totalTopics: parseInt(row.total_topics, 10),
      lastActivityAt: row.last_activity_at,
    }));
  },

  /**
   * 트랙별 학생 상세 진도 조회 (강사용)
   */
  async getTrackProgressDetail(
    classId: string,
    language: string,
    trackId: string
  ): Promise<{
    userId: string;
    userName: string;
    topicId: string;
    status: string;
    practiceCount: number;
    correctCount: number;
    lastPracticedAt: Date | null;
    completedAt: Date | null;
  }[]> {
    const result = await query<{
      user_id: string;
      user_name: string;
      topic_id: string;
      status: string;
      practice_count: number;
      correct_count: number;
      last_practiced_at: Date | null;
      completed_at: Date | null;
    }>(
      `SELECT
        u.id as user_id,
        u.name as user_name,
        lp.topic_id,
        lp.status,
        lp.practice_count,
        lp.correct_count,
        lp.last_practiced_at,
        lp.completed_at
      FROM users u
      JOIN learning_progress lp ON u.id = lp.user_id
      WHERE u.class_id = $1
        AND lp.language = $2
        AND lp.track_id = $3
      ORDER BY u.name, lp.topic_id`,
      [classId, language, trackId]
    );

    return result.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name,
      topicId: row.topic_id,
      status: row.status,
      practiceCount: row.practice_count,
      correctCount: row.correct_count,
      lastPracticedAt: row.last_practiced_at,
      completedAt: row.completed_at,
    }));
  },

  /**
   * 반의 모든 학생 목록과 기본 진도 정보
   */
  async getStudentsWithProgress(classId: string): Promise<{
    userId: string;
    userName: string;
    email: string;
    level: string;
    enrolledTracks: number;
    totalCompleted: number;
    lastActivityAt: Date | null;
  }[]> {
    const result = await query<{
      user_id: string;
      user_name: string;
      email: string;
      level: string;
      enrolled_tracks: string;
      total_completed: string;
      last_activity_at: Date | null;
    }>(
      `SELECT
        u.id as user_id,
        u.name as user_name,
        u.email,
        u.level,
        COALESCE((SELECT COUNT(*) FROM user_track_enrollment WHERE user_id = u.id), 0) as enrolled_tracks,
        COALESCE((SELECT COUNT(*) FROM learning_progress WHERE user_id = u.id AND status = 'completed'), 0) as total_completed,
        (SELECT MAX(last_activity_at) FROM user_track_enrollment WHERE user_id = u.id) as last_activity_at
      FROM users u
      WHERE u.class_id = $1 AND u.role = 'student'
      ORDER BY u.name`,
      [classId]
    );

    return result.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name,
      email: row.email,
      level: row.level,
      enrolledTracks: parseInt(row.enrolled_tracks, 10),
      totalCompleted: parseInt(row.total_completed, 10),
      lastActivityAt: row.last_activity_at,
    }));
  },
};

// Topic Stats Repository
export const topicStatsRepository = {
  /**
   * 토픽 통계 조회
   */
  async findByTopic(
    language: string,
    trackId: string,
    topicId: string
  ): Promise<TopicStats | null> {
    const result = await query<TopicStats>(
      `SELECT * FROM topic_stats
       WHERE language = $1 AND track_id = $2 AND topic_id = $3`,
      [language, trackId, topicId]
    );
    return result.rows[0] || null;
  },

  /**
   * 토픽 통계 업데이트
   */
  async recordAttempt(
    language: string,
    trackId: string,
    topicId: string,
    isCorrect: boolean
  ): Promise<TopicStats> {
    const result = await query<TopicStats>(
      `INSERT INTO topic_stats (language, track_id, topic_id, total_attempts, total_correct, updated_at)
       VALUES ($1, $2, $3, 1, $4, NOW())
       ON CONFLICT (language, track_id, topic_id)
       DO UPDATE SET
         total_attempts = topic_stats.total_attempts + 1,
         total_correct = topic_stats.total_correct + $4,
         difficulty_score = 1.0 - (topic_stats.total_correct::decimal / NULLIF(topic_stats.total_attempts + 1, 0)),
         updated_at = NOW()
       RETURNING *`,
      [language, trackId, topicId, isCorrect ? 1 : 0]
    );
    return result.rows[0];
  },

  /**
   * 전체 트랙 통계 조회
   */
  async getTrackStats(language: string, trackId: string): Promise<TopicStats[]> {
    const result = await query<TopicStats>(
      `SELECT * FROM topic_stats
       WHERE language = $1 AND track_id = $2
       ORDER BY topic_id`,
      [language, trackId]
    );
    return result.rows;
  },
};

// User Track Enrollment Repository
export const userTrackEnrollmentRepository = {
  /**
   * 사용자 트랙 등록 조회
   */
  async findByUserAndTrack(
    userId: string,
    language: string,
    trackId: string
  ): Promise<UserTrackEnrollment | null> {
    const result = await query<UserTrackEnrollment>(
      `SELECT * FROM user_track_enrollment
       WHERE user_id = $1 AND language = $2 AND track_id = $3`,
      [userId, language, trackId]
    );
    return result.rows[0] || null;
  },

  /**
   * 사용자의 모든 등록된 트랙 조회
   */
  async findByUser(userId: string): Promise<UserTrackEnrollment[]> {
    const result = await query<UserTrackEnrollment>(
      `SELECT * FROM user_track_enrollment
       WHERE user_id = $1
       ORDER BY last_activity_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * 트랙 등록
   */
  async enroll(
    userId: string,
    language: string,
    trackId: string,
    startTopicId?: string
  ): Promise<UserTrackEnrollment> {
    const result = await query<UserTrackEnrollment>(
      `INSERT INTO user_track_enrollment (user_id, language, track_id, current_topic_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, language, track_id)
       DO UPDATE SET last_activity_at = NOW()
       RETURNING *`,
      [userId, language, trackId, startTopicId || null]
    );
    return result.rows[0];
  },

  /**
   * 현재 토픽 업데이트
   */
  async updateCurrentTopic(
    userId: string,
    language: string,
    trackId: string,
    topicId: string
  ): Promise<UserTrackEnrollment> {
    const result = await query<UserTrackEnrollment>(
      `UPDATE user_track_enrollment
       SET current_topic_id = $4, last_activity_at = NOW()
       WHERE user_id = $1 AND language = $2 AND track_id = $3
       RETURNING *`,
      [userId, language, trackId, topicId]
    );
    return result.rows[0];
  },

  /**
   * 진도율 업데이트
   */
  async updateProgress(
    userId: string,
    language: string,
    trackId: string,
    progressPercent: number
  ): Promise<UserTrackEnrollment> {
    const result = await query<UserTrackEnrollment>(
      `UPDATE user_track_enrollment
       SET progress_percent = $4, last_activity_at = NOW()
       WHERE user_id = $1 AND language = $2 AND track_id = $3
       RETURNING *`,
      [userId, language, trackId, progressPercent]
    );
    return result.rows[0];
  },
};
