import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error loading products';
        this.loading = false;
      }
    });
  }

  addToCart(productId: number): void {
    if (!this.authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        // Show success message or update cart indicator
        alert('Product added to cart');
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to add product to cart');
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
} 