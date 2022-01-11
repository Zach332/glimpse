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
  pageViewDrag: null | SelectableCollection<SelectablePage> = null;

  opened = true;

  constructor(public pageManagerService: PageManagerService) {}

  onDragStart($event: CdkDragStart) {
    this.pageManagerService.draggedElement = $event.source.element.nativeElement.id;
    const currentIndex = this.pageManagerService.displayPageElements.collection.findIndex(
      (p) => p.id === parseInt(this.pageManagerService.draggedElement, 10),
    );
    const dragInsert = this.pageManagerService.displayPageElements.collection[currentIndex];
    this.pageViewDrag = this.pageManagerService.displayPageElements.copy();
    this.pageViewDrag.adjustCollection([
      ...this.pageManagerService.displayPageElements.collection.slice(0, currentIndex),
      dragInsert,
      ...this.pageManagerService.displayPageElements.collection.slice(currentIndex),
    ]);
  }

  release() {
    this.pageViewDrag = null;
  }

  pageView() {
    if (this.pageViewDrag) {
      return this.pageViewDrag;
    }
    return this.pageManagerService.displayPageElements;
  }
}
