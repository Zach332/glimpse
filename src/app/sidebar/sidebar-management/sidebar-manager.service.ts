import { Injectable } from '@angular/core';
import { DataService } from '../../data.service';
import { SelectableSidebarButton } from '../../interfaces/selectable-sidebar-button';
import { SelectableCollection } from '../../interfaces/selectable-collection';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { DataSource } from '../../interfaces/data-source';
import { NewButton } from '../sidebar-button/new-button';
import { RootButton } from '../sidebar-button/root-button';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  public windowSidebarButtons: SelectableCollection<NewButton> =
    new SelectableCollection<NewButton>();
  public savedSidebarButtons: SelectableCollection<SelectableSidebarButton> =
    new SelectableCollection<SelectableSidebarButton>();
  public windowRootButton: RootButton;

  constructor() {
    this.windowRootButton = new RootButton(1, "Windows", DataSourceType.Window, si)
    this.init();
  }

  init() {
    this.sidebarButtons.push({ id: SidebarManagerService.RESERVED_IDS.Saved, label: 'Saved' });
    DataService.getAllSavedFolderDataSources().then((folders) => {
      console.log(folders);
      folders.forEach((folder) => {
        this.sidebarButtons.push({
          id: folder.id,
          label: folder.name,
          parent: SidebarManagerService.RESERVED_IDS.Saved,
        });
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
    const newFolderId = await DataService.insertSavedFolderDataSource(newFolderLabel);
    this.sidebarButtons.insertBeforeId(
      { id: newFolderId, label: newFolderLabel, parent: SidebarManagerService.RESERVED_IDS.Saved },
      SidebarManagerService.RESERVED_IDS['New Folder'],
    );
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

  private getDataSource(type: DataSourceType): SelectableCollection<SelectableSidebarButton> {
    if (type === DataSourceType.Window) {
      return this.windowSidebarButtons;
    } else if (type === DataSourceType.SavedFolder) {
      return this.savedSidebarButtons;
    } else {
      return new SelectableCollection<SelectableSidebarButton>();
    }
  }
}
