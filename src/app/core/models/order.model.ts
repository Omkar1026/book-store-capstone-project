import type { Address } from './address.model';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface DeliveryInfo {
  estimatedDate: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  placedAt: string;
  deliveryAddress: Address;
  paymentMethod: string;
  giftPointsUsed: number;
  totalAmount: number;
  deliveryInfo: DeliveryInfo;
}
