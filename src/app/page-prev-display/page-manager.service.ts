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

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }
}
