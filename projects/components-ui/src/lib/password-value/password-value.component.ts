import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';

@Component({
  selector: 'ift-password-value',
  templateUrl: './password-value.component.html',
  styleUrls: ['./password-value.component.css']
})
export class PasswordValueComponent extends ValueComponent {
  @Input() public value: string;
  @Output() public valueChange: EventEmitter<string> = new EventEmitter<string>();

  protected initialValue: string;

  public constructor() { super(); }

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
