import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Order } from '../../order/order';
import { OrderService } from '../../order/order.service';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { getErrorMessage } from '../../shared/http-error';

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

  constructor(
    private orderService: OrderService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

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

  deleteOrder(order: Order): void {
    const adminId = this.authService.currentUser()?.id;

    if (!adminId || !window.confirm(`Delete order #${order.order_id}? This cannot be undone.`)) {
      return;
    }

    this.errorMessage = '';

    this.adminService.deleteOrder(order.order_id, adminId).subscribe({
      next: () => {
        this.orders = this.orders.filter(candidate => candidate.order_id !== order.order_id);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = getErrorMessage(err, 'Could not delete this order.');
      }
    });
  }
}
