import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRequest, PaymentResult } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = '/api/payments';

  processPayment(request: PaymentRequest): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(this.baseUrl, request);
  }
}
