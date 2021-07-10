import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import { Schema } from './interfaces/schema';
import { PageData } from './interfaces/page-data';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private db = openDB<Schema>('glimpse', 1, {
    upgrade(db) {
      db.createObjectStore('pageData', { autoIncrement: true, keyPath: 'id' });
    },
  });

  async insertPageData(pageData: PageData) {
    (await this.db).put('pageData', pageData);
  }

  async getPageData(id: number) {
    return (await this.db).get('pageData', id);
  }

  async updatePageData(pageData: PageData) {
    (await this.db).put('pageData', pageData);
  }

  async deletePageData(id: number) {
    (await this.db).delete('pageData', id);
  }
}
