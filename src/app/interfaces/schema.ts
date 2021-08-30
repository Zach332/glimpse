import { DBSchema } from 'idb';
import { DataSource } from './data-source';
import { DataSourceType } from './data-source-type';
import { PageData } from './page-data';

export interface Schema extends DBSchema {
  pageData: {
    key: number;
    value: PageData;
    indexes: { tabId: number; windowId: number; folderId: number; source: DataSourceType };
  };
  dataSource: {
    key: number;
    value: DataSource;
    indexes: { type: DataSourceType };
  };
}
