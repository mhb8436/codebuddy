import { Router } from 'express';
import bcrypt from 'bcrypt';
import { userRepository, classRepository } from '../db/repositories/index.js';
import { signToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 초대 코드를 사용하여 새 사용자 등록
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, inviteCode]
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일 주소
 *                 example: hong@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: 비밀번호 (8자 이상)
 *               inviteCode:
 *                 type: string
 *                 description: 반 초대 코드
 *                 example: K7X2P9
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     class:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *       400:
 *         description: 잘못된 요청 (유효성 검사 실패, 만료된 코드, 정원 초과)
 *       409:
 *         description: 이미 사용 중인 이메일
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    // Validate required fields
    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({
        message: '모든 필드를 입력해주세요 (이름, 이메일, 비밀번호, 초대코드)',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '유효한 이메일 주소를 입력해주세요' });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다' });
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다' });
    }

    // Validate invite code
    const classInfo = await classRepository.findByInviteCode(inviteCode.toUpperCase());
    if (!classInfo) {
      return res.status(400).json({ message: '유효하지 않은 초대 코드입니다' });
    }

    // Check expiration
    if (classInfo.expires_at && new Date(classInfo.expires_at) < new Date()) {
      return res.status(400).json({ message: '만료된 초대 코드입니다' });
    }

    // Check class capacity
    const studentCount = await classRepository.getStudentCount(classInfo.id);
    if (studentCount >= classInfo.max_students) {
      return res.status(400).json({ message: '정원이 마감되었습니다' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      classId: classInfo.id,
      role: 'student',
      level: 'beginner',
    });

    res.status(201).json({
      message: '회원가입이 완료되었습니다',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        class: {
          id: classInfo.id,
          name: classInfo.name,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일과 비밀번호로 로그인하여 JWT 토큰 발급
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hong@example.com
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT 액세스 토큰
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요' });
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Get class info
    let classInfo = null;
    if (user.class_id) {
      const cls = await classRepository.findById(user.class_id);
      if (cls) {
        classInfo = { id: cls.id, name: cls.name };
      }
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        class: classInfo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 현재 세션 로그아웃 (클라이언트에서 토큰 삭제)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그아웃되었습니다
 *       401:
 *         description: 인증 필요
 */
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless, so logout is handled client-side by removing the token
  // This endpoint can be used for logging or blacklisting tokens in the future
  res.json({ message: '로그아웃되었습니다' });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 현재 사용자 정보
 *     description: 로그인한 사용자의 정보 조회
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 필요
 */
router.get('/me', authenticate, (req, res) => {
  const user = req.user!;

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level,
    class: user.classId
      ? { id: user.classId, name: user.className }
      : null,
  });
});

/**
 * @swagger
 * /auth/level:
 *   put:
 *     summary: 학습 수준 변경
 *     description: 현재 사용자의 학습 수준 업데이트
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [level]
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [beginner_zero, beginner, beginner_plus]
 *                 description: 학습 수준
 *     responses:
 *       200:
 *         description: 수준 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 level:
 *                   type: string
 *       400:
 *         description: 잘못된 수준 값
 *       401:
 *         description: 인증 필요
 */
router.put('/level', authenticate, async (req, res) => {
  try {
    const { level } = req.body;
    const validLevels = ['beginner_zero', 'beginner', 'beginner_plus'];

    if (!level || !validLevels.includes(level)) {
      return res.status(400).json({
        message: '유효한 수준을 선택해주세요 (beginner_zero, beginner, beginner_plus)',
      });
    }

    const updated = await userRepository.updateLevel(req.user!.id, level);

    if (!updated) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    res.json({
      message: '학습 수준이 업데이트되었습니다',
      level: updated.level,
    });
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({ message: '수준 업데이트 중 오류가 발생했습니다' });
  }
});

export default router;
