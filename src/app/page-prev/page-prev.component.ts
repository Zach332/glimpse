import * as browser from 'webextension-polyfill';
import { Component, Input } from '@angular/core';
import { DataSourceType } from '../interfaces/data-source-type';
import { SelectablePage } from '../interfaces/selectable-page';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { DataService } from '../data.service';
import { db } from '../database';

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

  constructor(public pageManagerService: PageManagerService, private dataService: DataService) {}

  onClick($event: MouseEvent): void {
    // If page is a bookmark, update the time last accessed
    // This is handled differently for tabs
    if (this.tabData.pageId[0] === DataSourceType.Folder) {
      db.accessTimes.put({
        pageId: this.tabData.pageId,
        accessTime: Date.now(),
      });
    }

    if ($event.ctrlKey || $event.metaKey) {
      this.pageManagerService.displayPageElements.toggleId(this.tabData.id);
    } else if ($event.shiftKey) {
      this.pageManagerService.displayPageElements.selectToId(this.tabData.id);
    } else {
      if (this.tabData.pageId[0] === DataSourceType.Window) {
        this.dataService.switchToTab(this.tabData.pageId[2]);
      } else {
        window.location.href = this.tabData.url;
      }
    }
  }

  removePage(): void {
    this.pageManagerService.removePage(this.tabData);
  }

  isFolder() {
    return this.tabData.pageId[0] === DataSourceType.Folder;
  }

  showTitlePrev() {
    if (this.collapse) {
      return true;
    }
    const extensionId = browser.i18n.getMessage('@@extension_id');
    return (
      this.tabData.url!.startsWith('chrome://newtab') ||
      this.tabData.url!.startsWith(`moz-extension://${extensionId}`)
    );
  }
}
