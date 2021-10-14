import { DBSchema } from 'idb';
import { PageId } from './page-id';
import { Settings } from './settings';

export interface Schema extends DBSchema {
  images: {
    key: PageId;
    value: string;
  };
  names: {
    key: number;
    value: string;
  };
  settings: {
    key: string;
    value: Settings;
  };
}
