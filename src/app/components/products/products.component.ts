import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

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
  // Using placehold.co for more reliable images
  placeholderColors = ['E9967A', 'F0E68C', 'BDB76B', '3CB371', '87CEEB', 'B0C4DE', 'FFCC99', 'FF99CC'];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response.products && response.products.length > 0) {
          this.products = response.products;
          
          // Construct full image URLs from API response
          this.products.forEach((product, index) => {
            // Check if we have image path and filename data
            if (product.image_path && product.image_filename) {
              // Construct the full image URL using the API base URL
              const apiBaseUrl = environment.apiUrl.replace('/api', '');
              product.full_image_url = `${apiBaseUrl}/${product.image_path}/${product.image_filename}`;
              
              // Also construct thumbnail URL if available
              if (product.image_thumbnail) {
                product.thumbnail_url = `${apiBaseUrl}/${product.image_path}/${product.image_thumbnail}`;
              } else {
                product.thumbnail_url = product.full_image_url;
              }
            } else if (!product.image_url || product.image_url.trim() === '') {
              // If no image data at all, use Unsplash for better product-specific images
              product.full_image_url = `https://source.unsplash.com/300x200/?product,${encodeURIComponent(product.name || 'product')}`;
              product.thumbnail_url = `https://source.unsplash.com/150x100/?product,${encodeURIComponent(product.name || 'product')}`;
            }
          });
          
          // Store enhanced products in localStorage for cart service to use
          localStorage.setItem('local_products', JSON.stringify(this.products));
        } else {
          // Create dummy products if none are returned
          this.products = Array(6).fill(0).map((_, index) => ({
            id: index + 1,
            name: `Product ${index + 1}`,
            description: 'Sample product description.',
            price: (19.99 + index * 5).toString(),
            stock: 10,
            image_url: `https://placehold.co/300x200/${this.placeholderColors[index % this.placeholderColors.length]}/000000?text=Product+${index + 1}`
          } as Product));
          
          localStorage.setItem('local_products', JSON.stringify(this.products));
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.error = 'Error loading products. Please try again later.';
        this.loading = false;
        
        // Create dummy products on error
        this.products = Array(6).fill(0).map((_, index) => ({
          id: index + 1,
          name: `Product ${index + 1}`,
          description: 'Sample product description.',
          price: (19.99 + index * 5).toString(),
          stock: 10,
          image_url: `https://placehold.co/300x200/${this.placeholderColors[index % this.placeholderColors.length]}/000000?text=Product+${index + 1}`
        } as Product));
        
        localStorage.setItem('local_products', JSON.stringify(this.products));
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