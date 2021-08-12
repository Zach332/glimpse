import { DataSourceType } from './data-source-type';

export interface DataSource {
  id: number;
  name: string;
  type: DataSourceType;
}
