import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HeroComponent } from '../hero/hero.component';
import { FormFieldComponent } from '../shared/form-field/form-field.component';
import { getErrorMessage } from '../shared/http-error';
import { AuthService } from '../account/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, HeroComponent, FormFieldComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  isSubmitting = false;
  errorMessage = '';

  registerForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.router.navigateByUrl('/account');
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getErrorMessage(err, 'Could not create an account with these details.');
      }
    });
  }
}
