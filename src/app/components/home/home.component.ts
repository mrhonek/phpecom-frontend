import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading: boolean = false;
  error: string = '';
  baseImageUrl = 'https://source.unsplash.com/random/300x200/?';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        // Get a few random products to feature
        if (response.products.length > 0) {
          const enhancedProducts = response.products.map(product => {
            if (!product.image_url || product.image_url.trim() === '') {
              // Generate placeholder image URL based on product name
              return {
                ...product,
                image_url: this.baseImageUrl + encodeURIComponent(product.name.toLowerCase())
              };
            }
            return product;
          });
          
          this.featuredProducts = this.getRandomProducts(enhancedProducts, 4);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load featured products';
        this.loading = false;
      }
    });
  }

  getRandomProducts(products: Product[], count: number): Product[] {
    // Shuffle array and take first 'count' elements
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, products.length));
  }

  formatPrice(price: number | string): string {
    return Number(price).toFixed(2);
  }
}
