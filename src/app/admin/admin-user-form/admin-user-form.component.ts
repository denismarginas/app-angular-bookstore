import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { OrderAddressFieldsComponent } from '../../checkout/order-address-fields/order-address-fields.component';
import { USER_ROLES, UserRole } from '../../account/user';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { getErrorMessage } from '../../shared/http-error';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormFieldComponent, OrderAddressFieldsComponent],
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.css'
})
export class AdminUserFormComponent implements OnInit {
  isEdit = false;
  userId?: number;
  isSubmitting = false;
  errorMessage = '';
  roles = USER_ROLES;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: ['', Validators.required],
    role: this.fb.nonNullable.control<UserRole>('Customer', Validators.required),
    address: this.fb.nonNullable.group({
      address_line: [''],
      city: [''],
      state: [''],
      postal_code: [''],
      country: ['']
    })
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEdit = true;
      this.userId = Number(idParam);
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();

      const adminId = this.authService.currentUser()?.id;

      if (!adminId) {
        return;
      }

      this.adminService.getUser(this.userId, adminId).subscribe({
        next: user => {
          this.form.patchValue({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            address: user.address
          });
        },
        error: () => {
          this.errorMessage = 'Could not load this user.';
        }
      });
    } else {
      this.form.controls.password.setValidators(Validators.required);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    const formValue = this.form.getRawValue();

    const payload: {
      email: string;
      password?: string;
      first_name: string;
      last_name: string;
      phone: string;
      role: UserRole;
      address: typeof formValue.address;
    } = {
      email: formValue.email,
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      phone: formValue.phone,
      role: formValue.role,
      address: formValue.address
    };

    if (formValue.password) {
      payload.password = formValue.password;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request$ = this.isEdit
      ? this.adminService.updateUser(this.userId!, payload, adminId)
      : this.adminService.createUser(payload, adminId);

    request$.subscribe({
      next: () => {
        this.router.navigateByUrl('/admin/users');
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getErrorMessage(err, 'Could not save this user.');
      }
    });
  }
}
