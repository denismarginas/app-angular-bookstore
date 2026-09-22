import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.css'
})
export class AccountDetailsComponent implements OnInit {
  isSubmitting = false;
  successMessage = '';

  detailsForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, public authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.detailsForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone
      });
    }
  }

  save(): void {
    const user = this.authService.currentUser();

    if (!user || this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';

    this.authService.updateUser(user.id, this.detailsForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Your details were updated.';
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
