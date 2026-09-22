import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectableOptionComponent } from '../../../shared/selectable-option/selectable-option.component';
import { PAYMENT_METHODS } from '../payment-method';

@Component({
  selector: 'app-pay-with-cash',
  standalone: true,
  imports: [SelectableOptionComponent],
  templateUrl: './pay-with-cash.component.html'
})
export class PayWithCashComponent {
  @Input({ required: true }) control!: FormControl<string>;
  readonly method = PAYMENT_METHODS.find(method => method.id === 'cash')!;
}
