import { PageId } from './page-id';

export interface Page {
  readonly pageId: PageId;
  title: string;
  url: string;
  loading?: boolean;
  favicon: string | undefined;
  image: string | undefined;
  timeLastAccessed: number;
}
