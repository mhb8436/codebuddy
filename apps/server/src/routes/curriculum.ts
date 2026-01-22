import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as curriculumService from '../services/curriculumService.js';
import {
  learningProgressRepository,
  userTrackEnrollmentRepository,
  topicStatsRepository,
} from '../db/repositories/learningProgressRepository.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Curriculum
 *   description: 커리큘럼 관리 API
 */

/**
 * @swagger
 * /api/curriculum/languages:
 *   get:
 *     summary: 사용 가능한 언어 목록 조회
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 언어 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: javascript
 *                       name:
 *                         type: string
 *                         example: JavaScript
 *                       description:
 *                         type: string
 */
router.get('/languages', authenticate, async (req: Request, res: Response) => {
  try {
    const languages = await curriculumService.getAvailableLanguages();
    res.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: '언어 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}:
 *   get:
 *     summary: 특정 언어의 커리큘럼 조회
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *         description: 언어 ID (javascript, python)
 *     responses:
 *       200:
 *         description: 커리큘럼 정보
 *       404:
 *         description: 커리큘럼을 찾을 수 없음
 */
router.get('/:language', authenticate, async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const curriculum = await curriculumService.loadCurriculum(language);

    if (!curriculum) {
      res.status(404).json({ error: `Curriculum not found for language: ${language}` });
      return;
    }

    res.json({ curriculum });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ error: '커리큘럼 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/stats:
 *   get:
 *     summary: 커리큘럼 통계 조회
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 커리큘럼 통계
 */
router.get('/:language/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const stats = await curriculumService.getCurriculumStats(language);

    if (!stats) {
      res.status(404).json({ error: `Curriculum not found for language: ${language}` });
      return;
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching curriculum stats:', error);
    res.status(500).json({ error: '커리큘럼 통계 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/tracks:
 *   get:
 *     summary: 특정 언어의 트랙 목록 조회
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 트랙 목록
 */
router.get('/:language/tracks', authenticate, async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const tracks = await curriculumService.getTracks(language);

    if (tracks.length === 0) {
      const curriculum = await curriculumService.loadCurriculum(language);
      if (!curriculum) {
        res.status(404).json({ error: `Curriculum not found for language: ${language}` });
        return;
      }
    }

    res.json({
      tracks: tracks.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        targetLevel: t.targetLevel,
        estimatedHours: t.estimatedHours,
        prerequisites: t.prerequisites || [],
        stageCount: t.stageCount || t.stages.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: '트랙 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/tracks/{trackId}:
 *   get:
 *     summary: 특정 트랙 상세 조회
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 트랙 상세 정보
 *       404:
 *         description: 트랙을 찾을 수 없음
 */
router.get('/:language/tracks/:trackId', authenticate, async (req: Request, res: Response) => {
  try {
    const { language, trackId } = req.params;
    const track = await curriculumService.getTrack(language, trackId);

    if (!track) {
      res.status(404).json({ error: `Track not found: ${trackId}` });
      return;
    }

    res.json({ track });
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ error: '트랙 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/tracks/{trackId}/topics:
 *   get:
 *     summary: 트랙 내 모든 토픽 목록 (순서대로)
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 토픽 목록
 */
router.get('/:language/tracks/:trackId/topics', authenticate, async (req: Request, res: Response) => {
  try {
    const { language, trackId } = req.params;
    const topics = await curriculumService.getAllTopicsInTrack(language, trackId);

    if (topics.length === 0) {
      const track = await curriculumService.getTrack(language, trackId);
      if (!track) {
        res.status(404).json({ error: `Track not found: ${trackId}` });
        return;
      }
    }

    res.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: '토픽 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/tracks/{trackId}/topics/{topicId}:
 *   get:
 *     summary: 특정 토픽 상세 조회
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 토픽 상세 정보
 *       404:
 *         description: 토픽을 찾을 수 없음
 */
router.get('/:language/tracks/:trackId/topics/:topicId', authenticate, async (req: Request, res: Response) => {
  try {
    const { language, trackId, topicId } = req.params;
    const topic = await curriculumService.getTopic(language, trackId, topicId);

    if (!topic) {
      res.status(404).json({ error: `Topic not found: ${topicId}` });
      return;
    }

    // 이전/다음 토픽 정보 추가
    const prevTopic = await curriculumService.getPreviousTopic(language, trackId, topicId);
    const nextTopic = await curriculumService.getNextTopic(language, trackId, topicId);

    res.json({
      topic,
      navigation: {
        previous: prevTopic ? { topicId: prevTopic.topicId, name: prevTopic.topic.name } : null,
        next: nextTopic ? { topicId: nextTopic.topicId, name: nextTopic.topic.name } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: '토픽 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/tracks/{trackId}/topics/{topicId}/context:
 *   get:
 *     summary: 토픽 컨텍스트 정보 (AI 프롬프트용)
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 토픽 컨텍스트 정보
 */
router.get('/:language/tracks/:trackId/topics/:topicId/context', authenticate, async (req: Request, res: Response) => {
  try {
    const { language, trackId, topicId } = req.params;
    const context = await curriculumService.getTopicContext(language, trackId, topicId);

    if (!context) {
      res.status(404).json({ error: `Topic not found: ${topicId}` });
      return;
    }

    res.json({ context });
  } catch (error) {
    console.error('Error fetching topic context:', error);
    res.status(500).json({ error: '토픽 컨텍스트 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/{language}/search:
 *   get:
 *     summary: 키워드로 토픽 검색
 *     tags: [Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색 키워드
 *     responses:
 *       200:
 *         description: 검색 결과
 */
router.get('/:language/search', authenticate, async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query (q) is required' });
      return;
    }

    const results = await curriculumService.searchTopicsByKeyword(language, q);
    res.json({ results });
  } catch (error) {
    console.error('Error searching topics:', error);
    res.status(500).json({ error: '토픽 검색 중 오류가 발생했습니다' });
  }
});

// ========================
// Learning Progress APIs
// ========================

interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string; email: string; level: string; role: string; classId: string | null; className: string | null };
}

/**
 * @swagger
 * /api/curriculum/progress/my:
 *   get:
 *     summary: 내 학습 진도 조회
 *     tags: [Curriculum, Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 학습 진도 정보
 */
router.get('/progress/my', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    // 등록된 트랙 조회
    const enrollments = await userTrackEnrollmentRepository.findByUser(userId);

    // 각 트랙별 진도 조회
    const progressByTrack = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await learningProgressRepository.findByUserAndTrack(
          userId,
          enrollment.language,
          enrollment.track_id
        );
        return {
          language: enrollment.language,
          trackId: enrollment.track_id,
          currentTopicId: enrollment.current_topic_id,
          progressPercent: enrollment.progress_percent,
          enrolledAt: enrollment.enrolled_at,
          lastActivityAt: enrollment.last_activity_at,
          topics: progress.map((p) => ({
            topicId: p.topic_id,
            status: p.status,
            practiceCount: p.practice_count,
            correctCount: p.correct_count,
            lastPracticedAt: p.last_practiced_at,
            completedAt: p.completed_at,
          })),
        };
      })
    );

    res.json({ progress: progressByTrack });
  } catch (error) {
    console.error('Error fetching my progress:', error);
    res.status(500).json({ error: '진도 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/progress/enroll:
 *   post:
 *     summary: 트랙에 등록
 *     tags: [Curriculum, Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - trackId
 *             properties:
 *               language:
 *                 type: string
 *               trackId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 등록 성공
 */
router.post('/progress/enroll', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    const { language, trackId } = req.body;

    if (!language || !trackId) {
      res.status(400).json({ error: 'language와 trackId가 필요합니다' });
      return;
    }

    // 트랙 존재 여부 확인
    const track = await curriculumService.getTrack(language, trackId);
    if (!track) {
      res.status(404).json({ error: '트랙을 찾을 수 없습니다' });
      return;
    }

    // 첫 번째 토픽 ID 가져오기
    const topics = await curriculumService.getAllTopicsInTrack(language, trackId);
    const firstTopicId = topics.length > 0 ? topics[0].topicId : undefined;

    // 등록
    const enrollment = await userTrackEnrollmentRepository.enroll(
      userId,
      language,
      trackId,
      firstTopicId
    );

    res.json({
      message: '트랙에 등록되었습니다',
      enrollment: {
        language: enrollment.language,
        trackId: enrollment.track_id,
        currentTopicId: enrollment.current_topic_id,
        progressPercent: enrollment.progress_percent,
        enrolledAt: enrollment.enrolled_at,
      },
    });
  } catch (error) {
    console.error('Error enrolling in track:', error);
    res.status(500).json({ error: '트랙 등록 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/progress/start:
 *   post:
 *     summary: 토픽 학습 시작
 *     tags: [Curriculum, Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - trackId
 *               - topicId
 *             properties:
 *               language:
 *                 type: string
 *               trackId:
 *                 type: string
 *               topicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 학습 시작 기록됨
 */
router.post('/progress/start', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    const { language, trackId, topicId } = req.body;

    if (!language || !trackId || !topicId) {
      res.status(400).json({ error: 'language, trackId, topicId가 필요합니다' });
      return;
    }

    // 진도 기록 생성/업데이트 (상태: in_progress)
    const progress = await learningProgressRepository.upsert({
      userId,
      language,
      trackId,
      topicId,
      status: 'in_progress',
    });

    // 현재 토픽 업데이트
    await userTrackEnrollmentRepository.updateCurrentTopic(userId, language, trackId, topicId);

    res.json({
      message: '토픽 학습이 시작되었습니다',
      progress: {
        topicId: progress.topic_id,
        status: progress.status,
        practiceCount: progress.practice_count,
        lastPracticedAt: progress.last_practiced_at,
      },
    });
  } catch (error) {
    console.error('Error starting topic:', error);
    res.status(500).json({ error: '토픽 시작 기록 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/progress/practice:
 *   post:
 *     summary: 연습 결과 기록
 *     tags: [Curriculum, Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - trackId
 *               - topicId
 *               - isCorrect
 *             properties:
 *               language:
 *                 type: string
 *               trackId:
 *                 type: string
 *               topicId:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 연습 결과 기록됨
 */
router.post('/progress/practice', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    const { language, trackId, topicId, isCorrect } = req.body;

    if (!language || !trackId || !topicId || typeof isCorrect !== 'boolean') {
      res.status(400).json({ error: 'language, trackId, topicId, isCorrect(boolean)가 필요합니다' });
      return;
    }

    // 연습 결과 기록
    const progress = await learningProgressRepository.recordPractice(
      userId,
      language,
      trackId,
      topicId,
      isCorrect
    );

    // 토픽 통계 업데이트
    await topicStatsRepository.recordAttempt(language, trackId, topicId, isCorrect);

    res.json({
      message: '연습 결과가 기록되었습니다',
      progress: {
        topicId: progress.topic_id,
        practiceCount: progress.practice_count,
        correctCount: progress.correct_count,
        accuracy: progress.practice_count > 0
          ? Math.round((progress.correct_count / progress.practice_count) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error recording practice:', error);
    res.status(500).json({ error: '연습 결과 기록 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/progress/complete:
 *   post:
 *     summary: 토픽 완료 표시
 *     tags: [Curriculum, Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - trackId
 *               - topicId
 *             properties:
 *               language:
 *                 type: string
 *               trackId:
 *                 type: string
 *               topicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 토픽 완료 처리됨
 */
router.post('/progress/complete', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    const { language, trackId, topicId } = req.body;

    if (!language || !trackId || !topicId) {
      res.status(400).json({ error: 'language, trackId, topicId가 필요합니다' });
      return;
    }

    // 토픽 완료 표시
    const progress = await learningProgressRepository.markCompleted(userId, language, trackId, topicId);

    // 전체 토픽 수 조회
    const allTopics = await curriculumService.getAllTopicsInTrack(language, trackId);
    const totalTopics = allTopics.length;

    // 완료된 토픽 수 조회
    const completedCount = await learningProgressRepository.getCompletedCount(userId, language, trackId);

    // 진도율 계산 및 업데이트
    const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    await userTrackEnrollmentRepository.updateProgress(userId, language, trackId, progressPercent);

    // 다음 토픽 정보 가져오기
    const nextTopic = await curriculumService.getNextTopic(language, trackId, topicId);

    // 다음 토픽이 있으면 현재 토픽 업데이트
    if (nextTopic) {
      await userTrackEnrollmentRepository.updateCurrentTopic(userId, language, trackId, nextTopic.topicId);
    }

    res.json({
      message: '토픽이 완료되었습니다',
      progress: {
        topicId: progress.topic_id,
        status: progress.status,
        completedAt: progress.completed_at,
      },
      trackProgress: {
        completedTopics: completedCount,
        totalTopics,
        progressPercent,
      },
      nextTopic: nextTopic
        ? { topicId: nextTopic.topicId, name: nextTopic.topic.name }
        : null,
    });
  } catch (error) {
    console.error('Error completing topic:', error);
    res.status(500).json({ error: '토픽 완료 처리 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/curriculum/progress/{language}/{trackId}:
 *   get:
 *     summary: 특정 트랙의 내 진도 조회
 *     tags: [Curriculum, Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 트랙 진도 정보
 */
router.get('/progress/:language/:trackId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    const { language, trackId } = req.params;

    // 등록 정보 조회
    const enrollment = await userTrackEnrollmentRepository.findByUserAndTrack(userId, language, trackId);

    // 진도 정보 조회
    const progress = await learningProgressRepository.findByUserAndTrack(userId, language, trackId);

    // 전체 토픽 목록
    const allTopics = await curriculumService.getAllTopicsInTrack(language, trackId);

    // 진도 맵 생성
    const progressMap = new Map(progress.map((p) => [p.topic_id, p]));

    res.json({
      enrollment: enrollment
        ? {
            currentTopicId: enrollment.current_topic_id,
            progressPercent: enrollment.progress_percent,
            enrolledAt: enrollment.enrolled_at,
            lastActivityAt: enrollment.last_activity_at,
          }
        : null,
      topics: allTopics.map((topic) => {
        const p = progressMap.get(topic.topicId);
        return {
          topicId: topic.topicId,
          name: topic.topicName,
          stageId: topic.stageId,
          stageName: topic.stageName,
          status: p?.status || 'not_started',
          practiceCount: p?.practice_count || 0,
          correctCount: p?.correct_count || 0,
          lastPracticedAt: p?.last_practiced_at || null,
          completedAt: p?.completed_at || null,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching track progress:', error);
    res.status(500).json({ error: '트랙 진도 조회 중 오류가 발생했습니다' });
  }
});

export default router;
