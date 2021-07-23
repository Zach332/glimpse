import { Component } from '@angular/core';
import { SidebarButton } from '../interfaces/sidebar-button';
import { PageManagerService } from '../page-prev-display/page-manager.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  sidebarButtons: SidebarButton[] = [
    { id: 'window', label: 'Window' },
    { id: 'testa', label: 'test', parent: 'window' },
    { id: 'history', label: 'History' },
    { id: 'test', label: 'test', parent: 'history' },
  ];

  elementIsCollapsed = (buttonData: SidebarButton): boolean => {
    if (buttonData.parent) {
      return !this.sidebarButtons.find((button) => button.id === buttonData.parent)?.expanded;
    }
    return false;
  };

  constructor(private pageManagerService: PageManagerService) {}

  selectAll(): void {
    this.pageManagerService.tabElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.tabElements.deselectAll();
  }
}
