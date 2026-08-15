import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = '/api/orders';

  getOrdersByUserId(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}?userId=${userId}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  updateOrder(orderId: string, order: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${orderId}`, order);
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.updateOrder(orderId, { status: 'cancelled' });
  }
}
