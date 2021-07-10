import { Component, Input } from '@angular/core';
import { SelectablePageData } from '../interfaces/selectable-page-data';
import { PageManagerService } from '../page-prev-display/page-manager.service';

@Component({
  selector: 'app-page-prev',
  templateUrl: './page-prev.component.html',
  styleUrls: ['./page-prev.component.scss'],
})
export class PagePrevComponent {
  @Input()
  tabData!: SelectablePageData;

  @Input()
  collapse!: boolean;

  constructor(private pageManagerService: PageManagerService) {}

  onClick($event: MouseEvent): void {
    if ($event.metaKey) {
      this.pageManagerService.tabElements.toggleId(this.tabData.id);
    } else if ($event.shiftKey) {
      this.pageManagerService.tabElements.selectToId(this.tabData.id);
    } else {
      window.location.href = this.tabData.imageUrl;
    }
  }

  removePage($event: MouseEvent): void {
    $event.stopPropagation();
  }
}
