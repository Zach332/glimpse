import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageData } from './interfaces/page-data';
import { TabPageData } from './interfaces/tab-page-data';
import { PageDataType } from './interfaces/page-data-type';
import { SavedPageData } from './interfaces/saved-page-data';
import { HistoryPageData } from './interfaces/history-page-data';
import { SavedFolder } from './interfaces/saved-folder';

export class DataService {
  static getDB() {
    return openDB<Schema>('glimpse', 2, {
      upgrade(db) {
        const store = db.createObjectStore('pageData', { autoIncrement: true, keyPath: 'id' });
        db.createObjectStore('savedFolder', { autoIncrement: true, keyPath: 'id' });
        store.createIndex('tabId', 'tabId');
        store.createIndex('type', 'type');
      },
    });
  }

  static async upsertSavedFolder(savedFolder: SavedFolder) {
    return (await DataService.getDB()).put('savedFolder', savedFolder);
  }

  static async getAllSavedFolders(): Promise<SavedFolder[]> {
    return (await DataService.getDB()).getAll('savedFolder');
  }

  static async getSavedFolder(id: number) {
    return (await DataService.getDB()).get('savedFolder', id);
  }

  static async insertPageData(pageData: PageData) {
    return (await DataService.getDB()).add('pageData', pageData);
  }

  static async getAllPageData() {
    return (await DataService.getDB()).getAll('pageData');
  }

  static async getAllTabPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'type',
      PageDataType.Tab,
    ) as Promise<TabPageData[]>;
  }

  static async getAllSavedPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'type',
      PageDataType.Saved,
    ) as Promise<SavedPageData[]>;
  }

  static async getAllHistoryPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'type',
      PageDataType.History,
    ) as Promise<HistoryPageData[]>;
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

  static async upsertPageData(pageData: PageData) {
    (await DataService.getDB()).put('pageData', pageData);
  }

  static async deletePageData(id: number) {
    (await DataService.getDB()).delete('pageData', id);
  }
}
