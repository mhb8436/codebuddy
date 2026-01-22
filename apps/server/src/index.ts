import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

import { testConnection } from './db/index.js';
import { passport } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import codeRoutes from './routes/code.js';
import adminRoutes from './routes/admin.js';
import agentRoutes from './routes/agent/index.js';
import curriculumRoutes from './routes/curriculum.js';
import { modelConfigRepository } from './db/repositories/index.js';
import { setCachedConfig } from './config/modelByLevel.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CodeBuddy API Docs',
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 서버 상태 확인
 *     description: 서버 및 데이터베이스 연결 상태 확인
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 상태
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 */
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection().catch(() => false);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/curriculum', curriculumRoutes);

async function loadModelConfig() {
  try {
    const configMap = await modelConfigRepository.getConfigMap();
    setCachedConfig(configMap);
    console.log('Model configuration loaded from database');
  } catch (error) {
    console.warn('Failed to load model config from DB, using defaults:', error);
  }
}

async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('Warning: Database connection failed. Some features may not work.');
  } else {
    await loadModelConfig();
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
