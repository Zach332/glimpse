import { Component } from '@angular/core';
import { SidebarButton } from '../interfaces/sidebar-button';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  sidebarButtons: SidebarButton[] = [
    { id: 'window', label: 'Window' },
    { id: 'history', label: 'History' },
    { id: 'test', label: 'test', parent: 'history' },
  ];
}
