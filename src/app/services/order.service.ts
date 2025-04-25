import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderResponse } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getOrders(): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(this.apiUrl);
  }

  getOrder(id: number): Observable<{data: Order}> {
    return this.http.get<{data: Order}>(`${this.apiUrl}/${id}`);
  }

  createOrder(shippingAddress: string, paymentMethod: string): Observable<{message: string, data: Order}> {
    return this.http.post<{message: string, data: Order}>(this.apiUrl, {
      shipping_address: shippingAddress,
      payment_method: paymentMethod
    });
  }
} 