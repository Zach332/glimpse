import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectableSidebarButton } from 'src/app/interfaces/selectable-sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { SidebarManagerService } from '../../sidebar-management/sidebar-manager.service';
import { RenameDialogComponent } from './rename-dialog.component';

@Component({
  selector: 'app-data-source-button',
  templateUrl: './data-source-button.component.html',
  styleUrls: ['./data-source-button.component.scss', '../sidebar-button.scss'],
})
export class DataSourceButtonComponent {
  @Input()
  buttonData!: SelectableSidebarButton;

  constructor(
    private pageManagerService: PageManagerService,
    private sidebarManagerService: SidebarManagerService,
    private renameDialog: MatDialog,
  ) {}

  public drop() {
    this.pageManagerService.dragging = false;
  }

  isHidden(): boolean {
    return this.sidebarManagerService.isCollapsed(this.buttonData.type);
  }

  delete(): void {
    this.sidebarManagerService.delete(this.buttonData.type, this.buttonData.id);
  }

  onClick($event: MouseEvent): void {
    if ($event.shiftKey) {
      this.sidebarManagerService.selectToId(this.buttonData.type, this.buttonData.id);
    } else {
      this.sidebarManagerService.toggleId(this.buttonData.type, this.buttonData.id);
    }
  }

  openRenameDialog(): void {
    const dialogRef = this.renameDialog.open(RenameDialogComponent, {
      data: { newName: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // TODO: rename
      console.log(result);
    });
  }
}
