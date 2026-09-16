import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { dbGet } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'student_portfolio_jwt_secret_key_change_in_production';
const TOKEN_EXPIRY = '7d';

export interface AuthUserPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function generateToken(user: AuthUserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
    return;
  }

  // Ensure user still exists in database
  const user = await dbGet('SELECT id, email, name, role FROM users WHERE id = ?', [payload.id]);
  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  next();
}
