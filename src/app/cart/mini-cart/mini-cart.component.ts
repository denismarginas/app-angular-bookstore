import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mini-cart.component.html',
  styleUrl: './mini-cart.component.css'
})
export class MiniCartComponent {
  isOpen = false;

  constructor(public cartService: CartService, private elementRef: ElementRef) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  itemPrice(price: number, salePrice: number | null): number {
    return salePrice ?? price;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
