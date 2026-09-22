import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from './page';

@Injectable({ providedIn: 'root' })
export class PagesService {
  constructor(private http: HttpClient) {}

  getPages(): Observable<Page[]> {
    return this.http.get<Page[]>('/api/pages');
  }

  getPage(slug: string): Observable<Page> {
    return this.http.get<Page>(`/api/pages/${slug}`);
  }
}
