import { Component } from '@angular/core';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { SidebarManagerService } from './sidebar-management/sidebar-manager.service';
import { DataSourceType } from '../interfaces/data-source-type';

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

  public get DataSourceType() {
    return DataSourceType;
  }

  selectAll(): void {
    this.pageManagerService.displayPageElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.displayPageElements.deselectAll();
  }

  removeAll(): void {
    this.pageManagerService.removeAll();
  }

  openAll(): void {
    // TODO this.pageManagerService.displayPageElements.openAll();
  }
}
