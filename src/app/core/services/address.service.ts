import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = '/api/addresses';

  getAddressesByUserId(userId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.baseUrl}?userId=${userId}`);
  }

  getAddressById(id: string): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  createAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.baseUrl, address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.http.patch<Address>(`${this.baseUrl}/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
