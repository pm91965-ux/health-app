import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import pool from '../../../src/lib/db';
import { generateToken } from '../../../src/lib/auth';

export default async function register(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );

    const userId = result.rows[0].id;
    const token = generateToken(userId);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation code for PostgreSQL
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
