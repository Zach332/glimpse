import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
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

  // constructor() {
  //   // this.getPages();
  // }

  // async getPages() {
  //   this.tabElements.
  //   return this.dataService.get
  //   return Data(
  //     // TODO: Update the tabElements array when new page data are added
  //     // This code will only update page data on new tabs
  //     // When you do this, it will probably make sense to separate the logic
  //     // to convert from PageData to SelectablePageData
  //     await DataService.getAllPageData(),
  //   )
  //     .map((pageData) => {
  //       const selectablePageData: SelectablePageData = {
  //         ...pageData,
  //         isSelected: false,
  //       };
  //       return selectablePageData;
  //     })
  //     .forEach((pageData) => {
  //       this.tabElements.push(pageData);
  //     });
  // }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }
}
