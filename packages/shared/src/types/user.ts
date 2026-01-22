export type UserRole = 'student' | 'instructor' | 'admin';
export type LearnerLevel = 'beginner_zero' | 'beginner' | 'beginner_plus';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  level: LearnerLevel;
  classId?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserWithClass extends User {
  class?: {
    id: string;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserWithClass;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}
