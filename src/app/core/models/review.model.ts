export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: Rating;
  title: string;
  body: string;
  createdAt: string;
  helpfulCount: number;
}
