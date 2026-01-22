#!/bin/bash

# ============================================
# CodeBuddy 운영 환경 초기 설정 스크립트
# ============================================
#
# 사용법:
#   chmod +x scripts/setup-production.sh
#   ./scripts/setup-production.sh
#
# 환경변수:
#   DATABASE_URL: PostgreSQL 연결 문자열 (필수)
#   ADMIN_PASSWORD: 관리자 비밀번호 (선택, 기본: admin1234!)
#   INSTRUCTOR_PASSWORD: 강사 비밀번호 (선택, 기본: instructor123!)
#
# 순서:
#   1. 데이터베이스 마이그레이션 실행
#   2. 초기 데이터(시드) 삽입

set -e  # 오류 발생시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 스크립트 디렉토리 기준으로 프로젝트 루트 설정
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
SERVER_DIR="$PROJECT_ROOT/apps/server"

echo -e "${BLUE}"
echo "============================================"
echo "  CodeBuddy 운영 환경 초기 설정"
echo "============================================"
echo -e "${NC}"

# 1. 환경변수 확인
echo -e "${YELLOW}[1/4] 환경변수 확인 중...${NC}"

if [ -z "$DATABASE_URL" ]; then
  # .env 파일에서 로드 시도
  if [ -f "$SERVER_DIR/.env" ]; then
    export $(grep -v '^#' "$SERVER_DIR/.env" | xargs)
    echo -e "  ${GREEN}✓${NC} .env 파일에서 환경변수 로드"
  fi

  if [ -z "$DATABASE_URL" ]; then
    echo -e "  ${RED}✗${NC} DATABASE_URL이 설정되지 않았습니다."
    echo ""
    echo "  설정 방법:"
    echo "    export DATABASE_URL='postgresql://user:pass@localhost:5432/codebuddy'"
    echo "  또는 apps/server/.env 파일에 설정"
    exit 1
  fi
fi

echo -e "  ${GREEN}✓${NC} DATABASE_URL 확인됨"

# 비밀번호 기본값 설정
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin1234!}"
export INSTRUCTOR_PASSWORD="${INSTRUCTOR_PASSWORD:-instructor123!}"

echo -e "  ${GREEN}✓${NC} 관리자 비밀번호: ${ADMIN_PASSWORD:0:4}****"
echo -e "  ${GREEN}✓${NC} 강사 비밀번호: ${INSTRUCTOR_PASSWORD:0:4}****"

# 2. 의존성 확인
echo ""
echo -e "${YELLOW}[2/4] 의존성 확인 중...${NC}"

cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
  echo -e "  ${YELLOW}⚠${NC} node_modules가 없습니다. 설치 중..."
  pnpm install
fi

echo -e "  ${GREEN}✓${NC} 의존성 확인 완료"

# 3. 데이터베이스 마이그레이션
echo ""
echo -e "${YELLOW}[3/4] 데이터베이스 마이그레이션 실행 중...${NC}"

cd "$SERVER_DIR"

# node-pg-migrate 실행
npx node-pg-migrate up -m ./migrations --tsconfig ./tsconfig.json

echo -e "  ${GREEN}✓${NC} 마이그레이션 완료"

# 4. 초기 데이터 삽입
echo ""
echo -e "${YELLOW}[4/4] 초기 데이터 삽입 중...${NC}"

npx tsx "$SCRIPT_DIR/seed-production.ts"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  설정 완료!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "다음 단계:"
echo -e "  1. 서버 시작: ${BLUE}pnpm dev${NC}"
echo -e "  2. 브라우저에서 접속"
echo -e "  3. admin@codebuddy.io로 로그인"
echo -e "  4. ${RED}반드시 비밀번호 변경!${NC}"
echo ""
