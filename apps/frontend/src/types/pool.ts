export type PoolStatus = 'active' | 'complete' | 'expired';

export interface PoolInput {
  product: string;
  brand: string;
  model: string;
  description: string;
  targetQuantity: number;
  unitPrice: number;
  discountedUnitPrice: number;
  city: string;
  province: string;
  paymentConditions: string;
  warranty: string;
  validUntil: string;
  training: string;
  afterSales: string;
  deliveryAvailability: string;
  restrictions: string;
  images: string[];
}

export interface PoolMember {
  participantId: string;
  name: string;
  email: string;
  quantity: number;
  joinedAt: string;
}

export interface Pool extends PoolInput {
  id: string;
  dealer: { id: string; name: string; email?: string };
  visible: boolean;
  status: PoolStatus;
  members?: PoolMember[];
  joinedQuantity?: number;
  remainingQuantity?: number;
  participantCount?: number;
  joinedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface PoolNotification {
  id: string;
  poolId: string;
  product: string;
  status: 'complete' | 'expired';
  closedAt?: string;
  message: string;
  similarPools: Array<Pick<Pool, 'id' | 'product' | 'brand' | 'city' | 'province' | 'validUntil'>>;
}

export const EMPTY_POOL: PoolInput = {
  product: '',
  brand: '',
  model: '',
  description: '',
  targetQuantity: 3,
  unitPrice: 0,
  discountedUnitPrice: 0,
  city: '',
  province: '',
  paymentConditions: '',
  warranty: '',
  validUntil: '',
  training: '',
  afterSales: '',
  deliveryAvailability: '',
  restrictions: '',
  images: [],
};
