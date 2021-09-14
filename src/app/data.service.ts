import { Injectable } from '@angular/core';
import { DataSourceType } from './interfaces/data-source-type';
import { DataSource } from './interfaces/data-source';
import { Page } from './interfaces/page';
import { ImageService } from './image-service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
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

  public async getBookmarkDataSources() {
    // TODO: Handle errors
    return (await browser.bookmarks.getTree())
      .filter((treeNode) => treeNode.title === this.GLIMPSE_BOOKMARK_FOLDER_NAME)
      .map((treeNode) => {
        const dataSource: DataSource = {
          glimpseId: [DataSourceType.Bookmark, treeNode.id],
          name: treeNode.title,
        };
        return dataSource;
      });
  }

  public async getPagesByDataSources(dataSources: DataSource[]) {
    return Promise.all(
      dataSources.map((dataSource) => {
        if (dataSource.glimpseId[0] === DataSourceType.Window) {
          return this.getPagesByWindowId(dataSource.glimpseId[1]);
        }
        return this.getPagesByBookmarkId(dataSource.glimpseId[1]);
      }),
    );
  }

  public async getPagesByWindowId(windowId: number) {
    return Promise.all(
      (await browser.tabs.query({ windowId })).map(async (tab) => {
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

  public async getPagesByBookmarkId(bookmarkId: string) {
    // TODO: Handle errors
    return Promise.all(
      (await browser.bookmarks.getChildren((await this.getRootBookmarkNode()).id)).map(
        async (bookmark) => {
          const page: Page = {
            glimpseId: [DataSourceType.Bookmark, bookmarkId],
            title: bookmark.title,
            url: bookmark.url!,
            image: await ImageService.getImage([DataSourceType.Bookmark, bookmarkId]),
          };
          return page;
        },
      ),
    );
  }

  async getRootBookmarkNode() {
    // TODO: Handle errors
    return (await browser.bookmarks.getTree()).filter(
      (treeNode) => treeNode.title === this.GLIMPSE_BOOKMARK_FOLDER_NAME,
    )[0];
  }
}
