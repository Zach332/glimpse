import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HotkeyManagerService } from 'src/app/hotkey-manager.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-dialog',
  templateUrl: 'info-dialog.component.html',
})
export class InfoDialogComponent implements OnDestroy {
  @Input()
  dialogTitle?: string;

  @Input()
  dialogContent?: string;

  private enterHotkey?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    private hotkeyManagerService: HotkeyManagerService,
  ) {}

  ngOnDestroy(): void {
    this.enterHotkey?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.enterHotkey = this.hotkeyManagerService
      .addShortcut('enter', 'submit', false)
      .subscribe(() => this.dialogRef.close());
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
