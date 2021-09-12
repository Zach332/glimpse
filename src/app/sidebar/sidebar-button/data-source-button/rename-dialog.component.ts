import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RenameDialogData } from './rename-dialog-data';

@Component({
  selector: 'app-dialog-overview-example-dialog',
  templateUrl: 'rename-dialog.component.html',
})
export class RenameDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RenameDialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
