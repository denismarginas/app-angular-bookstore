import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderUserFieldsComponent } from '../../checkout/order-user-fields/order-user-fields.component';
import { OrderAddressFieldsComponent } from '../../checkout/order-address-fields/order-address-fields.component';
import { SHIPPING_METHODS } from '../../checkout/shipping/shipping-method';
import { PAYMENT_METHODS } from '../../checkout/payments/payment-method';
import { ORDER_STATUSES, OrderStatus } from '../../order/order-status';
import { OrderService } from '../../order/order.service';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { BooksService } from '../../books/books.service';
import { Book } from '../../books/books';
import { getErrorMessage } from '../../shared/http-error';

@Component({
  selector: 'app-admin-order-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, OrderUserFieldsComponent, OrderAddressFieldsComponent],
  templateUrl: './admin-order-form.component.html',
  styleUrl: './admin-order-form.component.css'
})
export class AdminOrderFormComponent implements OnInit {
  isEdit = false;
  orderId?: number;
  isSubmitting = false;
  errorMessage = '';
  books: Book[] = [];
  statuses = ORDER_STATUSES;
  shippingMethods = SHIPPING_METHODS;
  paymentMethods = PAYMENT_METHODS;

  form: FormGroup = this.fb.group({
    status: this.fb.nonNullable.control<OrderStatus>('In progress', Validators.required),
    date: this.fb.nonNullable.control('', Validators.required),
    customer: this.fb.nonNullable.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    address: this.fb.nonNullable.group({
      address_line: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      postal_code: ['', Validators.required],
      country: ['', Validators.required]
    }),
    shipping_method: this.fb.nonNullable.control('', Validators.required),
    payment_method: this.fb.nonNullable.control('', Validators.required)
  });

  items: FormArray = this.fb.array<FormGroup>([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private adminService: AdminService,
    private authService: AuthService,
    private booksService: BooksService
  ) {
    this.form.addControl('items', this.items);
  }

  ngOnInit(): void {
    this.booksService.getBooks().subscribe(books => {
      this.books = books;
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEdit = true;
      this.orderId = Number(idParam);

      this.orderService.getOrder(this.orderId).subscribe({
        next: order => {
          this.form.patchValue({
            status: order.status,
            date: order.date,
            customer: order.customer,
            address: order.address,
            shipping_method: order.shipping?.id ?? '',
            payment_method: order.payment?.id ?? ''
          });

          this.items.clear();
          order.items.forEach(item => {
            this.items.push(this.createItemGroup(item.id, item.quantity));
          });
        },
        error: () => {
          this.errorMessage = 'Could not load this order.';
        }
      });
    } else {
      this.form.patchValue({ date: new Date().toISOString().slice(0, 10) });
      this.addItem();
    }
  }

  createItemGroup(bookId: number | null = null, quantity = 1): FormGroup {
    return this.fb.group({
      book_id: this.fb.control<number | null>(bookId, Validators.required),
      quantity: this.fb.nonNullable.control(quantity, [Validators.required, Validators.min(1)])
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  itemPrice(bookId: number | null): number {
    const book = this.books.find(candidate => candidate.id === bookId);
    return book ? book.sale_price ?? book.price : 0;
  }

  itemTotal(row: AbstractControl): number {
    const value = row.value as { book_id: number | null; quantity: number };
    return this.itemPrice(value.book_id) * (value.quantity || 0);
  }

  get orderTotal(): number {
    const itemsTotal = this.items.controls.reduce((sum, control) => sum + this.itemTotal(control), 0);
    const shipping = this.shippingMethods.find(method => method.id === this.form.get('shipping_method')?.value);
    return itemsTotal + (shipping?.price ?? 0);
  }

  submit(): void {
    if (this.form.invalid || this.items.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const adminId = this.authService.currentUser()?.id;

    if (!adminId) {
      return;
    }

    const formValue = this.form.getRawValue();
    const shippingMethod = this.shippingMethods.find(method => method.id === formValue.shipping_method)!;
    const paymentMethod = this.paymentMethods.find(method => method.id === formValue.payment_method)!;

    const payload = {
      status: formValue.status,
      date: formValue.date,
      customer: formValue.customer,
      address: formValue.address,
      items: (formValue.items as { book_id: number; quantity: number }[]).map(item => ({
        id: item.book_id,
        quantity: item.quantity
      })),
      shipping: { id: shippingMethod.id, name: shippingMethod.name, price: shippingMethod.price },
      payment: { id: paymentMethod.id, name: paymentMethod.name }
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    const request$ = this.isEdit
      ? this.adminService.updateOrder(this.orderId!, payload, adminId)
      : this.adminService.createOrder(payload, adminId);

    request$.subscribe({
      next: () => {
        this.router.navigateByUrl('/admin/orders');
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = getErrorMessage(err, 'Could not save this order.');
      }
    });
  }
}
