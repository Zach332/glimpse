import { Injectable } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { IdGeneratorService } from 'src/app/id-generator-serivce';
import { BehaviorSubject, Observable } from 'rxjs';
import * as browser from 'webextension-polyfill';
import { Page } from 'src/app/interfaces/page';
import { BookmarkService } from 'src/app/bookmark-service';
import { HotkeyManagerService } from 'src/app/hotkey-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from 'src/app/general/simple-dialog/simple-dialog.component';
import { DataService } from '../../data.service';
import { SelectableDataSource } from '../../interfaces/selectable-sidebar-button';
import { SelectableCollection } from '../../interfaces/selectable-collection';
import { Settings } from '../../interfaces/settings';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  public windowSidebarButtons = new SelectableCollection<SelectableDataSource>();

  public savedSidebarButtons = new SelectableCollection<SelectableDataSource>();

  public selectedSidebarButtons: BehaviorSubject<SelectableDataSource[]> = new BehaviorSubject(
    this.windowSidebarButtons
      .getSelectedItems()
      .concat(this.savedSidebarButtons.getSelectedItems()),
  );

  public windowRootButton: SelectableDataSource;

  public savedRootButton: SelectableDataSource;

  public newWindowButton: SelectableDataSource;

  public newSavedButton: SelectableDataSource;

  public savedSettings: Settings;

  public initialized: boolean = false;

  private static DEFAULT_SETTINGS: Settings = {
    pagePrevWidth: 400,
    pagePrevCollapse: false,
    dragMode: 'move',
    selectedSidebarItems: new Map<string, boolean>(),
    windowExpanded: true,
    savedExpanded: true,
    sidebarExpanded: true,
    updateSettings: true,
    darkMode: true,
  };

  private browserObservable = new Observable((observer) => {
    browser.windows.onCreated.addListener(() => observer.next());
    browser.windows.onRemoved.addListener(() => observer.next());
    browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
      if (bookmark.parentId === (await BookmarkService.getRootGlimpseFolder()).id) {
        observer.next();
      }
    });
    browser.bookmarks.onChanged.addListener(() => observer.next());
    browser.bookmarks.onRemoved.addListener(() => observer.next());
  });

  public activeObservable = new Observable((observer) => {
    browser.windows.onFocusChanged.addListener(() => observer.next());
  });

  constructor(
    private dataService: DataService,
    private hotkeyManagerService: HotkeyManagerService,
    private nameDialog: MatDialog,
  ) {
    this.windowRootButton = {
      dataSourceId: [DataSourceType.Window, 1],
      id: '1',
      name: 'Windows',
      isSelected: false,
    };
    this.savedRootButton = {
      dataSourceId: [DataSourceType.Folder, '1'],
      id: '1',
      name: 'Saved',
      isSelected: false,
    };
    this.newWindowButton = {
      dataSourceId: [DataSourceType.Window, 1],
      id: '1',
      name: 'New Window',
      isSelected: false,
    };
    this.newSavedButton = {
      dataSourceId: [DataSourceType.Folder, '1'],
      id: '1',
      name: 'New Folder',
      isSelected: false,
    };
    this.savedSettings = SidebarManagerService.DEFAULT_SETTINGS;
    this.restoreSavedSettings();

    this.browserObservable.subscribe(() => this.createSidebarItems());
    this.init();

    this.hotkeyManagerService
      .addShortcut('[', 'create new window')
      .subscribe(() => this.addNewDataSouceButtonPress(this.newWindowButton));
    this.hotkeyManagerService
      .addShortcut(']', 'create new folder')
      .subscribe(() => this.addNewDataSouceButtonPress(this.newSavedButton));
  }

  private async init() {
    await this.createSidebarItems();
    this.initialized = true;
  }

  private restoreSavedSettings() {
    const requestedSettings = localStorage.getItem('settings');
    if (requestedSettings) {
      this.savedSettings = JSON.parse(requestedSettings, this.reviver);
    }
    this.windowRootButton.expanded = this.savedSettings.windowExpanded;
    this.savedRootButton.expanded = this.savedSettings.savedExpanded;
  }

  private async createSidebarItems() {
    const windowButtons: SelectableDataSource[] = [];
    await this.dataService.getWindowDataSources().then((windows) => {
      windows.forEach((window) => {
        const sidebarButton: SelectableDataSource = {
          ...window,
          id: IdGeneratorService.getIdFromDataSourceId(window.dataSourceId),
          isSelected:
            this.savedSettings.selectedSidebarItems.get(window.dataSourceId.toString()) || false,
        };
        windowButtons.push(sidebarButton);
      });
    });

    const savedButtons: SelectableDataSource[] = [];
    await this.dataService.getFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        const sidebarButton: SelectableDataSource = {
          ...folder,
          id: IdGeneratorService.getIdFromDataSourceId(folder.dataSourceId),
          isSelected:
            this.savedSettings.selectedSidebarItems.get(folder.dataSourceId.toString()) || false,
        };
        savedButtons.push(sidebarButton);
      });
    });

    this.updateDataSource(DataSourceType.Window, (dataSource) =>
      dataSource.adjustCollection(windowButtons),
    );
    this.updateDataSource(DataSourceType.Folder, (dataSource) =>
      dataSource.adjustCollection(savedButtons),
    );
  }

  public toggleExpanded(type: DataSourceType) {
    if (type === DataSourceType.Window) {
      this.windowRootButton.expanded = !this.windowRootButton.expanded;
      this.updateSettings(
        (settings) => (settings.windowExpanded = this.windowRootButton.expanded || false),
      );
    } else {
      this.savedRootButton.expanded = !this.savedRootButton.expanded;
      this.updateSettings(
        (settings) => (settings.savedExpanded = this.savedRootButton.expanded || false),
      );
    }
  }

  public delete(button: SelectableDataSource): void {
    this.dataService.removeDataSource(button);
    this.updateDataSource(button.dataSourceId[0], (dataSource) => dataSource.remove(button.id));
  }

  public rename(button: SelectableDataSource, name: string): void {
    this.dataService.renameDataSource(button, name);
    button.name = name;
    this.updateDataSource(button.dataSourceId[0]);
  }

  public addWindow(name: string, initialPages?: Page[], copy?: boolean): void {
    this.dataService.addWindow(name, initialPages, copy);
  }

  public addFolder(name: string, initialPages?: Page[], copy?: boolean): void {
    this.dataService.addFolder(name, initialPages, copy).then((newDataSource) => {
      this.updateDataSource(DataSourceType.Folder, (dataSource) =>
        dataSource.push({
          ...newDataSource,
          id: IdGeneratorService.getIdFromDataSourceId(newDataSource.dataSourceId),
          isSelected: false,
        }),
      );
    });
  }

  public selectToId(type: DataSourceType, id: string): void {
    this.updateDataSource(type, (dataSource) => dataSource.selectToId(id));
  }

  public toggleId(type: DataSourceType, id: string): void {
    this.updateDataSource(type, (dataSource) => dataSource.toggleId(id));
  }

  public areAllSelected(type: DataSourceType): boolean {
    return this.getDataSourceCollection(type).areAllSelected();
  }

  public hasChildren(type: DataSourceType): boolean {
    return this.getDataSourceCollection(type).collection.length > 0;
  }

  public toggleRoot(type: DataSourceType): void {
    if (this.areAllSelected(type)) {
      this.updateDataSource(type, (dataSource) => dataSource.deselectAll());
    } else {
      this.updateDataSource(type, (dataSource) => dataSource.selectAll());
    }
  }

  public selectAll() {
    this.updateDataSource(DataSourceType.Folder, (dataSource) => dataSource.selectAll());
    this.updateDataSource(DataSourceType.Window, (dataSource) => dataSource.selectAll());
  }

  public deselectAll() {
    this.updateDataSource(DataSourceType.Folder, (dataSource) => dataSource.deselectAll());
    this.updateDataSource(DataSourceType.Window, (dataSource) => dataSource.deselectAll());
  }

  public isCollapsed(type: DataSourceType): boolean {
    if (type === DataSourceType.Window) {
      return !this.windowRootButton.expanded || false;
    }
    if (type === DataSourceType.Folder) {
      return !this.savedRootButton.expanded || false;
    }
    return false;
  }

  public getNthDataSource(n: number) {
    let index = n - 1;
    if (index < this.windowSidebarButtons.length) {
      return this.windowSidebarButtons.get(index);
    }
    index -= this.windowSidebarButtons.length;
    return this.savedSidebarButtons.get(index);
  }

  public updateDataSource(
    type: DataSourceType,
    update?: (original: SelectableCollection<SelectableDataSource>) => void,
  ) {
    const dataSource = this.getDataSourceCollection(type);
    if (update) {
      update(dataSource);
    }
    this.selectedSidebarButtons.next(
      this.windowSidebarButtons
        .getSelectedItems()
        .concat(this.savedSidebarButtons.getSelectedItems()),
    );
    this.updateSettings((settings) => this.updateSettingsMap(settings));
  }

  public updateSettings(update?: (original: Settings) => void) {
    const originalUpdateSettings = this.savedSettings.updateSettings;
    if (update) {
      update(this.savedSettings);
    }
    if (this.savedSettings.updateSettings || originalUpdateSettings) {
      localStorage.setItem('settings', JSON.stringify(this.savedSettings, this.replacer));
    }
  }

  private updateSettingsMap(settings: Settings) {
    const updatedMap = new Map<string, boolean>();
    this.windowSidebarButtons.collection.forEach((element) =>
      updatedMap.set(element.dataSourceId.toString(), element.isSelected),
    );
    this.savedSidebarButtons.collection.forEach((element) =>
      updatedMap.set(element.dataSourceId.toString(), element.isSelected),
    );
    settings.selectedSidebarItems = updatedMap;
  }

  private getDataSourceCollection(type: DataSourceType) {
    if (type === DataSourceType.Window) {
      return this.windowSidebarButtons;
    }
    return this.savedSidebarButtons;
  }

  addNewDataSouceButtonPress(buttonData: SelectableDataSource): void {
    this.getNameDialog().subscribe((result) => {
      if (result !== undefined && result !== null) {
        if (buttonData.dataSourceId[0] === DataSourceType.Window) {
          this.addWindow(result);
        } else {
          this.addFolder(result);
        }
      }
    });
  }

  getNameDialog(): Observable<string> {
    const dialogRef = this.nameDialog.open(SimpleDialogComponent, {
      data: { inputValue: '' },
    });
    dialogRef.componentInstance.dialogTitle = 'Name';
    dialogRef.componentInstance.inputLabel = 'Name';
    return dialogRef.afterClosed();
  }

  private replacer(key: any, value: any) {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    }
    return value;
  }

  private reviver(key: any, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }
}
