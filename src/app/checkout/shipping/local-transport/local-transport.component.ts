import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectableOptionComponent } from '../../../shared/selectable-option/selectable-option.component';
import { SHIPPING_METHODS } from '../shipping-method';

@Component({
  selector: 'app-local-transport',
  standalone: true,
  imports: [SelectableOptionComponent],
  templateUrl: './local-transport.component.html'
})
export class LocalTransportComponent {
  @Input({ required: true }) control!: FormControl<string>;
  readonly method = SHIPPING_METHODS.find(method => method.id === 'local_transport')!;
}
