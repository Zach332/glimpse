import { PageId } from './page-id';

export interface Page {
  readonly pageId: PageId;
  title: string;
  url: string;
  faviconUrl: string | undefined;
  image: string | undefined;
}
