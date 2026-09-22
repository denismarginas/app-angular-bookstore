import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactMessage, ContactMessagePayload } from './contact';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  sendMessage(payload: ContactMessagePayload): Observable<ContactMessage> {
    return this.http.post<ContactMessage>('/api/contact', payload);
  }
}
