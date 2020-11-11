import { Column } from './column';
import { EventEmitter } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export class RecordListLayout<T> {
  type!: { new(partial?: Partial<T>): T } | false;
  columns!: Column<T>[];
  entityUrl?: string;
  primaryKeyProperty!: keyof T;
  postUrl?: string;
  patchUrl?: string;
  deleteUrl?: string;
  title?: string;
  getScope?: string | string[];
  postScope?: string | string[];
  patchScope?: string | string[];
  deleteScope?: string | string[];
  entityScope?: string | string[];
  loadOnInit?: boolean;

  public get getUrl(): string | undefined { return this._getUrl; }
  public set getUrl(value: string | undefined) {
    const actualGetUrl = this.actualGetUrl;
    this._getUrl = value;
    if (this.actualGetUrl !== actualGetUrl) this.actualGetUrlChange.emit(value);
  }

  public get actualGetUrl(): string | undefined { return this?.getUrl || this.entityUrl; }

  initRecord?: (args: T) => Promise<T>;

  // from RecordLayout
  labelsWidth!: string | undefined;
  valuesWidth!: string | undefined;

  public actualGetUrlChange: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
  height: number;
  /** @default None */
  selectionType?: 'none' | 'single' | 'multiple';
  /** @default click */
  selectionTrigger?: 'click' | 'dblclick' | 'contextmenu' | ('click' | 'dblclick' | 'contextmenu')[];
  /** @default false */
  isDeleteEnabled?: boolean;
  /** @default false */
  isAddEnabled?: boolean;
  save?: (record: T[]) => Promise<T[]>;
  newRecTemplate?: any;
  dblClick?: (record: T) => void;
  click?: (record: T) => void;
  load?: (records: T[]) => T[];
  /** @default all records (no pagination) */
  chunkSize?: number;
  onRecChange?: (rec: T, recList: T[]) => void;
  /**
   * @description active only if selectionType is single
   * @default none
   * */
  detailPosition?: 'none' | 'bottom' | 'right' | 'top' | 'left';
  order?: {column: Column<T>; direction: 'ASC' | 'DESC' }[];

  private _getUrl?: string;

  constructor(initValue: Partial<RecordListLayout<T>>) {
    Object.assign(this, initValue);
  }
}
