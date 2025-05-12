import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  productId: number | null = null;
  isEdit = false;
  loading = false;
  error = '';
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      alt_text: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
        this.isEdit = true;
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.loading = true;
    const headers = this.getHeaders();
    
    this.http.get<{data: Product}>(`${environment.apiUrl}/admin/products/${this.productId}`, { headers })
      .subscribe({
        next: (response) => {
          const product = response.data;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            alt_text: product.image_alt || product.name
          });
          
          if (product.image_url) {
            this.imagePreview = product.image_url;
          }
          
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load product. ' + (error.error?.message || error.message || '');
          this.loading = false;
        }
      });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      this.imageFile = input.files[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.imageFile);
      
      // Set alt text if not already set
      if (!this.productForm.get('alt_text')?.value) {
        this.productForm.get('alt_text')?.setValue(this.productForm.get('name')?.value || '');
      }
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    
    this.loading = true;
    const headers = this.getHeaders();
    const productData = this.productForm.value;
    
    // First save the product data
    if (this.isEdit && this.productId) {
      // Update existing product
      this.http.put<{message: string, data: Product}>(
        `${environment.apiUrl}/admin/products/${this.productId}`,
        productData,
        { headers }
      ).subscribe({
        next: (response) => {
          if (this.imageFile) {
            this.uploadImage(response.data.id);
          } else {
            this.loading = false;
            alert('Product updated successfully!');
            this.router.navigate(['/admin/products']);
          }
        },
        error: (error) => {
          this.error = 'Failed to update product. ' + (error.error?.message || error.message || '');
          this.loading = false;
        }
      });
    } else {
      // Create new product
      this.http.post<{message: string, data: Product}>(
        `${environment.apiUrl}/admin/products`,
        productData,
        { headers }
      ).subscribe({
        next: (response) => {
          if (this.imageFile) {
            this.uploadImage(response.data.id);
          } else {
            this.loading = false;
            alert('Product created successfully!');
            this.router.navigate(['/admin/products']);
          }
        },
        error: (error) => {
          this.error = 'Failed to create product. ' + (error.error?.message || error.message || '');
          this.loading = false;
        }
      });
    }
  }

  uploadImage(productId: number): void {
    if (!this.imageFile) {
      this.loading = false;
      return;
    }
    
    const formData = new FormData();
    formData.append('image', this.imageFile);
    formData.append('alt_text', this.productForm.get('alt_text')?.value || '');
    
    const headers = this.getHeaders();
    
    this.http.post<{message: string, data: any}>(
      `${environment.apiUrl}/products/${productId}/image`,
      formData,
      { headers }
    ).subscribe({
      next: () => {
        this.loading = false;
        alert('Product and image saved successfully!');
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        this.error = 'Product saved but failed to upload image. ' + (error.error?.message || error.message || '');
        this.loading = false;
        // Still navigate back since the product was saved
        this.router.navigate(['/admin/products']);
      }
    });
  }
  
  deleteImage(): void {
    if (!this.productId) return;
    
    if (confirm('Are you sure you want to delete this image?')) {
      this.loading = true;
      const headers = this.getHeaders();
      
      this.http.delete<{message: string}>(
        `${environment.apiUrl}/products/${this.productId}/image`,
        { headers }
      ).subscribe({
        next: () => {
          this.imagePreview = null;
          this.loading = false;
          alert('Image deleted successfully!');
        },
        error: (error) => {
          this.error = 'Failed to delete image. ' + (error.error?.message || error.message || '');
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