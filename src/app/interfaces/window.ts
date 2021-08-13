import { DataSource } from './data-source';

export interface WindowDataSource extends DataSource {
  windowId: number;
}
