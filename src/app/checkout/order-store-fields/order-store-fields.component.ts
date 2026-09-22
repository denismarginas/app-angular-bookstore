import { Component, OnInit } from '@angular/core';
import { Store } from './store';
import { StoreService } from './store.service';

@Component({
  selector: 'app-order-store-fields',
  standalone: true,
  imports: [],
  templateUrl: './order-store-fields.component.html',
  styleUrl: './order-store-fields.component.css'
})
export class OrderStoreFieldsComponent implements OnInit {
  store?: Store;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.storeService.getStore().subscribe(store => {
      this.store = store;
    });
  }
}
