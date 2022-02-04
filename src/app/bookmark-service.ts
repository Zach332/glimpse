import { Mutex } from 'async-mutex';
import * as browser from 'webextension-polyfill';

export class BookmarkService {
  static readonly GLIMPSE_BOOKMARK_FOLDER_NAME = 'glimpse-saved';

  static mutex = new Mutex();

  static async getRootGlimpseFolder() {
    return this.mutex.runExclusive(async () => {
      const otherBookmarksNode = (await browser.bookmarks.getTree())[0].children!.filter(
        (treeNode) => treeNode.title === 'Other bookmarks' || treeNode.title === 'Other Bookmarks',
      )[0];
      const filteredBookmarks = otherBookmarksNode.children!.filter(
        (treeNode) => treeNode.title === this.GLIMPSE_BOOKMARK_FOLDER_NAME,
      );
      // Create root glimpse folder
      if (filteredBookmarks.length === 0) {
        return await browser.bookmarks.create({
          parentId: otherBookmarksNode.id,
          title: this.GLIMPSE_BOOKMARK_FOLDER_NAME,
        });
      }
      return filteredBookmarks[0];
    });
  }
}
