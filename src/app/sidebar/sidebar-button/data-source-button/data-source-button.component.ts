import { Component, Input, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectableSidebarButton } from 'src/app/interfaces/selectable-sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { DataService } from 'src/app/data.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SelectablePage } from 'src/app/interfaces/selectable-page';
import { SidebarManagerService } from '../../sidebar-management/sidebar-manager.service';
import { SimpleDialogComponent } from '../../../general/simple-dialog/simple-dialog.component';

@Component({
  selector: 'app-data-source-button',
  templateUrl: './data-source-button.component.html',
  styleUrls: ['./data-source-button.component.scss', '../sidebar-button.scss'],
})
export class DataSourceButtonComponent {
  @Input()
  buttonData!: SelectableSidebarButton;

  isActive: boolean = false;

  constructor(
    private pageManagerService: PageManagerService,
    private sidebarManagerService: SidebarManagerService,
    private renameDialog: MatDialog,
    private dataService: DataService,
    private ngZone: NgZone,
  ) {
    this.getIsActive().then((res) => (this.isActive = res));
    sidebarManagerService.activeObservable.subscribe(() => this.updateIsActive());
  }

  drop(dropped: CdkDragDrop<SelectablePage>) {
    this.pageManagerService.dragging = false;
    if (dropped.isPointerOverContainer) {
      this.pageManagerService.dropPages(this.buttonData);
    }
  }

  isHidden(): boolean {
    return this.sidebarManagerService.isCollapsed(this.buttonData.dataSourceId[0]);
  }

  private async updateIsActive() {
    this.ngZone.run(() => {
      this.getIsActive().then((res) => (this.isActive = res));
    });
  }

  private async getIsActive() {
    return this.dataService
      .getActiveDataSource()
      .then((result) => result?.dataSourceId[1] === this.buttonData.dataSourceId[1]);
  }

  delete(): void {
    this.sidebarManagerService.delete(this.buttonData);
  }

  onClick($event: MouseEvent): void {
    if ($event.shiftKey) {
      this.sidebarManagerService.selectToId(this.buttonData.dataSourceId[0], this.buttonData.id);
    } else {
      this.sidebarManagerService.toggleId(this.buttonData.dataSourceId[0], this.buttonData.id);
    }
  }

  openRenameDialog(): void {
    const dialogRef = this.renameDialog.open(SimpleDialogComponent, {
      data: { inputValue: '' },
    });
    dialogRef.componentInstance.dialogTitle = 'Rename';
    dialogRef.componentInstance.inputLabel = 'Name';
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sidebarManagerService.rename(this.buttonData, result);
      }
    });
  }
}
