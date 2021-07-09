import { Component, OnInit } from '@angular/core';
import { SelectableCollection } from './interfaces/selectable-collection';
import { SelectablePageData } from './interfaces/selectable-page-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public tabElements: SelectableCollection<SelectablePageData> =
    new SelectableCollection<SelectablePageData>();

  public value = 300;

  public max = 500;

  public min = 200;

  public step = 1;

  public collapse = false;

  ngOnInit() {
    for (let i = 0; i < 20; i += 1) {
      this.tabElements.push(<SelectablePageData>{
        title: 'A website',
        url: 'material.angular.io',
        imageUrl: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
      });
    }
  }
}
