import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private baseUrl = '/api/carts';

  getCartByUserId(userId: string): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.baseUrl}?userId=${userId}`);
  }

  createCart(cart: Cart): Observable<Cart> {
    return this.http.post<Cart>(this.baseUrl, cart);
  }

  updateCart(cartId: string, cart: Partial<Cart>): Observable<Cart> {
    return this.http.patch<Cart>(`${this.baseUrl}/${cartId}`, cart);
  }

  deleteCart(cartId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cartId}`);
  }
}
