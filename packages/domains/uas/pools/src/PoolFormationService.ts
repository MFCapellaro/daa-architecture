import type { PoolFormationIdentity } from "./PoolFormationIdentity.js";
import type { ActorSecurityContext } from "@security/ActorSecurity.js";
import type { DealerPoolAccessGuard } from "@runtime/security/src/DealerPoolAccessGuard.js";

export interface PoolFormationRepository {
  findById(id: string): Promise<PoolFormationIdentity | null>;
  save(pool: PoolFormationIdentity): Promise<void>;
}

export interface CreatePoolParams {
  id?: string;
  poolOfferId: string;
  targetUnits: number;
  participantIds?: string[];
}

export interface EditPoolParams {
  targetUnits?: number;
  participantIds?: string[];
}

export class PoolFormationService {
  constructor(
    private readonly repository: PoolFormationRepository,
    private readonly accessGuard: DealerPoolAccessGuard
  ) {}

  async createPool(
    params: CreatePoolParams,
    context: ActorSecurityContext
  ): Promise<PoolFormationIdentity> {
    if (!this.accessGuard.canCreate(context)) {
      throw new Error("Unauthorized to create pool");
    }

    const newPool: PoolFormationIdentity = {
      id: params.id ?? params.poolOfferId,
      poolOfferId: params.poolOfferId,
      targetUnits: params.targetUnits,
      currentUnits: 0,
      status: "forming",
      participantIds: params.participantIds ?? [],
    };

    await this.repository.save(newPool);
    return newPool;
  }

  async editPool(
    id: string,
    params: EditPoolParams,
    context: ActorSecurityContext
  ): Promise<PoolFormationIdentity> {
    const pool = await this.repository.findById(id);

    if (!pool) {
      throw new Error(`Pool formation identity not found with id ${id}`);
    }

    if (!this.accessGuard.canEdit(context, pool)) {
      throw new Error("Unauthorized to edit pool");
    }

    if (params.targetUnits !== undefined) {
      pool.targetUnits = params.targetUnits;
    }

    if (params.participantIds !== undefined) {
      pool.participantIds = params.participantIds;
    }

    await this.repository.save(pool);
    return pool;
  }

  async getPool(id: string, context: ActorSecurityContext): Promise<PoolFormationIdentity> {
    const pool = await this.repository.findById(id);

    if (!pool) {
      throw new Error(`Pool formation identity not found with id ${id}`);
    }

    if (!this.accessGuard.canRead(context, pool)) {
      throw new Error("Unauthorized to read pool");
    }

    return pool;
  }
}