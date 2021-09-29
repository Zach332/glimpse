import { Injectable } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { IdGeneratorService } from 'src/app/id-generator-serivce';
import { BehaviorSubject } from 'rxjs';
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

  constructor(private dataService: DataService) {
    // TODO: These should use a new interface or something
    // And maybe rename SelectableSidebarButton to SelectableDataSource
    this.windowRootButton = {
      glimpseId: [DataSourceType.Window, 1],
      id: 1,
      name: 'Windows',
      isSelected: false,
    };
    this.savedRootButton = {
      glimpseId: [DataSourceType.Folder, '1'],
      id: 1,
      name: 'Saved',
      isSelected: false,
    };
    this.newWindowButton = {
      glimpseId: [DataSourceType.Window, 1],
      id: 1,
      name: 'New Window',
      isSelected: false,
    };
    this.newSavedButton = {
      glimpseId: [DataSourceType.Folder, '1'],
      id: 1,
      name: 'New Folder',
      isSelected: false,
    };
    this.init();
  }

  public async init() {
    this.windowSidebarButtons = new BehaviorSubject(
      new SelectableCollection<SelectableSidebarButton>(),
    );
    this.savedSidebarButtons = new BehaviorSubject(
      new SelectableCollection<SelectableSidebarButton>(),
    );

    this.dataService.getWindowDataSources().then((windows) => {
      windows.forEach((window) => {
        const sidebarButton: SelectableSidebarButton = {
          ...window,
          id: IdGeneratorService.getIdFromGlimpseId(window.glimpseId),
          isSelected: true,
        };
        this.pushData(DataSourceType.Window, sidebarButton);
      });
    });

    this.dataService.getFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        const sidebarButton: SelectableSidebarButton = {
          ...folder,
          id: IdGeneratorService.getIdFromGlimpseId(folder.glimpseId),
          isSelected: true,
        };
        this.pushData(DataSourceType.Folder, sidebarButton);
      });
    });
  }

  public delete(button: SelectableSidebarButton): void {
    this.dataService.removeDataSource(button);
    this.updateDataSource(button.glimpseId[0], (dataSource) => dataSource.remove(button.id));
  }

  public rename(button: SelectableSidebarButton, name: string): void {
    this.dataService.renameDataSource(button, name);
    button.name = name;
    this.updateDataSource(button.glimpseId[0]);
  }

  public addWindow(name: string): void {
    this.dataService.addWindow(name);
  }

  public addFolder(name: string): void {
    this.dataService.addFolder(name).then((newDataSource) => {
      this.updateDataSource(DataSourceType.Folder, (dataSource) =>
        dataSource.push({
          ...newDataSource,
          id: IdGeneratorService.getIdFromGlimpseId(newDataSource.glimpseId),
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

  private pushData(type: DataSourceType, data: SelectableSidebarButton) {
    this.updateDataSource(type, (dataSource) => dataSource.push(data));
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
