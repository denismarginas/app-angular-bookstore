import { Component, Input, OnInit } from '@angular/core';
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
export class BookListComponent implements OnInit {
  @Input() limit?: number;

  books: Book[] = [];
  title: string = 'Available Books';

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    this.booksService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  get visibleBooks(): Book[] {
    return this.limit ? this.books.slice(0, this.limit) : this.books;
  }
}
