import { query, transaction } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

// 타입 정의
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
  test_cases: TestCase[];
  sample_answer: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TestCase {
  description: string;
  expectedOutput: string;
  points: number;
  input?: string;
}

export interface QuestionGenerationJob {
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
  created_at: Date;
  completed_at: Date | null;
}

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

// Question Bank Repository
export const questionBankRepository = {
  /**
   * 문제 은행에 문제 추가
   */
  async create(data: {
    language: string;
    trackId: string;
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    title: string;
    description: string;
    requirements: string[];
    testCases: TestCase[];
    sampleAnswer: string;
    createdBy: string;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<QuestionBankItem> {
    const id = uuidv4();
    const result = await query<QuestionBankItem>(
      `INSERT INTO question_bank (
        id, language, track_id, topic_id, difficulty, points,
        title, description, requirements, test_cases, sample_answer,
        status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        id,
        data.language,
        data.trackId,
        data.topicId,
        data.difficulty,
        data.points,
        data.title,
        data.description,
        JSON.stringify(data.requirements),
        JSON.stringify(data.testCases),
        data.sampleAnswer,
        data.status || 'pending',
        data.createdBy,
      ]
    );
    return this.parseQuestion(result.rows[0]);
  },

  /**
   * 여러 문제 일괄 추가
   */
  async createMany(questions: Array<{
    language: string;
    trackId: string;
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    title: string;
    description: string;
    requirements: string[];
    testCases: TestCase[];
    sampleAnswer: string;
    createdBy: string;
    status?: 'pending' | 'approved' | 'rejected';
  }>): Promise<QuestionBankItem[]> {
    if (questions.length === 0) return [];

    return transaction(async (client) => {
      const results: QuestionBankItem[] = [];

      for (const q of questions) {
        const id = uuidv4();
        const result = await client.query<QuestionBankItem>(
          `INSERT INTO question_bank (
            id, language, track_id, topic_id, difficulty, points,
            title, description, requirements, test_cases, sample_answer,
            status, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          RETURNING *`,
          [
            id,
            q.language,
            q.trackId,
            q.topicId,
            q.difficulty,
            q.points,
            q.title,
            q.description,
            JSON.stringify(q.requirements),
            JSON.stringify(q.testCases),
            q.sampleAnswer,
            q.status || 'pending',
            q.createdBy,
          ]
        );
        results.push(this.parseQuestion(result.rows[0]));
      }

      return results;
    });
  },

  /**
   * 문제 조회 (ID)
   */
  async findById(id: string): Promise<QuestionBankItem | null> {
    const result = await query<QuestionBankItem>(
      `SELECT * FROM question_bank WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.parseQuestion(result.rows[0]) : null;
  },

  /**
   * 토픽별 문제 조회
   */
  async findByTopic(
    language: string,
    trackId: string,
    topicId: string,
    options?: {
      status?: 'pending' | 'approved' | 'rejected';
      difficulty?: 'easy' | 'medium' | 'hard';
      limit?: number;
    }
  ): Promise<QuestionBankItem[]> {
    let sql = `SELECT * FROM question_bank WHERE language = $1 AND track_id = $2 AND topic_id = $3`;
    const params: any[] = [language, trackId, topicId];
    let paramIndex = 4;

    if (options?.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(options.status);
    }

    if (options?.difficulty) {
      sql += ` AND difficulty = $${paramIndex++}`;
      params.push(options.difficulty);
    }

    sql += ` ORDER BY difficulty, created_at DESC`;

    if (options?.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(options.limit);
    }

    const result = await query<QuestionBankItem>(sql, params);
    return result.rows.map(r => this.parseQuestion(r));
  },

  /**
   * 시험용 문제 랜덤 선택 (승인된 문제만)
   */
  async getRandomQuestions(
    language: string,
    trackId: string,
    topicId: string,
    count: number,
    difficultyConfig?: { easy?: number; medium?: number; hard?: number }
  ): Promise<QuestionBankItem[]> {
    const questions: QuestionBankItem[] = [];

    if (difficultyConfig) {
      // 난이도별로 지정된 개수만큼 선택
      for (const [difficulty, num] of Object.entries(difficultyConfig)) {
        if (num && num > 0) {
          const result = await query<QuestionBankItem>(
            `SELECT * FROM question_bank
             WHERE language = $1 AND track_id = $2 AND topic_id = $3
             AND status = 'approved' AND difficulty = $4
             ORDER BY RANDOM() LIMIT $5`,
            [language, trackId, topicId, difficulty, num]
          );
          questions.push(...result.rows.map(r => this.parseQuestion(r)));
        }
      }
    } else {
      // 난이도 구분 없이 랜덤 선택
      const result = await query<QuestionBankItem>(
        `SELECT * FROM question_bank
         WHERE language = $1 AND track_id = $2 AND topic_id = $3 AND status = 'approved'
         ORDER BY RANDOM() LIMIT $4`,
        [language, trackId, topicId, count]
      );
      questions.push(...result.rows.map(r => this.parseQuestion(r)));
    }

    return questions;
  },

  /**
   * 문제 상태 업데이트 (승인/거부)
   */
  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    approvedBy: string
  ): Promise<QuestionBankItem | null> {
    const result = await query<QuestionBankItem>(
      `UPDATE question_bank
       SET status = $2, approved_by = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status, approvedBy]
    );
    return result.rows[0] ? this.parseQuestion(result.rows[0]) : null;
  },

  /**
   * 문제 수정
   */
  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      requirements: string[];
      testCases: TestCase[];
      sampleAnswer: string;
      points: number;
      difficulty: 'easy' | 'medium' | 'hard';
    }>
  ): Promise<QuestionBankItem | null> {
    const updates: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }
    if (data.requirements !== undefined) {
      updates.push(`requirements = $${paramIndex++}`);
      params.push(JSON.stringify(data.requirements));
    }
    if (data.testCases !== undefined) {
      updates.push(`test_cases = $${paramIndex++}`);
      params.push(JSON.stringify(data.testCases));
    }
    if (data.sampleAnswer !== undefined) {
      updates.push(`sample_answer = $${paramIndex++}`);
      params.push(data.sampleAnswer);
    }
    if (data.points !== undefined) {
      updates.push(`points = $${paramIndex++}`);
      params.push(data.points);
    }
    if (data.difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex++}`);
      params.push(data.difficulty);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = NOW()');

    const result = await query<QuestionBankItem>(
      `UPDATE question_bank SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    return result.rows[0] ? this.parseQuestion(result.rows[0]) : null;
  },

  /**
   * 문제 삭제
   */
  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM question_bank WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * 토픽별 문제 통계 조회
   */
  async getStatsByTopic(
    language: string,
    trackId: string
  ): Promise<QuestionBankStats[]> {
    const result = await query<{
      language: string;
      track_id: string;
      topic_id: string;
      easy_count: string;
      medium_count: string;
      hard_count: string;
      total_count: string;
      pending_count: string;
      approved_count: string;
    }>(
      `SELECT
        language, track_id, topic_id,
        COUNT(*) FILTER (WHERE difficulty = 'easy') as easy_count,
        COUNT(*) FILTER (WHERE difficulty = 'medium') as medium_count,
        COUNT(*) FILTER (WHERE difficulty = 'hard') as hard_count,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count
       FROM question_bank
       WHERE language = $1 AND track_id = $2
       GROUP BY language, track_id, topic_id
       ORDER BY topic_id`,
      [language, trackId]
    );

    return result.rows.map(row => ({
      language: row.language,
      track_id: row.track_id,
      topic_id: row.topic_id,
      topic_name: '', // Will be filled by caller
      easy_count: parseInt(row.easy_count, 10),
      medium_count: parseInt(row.medium_count, 10),
      hard_count: parseInt(row.hard_count, 10),
      total_count: parseInt(row.total_count, 10),
      pending_count: parseInt(row.pending_count, 10),
      approved_count: parseInt(row.approved_count, 10),
    }));
  },

  /**
   * 여러 토픽에서 시험용 문제 랜덤 선택 (승인된 문제만)
   */
  async getRandomQuestionsFromTopics(
    language: string,
    trackId: string,
    topicIds: string[],
    count: number
  ): Promise<QuestionBankItem[]> {
    if (topicIds.length === 0) return [];

    // 토픽별로 고르게 분배
    const countPerTopic = Math.ceil(count / topicIds.length);
    const questions: QuestionBankItem[] = [];

    for (const topicId of topicIds) {
      const result = await query<QuestionBankItem>(
        `SELECT * FROM question_bank
         WHERE language = $1 AND track_id = $2 AND topic_id = $3 AND status = 'approved'
         ORDER BY RANDOM() LIMIT $4`,
        [language, trackId, topicId, countPerTopic]
      );
      questions.push(...result.rows.map(r => this.parseQuestion(r)));
    }

    // 요청한 개수만큼 셔플 후 반환
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * 토픽별 승인된 문제 수 조회
   */
  async getApprovedCountByTopics(
    language: string,
    trackId: string,
    topicIds: string[]
  ): Promise<number> {
    if (topicIds.length === 0) return 0;

    const placeholders = topicIds.map((_, i) => `$${i + 3}`).join(', ');
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM question_bank
       WHERE language = $1 AND track_id = $2 AND topic_id IN (${placeholders}) AND status = 'approved'`,
      [language, trackId, ...topicIds]
    );

    return parseInt(result.rows[0]?.count || '0', 10);
  },

  /**
   * JSON 파싱 헬퍼
   */
  parseQuestion(row: any): QuestionBankItem {
    return {
      ...row,
      requirements: typeof row.requirements === 'string'
        ? JSON.parse(row.requirements)
        : row.requirements || [],
      test_cases: typeof row.test_cases === 'string'
        ? JSON.parse(row.test_cases)
        : row.test_cases || [],
    };
  },
};

// Question Generation Job Repository
export const questionGenerationJobRepository = {
  /**
   * 생성 작업 생성
   */
  async create(data: {
    language: string;
    trackId: string;
    topicId: string;
    topicName: string;
    difficultyConfig: { easy: number; medium: number; hard: number };
    createdBy: string;
  }): Promise<QuestionGenerationJob> {
    const id = uuidv4();
    const result = await query<QuestionGenerationJob>(
      `INSERT INTO question_generation_jobs (
        id, language, track_id, topic_id, topic_name, difficulty_config,
        status, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
      RETURNING *`,
      [
        id,
        data.language,
        data.trackId,
        data.topicId,
        data.topicName,
        JSON.stringify(data.difficultyConfig),
        data.createdBy,
      ]
    );
    return this.parseJob(result.rows[0]);
  },

  /**
   * 작업 상태 업데이트
   */
  async updateStatus(
    id: string,
    status: 'in_progress' | 'completed' | 'failed',
    errorMessage?: string
  ): Promise<QuestionGenerationJob | null> {
    const completedAt = ['completed', 'failed'].includes(status) ? 'NOW()' : 'NULL';
    const result = await query<QuestionGenerationJob>(
      `UPDATE question_generation_jobs
       SET status = $2, error_message = $3, completed_at = ${completedAt}
       WHERE id = $1
       RETURNING *`,
      [id, status, errorMessage || null]
    );
    return result.rows[0] ? this.parseJob(result.rows[0]) : null;
  },

  /**
   * 대기 중인 작업 조회
   */
  async findPending(): Promise<QuestionGenerationJob[]> {
    const result = await query<QuestionGenerationJob>(
      `SELECT * FROM question_generation_jobs
       WHERE status = 'pending'
       ORDER BY created_at
       LIMIT 10`
    );
    return result.rows.map(r => this.parseJob(r));
  },

  /**
   * 사용자의 작업 목록 조회
   */
  async findByUser(userId: string): Promise<QuestionGenerationJob[]> {
    const result = await query<QuestionGenerationJob>(
      `SELECT * FROM question_generation_jobs
       WHERE created_by = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return result.rows.map(r => this.parseJob(r));
  },

  /**
   * 작업 조회 (ID)
   */
  async findById(id: string): Promise<QuestionGenerationJob | null> {
    const result = await query<QuestionGenerationJob>(
      `SELECT * FROM question_generation_jobs WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.parseJob(result.rows[0]) : null;
  },

  /**
   * JSON 파싱 헬퍼
   */
  parseJob(row: any): QuestionGenerationJob {
    return {
      ...row,
      difficulty_config: typeof row.difficulty_config === 'string'
        ? JSON.parse(row.difficulty_config)
        : row.difficulty_config || { easy: 0, medium: 0, hard: 0 },
    };
  },
};
