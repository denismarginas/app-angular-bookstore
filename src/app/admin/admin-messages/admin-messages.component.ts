import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { ContactMessage } from '../../contact/contact';

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
}
