import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageId } from './interfaces/page-id';
import { Settings } from './interfaces/settings';

export class IDBService {
  static SETTINGS_ID = 'settings';

  static getDB() {
    return openDB<Schema>('glimpse', 9, {
      upgrade(db) {
        db.createObjectStore('images');
        db.createObjectStore('names');
        db.createObjectStore('settings');
      },
    });
  }

  static async putImage(pageId: PageId, image: string) {
    return (await this.getDB()).put('images', image, pageId);
  }

  static async getImage(pageId: PageId) {
    return (await this.getDB()).get('images', pageId);
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
}
