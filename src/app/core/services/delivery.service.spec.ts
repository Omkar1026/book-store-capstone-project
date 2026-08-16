import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeliveryService, DeliveryEstimate } from './delivery.service';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeliveryService]
    });
    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDeliveryEstimate()', () => {
    it('GETs /api/delivery/estimate with bookId and stock params', () => {
      const estimate: DeliveryEstimate = {
        estimatedDate: '2024-01-10',
        days: 5
      };

      service.getDeliveryEstimate('b1', 10).subscribe(res => {
        expect(res.days).toBe(5);
        expect(res.estimatedDate).toBe('2024-01-10');
      });

      const req = httpMock.expectOne(r => r.url === '/api/delivery/estimate');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('bookId')).toBe('b1');
      expect(req.request.params.get('stock')).toBe('10');
      req.flush(estimate);
    });

    it('includes stock param when stock is 0', () => {
      service.getDeliveryEstimate('b2', 0).subscribe();
      const req = httpMock.expectOne(r => r.url === '/api/delivery/estimate');
      expect(req.request.params.get('stock')).toBe('0');
      req.flush({ estimatedDate: '2024-01-15', days: 10 });
    });
  });
});
