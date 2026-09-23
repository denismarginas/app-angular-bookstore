import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Book } from '../books';
import { BookCardComponent } from '../book-card/book-card.component';
import { BooksService } from '../books.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookCardComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit, OnDestroy {
  @Input() limit?: number;
  @Input() pagination = false;
  @Input() maxItems = 6;

  books: Book[] = [];
  title: string = 'Available Books';
  currentPage = 1;

  private booksLoaded = false;
  private paramsSubscription?: Subscription;

  constructor(private booksService: BooksService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.booksService.getBooks().subscribe(books => {
      this.books = books;
      this.booksLoaded = true;
      this.clampCurrentPage();
    });

    if (this.pagination) {
      this.paramsSubscription = this.route.paramMap.subscribe(params => {
        const page = Number(params.get('page'));
        this.currentPage = page > 0 ? page : 1;
        if (this.booksLoaded) {
          this.clampCurrentPage();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  get visibleBooks(): Book[] {
    if (this.pagination) {
      const start = (this.currentPage - 1) * this.maxItems;
      return this.books.slice(start, start + this.maxItems);
    }
    return this.limit ? this.books.slice(0, this.limit) : this.books;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.books.length / this.maxItems));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.router.navigate(['/books/pagination', page]);
  }

  private clampCurrentPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }
}
