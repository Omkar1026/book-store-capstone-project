import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { PaymentRequest, PaymentResult } from '../models/payment.model';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('processPayment()', () => {
    it('POSTs to /api/payments', () => {
      const request: PaymentRequest = {
        orderId: 'ord1',
        amount: 19.99,
        paymentMethodId: 'pm1'
      };
      const result: PaymentResult = {
        success: true,
        transactionId: 'txn1',
        amount: 19.99,
        processedAt: '2024-01-01T00:00:00Z'
      };

      service.processPayment(request).subscribe(res => {
        expect(res.success).toBeTrue();
        expect(res.transactionId).toBe('txn1');
      });

      const req = httpMock.expectOne('/api/payments');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(result);
    });
  });
});
