import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  login(credentials: LoginRequest): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(details: RegisterRequest): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.baseUrl}/auth/register`, details).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(authResult: { user: User; token: string }): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('userId', authResult.user.id);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }
}
