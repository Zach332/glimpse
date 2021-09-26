import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { GlimpseId } from './interfaces/glimpse-id';

export class IDBService {
  static getDB() {
    return openDB<Schema>('glimpse', 8, {
      upgrade(db) {
        db.createObjectStore('images');
        db.createObjectStore('names');
      },
    });
  }

  static async putImage(glimpseId: GlimpseId, image: string) {
    return (await this.getDB()).put('images', image, glimpseId);
  }

  static async getImage(glimpseId: GlimpseId) {
    return (await this.getDB()).get('images', glimpseId);
  }

  static async putName(windowId: number, name: string) {
    return (await this.getDB()).put('names', name, windowId);
  }

  static async getName(windowId: number) {
    return (await this.getDB()).get('names', windowId);
  }
}
