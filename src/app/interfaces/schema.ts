import { DBSchema } from 'idb';
import { PageData } from './page-data';
import { PageDataType } from './page-data-type';

export interface Schema extends DBSchema {
  pageData: {
    key: number;
    value: PageData;
    indexes: { tabId: number; type: PageDataType };
  };
}
