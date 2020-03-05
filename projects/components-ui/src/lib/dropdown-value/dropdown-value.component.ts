import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';
import { Option } from '../../model/column';

@Component({
  selector: 'ift-dropdown-value',
  templateUrl: './dropdown-value.component.html',
  styleUrls: ['./dropdown-value.component.css']
})
export class DropdownValueComponent extends ValueComponent {
  @Input() public value: any;
  @Input() public options: Option[]|(() => Option[]) = [];
  // @Input() options = [];
  @Output() public valueChange: EventEmitter<number> = new EventEmitter<any>();

  public get optionsArr(): Option[] {
    return (Array.isArray(this.options) ?
      this.options : this.options());
  }

  protected initialValue: any;

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

  public get displayValue(): string {
    const res = this.optionsArr.find((opt): boolean => opt.value === this.value);

    return res === undefined ? this.value : res.label;
  }
}
