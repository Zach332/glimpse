import Dexie, { Table } from 'dexie';
import { BookmarkService } from './bookmark-service';
import { DataSourceType } from './interfaces/data-source-type';
import { PageId } from './interfaces/page-id';
import { Settings } from './interfaces/settings';

export class Database extends Dexie {
  // TODO: Should this be Table<string, DataSourceId>?
  names!: Table<string, number>;

  images!: Table<
    {
      pageId: PageId;
      image: string;
    },
    PageId
  >;

  favicons!: Table<
    {
      pageId: PageId;
      favicon: string;
    },
    PageId
  >;

  accessTimes!: Table<
    {
      pageId: PageId;
      accessTime: number;
    },
    PageId
  >;

  // TODO: Remove
  settings!: Table<Settings, string>;

  private readonly SETTINGS_ID = 'settings';

  constructor() {
    super('glimpse');
    this.version(16).stores({
      names: '',
      // TODO: Re-evaluate these
      images: 'pageId',
      favicons: 'pageId',
      accessTimes: 'pageId',
      settings: '',
    });
  }

  async getSettings() {
    return this.settings.get(this.SETTINGS_ID);
  }

  async putSettings(settings: Settings) {
    return this.settings.put(settings, this.SETTINGS_ID);
  }

  async deletePageData(pageId: PageId) {
    this.images.delete(pageId);
    this.favicons.delete(pageId);
    this.accessTimes.delete(pageId);
  }

  async deleteSessionData() {
    const imageKeys = (await this.images.toArray()).map((value) => {
      return value.pageId;
    });
    const faviconKeys = (await this.favicons.toArray()).map((value) => {
      return value.pageId;
    });
    const accessTimeKeys = (await this.accessTimes.toArray()).map((value) => {
      return value.pageId;
    });

    const keys = imageKeys.concat(faviconKeys).concat(accessTimeKeys);

    const bookmarkIds = new Set(
      (await BookmarkService.getRootGlimpseFolder()).children!.map((bookmark) => {
        return bookmark.id;
      }),
    );

    const keysToDelete = keys.filter((key) => {
      // Delete all window data
      if (key[0] === DataSourceType.Window) {
        return true;
      }
      // Delete data for bookmarks that no longer exist

      return !bookmarkIds.has(key[1]);
    });

    this.images.bulkDelete(keysToDelete);
    this.favicons.bulkDelete(keysToDelete);
    this.accessTimes.bulkDelete(keysToDelete);
  }
}

export const db = new Database();
