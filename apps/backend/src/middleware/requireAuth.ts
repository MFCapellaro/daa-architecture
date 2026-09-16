import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.securityContext || !req.securityContext.isAuthenticated) {
    return res.status(403).json({ error: "Acceso denegado: requiere autenticación activa" });
  }
  next();
};