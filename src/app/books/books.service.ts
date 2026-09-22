import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from './books';

@Injectable({ providedIn: 'root' })
export class BooksService {
  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('/api/books');
  }

  getBook(idOrSlug: string | number): Observable<Book> {
    return this.http.get<Book>(`/api/books/${idOrSlug}`);
  }
}
