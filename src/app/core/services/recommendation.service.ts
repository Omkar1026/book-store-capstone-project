import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recommendation } from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private http = inject(HttpClient);
  private baseUrl = '/api/recommendations';

  getRecommendationsByUserId(userId: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.baseUrl}?userId=${userId}`);
  }
}
