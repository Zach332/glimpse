import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageData } from './interfaces/page-data';
import { TabPageData } from './interfaces/tab-page-data';
import { PageDataSource } from './interfaces/page-data-source';
import { SavedPageData } from './interfaces/saved-page-data';
import { HistoryPageData } from './interfaces/history-page-data';
import { SavedFolder } from './interfaces/saved-folder';

export class DataService {
  static getDB() {
    return openDB<Schema>('glimpse', 4, {
      upgrade(db) {
        const pageDataStore = db.createObjectStore('pageData', {
          autoIncrement: true,
          keyPath: 'id',
        });
        pageDataStore.createIndex('tabId', 'tabId');
        pageDataStore.createIndex('folderId', 'folderId');
        pageDataStore.createIndex('type', 'type');
        db.createObjectStore('savedFolder', { autoIncrement: true, keyPath: 'folderId' });
        db.createObjectStore('window', { keyPath: 'windowId' });
        // TODO: Create RESERVED_IDS objects here
      },
    });
  }

  // Page data

  static async insertTabPageData(title: string, url: string, tabId: number) {
    return (await DataService.getDB()).add('pageData', <TabPageData>{
      title,
      url,
      tabId,
      timestamp: new Date(),
    });
  }

  static async convertTabToSavedPageData(tabId: number, folderId: number) {
    const tabPageData = await (await DataService.getDB()).getFromIndex('pageData', 'tabId', tabId);
    const savedPageData = tabPageData as SavedPageData;
    savedPageData.type = PageDataSource.Saved;
    savedPageData.folderId = folderId;
    savedPageData.timestamp = new Date();
    DataService.updatePageData(savedPageData);
  }

  static async convertTabToHistoryPageData(tabId: number) {
    const tabPageData = await DataService.getPageDataByTabId(tabId);
    const historyPageData = tabPageData as HistoryPageData;
    historyPageData.type = PageDataSource.History;
    historyPageData.timestamp = new Date();
    DataService.updatePageData(historyPageData);
  }

  static async getPageData(id: number) {
    return (await DataService.getDB()).get('pageData', id);
  }

  static async getAllPageData() {
    return (await DataService.getDB()).getAll('pageData');
  }

  static async getAllTabPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'type',
      PageDataSource.Tab,
    ) as Promise<TabPageData[]>;
  }

  static async getAllSavedPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'type',
      PageDataSource.Saved,
    ) as Promise<SavedPageData[]>;
  }

  static async getAllHistoryPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'type',
      PageDataSource.History,
    ) as Promise<HistoryPageData[]>;
  }

  static async getPageDataCount() {
    return (await DataService.getDB()).count('pageData');
  }

  static async getPageDataByTabId(tabId: number) {
    return (await DataService.getDB()).getFromIndex('pageData', 'tabId', tabId) as Promise<
      TabPageData | undefined
    >;
  }

  static async getPageDataByFolderId(folderId: number) {
    return (await DataService.getDB()).getFromIndex('pageData', 'folderId', folderId) as Promise<
      SavedPageData | undefined
    >;
  }

  static async updatePageData(pageData: PageData) {
    (await DataService.getDB()).put('pageData', pageData);
  }

  static async deletePageData(id: number) {
    (await DataService.getDB()).delete('pageData', id);
  }

  // Saved folders

  static async insertSavedFolder(name: string, folderId?: number) {
    return (await DataService.getDB()).add('savedFolder', <SavedFolder>{
      name,
      folderId,
    });
  }

  static async getSavedFolder(folderId: number) {
    return (await DataService.getDB()).get('savedFolder', folderId);
  }

  static async getAllSavedFolders() {
    return (await DataService.getDB()).getAll('savedFolder');
  }

  static async updateSavedFolder(savedFolder: SavedFolder) {
    (await DataService.getDB()).put('savedFolder', savedFolder);
  }

  static async deleteSavedFolder(folderId: number) {
    (await DataService.getDB()).delete('savedFolder', folderId);
  }

  // Windows

  static async upsertWindow(window: Window) {
    (await DataService.getDB()).put('window', window);
  }

  static async getWindow(windowId: number) {
    return (await DataService.getDB()).get('window', windowId);
  }

  static async getAllWindows() {
    return (await DataService.getDB()).getAll('window');
  }

  static async deleteWindow(windowId: number) {
    (await DataService.getDB()).delete('window', windowId);
  }
}
