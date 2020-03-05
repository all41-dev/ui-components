/* eslint-disable @typescript-eslint/interface-name-prefix */
import { RecordComponent } from '../lib/record/record.component';
import { RecordListComponent } from '../lib/record-list/record-list.component';

export interface BaseColumn<T> {
  label: string;
  recordProperty: keyof T|undefined;
  isEditable: boolean;
  width?: string;
  isValid?: (record: any) => boolean;
  filterValue?: any;
  isFilterVisible?: boolean;
  onChange?: (rec: T, recList: T[]) => void;
}

export interface ReadonlyColumn<T> extends BaseColumn<T> {
  isEditable: false;
  html?: ((parentComponent: RecordComponent<T>|RecordListComponent<T>, record: any) => string)|string;
  onClick?: (parentComponent: RecordComponent<T>|RecordListComponent<T>, record: any) => void;
}

export interface EditableColumn<T> extends BaseColumn<T> {
  isEditable: true;
  editType: EditType;
}

export interface OptionsEditableColumn<T> extends EditableColumn<T> {
  editType: EditType.Dropdown|EditType.Typeahead;
  options: Option[] | (() => Option[]);
}

export type Column<T> = ReadonlyColumn<T>|EditableColumn<T>|OptionsEditableColumn<T>;

export enum EditType {
  Text,
  Number,
  Date,
  Textarea,
  Dropdown,
  Typeahead,
  Password
}

export interface Option {
  value: any;
  label: string;
}
