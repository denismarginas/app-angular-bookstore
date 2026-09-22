import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HeroComponent } from '../hero/hero.component';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { OrderUserFieldsComponent } from './order-user-fields/order-user-fields.component';
import { OrderAddressFieldsComponent } from './order-address-fields/order-address-fields.component';
import { OrderStoreFieldsComponent } from './order-store-fields/order-store-fields.component';
import { ShippingComponent } from './shipping/shipping.component';
import { PaymentsComponent } from './payments/payments.component';
import { SHIPPING_METHODS } from './shipping/shipping-method';
import { PAYMENT_METHODS } from './payments/payment-method';
import { AuthService } from '../account/auth.service';
import { getErrorMessage } from '../shared/http-error';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    HeroComponent,
    OrderUserFieldsComponent,
    OrderAddressFieldsComponent,
    OrderStoreFieldsComponent,
    ShippingComponent,
    PaymentsComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  isSubmitting = false;
  errorMessage = '';

  checkoutForm = this.fb.group({
    user: this.fb.nonNullable.group({
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.cartService.items().length === 0) {
      this.router.navigateByUrl('/cart');
      return;
    }

    const user = this.authService.currentUser();

    if (user) {
      this.checkoutForm.controls.user.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone
      });
      this.checkoutForm.controls.address.patchValue(user.address);
    }
  }

  itemPrice(price: number, salePrice: number | null): number {
    return salePrice ?? price;
  }

  shippingPrice(): number {
    const selected = SHIPPING_METHODS.find(method => method.id === this.checkoutForm.controls.shipping_method.value);
    return selected?.price ?? 0;
  }

  orderTotal(): number {
    return this.cartService.subtotal() + this.shippingPrice();
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.checkoutForm.getRawValue();

    const shippingMethod = SHIPPING_METHODS.find(method => method.id === formValue.shipping_method)!;
    const paymentMethod = PAYMENT_METHODS.find(method => method.id === formValue.payment_method)!;

    const items = this.cartService.items().map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: this.itemPrice(item.price, item.sale_price),
      total_price: this.itemPrice(item.price, item.sale_price) * item.quantity
    }));

    this.orderService
      .placeOrder({
        customer: formValue.user,
        address: formValue.address,
        items,
        shipping: {
          id: shippingMethod.id,
          name: shippingMethod.name,
          price: shippingMethod.price
        },
        payment: {
          id: paymentMethod.id,
          name: paymentMethod.name
        }
      })
      .subscribe({
        next: order => {
          this.cartService.clearCart();
          this.router.navigate(['/order', order.order_id]);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.errorMessage = getErrorMessage(err, 'Something went wrong while placing your order. Please try again.');
        }
      });
  }
}
