import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, HeroComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
