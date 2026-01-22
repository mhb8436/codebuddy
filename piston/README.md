# Piston 코드 실행 엔진 설정

CodeBuddy에서 JavaScript, TypeScript, Python 코드 실행을 위한 Piston 설정.

## 지원 언어

| 언어 | 버전 | 비고 |
|------|------|------|
| JavaScript | Node.js 15.10.0 | ES2015+ 네이티브 지원 |
| TypeScript | 4.2.3 | ES2015 + DOM lib 포함 |
| Python | 3.9.4 | |

## 로컬 개발 환경 (Apple Silicon Mac)

```bash
# 빌드 및 실행
docker-compose build piston
docker-compose up -d piston

# 상태 확인
curl http://localhost:2000/api/v2/runtimes
```

### Apple Silicon 참고사항

- `platform: linux/amd64` 설정 필수 (Piston 이미지가 AMD64 전용)
- Rosetta 2 에뮬레이션으로 동작하여 네이티브 대비 느림
- `privileged: true` 필수 (isolate 샌드박스용)

## 프로덕션 환경 (Ubuntu 22.04)

### 사전 요구사항

```bash
# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose-v2

# Docker 서비스 활성화
sudo systemctl enable docker
sudo systemctl start docker

# 현재 사용자를 docker 그룹에 추가 (재로그인 필요)
sudo usermod -aG docker $USER
```

### docker-compose.yml 프로덕션 설정

```yaml
piston:
  build:
    context: ./piston
    dockerfile: Dockerfile
  # platform: linux/amd64  # Ubuntu x86_64에서는 불필요
  privileged: true
  restart: unless-stopped
  ports:
    - "127.0.0.1:2000:2000"  # localhost만 바인딩 (보안)
  tmpfs:
    - /piston/jobs:exec,size=256M
  deploy:
    resources:
      limits:
        memory: 4G
      reservations:
        memory: 1G
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:2000/api/v2/runtimes"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 10s
```

### 배포

```bash
# 빌드 및 실행
docker compose build piston
docker compose up -d piston

# 런타임 확인
curl http://localhost:2000/api/v2/runtimes

# 코드 실행 테스트
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{"language": "javascript", "version": "*", "files": [{"name": "main.js", "content": "console.log(\"Hello\")"}]}'
```

## 환경별 성능 비교

| 환경 | 아키텍처 | Piston 실행 | 성능 |
|------|----------|-------------|------|
| Apple Silicon Mac | ARM64 | AMD64 에뮬레이션 | 느림 |
| Ubuntu 22.04 | x86_64 | 네이티브 | 빠름 |
| Intel Mac | x86_64 | 네이티브 | 빠름 |

## 보안 고려사항

| 항목 | 설명 | 권장 |
|------|------|------|
| `privileged: true` | Piston isolate에 필수 | Piston 전용 VM 분리 권장 |
| 포트 바인딩 | 외부 접근 차단 | `127.0.0.1:2000:2000` 사용 |
| 실행 제한 | 타임아웃/메모리 | 3초 / 128MB (code.ts에서 설정) |

## 문제 해결

### 빈 런타임 목록 `[]`

패키지가 설치되지 않았거나 `.ppman-installed` 마커 파일이 없음.
→ Dockerfile에서 패키지 설치 및 마커 파일 생성 확인

### "Read-only file system" 오류

`privileged: true`와 `tmpfs` 설정 필요.

### TypeScript ES2015 오류 (Map, Set 등)

TypeScript compile 스크립트에 `--lib es2015,dom` 옵션 필요.
→ 현재 Dockerfile에 이미 적용됨

### 타임아웃 오류

Piston 기본 제한은 3000ms. `code.ts`의 `run_timeout`이 3000 이하인지 확인.

## Dockerfile 구조

```dockerfile
FROM ghcr.io/engineer-man/piston

# 패키지 다운로드 (Node.js, Python, TypeScript)
ADD https://github.com/engineer-man/piston/releases/download/pkgs/...

# 패키지 추출 및 설정
RUN mkdir -p /piston/packages/...

# 패키지 감지용 마커 파일
RUN touch /piston/packages/.../.ppman-installed

# 환경 변수 설정 (PATH)
RUN echo "PATH=..." > /piston/packages/.../.env

# TypeScript 컴파일러 옵션 (ES2015 지원)
RUN echo '#!/usr/bin/env bash\ntsc --target es2015 --lib es2015,dom --outDir . "$@"' > .../compile
```
