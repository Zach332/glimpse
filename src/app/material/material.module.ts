import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  exports: [MatCardModule, MatButtonModule, MatSliderModule],
})
export class MaterialModule {}
