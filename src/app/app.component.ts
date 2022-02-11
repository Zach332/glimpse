import { CdkDragStart } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { HotkeyManagerService } from './hotkey-manager.service';
import { SelectableCollection } from './interfaces/selectable-collection';
import { SelectablePage } from './interfaces/selectable-page';
import { PageManagerService } from './page-prev-display/page-manager.service';
import { SidebarManagerService } from './sidebar/sidebar-management/sidebar-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  spacerHeight: number = 0;

  pageViewDrag: null | SelectableCollection<SelectablePage> = null;

  rippleAnimConfig = { enterDuration: 2000, exitDuration: 500 };

  rippleColor = '#B3808080';

  constructor(
    private hotkeyManagerService: HotkeyManagerService,
    public pageManagerService: PageManagerService,
    public sidebarManagerService: SidebarManagerService,
  ) {}

  ngOnInit() {
    this.spacerHeight = window.innerHeight;
  }

  ngAfterViewInit(): void {
    this.hotkeyManagerService
      .addShortcut('e', 'toggle sidebar expansion')
      .subscribe(
        () => (this.pageManagerService.sidebarExpanded = !this.pageManagerService.sidebarExpanded),
      );
  }

  onDragStart($event: CdkDragStart) {
    this.pageManagerService.draggedElement = $event.source.element.nativeElement.id;
    const currentIndex = this.pageManagerService.displayPageElements.collection.findIndex(
      (p) => p.id === this.pageManagerService.draggedElement,
    );
    const dragInsert = this.pageManagerService.displayPageElements.collection[currentIndex];
    this.pageViewDrag = this.pageManagerService.displayPageElements.copy();
    this.pageViewDrag.adjustCollection([
      ...this.pageManagerService.displayPageElements.collection.slice(0, currentIndex),
      dragInsert,
      ...this.pageManagerService.displayPageElements.collection.slice(currentIndex),
    ]);
  }

  release() {
    this.pageViewDrag = null;
  }

  pageView() {
    if (this.pageViewDrag) {
      return this.pageViewDrag;
    }
    return this.pageManagerService.displayPageElements;
  }

  @HostListener('window:resize')
  onResize() {
    this.spacerHeight = window.innerHeight;
  }

  setRandomRippleColor() {
    this.rippleColor = `#B3${(0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 7)}`;
  }
}
