import { Router } from 'express';
import { classRepository, userRepository, statsRepository, modelConfigRepository, curriculumRepository } from '../db/repositories/index.js';
import { learningProgressRepository } from '../db/repositories/learningProgressRepository.js';
import { questionBankRepository, questionGenerationJobRepository } from '../db/repositories/questionBankRepository.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getUpgradeStats } from '../services/adaptiveModel.js';
import { setCachedConfig, type LearnerLevel, type ModelProvider } from '../config/modelByLevel.js';
import * as curriculumService from '../services/curriculumService.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireRole('admin', 'instructor'));

/**
 * @swagger
 * /admin/classes:
 *   get:
 *     summary: 반 목록 조회
 *     description: 모든 반 목록 조회 (관리자/강사)
 *     tags: [Admin - Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 반 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 */
router.get('/classes', async (req, res) => {
  try {
    const classes = await classRepository.findAll();
    res.json(classes);
  } catch (error) {
    console.error('List classes error:', error);
    res.status(500).json({ message: '반 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/classes:
 *   post:
 *     summary: 반 생성
 *     description: 새로운 반 생성 (관리자 전용)
 *     tags: [Admin - Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 웹개발 심화반
 *               maxStudents:
 *                 type: integer
 *                 default: 20
 *               expiresInDays:
 *                 type: integer
 *                 description: 초대 코드 만료일 (일 단위)
 *     responses:
 *       201:
 *         description: 반 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: 반 이름 누락
 *       403:
 *         description: 관리자 권한 필요
 */
router.post('/classes', requireRole('admin'), async (req, res) => {
  try {
    const { name, maxStudents = 20, expiresInDays } = req.body;

    if (!name) {
      return res.status(400).json({ message: '반 이름을 입력해주세요' });
    }

    const inviteCode = generateInviteCode();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const newClass = await classRepository.create({
      name,
      inviteCode,
      maxStudents,
      expiresAt,
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: '반 생성 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/classes/{id}:
 *   get:
 *     summary: 반 상세 조회
 *     description: 학생 목록 포함 반 상세 정보 조회
 *     tags: [Admin - Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 반 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Class'
 *                 - type: object
 *                   properties:
 *                     studentCount:
 *                       type: integer
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       404:
 *         description: 반을 찾을 수 없음
 */
router.get('/classes/:id', async (req, res) => {
  try {
    const classInfo = await classRepository.findById(req.params.id);

    if (!classInfo) {
      return res.status(404).json({ message: '반을 찾을 수 없습니다' });
    }

    const students = await userRepository.findByClassId(req.params.id);

    res.json({
      ...classInfo,
      studentCount: students.length,
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        level: s.level,
        lastLoginAt: s.last_login_at,
      })),
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: '반 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/classes/{id}:
 *   put:
 *     summary: 반 수정
 *     description: 반 정보 수정 (관리자 전용)
 *     tags: [Admin - Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 반을 찾을 수 없음
 */
router.put('/classes/:id', requireRole('admin'), async (req, res) => {
  try {
    const { name, maxStudents, expiresAt } = req.body;

    const updated = await classRepository.update(req.params.id, {
      name,
      maxStudents,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    if (!updated) {
      return res.status(404).json({ message: '반을 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: '반 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/classes/{id}:
 *   delete:
 *     summary: 반 삭제
 *     description: 반 삭제 (관리자 전용)
 *     tags: [Admin - Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 반을 찾을 수 없음
 */
router.delete('/classes/:id', requireRole('admin'), async (req, res) => {
  try {
    const deleted = await classRepository.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: '반을 찾을 수 없습니다' });
    }

    res.json({ message: '반이 삭제되었습니다' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: '반 삭제 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/classes/{id}/regenerate-code:
 *   post:
 *     summary: 초대 코드 재생성
 *     description: 반의 초대 코드 재생성 (관리자 전용)
 *     tags: [Admin - Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 새 초대 코드
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inviteCode:
 *                   type: string
 *                   example: K7X2P9
 *       404:
 *         description: 반을 찾을 수 없음
 */
router.post('/classes/:id/regenerate-code', requireRole('admin'), async (req, res) => {
  try {
    const newCode = generateInviteCode();
    const updated = await classRepository.updateInviteCode(req.params.id, newCode);

    if (!updated) {
      return res.status(404).json({ message: '반을 찾을 수 없습니다' });
    }

    res.json({ inviteCode: updated.invite_code });
  } catch (error) {
    console.error('Regenerate code error:', error);
    res.status(500).json({ message: '초대 코드 재생성 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: 사용자 목록
 *     description: 반별 또는 전체 사용자 목록 조회 (관리자 전용)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 특정 반의 사용자만 조회
 *     responses:
 *       200:
 *         description: 사용자 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', requireRole('admin'), async (req, res) => {
  try {
    const { classId } = req.query;

    if (classId && typeof classId === 'string') {
      const users = await userRepository.findByClassId(classId);
      return res.json(users);
    }

    // For now, return empty - implement findAll if needed
    res.json([]);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: '사용자 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     summary: 사용자 역할 변경
 *     description: 사용자의 역할 변경 (관리자 전용)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *     responses:
 *       200:
 *         description: 역할 변경 성공
 *       400:
 *         description: 유효하지 않은 역할
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.put('/users/:id/role', requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'instructor', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: '유효한 역할을 선택해주세요' });
    }

    const updated = await userRepository.update(req.params.id, { role });

    if (!updated) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    res.json({
      message: '역할이 업데이트되었습니다',
      user: {
        id: updated.id,
        name: updated.name,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: '역할 업데이트 중 오류가 발생했습니다' });
  }
});

// ==================== Statistics API ====================

/**
 * @swagger
 * /admin/stats/summary:
 *   get:
 *     summary: 요약 통계
 *     description: 전체 사용량 요약 통계 조회
 *     tags: [Admin - Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 요약 통계
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SummaryStats'
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const summary = await statsRepository.getSummaryStats();
    const upgradeStats = getUpgradeStats();

    res.json({
      ...summary,
      upgradeStats,
    });
  } catch (error) {
    console.error('Get summary stats error:', error);
    res.status(500).json({ message: '통계 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/stats/models:
 *   get:
 *     summary: 모델별 통계
 *     description: 모델별 사용량 통계
 *     tags: [Admin - Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 모델별 통계
 */
router.get('/stats/models', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await statsRepository.getModelUsageStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(stats);
  } catch (error) {
    console.error('Get model stats error:', error);
    res.status(500).json({ message: '모델 통계 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/stats/levels:
 *   get:
 *     summary: 수준별 통계
 *     description: 학습 수준별 사용량 통계
 *     tags: [Admin - Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 수준별 통계
 */
router.get('/stats/levels', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await statsRepository.getLevelUsageStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(stats);
  } catch (error) {
    console.error('Get level stats error:', error);
    res.status(500).json({ message: '수준별 통계 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/stats/daily:
 *   get:
 *     summary: 일별 통계
 *     description: 일별 사용량 통계
 *     tags: [Admin - Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 조회할 일수
 *     responses:
 *       200:
 *         description: 일별 통계
 */
router.get('/stats/daily', async (req, res) => {
  try {
    const { days } = req.query;
    const stats = await statsRepository.getDailyUsageStats(
      days ? parseInt(days as string) : 30
    );

    res.json(stats);
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({ message: '일별 통계 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/stats/users:
 *   get:
 *     summary: 사용자별 통계
 *     description: 사용자별 사용량 통계
 *     tags: [Admin - Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: 사용자별 통계
 */
router.get('/stats/users', async (req, res) => {
  try {
    const { classId, limit } = req.query;

    const stats = await statsRepository.getUserUsageStats(
      classId as string | undefined,
      limit ? parseInt(limit as string) : 50
    );

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: '사용자 통계 조회 중 오류가 발생했습니다' });
  }
});

// ==================== Model Configuration API ====================

/**
 * @swagger
 * /admin/models:
 *   get:
 *     summary: 사용 가능한 모델 목록
 *     description: 설정 가능한 AI 모델 목록
 *     tags: [Admin - Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모델 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   provider:
 *                     type: string
 *                   modelName:
 *                     type: string
 *                   displayName:
 *                     type: string
 *                   description:
 *                     type: string
 *                   costTier:
 *                     type: string
 */
router.get('/models', async (req, res) => {
  try {
    res.json(modelConfigRepository.AVAILABLE_MODELS);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ message: '모델 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/models/config:
 *   get:
 *     summary: 모델 설정 조회
 *     description: 수준별 모델 설정 조회 (API 키는 마스킹됨)
 *     tags: [Admin - Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모델 설정 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ModelConfig'
 */
router.get('/models/config', async (req, res) => {
  try {
    const configs = await modelConfigRepository.findAllMasked();
    res.json(configs);
  } catch (error) {
    console.error('Get model config error:', error);
    res.status(500).json({ message: '모델 설정 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/models/config/{level}:
 *   put:
 *     summary: 모델 설정 변경
 *     description: 특정 수준의 모델 설정 변경 (관리자 전용)
 *     tags: [Admin - Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *           enum: [beginner_zero, beginner, beginner_plus]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [azure-openai]
 *               modelName:
 *                 type: string
 *               endpoint:
 *                 type: string
 *                 description: Azure 엔드포인트 URL
 *               apiKey:
 *                 type: string
 *                 description: API 키
 *               apiVersion:
 *                 type: string
 *                 description: API 버전
 *     responses:
 *       200:
 *         description: 설정 변경 성공
 *       400:
 *         description: 잘못된 수준 또는 제공자
 *       404:
 *         description: 설정을 찾을 수 없음
 */
router.put('/models/config/:level', requireRole('admin'), async (req, res) => {
  try {
    const { level } = req.params;
    const { provider, modelName, endpoint, apiKey, apiVersion } = req.body;
    const userId = (req.user as { id: string })?.id;

    const validLevels: LearnerLevel[] = ['beginner_zero', 'beginner', 'beginner_plus'];
    if (!validLevels.includes(level as LearnerLevel)) {
      return res.status(400).json({ message: '유효하지 않은 수준입니다' });
    }

    // Build update input - only include fields that are provided
    const updateInput: {
      provider?: ModelProvider;
      modelName?: string;
      endpoint?: string;
      apiKey?: string;
      apiVersion?: string;
      updatedBy?: string;
    } = { updatedBy: userId };

    if (provider !== undefined) {
      const validProviders: ModelProvider[] = ['azure-openai'];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: '유효하지 않은 제공자입니다' });
      }
      updateInput.provider = provider;
    }

    if (modelName !== undefined) {
      updateInput.modelName = modelName;
    }

    if (endpoint !== undefined) {
      updateInput.endpoint = endpoint;
    }

    if (apiKey !== undefined) {
      updateInput.apiKey = apiKey;
    }

    if (apiVersion !== undefined) {
      updateInput.apiVersion = apiVersion;
    }

    // At least one field must be provided
    if (Object.keys(updateInput).length <= 1) {
      return res.status(400).json({ message: '업데이트할 필드가 없습니다' });
    }

    const updated = await modelConfigRepository.update(level as LearnerLevel, updateInput);

    if (!updated) {
      return res.status(404).json({ message: '모델 설정을 찾을 수 없습니다' });
    }

    // Refresh the cached config
    const configMap = await modelConfigRepository.getConfigMap();
    setCachedConfig(configMap);

    // Return masked response
    res.json({
      message: '모델 설정이 업데이트되었습니다',
      config: {
        ...updated,
        api_key_masked: modelConfigRepository.maskApiKey(updated.api_key),
      },
    });
  } catch (error) {
    console.error('Update model config error:', error);
    res.status(500).json({ message: '모델 설정 업데이트 중 오류가 발생했습니다' });
  }
});

// ==================== Learning Progress API ====================

/**
 * @swagger
 * /admin/progress/class/{classId}:
 *   get:
 *     summary: 반별 학생 진도 현황
 *     description: 특정 반의 모든 학생 학습 진도 조회
 *     tags: [Admin - Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 학생 진도 현황
 */
router.get('/progress/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;

    // 반 정보 확인
    const classInfo = await classRepository.findById(classId);
    if (!classInfo) {
      return res.status(404).json({ message: '반을 찾을 수 없습니다' });
    }

    // 학생 목록과 기본 진도 정보
    const students = await learningProgressRepository.getStudentsWithProgress(classId);

    // 트랙별 상세 진도
    const trackProgress = await learningProgressRepository.getClassProgress(classId);

    // 학생별로 그룹화
    const studentMap = new Map<string, {
      userId: string;
      userName: string;
      email: string;
      level: string;
      enrolledTracks: number;
      totalCompleted: number;
      lastActivityAt: Date | null;
      tracks: {
        language: string;
        trackId: string;
        progressPercent: number;
        completedTopics: number;
        totalTopics: number;
        lastActivityAt: Date | null;
      }[];
    }>();

    // 학생 기본 정보 설정
    for (const student of students) {
      studentMap.set(student.userId, {
        ...student,
        tracks: [],
      });
    }

    // 트랙 진도 추가
    for (const progress of trackProgress) {
      const student = studentMap.get(progress.userId);
      if (student) {
        student.tracks.push({
          language: progress.language,
          trackId: progress.trackId,
          progressPercent: progress.progressPercent,
          completedTopics: progress.completedTopics,
          totalTopics: progress.totalTopics,
          lastActivityAt: progress.lastActivityAt,
        });
      }
    }

    res.json({
      class: {
        id: classInfo.id,
        name: classInfo.name,
      },
      students: Array.from(studentMap.values()),
    });
  } catch (error) {
    console.error('Get class progress error:', error);
    res.status(500).json({ message: '진도 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/progress/class/{classId}/track/{language}/{trackId}:
 *   get:
 *     summary: 트랙별 학생 상세 진도
 *     description: 특정 트랙의 학생별 토픽 진도 상세 조회
 *     tags: [Admin - Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: 트랙별 상세 진도
 */
router.get('/progress/class/:classId/track/:language/:trackId', async (req, res) => {
  try {
    const { classId, language, trackId } = req.params;

    // 반 정보 확인
    const classInfo = await classRepository.findById(classId);
    if (!classInfo) {
      return res.status(404).json({ message: '반을 찾을 수 없습니다' });
    }

    // 학생별 토픽 진도 상세
    const progressDetail = await learningProgressRepository.getTrackProgressDetail(
      classId,
      language,
      trackId
    );

    // 학생별로 그룹화
    const studentMap = new Map<string, {
      userId: string;
      userName: string;
      topics: {
        topicId: string;
        status: string;
        practiceCount: number;
        correctCount: number;
        accuracy: number;
        lastPracticedAt: Date | null;
        completedAt: Date | null;
      }[];
    }>();

    for (const progress of progressDetail) {
      if (!studentMap.has(progress.userId)) {
        studentMap.set(progress.userId, {
          userId: progress.userId,
          userName: progress.userName,
          topics: [],
        });
      }

      const student = studentMap.get(progress.userId)!;
      student.topics.push({
        topicId: progress.topicId,
        status: progress.status,
        practiceCount: progress.practiceCount,
        correctCount: progress.correctCount,
        accuracy: progress.practiceCount > 0
          ? Math.round((progress.correctCount / progress.practiceCount) * 100)
          : 0,
        lastPracticedAt: progress.lastPracticedAt,
        completedAt: progress.completedAt,
      });
    }

    res.json({
      class: {
        id: classInfo.id,
        name: classInfo.name,
      },
      language,
      trackId,
      students: Array.from(studentMap.values()),
    });
  } catch (error) {
    console.error('Get track progress detail error:', error);
    res.status(500).json({ message: '트랙 진도 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/progress/student/{userId}:
 *   get:
 *     summary: 개별 학생 진도 상세
 *     description: 특정 학생의 전체 학습 진도 상세 조회
 *     tags: [Admin - Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 학생 진도 상세
 */
router.get('/progress/student/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 사용자 정보 확인
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    // 등록된 트랙 목록
    const { userTrackEnrollmentRepository } = await import('../db/repositories/learningProgressRepository.js');
    const enrollments = await userTrackEnrollmentRepository.findByUser(userId);

    // 각 트랙별 진도 상세
    const tracksWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await learningProgressRepository.findByUserAndTrack(
          userId,
          enrollment.language,
          enrollment.track_id
        );

        const completedCount = progress.filter(p => p.status === 'completed').length;
        const inProgressCount = progress.filter(p => p.status === 'in_progress').length;

        return {
          language: enrollment.language,
          trackId: enrollment.track_id,
          currentTopicId: enrollment.current_topic_id,
          progressPercent: enrollment.progress_percent,
          enrolledAt: enrollment.enrolled_at,
          lastActivityAt: enrollment.last_activity_at,
          stats: {
            completed: completedCount,
            inProgress: inProgressCount,
            notStarted: progress.length - completedCount - inProgressCount,
            total: progress.length,
          },
          topics: progress.map(p => ({
            topicId: p.topic_id,
            status: p.status,
            practiceCount: p.practice_count,
            correctCount: p.correct_count,
            accuracy: p.practice_count > 0
              ? Math.round((p.correct_count / p.practice_count) * 100)
              : 0,
            completedAt: p.completed_at,
          })),
        };
      })
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
      },
      tracks: tracksWithProgress,
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ message: '학생 진도 조회 중 오류가 발생했습니다' });
  }
});

// ==================== Question Bank API ====================

/**
 * @swagger
 * /admin/question-bank/stats/{language}/{trackId}:
 *   get:
 *     summary: 토픽별 문제 은행 현황
 *     description: 특정 트랙의 토픽별 문제 개수 조회
 *     tags: [Admin - Question Bank]
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
 *         description: 토픽별 문제 현황
 */
router.get('/question-bank/stats/:language/:trackId', async (req, res) => {
  try {
    const { language, trackId } = req.params;

    const stats = await questionBankRepository.getStatsByTopic(language, trackId);

    // 커리큘럼에서 토픽 이름 가져오기
    const allTopics = await curriculumService.getAllTopicsInTrack(language, trackId);

    const statsWithNames = stats.map((s) => {
      const topicInfo = allTopics.find((t) => t.topicId === s.topic_id);
      return {
        ...s,
        topic_name: topicInfo?.topicName || s.topic_id,
      };
    });

    // 문제가 없는 토픽도 포함
    const existingTopicIds = new Set(stats.map((s) => s.topic_id));

    for (const topicInfo of allTopics) {
      if (!existingTopicIds.has(topicInfo.topicId)) {
        statsWithNames.push({
          language,
          track_id: trackId,
          topic_id: topicInfo.topicId,
          topic_name: topicInfo.topicName,
          easy_count: 0,
          medium_count: 0,
          hard_count: 0,
          total_count: 0,
          pending_count: 0,
          approved_count: 0,
        });
      }
    }

    // 토픽 순서대로 정렬
    const topicOrder = new Map(allTopics.map((t) => [t.topicId, t.order]));
    statsWithNames.sort((a, b) => {
      const orderA = topicOrder.get(a.topic_id) ?? 999;
      const orderB = topicOrder.get(b.topic_id) ?? 999;
      return orderA - orderB;
    });

    res.json(statsWithNames);
  } catch (error) {
    console.error('Get question bank stats error:', error);
    res.status(500).json({ message: '문제 은행 현황 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/{language}/{trackId}/{topicId}:
 *   get:
 *     summary: 토픽별 문제 목록
 *     description: 특정 토픽의 문제 목록 조회
 *     tags: [Admin - Question Bank]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: 문제 목록
 */
router.get('/question-bank/:language/:trackId/:topicId', async (req, res) => {
  try {
    const { language, trackId, topicId } = req.params;
    const { status, difficulty } = req.query;

    const questions = await questionBankRepository.findByTopic(
      language,
      trackId,
      topicId,
      {
        status: status as 'pending' | 'approved' | 'rejected' | undefined,
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | undefined,
      }
    );

    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: '문제 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/generate:
 *   post:
 *     summary: 문제 생성 작업 시작
 *     description: 백그라운드에서 LLM을 사용해 문제 생성
 *     tags: [Admin - Question Bank]
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
 *               - topicName
 *             properties:
 *               language:
 *                 type: string
 *               trackId:
 *                 type: string
 *               topicId:
 *                 type: string
 *               topicName:
 *                 type: string
 *               difficultyConfig:
 *                 type: object
 *                 properties:
 *                   easy:
 *                     type: number
 *                     default: 3
 *                   medium:
 *                     type: number
 *                     default: 3
 *                   hard:
 *                     type: number
 *                     default: 2
 *     responses:
 *       201:
 *         description: 생성 작업 시작됨
 */
router.post('/question-bank/generate', async (req, res) => {
  try {
    const { language, trackId, topicId, topicName, difficultyConfig } = req.body;
    const userId = (req.user as { id: string })?.id;

    if (!language || !trackId || !topicId || !topicName) {
      return res.status(400).json({ message: 'language, trackId, topicId, topicName은 필수입니다' });
    }

    const config = difficultyConfig || { easy: 3, medium: 3, hard: 2 };

    const job = await questionGenerationJobRepository.create({
      language,
      trackId,
      topicId,
      topicName,
      difficultyConfig: config,
      createdBy: userId,
    });

    // 백그라운드에서 문제 생성 시작 (이벤트 발생)
    // 실제 생성은 별도 서비스에서 처리
    process.nextTick(() => {
      import('../services/questionGenerator.js').then(({ processGenerationJob }) => {
        processGenerationJob(job.id).catch(err => {
          console.error('Question generation error:', err);
        });
      });
    });

    res.status(201).json({
      message: '문제 생성 작업이 시작되었습니다',
      job,
    });
  } catch (error) {
    console.error('Create generation job error:', error);
    res.status(500).json({ message: '문제 생성 작업 시작 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/jobs:
 *   get:
 *     summary: 문제 생성 작업 목록
 *     description: 현재 사용자의 문제 생성 작업 목록 조회
 *     tags: [Admin - Question Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 작업 목록
 */
router.get('/question-bank/jobs', async (req, res) => {
  try {
    const userId = (req.user as { id: string })?.id;
    const jobs = await questionGenerationJobRepository.findByUser(userId);
    res.json(jobs);
  } catch (error) {
    console.error('Get generation jobs error:', error);
    res.status(500).json({ message: '작업 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/jobs/{id}:
 *   get:
 *     summary: 문제 생성 작업 상태 조회
 *     description: 특정 작업의 상태 조회
 *     tags: [Admin - Question Bank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 작업 상태
 */
router.get('/question-bank/jobs/:id', async (req, res) => {
  try {
    const job = await questionGenerationJobRepository.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: '작업을 찾을 수 없습니다' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get generation job error:', error);
    res.status(500).json({ message: '작업 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/{id}/status:
 *   put:
 *     summary: 문제 상태 변경
 *     description: 문제 승인/거부
 *     tags: [Admin - Question Bank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 */
router.put('/question-bank/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = (req.user as { id: string })?.id;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status는 approved 또는 rejected여야 합니다' });
    }

    const updated = await questionBankRepository.updateStatus(req.params.id, status, userId);
    if (!updated) {
      return res.status(404).json({ message: '문제를 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update question status error:', error);
    res.status(500).json({ message: '문제 상태 변경 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/{id}:
 *   put:
 *     summary: 문제 수정
 *     description: 문제 내용 수정
 *     tags: [Admin - Question Bank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               testCases:
 *                 type: array
 *               sampleAnswer:
 *                 type: string
 *               points:
 *                 type: number
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: 수정 성공
 */
router.put('/question-bank/:id', async (req, res) => {
  try {
    const { title, description, requirements, testCases, sampleAnswer, points, difficulty } = req.body;

    const updated = await questionBankRepository.update(req.params.id, {
      title,
      description,
      requirements,
      testCases,
      sampleAnswer,
      points,
      difficulty,
    });

    if (!updated) {
      return res.status(404).json({ message: '문제를 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: '문제 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/{id}:
 *   delete:
 *     summary: 문제 삭제
 *     description: 문제 삭제
 *     tags: [Admin - Question Bank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/question-bank/:id', async (req, res) => {
  try {
    const deleted = await questionBankRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: '문제를 찾을 수 없습니다' });
    }

    res.json({ message: '문제가 삭제되었습니다' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: '문제 삭제 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/question-bank/bulk-approve:
 *   post:
 *     summary: 문제 일괄 승인
 *     description: 여러 문제를 한번에 승인
 *     tags: [Admin - Question Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionIds
 *             properties:
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 일괄 승인 성공
 */
router.post('/question-bank/bulk-approve', async (req, res) => {
  try {
    const { questionIds } = req.body;
    const userId = (req.user as { id: string })?.id;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'questionIds 배열이 필요합니다' });
    }

    const results = await Promise.all(
      questionIds.map(id => questionBankRepository.updateStatus(id, 'approved', userId))
    );

    const successCount = results.filter(Boolean).length;
    res.json({
      message: `${successCount}개의 문제가 승인되었습니다`,
      successCount,
      totalRequested: questionIds.length,
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ message: '일괄 승인 중 오류가 발생했습니다' });
  }
});

// ==================== Curriculum Management API ====================

/**
 * @swagger
 * /admin/curriculum/languages:
 *   get:
 *     summary: 커리큘럼 언어 목록 조회
 *     description: 모든 프로그래밍 언어 목록 조회
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 언어 목록
 */
router.get('/curriculum/languages', async (req, res) => {
  try {
    const languages = await curriculumRepository.getAllLanguages();
    res.json(languages);
  } catch (error) {
    console.error('Get curriculum languages error:', error);
    res.status(500).json({ message: '언어 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/{language}/full:
 *   get:
 *     summary: 언어별 전체 커리큘럼 조회
 *     description: 특정 언어의 트랙, 스테이지, 토픽, 개념 전체 조회
 *     tags: [Admin - Curriculum]
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
 *         description: 전체 커리큘럼
 */
router.get('/curriculum/:language/full', async (req, res) => {
  try {
    const { language } = req.params;

    const exists = await curriculumRepository.validateLanguageExists(language);
    if (!exists) {
      return res.status(404).json({ message: '언어를 찾을 수 없습니다' });
    }

    const tracks = await curriculumRepository.getFullCurriculum(language);
    res.json(tracks);
  } catch (error) {
    console.error('Get full curriculum error:', error);
    res.status(500).json({ message: '커리큘럼 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/concepts:
 *   post:
 *     summary: 개념 생성
 *     description: 새로운 개념 추가
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - name
 *             properties:
 *               topicId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               examples:
 *                 type: array
 *                 items:
 *                   type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: 개념 생성 성공
 */
router.post('/curriculum/concepts', requireRole('admin'), async (req, res) => {
  try {
    const { topicId, name, description, examples, keywords, displayOrder } = req.body;

    if (!topicId || !name) {
      return res.status(400).json({ message: 'topicId와 name은 필수입니다' });
    }

    // 토픽 존재 여부 확인
    const topicExists = await curriculumRepository.validateTopicExists(topicId);
    if (!topicExists) {
      return res.status(404).json({ message: '토픽을 찾을 수 없습니다' });
    }

    const concept = await curriculumRepository.createConcept({
      id: uuidv4(),
      topic_id: topicId,
      name,
      description,
      examples,
      keywords,
      display_order: displayOrder ?? 0,
    });

    res.status(201).json(concept);
  } catch (error) {
    console.error('Create concept error:', error);
    res.status(500).json({ message: '개념 생성 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/concepts/{id}:
 *   put:
 *     summary: 개념 수정
 *     description: 개념 정보 수정
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               examples:
 *                 type: array
 *                 items:
 *                   type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 성공
 */
router.put('/curriculum/concepts/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, examples, keywords, displayOrder } = req.body;

    const updated = await curriculumRepository.updateConcept(id, {
      name,
      description,
      examples,
      keywords,
      display_order: displayOrder,
    });

    if (!updated) {
      return res.status(404).json({ message: '개념을 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update concept error:', error);
    res.status(500).json({ message: '개념 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/concepts/{id}:
 *   delete:
 *     summary: 개념 삭제
 *     description: 개념 삭제
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/curriculum/concepts/:id', requireRole('admin'), async (req, res) => {
  try {
    const deleted = await curriculumRepository.deleteConcept(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: '개념을 찾을 수 없습니다' });
    }

    res.json({ message: '개념이 삭제되었습니다' });
  } catch (error) {
    console.error('Delete concept error:', error);
    res.status(500).json({ message: '개념 삭제 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/topics:
 *   post:
 *     summary: 토픽 생성
 *     description: 새로운 토픽 추가
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stageId
 *               - name
 *             properties:
 *               stageId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: 토픽 생성 성공
 */
router.post('/curriculum/topics', requireRole('admin'), async (req, res) => {
  try {
    const { stageId, name, description, displayOrder } = req.body;

    if (!stageId || !name) {
      return res.status(400).json({ message: 'stageId와 name은 필수입니다' });
    }

    // 스테이지 존재 여부 확인
    const stage = await curriculumRepository.getStageById(stageId);
    if (!stage) {
      return res.status(404).json({ message: '스테이지를 찾을 수 없습니다' });
    }

    const topic = await curriculumRepository.createTopic({
      id: uuidv4(),
      stage_id: stageId,
      name,
      description,
      display_order: displayOrder ?? 0,
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: '토픽 생성 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/topics/{id}:
 *   put:
 *     summary: 토픽 수정
 *     description: 토픽 정보 수정
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 성공
 */
router.put('/curriculum/topics/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    const updated = await curriculumRepository.updateTopic(id, {
      name,
      description,
      display_order: displayOrder,
    });

    if (!updated) {
      return res.status(404).json({ message: '토픽을 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: '토픽 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/topics/{id}:
 *   delete:
 *     summary: 토픽 삭제
 *     description: 토픽 및 하위 개념 모두 삭제
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/curriculum/topics/:id', requireRole('admin'), async (req, res) => {
  try {
    const deleted = await curriculumRepository.deleteTopic(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: '토픽을 찾을 수 없습니다' });
    }

    res.json({ message: '토픽이 삭제되었습니다' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: '토픽 삭제 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/stages:
 *   post:
 *     summary: 스테이지 생성
 *     description: 새로운 스테이지 추가
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackId
 *               - name
 *             properties:
 *               trackId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: 스테이지 생성 성공
 */
router.post('/curriculum/stages', requireRole('admin'), async (req, res) => {
  try {
    const { trackId, name, description, displayOrder } = req.body;

    if (!trackId || !name) {
      return res.status(400).json({ message: 'trackId와 name은 필수입니다' });
    }

    // 트랙 존재 여부 확인
    const trackExists = await curriculumRepository.validateTrackExists(trackId);
    if (!trackExists) {
      return res.status(404).json({ message: '트랙을 찾을 수 없습니다' });
    }

    const stage = await curriculumRepository.createStage({
      id: uuidv4(),
      track_id: trackId,
      name,
      description,
      display_order: displayOrder ?? 0,
    });

    res.status(201).json(stage);
  } catch (error) {
    console.error('Create stage error:', error);
    res.status(500).json({ message: '스테이지 생성 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/stages/{id}:
 *   put:
 *     summary: 스테이지 수정
 *     description: 스테이지 정보 수정
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 성공
 */
router.put('/curriculum/stages/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    const updated = await curriculumRepository.updateStage(id, {
      name,
      description,
      display_order: displayOrder,
    });

    if (!updated) {
      return res.status(404).json({ message: '스테이지를 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ message: '스테이지 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/stages/{id}:
 *   delete:
 *     summary: 스테이지 삭제
 *     description: 스테이지 및 하위 토픽, 개념 모두 삭제
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
router.delete('/curriculum/stages/:id', requireRole('admin'), async (req, res) => {
  try {
    const deleted = await curriculumRepository.deleteStage(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: '스테이지를 찾을 수 없습니다' });
    }

    res.json({ message: '스테이지가 삭제되었습니다' });
  } catch (error) {
    console.error('Delete stage error:', error);
    res.status(500).json({ message: '스테이지 삭제 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /admin/curriculum/tracks/{id}:
 *   put:
 *     summary: 트랙 수정
 *     description: 트랙 정보 수정
 *     tags: [Admin - Curriculum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               targetLevel:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *               estimatedHours:
 *                 type: number
 *               displayOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 성공
 */
router.put('/curriculum/tracks/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, targetLevel, estimatedHours, displayOrder } = req.body;

    const updated = await curriculumRepository.updateTrack(id, {
      name,
      description,
      target_level: targetLevel,
      estimated_hours: estimatedHours,
      display_order: displayOrder,
    });

    if (!updated) {
      return res.status(404).json({ message: '트랙을 찾을 수 없습니다' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ message: '트랙 수정 중 오류가 발생했습니다' });
  }
});

export default router;
