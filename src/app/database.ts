import Dexie, { Table } from 'dexie';
import { PageId } from './interfaces/page-id';
import { Settings } from './interfaces/settings';

export class Database extends Dexie {
  names!: Table<string, number>;
  images!: Table<string, PageId>;
  favicons!: Table<string, PageId>;
  accessTimes!: Table<number, PageId>;
  settings!: Table<Settings, string>;

  private readonly SETTINGS_ID = 'settings';

  private readonly pageObjectStores: ['images', 'favicons', 'accessTimes'] = [
    'images',
    'favicons',
    'accessTimes',
  ];

  private readonly dataSourceObjectStores: ['names'] = ['names'];

  constructor() {
    super('glimpse');
    this.version(13).stores({
      names: '',
      images: '',
      favicons: '',
      accessTimes: '',
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
    // TODO
  }

  async deleteSessionData() {
    // TODO
  }
}

export const db = new Database();
