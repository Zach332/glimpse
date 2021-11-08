import { DataSourceType } from './data-source-type';

export type PageId =
  // [type, windowId, tabId]
  | [DataSourceType.Window, number, number]
  // [type, folderId, bookmarkId]
  // folderId is id of BookmarkTreeNode directly below glimpse root folder
  // bookmarkId is id of BookmarkTreeNode with page url
  | [DataSourceType.Folder, string, string];
