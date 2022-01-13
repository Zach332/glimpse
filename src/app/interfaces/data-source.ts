import { DataSourceId } from './data-source-id';

export interface DataSource {
  readonly dataSourceId: DataSourceId;
  name: string;
}
