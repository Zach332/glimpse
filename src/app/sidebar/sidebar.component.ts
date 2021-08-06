import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { SidebarButton } from '../interfaces/sidebar-button';
import { PageManagerService } from '../page-prev-display/page-manager.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  sidebarButtons: SidebarButton[] = [];

  ngOnInit() {
    this.sidebarButtons.push({ id: 1, label: 'Saved' });
    DataService.getAllSavedFolders().then((folders) => {
      folders.forEach((folder) => {
        if (folder.folderId !== 1) {
          this.sidebarButtons.push({ id: folder.folderId, label: folder.name, parent: 1 });
        }
      });
    });
  }

  elementIsCollapsed = (buttonData: SidebarButton): boolean => {
    if (buttonData.parent) {
      return !this.sidebarButtons.find((button) => button.id === buttonData.parent)?.expanded;
    }
    return false;
  };

  constructor(public pageManagerService: PageManagerService) {}

  selectAll(): void {
    this.pageManagerService.tabElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.tabElements.deselectAll();
  }
}
