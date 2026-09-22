import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeroComponent } from '../hero/hero.component';
import { BookCardComponent } from '../books/book-card/book-card.component';
import { Book } from '../books/books';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, HeroComponent, BookCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  query = '';
  results: Book[] = [];
  hasSearched = false;

  constructor(private http: HttpClient) {}

  onSearch(): void {
    const term = this.query.trim();
    this.hasSearched = true;

    if (!term) {
      this.results = [];
      return;
    }

    this.http.get<Book[]>(`/api/books/search?q=${encodeURIComponent(term)}`).subscribe(books => {
      this.results = books;
    });
  }
}
