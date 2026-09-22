import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole } from '../account/user';
import { Order, OrderAddress, OrderCustomer, OrderPayment, OrderShipping } from '../order/order';
import { OrderStatus } from '../order/order-status';
import { Book } from '../books/books';
import { ContactMessage } from '../contact/contact';

export interface AdminOrderPayload {
  status: OrderStatus;
  date?: string;
  customer: OrderCustomer;
  address: OrderAddress;
  items: { id: number; quantity: number }[];
  shipping: OrderShipping;
  payment: OrderPayment;
}

export interface AdminBookPayload {
  slug?: string;
  title: string;
  author: string;
  price: number;
  sale_price: number | null;
  date_published: string;
  quantity: number;
  in_stock: boolean;
  description: string;
  feature_image: string;
  images: string[];
}

export interface AdminUserPayload {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  address: User['address'];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers(adminId: number): Observable<User[]> {
    const params = new HttpParams().set('admin_id', adminId);
    return this.http.get<User[]>('/api/admin/users', { params });
  }

  getUser(userId: number, adminId: number): Observable<User> {
    const params = new HttpParams().set('admin_id', adminId);
    return this.http.get<User>(`/api/admin/users/${userId}`, { params });
  }

  createUser(payload: AdminUserPayload, adminId: number): Observable<User> {
    return this.http.post<User>('/api/admin/users', { ...payload, admin_id: adminId });
  }

  updateUser(userId: number, payload: Partial<AdminUserPayload>, adminId: number): Observable<User> {
    return this.http.put<User>(`/api/admin/users/${userId}`, { ...payload, admin_id: adminId });
  }

  updateUserRole(userId: number, role: UserRole, adminId: number): Observable<User> {
    return this.http.put<User>(`/api/admin/users/${userId}/role`, { role, admin_id: adminId });
  }

  createOrder(payload: AdminOrderPayload, adminId: number): Observable<Order> {
    return this.http.post<Order>('/api/admin/orders', { ...payload, admin_id: adminId });
  }

  updateOrder(orderId: number, payload: AdminOrderPayload, adminId: number): Observable<Order> {
    return this.http.put<Order>(`/api/admin/orders/${orderId}`, { ...payload, admin_id: adminId });
  }

  updateOrderStatus(orderId: number, status: OrderStatus, adminId: number): Observable<Order> {
    return this.http.put<Order>(`/api/admin/orders/${orderId}/status`, { status, admin_id: adminId });
  }

  createBook(payload: AdminBookPayload, adminId: number): Observable<Book> {
    return this.http.post<Book>('/api/admin/books', { ...payload, admin_id: adminId });
  }

  updateBook(bookId: number, payload: AdminBookPayload, adminId: number): Observable<Book> {
    return this.http.put<Book>(`/api/admin/books/${bookId}`, { ...payload, admin_id: adminId });
  }

  uploadBookImage(filename: string, data: string, adminId: number): Observable<{ path: string }> {
    return this.http.post<{ path: string }>('/api/admin/books/upload-image', {
      filename,
      data,
      admin_id: adminId
    });
  }

  getContactMails(adminId: number): Observable<ContactMessage[]> {
    const params = new HttpParams().set('admin_id', adminId);
    return this.http.get<ContactMessage[]>('/api/admin/contact-mails', { params });
  }
}
