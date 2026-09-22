import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../books';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css'
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;

  constructor(private cartService: CartService) {}

  get bookLink(): string {
    return this.book.slug || String(this.book.id);
  }

  isOutOfStock(): boolean {
    return !this.book.in_stock;
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart();
  }

  addToCart(): void {
    this.cartService.addToCart(this.book);
  }
}
