export interface GiftPointsBalance {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

export interface GiftPointsRedemption {
  userId: string;
  amount: number;
  orderId?: string;
}
