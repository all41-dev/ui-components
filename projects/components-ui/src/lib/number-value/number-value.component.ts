import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';

@Component({
  selector: 'ift-number-value',
  templateUrl: './number-value.component.html',
  styleUrls: ['./number-value.component.css']
})
export class NumberValueComponent extends ValueComponent {
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
