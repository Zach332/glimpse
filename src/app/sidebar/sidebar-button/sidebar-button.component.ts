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

  constructor(private pageManagerService: PageManagerService) {}

  public drop() {
    this.pageManagerService.dragging = false;
  }
}
