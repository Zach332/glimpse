import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SimpleDialogComponent } from 'src/app/general/simple-dialog/simple-dialog.component';
import { DataSourceType } from 'src/app/interfaces/data-source-type';
import { SelectablePage } from 'src/app/interfaces/selectable-page';
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
    private nameDialog: MatDialog,
  ) {}

  drop(dropped: CdkDragDrop<SelectablePage>) {
    this.pageManagerService.dragging = false;
    if (dropped.isPointerOverContainer) {
      this.pageManagerService.dropInNew(this.buttonData.dataSourceId[0]);
    }
  }

  isHidden(): boolean {
    return this.sidebarManagerService.isCollapsed(this.buttonData.dataSourceId[0]);
  }

  onClick(): void {
    this.getNameDialog().subscribe((result) => {
      if (result) {
        if (this.buttonData.dataSourceId[0] === DataSourceType.Window) {
          this.sidebarManagerService.addWindow(result);
        } else {
          this.sidebarManagerService.addFolder(result);
        }
      }
    });
  }

  getNameDialog(): Observable<string> {
    const dialogRef = this.nameDialog.open(SimpleDialogComponent, {
      data: { inputValue: '' },
    });
    dialogRef.componentInstance.dialogTitle = 'Name';
    dialogRef.componentInstance.inputLabel = 'Name';
    return dialogRef.afterClosed();
  }
}
