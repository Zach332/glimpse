import { Component, Input } from '@angular/core';
import { PageData } from '../interfaces/page-data';
import { PageManagerService } from '../page-prev-display/page-manager.service';

@Component({
  selector: 'app-page-prev',
  templateUrl: './page-prev.component.html',
  styleUrls: ['./page-prev.component.scss'],
})
export class PagePrevComponent {
  @Input()
  tabData!: PageData;

  @Input()
  collapse!: boolean;

  constructor(private pageManagerService: PageManagerService) {}

  onClick($event: MouseEvent): void {
    if ($event.metaKey) {
      this.pageManagerService.tabElements.toggleId(this.tabData.id);
    } else {
      window.location.href = this.tabData.imageUrl;
    }
  }

  removePage($event: MouseEvent): void {
    $event.stopPropagation();
  }
}
