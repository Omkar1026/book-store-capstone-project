import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { CheckoutConfirmationPageComponent } from './checkout-confirmation-page.component';
import { AuthStore } from '../../../core/store/auth.store';
import { CheckoutStore } from '../../../core/store/checkout.store';
import { CartStore } from '../../../core/store/cart.store';
import { OrderStore } from '../../../core/store/order.store';
import { GiftPointsStore } from '../../../core/store/gift-points.store';
import { Address } from '../../../core/models/address.model';
import { PaymentMethod } from '../../../core/models/payment.model';
import { User } from '../../../core/models/user.model';

const mockAddress: Address = {
  id: 'addr1', userId: 'u1', name: 'John', line1: '1 Main St',
  city: 'NY', state: 'NY', postcode: '10001', country: 'US', isDefault: true
};

const mockMethod: PaymentMethod = {
  id: 'pm1', userId: 'u1', type: 'credit_card', last4: '4242', isDefault: true
};

const mockUser: User = {
  id: 'u1', email: 'test@example.com', name: 'Test', addresses: [],
  giftPointsBalance: 0, orderHistory: [], createdAt: ''
};

describe('CheckoutConfirmationPageComponent', () => {
  let httpMock: HttpTestingController;
  let mockOrderStore: any;
  let mockCheckoutStore: any;
  let mockCartStore: any;

  beforeEach(() => {
    mockCheckoutStore = {
      selectedAddress: signal(mockAddress),
      paymentMethod: signal(mockMethod),
      giftPointsToRedeem: signal(0),
      placedOrder: signal(null),
      isLoading: signal(false),
      error: signal(null),
      reset: jasmine.createSpy('reset'),
      setAddress: jasmine.createSpy('setAddress'),
      setPaymentMethod: jasmine.createSpy('setPaymentMethod')
    };

    mockOrderStore = {
      orders: signal([]),
      selectedOrder: signal(null),
      isLoading: signal(false),
      error: signal(null),
      placeOrder: jasmine.createSpy('placeOrder'),
      loadOrders: jasmine.createSpy('loadOrders')
    };

    mockCartStore = {
      cart: signal(null), items: signal([]),
      itemCount: signal(0), totalPrice: signal(20),
      isLoading: signal(false), error: signal(null),
      clearCart: jasmine.createSpy('clearCart'),
      updateQty: jasmine.createSpy('updateQty'),
      removeItem: jasmine.createSpy('removeItem')
    };

    const mockAuthStore = {
      currentUser: signal(mockUser),
      isAuthenticated: signal(true),
      isLoading: signal(false),
      error: signal(null),
      hydrate: jasmine.createSpy('hydrate')
    };

    const mockGiftPointsStore = {
      balance: signal(0), pendingRedemption: signal(0),
      isLoading: signal(false), error: signal(null),
      loadBalance: jasmine.createSpy('loadBalance')
    };

    TestBed.configureTestingModule({
      imports: [CheckoutConfirmationPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: CheckoutStore, useValue: mockCheckoutStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: OrderStore, useValue: mockOrderStore },
        { provide: GiftPointsStore, useValue: mockGiftPointsStore }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CheckoutConfirmationPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('places order and clears cart on ngOnInit', () => {
    const fixture = TestBed.createComponent(CheckoutConfirmationPageComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockOrderStore.placeOrder).toHaveBeenCalled();
    expect(mockCartStore.clearCart).toHaveBeenCalled();
    expect(mockCheckoutStore.reset).toHaveBeenCalled();
  });

  it('orderError computed reflects orderStore.error()', () => {
    const fixture = TestBed.createComponent(CheckoutConfirmationPageComponent);
    mockOrderStore.error.set('Something failed');
    expect(fixture.componentInstance.orderError()).toBe('Something failed');
  });
});
