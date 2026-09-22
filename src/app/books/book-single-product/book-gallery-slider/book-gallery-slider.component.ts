import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-gallery-slider',
  standalone: true,
  imports: [],
  templateUrl: './book-gallery-slider.component.html',
  styleUrl: './book-gallery-slider.component.css'
})
export class BookGallerySliderComponent {
  @Input({ required: true }) images!: string[];
  @Input() alt = '';

  activeIndex = 0;

  prev(): void {
    this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
  }

  next(): void {
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
  }

  goTo(index: number): void {
    this.activeIndex = index;
  }
}
