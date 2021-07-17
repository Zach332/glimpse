import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-button',
  templateUrl: './sidebar-button.component.html',
  styleUrls: ['./sidebar-button.component.scss'],
})
export class SidebarButtonComponent {
  @Input()
  label!: string;

  @Input()
  category!: string;

  public drop(event: any) {
    console.log(event);
  }
}
