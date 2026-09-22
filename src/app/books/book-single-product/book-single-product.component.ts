import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Book } from '../books';
import { BookGallerySliderComponent } from './book-gallery-slider/book-gallery-slider.component';
import { CartService } from '../../cart/cart.service';
import { BooksService } from '../books.service';

@Component({
  selector: 'app-book-single-product',
  standalone: true,
  imports: [RouterLink, BookGallerySliderComponent],
  templateUrl: './book-single-product.component.html',
  styleUrl: './book-single-product.component.css'
})
export class BookSingleProductComponent implements OnInit {
  book?: Book;
  notFound = false;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const idOrSlug = this.route.snapshot.paramMap.get('idOrSlug') ?? '';

    this.booksService.getBook(idOrSlug).subscribe({
      next: book => {
        this.book = book;
      },
      error: () => {
        this.notFound = true;
      }
    });
  }

  isOutOfStock(): boolean {
    return !!this.book && !this.book.in_stock;
  }

  get maxQuantity(): number {
    return this.book && this.book.quantity > 0 ? this.book.quantity : 99;
  }

  decrement(): void {
    this.quantity = this.clampQuantity(this.quantity - 1);
  }

  increment(): void {
    this.quantity = this.clampQuantity(this.quantity + 1);
  }

  onQuantityChange(value: string): void {
    this.quantity = this.clampQuantity(Number(value));
  }

  addToCart(): void {
    if (this.book) {
      this.cartService.addToCart(this.book, this.quantity);
    }
  }

  buyNow(): void {
    if (this.book) {
      this.cartService.addToCart(this.book, 1);
      this.router.navigateByUrl('/checkout');
    }
  }

  private clampQuantity(value: number): number {
    if (Number.isNaN(value)) {
      return 1;
    }

    return Math.min(Math.max(Math.trunc(value), 1), this.maxQuantity);
  }
}
