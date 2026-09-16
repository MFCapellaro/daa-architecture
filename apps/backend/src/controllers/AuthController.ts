import { Router, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { ParticipantRepository } from "@domains/uas/participants/src/ParticipantRepository.js";

export class AuthController {
  public router: Router;

  constructor(
    private participantRepo: ParticipantRepository,
    private jwtSecret: string,
    private expiresIn: SignOptions["expiresIn"] = "8h"
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/login", this.login.bind(this));
    this.router.get("/me", this.me.bind(this));
  }

  private async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    if (!this.participantRepo.findByEmail) {
        return res.status(500).json({ error: "El repositorio configurado no soporta búsqueda por email" });
    }

    const participant = await this.participantRepo.findByEmail(email);
    if (!participant) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, participant.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const options: SignOptions = { expiresIn: this.expiresIn };

    const token = jwt.sign(
      {
        participantId: participant.id,
        roles: participant.roles ?? [],
        permissions: participant.permissions ?? [],
      },
      this.jwtSecret,
      options
    );

    return res.json({
      token,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        roles: participant.roles,
      },
    });
  }

  private me(req: Request, res: Response) {
    if (!req.securityContext?.isAuthenticated) {
      return res.status(401).json({ error: "No autenticado" });
    }

    return res.json({
      context: req.securityContext,
    });
  }
}