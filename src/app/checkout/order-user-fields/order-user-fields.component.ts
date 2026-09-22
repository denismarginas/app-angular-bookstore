import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';

@Component({
  selector: 'app-order-user-fields',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './order-user-fields.component.html',
  styleUrl: './order-user-fields.component.css'
})
export class OrderUserFieldsComponent {
  @Input({ required: true }) formGroup!: FormGroup;
}
