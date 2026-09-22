import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../account/user';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  errorMessage = '';

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    this.adminService.getUsers(adminId).subscribe({
      next: users => {
        this.users = users;
      },
      error: () => {
        this.errorMessage = 'Could not load users.';
      }
    });
  }
}
