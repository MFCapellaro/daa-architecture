import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SecurityContextFactory } from "@runtime/security/src/SecurityContextFactory.js";
import type { ActorSecurityContext } from "@security/ActorSecurity.js";

declare global {
  namespace Express {
    interface Request {
      securityContext?: ActorSecurityContext;
    }
  }
}

export const createAuthMiddleware = (jwtSecret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.securityContext = SecurityContextFactory.createAnonymous();
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        participantId: string;
        roles?: string[];
        permissions?: string[];
      };

      req.securityContext = SecurityContextFactory.createFromPayload({
        actorId: decoded.participantId,
        roles: decoded.roles,
        permissions: decoded.permissions,
        isAuthenticated: true,
      });

      next();
    } catch {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
};