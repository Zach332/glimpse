import { Component, Input } from '@angular/core';
import { SelectableSidebarButton } from 'src/app/interfaces/selectable-sidebar-button';
import { SidebarButton } from 'src/app/interfaces/sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { SidebarManagerService } from '../sidebar-manager.service';

@Component({
  selector: 'app-sidebar-button',
  templateUrl: './sidebar-button.component.html',
  styleUrls: ['./sidebar-button.component.scss'],
})
export class SidebarButtonComponent {
  @Input()
  buttonData!: SelectableSidebarButton;

  @Input()
  elementIsCollapsed!: (data: SidebarButton) => boolean;

  constructor(
    private pageManagerService: PageManagerService,
    private sidebarManagerService: SidebarManagerService,
  ) {}

  public drop() {
    this.pageManagerService.dragging = false;
  }

  toggleExpand($event: MouseEvent): void {
    $event.stopPropagation();
    this.buttonData.expanded = !this.buttonData.expanded;
  }

  isHidden(): boolean {
    return this.elementIsCollapsed(this.buttonData);
  }

  onClick($event: MouseEvent): void {
    if ($event.shiftKey) {
      this.sidebarManagerService.sidebarButtons.selectToId(this.buttonData.id);
    } else {
      this.sidebarManagerService.sidebarButtons.toggleId(this.buttonData.id);
    }
  }
}
