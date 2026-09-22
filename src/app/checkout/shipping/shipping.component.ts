import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LocalTransportComponent } from './local-transport/local-transport.component';
import { TakeFromStoreComponent } from './take-from-store/take-from-store.component';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [LocalTransportComponent, TakeFromStoreComponent],
  templateUrl: './shipping.component.html',
  styleUrl: './shipping.component.css'
})
export class ShippingComponent {
  @Input({ required: true }) control!: FormControl<string>;
}
