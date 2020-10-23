import { Column } from './column';
import { RecordBaseLayout } from './record-base-layout';
// import { RecordLayout } from './record-layout';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export class RecordListLayout<T> extends RecordBaseLayout<T> {
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

  constructor(initValue: Partial<RecordListLayout<T>>) {
    super();
    Object.assign(this, initValue);
  }
}
