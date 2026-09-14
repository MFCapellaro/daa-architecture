import type { PoolFormationIdentity } from "./PoolFormationIdentity.js";
import type { DealerPoolAccessGuard } from "../../../../runtime/security/src/DealerPoolAccessGuard.js";
import type { SecurityContext } from "../../../../security/src/SecurityContext.js";

export interface PoolFormationRepository {
  findById(id: string): Promise<PoolFormationIdentity | null>;
  save(pool: PoolFormationIdentity): Promise<void>;
}

export interface CreatePoolParams {
  poolOfferId: string;
  targetUnits: number;
  participantIds?: string[];
}

export interface EditPoolParams {
  targetUnits?: number;
  currentUnits?: number;
  status?: "forming" | "completed" | "expired";
}

export class PoolFormationService {
  constructor(
    private readonly repository: PoolFormationRepository,
    private readonly dealerPoolAccessGuard: DealerPoolAccessGuard
  ) {}

  async createPool(
    context: SecurityContext,
    actorId: string,
    params: CreatePoolParams
  ): Promise<PoolFormationIdentity> {
    await this.dealerPoolAccessGuard.authorizePoolEdit(context, actorId);

    const pool: PoolFormationIdentity = {
      id: crypto.randomUUID(),
      poolOfferId: params.poolOfferId,
      participantIds: params.participantIds ?? [],
      targetUnits: params.targetUnits,
      currentUnits: 0,
      status: "forming",
    };

    await this.repository.save(pool);
    return pool;
  }

  async editPool(
    context: SecurityContext,
    actorId: string,
    poolId: string,
    params: EditPoolParams
  ): Promise<PoolFormationIdentity> {
    await this.dealerPoolAccessGuard.authorizePoolEdit(context, actorId);

    const pool = await this.repository.findById(poolId);
    if (!pool) {
      throw new Error(`Pool formation ${poolId} not found`);
    }

    const updatedPool: PoolFormationIdentity = {
      ...pool,
      targetUnits: params.targetUnits ?? pool.targetUnits,
      currentUnits: params.currentUnits ?? pool.currentUnits,
      status: params.status ?? pool.status,
    };

    await this.repository.save(updatedPool);
    return updatedPool;
  }

  async manageOffer(
    context: SecurityContext,
    actorId: string,
    poolId: string,
    poolOfferId: string
  ): Promise<PoolFormationIdentity> {
    await this.dealerPoolAccessGuard.authorizePoolEdit(context, actorId);

    const pool = await this.repository.findById(poolId);
    if (!pool) {
      throw new Error(`Pool formation ${poolId} not found`);
    }

    const updatedPool: PoolFormationIdentity = {
      ...pool,
      poolOfferId,
    };

    await this.repository.save(updatedPool);
    return updatedPool;
  }
}
