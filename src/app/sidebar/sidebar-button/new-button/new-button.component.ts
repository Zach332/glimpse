import { Component, Input } from '@angular/core';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { SelectableSidebarButton } from 'src/app/interfaces/selectable-sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { SidebarManagerService } from '../../sidebar-management/sidebar-manager.service';

@Component({
  selector: 'app-new-button',
  templateUrl: './new-button.component.html',
  styleUrls: ['./new-button.component.scss', '../sidebar-button.scss'],
})
export class NewButtonComponent {
  @Input()
  buttonData!: SelectableSidebarButton;

  constructor(
    private pageManagerService: PageManagerService,
    private sidebarManagerService: SidebarManagerService,
  ) {}

  public drop() {
    this.pageManagerService.dragging = false;
  }

  isHidden(): boolean {
    return this.sidebarManagerService.isCollapsed(this.buttonData.glimpseId[0]);
  }

  onClick(): void {
    if (this.buttonData.glimpseId[0] === DataSourceType.Window) {
      this.sidebarManagerService.addWindow();
    } else {
      // this.dataService.addFolder("new folder")
    }
  }
}
