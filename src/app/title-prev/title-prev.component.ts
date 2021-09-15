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

  @Output() removePage = new EventEmitter<MouseEvent>();

  close($event: MouseEvent): void {
    this.removePage.next($event);
  }
}
