import {RecordBaseLayout} from './record-base-layout';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface RecordLayout<T> extends RecordBaseLayout<T> {
  labelsWidth: string | undefined;
  valuesWidth: string | undefined;
  save?: (record: T) => Promise<T>;
  load?: (record: T) => T;
  onChange?: (rec: T) => void;
}
