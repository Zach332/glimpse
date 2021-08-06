import { Component } from '@angular/core';
import { SidebarButton } from '../interfaces/sidebar-button';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { SidebarManagerService } from './sidebar-manager.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  constructor(
    public pageManagerService: PageManagerService,
    public sidebarManagerService: SidebarManagerService,
  ) {}

  elementIsCollapsed = (buttonData: SidebarButton): boolean => {
    if (buttonData.parent) {
      return !this.sidebarManagerService.sidebarButtons.collection.find(
        (button) => button.id === buttonData.parent,
      )?.expanded;
    }
    return false;
  };

  selectAll(): void {
    this.pageManagerService.tabElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.tabElements.deselectAll();
  }
}
