# CodeBuddy

오프라인 프로그래밍 교육을 위한 AI 보조 학습 시스템.

JavaScript, TypeScript, Python을 수준별로 학습할 수 있으며, AI 채팅과 코드 실행 환경을 통합 제공한다.


## 주요 기능

- **AI 튜터**: Azure AI Foundry 기반 대화형 학습 지원
- **수준별 교육**: 초초보 / 초보 / 조금아는초보 단계별 맞춤 학습
- **코드 실행**: 브라우저에서 JavaScript, TypeScript, Python 코드 즉시 실행
- **커리큘럼 관리**: 언어별 트랙, 스테이지, 토픽 구조의 체계적 학습 경로
- **문제 은행**: 난이도별 연습 문제 제공


## 기술 스택

| 구분 | 기술 |
|------|------|
| 모노레포 | pnpm + Turborepo |
| 프론트엔드 | React 18, TypeScript, Vite, TailwindCSS, Monaco Editor |
| 백엔드 | Express, TypeScript, PostgreSQL |
| AI | Azure AI Foundry (OpenAI SDK 호환) |
| 코드 실행 | Piston API |


## 프로젝트 구조

```
codebuddy/
├── apps/
│   ├── client/          # React 프론트엔드
│   └── server/          # Express 백엔드
├── packages/
│   └── shared/          # 공통 타입, 유틸리티
├── scripts/             # 설정 스크립트
└── docs/                # 문서
```


## 설치 및 실행

### 요구사항

- Node.js 20 이상
- pnpm 9.x
- PostgreSQL 14 이상
- Docker (Piston 코드 실행 엔진용)

### 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp apps/server/.env.example apps/server/.env
# .env 파일 수정

# 데이터베이스 마이그레이션
cd apps/server
npx node-pg-migrate up -m ./migrations --tsconfig ./tsconfig.json

# 개발 서버 실행
pnpm dev
```

### 운영 환경 초기 설정

```bash
# 전체 설정 (마이그레이션 + 시드 데이터)
./scripts/setup-production.sh

# 또는 시드만 별도 실행
cd apps/server
npx tsx ../../scripts/seed-production.ts
```

초기 계정:
- 관리자: admin@codebuddy.io / admin1234!
- 강사: instructor1@codebuddy.io / instructor123!


## 환경변수

`apps/server/.env` 파일에 설정:

```
# 데이터베이스
DATABASE_URL=postgresql://user:pass@localhost:5432/codebuddy

# Azure AI (수준별 모델 분기)
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_AI_ENDPOINT=https://your-endpoint.inference.ai.azure.com/v1
AZURE_AI_API_KEY=your-api-key

# JWT
JWT_SECRET=your-jwt-secret

# Piston (코드 실행)
PISTON_API_URL=http://localhost:2000
```


## 개발 명령어

```bash
pnpm dev        # 개발 서버 실행 (프론트/백 동시)
pnpm build      # 프로덕션 빌드
pnpm typecheck  # 타입 체크
pnpm lint       # 린트
pnpm clean      # 빌드 산출물 정리
```


## 수준별 학습 체계

| 수준 | 대상 | 교육 방식 |
|------|------|----------|
| 초초보 (beginner_zero) | 프로그래밍 처음 접하는 사람 | 비유와 일상 예시 활용, 코드보다 개념 우선 |
| 초보 (beginner) | 변수, 조건문 정도는 들어본 사람 | 간단한 코드 예시와 함께 설명 |
| 조금아는초보 (beginner_plus) | 기본 문법은 아는 사람 | 실무 패턴과 베스트 프랙티스 안내 |


## 커리큘럼 구조

```
Language (javascript, python, typescript)
  └─ Track (js-beginner, js-basics, js-intermediate, ...)
      └─ Stage (기초 문법, 함수, 배열, ...)
          └─ Topic (변수와 상수, 연산자, 조건문, ...)
              └─ Concept (세부 개념)
```

각 언어별로 입문/기초/중급 트랙을 제공하며, 선수 과목 체계를 통해 순차적 학습을 유도한다.


## 배포

### Nginx 설정 예시

```nginx
server {
    listen 80;
    server_name edu.example.com;

    # React 정적 파일
    location / {
        root /var/www/codebuddy/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (SSE 스트리밍 지원)
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
```

### PM2로 서버 실행

```bash
pm2 start apps/server/dist/index.js --name codebuddy-api
```


## 라이선스

MIT License
