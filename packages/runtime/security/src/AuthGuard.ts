import type { SecurityContext } from "../../../security/src/SecurityContext.js";

export interface TokenValidator {
  validateToken(token: string): Promise<SecurityContext>;
}

export class AuthGuard {
  constructor(private readonly tokenValidator: TokenValidator) {}

  async authenticate(token?: string): Promise<SecurityContext> {
    if (!token) {
      return { isAuthenticated: false };
    }
    try {
      return await this.tokenValidator.validateToken(token);
    } catch {
      return { isAuthenticated: false };
    }
  }

  assertAuthenticated(context: SecurityContext): void {
    if (!context.isAuthenticated || !context.participant) {
      throw new Error("Unauthorized: Participant authentication required.");
    }
  }
}
