import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account-address',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './account-address.component.html',
  styleUrl: './account-address.component.css'
})
export class AccountAddressComponent implements OnInit {
  isSubmitting = false;
  successMessage = '';

  addressForm = this.fb.nonNullable.group({
    address_line: [''],
    city: [''],
    state: [''],
    postal_code: [''],
    country: ['']
  });

  constructor(private fb: FormBuilder, public authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.addressForm.patchValue(user.address);
    }
  }

  save(): void {
    const user = this.authService.currentUser();

    if (!user) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';

    this.authService.updateUser(user.id, { address: this.addressForm.getRawValue() }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Your address was updated.';
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
