import { useEffect } from 'react';

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  isLoading: boolean;
  onFetch: () => void;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  onDelete: (sessionId: string) => void;
}

export default function SessionList({
  sessions,
  currentSessionId,
  isLoading,
  onFetch,
  onSelect,
  onNew,
  onDelete,
}: SessionListProps) {
  useEffect(() => {
    onFetch();
  }, [onFetch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={onNew}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + 새 대화
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            로딩 중...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            대화 기록이 없습니다
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li
                key={session.id}
                className={`relative group ${
                  currentSessionId === session.id ? 'bg-blue-50' : 'hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => onSelect(session.id)}
                  className="w-full px-4 py-3 text-left"
                >
                  <div className="text-sm font-medium text-gray-900 truncate pr-8">
                    {session.title || '새 대화'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(session.updated_at)}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 대화를 삭제하시겠습니까?')) {
                      onDelete(session.id);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
