import { query } from '../index.js';

export interface ClassRow {
  id: string;
  name: string;
  invite_code: string;
  max_students: number;
  created_at: Date;
  expires_at: Date | null;
}

export interface ClassWithStudentCount extends ClassRow {
  student_count: number;
}

export async function findById(id: string): Promise<ClassRow | null> {
  const result = await query<ClassRow>(
    'SELECT * FROM classes WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findByInviteCode(inviteCode: string): Promise<ClassRow | null> {
  const result = await query<ClassRow>(
    'SELECT * FROM classes WHERE invite_code = $1',
    [inviteCode]
  );
  return result.rows[0] || null;
}

export async function findAll(): Promise<ClassWithStudentCount[]> {
  const result = await query<ClassWithStudentCount>(`
    SELECT c.*, COUNT(u.id)::int as student_count
    FROM classes c
    LEFT JOIN users u ON u.class_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  return result.rows;
}

export async function create(data: {
  name: string;
  inviteCode: string;
  maxStudents?: number;
  expiresAt?: Date;
}): Promise<ClassRow> {
  const result = await query<ClassRow>(
    `INSERT INTO classes (name, invite_code, max_students, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.inviteCode, data.maxStudents || 20, data.expiresAt || null]
  );
  return result.rows[0];
}

export async function update(
  id: string,
  data: { name?: string; maxStudents?: number; expiresAt?: Date }
): Promise<ClassRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.maxStudents !== undefined) {
    sets.push(`max_students = $${paramIndex++}`);
    values.push(data.maxStudents);
  }
  if (data.expiresAt !== undefined) {
    sets.push(`expires_at = $${paramIndex++}`);
    values.push(data.expiresAt);
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  const result = await query<ClassRow>(
    `UPDATE classes SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function updateInviteCode(id: string, newCode: string): Promise<ClassRow | null> {
  const result = await query<ClassRow>(
    'UPDATE classes SET invite_code = $1 WHERE id = $2 RETURNING *',
    [newCode, id]
  );
  return result.rows[0] || null;
}

export async function deleteById(id: string): Promise<boolean> {
  const result = await query('DELETE FROM classes WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getStudentCount(id: string): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM users WHERE class_id = $1',
    [id]
  );
  return parseInt(result.rows[0].count, 10);
}
