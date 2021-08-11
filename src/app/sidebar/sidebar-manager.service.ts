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

  constructor() {
    this.init();
  }

  init() {
    this.sidebarButtons.push({ id: 1, label: 'Saved' });
    DataService.getAllSavedFolders().then((folders) => {
      folders.forEach((folder) => {
        if (folder.folderId !== 1) {
          this.sidebarButtons.push({ id: folder.folderId, label: folder.name, parent: 1 });
        }
      });
    });
  }
}
