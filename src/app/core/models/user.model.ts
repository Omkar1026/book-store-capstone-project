export interface User {
  id: string;
  email: string;
  name: string;
  addresses: string[]; // Address ids
  giftPointsBalance: number;
  orderHistory: string[]; // Order ids
  createdAt: string;
}

export interface AuthTokens {
  userId: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
