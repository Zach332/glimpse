import { Injectable } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
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

  public historySidebarButton: SelectableSidebarButton;

  public newWindowButton: SelectableSidebarButton;

  public newSavedButton: SelectableSidebarButton;

  constructor() {
    this.windowRootButton = {
      id: 1,
      label: 'Windows',
      type: DataSourceType.Window,
      isSelected: false,
    };
    this.savedRootButton = {
      id: 1,
      label: 'Saved',
      type: DataSourceType.SavedFolder,
      isSelected: false,
    };
    this.historySidebarButton = {
      id: 1,
      label: 'History',
      type: DataSourceType.History,
      isSelected: false,
    };
    this.newWindowButton = {
      id: 1,
      label: 'New Window',
      type: DataSourceType.Window,
      isSelected: false,
    };
    this.newSavedButton = {
      id: 1,
      label: 'New Folder',
      type: DataSourceType.SavedFolder,
      isSelected: false,
    };
    this.init();
  }

  init() {
    DataService.getAllSavedFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        this.savedSidebarButtons.push({
          id: folder.id,
          label: folder.name,
          type: DataSourceType.SavedFolder,
          isSelected: false,
        });
      });
    });
  }

  async insertSavedFolder(): Promise<void> {
    const newFolderLabel = 'New Folder';
    const newFolderId = await DataService.insertSavedFolderDataSource(newFolderLabel);
    this.savedSidebarButtons.push({
      id: newFolderId,
      label: newFolderLabel,
      type: DataSourceType.SavedFolder,
      isSelected: false,
    });
  }

  delete(type: DataSourceType, id: number): void {
    this.getDataSource(type).remove(id);
    DataService.deleteDataSource(id);
    // TODO: Remove all the page data items as well. Handle deleting windows.
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
    if (type === DataSourceType.SavedFolder) {
      return !this.savedRootButton.expanded || false;
    }
    return false;
  }

  private getDataSource(type: DataSourceType): SelectableCollection<SelectableSidebarButton> {
    if (type === DataSourceType.Window) {
      return this.windowSidebarButtons;
    }
    if (type === DataSourceType.SavedFolder) {
      return this.savedSidebarButtons;
    }
    return new SelectableCollection<SelectableSidebarButton>();
  }
}
