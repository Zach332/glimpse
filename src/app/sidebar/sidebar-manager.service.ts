import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { SelectableSidebarButton } from '../interfaces/selectable-sidebar-button';
import { SelectableTree } from '../interfaces/selectable-tree';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  public sidebarButtons: SelectableTree<SelectableSidebarButton> =
    new SelectableTree<SelectableSidebarButton>();

  public static readonly RESERVED_IDS = {
    Windows: 1,
    'New Window': 2,
    History: 3,
    Saved: 4,
    Uncategorized: 5,
    'New Folder': 6,
  };

  constructor() {
    this.init();
  }

  init() {
    this.sidebarButtons.push({
      id: SidebarManagerService.RESERVED_IDS.Saved,
      label: 'Saved',
      isSelected: false,
    });
    DataService.getAllSavedFolderDataSources().then((folders) => {
      console.log(folders);
      folders.forEach((folder) => {
        this.sidebarButtons.push({
          id: folder.id,
          label: folder.name,
          parent: SidebarManagerService.RESERVED_IDS.Saved,
          isSelected: false,
        });
      });
      this.sidebarButtons.push({
        id: SidebarManagerService.RESERVED_IDS['New Folder'],
        label: 'New Folder',
        parent: SidebarManagerService.RESERVED_IDS.Saved,
        isSelected: false,
      });
    });
  }

  async insertSavedFolder(): Promise<void> {
    const newFolderLabel = 'New Folder';
    const newFolderId = await DataService.insertSavedFolderDataSource(newFolderLabel);
    this.sidebarButtons.insertBeforeId(
      {
        id: newFolderId,
        label: newFolderLabel,
        parent: SidebarManagerService.RESERVED_IDS.Saved,
        isSelected: false,
      },
      SidebarManagerService.RESERVED_IDS['New Folder'],
    );
  }

  delete(id: number): void {
    this.sidebarButtons.remove(id);
    DataService.deleteDataSource(id);
    // TODO: Remove all the page data items as well. Handle deleting windows.
  }
}
