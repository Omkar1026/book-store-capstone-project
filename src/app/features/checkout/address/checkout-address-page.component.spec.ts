import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { CheckoutAddressPageComponent } from './checkout-address-page.component';
import { AuthStore } from '../../../core/store/auth.store';
import { CheckoutStore } from '../../../core/store/checkout.store';
import { Address } from '../../../core/models/address.model';
import { User } from '../../../core/models/user.model';

const mockUser: User = {
  id: 'u1', email: 'test@example.com', name: 'Test',
  addresses: [], giftPointsBalance: 0, orderHistory: [], createdAt: ''
};

const mockAddress: Address = {
  id: 'addr1', userId: 'u1', name: 'John', line1: '1 Main St',
  city: 'NY', state: 'NY', postcode: '10001', country: 'US', isDefault: true
};

describe('CheckoutAddressPageComponent', () => {
  let httpMock: HttpTestingController;
  let mockAuthStore: any;
  let mockCheckoutStore: any;

  beforeEach(() => {
    mockAuthStore = {
      currentUser: signal(mockUser),
      isAuthenticated: signal(true),
      isLoading: signal(false),
      error: signal(null),
      hydrate: jasmine.createSpy('hydrate')
    };

    mockCheckoutStore = {
      selectedAddress: signal(null),
      paymentMethod: signal(null),
      giftPointsToRedeem: signal(0),
      placedOrder: signal(null),
      isLoading: signal(false),
      error: signal(null),
      setAddress: jasmine.createSpy('setAddress')
    };

    TestBed.configureTestingModule({
      imports: [CheckoutAddressPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: CheckoutStore, useValue: mockCheckoutStore }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads addresses for the current user on ngOnInit', () => {
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    fixture.componentInstance.ngOnInit();
    const req = httpMock.expectOne('/api/addresses?userId=u1');
    req.flush([]);
  });

  it('pre-selects the default address from the loaded list', () => {
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    fixture.componentInstance.ngOnInit();
    httpMock.expectOne('/api/addresses?userId=u1').flush([mockAddress]);
    expect(fixture.componentInstance.selectedAddressId()).toBe('addr1');
  });

  it('does nothing when user is null on ngOnInit', () => {
    mockAuthStore.currentUser.set(null);
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    fixture.componentInstance.ngOnInit();
    httpMock.expectNone('/api/addresses?userId=u1');
  });

  it('sets isLoading to false on address load error', () => {
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    fixture.componentInstance.ngOnInit();
    httpMock.expectOne('/api/addresses?userId=u1').flush(null, { status: 500, statusText: 'Error' });
    expect(fixture.componentInstance.isLoading()).toBeFalse();
  });

  it('onSelectAddress updates selectedAddressId', () => {
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    fixture.componentInstance.onSelectAddress('addr1');
    expect(fixture.componentInstance.selectedAddressId()).toBe('addr1');
  });

  it('toggleNewForm toggles showNewForm', () => {
    const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
    expect(fixture.componentInstance.showNewForm()).toBeFalse();
    fixture.componentInstance.toggleNewForm();
    expect(fixture.componentInstance.showNewForm()).toBeTrue();
    fixture.componentInstance.toggleNewForm();
    expect(fixture.componentInstance.showNewForm()).toBeFalse();
  });

  describe('onContinue()', () => {
    it('calls checkoutStore.setAddress and navigates when an address is selected', () => {
      const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
      fixture.componentInstance.ngOnInit();
      httpMock.expectOne('/api/addresses?userId=u1').flush([mockAddress]);

      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.onContinue();

      expect(mockCheckoutStore.setAddress).toHaveBeenCalledWith(mockAddress);
      expect(router.navigate).toHaveBeenCalledWith(['/checkout/payment']);
    });

    it('does nothing when no address is selected', () => {
      const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      fixture.componentInstance.onContinue();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onSubmitNew()', () => {
    it('marks form touched and does nothing when form is invalid', () => {
      const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
      fixture.componentInstance.onSubmitNew();
      expect(mockCheckoutStore.setAddress).not.toHaveBeenCalled();
    });

    it('calls setAddress and navigates to payment when form is valid', () => {
      const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
      const comp = fixture.componentInstance;
      comp.form.setValue({ name: 'Jane', line1: '1 Main', line2: '', city: 'NY', state: 'NY', postcode: '10001', country: 'US' });
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      comp.onSubmitNew();
      expect(mockCheckoutStore.setAddress).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/checkout/payment']);
    });

    it('does nothing when user is null', () => {
      mockAuthStore.currentUser.set(null);
      const fixture = TestBed.createComponent(CheckoutAddressPageComponent);
      const comp = fixture.componentInstance;
      comp.form.setValue({ name: 'Jane', line1: '1 Main', line2: '', city: 'NY', state: 'NY', postcode: '10001', country: 'US' });
      comp.onSubmitNew();
      expect(mockCheckoutStore.setAddress).not.toHaveBeenCalled();
    });
  });
});
