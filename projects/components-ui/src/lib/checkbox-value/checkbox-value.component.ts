import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';

@Component({
  selector: 'ift-checkbox-value',
  templateUrl: './checkbox-value.component.html',
  styleUrls: ['./checkbox-value.component.css']
})
export class CheckboxValueComponent extends ValueComponent {
  @Input() public value: number;
  @Output() public valueChange: EventEmitter<number> = new EventEmitter<number>();

  protected initialValue: number;

  public constructor() {
    super();
  }

  public blur(): void {
    this.hasFocus = false;
    const modified = this.value !== this.initialValue;
    if (this.modified !== modified) {
      this.modified = modified;
      this.modifiedChange.emit(this.modified);
    }
    this.valueChange.emit(this.value);
  }
}
