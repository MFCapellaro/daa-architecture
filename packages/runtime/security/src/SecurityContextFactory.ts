import type { ActorSecurityContext } from "@security/ActorSecurity.js";

export interface IncomingSecurityHeaders {
  authorization?: string;
  "x-actor-id"?: string;
  "x-actor-roles"?: string | string[];
  "x-actor-permissions"?: string | string[];
}

export class SecurityContextFactory {
  /**
   * Crea un ActorSecurityContext anónimo / no autenticado por defecto.
   */
  static createAnonymous(): ActorSecurityContext {
    return {
      isAuthenticated: false,
      actorId: "",
      roles: [],
      permissions: [],
    };
  }

  /**
   * Construye un ActorSecurityContext desde un objeto de carga útil verificado (ej. JWT verificado).
   */
  static createFromPayload(payload: {
    actorId: string;
    roles?: string[];
    permissions?: string[];
    isAuthenticated?: boolean;
  }): ActorSecurityContext {
    return {
      isAuthenticated: payload.isAuthenticated ?? true,
      actorId: payload.actorId,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  }

  /**
   * Extrae los datos de seguridad desde headers HTTP estandarizados.
   */
  static createFromHeaders(headers: IncomingSecurityHeaders): ActorSecurityContext {
    const actorId = headers["x-actor-id"];
    
    if (!actorId) {
      return this.createAnonymous();
    }

    const parseHeaderList = (val?: string | string[]): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(",").map((s) => s.trim());
    };

    return {
      isAuthenticated: Boolean(headers.authorization || actorId),
      actorId,
      roles: parseHeaderList(headers["x-actor-roles"]),
      permissions: parseHeaderList(headers["x-actor-permissions"]),
    };
  }
}