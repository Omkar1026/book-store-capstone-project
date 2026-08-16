import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Cart } from '../models/cart.model';

const mockCart: Cart = {
  id: 'cart1',
  userId: 'u1',
  items: [],
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCartByUserId()', () => {
    it('GETs /api/carts?userId=u1', () => {
      service.getCartByUserId('u1').subscribe(carts => {
        expect(carts).toEqual([mockCart]);
      });
      const req = httpMock.expectOne('/api/carts?userId=u1');
      expect(req.request.method).toBe('GET');
      req.flush([mockCart]);
    });
  });

  describe('createCart()', () => {
    it('POSTs to /api/carts', () => {
      service.createCart(mockCart).subscribe(cart => {
        expect(cart).toEqual(mockCart);
      });
      const req = httpMock.expectOne('/api/carts');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCart);
      req.flush(mockCart);
    });
  });

  describe('updateCart()', () => {
    it('PATCHes /api/carts/:id', () => {
      const patch = { items: [] };
      service.updateCart('cart1', patch).subscribe(cart => {
        expect(cart).toEqual(mockCart);
      });
      const req = httpMock.expectOne('/api/carts/cart1');
      expect(req.request.method).toBe('PATCH');
      req.flush(mockCart);
    });
  });

  describe('deleteCart()', () => {
    it('DELETEs /api/carts/:id', () => {
      service.deleteCart('cart1').subscribe();
      const req = httpMock.expectOne('/api/carts/cart1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
