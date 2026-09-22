import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-selectable-option',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './selectable-option.component.html',
  styleUrl: './selectable-option.component.css'
})
export class SelectableOptionComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) description!: string;
  @Input() price: number | null = null;
}
