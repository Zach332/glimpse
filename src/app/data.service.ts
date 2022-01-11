import { Injectable } from '@angular/core';
import * as browser from 'webextension-polyfill';
import pThrottle from 'p-throttle';
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
  private pageThrottle = pThrottle({
    limit: 1,
    interval: 100,
  });

  // Data sources

  async addWindow(name?: string, initialPages?: Page[], copy?: boolean) {
    browser.runtime.sendMessage({
      type: 'addWindow',
      currentWindow: await browser.windows.getCurrent(),
      currentWindowGlimpseTabId: (await browser.tabs.getCurrent()).id!,
      name,
      initialPages,
      copy,
    });
  }

  async addFolder(name: string, initialPages?: Page[], copy?: boolean) {
    // Create new folder
    const folder = browser.bookmarks.create({
      parentId: (await BookmarkService.getRootGlimpseFolder()).id,
      title: name,
    });
    const dataSource = DataService.convertFolderToDataSource(await folder);

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

  async getWindowDataSources() {
    return Promise.all(
      (await browser.windows.getAll()).map(async (window) =>
        DataService.convertWindowToDataSource(window),
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

  async getFolderDataSources() {
    // TODO: Handle errors
    return browser.bookmarks
      .getChildren((await BookmarkService.getRootGlimpseFolder()).id)
      .then((folders) => {
        return folders.map((folder) => DataService.convertFolderToDataSource(folder));
      });
  }

  static convertFolderToDataSource(folder: browser.Bookmarks.BookmarkTreeNode) {
    const dataSource: DataSource = {
      dataSourceId: [DataSourceType.Folder, folder.id],
      name: Promise.resolve(folder.title),
    };
    return dataSource;
  }

  async renameWindow(windowId: number, name: string) {
    IDBService.putName(windowId, name);
  }

  async renameFolder(folderId: string, name: string) {
    browser.bookmarks.update(folderId, { title: name });
  }

  async renameDataSource(dataSource: DataSource, name: string) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      this.renameWindow(dataSource.dataSourceId[1], name);
    } else {
      this.renameFolder(dataSource.dataSourceId[1], name);
    }
  }

  async removeDataSource(dataSource: DataSource) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      browser.windows.remove(dataSource.dataSourceId[1]);
    } else {
      browser.bookmarks.removeTree(dataSource.dataSourceId[1]);
    }
  }

  // Pages

  private async _getPagesByDataSources(dataSources: DataSource[]) {
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

  getPagesByDataSources = this.pageThrottle((dataSources: DataSource[]) =>
    this._getPagesByDataSources(dataSources),
  );

  async getPagesByWindowId(windowId: number) {
    return Promise.all(
      (await browser.tabs.query({ windowId })).map(async (tab) => this.convertTabToPage(tab)),
    );
  }

  private async convertTabToPage(tab: browser.Tabs.Tab) {
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

  async getPagesByFolderId(folderId: string) {
    return browser.bookmarks.getChildren(folderId).then((folder) => {
      return Promise.all(folder.map(async (bookmark) => this.convertBookmarkToPage(bookmark)));
    });
  }

  private async convertBookmarkToPage(bookmark: browser.Bookmarks.BookmarkTreeNode) {
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

  async movePage(source: Page, destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'moveOrCopyPage',
      source,
      destination,
      operation: Operation.Move,
    });
  }

  async copyPage(source: Page, destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'moveOrCopyPage',
      source,
      destination,
      operation: Operation.Copy,
    });
  }

  async removePage(page: Page) {
    browser.runtime.sendMessage({
      type: 'removePage',
      page,
    });
  }

  async movePages(sources: Page[], destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'movePages',
      sources,
      destination,
    });
  }

  async copyPages(sources: Page[], destination: DataSource) {
    browser.runtime.sendMessage({
      type: 'copyPages',
      sources,
      destination,
    });
  }

  async removePages(pages: Page[]) {
    browser.runtime.sendMessage({
      type: 'removePages',
      pages,
    });
  }

  // Tab management

  async switchToTab(destinationTabId: number) {
    browser.runtime.sendMessage({
      type: 'switchToTab',
      destinationWindowId: (await browser.tabs.get(destinationTabId)).windowId!,
      destinationTabId,
      glimpseTabId: (await browser.tabs.getCurrent()).id!,
    });
  }

  // Information

  async getActiveDataSource(): Promise<DataSource> {
    return browser.windows
      .getCurrent()
      .then((window) => DataService.convertWindowToDataSource(window));
  }

  // Helper methods

  static getPageIdFromTab(tab: browser.Tabs.Tab): PageId {
    return [DataSourceType.Window, tab.windowId!, tab.id!];
  }

  static getPageIdFromBookmark(bookmark: browser.Bookmarks.BookmarkTreeNode): PageId {
    return [DataSourceType.Folder, bookmark.parentId!, bookmark.id];
  }
}
