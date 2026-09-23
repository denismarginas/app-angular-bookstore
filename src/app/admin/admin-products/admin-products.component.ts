import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Book } from '../../books/books';
import { BooksService } from '../../books/books.service';
import { AdminService } from '../admin.service';
import { AuthService } from '../../account/auth.service';
import { getErrorMessage } from '../../shared/http-error';

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

  constructor(
    private booksService: BooksService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

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

  deleteBook(book: Book): void {
    const adminId = this.authService.currentUser()?.id;

    if (!adminId || !window.confirm(`Delete "${book.title}"? This cannot be undone.`)) {
      return;
    }

    this.errorMessage = '';

    this.adminService.deleteBook(book.id, adminId).subscribe({
      next: () => {
        this.books = this.books.filter(candidate => candidate.id !== book.id);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = getErrorMessage(err, 'Could not delete this product.');
      }
    });
  }
}
