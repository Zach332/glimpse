import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { SelectableCollection } from '../interfaces/selectable-collection';
import { SelectableSidebarButton } from '../interfaces/selectable-sidebar-button';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  public sidebarButtons: SelectableCollection<SelectableSidebarButton> =
    new SelectableCollection<SelectableSidebarButton>();

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
