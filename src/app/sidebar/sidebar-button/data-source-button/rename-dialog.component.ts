import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HotkeyManagerService } from 'src/app/hotkey-manager.service';
import { Subscription } from 'rxjs';
import { RenameDialogData } from './rename-dialog-data';

@Component({
  selector: 'app-dialog-overview-example-dialog',
  templateUrl: 'rename-dialog.component.html',
})
export class RenameDialogComponent implements OnDestroy {
  private enterHotkey?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RenameDialogData,
    private hotkeyManagerService: HotkeyManagerService,
  ) {}

  ngOnDestroy(): void {
    this.enterHotkey?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.enterHotkey = this.hotkeyManagerService
      .addShortcut('enter', false)
      .subscribe(() => this.dialogRef.close(this.data.newName));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
