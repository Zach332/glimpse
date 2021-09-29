import { DataSourceType } from './data-source-type';

export type PageId =
  | [DataSourceType.Window, number, number]
  | [DataSourceType.Folder, string, string];
