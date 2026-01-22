import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ModelInfo {
  name: string;
  provider: string;
  upgraded?: boolean;
  upgradeReason?: string;
}

// Props for controlled mode (used in MainPage)
interface ControlledProps {
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
  messages: Message[];
  isLoading: boolean;
  currentModel: ModelInfo | null;
  onSendMessage: (content: string, level: string) => void;
  curriculumContext?: never;
  standalone?: false;
}

// Props for standalone mode (used in LearningPage)
interface StandaloneProps {
  level: 'beginner_zero' | 'beginner' | 'beginner_plus';
  curriculumContext?: string;
  codeContext?: string;  // 코드 에디터의 현재 코드
  standalone?: true;
  messages?: never;
  isLoading?: never;
  currentModel?: never;
  onSendMessage?: never;
}

type ChatPanelProps = ControlledProps | StandaloneProps;

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'claude-sonnet-4-5': 'Claude Sonnet 4.5',
  'gpt-5-mini': 'GPT-5 Mini',
  'gpt-5-nano': 'GPT-5 Nano',
  'gpt-4.1-mini': 'GPT-4.1 Mini',
  'gpt-4.1-nano': 'GPT-4.1 Nano',
};

function isStandaloneProps(props: ChatPanelProps): props is StandaloneProps {
  return props.standalone === true || props.curriculumContext !== undefined;
}

export default function ChatPanel(props: ChatPanelProps) {
  // Standalone mode: use internal state
  const chat = useChat();

  const isStandalone = isStandaloneProps(props);

  const messages = isStandalone ? chat.messages : props.messages;
  const isLoading = isStandalone ? chat.isLoading : props.isLoading;
  const currentModel = isStandalone ? chat.currentModel : props.currentModel;

  const handleSendMessage = (content: string, level: string) => {
    if (isStandalone) {
      chat.sendMessage(content, level, props.curriculumContext, props.codeContext);
    } else {
      props.onSendMessage(content, level);
    }
  };

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSendMessage(input, props.level);
    setInput('');
  };

  // Context indicators
  const hasCurriculumContext = isStandalone && props.curriculumContext;
  const hasCodeContext = isStandalone && props.codeContext && props.codeContext.trim().length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Context badges */}
      {(hasCurriculumContext || hasCodeContext) && (
        <div className="px-4 py-2 border-b bg-blue-50 border-blue-200 text-blue-700 text-xs flex items-center gap-3">
          {hasCurriculumContext && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>커리큘럼</span>
            </div>
          )}
          {hasCodeContext && (
            <div className="flex items-center gap-1 text-green-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>코드 에디터 연동</span>
            </div>
          )}
        </div>
      )}

      {/* Model info badge */}
      {currentModel && (
        <div className={`px-4 py-2 border-b flex items-center gap-2 text-xs ${
          currentModel.upgraded
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>모델: {MODEL_DISPLAY_NAMES[currentModel.name] || currentModel.name}</span>
          {currentModel.upgraded && (
            <>
              <span className="text-green-400">|</span>
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                업그레이드됨 ({currentModel.upgradeReason})
              </span>
            </>
          )}
          {!currentModel.upgraded && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">
                {currentModel.provider === 'azure-ai-foundry' ? 'Azure AI' : 'Azure OpenAI'}
              </span>
            </>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            {hasCodeContext ? (
              <>
                <p>오른쪽 코드 에디터의 코드에 대해 질문해보세요!</p>
                <p className="text-sm mt-2">예: "이 코드 설명해줘", "이 코드에 문제가 있어?", "더 좋게 개선해줘"</p>
              </>
            ) : hasCurriculumContext ? (
              <>
                <p>현재 학습 중인 토픽에 대해 질문해보세요!</p>
                <p className="text-sm mt-2">AI 튜터가 커리큘럼에 맞춰 설명해드립니다.</p>
              </>
            ) : (
              <>
                <p>프로그래밍에 대해 무엇이든 질문해보세요!</p>
                <p className="text-sm mt-2">예: "for문이 뭐야?", "변수는 어떻게 만들어?"</p>
              </>
            )}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">{message.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="animate-pulse">응답 생성 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
