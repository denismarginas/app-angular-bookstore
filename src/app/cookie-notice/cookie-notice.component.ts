import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const COOKIE_NOTICE_STORAGE_KEY = 'bookstore-cookie-notice-accepted';

@Component({
  selector: 'app-cookie-notice',
  standalone: true,
  imports: [],
  templateUrl: './cookie-notice.component.html',
  styleUrl: './cookie-notice.component.css'
})
export class CookieNoticeComponent implements OnInit {
  @Input() display = true;

  accepted = true;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.accepted = localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === 'true';
  }

  accept(): void {
    this.accepted = true;

    if (this.isBrowser) {
      localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, 'true');
    }
  }
}
