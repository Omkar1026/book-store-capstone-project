import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookCategory } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = '/api/categories';

  getCategories(): Observable<BookCategory[]> {
    return this.http.get<BookCategory[]>(this.baseUrl);
  }

  getCategoryById(id: string): Observable<BookCategory> {
    return this.http.get<BookCategory>(`${this.baseUrl}/${id}`);
  }
}
