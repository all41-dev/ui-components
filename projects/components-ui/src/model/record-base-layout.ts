import {Column} from './column';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface RecordBaseLayout<T> {
  columns: Column<T>[];
  entityUrl: string;
  primaryKeyProperty: keyof T;
  getUrl?: string;
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
}
