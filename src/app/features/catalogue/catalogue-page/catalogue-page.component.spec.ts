import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { CataloguePageComponent } from './catalogue-page.component';
import { CatalogueStore } from '../../../core/store/catalogue.store';
import { CartStore } from '../../../core/store/cart.store';
import { Book } from '../../../core/models/book.model';
import { of } from 'rxjs';

const mockBook: Book = {
  id: 'b1', title: 'Test Book', author: 'Author', publisherId: 'p1',
  categoryId: 'c1', price: 15, stock: 3, imageUrl: '', rating: 4,
  reviewCount: 5, description: 'Desc', isbn: '123', publishedDate: '2024-01-01', tags: []
};

describe('CataloguePageComponent', () => {
  let httpMock: HttpTestingController;
  let mockCatalogueStore: any;
  let mockCartStore: any;

  beforeEach(() => {
    mockCatalogueStore = {
      books: signal([]),
      filteredBooks: signal([]),
      filter: signal({}),
      page: signal(1),
      pageSize: signal(12),
      sortOption: signal('relevance'),
      isLoading: signal(false),
      error: signal(null),
      loadBooks: jasmine.createSpy('loadBooks'),
      setFilter: jasmine.createSpy('setFilter'),
      setSort: jasmine.createSpy('setSort'),
      setPage: jasmine.createSpy('setPage')
    };

    mockCartStore = {
      cart: signal(null), items: signal([]), itemCount: signal(0),
      totalPrice: signal(0), isLoading: signal(false), error: signal(null),
      addItem: jasmine.createSpy('addItem')
    };

    TestBed.configureTestingModule({
      imports: [CataloguePageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CatalogueStore, useValue: mockCatalogueStore },
        { provide: CartStore, useValue: mockCartStore },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({ get: () => null, has: () => false }),
            snapshot: { queryParamMap: { get: () => null } }
          }
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CataloguePageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls loadBooks on ngOnInit via queryParam subscription', () => {
    const fixture = TestBed.createComponent(CataloguePageComponent);
    fixture.componentInstance.ngOnInit();
    httpMock.expectOne('/api/categories').flush([]);
    httpMock.expectOne('/api/publishers').flush([]);
    expect(mockCatalogueStore.loadBooks).toHaveBeenCalled();
  });

  it('ngOnDestroy unsubscribes', () => {
    const fixture = TestBed.createComponent(CataloguePageComponent);
    fixture.componentInstance.ngOnInit();
    httpMock.expectOne('/api/categories').flush([]);
    httpMock.expectOne('/api/publishers').flush([]);
    // should not throw
    expect(() => fixture.componentInstance.ngOnDestroy()).not.toThrow();
  });

  it('totalPages returns 1 when no books', () => {
    const fixture = TestBed.createComponent(CataloguePageComponent);
    expect(fixture.componentInstance.totalPages()).toBe(1);
  });

  it('pageNumbers returns array based on totalPages', () => {
    mockCatalogueStore.filteredBooks.set(new Array(36).fill({}));
    mockCatalogueStore.pageSize.set(12);
    const fixture = TestBed.createComponent(CataloguePageComponent);
    expect(fixture.componentInstance.pageNumbers().length).toBe(3);
  });

  describe('onFilterChange()', () => {
    it('calls setFilter, loadBooks and syncQueryParams', () => {
      const fixture = TestBed.createComponent(CataloguePageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.onFilterChange({ categoryId: 'c1', publisherId: null, minPrice: null, maxPrice: null });
      expect(mockCatalogueStore.setFilter).toHaveBeenCalledWith({ categoryId: 'c1', publisherId: undefined, minPrice: undefined, maxPrice: undefined });
      expect(mockCatalogueStore.loadBooks).toHaveBeenCalled();
    });
  });

  describe('onSortChange()', () => {
    it('calls setSort and loadBooks', () => {
      const fixture = TestBed.createComponent(CataloguePageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      const event = { target: { value: 'price_asc' } } as any;
      fixture.componentInstance.onSortChange(event);
      expect(mockCatalogueStore.setSort).toHaveBeenCalledWith('price_asc');
      expect(mockCatalogueStore.loadBooks).toHaveBeenCalled();
    });
  });

  describe('onPageSizeChange()', () => {
    it('resets page to 1 and calls loadBooks', () => {
      const fixture = TestBed.createComponent(CataloguePageComponent);
      const event = { target: { value: '24' } } as any;
      fixture.componentInstance.onPageSizeChange(event);
      expect(mockCatalogueStore.setPage).toHaveBeenCalledWith(1);
      expect(mockCatalogueStore.loadBooks).toHaveBeenCalled();
    });
  });

  describe('onPageChange()', () => {
    it('calls setPage, loadBooks and syncQueryParams', () => {
      const fixture = TestBed.createComponent(CataloguePageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.onPageChange(3);
      expect(mockCatalogueStore.setPage).toHaveBeenCalledWith(3);
      expect(mockCatalogueStore.loadBooks).toHaveBeenCalled();
    });
  });

  describe('onAddToCart()', () => {
    it('calls cartStore.addItem with the book as a CartItem', () => {
      const fixture = TestBed.createComponent(CataloguePageComponent);
      fixture.componentInstance.onAddToCart(mockBook);
      expect(mockCartStore.addItem).toHaveBeenCalledWith(jasmine.objectContaining({ bookId: 'b1', quantity: 1 }));
    });
  });
});
