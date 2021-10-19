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
    const numSelected = this.pageManagerService.getDraggedPages().length;
    return `${this.capitalizeFirst(
      this.pageManagerService.dragMode,
    )} ${numSelected.toString()} page${numSelected > 1 ? 's' : ''}`;
  }

  private capitalizeFirst(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}
