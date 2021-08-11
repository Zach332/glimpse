import { DBSchema } from 'idb';
import { PageData } from './page-data';
import { PageDataSource } from './page-data-source';
import { SavedFolder } from './saved-folder';

export interface Schema extends DBSchema {
  pageData: {
    key: number;
    value: PageData;
    indexes: { tabId: number; folderId: number; type: PageDataSource };
  };
  savedFolder: {
    key: number;
    value: SavedFolder;
  };
  window: {
    key: number;
    value: Window;
  };
}
