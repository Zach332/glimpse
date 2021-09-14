import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Page } from '../interfaces/page';

@Component({
  selector: 'app-image-prev',
  templateUrl: './image-prev.component.html',
  styleUrls: ['./image-prev.component.scss'],
})
export class ImagePrevComponent {
  @Input()
  tabData!: Page;

  @Output() removePage = new EventEmitter<MouseEvent>();

  close($event: MouseEvent): void {
    this.removePage.next($event);
  }
}
