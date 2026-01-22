import { query, transaction } from '../index.js';

export interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MessageRow {
  id: string;
  session_id: string;
  role: string;
  content: string;
  model_used: string | null;
  tokens_used: number | null;
  created_at: Date;
}

// Session operations
export async function findSessionById(id: string): Promise<ChatSessionRow | null> {
  const result = await query<ChatSessionRow>(
    'SELECT * FROM chat_sessions WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findSessionsByUserId(userId: string): Promise<ChatSessionRow[]> {
  const result = await query<ChatSessionRow>(
    'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return result.rows;
}

export async function createSession(data: {
  userId: string;
  title?: string;
}): Promise<ChatSessionRow> {
  const result = await query<ChatSessionRow>(
    `INSERT INTO chat_sessions (user_id, title)
     VALUES ($1, $2)
     RETURNING *`,
    [data.userId, data.title || null]
  );
  return result.rows[0];
}

export async function updateSessionTitle(
  id: string,
  title: string
): Promise<ChatSessionRow | null> {
  const result = await query<ChatSessionRow>(
    `UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [title, id]
  );
  return result.rows[0] || null;
}

export async function deleteSession(id: string): Promise<boolean> {
  const result = await query('DELETE FROM chat_sessions WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

// Message operations
export async function findMessagesBySessionId(sessionId: string): Promise<MessageRow[]> {
  const result = await query<MessageRow>(
    'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
    [sessionId]
  );
  return result.rows;
}

export async function createMessage(data: {
  sessionId: string;
  role: string;
  content: string;
  modelUsed?: string;
  tokensUsed?: number;
}): Promise<MessageRow> {
  const result = await query<MessageRow>(
    `INSERT INTO messages (session_id, role, content, model_used, tokens_used)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.sessionId, data.role, data.content, data.modelUsed || null, data.tokensUsed || null]
  );

  // Update session's updated_at
  await query(
    'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
    [data.sessionId]
  );

  return result.rows[0];
}

export async function saveConversation(
  sessionId: string,
  messages: Array<{
    role: string;
    content: string;
    modelUsed?: string;
    tokensUsed?: number;
  }>
): Promise<MessageRow[]> {
  return transaction(async (client) => {
    const savedMessages: MessageRow[] = [];

    for (const msg of messages) {
      const result = await client.query<MessageRow>(
        `INSERT INTO messages (session_id, role, content, model_used, tokens_used)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [sessionId, msg.role, msg.content, msg.modelUsed || null, msg.tokensUsed || null]
      );
      savedMessages.push(result.rows[0]);
    }

    await client.query(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
      [sessionId]
    );

    return savedMessages;
  });
}

// Get session with messages
export async function getSessionWithMessages(sessionId: string): Promise<{
  session: ChatSessionRow;
  messages: MessageRow[];
} | null> {
  const session = await findSessionById(sessionId);
  if (!session) return null;

  const messages = await findMessagesBySessionId(sessionId);
  return { session, messages };
}
