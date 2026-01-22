export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id?: string;
  role: MessageRole;
  content: string;
  modelUsed?: string;
  tokensUsed?: number;
  createdAt?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  messages: ChatMessage[];
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
}

export interface ChatStreamChunk {
  content?: string;
  error?: string;
}
