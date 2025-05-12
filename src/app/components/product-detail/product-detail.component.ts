import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';

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
  // Using placeholder.com instead of Unsplash for more reliable images
  placeholderColor = '3CB371'; // Default color

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
        
        // Add placeholder image if missing
        if (this.product && (!this.product.image_url || this.product.image_url.trim() === '')) {
          this.product.image_url = `https://via.placeholder.com/600x400/${this.placeholderColor}/000000?text=${encodeURIComponent(this.product.name)}`;
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error loading product';
        this.loading = false;
      }
    });
  }

  incrementQuantity(): void {
    this.quantity++;
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
