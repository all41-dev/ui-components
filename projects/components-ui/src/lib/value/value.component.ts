import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { BaseColumn, ReadonlyColumn } from '../../model/column';
import { RecordListComponent } from '../record-list/record-list.component';
import { RecordComponent } from '../record/record.component';

@Component({
  selector: 'ift-abstract-value',
  template: '<div>abstract component, do not use</div>',
})
export abstract class ValueComponent implements OnInit {
  public get isEdit(): boolean {
    let displaySetting = this.parentIsList ? this.columnLayout.listDisplay : this.columnLayout.detailDisplay;
    if (typeof displaySetting === 'function') displaySetting = displaySetting(this.record);
    const recordIsNew = !this.record['__primaryKey'];

    switch (displaySetting) {
      case 'update':
        return true; // update means create and update
      case 'create':
        return recordIsNew;
      default:
        return false;
    }
  }
  @Input() public hasFocus = false;
  @Input() public modified: boolean;
  @Input() public parentComponent: RecordComponent<any>|RecordListComponent<any>;
  @Input() public columnLayout?: BaseColumn<any>;
  @Input() public record: any;
  @Output() public modifiedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public tabEvent: EventEmitter<any> = new EventEmitter<any>();
  private get parentIsList(): boolean { return this.parentComponent instanceof RecordListComponent; }

  public value: any; // to be overridden with correct type in derived classes

  protected isValueInitialized = false;
  protected initialValue: any;

  public get html(): string {
    if(!this.isEdit && (this.columnLayout as ReadonlyColumn<any>).html) {
      const html = (this.columnLayout as ReadonlyColumn<any>).html;
      return typeof html === 'string' ? html : html(this.parentComponent, this.record);
    }
    // console.debug(`prop value: ${this.value}`);
    return ['', null].includes(this.value) ? '&nbsp;' : this.value;
  }

  public ngOnInit(): void {
    this.initialValue = this.value = this.record[this.columnLayout.recordProperty];
  }

  public tab(event): void {
    this.tabEvent.emit(event);
  }

  public focus(input, event): void {
    if (!this.isEdit) {
      if (!(this.columnLayout as ReadonlyColumn<any>).onClick) { return; }
      // onClick is set
      event.stopPropagation();
      event.preventDefault();
      console.debug('onClick is set');
      (this.columnLayout as ReadonlyColumn<any>).onClick(this.parentComponent, this.record);
      return;
    }
    if (event.explicitOriginalTarget !== event.currentTarget || !((this.columnLayout as any)?.editType === 'checkbox')) {
      event.stopPropagation();
      event.preventDefault();  
    }

    if (!this.isValueInitialized) {
      this.initialValue = this.value;
      this.isValueInitialized = true;
    }
    this.hasFocus = true;

    this.respondToVisibility(input, (visible): void => {
      if (visible) {
        if (input.select !== undefined) {
          input.select();
        }
        input.focus();
      } else {
        // console.info('invisible');
      }
    });
  }

  public respondToVisibility = function(element, callback): void {
    const options = {
      root: element.parentElement
    };

    const observer = new IntersectionObserver((entries, obs): void => {
      entries.forEach((entry): void => {
        if (entry.isIntersecting) {
          callback(true);
          obs.disconnect();
        }
      });
    }, options);

    observer.observe(element);
  };
}
