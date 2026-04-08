import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, UserInfo } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUser = signal<UserInfo | null>(null);
  private authToken = signal<string | null>(null);
  
  readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor() {
    // Load saved auth state
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');
    
    if (savedToken && savedUser) {
      this.authToken.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  get isLoggedIn(): boolean {
    return !!this.authToken();
  }

  get currentUserData(): UserInfo | null {
    return this.currentUser();
  }

  get token(): string | null {
    return this.authToken();
  }

  get authHeaders(): HttpHeaders {
    const token = this.authToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          this.authToken.set(response.token);
          this.currentUser.set(response.user);
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    this.authToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<any> {
    // Implement refresh token logic if needed
    return this.http.post(`${this.apiUrl}/refresh`, {});
  }
}
