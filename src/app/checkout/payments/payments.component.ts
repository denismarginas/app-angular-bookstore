import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PayWithCashComponent } from './pay-with-cash/pay-with-cash.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [PayWithCashComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {
  @Input({ required: true }) control!: FormControl<string>;
}
