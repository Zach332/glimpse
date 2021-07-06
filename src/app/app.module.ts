import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ImagePrevComponent } from './image-prev/image-prev.component';
import { MaterialModule } from './material/material.module';
import { PagePrevComponent } from './page-prev/page-prev.component';
import { TitlePrevComponent } from './title-prev/title-prev.component';

@NgModule({
  declarations: [AppComponent, ImagePrevComponent, PagePrevComponent, TitlePrevComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
