import { Component } from '@angular/core';
import { HotkeyManagerService } from 'src/app/hotkey-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { SidebarManagerService } from './sidebar-management/sidebar-manager.service';
import { DataSourceType } from '../interfaces/data-source-type';
import { InfoDialogComponent } from '../general/info-dialog/info-dialog.component';
import { Database } from '../database';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  constructor(
    public pageManagerService: PageManagerService,
    public sidebarManagerService: SidebarManagerService,
    private hotkeyManagerService: HotkeyManagerService,
    private hotkeyDialog: MatDialog,
  ) {
    this.hotkeyManagerService
      .addShortcut('shift.?', 'hotkey help')
      .subscribe(() => this.showHotkeyHelp());
    this.hotkeyManagerService.addShortcut('a', 'select all').subscribe(() => this.selectAll());
    this.hotkeyManagerService.addShortcut('d', 'deselect all').subscribe(() => this.deselectAll());
    this.hotkeyManagerService
      .addShortcut('=', 'select first', true, true)
      .subscribe(() => this.selectFirst());
    this.hotkeyManagerService
      .addShortcut('-', 'deselect last', true, true)
      .subscribe(() => this.deselectLast());
    this.hotkeyManagerService
      .addShortcut('o', 'open all (copy or move based on setting)')
      .subscribe(() => this.openAll());
    this.hotkeyManagerService
      .addShortcut('w', 'toggle window selection')
      .subscribe(() => this.sidebarManagerService.toggleRoot(DataSourceType.Window));
    this.hotkeyManagerService
      .addShortcut('s', 'toggle saved selection')
      .subscribe(() => this.sidebarManagerService.toggleRoot(DataSourceType.Folder));
    this.hotkeyManagerService
      .addShortcut('y', 'select all sidebar items')
      .subscribe(() => this.sidebarManagerService.selectAll());
    this.hotkeyManagerService
      .addShortcut('n', 'deselect all sidebar items')
      .subscribe(() => this.sidebarManagerService.deselectAll());
    this.hotkeyManagerService
      .addShortcut('u', 'toggle "Update settings"')
      .subscribe(
        () => (this.pageManagerService.updateSettings = !this.pageManagerService.updateSettings),
      );
    for (let i = 1; i <= 9; i += 1) {
      this.hotkeyManagerService
        .addShortcut(`${i}`, 'toggle sidebar item')
        .subscribe(() =>
          this.sidebarManagerService.toggleId(
            this.sidebarManagerService.getNthDataSource(i).dataSourceId[0],
            this.sidebarManagerService.getNthDataSource(i).id,
          ),
        );
    }
    this.hotkeyManagerService
      .addShortcut('shift.x', 'delete session data')
      .subscribe(() => this.refreshData());
  }

  public get DataSourceType() {
    return DataSourceType;
  }

  selectAll(): void {
    this.pageManagerService.displayPageElements.selectAll();
  }

  deselectAll(): void {
    this.pageManagerService.displayPageElements.deselectAll();
  }

  selectFirst(): void {
    this.pageManagerService.displayPageElements.toggleId(
      this.pageManagerService.displayPageElements.getDeselectedItems()[0]?.id,
    );
  }

  deselectLast(): void {
    this.pageManagerService.displayPageElements.toggleId(
      this.pageManagerService.displayPageElements.getSelectedItems().slice(-1)[0]?.id,
    );
  }

  removeAll(): void {
    this.pageManagerService.removeAll();
  }

  openAll(): void {
    this.pageManagerService.openAll();
  }

  showHotkeyHelp(): void {
    const dialogRef = this.hotkeyDialog.open(InfoDialogComponent);
    dialogRef.componentInstance.dialogTitle = 'Hotkeys';
    dialogRef.componentInstance.dialogContent = this.generateHotkeyHelp(
      this.hotkeyManagerService.hotkeyRegistry,
    );
  }

  openHelp() {
    window.open('https://github.com/Zach332/glimpse/blob/main/README.md', '_self');
  }

  private generateHotkeyHelp(hotkeys: Map<string, string>): string {
    let hotkeyHelp = '';
    hotkeys.forEach((key, value) => (hotkeyHelp += `${value.replace(/\./g, ' + ')} :  ${key}\n`));
    return hotkeyHelp;
  }

  private refreshData() {
    const db = new Database();
    db.deleteSessionData();
  }
}
