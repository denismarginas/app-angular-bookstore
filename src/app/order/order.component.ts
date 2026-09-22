import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { Order } from './order';
import { OrderService } from './order.service';
import { AuthService } from '../account/auth.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [RouterLink, HeroComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  order?: Order;
  notFound = false;
  accessDenied = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.orderService.getOrder(id).subscribe({
      next: order => {
        if (this.canView(order)) {
          this.order = order;
        } else {
          this.accessDenied = true;
        }
      },
      error: () => {
        this.notFound = true;
      }
    });
  }

  private canView(order: Order): boolean {
    if (!this.authService.isLoggedIn()) {
      return true;
    }

    if (this.authService.isAdmin()) {
      return true;
    }

    const currentEmail = this.authService.currentUser()?.email?.toLowerCase();
    return currentEmail === order.customer.email.toLowerCase();
  }
}
