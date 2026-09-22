import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './account-dashboard.component.html',
  styleUrl: './account-dashboard.component.css'
})
export class AccountDashboardComponent {
  constructor(public authService: AuthService) {}
}
