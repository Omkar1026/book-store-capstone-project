export interface BookCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Publisher {
  id: string;
  name: string;
  country: string;
  website: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisherId: string;
  categoryId: string;
  price: number;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  description: string;
  isbn: string;
  publishedDate: string;
  tags: string[];
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  rating: number;
  categoryId: string;
}
