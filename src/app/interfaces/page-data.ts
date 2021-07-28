import { PageDataType } from './page-data-type';

export interface PageData {
  id: number;
  title: string;
  url: string;
  image: string;
  type: PageDataType;
}
