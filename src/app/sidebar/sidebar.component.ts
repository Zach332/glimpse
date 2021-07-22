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
    { id: 'history', label: 'History' },
    { id: 'test', label: 'test', parent: 'history' },
  ];

  constructor(private pageManagerService: PageManagerService) {}

  selectAll(): void {
    this.pageManagerService.tabElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.tabElements.deselectAll();
  }
}
