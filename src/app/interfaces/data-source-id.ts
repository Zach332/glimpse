import { DataSourceType } from './data-source-type';

export type DataSourceId = [DataSourceType.Window, number] | [DataSourceType.Folder, string];
