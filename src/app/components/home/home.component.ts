import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { environment } from '../../../environments/environment';

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
  // Using placehold.co for more reliable images
  placeholderColors = ['E9967A', 'F0E68C', 'BDB76B', '3CB371', '87CEEB', 'B0C4DE', 'FFCC99', 'FF99CC'];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        // Get a few random products to feature
        if (response.products && response.products.length > 0) {
          // First, enhance products with full image URLs
          const enhancedProducts = response.products.map((product, index) => {
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
              return product;
            } else if (!product.image_url || product.image_url.trim() === '') {
              // If no image data at all, use Unsplash for better product-specific images
              return {
                ...product,
                full_image_url: `https://source.unsplash.com/300x200/?product,${encodeURIComponent(product.name || 'product')}`,
                thumbnail_url: `https://source.unsplash.com/150x100/?product,${encodeURIComponent(product.name || 'product')}`
              };
            }
            return product;
          });
          
          // Store products in localStorage for offline cart functionality
          localStorage.setItem('local_products', JSON.stringify(enhancedProducts));
          
          this.featuredProducts = this.getRandomProducts(enhancedProducts, 4);
        } else {
          // If no products are returned, create dummy products
          const dummyProducts = Array(4).fill(0).map((_, index) => ({
            id: index + 1,
            name: `Product ${index + 1}`,
            description: 'Sample product description',
            price: (19.99 + index * 5).toString(),
            stock: 10,
            image_url: `https://placehold.co/300x200/${this.placeholderColors[index]}/000000?text=Product+${index + 1}`
          } as Product));
          this.featuredProducts = dummyProducts;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.error = 'Failed to load featured products';
        this.loading = false;
        
        // Create dummy products on error
        const dummyProducts = Array(4).fill(0).map((_, index) => ({
          id: index + 1,
          name: `Product ${index + 1}`,
          description: 'Sample product description',
          price: (19.99 + index * 5).toString(),
          stock: 10,
          image_url: `https://placehold.co/300x200/${this.placeholderColors[index]}/000000?text=Product+${index + 1}`
        } as Product));
        this.featuredProducts = dummyProducts;
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
