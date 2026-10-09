import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';

export type UserRole = 'admin' | 'dealer' | 'participante';

export const requireAuth = (allowedRoles?: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso denegado: Usuario no autenticado' });
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Acceso restringido. Requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        });
      }
    }

    next();
  };
};