import { PageId } from './page-id';

export interface Page {
  readonly pageId: PageId;
  title: string;
  url: string;
  loading?: boolean;
  faviconUrl: Promise<string | undefined>;
  image: Promise<string | undefined>;
  timeLastAccessed: Promise<number>;
}
