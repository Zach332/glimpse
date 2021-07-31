import { DBSchema } from 'idb';
import { PageData } from './page-data';
import { PageDataType } from './page-data-type';
import { SavedFolder } from './saved-folder';

export interface Schema extends DBSchema {
  savedFolder: {
    key: number;
    value: SavedFolder;
  };
  pageData: {
    key: number;
    value: PageData;
    indexes: { tabId: number; type: PageDataType };
  };
}
