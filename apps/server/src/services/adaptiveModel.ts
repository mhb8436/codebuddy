import { LearnerLevel, ModelConfig, getModelConfig } from '../config/modelByLevel.js';

// 좌절 감지 키워드
const FRUSTRATION_KEYWORDS = [
  '이해가 안',
  '이해안',
  '모르겠',
  '어려워',
  '헷갈려',
  '헷갈리',
  '다시 설명',
  '무슨 말',
  '뭔 말',
  '못 알아',
  '못알아',
  '왜 안 돼',
  '왜 안돼',
  '안 되는',
  '안되는',
  '에러가',
  '오류가',
  '잘 모르',
  '잘모르',
  '처음부터',
  '쉽게 설명',
  '쉽게설명',
];

// 반복 질문 감지용 키워드 추출
const CONCEPT_KEYWORDS = [
  '변수', '함수', '조건문', 'if', 'for', 'while', '반복문', '배열', 'array',
  '객체', 'object', '클래스', 'class', '메서드', 'method', '파라미터', 'parameter',
  '리턴', 'return', '타입', 'type', '문자열', 'string', '숫자', 'number',
  '불리언', 'boolean', '루프', 'loop', '인덱스', 'index', '콜백', 'callback',
  '프로미스', 'promise', 'async', 'await', '이벤트', 'event',
];

interface SessionContext {
  level: LearnerLevel;
  frustrationCount: number;
  recentConcepts: string[];
  repeatCount: number;
  upgraded: boolean;
  lastUpgradeReason?: string;
}

// 세션별 컨텍스트 저장 (인메모리)
const sessionContexts = new Map<string, SessionContext>();

// 세션 컨텍스트 초기화 또는 가져오기
export function getSessionContext(sessionId: string, level: LearnerLevel): SessionContext {
  if (!sessionContexts.has(sessionId)) {
    sessionContexts.set(sessionId, {
      level,
      frustrationCount: 0,
      recentConcepts: [],
      repeatCount: 0,
      upgraded: false,
    });
  }
  return sessionContexts.get(sessionId)!;
}

// 세션 컨텍스트 업데이트
export function updateSessionContext(sessionId: string, context: Partial<SessionContext>): void {
  const current = sessionContexts.get(sessionId);
  if (current) {
    sessionContexts.set(sessionId, { ...current, ...context });
  }
}

// 세션 컨텍스트 삭제
export function clearSessionContext(sessionId: string): void {
  sessionContexts.delete(sessionId);
}

// 좌절 감지
export function detectFrustration(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return FRUSTRATION_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

// 메시지에서 개념 키워드 추출
export function extractConcepts(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  return CONCEPT_KEYWORDS.filter(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

// 반복 질문 감지
export function detectRepetition(sessionId: string, newConcepts: string[]): boolean {
  const context = sessionContexts.get(sessionId);
  if (!context || newConcepts.length === 0) return false;

  // 최근 개념과 겹치는지 확인
  const overlap = newConcepts.filter(c => context.recentConcepts.includes(c));
  return overlap.length > 0;
}

// 적응형 모델 설정 가져오기
export function getAdaptiveModelConfig(
  sessionId: string,
  level: LearnerLevel,
  message: string
): { config: ModelConfig; upgraded: boolean; reason?: string } {
  const context = getSessionContext(sessionId, level);

  // 이미 최상위 모델(초초보용)을 사용 중이면 업그레이드 불필요
  if (level === 'beginner_zero') {
    return { config: getModelConfig(level), upgraded: false };
  }

  // 이미 이 세션에서 업그레이드된 경우
  if (context.upgraded) {
    return {
      config: getModelConfig('beginner_zero'),
      upgraded: true,
      reason: context.lastUpgradeReason
    };
  }

  let shouldUpgrade = false;
  let reason = '';

  // 좌절 감지
  if (detectFrustration(message)) {
    context.frustrationCount++;

    if (context.frustrationCount >= 2) {
      shouldUpgrade = true;
      reason = '학습 어려움 감지';
    }
  }

  // 개념 반복 질문 감지
  const concepts = extractConcepts(message);
  if (detectRepetition(sessionId, concepts)) {
    context.repeatCount++;

    if (context.repeatCount >= 2) {
      shouldUpgrade = true;
      reason = '동일 개념 반복 질문';
    }
  }

  // 최근 개념 업데이트 (최대 5개 유지)
  context.recentConcepts = [...concepts, ...context.recentConcepts].slice(0, 5);

  // 업그레이드 결정
  if (shouldUpgrade) {
    context.upgraded = true;
    context.lastUpgradeReason = reason;
    updateSessionContext(sessionId, context);

    console.log(`[AdaptiveModel] 세션 ${sessionId}: ${reason} -> Claude 업그레이드`);

    return {
      config: getModelConfig('beginner_zero'),
      upgraded: true,
      reason
    };
  }

  updateSessionContext(sessionId, context);
  return { config: getModelConfig(level), upgraded: false };
}

// 세션 통계 조회
export function getSessionStats(sessionId: string): SessionContext | null {
  return sessionContexts.get(sessionId) || null;
}

// 전체 업그레이드 통계
export function getUpgradeStats(): { total: number; upgraded: number; reasons: Record<string, number> } {
  let total = 0;
  let upgraded = 0;
  const reasons: Record<string, number> = {};

  sessionContexts.forEach((context) => {
    total++;
    if (context.upgraded) {
      upgraded++;
      if (context.lastUpgradeReason) {
        reasons[context.lastUpgradeReason] = (reasons[context.lastUpgradeReason] || 0) + 1;
      }
    }
  });

  return { total, upgraded, reasons };
}
