import { Component, Input } from '@angular/core';
import { SidebarButton } from 'src/app/interfaces/sidebar-button';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';

@Component({
  selector: 'app-sidebar-button',
  templateUrl: './sidebar-button.component.html',
  styleUrls: ['./sidebar-button.component.scss'],
})
export class SidebarButtonComponent {
  @Input()
  buttonData!: SidebarButton;

  @Input()
  elementIsCollapsed!: (data: SidebarButton) => boolean;

  constructor(private pageManagerService: PageManagerService) {}

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
}
