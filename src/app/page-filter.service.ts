import { Injectable } from '@angular/core';
import { SelectableCollection } from './interfaces/selectable-collection';
import { SelectablePage } from './interfaces/selectable-page';

@Injectable({
  providedIn: 'root',
})
export class PageFilterService {
  public filterByQuery(
    query: string,
    pages: SelectableCollection<SelectablePage>,
  ): SelectableCollection<SelectablePage> {
    const cleanQuery = this.escapeRegex(query);
    return new SelectableCollection(
      pages.collection.filter(
        (page: SelectablePage) =>
          page.title.match(new RegExp(cleanQuery, 'i')) ||
          page.url.match(new RegExp(cleanQuery, 'i')),
      ),
    );
  }

  escapeRegex(query: string) {
    return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
