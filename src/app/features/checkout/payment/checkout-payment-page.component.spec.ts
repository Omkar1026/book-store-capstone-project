import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { CheckoutPaymentPageComponent } from './checkout-payment-page.component';
import { AuthStore } from '../../../core/store/auth.store';
import { CheckoutStore } from '../../../core/store/checkout.store';
import { CartStore } from '../../../core/store/cart.store';
import { GiftPointsStore } from '../../../core/store/gift-points.store';
import { Address } from '../../../core/models/address.model';
import { User } from '../../../core/models/user.model';

const mockAddress: Address = {
  id: 'addr1', userId: 'u1', name: 'John', line1: '1 Main St',
  city: 'NY', state: 'NY', postcode: '10001', country: 'US', isDefault: true
};

const mockUser: User = {
  id: 'u1', email: 'test@example.com', name: 'Test', addresses: [],
  giftPointsBalance: 0, orderHistory: [], createdAt: ''
};

describe('CheckoutPaymentPageComponent', () => {
  let httpMock: HttpTestingController;
  let mockCheckoutStore: any;
  let mockGiftPointsStore: any;
  let mockAuthStore: any;
  let mockCartStore: any;

  function setup(checkoutOverrides: Partial<any> = {}, authOverrides: Partial<any> = {}) {
    mockCheckoutStore = {
      selectedAddress: signal(mockAddress),
      paymentMethod: signal(null),
      giftPointsToRedeem: signal(0),
      placedOrder: signal(null),
      isLoading: signal(false),
      error: signal(null),
      setPaymentMethod: jasmine.createSpy('setPaymentMethod'),
      setGiftPoints: jasmine.createSpy('setGiftPoints'),
      reset: jasmine.createSpy('reset'),
      ...checkoutOverrides
    };

    mockGiftPointsStore = {
      balance: signal(200),
      pendingRedemption: signal(0),
      isLoading: signal(false),
      error: signal(null),
      loadBalance: jasmine.createSpy('loadBalance'),
      setRedemption: jasmine.createSpy('setRedemption')
    };

    mockAuthStore = {
      currentUser: signal(mockUser),
      isAuthenticated: signal(true),
      isLoading: signal(false),
      error: signal(null),
      hydrate: jasmine.createSpy('hydrate'),
      ...authOverrides
    };

    mockCartStore = {
      cart: signal(null), items: signal([]),
      itemCount: signal(0), totalPrice: signal(40),
      isLoading: signal(false), error: signal(null)
    };

    TestBed.configureTestingModule({
      imports: [CheckoutPaymentPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: CheckoutStore, useValue: mockCheckoutStore },
        { provide: CartStore, useValue: mockCartStore },
        { provide: GiftPointsStore, useValue: mockGiftPointsStore }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads gift points balance on ngOnInit when user exists', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockGiftPointsStore.loadBalance).toHaveBeenCalledWith('u1');
  });

  it('redirects to /checkout/address when no address selected', () => {
    setup({ selectedAddress: signal(null) });
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.componentInstance.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/checkout/address']);
    expect(mockGiftPointsStore.loadBalance).not.toHaveBeenCalled();
  });

  it('does not load gift points when user is null', () => {
    setup({}, { currentUser: signal(null) });
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockGiftPointsStore.loadBalance).not.toHaveBeenCalled();
  });

  it('onSelectMethod updates selectedMethodId and calls setPaymentMethod', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    fixture.componentInstance.onSelectMethod('pm-card');
    expect(fixture.componentInstance.selectedMethodId()).toBe('pm-card');
    expect(mockCheckoutStore.setPaymentMethod).toHaveBeenCalled();
  });

  it('onSelectMethod does nothing when method id is not found', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    fixture.componentInstance.onSelectMethod('nonexistent');
    expect(mockCheckoutStore.setPaymentMethod).not.toHaveBeenCalled();
  });

  it('onRedeem delegates to giftPointsStore and checkoutStore', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    fixture.componentInstance.onRedeem(100);
    expect(mockGiftPointsStore.setRedemption).toHaveBeenCalledWith(100);
    expect(mockCheckoutStore.setGiftPoints).toHaveBeenCalledWith(100);
  });

  it('goBack navigates to /checkout/address', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.componentInstance.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/checkout/address']);
  });

  describe('onPlaceOrder()', () => {
    it('sets isProcessing and navigates to confirmation after delay', fakeAsync(() => {
      setup();
      const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.onPlaceOrder();
      expect(fixture.componentInstance.isProcessing()).toBeTrue();
      tick(1500);
      expect(fixture.componentInstance.isProcessing()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/checkout/confirmation']);
    }));

    it('does nothing when no method is selected', () => {
      setup();
      const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
      fixture.componentInstance.selectedMethodId.set(null);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.onPlaceOrder();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('does nothing when already processing', fakeAsync(() => {
      setup();
      const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.isProcessing.set(true);
      fixture.componentInstance.onPlaceOrder();
      tick(2000);
      // navigate should only have been called once (from the first call), not again
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  it('orderSummary has no shipping when subtotal >= 35', () => {
    setup();
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    const summary = fixture.componentInstance.orderSummary();
    expect(summary.shipping).toBe(0);
  });

  it('orderSummary applies gift points discount', () => {
    setup();
    mockGiftPointsStore.pendingRedemption.set(500); // 500 pts = £5 off
    const fixture = TestBed.createComponent(CheckoutPaymentPageComponent);
    const summary = fixture.componentInstance.orderSummary();
    expect(summary.giftPointsDiscount).toBeCloseTo(5, 2);
    expect(summary.total).toBeCloseTo(35, 2); // 40 - 5
  });
});
