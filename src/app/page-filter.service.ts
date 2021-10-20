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
    const tokens = cleanQuery.split(' ');
    return new SelectableCollection(
      pages.collection.filter((page: SelectablePage) => this.pageMatchesTokens(tokens, page)),
    );
  }

  private pageMatchesTokens(tokens: string[], page: SelectablePage) {
    return tokens.every(
      (token) => page.title.match(new RegExp(token, 'i')) || page.url.match(new RegExp(token, 'i')),
    );
  }

  private escapeRegex(query: string) {
    return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
