import { Injectable } from '@angular/core';
import * as browser from 'webextension-polyfill';
import { DataSourceType } from './interfaces/data-source-type';
import { DataSource } from './interfaces/data-source';
import { Page } from './interfaces/page';
import { ImageService } from './image-service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // TODO: Potentially switch this to using a fixed id to improve performance
  readonly GLIMPSE_BOOKMARK_FOLDER_NAME = 'glimpse-dev';

  public async getWindowDataSources() {
    return (await browser.windows.getAll()).map((window) => {
      const dataSource: DataSource = {
        glimpseId: [DataSourceType.Window, window.id!],
        name: 'TODO: replace',
      };
      return dataSource;
    });
  }

  public async getFolderDataSources() {
    // TODO: Handle errors
    return browser.bookmarks.getChildren((await this.getRootGlimpseFolder()).id).then((folders) => {
      return folders.map((folder) => {
        const dataSource: DataSource = {
          glimpseId: [DataSourceType.Folder, folder.id],
          name: folder.title,
        };
        return dataSource;
      });
    });
  }

  public async getPagesByDataSources(dataSources: DataSource[]) {
    return Promise.all(
      dataSources.map((dataSource) => {
        if (dataSource.glimpseId[0] === DataSourceType.Window) {
          return this.getPagesByWindowId(dataSource.glimpseId[1]);
        }
        return this.getPagesByFolderId(dataSource.glimpseId[1]);
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
      (await browser.tabs.query({ windowId }))
        .filter((tab) => DataService.isValidPage(tab.url!))
        .map(async (tab) => {
          const page: Page = {
            glimpseId: [DataSourceType.Window, tab.id!],
            title: tab.title!,
            url: tab.url!,
            image: await ImageService.getImage([DataSourceType.Window, tab.id!]),
          };
          return page;
        }),
    );
  }

  public async getPagesByFolderId(folderId: string) {
    return browser.bookmarks.getChildren(folderId).then((folder) => {
      return Promise.all(
        folder
          .filter((bookmark) => DataService.isValidPage(bookmark.url!))
          .map(async (bookmark) => {
            const page: Page = {
              glimpseId: [DataSourceType.Folder, folderId],
              title: bookmark.title,
              url: bookmark.url!,
              image: await ImageService.getImage([DataSourceType.Folder, folderId]),
            };
            return page;
          }),
      );
    });
  }

  // Returns false if page should not be indexed or shown by glimpse
  public static isValidPage(url: string) {
    return !(
      url.startsWith('moz-extension://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('about:') ||
      url.startsWith('chrome://')
    );
  }

  async getRootGlimpseFolder() {
    // TODO: Handle errors
    const otherBookmarksNode = (await browser.bookmarks.getTree())[0].children!.filter(
      (treeNode) => treeNode.title === 'Other bookmarks' || treeNode.title === 'Other Bookmarks',
    )[0];
    return otherBookmarksNode.children!.filter(
      (treeNode) => treeNode.title === this.GLIMPSE_BOOKMARK_FOLDER_NAME,
    )[0];
  }
}
