import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const passwordConfirmation = formGroup.get('password_confirmation')?.value;

    if (password !== passwordConfirmation) {
      formGroup.get('password_confirmation')?.setErrors({ passwordMismatch: true });
    }
    
    return null;
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    console.log('Submitting registration form with data:', {
      name: this.f['name'].value,
      email: this.f['email'].value,
      password: '******', // Don't log actual password
      password_confirmation: '******'
    });
    
    console.log('API URL:', this.authService['apiUrl'] + '/register');

    this.loading = true;
    this.authService.register(
      this.f['name'].value,
      this.f['email'].value,
      this.f['password'].value,
      this.f['password_confirmation'].value
    ).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Registration error:', error);
        
        if (error.error && typeof error.error === 'object') {
          if (error.error.message) {
            this.error = error.error.message;
          } else if (error.error.errors) {
            // Handle Laravel validation errors
            const validationErrors = error.error.errors;
            const errorMessages = [];
            
            for (const field in validationErrors) {
              if (validationErrors.hasOwnProperty(field)) {
                errorMessages.push(validationErrors[field][0]);
              }
            }
            
            this.error = errorMessages.join(', ');
          } else {
            this.error = 'Registration failed: ' + error.statusText;
          }
        } else {
          this.error = error.message || 'Registration failed';
        }
        
        this.loading = false;
      }
    });
  }
}
