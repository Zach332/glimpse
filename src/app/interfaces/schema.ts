import { DBSchema } from 'idb';
import { DataSourceId } from './data-source-id';

export interface Schema extends DBSchema {
  images: {
    key: DataSourceId;
    value: string;
  };
  names: {
    key: number;
    value: string;
  };
}
