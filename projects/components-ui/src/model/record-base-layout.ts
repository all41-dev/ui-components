/* eslint-disable @typescript-eslint/member-ordering */
import { EventEmitter } from '@angular/core';
import {Column} from './column';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export class RecordBaseLayout<T> {
  type: { new(partial?: Partial<T>): T };
  columns: Column<T>[];
  entityUrl?: string;
  primaryKeyProperty: keyof T;

  private _getUrl?: string;
  public get getUrl(): string|undefined { return this._getUrl; }
  public set getUrl(value: string|undefined) {
    const actualGetUrl = this.actualGetUrl;
    this._getUrl = value;
    if (this.actualGetUrl !== actualGetUrl) this.actualGetUrlChange.emit(value);
  }

  public get actualGetUrl(): string|undefined { return this?.getUrl || this.entityUrl; }

  postUrl?: string;
  patchUrl?: string;
  deleteUrl?: string;
  title?: string;
  getScope?: string|string[];
  postScope?: string|string[];
  patchScope?: string|string[];
  deleteScope?: string|string[];
  entityScope?: string|string[];
  loadOnInit?: boolean;
  initRecord?: (args: T) => Promise<T>;
  
  public actualGetUrlChange: EventEmitter<string|undefined> = new EventEmitter<string|undefined>();
}
