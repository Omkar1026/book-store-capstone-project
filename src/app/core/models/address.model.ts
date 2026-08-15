export interface Address {
  id: string;
  userId: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}
