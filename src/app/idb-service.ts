import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageId } from './interfaces/page-id';

export class IDBService {
  static getDB() {
    return openDB<Schema>('glimpse', 9, {
      upgrade(db) {
        db.deleteObjectStore('images');
        db.deleteObjectStore('names');
        db.createObjectStore('images');
        db.createObjectStore('names');
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
}
