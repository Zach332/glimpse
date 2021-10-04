import { Injectable } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { IdGeneratorService } from 'src/app/id-generator-serivce';
import { BehaviorSubject, Observable } from 'rxjs';
import * as browser from 'webextension-polyfill';
import { DataService } from '../../data.service';
import { SelectableSidebarButton } from '../../interfaces/selectable-sidebar-button';
import { SelectableCollection } from '../../interfaces/selectable-collection';

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

  private browserObservable = new Observable((observer) => {
    browser.windows.onCreated.addListener(() => observer.next());
    browser.windows.onRemoved.addListener(() => observer.next());
    browser.bookmarks.onCreated.addListener(() => observer.next());
    browser.bookmarks.onChanged.addListener(() => observer.next());
    browser.bookmarks.onRemoved.addListener(() => observer.next());
  });

  constructor(private dataService: DataService) {
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
    this.browserObservable.subscribe(() => this.init());
    this.init();
  }

  public async init() {
    const windowButtons: SelectableSidebarButton[] = [];
    await this.dataService.getWindowDataSources().then((windows) => {
      windows.forEach((window) => {
        const sidebarButton: SelectableSidebarButton = {
          ...window,
          id: IdGeneratorService.getIdFromDataSourceIdOrPageId(window.dataSourceId),
          isSelected: true,
        };
        windowButtons.push(sidebarButton);
      });
    });

    const savedButtons: SelectableSidebarButton[] = [];
    await this.dataService.getFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        const sidebarButton: SelectableSidebarButton = {
          ...folder,
          id: IdGeneratorService.getIdFromDataSourceIdOrPageId(folder.dataSourceId),
          isSelected: true,
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

  public delete(button: SelectableSidebarButton): void {
    this.dataService.removeDataSource(button);
    this.updateDataSource(button.dataSourceId[0], (dataSource) => dataSource.remove(button.id));
  }

  public rename(button: SelectableSidebarButton, name: string): void {
    this.dataService.renameDataSource(button, name);
    button.name = name;
    this.updateDataSource(button.dataSourceId[0]);
  }

  public addWindow(name: string): void {
    this.dataService.addWindow(name);
  }

  public addFolder(name: string): void {
    this.dataService.addFolder(name).then((newDataSource) => {
      this.updateDataSource(DataSourceType.Folder, (dataSource) =>
        dataSource.push({
          ...newDataSource,
          id: IdGeneratorService.getIdFromDataSourceIdOrPageId(newDataSource.dataSourceId),
          isSelected: true,
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

  public isCollapsed(type: DataSourceType): boolean {
    if (type === DataSourceType.Window) {
      return !this.windowRootButton.expanded || false;
    }
    if (type === DataSourceType.Folder) {
      return !this.savedRootButton.expanded || false;
    }
    return false;
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
