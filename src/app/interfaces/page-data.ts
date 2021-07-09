import { Selectable } from './selectable';

export interface PageData extends Selectable {
  title: string;
  url: string;
  imageUrl: string;
}
