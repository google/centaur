import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {MatTabsModule} from '@angular/material/tabs';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {WrittenPageModule} from '../../components/page/module';

import {FewshotEditor} from './component';

@NgModule({
  declarations: [
    FewshotEditor,
  ],
  imports: [
    WrittenPageModule,
    BrowserModule,
    MatInputModule,
    BrowserAnimationsModule,
    CommonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
  ],
  exports: [FewshotEditor],
})
export class FewshotEditorModule {
}
