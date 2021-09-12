import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  exports: [
    MatCardModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSidenavModule,
    DragDropModule,
    MatDividerModule,
    MatMenuModule,
    MatInputModule,
    MatDialogModule,
  ],
})
export class MaterialModule {}
