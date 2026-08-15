export interface Recommendation {
  id: string;
  userId: string;
  bookId: string;
  score: number;
  reason: 'trending' | 'similar_purchase' | 'category_match' | 'staff_pick';
  createdAt: string;
}
