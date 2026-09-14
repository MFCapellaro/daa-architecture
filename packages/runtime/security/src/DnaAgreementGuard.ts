export interface DnaAgreementRepository {
  hasActiveAgreement(actorId: string): Promise<boolean>;
}

export class DnaAgreementGuard {
  constructor(private readonly dnaRepo: DnaAgreementRepository) {}

  async hasActiveAgreement(actorId: string): Promise<boolean> {
    return await this.dnaRepo.hasActiveAgreement(actorId);
  }
}
