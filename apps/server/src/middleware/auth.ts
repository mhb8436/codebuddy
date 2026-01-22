import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { userRepository } from '../db/repositories/index.js';
import type { TokenPayload } from '../utils/jwt.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role: string;
      level: string;
      classId: string | null;
      className: string | null;
    }
  }
}

// JWT Strategy options
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

// Configure Passport JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload: TokenPayload, done) => {
    try {
      const user = await userRepository.findByIdWithClass(payload.userId);

      if (!user) {
        return done(null, false);
      }

      return done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        classId: user.class_id,
        className: user.class_name,
      });
    } catch (error) {
      return done(error, false);
    }
  })
);

// Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: Express.User | false) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  })(req, res, next);
}

// Optional authentication (doesn't fail if no token)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: Express.User | false) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}

// Role-based authorization middleware
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}

// Convenience middlewares
export const requireAdmin = [authenticate, requireRole('admin')];
export const requireInstructor = [authenticate, requireRole('admin', 'instructor')];
export const requireStudent = [authenticate, requireRole('admin', 'instructor', 'student')];

export { passport };
