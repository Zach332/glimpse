import { Component } from '@angular/core';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { SidebarManagerService } from './sidebar-management/sidebar-manager.service';

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

  selectAll(): void {
    this.pageManagerService.pageElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.pageElements.deselectAll();
  }
}
