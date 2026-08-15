import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

export interface BookSearchParams {
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: string;
  q?: string;
  categoryId?: string;
  publisherId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  private baseUrl = '/api/books';

  getBooks(params?: BookSearchParams): Observable<Book[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Book[]>(this.baseUrl, { params: httpParams });
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }
}
