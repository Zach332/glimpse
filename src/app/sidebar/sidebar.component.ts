import { Component } from '@angular/core';
import { HotkeyManagerService } from 'src/app/hotkey-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { PageManagerService } from '../page-prev-display/page-manager.service';
import { SidebarManagerService } from './sidebar-management/sidebar-manager.service';
import { DataSourceType } from '../interfaces/data-source-type';
import { InfoDialogComponent } from '../general/info-dialog/info-dialog.component';

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

  removeAll(): void {
    this.pageManagerService.removeAll();
  }

  openAll(): void {
    // TODO this.pageManagerService.displayPageElements.openAll();
  }

  showHotkeyHelp(): void {
    const dialogRef = this.hotkeyDialog.open(InfoDialogComponent);
    dialogRef.componentInstance.dialogTitle = 'Hotkeys';
    dialogRef.componentInstance.dialogContent = this.generateHotkeyHelp(
      this.hotkeyManagerService.hotkeyRegistry,
    );
  }

  private generateHotkeyHelp(hotkeys: Map<string, string>): string {
    let hotkeyHelp = '';
    hotkeys.forEach((key, value) => (hotkeyHelp += `${value}: ${key}\n`));
    return hotkeyHelp;
  }
}
