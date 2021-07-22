import { CdkDragStart } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { PageManagerService } from './page-prev-display/page-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public pageManagerService: PageManagerService) {}

  public onDragStart($event: CdkDragStart) {
    this.pageManagerService.dragging = true;
    this.pageManagerService.draggedElement = $event.source.element.nativeElement.id;
  }

  public drop() {
    this.pageManagerService.dragging = false;
  }
}
