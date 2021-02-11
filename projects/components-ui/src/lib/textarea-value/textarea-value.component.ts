import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';

@Component({
  selector: 'ift-textarea-value',
  templateUrl: './textarea-value.component.html',
  styleUrls: ['./textarea-value.component.css']
})
export class TextareaValueComponent extends ValueComponent {
  @Input() public value: any;
  @Output() public valueChange: EventEmitter<string> = new EventEmitter<string>();

  protected initialValue: string;

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
  public stringify(value: unknown): string {
    switch (typeof value) {
      case 'string':
        return value === '' ? '&nbsp;' : value;
      case 'object':
        return JSON.stringify(value, null, 2);
      default:
        return value === undefined ?
          '&nbsp;' :
          value.toString();
    }
  }
}
