#!/usr/bin/env python3
"""
CodeBuddy 매뉴얼용 스크린샷 촬영 스크립트
- Playwright를 사용하여 주요 화면 스크린샷 촬영
- 학습자/강사 매뉴얼에 필요한 화면 자동 캡처
"""

import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

# 설정
BASE_URL = "http://localhost:3000"
SCREENSHOT_DIR = Path(__file__).parent.parent / "docs" / "screenshots"

# 테스트 계정 (실행 시 환경변수 또는 직접 수정)
TEST_EMAIL = os.environ.get("TEST_EMAIL", "admin@codebuddy.local")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "admin1234")

# 캡처할 화면 목록
LEARNER_SCREENS = [
    {"name": "01_login", "url": "/login", "wait_for": "text=로그인", "logged_in": False},
    {"name": "02_register", "url": "/register", "wait_for": "text=회원가입", "logged_in": False},
    {"name": "03_main", "url": "/", "wait_for": ".bg-white", "logged_in": True},
    {"name": "04_curriculum", "url": "/curriculum", "wait_for": "text=학습 트랙", "logged_in": True},
    {"name": "05_concept", "url": "/learn", "wait_for": "text=개념 학습", "logged_in": True, "setup": "click_concept_tab"},
    {"name": "06_ai_tutor", "url": "/learn", "wait_for": "text=AI 튜터", "logged_in": True, "setup": "click_ai_tab"},
    {"name": "07_practice", "url": "/learn", "wait_for": "text=연습문제", "logged_in": True, "setup": "click_practice_tab"},
    {"name": "08_exam", "url": "/learn", "wait_for": "text=시험", "logged_in": True, "setup": "click_exam_tab"},
]

INSTRUCTOR_SCREENS = [
    {"name": "admin_01_dashboard", "url": "/admin", "wait_for": "text=관리자", "logged_in": True},
    {"name": "admin_02_classes", "url": "/admin/classes", "wait_for": "text=반 관리", "logged_in": True},
]


async def login(page, email: str, password: str):
    """로그인 수행"""
    await page.goto(f"{BASE_URL}/login")
    await page.wait_for_selector('input[type="email"]')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.wait_for_url(f"{BASE_URL}/")
    print(f"✓ 로그인 성공: {email}")


async def setup_for_screenshot(page, setup_name: str):
    """스크린샷 전 특정 설정 수행"""
    if setup_name == "click_concept_tab":
        await page.click('text=개념 학습')
        await asyncio.sleep(0.5)
    elif setup_name == "click_ai_tab":
        await page.click('text=AI 튜터')
        await asyncio.sleep(0.5)
    elif setup_name == "click_practice_tab":
        await page.click('text=연습문제')
        await asyncio.sleep(0.5)
    elif setup_name == "click_exam_tab":
        await page.click('text=시험')
        await asyncio.sleep(0.5)


async def capture_screen(page, screen_config: dict, output_dir: Path):
    """단일 화면 캡처"""
    name = screen_config["name"]
    url = screen_config["url"]
    wait_for = screen_config.get("wait_for")
    setup = screen_config.get("setup")

    try:
        await page.goto(f"{BASE_URL}{url}")

        if wait_for:
            await page.wait_for_selector(wait_for, timeout=10000)

        if setup:
            await setup_for_screenshot(page, setup)

        await asyncio.sleep(0.5)  # 렌더링 대기

        filepath = output_dir / f"{name}.png"
        await page.screenshot(path=str(filepath), full_page=False)
        print(f"✓ 캡처 완료: {name}")
        return True
    except Exception as e:
        print(f"✗ 캡처 실패 ({name}): {e}")
        return False


async def select_curriculum_topic(page):
    """커리큘럼에서 토픽 선택 (학습 페이지 접근용)"""
    await page.goto(f"{BASE_URL}/curriculum")
    await page.wait_for_selector("text=학습 트랙")

    # 첫 번째 트랙 클릭
    track_cards = await page.query_selector_all(".cursor-pointer")
    if track_cards:
        await track_cards[0].click()
        await asyncio.sleep(0.5)

        # 첫 번째 토픽 클릭
        topic_items = await page.query_selector_all(".cursor-pointer")
        if len(topic_items) > 0:
            await topic_items[0].click()
            await asyncio.sleep(0.5)

            # 학습 시작 버튼 클릭
            start_btn = await page.query_selector("text=학습 시작")
            if start_btn:
                await start_btn.click()
                await page.wait_for_url(f"{BASE_URL}/learn")
                print("✓ 학습 토픽 선택 완료")
                return True

    print("✗ 토픽 선택 실패")
    return False


async def main():
    """메인 실행 함수"""
    # 스크린샷 디렉토리 생성
    learner_dir = SCREENSHOT_DIR / "learner"
    instructor_dir = SCREENSHOT_DIR / "instructor"
    learner_dir.mkdir(parents=True, exist_ok=True)
    instructor_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 50)
    print("CodeBuddy 매뉴얼 스크린샷 촬영")
    print("=" * 50)
    print(f"이메일: {TEST_EMAIL}")
    print(f"저장 경로: {SCREENSHOT_DIR}")
    print()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # headless=False로 브라우저 표시
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="ko-KR"
        )
        page = await context.new_page()

        # === 학습자 매뉴얼 스크린샷 ===
        print("\n[학습자 매뉴얼 스크린샷]")
        print("-" * 30)

        # 비로그인 화면 먼저 촬영
        for screen in LEARNER_SCREENS:
            if not screen.get("logged_in", True):
                await capture_screen(page, screen, learner_dir)

        # 로그인
        await login(page, TEST_EMAIL, TEST_PASSWORD)

        # 커리큘럼에서 토픽 선택
        await select_curriculum_topic(page)

        # 로그인 필요 화면 촬영
        for screen in LEARNER_SCREENS:
            if screen.get("logged_in", True):
                await capture_screen(page, screen, learner_dir)

        # === 강사 매뉴얼 스크린샷 (관리자 권한 필요) ===
        print("\n[강사 매뉴얼 스크린샷]")
        print("-" * 30)

        for screen in INSTRUCTOR_SCREENS:
            await capture_screen(page, screen, instructor_dir)

        await browser.close()

    print("\n" + "=" * 50)
    print("스크린샷 촬영 완료!")
    print(f"저장 위치: {SCREENSHOT_DIR}")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
