import { Component, ElementRef, ViewChild } from '@angular/core';
import { HotkeyManagerService } from '../hotkey-manager.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;

  value = '';

  constructor(private hotkeyManagerService: HotkeyManagerService) {}

  ngAfterViewInit(): void {
    this.hotkeyManagerService
      .addShortcut('f')
      .subscribe(() => this.searchInput.nativeElement.focus());
  }
}
