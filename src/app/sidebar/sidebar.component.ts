import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  sidebarButtons = [
    { category: 'window', label: 'Window' },
    { category: 'history', label: 'History' },
  ];
}
