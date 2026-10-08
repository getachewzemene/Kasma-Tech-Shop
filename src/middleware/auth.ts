import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthUser } from '../lib/jwt.ts';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// 1. Core Authentication Middleware (Bearer JWT / Firebase)
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // 1. Try verifying via standard JWT
  const jwtUser = verifyToken(token);
  if (jwtUser) {
    req.user = jwtUser;
    next();
    return;
  }

  // 2. Fallback to Firebase ID Token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'User'),
      role: (decodedToken as any).role || 'customer',
    };
    next();
    return;
  } catch (error) {
    // Both JWT and Firebase token verification failed
    res.status(401).json({ error: 'Unauthorized: Invalid, expired, or untrusted authentication token' });
    return;
  }
};

// 2. Role Guard: Administrator Only
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const runAdminCheck = () => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden: Access denied. System Administrator role is required for this operation.',
      });
      return;
    }
    next();
  };

  if (req.user) {
    runAdminCheck();
    return;
  }

  await requireAuth(req, res, runAdminCheck);
};

// 3. Role Guard: Merchant (or Administrator)
export const requireMerchant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const runMerchantCheck = () => {
    if (!req.user || (req.user.role !== 'merchant' && req.user.role !== 'admin')) {
      res.status(403).json({
        error: 'Forbidden: Access denied. Verified Merchant or Administrator role is required.',
      });
      return;
    }
    next();
  };

  if (req.user) {
    runMerchantCheck();
    return;
  }

  await requireAuth(req, res, runMerchantCheck);
};
