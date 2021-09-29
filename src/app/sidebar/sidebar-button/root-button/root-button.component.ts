import { Component, Input } from '@angular/core';
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
  ) {}

  drop() {
    this.pageManagerService.dragging = false;
  }

  onClick(): void {
    this.sidebarManagerService.toggleRoot(this.buttonData.dataSourceId[0]);
  }

  toggleExpand($event: MouseEvent): void {
    $event.stopPropagation();
    this.buttonData.expanded = !this.buttonData.expanded;
  }

  isSelected(): boolean {
    return (
      this.sidebarManagerService.areAllSelected(this.buttonData.dataSourceId[0]) &&
      this.sidebarManagerService.hasChildren(this.buttonData.dataSourceId[0])
    );
  }
}
