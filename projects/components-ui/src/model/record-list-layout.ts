import { Column } from '@all41-dev/ui-components';
import {RecordBaseLayout} from './record-base-layout';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface RecordListLayout<T> extends RecordBaseLayout<T> {
  height: number;
  /** @default None */
  selectionType?: 'none' | 'single' | 'multiple';
  /** @default click */
  selectionTrigger?: 'click' | 'dblclick' | 'contextmenu' | ('click' | 'dblclick' | 'contextmenu')[];
  /** @default false */
  isDeleteEnabled?: boolean;
  /** @default false */
  isAddEnabled?: boolean;
  save?: (record: T[]) => void;
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
  order?: [{column: Column<T>; direction: 'ASC' | 'DESC' }];
}
