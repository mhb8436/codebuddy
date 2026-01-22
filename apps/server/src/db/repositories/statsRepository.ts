import { query } from '../index.js';

interface ModelUsageStats {
  model_used: string;
  message_count: number;
  total_tokens: number;
  estimated_cost: number;
}

interface LevelUsageStats {
  level: string;
  user_count: number;
  session_count: number;
  message_count: number;
  total_tokens: number;
}

interface DailyUsageStats {
  date: string;
  message_count: number;
  total_tokens: number;
  unique_users: number;
}

interface UserUsageStats {
  user_id: string;
  user_name: string;
  user_email: string;
  level: string;
  class_name: string | null;
  session_count: number;
  message_count: number;
  total_tokens: number;
}

// 모델별 비용 ($/1K tokens 기준, 2025년 기준 추정치)
const MODEL_COSTS: Record<string, number> = {
  'claude-sonnet-4-5': 0.015,
  'gpt-5-mini': 0.0003,
  'gpt-5-nano': 0.0001,
  'gpt-4.1-mini': 0.0004,
  'gpt-4.1-nano': 0.00015,
};

// 모델별 사용량 통계
export async function getModelUsageStats(
  startDate?: Date,
  endDate?: Date
): Promise<ModelUsageStats[]> {
  let dateFilter = '';
  const params: (string | Date)[] = [];

  if (startDate && endDate) {
    dateFilter = 'WHERE m.created_at BETWEEN $1 AND $2';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = 'WHERE m.created_at >= $1';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = 'WHERE m.created_at <= $1';
    params.push(endDate);
  }

  const result = await query<{
    model_used: string;
    message_count: string;
    total_tokens: string;
  }>(
    `SELECT
      COALESCE(m.model_used, 'unknown') as model_used,
      COUNT(*) as message_count,
      COALESCE(SUM(m.tokens_used), 0) as total_tokens
    FROM messages m
    ${dateFilter}
    GROUP BY m.model_used
    ORDER BY total_tokens DESC`,
    params
  );

  return result.rows.map((row) => {
    const totalTokens = parseInt(row.total_tokens) || 0;
    const costPerToken = MODEL_COSTS[row.model_used] || 0.001;
    return {
      model_used: row.model_used,
      message_count: parseInt(row.message_count),
      total_tokens: totalTokens,
      estimated_cost: (totalTokens / 1000) * costPerToken,
    };
  });
}

// 수준별 사용량 통계
export async function getLevelUsageStats(
  startDate?: Date,
  endDate?: Date
): Promise<LevelUsageStats[]> {
  let dateFilter = '';
  const params: (string | Date)[] = [];

  if (startDate && endDate) {
    dateFilter = 'AND m.created_at BETWEEN $1 AND $2';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = 'AND m.created_at >= $1';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = 'AND m.created_at <= $1';
    params.push(endDate);
  }

  const result = await query<{
    level: string;
    user_count: string;
    session_count: string;
    message_count: string;
    total_tokens: string;
  }>(
    `SELECT
      u.level,
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT cs.id) as session_count,
      COUNT(m.id) as message_count,
      COALESCE(SUM(m.tokens_used), 0) as total_tokens
    FROM users u
    LEFT JOIN chat_sessions cs ON cs.user_id = u.id
    LEFT JOIN messages m ON m.session_id = cs.id ${dateFilter}
    WHERE u.role = 'student'
    GROUP BY u.level
    ORDER BY u.level`,
    params
  );

  return result.rows.map((row) => ({
    level: row.level,
    user_count: parseInt(row.user_count),
    session_count: parseInt(row.session_count),
    message_count: parseInt(row.message_count),
    total_tokens: parseInt(row.total_tokens) || 0,
  }));
}

// 일별 사용량 통계 (최근 N일)
export async function getDailyUsageStats(days: number = 30): Promise<DailyUsageStats[]> {
  const result = await query<{
    date: Date;
    message_count: string;
    total_tokens: string;
    unique_users: string;
  }>(
    `SELECT
      DATE(m.created_at) as date,
      COUNT(*) as message_count,
      COALESCE(SUM(m.tokens_used), 0) as total_tokens,
      COUNT(DISTINCT cs.user_id) as unique_users
    FROM messages m
    JOIN chat_sessions cs ON cs.id = m.session_id
    WHERE m.created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(m.created_at)
    ORDER BY date DESC`,
    []
  );

  return result.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    message_count: parseInt(row.message_count),
    total_tokens: parseInt(row.total_tokens) || 0,
    unique_users: parseInt(row.unique_users),
  }));
}

// 사용자별 사용량 통계
export async function getUserUsageStats(
  classId?: string,
  limit: number = 50
): Promise<UserUsageStats[]> {
  let classFilter = '';
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (classId) {
    classFilter = 'WHERE u.class_id = $1';
    params.push(classId);
    paramIndex = 2;
  }

  params.push(limit);

  const result = await query<{
    user_id: string;
    user_name: string;
    user_email: string;
    level: string;
    class_name: string | null;
    session_count: string;
    message_count: string;
    total_tokens: string;
  }>(
    `SELECT
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      u.level,
      c.name as class_name,
      COUNT(DISTINCT cs.id) as session_count,
      COUNT(m.id) as message_count,
      COALESCE(SUM(m.tokens_used), 0) as total_tokens
    FROM users u
    LEFT JOIN classes c ON c.id = u.class_id
    LEFT JOIN chat_sessions cs ON cs.user_id = u.id
    LEFT JOIN messages m ON m.session_id = cs.id
    ${classFilter}
    GROUP BY u.id, u.name, u.email, u.level, c.name
    ORDER BY total_tokens DESC
    LIMIT $${paramIndex}`,
    params
  );

  return result.rows.map((row) => ({
    user_id: row.user_id,
    user_name: row.user_name,
    user_email: row.user_email,
    level: row.level,
    class_name: row.class_name,
    session_count: parseInt(row.session_count),
    message_count: parseInt(row.message_count),
    total_tokens: parseInt(row.total_tokens) || 0,
  }));
}

// 전체 요약 통계
export async function getSummaryStats(): Promise<{
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  estimatedCost: number;
  todayMessages: number;
  todayTokens: number;
}> {
  const [totalResult, todayResult, tokenResult] = await Promise.all([
    query<{ users: string; sessions: string; messages: string }>(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') as users,
        (SELECT COUNT(*) FROM chat_sessions) as sessions,
        (SELECT COUNT(*) FROM messages) as messages`
    ),
    query<{ messages: string; tokens: string }>(
      `SELECT
        COUNT(*) as messages,
        COALESCE(SUM(tokens_used), 0) as tokens
      FROM messages
      WHERE DATE(created_at) = CURRENT_DATE`
    ),
    query<{ model_used: string; tokens: string }>(
      `SELECT
        COALESCE(model_used, 'unknown') as model_used,
        COALESCE(SUM(tokens_used), 0) as tokens
      FROM messages
      GROUP BY model_used`
    ),
  ]);

  // 비용 계산
  let totalTokens = 0;
  let estimatedCost = 0;
  tokenResult.rows.forEach((row) => {
    const tokens = parseInt(row.tokens) || 0;
    totalTokens += tokens;
    const costPerToken = MODEL_COSTS[row.model_used] || 0.001;
    estimatedCost += (tokens / 1000) * costPerToken;
  });

  return {
    totalUsers: parseInt(totalResult.rows[0]?.users) || 0,
    totalSessions: parseInt(totalResult.rows[0]?.sessions) || 0,
    totalMessages: parseInt(totalResult.rows[0]?.messages) || 0,
    totalTokens,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    todayMessages: parseInt(todayResult.rows[0]?.messages) || 0,
    todayTokens: parseInt(todayResult.rows[0]?.tokens) || 0,
  };
}
