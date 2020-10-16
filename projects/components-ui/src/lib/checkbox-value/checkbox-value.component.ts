import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';

@Component({
  selector: 'ift-checkbox-value',
  templateUrl: './checkbox-value.component.html',
  styleUrls: ['./checkbox-value.component.css']
})
export class CheckboxValueComponent extends ValueComponent {
  @Input() public value: boolean;
  @Output() public valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  protected initialValue: boolean;

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
  public log(msg: any): void {
    console.log(msg);
  }
}
