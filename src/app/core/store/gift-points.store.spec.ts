import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GiftPointsStore } from './gift-points.store';

describe('GiftPointsStore', () => {
  let store: InstanceType<typeof GiftPointsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GiftPointsStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(GiftPointsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('has correct initial state', () => {
    expect(store.balance()).toBe(0);
    expect(store.pendingRedemption()).toBe(0);
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  describe('loadBalance()', () => {
    it('sets balance from first balance record', () => {
      store.loadBalance('u1');
      const req = httpMock.expectOne('/api/giftPointsBalances?userId=u1');
      req.flush([{ id: 'gp1', userId: 'u1', balance: 500, updatedAt: '' }]);
      expect(store.balance()).toBe(500);
    });

    it('sets balance to 0 when no records', () => {
      store.loadBalance('u1');
      httpMock.expectOne('/api/giftPointsBalances?userId=u1').flush([]);
      expect(store.balance()).toBe(0);
    });

    it('sets error on failure', () => {
      store.loadBalance('u1');
      httpMock.expectOne('/api/giftPointsBalances?userId=u1').flush(
        { message: 'Error' }, { status: 500, statusText: 'Error' }
      );
      expect(store.error()).toBe('Error');
    });
  });

  describe('setRedemption()', () => {
    it('sets pending redemption up to the balance', () => {
      store.loadBalance('u1');
      httpMock.expectOne('/api/giftPointsBalances?userId=u1').flush([
        { id: 'gp1', userId: 'u1', balance: 200, updatedAt: '' }
      ]);
      store.setRedemption(150);
      expect(store.pendingRedemption()).toBe(150);
    });

    it('caps redemption at the balance', () => {
      store.loadBalance('u1');
      httpMock.expectOne('/api/giftPointsBalances?userId=u1').flush([
        { id: 'gp1', userId: 'u1', balance: 100, updatedAt: '' }
      ]);
      store.setRedemption(500);
      expect(store.pendingRedemption()).toBe(100);
    });
  });
});
