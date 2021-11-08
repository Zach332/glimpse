import { Component, Input } from '@angular/core';
import { DataSourceType } from '../interfaces/data-source-type';
import { SelectablePage } from '../interfaces/selectable-page';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { DataService } from '../data.service';
import { IDBService } from '../idb-service';

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
    // If page is a bookmark, update the time last accessed
    // This is handled differently for tabs
    if (this.tabData.pageId[0] === DataSourceType.Folder) {
      IDBService.putTimeLastAccessed(this.tabData.pageId, Date.now());
    }

    if ($event.ctrlKey || $event.metaKey) {
      this.pageManagerService.displayPageElements.toggleId(this.tabData.id);
    } else if ($event.shiftKey) {
      this.pageManagerService.displayPageElements.selectToId(this.tabData.id);
    } else {
      if (this.tabData.pageId[0] === DataSourceType.Window) {
        DataService.switchToTab(this.tabData.pageId[2]);
      } else {
        window.location.href = this.tabData.url;
      }
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
