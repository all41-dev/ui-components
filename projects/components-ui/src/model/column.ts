/* eslint-disable @typescript-eslint/interface-name-prefix */
import { RecordComponent } from '../lib/record/record.component';
import { RecordListComponent } from '../lib/record-list/record-list.component';

export interface BaseColumn<T> {
  label: string;
  recordProperty: keyof T|undefined;
  listDisplay: 'none' | 'read' | 'create' | 'update';
  detailDisplay: 'none' | 'read' | 'create' | 'update';
  width?: string;
  isValid?: (record: any) => boolean;
  filterValue?: string;
  isFilterVisible?: boolean;
  onChange?: (rec: T, recList: T[]) => void;
}

export interface ReadonlyColumn<T> extends BaseColumn<T> {
  listDisplay: 'none' | 'read';
  detailDisplay: 'none' | 'read';
  html?: ((parentComponent: RecordComponent<T>|RecordListComponent<T>, record: any) => string)|string;
  onClick?: (parentComponent: RecordComponent<T>|RecordListComponent<T>, record: any) => void;
}

export interface EditableColumn<T> extends BaseColumn<T> {
  editType: 'text' | 'number' | 'date' | 'textarea' | 'dropdown' | 'typeahead' | 'password';
}

export interface OptionsEditableColumn<T> extends EditableColumn<T> {
  editType: 'typeahead' | 'dropdown';
  options: Option[] | (() => Option[]);
}

export type Column<T> = ReadonlyColumn<T> | EditableColumn<T> | OptionsEditableColumn<T>;

export interface Option {
  value: any;
  label: string;
}
