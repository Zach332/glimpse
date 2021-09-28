import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ImagePrevComponent } from './image-prev/image-prev.component';
import { MaterialModule } from './material/material.module';
import { PagePrevComponent } from './page-prev/page-prev.component';
import { TitlePrevComponent } from './title-prev/title-prev.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DragPrevComponent } from './drag-prev/drag-prev.component';
import { NewButtonComponent } from './sidebar/sidebar-button/new-button/new-button.component';
import { RootButtonComponent } from './sidebar/sidebar-button/root-button/root-button.component';
import { DataSourceButtonComponent } from './sidebar/sidebar-button/data-source-button/data-source-button.component';
import { SearchComponent } from './search/search.component';
import { SimpleDialogComponent } from './general/simple-dialog/simple-dialog.component';
import { SiteTrimPipe } from './pipes/site-trim.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ImagePrevComponent,
    PagePrevComponent,
    TitlePrevComponent,
    SidebarComponent,
    DragPrevComponent,
    NewButtonComponent,
    RootButtonComponent,
    DataSourceButtonComponent,
    SearchComponent,
    SimpleDialogComponent,
    SiteTrimPipe,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
