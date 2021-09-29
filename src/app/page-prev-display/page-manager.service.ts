import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Mutex } from 'async-mutex';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data.service';
import { IdGeneratorService } from '../id-generator-serivce';
import { DataSourceType } from '../interfaces/data-source-type';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectablePage } from '../interfaces/selectable-page';
import { SelectableSidebarButton } from '../interfaces/selectable-sidebar-button';
import { PageFilterService } from '../page-filter.service';
import { SidebarManagerService } from '../sidebar/sidebar-management/sidebar-manager.service';
import { HotkeyManagerService } from '../hotkey-manager.service';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  private windowPageElements: SelectablePage[] = [];

  private savedPageElements: SelectablePage[] = [];

  private pageElements = new SelectableCollection<SelectablePage>();

  public displayPageElements = new SelectableCollection<SelectablePage>();

  public dragging: boolean = false;

  public draggedElement: string = '';

  public pagePrevWidth: number = 300;

  public pagePrevMax = 500;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public pagePrevCollapse = false;

  public dragMode: 'copy' | 'move' = 'move';

  public searchQuery = new BehaviorSubject<string>('');

  private lock = new Mutex();

  constructor(
    private sidebarManagerService: SidebarManagerService,
    private dataService: DataService,
    private pageFilterService: PageFilterService,
    private hotkeyManagerService: HotkeyManagerService,
  ) {
    this.sidebarManagerService.savedSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Folder, selectedButtons)),
    );
    this.sidebarManagerService.windowSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Window, selectedButtons)),
    );
    this.searchQuery.subscribe(
      (newQuery) =>
        (this.displayPageElements = pageFilterService.filterByQuery(newQuery, this.pageElements)),
    );
    this.hotkeyManagerService.addShortcut('backspace').subscribe(() => this.removeAll());
  }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }

  public removePage(page: SelectablePage) {
    this.updatePageElements((currentPageElements) => currentPageElements.remove(page.id));
    this.dataService.removePage(page);
  }

  public removeAll() {
    this.displayPageElements.collection.forEach((element) => {
      if (element.isSelected) {
        this.removePage(element);
      }
    });
  }

  private async updatePages(
    dataSourceType: DataSourceType,
    dataSources: SelectableCollection<SelectableSidebarButton>,
  ) {
    if (dataSourceType === DataSourceType.Folder) {
      this.savedPageElements = [];
    } else if (dataSourceType === DataSourceType.Window) {
      this.windowPageElements = [];
    }
    const selectedDataSources = dataSources.getSelectedItems();
    await this.dataService.getPagesByDataSources(selectedDataSources).then((pages) => {
      pages.forEach((page) => {
        const selectablePage: SelectablePage = {
          ...page,
          id: IdGeneratorService.getIdFromDataSourceIdOrPageId(page.pageId),
          isSelected: false,
        };
        this.getPageElementsOfType(dataSourceType).push(selectablePage);
      });
    });
    this.updatePageElements((currentPageElements) =>
      currentPageElements.adjustCollection(this.savedPageElements.concat(this.windowPageElements)),
    );
  }

  private getPageElementsOfType(type: DataSourceType): SelectablePage[] {
    if (type === DataSourceType.Folder) {
      return this.savedPageElements;
    }
    if (type === DataSourceType.Window) {
      return this.windowPageElements;
    }
    return [];
  }

  public updatePageElements(update: (original: SelectableCollection<SelectablePage>) => void) {
    update(this.pageElements);
    this.displayPageElements = this.pageFilterService.filterByQuery(
      this.searchQuery.value,
      this.pageElements,
    );
  }
}
