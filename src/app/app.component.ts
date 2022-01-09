import { CdkDragStart } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { SelectableCollection } from './interfaces/selectable-collection';
import { SelectablePage } from './interfaces/selectable-page';
import { PageManagerService } from './page-prev-display/page-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  dragInsert: null | { index: number; page: SelectablePage } = null;

  constructor(public pageManagerService: PageManagerService) {}

  onDragStart($event: CdkDragStart) {
    this.pageManagerService.draggedElement = $event.source.element.nativeElement.id;
    const currentIndex = this.pageManagerService.displayPageElements.collection.findIndex(
      (p) => p.id === parseInt(this.pageManagerService.draggedElement, 10),
    );
    this.dragInsert = {
      index: currentIndex,
      page: this.pageManagerService.displayPageElements.collection[currentIndex],
    };
  }

  release() {
    this.dragInsert = null;
  }

  pageView() {
    if (this.dragInsert) {
      return new SelectableCollection([
        ...this.pageManagerService.displayPageElements.collection.slice(0, this.dragInsert.index),
        this.dragInsert.page,
        ...this.pageManagerService.displayPageElements.collection.slice(this.dragInsert.index),
      ]);
    }
    return this.pageManagerService.displayPageElements;
  }
}
