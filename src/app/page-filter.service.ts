import { Injectable } from '@angular/core';
import { SelectableCollection } from './interfaces/selectable-collection';
import { SelectablePageData } from './interfaces/selectable-page-data';

@Injectable({
  providedIn: 'root',
})
export class PageFilterService {
  public filterByQuery(
    query: string,
    pages: SelectableCollection<SelectablePageData>,
  ): SelectableCollection<SelectablePageData> {
    return new SelectableCollection(
      pages.collection.filter(
        (page: SelectablePageData) => page.title.includes(query) || page.url.includes(query),
      ),
    );
  }
}
