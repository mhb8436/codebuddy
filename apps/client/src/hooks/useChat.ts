import { useState, useCallback } from 'react';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ModelInfo {
  name: string;
  provider: string;
  upgraded?: boolean;
  upgradeReason?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelInfo | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/chat/sessions', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Load a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(sessionId);
        setMessages(
          data.messages.map((m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new session (clear current chat)
  const newSession = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          newSession();
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }, [currentSessionId, newSession]);

  // Send message
  const sendMessage = useCallback(async (content: string, level: string, curriculumContext?: string, codeContext?: string) => {
    setIsLoading(true);

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: content,
          level,
          curriculumContext,
          codeContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);

              // Handle new session ID
              if (parsed.sessionId && !currentSessionId) {
                setCurrentSessionId(parsed.sessionId);
                // Refresh sessions list
                fetchSessions();
              }

              // Handle model info
              if (parsed.modelInfo) {
                setCurrentModel(parsed.modelInfo);
              }

              // Handle content
              if (parsed.content) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + parsed.content,
                  };
                  return updated;
                });
              }

              // Handle error
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          ...updated[lastIdx],
          content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, fetchSessions]);

  return {
    messages,
    sessions,
    currentSessionId,
    currentModel,
    isLoading,
    isLoadingSessions,
    sendMessage,
    fetchSessions,
    loadSession,
    newSession,
    deleteSession,
  };
}
