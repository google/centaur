import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {WrittenPage} from './component';

@NgModule({
  declarations: [
    WrittenPage,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [WrittenPage],
})
export class WrittenPageModule {
}
