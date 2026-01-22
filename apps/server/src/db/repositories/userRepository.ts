import { query } from '../index.js';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  class_id: string | null;
  level: string;
  created_at: Date;
  last_login_at: Date | null;
}

export interface UserWithClass extends UserRow {
  class_name: string | null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findByIdWithClass(id: string): Promise<UserWithClass | null> {
  const result = await query<UserWithClass>(`
    SELECT u.*, c.name as class_name
    FROM users u
    LEFT JOIN classes c ON u.class_id = c.id
    WHERE u.id = $1
  `, [id]);
  return result.rows[0] || null;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findByClassId(classId: string): Promise<UserRow[]> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE class_id = $1 ORDER BY created_at DESC',
    [classId]
  );
  return result.rows;
}

export async function create(data: {
  email: string;
  passwordHash: string;
  name: string;
  classId?: string;
  role?: string;
  level?: string;
}): Promise<UserRow> {
  const result = await query<UserRow>(
    `INSERT INTO users (email, password_hash, name, class_id, role, level)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.email,
      data.passwordHash,
      data.name,
      data.classId || null,
      data.role || 'student',
      data.level || 'beginner',
    ]
  );
  return result.rows[0];
}

export async function updateLastLogin(id: string): Promise<void> {
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [id]
  );
}

export async function updateLevel(id: string, level: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    'UPDATE users SET level = $1 WHERE id = $2 RETURNING *',
    [level, id]
  );
  return result.rows[0] || null;
}

export async function update(
  id: string,
  data: { name?: string; email?: string; level?: string; role?: string }
): Promise<UserRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    sets.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.level !== undefined) {
    sets.push(`level = $${paramIndex++}`);
    values.push(data.level);
  }
  if (data.role !== undefined) {
    sets.push(`role = $${paramIndex++}`);
    values.push(data.role);
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  const result = await query<UserRow>(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteById(id: string): Promise<boolean> {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
