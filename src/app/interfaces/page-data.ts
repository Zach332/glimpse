import { DataSourceType } from './data-source-type';

export interface PageData {
  readonly id: number;
  title: string;
  url: string;
  image: string;
  source: DataSourceType;
  timestamp: Date;
}
