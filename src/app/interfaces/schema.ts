import { DBSchema } from 'idb';
import { PageData } from './page-data';

export interface Schema extends DBSchema {
  pageData: {
    key: number;
    value: PageData;
    indexes: { tabId: number };
  };
}
