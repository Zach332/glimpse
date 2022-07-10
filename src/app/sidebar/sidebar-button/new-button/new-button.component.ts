import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectablePage } from 'src/app/interfaces/selectable-page';
import { SelectableDataSource } from 'src/app/interfaces/selectable-sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { SidebarManagerService } from '../../sidebar-management/sidebar-manager.service';

@Component({
  selector: 'app-new-button',
  templateUrl: './new-button.component.html',
  styleUrls: ['./new-button.component.scss', '../sidebar-button.scss'],
})
export class NewButtonComponent {
  @Input()
  buttonData!: SelectableDataSource;

  constructor(
    private pageManagerService: PageManagerService,
    private sidebarManagerService: SidebarManagerService,
    private nameDialog: MatDialog,
  ) {}

  drop(dropped: CdkDragDrop<SelectablePage>) {
    if (dropped.isPointerOverContainer) {
      this.pageManagerService.dropInNew(this.buttonData.dataSourceId[0]);
    }
  }

  isHidden(): boolean {
    return this.sidebarManagerService.isCollapsed(this.buttonData.dataSourceId[0]);
  }

  onClick(): void {
    this.sidebarManagerService.addNewDataSouceButtonPress(this.buttonData);
  }
}
