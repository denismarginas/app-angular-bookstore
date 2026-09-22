import { Inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Book } from '../books/books';
import { CartItem } from './cart';

const CART_STORAGE_KEY = 'bookstore-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);
  private isBrowser: boolean;

  items = this.itemsSignal.asReadonly();

  itemCount = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0));

  subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + this.itemPrice(item) * item.quantity, 0)
  );

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      this.itemsSignal.set(raw ? JSON.parse(raw) : []);
    }
  }

  itemPrice(item: CartItem): number {
    return item.sale_price ?? item.price;
  }

  addToCart(book: Book, quantity: number = 1): void {
    const items = this.itemsSignal();
    const existing = items.find(item => item.id === book.id);

    if (existing) {
      this.setItems(
        items.map(item => (item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item))
      );
      return;
    }

    this.setItems([
      ...items,
      {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        sale_price: book.sale_price,
        feature_image: book.feature_image,
        quantity
      }
    ]);
  }

  updateQuantity(id: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }

    this.setItems(this.itemsSignal().map(item => (item.id === id ? { ...item, quantity } : item)));
  }

  removeFromCart(id: number): void {
    this.setItems(this.itemsSignal().filter(item => item.id !== id));
  }

  clearCart(): void {
    this.setItems([]);
  }

  private setItems(items: CartItem[]): void {
    this.itemsSignal.set(items);

    if (this.isBrowser) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }
}
