import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ValueComponent} from '../value/value.component';

@Component({
  selector: 'ift-date-value',
  templateUrl: './date-value.component.html',
  styleUrls: ['./date-value.component.css']
})
export class DateValueComponent extends ValueComponent {
  @Input() public value: Date | string | undefined;
  @Output() public valueChange: EventEmitter<Date | undefined> = new EventEmitter<Date | undefined>();

  protected initialValue: Date | undefined;

  public get strValue(): string | undefined {
    if (typeof this.value === 'string' || this.value === undefined || this.value === null) {
      return (this.value ? this.value : undefined) as string|undefined;
    }
    return this.value.toISOString().split('T')[0];
  }
  public set strValue(val: string | undefined) {
    this.value = val ? new Date(val) : undefined;
  }

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
    this.value = this.toDate(this.value);
    this.valueChange.emit(this.value);
  }

  private toDate(dateStr?: string|Date): Date|undefined {
    if(typeof dateStr === 'string') {
      return new Date(dateStr);
    }
    return dateStr;
  }
}
