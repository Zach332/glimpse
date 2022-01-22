import { DBSchema } from 'idb';
import { PageId } from './page-id';

export interface Schema extends DBSchema {
  images: {
    key: PageId;
    value: string;
  };
  favicons: {
    key: PageId;
    value: string;
  };
  names: {
    // TODO: Change to DataSourceId
    key: number;
    value: string;
  };
  accessTimes: {
    key: PageId;
    value: number;
  };
}
