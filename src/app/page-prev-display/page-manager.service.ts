import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { PageData } from '../interfaces/page-data';
import { SelectableCollection } from '../interfaces/selectable-collection';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  public tabElements: SelectableCollection<PageData> = new SelectableCollection<PageData>();

  public dragging: boolean = false;

  public pagePrevWidth: number = 300;

  public pagePrevMax = 500;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public pagePrevCollapse = false;

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

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }
}
