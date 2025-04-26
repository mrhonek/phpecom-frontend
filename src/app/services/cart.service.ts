import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { CartItem, CartResponse } from '../models/cart.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private localCartKey = 'local_cart';

  cartItems$ = this.cartItemsSubject.asObservable();
  cartTotal$ = this.cartTotalSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { 
    this.loadLocalCart();
  }

  // Load cart from localStorage
  private loadLocalCart(): void {
    const localCart = localStorage.getItem(this.localCartKey);
    if (localCart) {
      const cartItems = JSON.parse(localCart);
      this.cartItemsSubject.next(cartItems);
      this.calculateTotal(cartItems);
    }
  }

  // Save cart to localStorage
  private saveLocalCart(cartItems: CartItem[]): void {
    localStorage.setItem(this.localCartKey, JSON.stringify(cartItems));
    this.cartItemsSubject.next(cartItems);
    this.calculateTotal(cartItems);
  }

  // Calculate total price
  private calculateTotal(cartItems: CartItem[]): void {
    let total = 0;
    cartItems.forEach(item => {
      if (item.product) {
        const price = typeof item.product.price === 'string' 
          ? parseFloat(item.product.price) 
          : item.product.price;
        total += price * item.quantity;
      }
    });
    this.cartTotalSubject.next(total);
  }

  getCart(): Observable<CartResponse> {
    // Try backend first
    return new Observable<CartResponse>(observer => {
      this.http.get<CartResponse>(this.apiUrl).subscribe({
        next: (response) => {
          this.cartItemsSubject.next(response.data);
          this.cartTotalSubject.next(response.total);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to get cart from API, using local cart:', error);
          // Use local cart
          const cartItems = this.cartItemsSubject.value;
          const total = this.cartTotalSubject.value;
          observer.next({ data: cartItems, total });
          observer.complete();
        }
      });
    });
  }

  addToCart(productId: number, quantity: number): Observable<{message: string, data: CartItem}> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    // Try backend first
    return new Observable<{message: string, data: CartItem}>(observer => {
      this.http.post<{message: string, data: CartItem}>(`${this.apiUrl}/add`, {
        product_id: productId,
        quantity
      }, { headers }).subscribe({
        next: (response) => {
          this.getCart().subscribe();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to add to cart via API, using local cart:', error);
          
          // Use local cart
          const cartItems = [...this.cartItemsSubject.value];
          const existingItemIndex = cartItems.findIndex(item => item.product_id === productId);
          
          // Get product info from the products displayed on the page
          const products = JSON.parse(localStorage.getItem('local_products') || '[]');
          const product = products.find((p: any) => p.id === productId);
          
          if (!product) {
            observer.error({ error: { message: 'Product not found' } });
            return;
          }
          
          if (existingItemIndex >= 0) {
            // Update existing item
            cartItems[existingItemIndex].quantity += quantity;
            const cartItem = cartItems[existingItemIndex];
            this.saveLocalCart(cartItems);
            
            observer.next({
              message: 'Cart updated successfully (local)',
              data: cartItem
            });
          } else {
            // Add new item
            const newItem: CartItem = {
              id: Date.now(), // Use timestamp as ID
              user_id: 1, // Dummy user ID
              product_id: productId,
              quantity: quantity,
              product: product,
              created_at: new Date().toISOString()
            };
            
            cartItems.push(newItem);
            this.saveLocalCart(cartItems);
            
            observer.next({
              message: 'Item added to cart successfully (local)',
              data: newItem
            });
          }
          
          observer.complete();
        }
      });
    });
  }

  removeFromCart(id: number): Observable<{message: string}> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    
    // Try backend first
    return new Observable<{message: string}>(observer => {
      this.http.delete<{message: string}>(`${this.apiUrl}/${id}`, { headers }).subscribe({
        next: (response) => {
          this.getCart().subscribe();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to remove from cart via API, using local cart:', error);
          
          // Use local cart
          const cartItems = this.cartItemsSubject.value.filter(item => item.id !== id);
          this.saveLocalCart(cartItems);
          
          observer.next({
            message: 'Item removed from cart successfully (local)'
          });
          observer.complete();
        }
      });
    });
  }

  updateQuantity(id: number, quantity: number): Observable<{message: string, data: CartItem}> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    
    // Try backend first
    return new Observable<{message: string, data: CartItem}>(observer => {
      this.http.put<{message: string, data: CartItem}>(`${this.apiUrl}/${id}`, {
        quantity
      }, { headers }).subscribe({
        next: (response) => {
          this.getCart().subscribe();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to update cart via API, using local cart:', error);
          
          // Use local cart
          const cartItems = [...this.cartItemsSubject.value];
          const itemIndex = cartItems.findIndex(item => item.id === id);
          
          if (itemIndex < 0) {
            observer.error({ error: { message: 'Cart item not found' } });
            return;
          }
          
          cartItems[itemIndex].quantity = quantity;
          this.saveLocalCart(cartItems);
          
          observer.next({
            message: 'Cart item updated successfully (local)',
            data: cartItems[itemIndex]
          });
          observer.complete();
        }
      });
    });
  }
} 