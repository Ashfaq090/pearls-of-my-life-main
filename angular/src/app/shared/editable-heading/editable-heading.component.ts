import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editable-heading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editable-heading.component.html',
  styleUrls: ['./editable-heading.component.scss']
})
export class EditableHeadingComponent {

  @Input() text: string = '';
  @Output() readonly newValue = new EventEmitter<any>();
  showEdit: boolean = false;

  onSubmit() {
    this.showEdit = false;
    this.newValue.emit(this.text);
  }

}
