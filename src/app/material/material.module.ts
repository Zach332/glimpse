import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  exports: [MatCardModule, MatButtonModule, MatSliderModule, MatIconModule],
})
export class MaterialModule {}
