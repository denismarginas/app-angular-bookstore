import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../order/order';
import { OrderService } from '../../order/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  errorMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
      },
      error: () => {
        this.errorMessage = 'Could not load orders.';
      }
    });
  }
}
