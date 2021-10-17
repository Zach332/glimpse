import { Injectable } from '@angular/core';
import * as browser from 'webextension-polyfill';
import { DataSourceType } from './interfaces/data-source-type';
import { DataSource } from './interfaces/data-source';
import { Page } from './interfaces/page';
import { IDBService } from './idb-service';
import { Operation } from './interfaces/operation';
import { PageId } from './interfaces/page-id';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  readonly GLIMPSE_BOOKMARK_FOLDER_NAME = 'glimpse-saved';

  // Data sources

  public async addWindow(name?: string, initialPages?: Page[], copy?: boolean) {
    this.closeGlimpseTabAfterCallback(async () => {
      // Create new window
      const currentWindow = browser.windows.getCurrent();
      const newWindow = browser.windows.create({
        focused: true,
        state: (await currentWindow).state,
      });

      // Add name to new window (if specified)
      if (name) {
        await IDBService.putName((await newWindow).id!, name);
      }

      const dataSource = this.convertWindowToDataSource(await newWindow);

      // Add initial pages to new window
      if (initialPages) {
        if (copy) {
          this.copyPages(initialPages, await dataSource);
        } else {
          this.movePages(initialPages, await dataSource);
        }
      }
    });
  }

  public async addFolder(name: string, initialPages?: Page[], copy?: boolean) {
    // Create new folder
    const folder = browser.bookmarks.create({
      parentId: (await this.getRootGlimpseFolder()).id,
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

  public async getWindowDataSources() {
    return Promise.all(
      (await browser.windows.getAll()).map(async (window) =>
        this.convertWindowToDataSource(window),
      ),
    );
  }

  async convertWindowToDataSource(window: browser.Windows.Window) {
    const dataSource: DataSource = {
      dataSourceId: [DataSourceType.Window, window.id!],
      name: (await IDBService.getName(window.id!)) || `Window ${window.id!}`,
    };
    return dataSource;
  }

  public async getFolderDataSources() {
    // TODO: Handle errors
    return browser.bookmarks.getChildren((await this.getRootGlimpseFolder()).id).then((folders) => {
      return folders.map((folder) => this.convertFolderToDataSource(folder));
    });
  }

  convertFolderToDataSource(folder: browser.Bookmarks.BookmarkTreeNode) {
    const dataSource: DataSource = {
      dataSourceId: [DataSourceType.Folder, folder.id],
      name: folder.title,
    };
    return dataSource;
  }

  public async renameWindow(windowId: number, name: string) {
    IDBService.putName(windowId, name);
  }

  public async renameFolder(folderId: string, name: string) {
    browser.bookmarks.update(folderId, { title: name });
  }

  public async renameDataSource(dataSource: DataSource, name: string) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      this.renameWindow(dataSource.dataSourceId[1], name);
    } else {
      this.renameFolder(dataSource.dataSourceId[1], name);
    }
  }

  public async removeDataSource(dataSource: DataSource) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      browser.windows.remove(dataSource.dataSourceId[1]);
    } else {
      browser.bookmarks.removeTree(dataSource.dataSourceId[1]);
    }
  }

  // Pages

  async addPage(page: Page, dataSource: DataSource) {
    if (dataSource.dataSourceId[0] === DataSourceType.Window) {
      browser.tabs.create({ url: page.url, active: false, windowId: dataSource.dataSourceId[1] });
    } else {
      browser.bookmarks.create({
        parentId: dataSource.dataSourceId[1],
        title: page.title,
        url: page.url,
      });
    }
  }

  public async getPagesByDataSources(dataSources: DataSource[]) {
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

  public async getPagesByWindowId(windowId: number) {
    // TODO: Switch this to use .then?
    // Also for other methods in DataService
    return Promise.all(
      (await browser.tabs.query({ windowId })).map(async (tab) =>
        this.convertTabToPage(tab, windowId),
      ),
    );
  }

  async convertTabToPage(tab: browser.Tabs.Tab, windowId: number) {
    const pageId: PageId = [DataSourceType.Window, windowId, tab.id!];
    const page: Page = {
      pageId,
      title: tab.title!,
      url: tab.url!,
      faviconUrl: tab.favIconUrl,
      image: await IDBService.getImage([DataSourceType.Window, windowId, tab.id!]),
      timeLastAccessed: (await IDBService.getTimeLastAccessed(pageId)) ?? tab.id!,
    };
    return page;
  }

  public async getPagesByFolderId(folderId: string) {
    return browser.bookmarks.getChildren(folderId).then((folder) => {
      return Promise.all(
        folder.map(async (bookmark) => this.convertBookmarkToPage(bookmark, folderId)),
      );
    });
  }

  async convertBookmarkToPage(bookmark: browser.Bookmarks.BookmarkTreeNode, folderId: string) {
    const pageId: PageId = [DataSourceType.Folder, folderId, bookmark.id];
    const page: Page = {
      pageId,
      title: bookmark.title,
      url: bookmark.url!,
      faviconUrl: `https://www.google.com/s2/favicons?domain=${bookmark.url!}`,
      image: await IDBService.getImage([DataSourceType.Folder, folderId, bookmark.id]),
      timeLastAccessed: (await IDBService.getTimeLastAccessed(pageId)) ?? bookmark.dateAdded!,
    };
    return page;
  }

  public async movePages(sources: Page[], destination: DataSource) {
    sources.forEach((source) => {
      this.movePage(source, destination);
    });
  }

  public async copyPages(sources: Page[], destination: DataSource) {
    sources.forEach((source) => {
      this.copyPage(source, destination);
    });
  }

  public async removePages(pages: Page[]) {
    pages.forEach((page) => {
      this.removePage(page);
    });
  }

  async movePage(source: Page, destination: DataSource) {
    this.moveOrCopyPage(source, destination, Operation.Move);
  }

  async copyPage(source: Page, destination: DataSource) {
    this.moveOrCopyPage(source, destination, Operation.Copy);
  }

  async moveOrCopyPage(source: Page, destination: DataSource, operation: Operation) {
    // Avoid deleting tab in window -> window move
    if (
      source.pageId[0] === DataSourceType.Window &&
      destination.dataSourceId[0] === DataSourceType.Window &&
      operation === Operation.Move
    ) {
      browser.tabs.move(source.pageId[2], { index: -1, windowId: destination.dataSourceId[1] });
    } else {
      if (operation === Operation.Move) {
        this.removePage(source);
      }
      this.addPage(source, destination);
    }
  }

  public async removePage(page: Page) {
    if (page.pageId[0] === DataSourceType.Window) {
      browser.tabs.remove(page.pageId[2]);
    } else {
      browser.bookmarks.remove(page.pageId[2]);
    }
  }

  // Tab management

  public async switchToTab(tabId: number) {
    this.closeGlimpseTabAfterCallback(async () => {
      const windowId = (await browser.tabs.get(tabId)).windowId!;
      browser.windows.update(windowId, { focused: true });
      browser.tabs.update(tabId, { active: true });
    });
  }

  async closeGlimpseTab(tabId: number) {
    browser.tabs.remove(tabId);
  }

  async closeGlimpseTabAfterCallback(callback: Function) {
    const currentTabId = (await browser.tabs.getCurrent()).id!;
    await callback();
    this.closeGlimpseTab(currentTabId);
  }

  // Information

  public async getActiveWindow(): Promise<number | undefined> {
    return browser.windows.getCurrent().then((window) => window.id);
  }

  // Helper methods

  async getRootGlimpseFolder() {
    const otherBookmarksNode = (await browser.bookmarks.getTree())[0].children!.filter(
      (treeNode) => treeNode.title === 'Other bookmarks' || treeNode.title === 'Other Bookmarks',
    )[0];
    const filteredBookmarks = otherBookmarksNode.children!.filter(
      (treeNode) => treeNode.title === this.GLIMPSE_BOOKMARK_FOLDER_NAME,
    );
    // Create root glimpse folder
    if (filteredBookmarks.length === 0) {
      return await browser.bookmarks.create({
        parentId: otherBookmarksNode.id,
        title: this.GLIMPSE_BOOKMARK_FOLDER_NAME,
      });
    }
    return filteredBookmarks[0];
  }
}
