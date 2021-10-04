import { Injectable, NgZone } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Mutex } from 'async-mutex';
import { BehaviorSubject, Observable } from 'rxjs';
import * as browser from 'webextension-polyfill';
import { DataService } from '../data.service';
import { IdGeneratorService } from '../id-generator-serivce';
import { DataSourceType } from '../interfaces/data-source-type';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectablePage } from '../interfaces/selectable-page';
import { SelectableSidebarButton } from '../interfaces/selectable-sidebar-button';
import { PageFilterService } from '../page-filter.service';
import { SidebarManagerService } from '../sidebar/sidebar-management/sidebar-manager.service';
import { HotkeyManagerService } from '../hotkey-manager.service';
import { DataSource } from '../interfaces/data-source';

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

  public pagePrevWidth: number = 400;

  public pagePrevMax = 600;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public pagePrevCollapse = false;

  public dragMode: 'copy' | 'move' = 'move';

  public searchQuery = new BehaviorSubject<string>('');

  private browserObservable = new Observable((observer) => {
    browser.tabs.onCreated.addListener(() => observer.next());
    browser.tabs.onRemoved.addListener(() => observer.next());
    browser.tabs.onDetached.addListener(() => observer.next());
    browser.webNavigation.onCommitted.addListener(() => observer.next());
  });

  private lock = new Mutex();

  constructor(
    private sidebarManagerService: SidebarManagerService,
    private dataService: DataService,
    private pageFilterService: PageFilterService,
    private hotkeyManagerService: HotkeyManagerService,
    private ngZone: NgZone,
  ) {
    this.sidebarManagerService.savedSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Folder, selectedButtons)),
    );
    this.sidebarManagerService.windowSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Window, selectedButtons)),
    );
    this.browserObservable.subscribe(() =>
      this.lock.runExclusive(() =>
        this.updatePages(DataSourceType.Window, sidebarManagerService.windowSidebarButtons.value),
      ),
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

  public getDraggedPages(): SelectablePage[] {
    const draggedPages: SelectablePage[] = this.displayPageElements.getSelectedItems();
    const draggedPage: SelectablePage | undefined = this.displayPageElements.getById(
      parseInt(this.draggedElement, 10),
    );
    if (draggedPage && !draggedPage?.isSelected) {
      draggedPages.push(draggedPage);
    }
    return draggedPages;
  }

  public async dropPages(destination: DataSource): Promise<void> {
    this.dragging = false;
    if (this.dragMode === 'copy') {
      await this.dataService.copyPages(this.getDraggedPages(), destination);
    } else {
      await this.dataService.movePages(this.getDraggedPages(), destination);
    }
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
    this.ngZone.run(() => {
      this.displayPageElements = this.pageFilterService.filterByQuery(
        this.searchQuery.value,
        this.pageElements,
      );
    });
  }
}
