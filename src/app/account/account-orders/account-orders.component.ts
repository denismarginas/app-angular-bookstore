import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../order/order';
import { OrderService } from '../../order/order.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './account-orders.component.html',
  styleUrl: './account-orders.component.css'
})
export class AccountOrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }

  get myOrders(): Order[] {
    const email = this.authService.currentUser()?.email;
    return this.orders.filter(order => order.customer.email === email);
  }
}
