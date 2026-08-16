import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GiftPointsService } from './gift-points.service';
import { GiftPointsBalance, GiftPointsRedemption } from '../models/gift-points.model';

const mockBalance: GiftPointsBalance = {
  id: 'gp1',
  userId: 'u1',
  balance: 500,
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('GiftPointsService', () => {
  let service: GiftPointsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GiftPointsService]
    });
    service = TestBed.inject(GiftPointsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGiftPointsBalance()', () => {
    it('GETs /api/giftPointsBalances?userId=u1', () => {
      service.getGiftPointsBalance('u1').subscribe(balances => {
        expect(balances).toEqual([mockBalance]);
      });
      const req = httpMock.expectOne('/api/giftPointsBalances?userId=u1');
      expect(req.request.method).toBe('GET');
      req.flush([mockBalance]);
    });
  });

  describe('redeemGiftPoints()', () => {
    it('POSTs to /api/gift-points/redeem', () => {
      const redemption: GiftPointsRedemption = { userId: 'u1', amount: 100 };
      service.redeemGiftPoints(redemption).subscribe(res => {
        expect(res.success).toBeTrue();
        expect(res.newBalance).toBe(400);
      });
      const req = httpMock.expectOne('/api/gift-points/redeem');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(redemption);
      req.flush({ success: true, newBalance: 400 });
    });
  });
});
