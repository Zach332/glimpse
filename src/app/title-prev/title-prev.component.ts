import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Page } from '../interfaces/page';

@Component({
  selector: 'app-title-prev',
  templateUrl: './title-prev.component.html',
  styleUrls: ['./title-prev.component.scss'],
})
export class TitlePrevComponent {
  @Input()
  tabData!: Page;

  @Output() removePage = new EventEmitter();

  close($event: MouseEvent): void {
    $event.stopPropagation();
    if (!this.tabData.loading) {
      this.tabData.loading = true;
      this.removePage.next();
    }
  }
}
