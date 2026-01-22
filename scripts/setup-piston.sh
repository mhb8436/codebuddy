#!/bin/bash

# Piston 언어 런타임 설치 스크립트
# 사용법: ./scripts/setup-piston.sh

PISTON_URL="${PISTON_API_URL:-http://localhost:2000}"

echo "Piston API URL: $PISTON_URL"

# Piston이 준비될 때까지 대기
echo "Piston 서버 연결 대기 중..."
for i in {1..30}; do
  if curl -s "$PISTON_URL/api/v2/runtimes" > /dev/null 2>&1; then
    echo "Piston 서버 연결됨!"
    break
  fi
  echo "대기 중... ($i/30)"
  sleep 2
done

# 현재 설치된 런타임 확인
echo ""
echo "=== 현재 설치된 런타임 ==="
curl -s "$PISTON_URL/api/v2/runtimes" | jq -r '.[] | "\(.language) \(.version)"' 2>/dev/null || \
  curl -s "$PISTON_URL/api/v2/runtimes"

# 필요한 언어 설치
echo ""
echo "=== 언어 런타임 설치 ==="

# JavaScript (Node.js)
echo "Installing Node.js..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "node", "version": "18.15.0"}' | jq .

# TypeScript
echo "Installing TypeScript..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "typescript", "version": "5.0.3"}' | jq .

# Python
echo "Installing Python..."
curl -s -X POST "$PISTON_URL/api/v2/packages" \
  -H "Content-Type: application/json" \
  -d '{"language": "python", "version": "3.10.0"}' | jq .

echo ""
echo "=== 설치 완료 ==="
echo "설치된 런타임 확인 중..."
sleep 5
curl -s "$PISTON_URL/api/v2/runtimes" | jq -r '.[] | "\(.language) \(.version)"' 2>/dev/null || \
  curl -s "$PISTON_URL/api/v2/runtimes"

echo ""
echo "Piston 설정이 완료되었습니다!"
