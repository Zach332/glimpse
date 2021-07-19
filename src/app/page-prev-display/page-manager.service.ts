import { Injectable } from '@angular/core';
import { PageData } from '../interfaces/page-data';
import { SelectableCollection } from '../interfaces/selectable-collection';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  public tabElements: SelectableCollection<PageData> = new SelectableCollection<PageData>();

  constructor() {
    this.init();
  }

  init() {
    for (let i = 0; i < 20; i += 1) {
      this.tabElements.push(<PageData>{
        title: 'A website',
        url: 'material.angular.io',
        image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
        id: i,
      });
    }
  }
}
