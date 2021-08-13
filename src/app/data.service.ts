import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { TabPageData } from './interfaces/tab-page-data';
import { SavedPageData } from './interfaces/saved-page-data';
import { HistoryPageData } from './interfaces/history-page-data';
import { SavedFolderDataSource } from './interfaces/saved-folder';
import { DataSourceType } from './interfaces/data-source-type';
import { WindowDataSource } from './interfaces/window';

export class DataService {
  static getDB() {
    return openDB<Schema>('glimpse', 5, {
      upgrade(db) {
        const pageDataStore = db.createObjectStore('pageData', {
          autoIncrement: true,
          keyPath: 'id',
        });
        pageDataStore.createIndex('tabId', 'tabId');
        pageDataStore.createIndex('folderId', 'folderId');
        pageDataStore.createIndex('source', 'source');
        const dataSourceStore = db.createObjectStore('dataSource', {
          autoIncrement: true,
          keyPath: 'id',
        });
        dataSourceStore.createIndex('type', 'type');
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
      source: DataSourceType.Window,
      timestamp: new Date(),
    });
  }

  static async convertTabToSavedPageData(tabId: number, folderId: number) {
    const tabPageData = await (await DataService.getDB()).getFromIndex('pageData', 'tabId', tabId);
    const savedPageData = tabPageData as SavedPageData;
    savedPageData.source = DataSourceType.SavedFolder;
    savedPageData.timestamp = new Date();
    savedPageData.folderId = folderId;
    DataService.updateSavedPageData(savedPageData);
  }

  static async convertTabToHistoryPageData(tabId: number) {
    const tabPageData = await DataService.getPageDataByTabId(tabId);
    const historyPageData = tabPageData as HistoryPageData;
    historyPageData.source = DataSourceType.History;
    historyPageData.timestamp = new Date();
    DataService.updateHistoryPageData(historyPageData);
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
      'source',
      DataSourceType.Window,
    ) as Promise<TabPageData[]>;
  }

  static async getAllSavedPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'source',
      DataSourceType.SavedFolder,
    ) as Promise<SavedPageData[]>;
  }

  static async getAllHistoryPageData() {
    return (await DataService.getDB()).getAllFromIndex(
      'pageData',
      'source',
      DataSourceType.History,
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

  static async updateTabPageData(tabPageData: TabPageData) {
    (await DataService.getDB()).put('pageData', tabPageData);
  }

  static async updateSavedPageData(savedPageData: SavedPageData) {
    (await DataService.getDB()).put('pageData', savedPageData);
  }

  static async updateHistoryPageData(historyPageData: HistoryPageData) {
    (await DataService.getDB()).put('pageData', historyPageData);
  }

  static async deletePageData(id: number) {
    (await DataService.getDB()).delete('pageData', id);
  }

  // Data sources

  static async insertWindowDataSource(name: string, windowId: number) {
    return (await DataService.getDB()).add('dataSource', <WindowDataSource>{
      name,
      windowId,
      type: DataSourceType.Window,
    });
  }

  static async insertSavedFolderDataSource(name: string) {
    return (await DataService.getDB()).add('dataSource', <SavedFolderDataSource>{
      name,
      type: DataSourceType.SavedFolder,
    });
  }

  static async getDataSource(id: number) {
    return (await DataService.getDB()).get('dataSource', id);
  }

  static async getAllDataSources() {
    return (await DataService.getDB()).getAll('dataSource');
  }

  static async getAllWindowDataSources() {
    return (await DataService.getDB()).getAllFromIndex('dataSource', 'type', DataSourceType.Window);
  }

  static async getAllSavedFolderDataSources() {
    return (await DataService.getDB()).getAllFromIndex(
      'dataSource',
      'type',
      DataSourceType.SavedFolder,
    );
  }

  static async getAllHistoryDataSources() {
    return (await DataService.getDB()).getAllFromIndex(
      'dataSource',
      'type',
      DataSourceType.History,
    );
  }

  static async updateWindowDataSource(windowDataSource: WindowDataSource) {
    (await DataService.getDB()).put('dataSource', windowDataSource);
  }

  static async updateSavedFolderDataSource(savedFolderDataSource: SavedFolderDataSource) {
    (await DataService.getDB()).put('dataSource', savedFolderDataSource);
  }

  static async deleteDataSource(id: number) {
    (await DataService.getDB()).delete('dataSource', id);
  }
}
