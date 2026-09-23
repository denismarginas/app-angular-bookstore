import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { BookListComponent } from '../books/book-list/book-list.component';
import { FeaturedBookComponent } from '../books/featured-book/featured-book.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, BookListComponent, FeaturedBookComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
