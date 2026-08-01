/**
 * DAA UAS Pool
 * ------------------------------
 * Entity: PoolOffer
 *
 * A PoolOffer represents a structured
 * collective opportunity created by a Supplier.
 *
 * It defines the conditions under which
 * individual demand can become collective value.
 */

export interface PoolOffer {
  id: string;

  supplierId: string;

  title: string;

  description?: string;

  unitPrice: number;

  formationLevels: {
    units: number;
    price: number;
  }[];

  validUntil?: Date;
}