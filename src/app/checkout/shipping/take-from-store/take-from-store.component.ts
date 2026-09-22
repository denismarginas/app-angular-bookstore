import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectableOptionComponent } from '../../../shared/selectable-option/selectable-option.component';
import { SHIPPING_METHODS } from '../shipping-method';

@Component({
  selector: 'app-take-from-store',
  standalone: true,
  imports: [SelectableOptionComponent],
  templateUrl: './take-from-store.component.html'
})
export class TakeFromStoreComponent {
  @Input({ required: true }) control!: FormControl<string>;
  readonly method = SHIPPING_METHODS.find(method => method.id === 'take_from_store')!;
}
