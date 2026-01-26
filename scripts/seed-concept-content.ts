/**
 * 개념 학습 콘텐츠 시드 스크립트
 *
 * 모든 커리큘럼 토픽에 대해 학습 콘텐츠를 생성합니다.
 * - content: 마크다운 형식의 개념 설명 (이모지 없음)
 * - runnable_examples: 실행 가능한 코드 예제
 *
 * 사용법:
 *   cd apps/server
 *   npx tsx ../../scripts/seed-concept-content.ts
 */

import { query, transaction, pool } from '../apps/server/src/db/index.js';

// JavaScript 콘텐츠 모듈
import { JS_BEGINNER_ZERO_CONCEPTS } from './content/javascript-beginner-zero.js';
import { JS_BEGINNER_CONCEPTS } from './content/javascript-beginner.js';
import { JS_INTERMEDIATE_CONCEPTS } from './content/javascript-intermediate.js';

// Python 콘텐츠 모듈
import { PY_BEGINNER_ZERO_CONCEPTS } from './content/python-beginner-zero.js';
import { PY_BEGINNER_CONCEPTS } from './content/python-beginner.js';
import { PY_INTERMEDIATE_CONCEPTS } from './content/python-intermediate.js';

// TypeScript 콘텐츠 모듈
import { TS_BEGINNER_ZERO_CONCEPTS } from './content/typescript-beginner-zero.js';
import { TS_BEGINNER_CONCEPTS } from './content/typescript-beginner.js';
import { TS_INTERMEDIATE_CONCEPTS } from './content/typescript-intermediate.js';

// =============================================
// 타입 정의
// =============================================
interface Topic {
  id: string;
  name: string;
  description: string;
  stage_name: string;
  target_level: string;
  language: string;
}

interface ConceptContent {
  topic_id: string;
  name: string;
  description: string;
  content: string;
  runnable_examples: Array<{
    title: string;
    code: string;
    expected_output?: string;
  }>;
  keywords: string[];
}

// =============================================
// 모든 콘텐츠 통합
// =============================================

// JavaScript 콘텐츠 통합
const JS_CONCEPTS: Record<string, Omit<ConceptContent, 'topic_id'>> = {
  ...JS_BEGINNER_ZERO_CONCEPTS,
  ...JS_BEGINNER_CONCEPTS,
  ...JS_INTERMEDIATE_CONCEPTS,
};

// Python 콘텐츠 통합
const PY_CONCEPTS: Record<string, Omit<ConceptContent, 'topic_id'>> = {
  ...PY_BEGINNER_ZERO_CONCEPTS,
  ...PY_BEGINNER_CONCEPTS,
  ...PY_INTERMEDIATE_CONCEPTS,
};

// TypeScript 콘텐츠 통합
const TS_CONCEPTS: Record<string, Omit<ConceptContent, 'topic_id'>> = {
  ...TS_BEGINNER_ZERO_CONCEPTS,
  ...TS_BEGINNER_CONCEPTS,
  ...TS_INTERMEDIATE_CONCEPTS,
};

// =============================================
// 기본 템플릿 생성 함수
// =============================================
function generateDefaultContent(topic: Topic): Omit<ConceptContent, 'topic_id'> {
  const levelDescriptions = {
    beginner_zero: '입문자',
    beginner: '초보자',
    beginner_plus: '중급자',
  };

  const levelHint = levelDescriptions[topic.target_level as keyof typeof levelDescriptions] || '학습자';

  return {
    name: topic.name,
    description: topic.description,
    content: `# ${topic.name}

## 개요

${topic.description}

## 학습 목표

${levelHint}를 위한 ${topic.name} 학습 콘텐츠입니다.

(이 콘텐츠는 자동 생성되었습니다. 상세 내용은 추후 업데이트 예정입니다.)

## 핵심 개념

- ${topic.name}의 기본 개념을 이해합니다.
- 실제 예제를 통해 학습합니다.

## 정리

- ${topic.description}`,
    runnable_examples: [],
    keywords: [topic.name, topic.stage_name, topic.language],
  };
}

// =============================================
// 콘텐츠 가져오기 함수
// =============================================
function getConceptContent(topic: Topic): Omit<ConceptContent, 'topic_id'> {
  // 언어별 콘텐츠 맵에서 찾기
  if (topic.language === 'javascript' && JS_CONCEPTS[topic.id]) {
    return JS_CONCEPTS[topic.id];
  }
  if (topic.language === 'python' && PY_CONCEPTS[topic.id]) {
    return PY_CONCEPTS[topic.id];
  }
  if (topic.language === 'typescript' && TS_CONCEPTS[topic.id]) {
    return TS_CONCEPTS[topic.id];
  }

  // 없으면 기본 템플릿 생성
  return generateDefaultContent(topic);
}

// =============================================
// 메인 시드 함수
// =============================================
async function seedConceptContent() {
  console.log('개념 학습 콘텐츠 시드 시작...\n');

  try {
    // 1. 모든 토픽 조회
    const topicsResult = await query<Topic>(`
      SELECT t.id, t.name, t.description,
             s.name as stage_name,
             tr.target_level,
             l.id as language
      FROM curriculum_topics t
      JOIN curriculum_stages s ON t.stage_id = s.id
      JOIN curriculum_tracks tr ON s.track_id = tr.id
      JOIN curriculum_languages l ON tr.language_id = l.id
      ORDER BY l.display_order, tr.display_order, s.display_order, t.display_order
    `);

    const topics = topicsResult.rows;
    console.log(`총 ${topics.length}개 토픽 발견\n`);

    // 2. 기존 concepts 삭제
    console.log('기존 curriculum_concepts 데이터 삭제 중...');
    await query('DELETE FROM curriculum_concepts');

    // 3. 각 토픽에 대해 concept 생성
    await transaction(async (client) => {
      let count = 0;
      let jsCount = 0, pyCount = 0, tsCount = 0;

      for (const topic of topics) {
        const conceptData = getConceptContent(topic);
        const conceptId = `concept-${topic.id}`;

        await client.query(
          `
          INSERT INTO curriculum_concepts
            (id, topic_id, name, description, content, runnable_examples, keywords, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
          `,
          [
            conceptId,
            topic.id,
            conceptData.name,
            conceptData.description,
            conceptData.content,
            JSON.stringify(conceptData.runnable_examples),
            JSON.stringify(conceptData.keywords),
          ]
        );

        count++;
        if (topic.language === 'javascript') jsCount++;
        else if (topic.language === 'python') pyCount++;
        else if (topic.language === 'typescript') tsCount++;

        // 진행 상황 표시
        if (count % 20 === 0) {
          console.log(`  ... ${count}/${topics.length} 완료`);
        }
      }

      console.log(`\n개념 콘텐츠 시드 완료!`);
      console.log(`  - JavaScript: ${jsCount}개`);
      console.log(`  - Python: ${pyCount}개`);
      console.log(`  - TypeScript: ${tsCount}개`);
      console.log(`  - 총: ${count}개`);
    });
  } catch (error) {
    console.error('시드 실패:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 실행
seedConceptContent().catch((err) => {
  console.error(err);
  process.exit(1);
});
