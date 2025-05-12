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
  // Using placeholder.com instead of Unsplash for more reliable images
  placeholderColors = ['E9967A', 'F0E68C', 'BDB76B', '3CB371', '87CEEB', 'B0C4DE', 'FFCC99', 'FF99CC'];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        // Get a few random products to feature
        if (response.products.length > 0) {
          const enhancedProducts = response.products.map((product, index) => {
            if (!product.image_url || product.image_url.trim() === '') {
              // Use placeholder.com with product name as text and random background color
              const colorIndex = index % this.placeholderColors.length;
              return {
                ...product,
                image_url: `https://via.placeholder.com/300x200/${this.placeholderColors[colorIndex]}/000000?text=${encodeURIComponent(product.name)}`
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
