export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
