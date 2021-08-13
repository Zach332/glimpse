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
    this.sidebarButtons.push({ id: SidebarManagerService.RESERVED_IDS.Saved, label: 'Saved' });
    DataService.getAllSavedFolders().then((folders) => {
      folders.forEach((folder) => {
        if (folder.folderId !== 1) {
          this.sidebarButtons.push({
            id: folder.folderId,
            label: folder.name,
            parent: SidebarManagerService.RESERVED_IDS.Saved,
          });
        }
      });
      this.sidebarButtons.push({
        id: SidebarManagerService.RESERVED_IDS['New Folder'],
        label: 'New Folder',
        parent: SidebarManagerService.RESERVED_IDS.Saved,
      });
    });
  }

  async insertSavedFolder(): Promise<void> {
    const newFolderLabel = 'New Folder';
    const newFolderId = await DataService.insertSavedFolder(newFolderLabel);
    this.sidebarButtons.insertBeforeId(
      { id: newFolderId, label: newFolderLabel, parent: SidebarManagerService.RESERVED_IDS.Saved },
      SidebarManagerService.RESERVED_IDS['New Folder'],
    );
  }
}
