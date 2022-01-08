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
import { SelectableSidebarButton } from '../interfaces/selectable-sidebar-button';
import { PageFilterService } from '../page-filter.service';
import { SidebarManagerService } from '../sidebar/sidebar-management/sidebar-manager.service';
import { HotkeyManagerService } from '../hotkey-manager.service';
import { DataSource } from '../interfaces/data-source';
import { SimpleDialogComponent } from '../general/simple-dialog/simple-dialog.component';

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

  public pagePrevMax = 600;

  public pagePrevMin = 200;

  public pagePrevStep = 1;

  public searchQuery = new BehaviorSubject<string>('');

  private browserObservable = new Observable((observer) => {
    browser.tabs.onCreated.addListener(() => observer.next());
    browser.tabs.onRemoved.addListener(() => observer.next());
    browser.tabs.onActivated.addListener(() => observer.next());
    browser.tabs.onDetached.addListener(() => observer.next());
    browser.webNavigation.onCommitted.addListener(() => observer.next());
  });

  private lock = new Mutex();

  constructor(
    private sidebarManagerService: SidebarManagerService,
    private pageFilterService: PageFilterService,
    private hotkeyManagerService: HotkeyManagerService,
    private ngZone: NgZone,
    private moveCopyDialog: MatDialog,
    private nameDialog: MatDialog,
  ) {
    this.sidebarManagerService.savedSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Folder, selectedButtons)),
    );
    this.sidebarManagerService.windowSidebarButtons.subscribe((selectedButtons) =>
      this.lock.runExclusive(() => this.updatePages(DataSourceType.Window, selectedButtons)),
    );
    this.browserObservable.subscribe(() =>
      this.lock.runExclusive(() => {
        this.updatePages(DataSourceType.Window, sidebarManagerService.windowSidebarButtons.value);
      }),
    );
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

  public get updateSettings() {
    return this.sidebarManagerService.savedSettings.updateSettings;
  }

  public set updateSettings(newUpdateSettings: boolean) {
    this.sidebarManagerService.updateSettings(
      (oldSettings) => (oldSettings.updateSettings = newUpdateSettings),
    );
  }

  public updatePageWidth($event: MatSliderChange): void {
    this.pagePrevWidth = $event.value ? $event.value : this.pagePrevWidth;
  }

  public removePage(page: SelectablePage) {
    DataService.removePage(page);
  }

  public removeAll() {
    const pagesToRemove = this.displayPageElements.collection.filter(
      (element) => element.isSelected,
    );
    DataService.removePages(pagesToRemove);
    pagesToRemove.forEach((page) => {
      this.updatePageElements((currentPageElements) => currentPageElements.remove(page.id));
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
      await DataService.copyPages(this.getDraggedPages(), destination);
    } else {
      await DataService.movePages(this.getDraggedPages(), destination);
    }
  }

  public async openAll(): Promise<void> {
    if (this.dragMode === 'copy') {
      await DataService.copyPages(this.getDraggedPages(), await DataService.getActiveDataSource());
    } else {
      await DataService.movePages(this.getDraggedPages(), await DataService.getActiveDataSource());
    }
  }

  public async dropInNew(type: DataSourceType) {
    const matchingName = this.getMatchingNameForSelected();
    if (matchingName && this.notDefaultName(await matchingName)) {
      this.dropInNewWithName(await matchingName, type);
    } else {
      this.getNameDialog().subscribe((nameResult) => {
        if (nameResult !== null && nameResult !== undefined) {
          this.dropInNewWithName(nameResult, type);
        }
      });
    }
  }

  private notDefaultName(name: string) {
    const regex = new RegExp('^Window [0-9]*$');
    return !regex.test(name);
  }

  private getMatchingNameForSelected() {
    const selectedWindows =
      this.sidebarManagerService.windowSidebarButtons.value.getSelectedItems();
    const selectedFolders = this.sidebarManagerService.savedSidebarButtons.value.getSelectedItems();
    if (selectedFolders.length + selectedWindows.length !== 1) {
      return null;
    }
    let selectedSidebarItem;
    if (selectedWindows.length === 1) {
      selectedSidebarItem = selectedWindows[0];
    } else {
      selectedSidebarItem = selectedFolders[0];
    }
    if (this.pageElements.collection.every((page) => page.isSelected)) {
      return selectedSidebarItem.name;
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
    await DataService.getPagesByDataSources(selectedDataSources).then((pages) => {
      pages.forEach((page) => {
        const selectablePage: SelectablePage = {
          ...page,
          id: IdGeneratorService.getIdFromPageId(page.pageId),
          isSelected: false,
        };
        this.getPageElementsOfType(dataSourceType).push(selectablePage);
      });
    });

    await Promise.all(
      this.savedPageElements.concat(this.windowPageElements).map(async (selectablePage) => {
        return {
          page: selectablePage,
          timeLastAccessed: await selectablePage.timeLastAccessed,
        };
      }),
    ).then((pages) => {
      this.updatePageElements((currentPageElements) =>
        currentPageElements.adjustCollection(
          pages
            .sort((a, b) => this.sortPages(a, b))
            .map((selectablePageTimeLastAccessedPair) => {
              return selectablePageTimeLastAccessedPair.page;
            }),
        ),
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
