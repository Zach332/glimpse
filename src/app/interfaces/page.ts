import { PageId } from './page-id';

export interface Page {
  readonly pageId: PageId;
  title: string;
  url: string;
  // TODO: Add favicon
  image: string | undefined;
}
