import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DataService } from '../data.service';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectablePageData } from '../interfaces/selectable-page-data';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  public tabElements: SelectableCollection<SelectablePageData> =
    new SelectableCollection<SelectablePageData>();

  public dragging: boolean = false;

  public draggedElement: string = '';

  public pagePrevWidth: number = 300;

  public pagePrevMax = 500;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public pagePrevCollapse = false;

  constructor() {
    this.init();
  }

  init() {
    // for (let i = 0; i < 20; i += 1) {
    //   this.tabElements.push(<PageData>{
    //     title: 'A website',
    //     url: 'material.angular.io',
    //     image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
    //     id: i,
    //   });
    // }

    DataService.insertSavedFolder({ folderId: 1, name: 'Uncategorized' });
    DataService.insertSavedFolder({ folderId: 10, name: 'Folder 1' });
    DataService.insertSavedFolder({ folderId: 25, name: 'Folder 2' });
  }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }
}
