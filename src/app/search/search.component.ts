import { Component, ElementRef, ViewChild } from '@angular/core';
import { PageManagerService } from 'src/app/page-prev-display/page-manager.service';
import { HotkeyManagerService } from '../hotkey-manager.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private hotkeyManagerService: HotkeyManagerService,
    public pageManagerService: PageManagerService,
  ) {}

  ngAfterViewInit(): void {
    this.hotkeyManagerService
      .addShortcut('f')
      .subscribe(() => this.searchInput.nativeElement.focus());
  }
}
