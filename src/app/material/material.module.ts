import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  exports: [
    MatCardModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSidenavModule,
    DragDropModule,
  ],
})
export class MaterialModule {}
