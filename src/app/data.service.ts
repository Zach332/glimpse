import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageData } from './interfaces/page-data';
import { TabPageData } from './interfaces/tab-page-data';

export class DataService {
  static getDB() {
    return openDB<Schema>('glimpse', 1, {
      upgrade(db) {
        const store = db.createObjectStore('pageData', { autoIncrement: true, keyPath: 'id' });
        store.createIndex('tabId', 'tabId');
      },
    });
  }

  static async insertPageData(pageData: PageData) {
    return (await DataService.getDB()).add('pageData', pageData);
  }

  static async getAllPageData() {
    return (await DataService.getDB()).getAll('pageData');
  }

  static async getPageDataCount() {
    return (await DataService.getDB()).count('pageData');
  }

  static async getPageData(id: number) {
    return (await DataService.getDB()).get('pageData', id);
  }

  static async getTabPageData(tabId: number): Promise<TabPageData | undefined> {
    return (await DataService.getDB()).getFromIndex('pageData', 'tabId', tabId) as Promise<
      TabPageData | undefined
    >;
  }

  static async updatePageData(pageData: PageData) {
    (await DataService.getDB()).put('pageData', pageData);
  }

  static async deletePageData(id: number) {
    (await DataService.getDB()).delete('pageData', id);
  }
}
