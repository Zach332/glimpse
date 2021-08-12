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
    DataService.getAllSavedFolderDataSources().then((folders) => {
      folders.forEach((folder) => {
        if (folder.id !== 1) {
          this.sidebarButtons.push({ id: folder.id, label: folder.name, parent: 1 });
        }
      });
    });
  }
}
