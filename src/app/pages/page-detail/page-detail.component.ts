import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeroComponent } from '../../hero/hero.component';
import { Page } from '../page';
import { PagesService } from '../pages.service';

@Component({
  selector: 'app-page-detail',
  standalone: true,
  imports: [RouterLink, HeroComponent],
  templateUrl: './page-detail.component.html',
  styleUrl: './page-detail.component.css'
})
export class PageDetailComponent implements OnInit {
  page?: Page;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private pagesService: PagesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.page = undefined;
      this.notFound = false;

      this.pagesService.getPage(slug).subscribe({
        next: page => {
          this.page = page;
        },
        error: () => {
          this.notFound = true;
        }
      });
    });
  }
}
