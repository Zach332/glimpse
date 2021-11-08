import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageId } from './interfaces/page-id';
import { Settings } from './interfaces/settings';
import { DataSourceType } from './interfaces/data-source-type';
import { BookmarkService } from './bookmark-service';

export class IDBService {
  static readonly SETTINGS_ID = 'settings';

  static readonly pageObjectStores: ['images', 'favicons', 'accessTimes'] = [
    'images',
    'favicons',
    'accessTimes',
  ];

  static readonly dataSourceObjectStores: ['names'] = ['names'];

  static getDB() {
    return openDB<Schema>('glimpse', 12, {
      upgrade(db) {
        db.createObjectStore('images');
        db.createObjectStore('favicons');
        db.createObjectStore('names');
        db.createObjectStore('settings');
        db.createObjectStore('accessTimes');
      },
    });
  }

  static async putImage(pageId: PageId, image: string) {
    return (await this.getDB()).put('images', image, pageId);
  }

  static async getImage(pageId: PageId) {
    return (await this.getDB()).get('images', pageId);
  }

  static async putFavicon(pageId: PageId, favicon: string) {
    return (await this.getDB()).put('favicons', favicon, pageId);
  }

  static async getFavicon(pageId: PageId) {
    return (await this.getDB()).get('favicons', pageId);
  }

  static async putName(windowId: number, name: string) {
    return (await this.getDB()).put('names', name, windowId);
  }

  static async getName(windowId: number) {
    return (await this.getDB()).get('names', windowId);
  }

  static async putSettings(settings: Settings) {
    return (await this.getDB()).put('settings', settings, this.SETTINGS_ID);
  }

  static async getSettings() {
    return (await this.getDB()).get('settings', this.SETTINGS_ID);
  }

  static async putTimeLastAccessed(pageId: PageId, timeLastAccessed: number) {
    return (await this.getDB()).put('accessTimes', timeLastAccessed, pageId);
  }

  static async getTimeLastAccessed(pageId: PageId) {
    return (await this.getDB()).get('accessTimes', pageId);
  }

  static async deleteSessionData() {
    const keys = Promise.all(
      this.pageObjectStores.map(async (objectStore) => {
        return (await this.getDB()).getAllKeys(objectStore);
      }),
    ).then((keyLists) => {
      return keyLists.reduce((a, b) => {
        return a.concat(b);
      });
    });

    const bookmarkIds = new Set(
      (await BookmarkService.getRootGlimpseFolder()).children!.map((bookmark) => {
        return bookmark.id;
      }),
    );

    const keysToDelete = [...new Set(await keys)].filter((pageId) => {
      // Delete all page data
      if (pageId[0] === DataSourceType.Window) {
        return true;
      }
      // Delete data for bookmarks that no longer exist

      return !bookmarkIds.has(pageId[1]);
    });

    keysToDelete.forEach((pageId) => {
      this.deletePageData(pageId);
    });

    this.dataSourceObjectStores.forEach(async (objectStore) => {
      (await this.getDB()).clear(objectStore);
    });
  }

  static async deletePageData(pageId: PageId) {
    this.pageObjectStores.forEach(async (objectStore) => {
      (await this.getDB()).delete(objectStore, pageId);
    });
  }
}
