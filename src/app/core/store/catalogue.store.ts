import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { BookService, BookSearchParams } from '../services/book.service';
import { Book } from '../models/book.model';
import { CatalogueFilter, SortOption } from '../models/catalogue.model';

interface CatalogueState {
  books: Book[];
  filter: CatalogueFilter;
  page: number;
  pageSize: number;
  totalCount: number;
  sortOption: SortOption;
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogueState = {
  books: [],
  filter: {},
  page: 1,
  pageSize: 12,
  totalCount: 0,
  sortOption: 'relevance',
  isLoading: false,
  error: null
};

function sortOptionToParams(sort: SortOption): Pick<BookSearchParams, '_sort' | '_order'> {
  switch (sort) {
    case 'price_asc':   return { _sort: 'price', _order: 'asc' };
    case 'price_desc':  return { _sort: 'price', _order: 'desc' };
    case 'rating_desc': return { _sort: 'rating', _order: 'desc' };
    case 'newest':      return { _sort: 'publishedDate', _order: 'desc' };
    case 'title_asc':   return { _sort: 'title', _order: 'asc' };
    default:            return {};
  }
}

export const CatalogueStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ books, filter }) => ({
    filteredBooks: computed(() => {
      const f = filter();
      let result = books();
      if (f.minPrice !== undefined) result = result.filter(b => b.price >= f.minPrice!);
      if (f.maxPrice !== undefined) result = result.filter(b => b.price <= f.maxPrice!);
      if (f.minRating !== undefined) result = result.filter(b => b.rating >= f.minRating!);
      if (f.inStockOnly) result = result.filter(b => b.stock > 0);
      return result;
    })
  })),
  withMethods((store, bookService = inject(BookService)) => ({
    loadBooks(): void {
      const f = store.filter();
      const sortParams = sortOptionToParams(store.sortOption());
      const params: BookSearchParams = {
        _page: store.page(),
        _limit: store.pageSize(),
        q: f.query,
        categoryId: f.categoryId,
        publisherId: f.publisherId,
        ...sortParams
      };

      patchState(store, { isLoading: true, error: null });

      bookService.getBooks(params).pipe(
        tap(books => patchState(store, { books, isLoading: false })),
        catchError(err => {
          patchState(store, { isLoading: false, error: err?.error?.message ?? 'Failed to load books' });
          return EMPTY;
        })
      ).subscribe();
    },

    setFilter(filter: CatalogueFilter): void {
      patchState(store, { filter, page: 1 });
    },

    setPage(page: number): void {
      patchState(store, { page });
    },

    setSort(sortOption: SortOption): void {
      patchState(store, { sortOption, page: 1 });
    }
  }))
);
