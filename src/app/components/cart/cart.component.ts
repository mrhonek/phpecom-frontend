import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  loading: boolean = false;
  error: string = '';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.data;
        this.cartTotal = response.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cart items';
        this.loading = false;
      }
    });
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    if (quantity < 1) quantity = 1;
    
    this.cartService.updateQuantity(cartItem.id, quantity).subscribe({
      next: () => {
        // Cart will be updated via the subscription
      },
      error: (err) => {
        this.error = 'Failed to update quantity';
      }
    });
  }

  removeFromCart(cartItemId: number): void {
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        // Cart will be updated via the subscription
      },
      error: (err) => {
        this.error = 'Failed to remove item from cart';
      }
    });
  }

  formatPrice(price: number | string): string {
    return Number(price).toFixed(2);
  }
}
