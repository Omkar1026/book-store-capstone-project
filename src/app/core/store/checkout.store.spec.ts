import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CheckoutStore } from './checkout.store';
import { Address } from '../models/address.model';
import { PaymentMethod } from '../models/payment.model';
import { Order } from '../models/order.model';

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

const mockMethod: PaymentMethod = {
  id: 'pm1',
  userId: 'u1',
  type: 'credit_card',
  last4: '4242',
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

describe('CheckoutStore', () => {
  let store: InstanceType<typeof CheckoutStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(CheckoutStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('has correct initial state', () => {
    expect(store.selectedAddress()).toBeNull();
    expect(store.paymentMethod()).toBeNull();
    expect(store.giftPointsToRedeem()).toBe(0);
    expect(store.placedOrder()).toBeNull();
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  describe('setAddress()', () => {
    it('sets the selected address', () => {
      store.setAddress(mockAddress);
      expect(store.selectedAddress()).toEqual(mockAddress);
    });
  });

  describe('setPaymentMethod()', () => {
    it('sets the payment method', () => {
      store.setPaymentMethod(mockMethod);
      expect(store.paymentMethod()).toEqual(mockMethod);
    });
  });

  describe('setGiftPoints()', () => {
    it('sets gift points to redeem', () => {
      store.setGiftPoints(100);
      expect(store.giftPointsToRedeem()).toBe(100);
    });
  });

  describe('submitOrder()', () => {
    it('sets placedOrder on success', () => {
      store.submitOrder(mockOrder);
      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      req.flush(mockOrder);
      expect(store.placedOrder()).toEqual(mockOrder);
      expect(store.isLoading()).toBeFalse();
    });

    it('sets error on failure', () => {
      store.submitOrder(mockOrder);
      httpMock.expectOne('/api/orders').flush(
        { message: 'Failed' }, { status: 500, statusText: 'Error' }
      );
      expect(store.error()).toBe('Failed');
    });
  });

  describe('reset()', () => {
    it('resets state to initial', () => {
      store.setAddress(mockAddress);
      store.setPaymentMethod(mockMethod);
      store.setGiftPoints(50);
      store.reset();
      expect(store.selectedAddress()).toBeNull();
      expect(store.paymentMethod()).toBeNull();
      expect(store.giftPointsToRedeem()).toBe(0);
    });
  });
});
