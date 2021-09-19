import { Injectable } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { IdGeneratorService } from 'src/app/id-generator-serivce';
import { DataService } from '../../data.service';
import { SelectableSidebarButton } from '../../interfaces/selectable-sidebar-button';
import { SelectableCollection } from '../../interfaces/selectable-collection';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  public windowSidebarButtons: SelectableCollection<SelectableSidebarButton> =
    new SelectableCollection<SelectableSidebarButton>();

  public savedSidebarButtons: SelectableCollection<SelectableSidebarButton> =
    new SelectableCollection<SelectableSidebarButton>();

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

  async init() {
    this.dataService.getWindowDataSources().then((windows) => {
      windows.forEach((window) => {
        const sidebarButton: SelectableSidebarButton = {
          ...window,
          id: this.idGeneratorService.getId(),
          isSelected: true,
        };
        this.windowSidebarButtons.push(sidebarButton);
      });
    });

    this.dataService.getFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        const sidebarButton: SelectableSidebarButton = {
          ...folder,
          id: this.idGeneratorService.getId(),
          isSelected: true,
        };
        this.savedSidebarButtons.push(sidebarButton);
      });
    });
  }

  // async insertSavedFolder(): Promise<void> {
  //   const newFolderLabel = 'New Folder';
  //   const newFolderId = await DataService.insertSavedFolderDataSource(newFolderLabel);
  //   this.savedSidebarButtons.push({
  //     glimpseId: newFolderId,
  //     label: newFolderLabel,
  //     type: DataSourceType.Folder,
  //     isSelected: false,
  //   });
  // }

  // delete(type: DataSourceType, id: number): void {
  //   this.getDataSource(type).remove(id);
  //   DataService.deleteDataSource(id);
  //   // TODO: Remove all the page data items as well. Handle deleting windows.
  // }

  public getSelectedSidebarButtons() {
    return this.windowSidebarButtons
      .getSelectedItems()
      .concat(this.savedSidebarButtons.getSelectedItems());
  }

  public selectToId(type: DataSourceType, id: number): void {
    this.getDataSource(type).selectToId(id);
  }

  public toggleId(type: DataSourceType, id: number): void {
    this.getDataSource(type).toggleId(id);
  }

  public areAllSelected(type: DataSourceType): boolean {
    return this.getDataSource(type).areAllSelected();
  }

  public hasChildren(type: DataSourceType): boolean {
    return this.getDataSource(type).collection.length > 0;
  }

  public toggleRoot(type: DataSourceType): void {
    if (this.areAllSelected(type)) {
      this.getDataSource(type).deselectAll();
    } else {
      this.getDataSource(type).selectAll();
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

  private getDataSource(type: DataSourceType): SelectableCollection<SelectableSidebarButton> {
    if (type === DataSourceType.Window) {
      return this.windowSidebarButtons;
    }
    if (type === DataSourceType.Folder) {
      return this.savedSidebarButtons;
    }
    return new SelectableCollection<SelectableSidebarButton>();
  }
}
