import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Mutex } from 'async-mutex';
import { DataService } from '../data.service';
import { IdGeneratorService } from '../id-generator-serivce';
import { DataSourceType } from '../interfaces/data-source-type';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectablePage } from '../interfaces/selectable-page';
import { SelectableSidebarButton } from '../interfaces/selectable-sidebar-button';
import { SidebarManagerService } from '../sidebar/sidebar-management/sidebar-manager.service';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  public windowPageElements: SelectableCollection<SelectablePage> =
    new SelectableCollection<SelectablePage>();

  public savedPageElements: SelectableCollection<SelectablePage> =
    new SelectableCollection<SelectablePage>();

  public dragging: boolean = false;

  public draggedElement: string = '';

  public pagePrevWidth: number = 300;

  public pagePrevMax = 500;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public pagePrevCollapse = false;

  public dragMode: 'copy' | 'move' = 'move';

  private lock = new Mutex();

  constructor(
    private sidebarManagerService: SidebarManagerService,
    private dataService: DataService,
    private idGeneratorService: IdGeneratorService,
  ) {
    this.sidebarManagerService.savedSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Folder, selectedButtons)),
    );
    this.sidebarManagerService.windowSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Window, selectedButtons)),
    );
  }

  public get pageElements() {
    return this.windowPageElements.concat(this.savedPageElements);
  }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }

  private async updatePages(
    dataSourceType: DataSourceType,
    dataSources: SelectableCollection<SelectableSidebarButton>,
  ) {
    if (dataSourceType === DataSourceType.Folder) {
      this.savedPageElements = new SelectableCollection<SelectablePage>();
    } else if (dataSourceType === DataSourceType.Window) {
      this.windowPageElements = new SelectableCollection<SelectablePage>();
    }
    const selectedDataSources = dataSources.getSelectedItems();
    await this.dataService.getPagesByDataSources(selectedDataSources).then((pages) => {
      pages.forEach((page) => {
        const selectablePage: SelectablePage = {
          ...page,
          id: this.idGeneratorService.getId(),
          isSelected: false,
        };
        this.getPageElementsOfType(dataSourceType).push(selectablePage);
      });
    });
  }

  private getPageElementsOfType(type: DataSourceType): SelectableCollection<SelectablePage> {
    if (type === DataSourceType.Folder) {
      return this.savedPageElements;
    }
    if (type === DataSourceType.Window) {
      return this.windowPageElements;
    }
    return new SelectableCollection<SelectablePage>();
  }
}
