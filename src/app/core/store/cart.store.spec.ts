import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CartStore } from './cart.store';
import { Cart, CartItem } from '../models/cart.model';

const mockCartItem: CartItem = {
  bookId: 'b1',
  title: 'Test Book',
  author: 'Author',
  price: 9.99,
  imageUrl: '',
  quantity: 2,
  stock: 5
};

const mockCart: Cart = {
  id: 'cart1',
  userId: 'u1',
  items: [mockCartItem],
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('CartStore', () => {
  let store: InstanceType<typeof CartStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        CartStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(CartStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should have null cart initially', () => {
    expect(store.cart()).toBeNull();
  });

  it('itemCount is 0 when cart is null', () => {
    expect(store.itemCount()).toBe(0);
  });

  it('totalPrice is 0 when cart is null', () => {
    expect(store.totalPrice()).toBe(0);
  });

  describe('loadCart()', () => {
    it('sets cart from API response', () => {
      store.loadCart('u1');
      const req = httpMock.expectOne('/api/carts?userId=u1');
      req.flush([mockCart]);
      expect(store.cart()).toEqual(mockCart);
      expect(store.isLoading()).toBeFalse();
    });

    it('creates a new cart if none exists for the user', () => {
      store.loadCart('u1');
      const getReq = httpMock.expectOne('/api/carts?userId=u1');
      getReq.flush([]); // no cart found
      const createReq = httpMock.expectOne('/api/carts');
      expect(createReq.request.method).toBe('POST');
      createReq.flush({ id: 'cart-new', userId: 'u1', items: [], updatedAt: '' });
    });

    it('sets error on failure', () => {
      store.loadCart('u1');
      const req = httpMock.expectOne('/api/carts?userId=u1');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Error' });
      expect(store.error()).toBe('Server error');
    });
  });

  describe('addItem()', () => {
    beforeEach(() => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([{ ...mockCart, items: [] }]);
      // flush the patch from loadCart if any
    });

    it('adds a new item to the cart', () => {
      store.addItem(mockCartItem);
      const req = httpMock.expectOne(r => r.url === '/api/carts/cart1' && r.method === 'PATCH');
      req.flush(mockCart);
      expect(store.items().length).toBe(1);
      expect(store.items()[0].bookId).toBe('b1');
    });

    it('updates quantity for an existing item', () => {
      store.addItem(mockCartItem);
      httpMock.expectOne(r => r.url === '/api/carts/cart1').flush(mockCart);

      store.addItem({ ...mockCartItem, quantity: 3 });
      const req = httpMock.expectOne(r => r.url === '/api/carts/cart1');
      req.flush(mockCart);

      expect(store.items()[0].quantity).toBe(5);
    });
  });

  describe('updateQty()', () => {
    it('removes item when quantity is 0', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      store.updateQty('b1', 0);
      const req = httpMock.expectOne(r => r.url === '/api/carts/cart1');
      req.flush(mockCart);
      expect(store.items().length).toBe(0);
    });

    it('updates quantity when > 0', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      store.updateQty('b1', 3);
      const req = httpMock.expectOne(r => r.url === '/api/carts/cart1');
      req.flush(mockCart);
      expect(store.items()[0].quantity).toBe(3);
    });
  });

  describe('removeItem()', () => {
    it('removes the item', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      store.removeItem('b1');
      const req = httpMock.expectOne(r => r.url === '/api/carts/cart1');
      req.flush(mockCart);
      expect(store.items().length).toBe(0);
    });
  });

  describe('clearCart()', () => {
    it('empties the cart items', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      store.clearCart();
      const req = httpMock.expectOne(r => r.url === '/api/carts/cart1');
      req.flush(mockCart);
      expect(store.items().length).toBe(0);
    });
  });

  describe('resetCart()', () => {
    it('resets state to null', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      store.resetCart();
      expect(store.cart()).toBeNull();
      expect(store.isLoading()).toBeFalse();
    });
  });

  describe('computed signals', () => {
    it('itemCount sums quantities', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      expect(store.itemCount()).toBe(2);
    });

    it('totalPrice computes price * quantity', () => {
      store.loadCart('u1');
      httpMock.expectOne('/api/carts?userId=u1').flush([mockCart]);
      expect(store.totalPrice()).toBeCloseTo(19.98, 2);
    });
  });
});
