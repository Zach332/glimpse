import { Component, Input } from '@angular/core';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';

@Component({
  selector: 'app-sidebar-button',
  templateUrl: './sidebar-button.component.html',
  styleUrls: ['./sidebar-button.component.scss'],
})
export class SidebarButtonComponent {
  @Input()
  label!: string;

  @Input()
  category!: string;

  constructor(private pageManagerService: PageManagerService) {}

  public drop() {
    this.pageManagerService.dragging = false;
  }
}
