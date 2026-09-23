import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { ContactMessage } from '../../contact/contact';
import { getErrorMessage } from '../../shared/http-error';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.css'
})
export class AdminMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    this.adminService.getContactMails(adminId).subscribe({
      next: messages => {
        this.messages = messages;
      },
      error: () => {
        this.errorMessage = 'Could not load messages.';
      }
    });
  }

  deleteMessage(message: ContactMessage): void {
    const adminId = this.authService.currentUser()?.id;

    if (!adminId || !window.confirm('Delete this message? This cannot be undone.')) {
      return;
    }

    this.errorMessage = '';

    this.adminService.deleteContactMail(message.id, adminId).subscribe({
      next: () => {
        this.messages = this.messages.filter(candidate => candidate.id !== message.id);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = getErrorMessage(err, 'Could not delete this message.');
      }
    });
  }
}
