import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  quantity = 1;
  // Using placehold.co for more reliable images
  placeholderColors = ['E9967A', 'F0E68C', 'BDB76B', '3CB371', '87CEEB', 'B0C4DE', 'FFCC99', 'FF99CC'];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe(params => {
      const productId = +params['id']; // Convert to number
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.error = 'Invalid product ID';
        this.loading = false;
      }
    });
  }

  loadProduct(productId: number): void {
    this.productService.getProduct(productId).subscribe({
      next: (response) => {
        this.product = response.product;
        
        // Construct full image URLs from API response
        if (this.product) {
          if (this.product.image_path && this.product.image_filename) {
            // Construct the full image URL using the API base URL
            const apiBaseUrl = environment.apiUrl.replace('/api', '');
            this.product.full_image_url = `${apiBaseUrl}/${this.product.image_path}/${this.product.image_filename}`;
            
            // Also construct thumbnail URL if available
            if (this.product.image_thumbnail) {
              this.product.thumbnail_url = `${apiBaseUrl}/${this.product.image_path}/${this.product.image_thumbnail}`;
            } else {
              this.product.thumbnail_url = this.product.full_image_url;
            }
          } else if (!this.product.image_url || this.product.image_url.trim() === '') {
            // If no image data at all, use Unsplash for better product-specific images
            this.product.full_image_url = `https://source.unsplash.com/600x400/?product,${encodeURIComponent(this.product.name || 'product')}`;
            this.product.thumbnail_url = `https://source.unsplash.com/300x200/?product,${encodeURIComponent(this.product.name || 'product')}`;
          }
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load product details:', error);
        this.error = 'Error loading product details. Please try again later.';
        this.loading = false;
        
        // Create a dummy product on error
        this.product = {
          id: +this.route.snapshot.params['id'] || 0,
          name: 'Sample Product',
          description: 'This is a sample product description.',
          price: '29.99',
          stock: 10,
          image_url: `https://placehold.co/600x400/3CB371/000000?text=Sample+Product`
        };
      }
    });
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    if (!this.authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: () => {
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

  formatPrice(price: number | string | undefined): string {
    if (price === undefined) return '0.00';
    return Number(price).toFixed(2);
  }
}
