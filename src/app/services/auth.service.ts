import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';
  private usersKey = 'local_users';

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  // Temporary function to get local users
  private getLocalUsers(): any[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }

  // Temporary function to save local users
  private saveLocalUsers(users: any[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    console.log('Sending registration request to:', `${this.apiUrl}/register`);
    console.log('With payload:', { name, email, password: '****', password_confirmation: '****' });
    
    // TEMPORARY WORKAROUND: Local registration until backend is fixed
    // Check if API is reachable first
    const apiTest = this.http.get<any>(`${environment.apiUrl}`);
    
    return new Observable<AuthResponse>(observer => {
      apiTest.subscribe({
        next: (response) => {
          console.log('API reachable:', response);
          
          // Try to use backend if it's available
          this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
            name,
            email,
            password,
            password_confirmation
          }, { headers }).subscribe({
            next: (response) => {
              console.log('Registration response:', response);
              this.setAuth(response);
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              console.error('Backend registration failed, using local fallback:', error);
              
              // Fall back to local registration
              this.handleLocalRegistration(name, email, password, observer);
            }
          });
        },
        error: (error) => {
          console.error('API not reachable, using local fallback:', error);
          
          // Fall back to local registration
          this.handleLocalRegistration(name, email, password, observer);
        }
      });
    });
  }

  // Helper method for local registration
  private handleLocalRegistration(name: string, email: string, password: string, observer: any): void {
    const users = this.getLocalUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
      observer.error({ error: { message: 'Email already taken' } });
      return;
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password, // In a real app, this would be hashed!
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    this.saveLocalUsers(users);
    
    // Create fake token (just for demo)
    const token = `demo_token_${Date.now()}`;
    
    const response: AuthResponse = {
      message: 'User registered successfully (local)',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at
      },
      token
    };
    
    // Set authentication
    this.setAuth(response);
    
    observer.next(response);
    observer.complete();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Try backend first
    return new Observable<AuthResponse>(observer => {
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
        email,
        password
      }, { headers }).subscribe({
        next: (response) => {
          this.setAuth(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Backend login failed, trying local:', error);
          
          // Try local login
          const users = this.getLocalUsers();
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            // Create fake token (just for demo)
            const token = `demo_token_${Date.now()}`;
            
            const response: AuthResponse = {
              message: 'User logged in successfully (local)',
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
              },
              token
            };
            
            this.setAuth(response);
            observer.next(response);
          } else {
            observer.error({ error: { message: 'Invalid credentials' } });
          }
          
          observer.complete();
        }
      });
    });
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
    
    // Try backend logout first
    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers }).subscribe({
        next: (response) => {
          this.clearAuth();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Backend logout failed, doing local logout:', error);
          this.clearAuth();
          observer.next({ message: 'Logged out successfully (local)' });
          observer.complete();
        }
      });
    });
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
      // For local demo, we can't actually verify the token
      // In a real app, we would make an API call to get the user info
      // based on the token
      
      // Try to get user from local storage
      const users = this.getLocalUsers();
      const userFromToken = users.find(u => token.includes(u.id.toString()));
      
      if (userFromToken) {
        const user: User = {
          id: userFromToken.id,
          name: userFromToken.name,
          email: userFromToken.email,
          created_at: userFromToken.created_at
        };
        
        this.currentUserSubject.next(user);
      }
    }
  }
} 