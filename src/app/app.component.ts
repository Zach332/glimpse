import { Component } from '@angular/core';
import { PageManagerService } from './page-prev-display/page-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public pageManagerService: PageManagerService) {}

  public collapse = false;

  public onDragStart() {
    this.pageManagerService.dragging = true;
  }

  public drop() {
    this.pageManagerService.dragging = false;
  }
}
