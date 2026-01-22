import { Router } from 'express';
import debugBuddyRouter from './debugBuddy.js';
import codeMentorRouter from './codeMentor.js';
import practiceRouter from './practice.js';
import examRouter from './exam.js';

const router = Router();

// Debug Buddy Agent - 에러 해결 도움
router.use('/', debugBuddyRouter);

// Code Mentor Agent - 코드 리뷰 및 개선점 제안
router.use('/', codeMentorRouter);

// Practice Crafter Agent - 연습 문제 생성 및 채점
router.use('/', practiceRouter);

// Exam Master Agent - 시험 문제 생성 및 채점
router.use('/', examRouter);

export default router;
