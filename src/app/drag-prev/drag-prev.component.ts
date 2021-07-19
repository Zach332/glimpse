import { Component } from '@angular/core';
import { PageManagerService } from '../page-prev-display/page-manager.service';

@Component({
  selector: 'app-drag-prev',
  templateUrl: './drag-prev.component.html',
  styleUrls: ['./drag-prev.component.scss'],
})
export class DragPrevComponent {
  constructor(private pageManagerService: PageManagerService) {}

  getPreviewText(): string {
    const numSelected = this.pageManagerService.tabElements.getNumSelected();
    return `Move ${numSelected.toString()} page${numSelected > 2 ? 's' : ''}`;
  }
}
