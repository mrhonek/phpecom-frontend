import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  
  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const headers = this.getHeaders();
    
    this.http.get<{data: Product[]}>(`${environment.apiUrl}/admin/products`, { headers })
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load products. ' + (error.error?.message || error.message || '');
          this.loading = false;
        }
      });
  }
  
  createProduct(): void {
    this.router.navigate(['/admin/products/create']);
  }
  
  editProduct(id: number): void {
    this.router.navigate(['/admin/products/edit', id]);
  }
  
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      const headers = this.getHeaders();
      
      this.http.delete<{message: string}>(`${environment.apiUrl}/admin/products/${id}`, { headers })
        .subscribe({
          next: () => {
            this.loadProducts(); // Reload the products after deletion
            alert('Product deleted successfully!');
          },
          error: (error) => {
            this.error = 'Failed to delete product. ' + (error.error?.message || error.message || '');
            this.loading = false;
          }
        });
    }
  }
  
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }
} 