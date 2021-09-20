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

  constructor(private dataService: DataService, private idGeneratorService: IdGeneratorService) {
    // TODO: These should use a new interface or something
    // And maybe rename SelectableSidebarButton to SelectableDataSource
    this.windowRootButton = {
      glimpseId: [DataSourceType.Window, 1],
      id: 1,
      name: 'Windows',
      isSelected: false,
    };
    this.savedRootButton = {
      glimpseId: [DataSourceType.Bookmark, '1'],
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
      glimpseId: [DataSourceType.Bookmark, '1'],
      id: 1,
      name: 'New Folder',
      isSelected: false,
    };
    this.init();
  }

  async init() {
    this.dataService.getWindowDataSources().then((windows) => {
      windows.forEach((window) => {
        const sidebarButton: SelectableSidebarButton = {
          ...window,
          id: this.idGeneratorService.getId(),
          isSelected: true,
        };
        this.pushData(DataSourceType.Window, sidebarButton);
      });
    });

    // TODO: initialize saved
  }

  // async insertSavedFolder(): Promise<void> {
  //   const newFolderLabel = 'New Folder';
  //   const newFolderId = await DataService.insertSavedFolderDataSource(newFolderLabel);
  //   this.savedSidebarButtons.push({
  //     glimpseId: newFolderId,
  //     label: newFolderLabel,
  //     type: DataSourceType.Bookmark,
  //     isSelected: false,
  //   });
  // }

  // delete(type: DataSourceType, id: number): void {
  //   this.getDataSource(type).remove(id);
  //   DataService.deleteDataSource(id);
  //   // TODO: Remove all the page data items as well. Handle deleting windows.
  // }

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
    if (type === DataSourceType.Bookmark) {
      return !this.savedRootButton.expanded || false;
    }
    return false;
  }

  public updateDataSource(
    type: DataSourceType,
    update: (original: SelectableCollection<SelectableSidebarButton>) => void,
  ) {
    const dataSource = this.getDataSourceObservable(type).value;
    update(dataSource);
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
    if (type === DataSourceType.Bookmark) {
      return this.savedSidebarButtons;
    }
    return new BehaviorSubject<SelectableCollection<SelectableSidebarButton>>(
      new SelectableCollection<SelectableSidebarButton>(),
    );
  }
}
