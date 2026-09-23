import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Book } from '../books';
import { BookGallerySliderComponent } from '../book-single-product/book-gallery-slider/book-gallery-slider.component';
import { BooksService } from '../books.service';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-featured-book',
  standalone: true,
  imports: [RouterLink, BookGallerySliderComponent],
  templateUrl: './featured-book.component.html',
  styleUrl: './featured-book.component.css'
})
export class FeaturedBookComponent implements OnInit {
  @Input() idOrSlug: string | number = '';

  book?: Book;

  constructor(
    private booksService: BooksService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.idOrSlug) {
      return;
    }

    this.booksService.getBook(this.idOrSlug).subscribe(book => {
      this.book = book;
    });
  }

  get bookLink(): string {
    return this.book?.slug || String(this.book?.id ?? '');
  }

  isOutOfStock(): boolean {
    return !!this.book && !this.book.in_stock;
  }

  buyNow(): void {
    if (!this.book) {
      return;
    }

    this.cartService.addToCart(this.book, 1);
    this.router.navigateByUrl('/checkout');
  }
}
