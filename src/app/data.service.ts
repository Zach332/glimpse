import { Injectable } from '@angular/core';
import * as browser from 'webextension-polyfill';
import { DataSourceType } from './interfaces/data-source-type';
import { DataSource } from './interfaces/data-source';
import { Page } from './interfaces/page';
import { IDBService } from './idb-service';
import { Operation } from './interfaces/operation';
import { PageId } from './interfaces/page-id';
import { BookmarkService } from './bookmark-service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Data sources

  static async addWindow(name?: string, initialPages?: Page[], copy?: boolean) {
    browser.runtime.sendMessage({
      type: 'addWindow',
      currentWindow: await browser.windows.getCurrent(),
      currentWindowGlimpseTabId: (await browser.tabs.getCurrent()).id!,
      name,
      initialPages,
      copy,
    });
  }

  static async addFolder(name: string, initialPages?: Page[], copy?: boolean) {
    // Create new folder
    const folder = browser.bookmarks.create({
      parentId: (await BookmarkService.getRootGlimpseFolder()).id,
      title: name,
    });
    const dataSource = this.convertFolderToDataSource(await folder);

    // Add initial pages to new folder
    if (initialPages) {
      if (copy) {
        this.copyPages(initialPages, dataSource);
      } else {
        this.movePages(initialPages, dataSource);
      }
    }

    return dataSource;
  }

  static async getWindowDataSources() {
    return Promise.all(
      (await browser.windows.getAll()).map(async (window) =>
        this.convertWindowToDataSource(window),
      ),
    );
  }

  static async convertWindowToDataSource(window: browser.Windows.Window) {
    const dataSource: DataSource = {
      dataSourceId: [DataSourceType.Window, window.id!],
      name: IDBService.getName(window.id!).then((name) => {
        if (name) {
          return name;
        }
        return `Window ${window.id!}`;
      }),
    };
    return dataSource;
  }

  static async getFolderDataSources() {
    // TODO: Handle errors
    return browser.bookmarks
      .getChildren((await BookmarkService.getRootGlimpseFolder()).id)
      .then((folders) => {
        return folders.map((folder) => this.convertFolderToDataSource(folder));
      });
  }

  static convertFolderToDataSource(folder: browser.Bookmarks.BookmarkTreeNode) {
    const dataSource: DataSource = {
      dataSourceId: [DataSourceType.Folder, folder.id],
      name: Promise.resolve(folder.title),
    };
    return dataSource;
  }

  static async renameWindow(windowId: number, name: string) {
    IDBService.putName(windowId, name);
  }

  static async renameFolder(folderId: string, name: string) {
    browser.bookmarks.update(folderId, { title: name });
  }

  static async renameDataSource(dataSource: DataSource, name: string) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      this.renameWindow(dataSource.dataSourceId[1], name);
    } else {
      this.renameFolder(dataSource.dataSourceId[1], name);
    }
  }

  static async removeDataSource(dataSource: DataSource) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      browser.windows.remove(dataSource.dataSourceId[1]);
    } else {
      browser.bookmarks.removeTree(dataSource.dataSourceId[1]);
    }
  }

  // Pages

  static async addPage(page: Page, dataSource: DataSource) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      const tab = await browser.tabs.create({
        url: page.url,
        active: false,
        windowId: dataSource.dataSourceId[1],
      });
      return DataService.getPageIdFromTab(tab);
    }
    const bookmark = await browser.bookmarks.create({
      parentId: dataSource.dataSourceId[1],
      title: page.title,
      url: page.url,
    });
    return DataService.getPageIdFromBookmark(bookmark);
  }

  static async getPagesByDataSources(dataSources: DataSource[]) {
    return Promise.all(
      dataSources.map((dataSource) => {
        if (dataSource.dataSourceId[0] === DataSourceType.Window) {
          return this.getPagesByWindowId(dataSource.dataSourceId[1]);
        }
        return this.getPagesByFolderId(dataSource.dataSourceId[1]);
      }),
    ).then((pagesList) => {
      const pages: Page[] = [];
      pagesList.forEach((pageList) => {
        pageList.forEach((page) => {
          pages.push(page);
        });
      });
      return pages;
    });
  }

  static async getPagesByWindowId(windowId: number) {
    return Promise.all(
      (await browser.tabs.query({ windowId })).map(async (tab) => this.convertTabToPage(tab)),
    );
  }

  static async convertTabToPage(tab: browser.Tabs.Tab) {
    const pageId: PageId = DataService.getPageIdFromTab(tab);
    const page: Page = {
      pageId,
      title: tab.title!,
      url: tab.url!,
      faviconUrl: Promise.resolve(tab.favIconUrl),
      image: IDBService.getImage(pageId),
      timeLastAccessed: IDBService.getTimeLastAccessed(pageId).then((timeLastAccessed) => {
        if (timeLastAccessed) {
          return timeLastAccessed;
        }
        return tab.id!;
      }),
    };
    return page;
  }

  static async getPagesByFolderId(folderId: string) {
    return browser.bookmarks.getChildren(folderId).then((folder) => {
      return Promise.all(folder.map(async (bookmark) => this.convertBookmarkToPage(bookmark)));
    });
  }

  static async convertBookmarkToPage(bookmark: browser.Bookmarks.BookmarkTreeNode) {
    const pageId: PageId = DataService.getPageIdFromBookmark(bookmark);
    const page: Page = {
      pageId,
      title: bookmark.title,
      url: bookmark.url!,
      faviconUrl: IDBService.getFavicon(pageId),
      image: IDBService.getImage(pageId),
      timeLastAccessed: IDBService.getTimeLastAccessed(pageId).then((timeLastAccessed) => {
        if (timeLastAccessed) {
          return timeLastAccessed;
        }
        return bookmark.dateAdded!;
      }),
    };
    return page;
  }

  static async movePage(source: Page, destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'moveOrCopyPage',
      source,
      destination,
      operation: Operation.Move,
    });
  }

  static async copyPage(source: Page, destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'moveOrCopyPage',
      source,
      destination,
      operation: Operation.Copy,
    });
  }

  static async removePage(page: Page) {
    browser.runtime.sendMessage({
      type: 'removePage',
      page,
    });
  }

  static async movePages(sources: Page[], destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'movePages',
      sources,
      destination,
    });
  }

  static async copyPages(sources: Page[], destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'copyPages',
      sources,
      destination,
    });
  }

  static async removePages(pages: Page[]) {
    browser.runtime.sendMessage({
      type: 'removePages',
      pages,
    });
  }

  // Tab management

  static async switchToTab(destinationTabId: number) {
    browser.runtime.sendMessage({
      type: 'switchToTab',
      destinationWindowId: (await browser.tabs.get(destinationTabId)).windowId!,
      destinationTabId,
      glimpseTabId: (await browser.tabs.getCurrent()).id!,
    });
  }

  // Information

  static async getActiveDataSource(): Promise<DataSource> {
    return browser.windows.getCurrent().then((window) => this.convertWindowToDataSource(window));
  }

  // Helper methods

  static getPageIdFromTab(tab: browser.Tabs.Tab): PageId {
    return [DataSourceType.Window, tab.windowId!, tab.id!];
  }

  static getPageIdFromBookmark(bookmark: browser.Bookmarks.BookmarkTreeNode): PageId {
    return [DataSourceType.Folder, bookmark.parentId!, bookmark.id];
  }
}
