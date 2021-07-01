import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public arr = Array;

  public num = 20;

  public value = 300;

  public max = 500;

  public min = 200;

  public step = 1;
}
