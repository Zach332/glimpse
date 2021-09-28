import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HotkeyManagerService } from 'src/app/hotkey-manager.service';
import { Subscription } from 'rxjs';
import { SimpleDialogData } from './simple-dialog-data';

@Component({
  selector: 'app-simple-dialog',
  templateUrl: 'simple-dialog.component.html',
})
export class RenameDialogComponent implements OnDestroy {
  @Input()
  dialogTitle?: string;

  @Input()
  inputLabel?: string;

  private enterHotkey?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SimpleDialogData,
    private hotkeyManagerService: HotkeyManagerService,
  ) {}

  ngOnDestroy(): void {
    this.enterHotkey?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.enterHotkey = this.hotkeyManagerService
      .addShortcut('enter', false)
      .subscribe(() => this.dialogRef.close(this.data.inputValue));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
