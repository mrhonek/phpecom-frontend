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
  baseImageUrl = 'https://source.unsplash.com/random/300x200/?';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        
        // Enhance products with better image URLs if they don't have one
        this.products.forEach(product => {
          if (!product.image_url || product.image_url.trim() === '') {
            // Generate placeholder image URL based on product name
            product.image_url = this.baseImageUrl + encodeURIComponent(product.name.toLowerCase());
          }
        });
        
        // Store enhanced products in localStorage for cart service to use
        localStorage.setItem('local_products', JSON.stringify(this.products));
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error loading products';
        this.loading = false;
      }
    });
  }

  formatPrice(price: string | number): string {
    return Number(price).toFixed(2);
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