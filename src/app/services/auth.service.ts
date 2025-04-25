import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      name,
      email,
      password,
      password_confirmation
    }).pipe(
      tap(response => this.setAuth(response))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => this.setAuth(response))
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearAuth())
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setAuth(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    this.currentUserSubject.next(response.user);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  private loadToken(): void {
    const token = this.getToken();
    if (token) {
      // Load user info or do JWT validation if needed
    }
  }
} 