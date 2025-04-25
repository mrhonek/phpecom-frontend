import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem, CartResponse } from '../models/cart.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);

  cartItems$ = this.cartItemsSubject.asObservable();
  cartTotal$ = this.cartTotalSubject.asObservable();

  constructor(private http: HttpClient) { }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap(response => {
        this.cartItemsSubject.next(response.data);
        this.cartTotalSubject.next(response.total);
      })
    );
  }

  addToCart(productId: number, quantity: number): Observable<{message: string, data: CartItem}> {
    return this.http.post<{message: string, data: CartItem}>(`${this.apiUrl}/add`, {
      product_id: productId,
      quantity
    }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  removeFromCart(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  updateQuantity(id: number, quantity: number): Observable<{message: string, data: CartItem}> {
    return this.http.put<{message: string, data: CartItem}>(`${this.apiUrl}/${id}`, {
      quantity
    }).pipe(
      tap(() => this.getCart().subscribe())
    );
  }
} 