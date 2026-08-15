import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publisher } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {
  private http = inject(HttpClient);
  private baseUrl = '/api/publishers';

  getPublishers(): Observable<Publisher[]> {
    return this.http.get<Publisher[]>(this.baseUrl);
  }

  getPublisherById(id: string): Observable<Publisher> {
    return this.http.get<Publisher>(`${this.baseUrl}/${id}`);
  }
}
