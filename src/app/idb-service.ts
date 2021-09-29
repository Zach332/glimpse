import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { DataSourceId } from './interfaces/data-source-id';

export class IDBService {
  static getDB() {
    return openDB<Schema>('glimpse', 8, {
      upgrade(db) {
        db.createObjectStore('images');
        db.createObjectStore('names');
      },
    });
  }

  static async putImage(dataSourceId: DataSourceId, image: string) {
    return (await this.getDB()).put('images', image, dataSourceId);
  }

  static async getImage(dataSourceId: DataSourceId) {
    return (await this.getDB()).get('images', dataSourceId);
  }

  static async putName(windowId: number, name: string) {
    return (await this.getDB()).put('names', name, windowId);
  }

  static async getName(windowId: number) {
    return (await this.getDB()).get('names', windowId);
  }
}
