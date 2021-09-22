import { Component, Input } from '@angular/core';
import { SelectablePage } from '../interfaces/selectable-page';
import { PageManagerService } from '../page-prev-display/page-manager.service';

@Component({
  selector: 'app-page-prev',
  templateUrl: './page-prev.component.html',
  styleUrls: ['./page-prev.component.scss'],
})
export class PagePrevComponent {
  @Input()
  tabData!: SelectablePage;

  @Input()
  collapse!: boolean;

  constructor(public pageManagerService: PageManagerService) {}

  onClick($event: MouseEvent): void {
    if ($event.ctrlKey || $event.metaKey) {
      this.pageManagerService.displayPageElements.toggleId(this.tabData.id);
    } else if ($event.shiftKey) {
      this.pageManagerService.displayPageElements.selectToId(this.tabData.id);
    } else {
      // TODO: Handle null later
      window.location.href = this.tabData.url;
    }
  }

  removePage($event: MouseEvent): void {
    $event.stopPropagation();
    this.pageManagerService.removePage(this.tabData);
  }

  dragging(): boolean {
    if (this.tabData.isSelected && this.pageManagerService.dragging) {
      return true;
    }
    return false;
  }
}
