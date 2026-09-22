import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HeroComponent } from '../hero/hero.component';
import { FormFieldComponent } from '../shared/form-field/form-field.component';
import { AuthService } from '../account/auth.service';
import { ContactService } from './contact.service';
import { getErrorMessage } from '../shared/http-error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, HeroComponent, FormFieldComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  isSubmitting = false;
  isSubmitted = false;
  errorMessage = '';

  contactForm = this.fb.nonNullable.group({
    subject: [''],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    order_id: [''],
    message: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private contactService: ContactService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.contactForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email
      });
    }
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.contactService.sendMessage(this.contactForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSubmitted = true;
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getErrorMessage(err, 'Something went wrong while sending your message. Please try again.');
      }
    });
  }
}
