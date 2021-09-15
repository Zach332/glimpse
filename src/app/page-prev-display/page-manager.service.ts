import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DataService } from '../data.service';
import { IdGeneratorService } from '../id-generator-serivce';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectablePage } from '../interfaces/selectable-page-data';
import { SidebarManagerService } from '../sidebar/sidebar-management/sidebar-manager.service';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  public pageElements: SelectableCollection<SelectablePage> =
    new SelectableCollection<SelectablePage>();

  public dragging: boolean = false;

  public draggedElement: string = '';

  public pagePrevWidth: number = 300;

  public pagePrevMax = 500;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public pagePrevCollapse = false;

  constructor(
    private sidebarManagerService: SidebarManagerService,
    private dataService: DataService,
    private idGeneratorService: IdGeneratorService,
  ) {
    this.getPages().then((pages) =>
      pages.forEach((page) => {
        const selectablePage: SelectablePage = {
          ...page,
          id: idGeneratorService.getId(),
          isSelected: false,
        };
        this.pageElements.push(selectablePage);
      }),
    );
  }

  async getPages() {
    // TODO: Remove this and fix the race condition between sidebar manager and
    // page manager
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return this.dataService.getPagesByDataSources(
      this.sidebarManagerService.getSelectedSidebarButtons(),
    );
  }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }
}
