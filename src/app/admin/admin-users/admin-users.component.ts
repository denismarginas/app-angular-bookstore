import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../account/user';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { getErrorMessage } from '../../shared/http-error';

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

  isCurrentUser(user: User): boolean {
    return user.id === this.authService.currentUser()?.id;
  }

  deleteUser(user: User): void {
    const adminId = this.authService.currentUser()?.id;

    if (!adminId || !window.confirm(`Delete the account for ${user.email}? This cannot be undone.`)) {
      return;
    }

    this.errorMessage = '';

    this.adminService.deleteUser(user.id, adminId).subscribe({
      next: () => {
        this.users = this.users.filter(candidate => candidate.id !== user.id);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = getErrorMessage(err, 'Could not delete this user.');
      }
    });
  }
}
