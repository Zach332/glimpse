import { Component, Input } from '@angular/core';
import { PageData } from '../page-data';

@Component({
  selector: 'app-title-prev',
  templateUrl: './title-prev.component.html',
  styleUrls: ['./title-prev.component.scss'],
})
export class TitlePrevComponent {
  @Input()
  tabData!: PageData;
}