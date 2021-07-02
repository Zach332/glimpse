import { Component, Input } from '@angular/core';
import { PageData } from '../page-data';

@Component({
  selector: 'app-image-prev',
  templateUrl: './image-prev.component.html',
  styleUrls: ['./image-prev.component.scss'],
})
export class ImagePrevComponent {
  @Input()
  tabData!: PageData;
}
