import { PageDataSource } from './page-data-source';

export interface PageData {
  readonly id: number;
  title: string;
  url: string;
  image: string;
  type: PageDataSource;
}
