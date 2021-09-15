import { Injectable } from '@angular/core';
import { SelectableCollection } from './interfaces/selectable-collection';
import { SelectablePage } from './interfaces/selectable-page-data';

@Injectable({
  providedIn: 'root',
})
export class PageFilterService {
  public filterByQuery(
    query: string,
    pages: SelectableCollection<SelectablePage>,
  ): SelectableCollection<SelectablePage> {
    return new SelectableCollection(
      pages.collection.filter(
        (page: SelectablePage) => page.title.includes(query) || page.url.includes(query),
      ),
    );
  }
}
