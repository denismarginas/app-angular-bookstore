import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, HeroComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  itemPrice(price: number, salePrice: number | null): number {
    return salePrice ?? price;
  }

  onQuantityChange(id: number, value: string): void {
    this.cartService.updateQuantity(id, Number(value));
  }

  removeItem(id: number): void {
    this.cartService.removeFromCart(id);
  }
}
