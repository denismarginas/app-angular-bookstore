import { Inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RegisterPayload, User } from './user';

const USER_STORAGE_KEY = 'bookstore-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  private isBrowser: boolean;

  currentUser = this.userSignal.asReadonly();
  isLoggedIn = computed(() => this.userSignal() !== null);
  isAdmin = computed(() => this.userSignal()?.role === 'Admin');

  constructor(@Inject(PLATFORM_ID) platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      this.userSignal.set(raw ? JSON.parse(raw) : null);
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>('/api/login', { email, password }).pipe(tap(user => this.setUser(user)));
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>('/api/register', payload).pipe(tap(user => this.setUser(user)));
  }

  updateUser(id: number, changes: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, changes).pipe(tap(user => this.setUser(user)));
  }

  logout(): void {
    this.setUser(null);
  }

  private setUser(user: User | null): void {
    this.userSignal.set(user);

    if (!this.isBrowser) {
      return;
    }

    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }
}
