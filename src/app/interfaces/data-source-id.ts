import { DataSourceType } from './data-source-type';

export type DataSourceId =
  // [type, windowId]
  | [DataSourceType.Window, number]
  // [type, folderId]
  // folderId is id of BookmarkTreeNode directly below glimpse root folder
  | [DataSourceType.Folder, string];
