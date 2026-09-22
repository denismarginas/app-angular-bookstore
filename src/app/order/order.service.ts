import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PlaceOrderPayload } from './order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(payload: PlaceOrderPayload): Observable<Order> {
    return this.http.post<Order>('/api/orders', payload);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }
}
