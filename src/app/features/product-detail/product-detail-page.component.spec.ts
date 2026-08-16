import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ProductDetailPageComponent } from './product-detail-page.component';
import { CartStore } from '../../core/store/cart.store';
import { ToastStore } from '../../core/store/toast.store';
import { Book } from '../../core/models/book.model';

const mockBook: Book = {
  id: 'b1',
  title: 'Test Book',
  author: 'Author',
  publisherId: 'p1',
  categoryId: 'c1',
  price: 9.99,
  stock: 5,
  imageUrl: '',
  rating: 4.5,
  reviewCount: 10,
  description: 'A test book',
  isbn: '1234567890',
  publishedDate: '2024-01-01',
  tags: []
};

describe('ProductDetailPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const mockCartStore = {
      cart: signal(null),
      items: signal([]),
      itemCount: signal(0),
      isLoading: signal(false),
      error: signal(null),
      addItem: jasmine.createSpy('addItem')
    };

    const mockToastStore = {
      toasts: signal([]),
      add: jasmine.createSpy('add'),
      remove: jasmine.createSpy('remove'),
      clear: jasmine.createSpy('clear')
    };

    TestBed.configureTestingModule({
      imports: [ProductDetailPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CartStore, useValue: mockCartStore },
        { provide: ToastStore, useValue: mockToastStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'b1' } }
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
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads book on ngOnInit', () => {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.componentInstance.ngOnInit();

    const req = httpMock.expectOne('/api/books/b1');
    req.flush(mockBook);

    expect(fixture.componentInstance.book()).toEqual(mockBook);
    expect(fixture.componentInstance.isLoading()).toBeFalse();

    // additional dependent requests
    httpMock.expectOne('/api/categories').flush([]);
    httpMock.expectOne('/api/publishers').flush([]);
    httpMock.expectOne(r => r.url.includes('/api/books') && r.params.has('categoryId')).flush([]);
    httpMock.expectOne(r => r.url.includes('/api/reviews')).flush([]);
    httpMock.expectOne(r => r.url === '/api/delivery/estimate').flush({ estimatedDate: '2024-01-10', days: 5 });
  });

  it('onAddToCart calls cartStore.addItem', () => {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;
    component.book.set(mockBook);

    component.onAddToCart();
    const cartStore = TestBed.inject(CartStore) as any;
    expect(cartStore.addItem).toHaveBeenCalled();
  });

  it('onAddToCart does nothing when book is out of stock', () => {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;
    component.book.set({ ...mockBook, stock: 0 });

    component.onAddToCart();
    const cartStore = TestBed.inject(CartStore) as any;
    expect(cartStore.addItem).not.toHaveBeenCalled();
  });
});
