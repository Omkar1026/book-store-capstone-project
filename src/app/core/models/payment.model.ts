export type PaymentMethodType = 'credit_card' | 'debit_card' | 'paypal' | 'gift_card';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentMethodId: string;
  giftPointsToRedeem?: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  processedAt: string;
}
