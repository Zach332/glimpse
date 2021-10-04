import { DBSchema } from 'idb';
import { PageId } from './page-id';

export interface Schema extends DBSchema {
  images: {
    key: PageId;
    value: string;
  };
  names: {
    key: number;
    value: string;
  };
}
