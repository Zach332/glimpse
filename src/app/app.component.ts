import { Component } from '@angular/core';
import { PageManagerService } from './page-prev-display/page-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public pageManagerService: PageManagerService) {}

  public value = 300;

  public max = 500;

  public min = 200;

  public step = 1;

  public collapse = false;
}
