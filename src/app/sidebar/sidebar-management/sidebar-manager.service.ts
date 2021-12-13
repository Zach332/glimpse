import { Injectable } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { IdGeneratorService } from 'src/app/id-generator-serivce';
import { BehaviorSubject, Observable } from 'rxjs';
import * as browser from 'webextension-polyfill';
import { Page } from 'src/app/interfaces/page';
import { IDBService } from 'src/app/idb-service';
import { DataService } from '../../data.service';
import { SelectableSidebarButton } from '../../interfaces/selectable-sidebar-button';
import { SelectableCollection } from '../../interfaces/selectable-collection';
import { Settings } from '../../interfaces/settings';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  public windowSidebarButtons: BehaviorSubject<SelectableCollection<SelectableSidebarButton>> =
    new BehaviorSubject(new SelectableCollection<SelectableSidebarButton>());

  public savedSidebarButtons: BehaviorSubject<SelectableCollection<SelectableSidebarButton>> =
    new BehaviorSubject(new SelectableCollection<SelectableSidebarButton>());

  public windowRootButton: SelectableSidebarButton;

  public savedRootButton: SelectableSidebarButton;

  public newWindowButton: SelectableSidebarButton;

  public newSavedButton: SelectableSidebarButton;

  public savedSettings: Settings;

  private static DEFAULT_SETTINGS: Settings = {
    pagePrevWidth: 400,
    pagePrevCollapse: false,
    dragMode: 'move',
    selectedSidebarItems: new Map<string, boolean>(),
    windowExpanded: true,
    savedExpanded: true,
    updateSettings: true,
  };

  private browserObservable = new Observable((observer) => {
    browser.windows.onCreated.addListener(() => observer.next());
    browser.windows.onRemoved.addListener(() => observer.next());
    browser.bookmarks.onCreated.addListener(() => observer.next());
    browser.bookmarks.onChanged.addListener(() => observer.next());
    browser.bookmarks.onRemoved.addListener(() => observer.next());
  });

  public activeObservable = new Observable((observer) => {
    browser.windows.onFocusChanged.addListener(() => observer.next());
  });

  constructor() {
    this.savedSettings = SidebarManagerService.DEFAULT_SETTINGS;

    // TODO: These should use a new interface or something
    // And maybe rename SelectableSidebarButton to SelectableDataSource
    this.windowRootButton = {
      dataSourceId: [DataSourceType.Window, 1],
      id: 1,
      name: 'Windows',
      isSelected: false,
    };
    this.savedRootButton = {
      dataSourceId: [DataSourceType.Folder, '1'],
      id: 1,
      name: 'Saved',
      isSelected: false,
    };
    this.newWindowButton = {
      dataSourceId: [DataSourceType.Window, 1],
      id: 1,
      name: 'New Window',
      isSelected: false,
    };
    this.newSavedButton = {
      dataSourceId: [DataSourceType.Folder, '1'],
      id: 1,
      name: 'New Folder',
      isSelected: false,
    };
    this.browserObservable.subscribe(() => this.createSidebarItems());
    this.init();
  }

  private async init() {
    await this.restoreSavedSettings();
    this.createSidebarItems();
  }

  private async restoreSavedSettings() {
    await IDBService.getSettings().then((settings) => {
      if (settings) {
        this.savedSettings = settings;
      }
    });
    this.windowRootButton.expanded = this.savedSettings.windowExpanded;
    this.savedRootButton.expanded = this.savedSettings.savedExpanded;
  }

  private async createSidebarItems() {
    const windowButtons: SelectableSidebarButton[] = [];
    await DataService.getWindowDataSources().then((windows) => {
      windows.forEach((window) => {
        const sidebarButton: SelectableSidebarButton = {
          ...window,
          id: IdGeneratorService.getIdFromDataSourceId(window.dataSourceId),
          isSelected:
            this.savedSettings.selectedSidebarItems.get(window.dataSourceId.toString()) || false,
        };
        windowButtons.push(sidebarButton);
      });
    });

    const savedButtons: SelectableSidebarButton[] = [];
    await DataService.getFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        const sidebarButton: SelectableSidebarButton = {
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

  public delete(button: SelectableSidebarButton): void {
    DataService.removeDataSource(button);
    this.updateDataSource(button.dataSourceId[0], (dataSource) => dataSource.remove(button.id));
  }

  public rename(button: SelectableSidebarButton, name: string): void {
    DataService.renameDataSource(button, name);
    button.name = name;
    this.updateDataSource(button.dataSourceId[0]);
  }

  public addWindow(name: string, initialPages?: Page[], copy?: boolean): void {
    DataService.addWindow(name, initialPages, copy);
  }

  public addFolder(name: string, initialPages?: Page[], copy?: boolean): void {
    DataService.addFolder(name, initialPages, copy).then((newDataSource) => {
      this.updateDataSource(DataSourceType.Folder, (dataSource) =>
        dataSource.push({
          ...newDataSource,
          id: IdGeneratorService.getIdFromDataSourceId(newDataSource.dataSourceId),
          isSelected: false,
        }),
      );
    });
  }

  public selectToId(type: DataSourceType, id: number): void {
    this.updateDataSource(type, (dataSource) => dataSource.selectToId(id));
  }

  public toggleId(type: DataSourceType, id: number): void {
    this.updateDataSource(type, (dataSource) => dataSource.toggleId(id));
  }

  public areAllSelected(type: DataSourceType): boolean {
    return this.getDataSourceObservable(type).value.areAllSelected();
  }

  public hasChildren(type: DataSourceType): boolean {
    return this.getDataSourceObservable(type).value.collection.length > 0;
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
    if (index < this.windowSidebarButtons.value.length) {
      return this.windowSidebarButtons.value.get(index);
    }
    index -= this.windowSidebarButtons.value.length;
    return this.savedSidebarButtons.value.get(index);
  }

  public updateDataSource(
    type: DataSourceType,
    update?: (original: SelectableCollection<SelectableSidebarButton>) => void,
  ) {
    const dataSource = this.getDataSourceObservable(type).value;
    if (update) {
      update(dataSource);
    }
    this.getDataSourceObservable(type).next(dataSource);
    this.updateSettings((settings) => this.updateSettingsMap(settings));
  }

  public updateSettings(update?: (original: Settings) => void) {
    const originalUpdateSettings = this.savedSettings.updateSettings;
    if (update) {
      update(this.savedSettings);
    }
    if (this.savedSettings.updateSettings || originalUpdateSettings) {
      IDBService.putSettings(this.savedSettings);
    }
  }

  private updateSettingsMap(settings: Settings) {
    const updatedMap = new Map<string, boolean>();
    this.windowSidebarButtons.value.collection.forEach((element) =>
      updatedMap.set(element.dataSourceId.toString(), element.isSelected),
    );
    this.savedSidebarButtons.value.collection.forEach((element) =>
      updatedMap.set(element.dataSourceId.toString(), element.isSelected),
    );
    settings.selectedSidebarItems = updatedMap;
  }

  private getDataSourceObservable(
    type: DataSourceType,
  ): BehaviorSubject<SelectableCollection<SelectableSidebarButton>> {
    if (type === DataSourceType.Window) {
      return this.windowSidebarButtons;
    }
    if (type === DataSourceType.Folder) {
      return this.savedSidebarButtons;
    }
    return new BehaviorSubject<SelectableCollection<SelectableSidebarButton>>(
      new SelectableCollection<SelectableSidebarButton>(),
    );
  }
}
