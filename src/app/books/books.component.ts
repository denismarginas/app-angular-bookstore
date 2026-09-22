import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { BookListComponent } from './book-list/book-list.component';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [HeroComponent, BookListComponent],
  templateUrl: './books.component.html',
  styleUrl: './books.component.css'
})
export class BooksComponent {}
