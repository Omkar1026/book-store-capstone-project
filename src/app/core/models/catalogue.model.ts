export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'newest'
  | 'title_asc';

export interface CatalogueFilter {
  query?: string;
  categoryId?: string;
  publisherId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface CataloguePage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
