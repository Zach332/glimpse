import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SimpleDialogComponent } from 'src/app/general/simple-dialog/simple-dialog.component';
import { SelectablePage } from 'src/app/interfaces/selectable-page';
import { SelectableSidebarButton } from 'src/app/interfaces/selectable-sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { SidebarManagerService } from '../../sidebar-management/sidebar-manager.service';

@Component({
  selector: 'app-root-button',
  templateUrl: './root-button.component.html',
  styleUrls: ['./root-button.component.scss', '../sidebar-button.scss'],
})
export class RootButtonComponent {
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
      this.getNameDialog().subscribe((result) => {
        this.pageManagerService.dropInNew(result, this.buttonData.dataSourceId[0]);
      });
    }
  }

  onClick(): void {
    this.sidebarManagerService.toggleRoot(this.buttonData.dataSourceId[0]);
  }

  toggleExpand($event: MouseEvent): void {
    $event.stopPropagation();
    this.sidebarManagerService.toggleExpanded(this.buttonData.dataSourceId[0]);
  }

  isSelected(): boolean {
    return (
      this.sidebarManagerService.areAllSelected(this.buttonData.dataSourceId[0]) &&
      this.sidebarManagerService.hasChildren(this.buttonData.dataSourceId[0])
    );
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
