import { Component, Input } from '@angular/core';
import { PageData } from '../page-data';

@Component({
  selector: 'app-page-prev',
  templateUrl: './page-prev.component.html',
  styleUrls: ['./page-prev.component.scss'],
})
export class PagePrevComponent {
  @Input()
  tabData!: PageData;
}
