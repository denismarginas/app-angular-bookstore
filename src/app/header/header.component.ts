import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MiniCartComponent } from '../cart/mini-cart/mini-cart.component';
import { AuthService } from '../account/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MiniCartComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isMenuOpen = false;

  constructor(public authService: AuthService) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
