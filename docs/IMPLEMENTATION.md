# CodeBuddy 구현 기록

이 문서는 프로젝트의 구현 진행 상황과 주요 내용을 기록합니다.

---

## 1. 프로젝트 초기 구조 (2026-01-03)

### 구조

pnpm Monorepo + Turborepo 구조로 프로젝트 초기화

```
codebuddy/
├── apps/
│   ├── client/          # React + Vite + TypeScript + TailwindCSS
│   └── server/          # Express + TypeScript
├── packages/
│   └── shared/          # 공통 타입, 유틸리티
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── docker-compose.yml
└── .gitignore
```

### 주요 파일

- `apps/client`: React 18, Vite, TailwindCSS, Monaco Editor
- `apps/server`: Express, OpenAI SDK, Passport.js, PostgreSQL
- `packages/shared`: 공통 타입 정의 (User, Chat, Code, Class)

---

## 2. 데이터베이스 연결 및 마이그레이션 (2026-01-03)

### 구조

```
apps/server/
├── migrations/
│   └── 1704240000000_initial-schema.ts
├── src/db/
│   ├── index.ts                      # DB 연결, query, transaction
│   └── repositories/
│       ├── index.ts
│       ├── classRepository.ts
│       ├── userRepository.ts
│       └── chatRepository.ts
└── .node-pg-migraterc.json
```

### 테이블 스키마

| 테이블 | 설명 |
|--------|------|
| `classes` | 반 정보 (id, name, invite_code, max_students, expires_at) |
| `users` | 사용자 (id, email, password_hash, name, role, class_id, level) |
| `chat_sessions` | 채팅 세션 (id, user_id, title) |
| `messages` | 메시지 (id, session_id, role, content, model_used, tokens_used) |

### 마이그레이션 명령어

```bash
cd apps/server
pnpm migrate:up      # 마이그레이션 적용
pnpm migrate:down    # 롤백
pnpm migrate:create <name>  # 새 마이그레이션 생성
```

---

## 3. JWT 인증 시스템 (2026-01-03)

### 구조

```
apps/server/src/
├── utils/
│   └── jwt.ts                # signToken, verifyToken
├── middleware/
│   └── auth.ts               # Passport JWT, authenticate, requireRole
└── routes/
    ├── auth.ts               # register, login, logout, me, level
    └── admin.ts              # 관리자 API (인증 적용)

apps/client/src/
├── contexts/
│   └── AuthContext.tsx       # 인증 상태 관리
├── components/
│   └── ProtectedRoute.tsx    # 보호된 라우트
└── pages/
    ├── LoginPage.tsx
    └── RegisterPage.tsx
```

### API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/auth/register` | 회원가입 (초대코드 필수) | - |
| POST | `/api/auth/login` | 로그인 | - |
| POST | `/api/auth/logout` | 로그아웃 | Required |
| GET | `/api/auth/me` | 현재 사용자 정보 | Required |
| PUT | `/api/auth/level` | 학습 수준 변경 | Required |

### 역할 (Role)

| 역할 | 권한 |
|------|------|
| `student` | 채팅, 코드 실행 |
| `instructor` | student + 반 조회 |
| `admin` | 모든 권한 (반 CRUD, 사용자 관리) |

### 초기 계정 (시드 마이그레이션)

마이그레이션 실행 후 사용 가능:

```
관리자 계정
- Email: admin@codebuddy.local
- Password: admin1234
- Role: admin

테스트 반
- 이름: 웹개발 기초반
- 초대 코드: TEST01
- 정원: 30명
```

> **주의**: 프로덕션 배포 시 관리자 비밀번호를 반드시 변경하세요.

---

## 4. 채팅 히스토리 저장 (2026-01-03)

### 구현 내용

채팅 세션 및 메시지를 DB에 저장하고, 이전 대화를 이어서 할 수 있는 기능 구현

### 서버 (apps/server)

```
apps/server/src/
└── routes/
    └── chat.ts      # 세션 CRUD + 스트리밍 채팅
```

### API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/chat/sessions` | 세션 목록 조회 | Required |
| POST | `/api/chat/sessions` | 새 세션 생성 | Required |
| GET | `/api/chat/sessions/:id` | 세션 상세 (메시지 포함) | Required |
| PUT | `/api/chat/sessions/:id` | 세션 제목 수정 | Required |
| DELETE | `/api/chat/sessions/:id` | 세션 삭제 | Required |
| POST | `/api/chat` | 메시지 전송 (스트리밍, 세션 자동생성) | Required |

### 클라이언트 (apps/client)

```
apps/client/src/
├── hooks/
│   └── useChat.ts           # 세션 관리 (fetch, load, new, delete)
├── components/
│   ├── SessionList.tsx      # 대화 히스토리 사이드바
│   └── ChatPanel.tsx        # 채팅 인터페이스
└── pages/
    └── MainPage.tsx         # 세션 리스트 + 채팅 통합
```

### 주요 기능

1. **세션 자동 생성**: 첫 메시지 전송 시 세션 자동 생성 (제목 = 첫 메시지 앞 30자)
2. **이전 대화 로드**: 사이드바에서 세션 선택 시 해당 대화 내역 로드
3. **세션 삭제**: 확인 다이얼로그 후 세션 및 메시지 삭제
4. **새 대화 시작**: "새 대화" 버튼으로 새로운 세션 시작
5. **사이드바 토글**: 좁은 화면에서 사이드바 숨기기/보이기

### 데이터 흐름

```
1. 사용자가 메시지 입력
2. POST /api/chat 호출 (sessionId 없으면 자동 생성)
3. 서버: 사용자 메시지 DB 저장
4. 서버: LLM API 호출 (SSE 스트리밍)
5. 클라이언트: 실시간 응답 표시
6. 서버: 어시스턴트 메시지 DB 저장
7. 서버: 세션 목록 새로고침 (신규 세션인 경우)
```

---

## 5. 코드 실행 기능 (2026-01-03)

### 구현 내용

Piston API를 사용하여 JavaScript, TypeScript, Python 코드를 웹에서 실행할 수 있는 기능 구현

### 서버 (apps/server)

```
apps/server/src/
└── routes/
    └── code.ts      # 코드 실행 API
```

### API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/code/runtimes` | 사용 가능한 런타임 목록 | - |
| GET | `/api/code/health` | Piston 서버 상태 확인 | - |
| POST | `/api/code/execute` | 코드 실행 | - |

### 클라이언트 (apps/client)

```
apps/client/src/
└── components/
    └── CodeEditor.tsx   # Monaco Editor + 실행 기능
```

### 주요 기능

1. **언어 지원**: JavaScript, TypeScript, Python
2. **Monaco Editor**: VS Code와 동일한 에디터 (구문 강조, 자동완성)
3. **실시간 실행**: 코드 작성 후 바로 실행 결과 확인
4. **실행 시간 표시**: 코드 실행에 걸린 시간 표시
5. **버전 정보**: 사용된 런타임 버전 표시
6. **에러 핸들링**: 컴파일/런타임 에러 구분 표시
7. **Piston 상태 표시**: 연결 상태 실시간 확인
8. **단축키**: Ctrl+Enter (Cmd+Enter)로 실행

### 보안 제한

| 항목 | 제한 |
|------|------|
| 실행 시간 | 5초 |
| 메모리 | 128MB |
| 코드 크기 | 10KB |
| 동시 실행 | 10개 (큐 사용) |

### Piston 설정

```bash
# Docker로 Piston 서비스 시작
docker-compose up -d piston

# 언어 런타임 설치 (선택사항 - 자동 설치됨)
./scripts/setup-piston.sh
```

### 데이터 흐름

```
1. 사용자가 코드 입력 후 실행 버튼 클릭
2. POST /api/code/execute 호출
3. 서버: 동시 실행 큐에 추가 (최대 10개)
4. 서버: Piston API에 코드 전송
5. Piston: 샌드박스 환경에서 코드 실행
6. 서버: 실행 결과 반환 (stdout, stderr, exitCode, 실행시간)
7. 클라이언트: 결과 표시 (성공/오류 구분)
```

---

## 6. 관리자 페이지 (2026-01-03)

### 구현 내용

반 관리 및 학생 관리 기능을 제공하는 관리자 페이지 구현

### 클라이언트 (apps/client)

```
apps/client/src/
├── hooks/
│   └── useAdmin.ts         # 관리자 API 훅
├── pages/
│   └── AdminPage.tsx       # 관리자 메인 페이지
└── components/
    └── Header.tsx          # 관리 링크 추가
```

### 접근 권한

| 역할 | 접근 가능 | 기능 |
|------|----------|------|
| `admin` | /admin | 반 CRUD, 학생 관리, 역할 변경, 초대 코드 재생성 |
| `instructor` | /admin | 반 조회, 학생 조회 (수정 불가) |
| `student` | 접근 불가 | - |

### 반 관리 기능

1. **반 목록 조회**: 카드 형태로 모든 반 표시
2. **반 생성** (admin): 이름, 정원, 초대 코드 유효기간 설정
3. **반 수정** (admin): 이름, 정원 변경
4. **반 삭제** (admin): 확인 후 삭제 (연관 데이터 포함)
5. **초대 코드 복사**: 클립보드에 복사
6. **초대 코드 재생성** (admin): 기존 코드 무효화 후 새 코드 생성

### 학생 관리 기능

1. **학생 목록**: 반별 학생 목록 테이블
2. **정보 표시**: 이름, 이메일, 수준, 역할, 마지막 로그인
3. **역할 변경** (admin): 드롭다운으로 역할 변경

### UI 구성

```
+---------------------------------------------------+
| CodeBuddy 관리자  [관리자]     메인으로  홍길동  로그아웃 |
+---------------------------------------------------+
| [반 관리]  [학생 관리]                               |
+---------------------------------------------------+
|                                                   |
|   반 목록                      [+ 새 반 만들기]      |
|                                                   |
|   +-------------+  +-------------+                |
|   | 웹개발 기초반  |  | 데이터분석반 |                |
|   | 코드: TEST01 |  | 코드: DATA01 |                |
|   | 정원: 30명   |  | 정원: 25명   |                |
|   | [학생 보기]   |  | [학생 보기]   |                |
|   +-------------+  +-------------+                |
|                                                   |
+---------------------------------------------------+
```

### 라우팅

| 경로 | 컴포넌트 | 필요 역할 |
|------|----------|----------|
| `/admin` | AdminPage | admin, instructor |

---

## 7. 수준별 AI 모델 분기 (2026-01-03)

### 구현 내용

학습자 수준에 따라 다른 AI 모델을 사용하여 품질과 비용을 최적화하는 기능 구현

### 서버 (apps/server)

```
apps/server/src/
├── config/
│   ├── modelByLevel.ts    # 수준별 모델 설정
│   └── systemPrompts.ts   # 수준별 시스템 프롬프트
├── services/
│   └── llmClient.ts       # LLM 클라이언트 생성
└── routes/
    └── chat.ts            # 모델 분기 적용
```

### 수준별 모델 매핑

| 수준 | 모델 | Provider | 설명 |
|------|------|----------|------|
| `beginner_zero` (초초보) | claude-sonnet-4-5 | Azure AI Foundry | 비유와 개념 설명 최우선, 품질 최고 |
| `beginner` (초보) | gpt-5-mini | Azure OpenAI | 기본 개념 설명, 가성비 균형 |
| `beginner_plus` (조금아는초보) | gpt-5-nano | Azure OpenAI | 코드 위주, 빠른 응답, 최저 비용 |

### 수준별 시스템 프롬프트

| 수준 | 교육 방식 |
|------|----------|
| 초초보 | 일상생활 비유 활용, 코드보다 개념 우선, 한 번에 하나의 개념만 |
| 초보 | 간단한 코드 예시 제공, 동작 원리 설명, 자주 하는 실수 안내 |
| 조금아는초보 | 실무 패턴과 베스트 프랙티스 안내, 심화 개념 소개 |

### 주요 기능

1. **자동 모델 선택**: 사용자 수준에 따라 최적의 모델 자동 선택
2. **API 키 미설정 폴백**: 모델이 설정되지 않은 경우 친절한 오류 메시지 표시
3. **모델 정보 표시**: 채팅 화면에 현재 사용 중인 모델 표시
4. **토큰 사용량 기록**: 메시지별 토큰 사용량 DB 저장

### 환경 변수 설정

```bash
# Azure OpenAI (GPT 계열) - 초보/조금아는초보용
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key

# Azure AI Foundry (Claude 등) - 초초보용
AZURE_AI_ENDPOINT=https://your-endpoint.inference.ai.azure.com/v1
AZURE_AI_API_KEY=your-api-key
```

### 비용 효과 (예상)

**기존 (전체 Claude 사용 시)**:
- 30명 x 50회/일 x 20일 = 월 ~$450

**수준별 분기 후** (초초보 30%, 초보 50%, 조금아는초보 20% 가정):
- 초초보 (Claude Sonnet): $135
- 초보 (GPT-5-mini): ~$8
- 조금아는초보 (GPT-5-nano): ~$3
- **총 월 ~$146** (약 68% 절감)

### 데이터 흐름

```
1. 사용자가 메시지 입력
2. 서버: 사용자 수준 확인 (beginner_zero/beginner/beginner_plus)
3. 서버: getModelConfig(level)로 해당 수준의 모델 설정 조회
4. 서버: createLLMClient(config)로 적절한 API 클라이언트 생성
5. 서버: 수준별 시스템 프롬프트 적용
6. 서버: LLM API 호출 (SSE 스트리밍)
7. 클라이언트: 모델 정보 및 응답 실시간 표시
8. 서버: 메시지 저장 (model_used, tokens_used 포함)
```

---

## 8. 동적 모델 업그레이드 (2026-01-03)

### 구현 내용

학습자가 어려움을 겪을 때 자동으로 상위 모델(Claude)로 전환하는 기능 구현

### 서버 (apps/server)

```
apps/server/src/
└── services/
    └── adaptiveModel.ts   # 좌절 감지, 적응형 모델 선택
```

### 감지 조건

| 조건 | 임계값 | 업그레이드 모델 |
|------|--------|----------------|
| 좌절 키워드 감지 | 2회 이상 | claude-sonnet-4-5 |
| 동일 개념 반복 질문 | 2회 이상 | claude-sonnet-4-5 |

### 좌절 감지 키워드

```
이해가 안, 모르겠, 어려워, 헷갈려, 다시 설명, 무슨 말,
왜 안 돼, 에러가, 오류가, 잘 모르, 처음부터, 쉽게 설명
```

### 주요 기능

1. **좌절 감지**: 메시지에서 어려움을 나타내는 키워드 감지
2. **반복 질문 감지**: 동일 프로그래밍 개념 반복 질문 감지
3. **자동 업그레이드**: 조건 충족 시 Claude 모델로 자동 전환
4. **시스템 프롬프트 변경**: 업그레이드 시 초초보용 프롬프트 적용
5. **클라이언트 알림**: 업그레이드 시 사용자에게 시각적 알림

### 데이터 흐름

```
1. 사용자 메시지 수신
2. detectFrustration(): 좌절 키워드 감지
3. extractConcepts(): 개념 키워드 추출
4. detectRepetition(): 반복 질문 감지
5. 조건 충족 시 getAdaptiveModelConfig()에서 업그레이드 결정
6. 클라이언트에 modelInfo.upgraded = true 전송
7. 채팅 UI에 녹색 배지로 "업그레이드됨" 표시
```

---

## 9. 모델 사용량 통계 대시보드 (2026-01-03)

### 구현 내용

모델별, 수준별, 일별, 사용자별 사용량 통계를 조회하고 시각화하는 관리자 대시보드 구현

### 서버 (apps/server)

```
apps/server/src/
├── db/repositories/
│   └── statsRepository.ts    # 통계 집계 쿼리
└── routes/
    └── admin.ts              # 통계 API 엔드포인트
```

### API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/admin/stats/summary` | 전체 요약 통계 | admin, instructor |
| GET | `/api/admin/stats/models` | 모델별 사용량 | admin, instructor |
| GET | `/api/admin/stats/levels` | 수준별 사용량 | admin, instructor |
| GET | `/api/admin/stats/daily` | 일별 사용량 | admin, instructor |
| GET | `/api/admin/stats/users` | 사용자별 사용량 | admin, instructor |

### 통계 항목

**요약 통계**
- 총 학생 수, 총 세션 수, 총 메시지 수
- 총 토큰 사용량, 예상 비용
- 오늘의 메시지/토큰 사용량
- 모델 업그레이드 현황

**모델별 통계**
- 모델명, 메시지 수, 토큰 사용량, 예상 비용

**수준별 통계**
- 수준, 학생 수, 세션 수, 메시지 수, 토큰 사용량

**일별 통계**
- 날짜, 활성 사용자 수, 메시지 수, 토큰 사용량

**사용자별 통계**
- 이름, 반, 수준, 세션 수, 메시지 수, 토큰 사용량

### 클라이언트 (apps/client)

```
apps/client/src/
├── hooks/
│   └── useAdmin.ts           # 통계 fetch 함수 추가
└── pages/
    └── AdminPage.tsx         # 통계 탭 추가
```

### UI 구성

```
+---------------------------------------------------+
| [반 관리]  [학생 관리]  [사용량 통계]                  |
+---------------------------------------------------+
|                                                   |
|  +--------+ +--------+ +--------+ +--------+      |
|  |총 학생 | |총 세션 | |총 메시지| |예상 비용|      |
|  |   25   | |   120  | | 3,450  | | $15.20 |      |
|  +--------+ +--------+ +--------+ +--------+      |
|                                                   |
|  모델별 사용량          수준별 사용량               |
|  +----------------+    +------------------+       |
|  |Claude | $10.50|    |초초보 | 1,200 토큰|       |
|  |GPT-5  |  $3.20|    |초보   |   850 토큰|       |
|  |GPT-nano| $1.50|    |조금아는| 1,400 토큰|       |
|  +----------------+    +------------------+       |
|                                                   |
+---------------------------------------------------+
```

### 비용 계산 로직

```typescript
const MODEL_COSTS = {
  'claude-sonnet-4-5': 0.015,  // $/1K tokens
  'gpt-5-mini': 0.0003,
  'gpt-5-nano': 0.0001,
};

estimatedCost = (totalTokens / 1000) * MODEL_COSTS[modelName];
```

---

## 10. 관리자 모델 설정 관리 (2026-01-03)

### 구현 내용

관리자가 수준별 AI 모델을 동적으로 변경할 수 있는 기능 구현

### 데이터베이스

```
apps/server/migrations/
└── 1704240000002_model-config.ts   # model_config 테이블 마이그레이션
```

**테이블 스키마**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | Primary Key |
| `level` | VARCHAR(20) | 학습 수준 (beginner_zero, beginner, beginner_plus) |
| `provider` | VARCHAR(50) | 모델 제공자 (azure-openai, azure-ai-foundry) |
| `model_name` | VARCHAR(100) | 모델 이름 |
| `is_active` | BOOLEAN | 활성화 여부 |
| `updated_at` | TIMESTAMP | 마지막 수정 시간 |
| `updated_by` | UUID | 수정한 관리자 ID |

### 서버 (apps/server)

```
apps/server/src/
├── config/
│   └── modelByLevel.ts          # DB 설정 캐싱 지원 추가
├── db/repositories/
│   └── modelConfigRepository.ts # 모델 설정 CRUD
└── routes/
    └── admin.ts                 # 모델 설정 API 추가
```

### API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/admin/models` | 사용 가능한 모델 목록 | admin, instructor |
| GET | `/api/admin/models/config` | 현재 모델 설정 | admin, instructor |
| PUT | `/api/admin/models/config/:level` | 수준별 모델 변경 | admin only |

### 클라이언트 (apps/client)

```
apps/client/src/
├── hooks/
│   └── useAdmin.ts              # 모델 설정 함수 추가
└── pages/
    └── AdminPage.tsx            # 모델 설정 탭 추가
```

### 사용 가능한 모델

| 모델명 | 제공자 | 설명 | 비용 |
|--------|--------|------|------|
| Claude Sonnet 4.5 | Azure AI Foundry | 설명력 최우선, 비유와 개념 설명에 최적화 | 고비용 |
| Claude Haiku 4.5 | Azure AI Foundry | 빠른 응답, 설명력 양호 | 중비용 |
| GPT-5 Mini | Azure OpenAI | 품질과 비용 균형, 가성비 우수 | 중비용 |
| GPT-5 Nano | Azure OpenAI | 초경량, 빠른 응답, 최저 비용 | 저비용 |
| GPT-4.1 Mini | Azure OpenAI | 균형잡힌 성능, 저렴 | 저비용 |
| O3 Mini | Azure OpenAI | 추론 특화, 코드 디버깅에 강점 | 중비용 |

### 주요 기능

1. **수준별 모델 설정**: 초초보/초보/조금아는초보 각각에 다른 모델 지정
2. **즉시 적용**: 설정 변경 시 서버 캐시 즉시 갱신, 재시작 불필요
3. **변경 이력**: 마지막 수정 시간 및 수정자 기록
4. **모델 정보 표시**: 모델별 설명, 제공자, 비용 등급 표시
5. **권장 설정 가이드**: UI에서 권장 설정 안내

### UI 구성

```
+---------------------------------------------------+
| [반 관리]  [학생 관리]  [사용량 통계]  [모델 설정]      |
+---------------------------------------------------+
|                                                   |
|   수준별 모델 설정                                   |
|                                                   |
|   +---------------------------------------------+ |
|   | 초초보  프로그래밍을 처음 접하는...    [Claude v] | |
|   | 마지막 변경: 2026-01-03                       | |
|   +---------------------------------------------+ |
|   | 초보    기본 개념은 알지만...        [GPT-5 v] | |
|   +---------------------------------------------+ |
|   | 조금아는초보  기본 문법을 알고...     [Nano v]  | |
|   +---------------------------------------------+ |
|                                                   |
|   사용 가능한 모델                                  |
|   +---------------------------------------------+ |
|   | Claude Sonnet 4.5 | Azure AI | 설명력... |고비용| |
|   | GPT-5 Mini        | Azure    | 가성비... |중비용| |
|   +---------------------------------------------+ |
|                                                   |
+---------------------------------------------------+
```

### 데이터 흐름

```
1. 관리자가 모델 설정 탭 진입
2. GET /api/admin/models - 사용 가능한 모델 목록 조회
3. GET /api/admin/models/config - 현재 설정 조회
4. 관리자가 드롭다운에서 모델 선택
5. PUT /api/admin/models/config/:level - 설정 업데이트
6. 서버: DB 업데이트 + 캐시 갱신
7. 이후 채팅 요청 시 새 모델 사용
```

---

## 구현 완료

모든 주요 기능이 구현되었습니다:

- [x] 프로젝트 초기 구조 (pnpm Monorepo + Turborepo)
- [x] 데이터베이스 연결 및 마이그레이션
- [x] JWT 인증 시스템
- [x] 채팅 히스토리 저장
- [x] 코드 실행 기능 (Piston)
- [x] 관리자 페이지
- [x] 수준별 AI 모델 분기
- [x] 동적 모델 업그레이드
- [x] 모델 사용량 통계 대시보드
- [x] 관리자 모델 설정 관리

---

## 개발 환경 설정

### 필수 요구사항

- Node.js 20+
- pnpm 9+
- Docker (PostgreSQL, Piston)

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp apps/server/.env.example apps/server/.env
# .env 파일 수정 (DATABASE_URL, JWT_SECRET 등)

# Docker 서비스 시작
docker-compose up -d

# 마이그레이션 실행
cd apps/server && pnpm migrate:up && cd ../..

# 개발 서버 실행
pnpm dev
```

### 접속 URL

- 클라이언트: http://localhost:3000
- 서버 API: http://localhost:4000
- Health Check: http://localhost:4000/api/health
