import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../../books/books';
import { BooksService } from '../../books/books.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  books: Book[] = [];
  errorMessage = '';

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    this.booksService.getBooks().subscribe({
      next: books => {
        this.books = books;
      },
      error: () => {
        this.errorMessage = 'Could not load products.';
      }
    });
  }
}
