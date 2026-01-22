import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CodeBuddy API',
      version: '1.0.0',
      description: 'AI-Driven Programming Education System API',
      contact: {
        name: 'CodeBuddy Team',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['student', 'instructor', 'admin'] },
            level: { type: 'string', enum: ['beginner_zero', 'beginner', 'beginner_plus'] },
            class_id: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            invite_code: { type: 'string' },
            max_students: { type: 'integer' },
            expires_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ChatSession: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            session_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['user', 'assistant'] },
            content: { type: 'string' },
            model_used: { type: 'string', nullable: true },
            tokens_used: { type: 'integer', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ModelConfig: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            level: { type: 'string', enum: ['beginner_zero', 'beginner', 'beginner_plus'] },
            provider: { type: 'string', enum: ['azure-openai'] },
            model_name: { type: 'string' },
            endpoint: { type: 'string', nullable: true },
            api_key_masked: { type: 'string', nullable: true },
            api_version: { type: 'string', nullable: true },
            is_active: { type: 'boolean' },
            updated_at: { type: 'string', format: 'date-time' },
            updated_by: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        SummaryStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalSessions: { type: 'integer' },
            totalMessages: { type: 'integer' },
            totalTokens: { type: 'integer' },
            estimatedCost: { type: 'number' },
            todayMessages: { type: 'integer' },
            todayTokens: { type: 'integer' },
            upgradeStats: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                upgraded: { type: 'integer' },
                reasons: { type: 'object', additionalProperties: { type: 'integer' } },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Chat', description: 'Chat and messaging endpoints' },
      { name: 'Code', description: 'Code execution endpoints' },
      { name: 'Admin - Classes', description: 'Class management (Admin/Instructor)' },
      { name: 'Admin - Users', description: 'User management (Admin only)' },
      { name: 'Admin - Stats', description: 'Statistics (Admin/Instructor)' },
      { name: 'Admin - Models', description: 'Model configuration (Admin only)' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
