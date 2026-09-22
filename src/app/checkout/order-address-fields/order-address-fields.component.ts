import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';

@Component({
  selector: 'app-order-address-fields',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './order-address-fields.component.html',
  styleUrl: './order-address-fields.component.css'
})
export class OrderAddressFieldsComponent {
  @Input({ required: true }) formGroup!: FormGroup;
}
