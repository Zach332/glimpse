import { PageDataSource } from './page-data-source';

export interface PageData {
  id: number;
  title: string;
  url: string;
  image: string;
  type: PageDataSource;
}
