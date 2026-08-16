import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogueStore } from './catalogue.store';
import { Book } from '../models/book.model';

const mockBook: Book = {
  id: 'b1',
  title: 'Angular Book',
  author: 'Author',
  publisherId: 'p1',
  categoryId: 'c1',
  price: 15,
  stock: 3,
  imageUrl: '',
  rating: 4,
  reviewCount: 5,
  description: 'Desc',
  isbn: '123',
  publishedDate: '2024-01-01',
  tags: []
};

describe('CatalogueStore', () => {
  let store: InstanceType<typeof CatalogueStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogueStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(CatalogueStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('has correct initial state', () => {
    expect(store.books()).toEqual([]);
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.page()).toBe(1);
    expect(store.pageSize()).toBe(12);
    expect(store.sortOption()).toBe('relevance');
  });

  describe('loadBooks()', () => {
    it('sets books on success', () => {
      store.loadBooks();
      const req = httpMock.expectOne(r => r.url === '/api/books');
      req.flush([mockBook]);
      expect(store.books()).toEqual([mockBook]);
      expect(store.isLoading()).toBeFalse();
    });

    it('sets error on failure', () => {
      store.loadBooks();
      const req = httpMock.expectOne(r => r.url === '/api/books');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
      expect(store.error()).toBe('Not found');
    });
  });

  describe('setFilter()', () => {
    it('updates filter and resets page to 1', () => {
      store.setPage(3);
      store.setFilter({ query: 'angular' });
      expect(store.filter().query).toBe('angular');
      expect(store.page()).toBe(1);
    });
  });

  describe('setSort()', () => {
    it('updates sortOption and resets page to 1', () => {
      store.setPage(2);
      store.setSort('price_asc');
      expect(store.sortOption()).toBe('price_asc');
      expect(store.page()).toBe(1);
    });
  });

  describe('setPage()', () => {
    it('updates page', () => {
      store.setPage(5);
      expect(store.page()).toBe(5);
    });
  });

  describe('filteredBooks computed', () => {
    beforeEach(() => {
      store.loadBooks();
      httpMock.expectOne(r => r.url === '/api/books').flush([
        { ...mockBook, price: 10, rating: 3.5, stock: 2 },
        { ...mockBook, id: 'b2', price: 25, rating: 4.8, stock: 0 }
      ]);
    });

    it('filters by minPrice', () => {
      store.setFilter({ minPrice: 20 });
      expect(store.filteredBooks().length).toBe(1);
      expect(store.filteredBooks()[0].id).toBe('b2');
    });

    it('filters by maxPrice', () => {
      store.setFilter({ maxPrice: 15 });
      expect(store.filteredBooks().length).toBe(1);
    });

    it('filters by minRating', () => {
      store.setFilter({ minRating: 4.5 });
      expect(store.filteredBooks().length).toBe(1);
      expect(store.filteredBooks()[0].id).toBe('b2');
    });

    it('filters inStockOnly', () => {
      store.setFilter({ inStockOnly: true });
      expect(store.filteredBooks().length).toBe(1);
    });
  });
});
