import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from './store';

@Injectable({ providedIn: 'root' })
export class StoreService {
  constructor(private http: HttpClient) {}

  getStore(): Observable<Store> {
    return this.http.get<Store>('/api/store');
  }
}
