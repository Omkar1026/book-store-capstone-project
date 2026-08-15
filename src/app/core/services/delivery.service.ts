import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeliveryEstimate {
  estimatedDate: string;
  estimatedDelivery?: string;
  days: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private baseUrl = '/api/delivery/estimate';

  getDeliveryEstimate(bookId: string, stock: number): Observable<DeliveryEstimate> {
    let params = new HttpParams();
    if (bookId) params = params.set('bookId', bookId);
    params = params.set('stock', stock.toString());

    return this.http.get<DeliveryEstimate>(this.baseUrl, { params });
  }
}
