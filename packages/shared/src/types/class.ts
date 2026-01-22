export interface Class {
  id: string;
  name: string;
  inviteCode: string;
  maxStudents: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ClassWithStudents extends Class {
  studentCount: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    level: string;
  }>;
}

export interface CreateClassRequest {
  name: string;
  maxStudents?: number;
  expiresInDays?: number;
}
