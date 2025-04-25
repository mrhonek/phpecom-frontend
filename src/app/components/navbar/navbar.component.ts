import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  cartItemCount = 0;
  
  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.cartService.cartItems$.subscribe(items => {
        this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
      });
      
      // Load the cart on init
      this.cartService.getCart().subscribe();
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      window.location.href = '/';
    });
  }
} 