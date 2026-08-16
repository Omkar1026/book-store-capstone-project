import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderStore } from './order.store';
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

describe('OrderStore', () => {
  let store: InstanceType<typeof OrderStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(OrderStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('has correct initial state', () => {
    expect(store.orders()).toEqual([]);
    expect(store.selectedOrder()).toBeNull();
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  describe('loadOrders()', () => {
    it('sets orders on success', () => {
      store.loadOrders('u1');
      const req = httpMock.expectOne('/api/orders?userId=u1');
      req.flush([mockOrder]);
      expect(store.orders()).toEqual([mockOrder]);
    });

    it('sets error on failure', () => {
      store.loadOrders('u1');
      const req = httpMock.expectOne('/api/orders?userId=u1');
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
      expect(store.error()).toBe('Forbidden');
    });
  });

  describe('loadOrder()', () => {
    it('sets selectedOrder when found in orders list', () => {
      store.loadOrders('u1');
      httpMock.expectOne('/api/orders?userId=u1').flush([mockOrder]);
      store.loadOrder('ord1');
      expect(store.selectedOrder()).toEqual(mockOrder);
    });

    it('sets selectedOrder to null when not found', () => {
      store.loadOrder('nonexistent');
      expect(store.selectedOrder()).toBeNull();
    });
  });

  describe('placeOrder()', () => {
    it('adds created order to orders list and sets selectedOrder', () => {
      store.placeOrder(mockOrder);
      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      req.flush(mockOrder);
      expect(store.orders().length).toBe(1);
      expect(store.selectedOrder()).toEqual(mockOrder);
    });

    it('sets error on failure', () => {
      store.placeOrder(mockOrder);
      httpMock.expectOne('/api/orders').flush(
        { message: 'Failed' }, { status: 500, statusText: 'Error' }
      );
      expect(store.error()).toBe('Failed');
    });
  });

  describe('cancelOrder()', () => {
    it('updates order status to cancelled', () => {
      store.loadOrders('u1');
      httpMock.expectOne('/api/orders?userId=u1').flush([mockOrder]);

      store.cancelOrder('ord1');
      const req = httpMock.expectOne('/api/orders/ord1');
      req.flush({ ...mockOrder, status: 'cancelled' });

      expect(store.orders()[0].status).toBe('cancelled');
    });

    it('also updates selectedOrder if it is the cancelled order', () => {
      store.loadOrders('u1');
      httpMock.expectOne('/api/orders?userId=u1').flush([mockOrder]);
      store.loadOrder('ord1');

      store.cancelOrder('ord1');
      httpMock.expectOne('/api/orders/ord1').flush({ ...mockOrder, status: 'cancelled' });

      expect(store.selectedOrder()!.status).toBe('cancelled');
    });
  });
});
