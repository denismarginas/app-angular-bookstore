import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '../pages/page';
import { PagesService } from '../pages/pages.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  pages: Page[] = [];

  constructor(private pagesService: PagesService) {}

  ngOnInit(): void {
    this.pagesService.getPages().subscribe(pages => {
      this.pages = pages;
    });
  }
}
