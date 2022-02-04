import { Injectable, NgZone } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Mutex } from 'async-mutex';
import { BehaviorSubject, Observable } from 'rxjs';
import * as browser from 'webextension-polyfill';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../data.service';
import { IdGeneratorService } from '../id-generator-serivce';
import { DataSourceType } from '../interfaces/data-source-type';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectablePage } from '../interfaces/selectable-page';
import { PageFilterService } from '../page-filter.service';
import { SidebarManagerService } from '../sidebar/sidebar-management/sidebar-manager.service';
import { HotkeyManagerService } from '../hotkey-manager.service';
import { DataSource } from '../interfaces/data-source';
import { SimpleDialogComponent } from '../general/simple-dialog/simple-dialog.component';
import { PageId } from '../interfaces/page-id';

@Injectable({
  providedIn: 'root',
})
export class PageManagerService {
  private windowPageElements: SelectablePage[] = [];

  private savedPageElements: SelectablePage[] = [];

  private pageElements = new SelectableCollection<SelectablePage>();

  public displayPageElements = new SelectableCollection<SelectablePage>();

  public draggedElement: string = '';

  public pagePrevMax = 750;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public searchQuery = new BehaviorSubject<string>('');

  private pagesUpdating = false;

  private browserObservable = new Observable((observer) => {
    browser.tabs.onCreated.addListener(() => observer.next());
    browser.tabs.onActivated.addListener(() => observer.next());
    browser.tabs.onDetached.addListener(() => observer.next());
    browser.webNavigation.onCommitted.addListener(() => observer.next());
    browser.windows.onFocusChanged.addListener(() => observer.next());
  });

  private tabRemoveObservable = new Observable<{
    tabId: number;
    removeInfo: browser.Tabs.OnRemovedRemoveInfoType;
  }>((observer) => {
    browser.tabs.onRemoved.addListener((tabId, removeInfo) => observer.next({ tabId, removeInfo }));
  });

  private lock = new Mutex();

  constructor(
    private sidebarManagerService: SidebarManagerService,
    private pageFilterService: PageFilterService,
    private hotkeyManagerService: HotkeyManagerService,
    private dataService: DataService,
    private ngZone: NgZone,
    private moveCopyDialog: MatDialog,
    private nameDialog: MatDialog,
  ) {
    this.sidebarManagerService.selectedSidebarButtons.subscribe((selectedButtons) => {
      this.updatePagesLocked(selectedButtons);
    });
    this.browserObservable.subscribe(() => {
      this.updatePagesLocked(sidebarManagerService.selectedSidebarButtons.value);
    });
    this.tabRemoveObservable.subscribe((removeData) => {
      this.updatePagesLocked(sidebarManagerService.selectedSidebarButtons.value, () =>
        this.updatePagesRemove(removeData.tabId, removeData.removeInfo),
      );
    });
    this.searchQuery.subscribe(
      (newQuery) =>
        (this.displayPageElements = pageFilterService.filterByQuery(newQuery, this.pageElements)),
    );
    this.hotkeyManagerService.addShortcut('backspace', 'delete').subscribe(() => this.removeAll());
    this.hotkeyManagerService.addShortcut('delete', 'delete').subscribe(() => this.removeAll());
    this.hotkeyManagerService.addShortcut('m', 'move').subscribe(() => this.moveDialog());
    this.hotkeyManagerService.addShortcut('c', 'copy').subscribe(() => this.copyDialog());
  }

  public get pagePrevWidth() {
    return this.sidebarManagerService.savedSettings.pagePrevWidth;
  }

  public set pagePrevWidth(newWidth: number) {
    this.sidebarManagerService.updateSettings(
      (oldSettings) => (oldSettings.pagePrevWidth = newWidth),
    );
  }

  public get dragMode() {
    return this.sidebarManagerService.savedSettings.dragMode;
  }

  public set dragMode(newMode: 'copy' | 'move') {
    this.sidebarManagerService.updateSettings((oldSettings) => (oldSettings.dragMode = newMode));
  }

  public get pagePrevCollapse() {
    return this.sidebarManagerService.savedSettings.pagePrevCollapse;
  }

  public set pagePrevCollapse(newCollapse: boolean) {
    this.sidebarManagerService.updateSettings(
      (oldSettings) => (oldSettings.pagePrevCollapse = newCollapse),
    );
  }

  public get sidebarExpanded() {
    return this.sidebarManagerService.savedSettings.sidebarExpanded;
  }

  public set sidebarExpanded(newExpanded: boolean) {
    this.sidebarManagerService.updateSettings(
      (oldSettings) => (oldSettings.sidebarExpanded = newExpanded),
    );
  }

  public get updateSettings() {
    return this.sidebarManagerService.savedSettings.updateSettings;
  }

  public set updateSettings(newUpdateSettings: boolean) {
    this.sidebarManagerService.updateSettings(
      (oldSettings) => (oldSettings.updateSettings = newUpdateSettings),
    );
  }

  public get darkMode() {
    return this.sidebarManagerService.savedSettings.darkMode;
  }

  public set darkMode(newDarkMode: boolean) {
    this.sidebarManagerService.updateSettings(
      (oldSettings) => (oldSettings.darkMode = newDarkMode),
    );
  }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }

  public removePage(page: SelectablePage) {
    this.dataService.removePage(page);
  }

  public removeAll() {
    const pagesToRemove = this.displayPageElements.collection.filter(
      (element) => element.isSelected,
    );
    pagesToRemove.forEach((page) => {
      if (!page.loading) {
        page.loading = true;
        this.removePage(page);
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
    if (this.dragMode === 'copy') {
      await this.dataService.copyPages(this.getDraggedPages(), destination);
    } else {
      await this.dataService.movePages(this.getDraggedPages(), destination);
    }
  }

  public async openAll(): Promise<void> {
    if (this.dragMode === 'copy') {
      await this.dataService.copyPages(
        this.getDraggedPages(),
        await this.dataService.getActiveDataSource(),
      );
    } else {
      await this.dataService.movePages(
        this.getDraggedPages(),
        await this.dataService.getActiveDataSource(),
      );
    }
  }

  public async dropInNew(type: DataSourceType) {
    const matchingName = this.getMatchingNameForSelected();
    if (matchingName && this.notDefaultName(matchingName)) {
      this.dropInNewWithName(matchingName, type);
    } else {
      this.getNameDialog().subscribe((nameResult) => {
        if (nameResult !== null && nameResult !== undefined) {
          this.dropInNewWithName(nameResult, type);
        }
      });
    }
  }

  public getNoContentMessage() {
    if (this.pagesUpdating || !this.sidebarManagerService.initialized) {
      return '';
    }
    if (this.sidebarManagerService.selectedSidebarButtons.value.length === 0) {
      return 'You have not selected any sidebar items.';
    }
    if (this.searchQuery.value) {
      return 'No results';
    }
    if (
      this.sidebarManagerService.selectedSidebarButtons.value.filter(
        (sidebarButton) => sidebarButton.dataSourceId[0] === DataSourceType.Window,
      ).length === 0
    ) {
      if (
        this.sidebarManagerService.selectedSidebarButtons.value.filter(
          (sidebarButton) => sidebarButton.dataSourceId[0] === DataSourceType.Folder,
        ).length === 1
      ) {
        return 'This folder has no content.';
      }
      return 'These folders have no content.';
    }
    return '';
  }

  private notDefaultName(name: string) {
    const regex = new RegExp('^Window [0-9]*$');
    return !regex.test(name);
  }

  private getMatchingNameForSelected() {
    const selectedSidebarButtons = this.sidebarManagerService.selectedSidebarButtons.value;

    if (selectedSidebarButtons.length !== 1) {
      return null;
    }

    if (this.pageElements.collection.every((page) => page.isSelected)) {
      return selectedSidebarButtons[0].name;
    }
    return null;
  }

  private dropInNewWithName(name: string, type: DataSourceType) {
    if (this.dragMode === 'copy') {
      if (type === DataSourceType.Window) {
        this.sidebarManagerService.addWindow(name, this.getDraggedPages(), true);
      } else {
        this.sidebarManagerService.addFolder(name, this.getDraggedPages(), true);
      }
    } else {
      if (type === DataSourceType.Window) {
        this.sidebarManagerService.addWindow(name, this.getDraggedPages(), false);
      } else {
        this.sidebarManagerService.addFolder(name, this.getDraggedPages(), false);
      }
    }
  }

  private copyDialog(): void {
    this.dragMode = 'copy';
    const dialogRef = this.moveCopyDialog.open(SimpleDialogComponent, {
      data: { inputValue: '' },
    });
    dialogRef.componentInstance.dialogTitle =
      'Copy to destination [0-9], new window [w], or new saved folder [s]';
    dialogRef.componentInstance.inputLabel = 'Destination';
    dialogRef.afterClosed().subscribe((result) => {
      this.handleCopyMoveResult(result);
    });
  }

  private moveDialog(): void {
    this.dragMode = 'move';
    const dialogRef = this.moveCopyDialog.open(SimpleDialogComponent, {
      data: { inputValue: '' },
    });
    dialogRef.componentInstance.dialogTitle =
      'Move to destination [0-9], new window [w], or new saved folder [s]';
    dialogRef.componentInstance.inputLabel = 'Destination';
    dialogRef.afterClosed().subscribe((result) => {
      this.handleCopyMoveResult(result);
    });
  }

  private handleCopyMoveResult(result: string) {
    if (result === 'w') {
      this.dropInNew(DataSourceType.Window);
    } else if (result === 's') {
      this.dropInNew(DataSourceType.Folder);
    } else {
      this.dropPages(this.sidebarManagerService.getNthDataSource(parseInt(result, 10)));
    }
  }

  private getNameDialog(): Observable<string> {
    const dialogRef = this.nameDialog.open(SimpleDialogComponent, {
      data: { inputValue: '' },
    });
    dialogRef.componentInstance.dialogTitle = 'Name';
    dialogRef.componentInstance.inputLabel = 'Name';
    return dialogRef.afterClosed();
  }

  private updatePagesLocked(dataSources: DataSource[], specialUpdate?: () => Promise<void>) {
    let update = () => this.defaultUpdatePages(dataSources);
    if (specialUpdate) {
      update = specialUpdate;
    }
    this.pagesUpdating = true;
    this.lock.runExclusive(update).then(() => (this.pagesUpdating = false));
  }

  private async updatePagesRemove(tabId: number, removeInfo: browser.Tabs.OnRemovedRemoveInfoType) {
    const pageId: PageId = [DataSourceType.Window, removeInfo.windowId, tabId];
    this.windowPageElements = this.windowPageElements.filter(
      (page) => page.pageId.toString() !== pageId.toString(),
    );

    const pages = this.savedPageElements.concat(this.windowPageElements).map((selectablePage) => {
      return {
        page: selectablePage,
        timeLastAccessed: selectablePage.timeLastAccessed,
      };
    });

    this.updatePageElements((currentPageElements) => {
      currentPageElements.adjustCollection(
        pages
          .sort((a, b) => this.sortPages(a, b))
          .map((selectablePageTimeLastAccessedPair) => {
            return selectablePageTimeLastAccessedPair.page;
          }),
      );
    });
  }

  private async defaultUpdatePages(dataSources: DataSource[]) {
    await this.updatePages(dataSources);
  }

  private async updatePages(dataSources: DataSource[]) {
    this.windowPageElements = [];
    this.savedPageElements = [];
    if (dataSources.length > 0) {
      await this.dataService.getPagesByDataSources(dataSources).then((pages) => {
        pages.forEach((page) => {
          const selectablePage: SelectablePage = {
            ...page,
            id: IdGeneratorService.getIdFromPageId(page.pageId),
            isSelected: false,
          };
          this.getPageElementsOfType(page.pageId[0]).push(selectablePage);
        });
      });
    }

    const pages = this.savedPageElements.concat(this.windowPageElements).map((selectablePage) => {
      return {
        page: selectablePage,
        timeLastAccessed: selectablePage.timeLastAccessed,
      };
    });

    this.updatePageElements((currentPageElements) => {
      currentPageElements.adjustCollection(
        pages
          .sort((a, b) => this.sortPages(a, b))
          .map((selectablePageTimeLastAccessedPair) => {
            return selectablePageTimeLastAccessedPair.page;
          }),
      );
    });
  }

  private sortPages(
    a: { page: SelectablePage; timeLastAccessed: number },
    b: { page: SelectablePage; timeLastAccessed: number },
  ) {
    if (a.page.url === 'chrome://newtab/') {
      return 1;
    }
    if (b.page.url === 'chrome://newtab/') {
      return -1;
    }
    return b.timeLastAccessed - a.timeLastAccessed;
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
