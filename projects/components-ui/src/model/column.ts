/* eslint-disable @typescript-eslint/interface-name-prefix */
import { RecordComponent } from '../lib/record/record.component';
import { RecordListComponent } from '../lib/record-list/record-list.component';
import { RecordListLayout } from './record-list-layout';

export class BaseColumn<T> {
  label: string;
  recordProperty: keyof T|undefined;
  listDisplay: 'none' | 'read' | 'create' | 'update' | ((rec: T) => 'none' | 'read' | 'create' | 'update');
  detailDisplay: 'none' | 'read' | 'create' | 'update' | ((rec: T) => 'none' | 'read' | 'create' | 'update');
  width?: string;
  isValid?: (record: T) => boolean;
  filterValue?: string;
  isFilterVisible?: boolean;
  onChange?: (rec: T, recList: T[]) => void;

  parent?: RecordListLayout<T>;

  private _orderDirection?: 'ASC' | 'DESC' | 'NONE';
  public get orderDirection(): 'ASC' | 'DESC' | 'NONE' { return this._orderDirection; }
  public set orderDirection(value: 'ASC' | 'DESC' | 'NONE') {
    if (value === this._orderDirection) return;
    if (!this.parent) throw new Error('parent is not set');
    if (!this.parent.order) {this.parent.order = [];}
    if (this._orderDirection && this._orderDirection !== 'NONE') {
      const orderElement = this.parent.order.find((oe) => oe.column === this);
      if (value === 'NONE') {
        if (this.parent.order) {
          if (orderElement) this.parent.order.splice(this.parent.order.indexOf(orderElement), 1);
        }
      } else {// value !== 'NONE'
        orderElement.direction = value;
      }
    } else {
      // this._orderDirection not set or set to 'NONE', means no entry in this.parent.order
      if (value !== 'NONE') {
        this.parent.order.push({ column: this as any, direction: value});
      }
    }
    this._orderDirection = value;
  }

  constructor(base: Partial<Column<T>>) {
    Object.assign(this, base);
  }

  public toJSON(): string {
    const res: any = {};
    Object.assign(res, this);
    delete res.parent;
    return JSON.stringify(res);
  }
}

export class ReadonlyColumn<T> extends BaseColumn<T> {
  listDisplay: 'none' | 'read';
  detailDisplay: 'none' | 'read';
  html?: ((parentComponent: RecordComponent<T>|RecordListComponent<T>, record: any) => string)|string;
  onClick?: (parentComponent: RecordComponent<T>|RecordListComponent<T>, record: any) => void;
}

export class EditableColumn<T> extends BaseColumn<T> {
  editType: 'text' | 'number' | 'checkbox' | 'date' | 'textarea' | 'dropdown' | 'typeahead' | 'password';
}

export class OptionsEditableColumn<T> extends EditableColumn<T> {
  editType: 'typeahead' | 'dropdown';
  options: Option[] | (() => Option[]);
}

export type Column<T> = ReadonlyColumn<T> | EditableColumn<T> | OptionsEditableColumn<T>;

export interface Option {
  value: any;
  label: string;
}
