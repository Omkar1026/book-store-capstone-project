import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order } from '../models/order.model';
import { Address } from '../models/address.model';

const mockAddress: Address = {
  id: 'addr1',
  userId: 'u1',
  name: 'John',
  line1: '1 Main St',
  city: 'NY',
  state: 'NY',
  postcode: '10001',
  country: 'US',
  isDefault: true
};

const mockOrder: Order = {
  id: 'ord1',
  userId: 'u1',
  items: [],
  status: 'pending',
  placedAt: '2024-01-01T00:00:00Z',
  deliveryAddress: mockAddress,
  paymentMethod: 'credit_card',
  giftPointsUsed: 0,
  totalAmount: 19.99,
  deliveryInfo: { estimatedDate: '2024-01-10' }
};

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrdersByUserId()', () => {
    it('GETs /api/orders?userId=u1', () => {
      service.getOrdersByUserId('u1').subscribe(orders => {
        expect(orders).toEqual([mockOrder]);
      });
      const req = httpMock.expectOne('/api/orders?userId=u1');
      expect(req.request.method).toBe('GET');
      req.flush([mockOrder]);
    });
  });

  describe('createOrder()', () => {
    it('POSTs to /api/orders', () => {
      service.createOrder(mockOrder).subscribe(order => {
        expect(order).toEqual(mockOrder);
      });
      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      req.flush(mockOrder);
    });
  });

  describe('updateOrder()', () => {
    it('PATCHes /api/orders/:id', () => {
      service.updateOrder('ord1', { status: 'shipped' }).subscribe(order => {
        expect(order.status).toBe('shipped');
      });
      const req = httpMock.expectOne('/api/orders/ord1');
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...mockOrder, status: 'shipped' });
    });
  });

  describe('cancelOrder()', () => {
    it('PATCHes /api/orders/:id with status cancelled', () => {
      service.cancelOrder('ord1').subscribe();
      const req = httpMock.expectOne('/api/orders/ord1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'cancelled' });
      req.flush({ ...mockOrder, status: 'cancelled' });
    });
  });
});
