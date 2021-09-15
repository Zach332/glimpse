import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { GlimpseId } from './interfaces/glimpse-id';

export class ImageService {
  static getDB() {
    return openDB<Schema>('glimpse', 7, {
      upgrade(db) {
        db.createObjectStore('images');
      },
    });
  }

  static async putImage(glimpseId: GlimpseId, image: string) {
    return (await this.getDB()).put('images', image, glimpseId);
  }

  static async getImage(glimpseId: GlimpseId) {
    return (await this.getDB()).get('images', glimpseId);
  }
}
