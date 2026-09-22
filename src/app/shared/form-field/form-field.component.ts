import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css'
})
export class FormFieldComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) label!: string;
  @Input() type = 'text';
}
