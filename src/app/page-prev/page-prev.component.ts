import { Component, Input } from '@angular/core';
import { PageData } from '../interfaces/page-data';

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

  onClick($event: MouseEvent): void {
    if ($event.metaKey) {
      this.tabData.isSelected = true;
    } else {
      window.location.href = this.tabData.imageUrl;
    }
  }

  removePage($event: MouseEvent): void {
    $event.stopPropagation();
  }
}
