import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {CentaurButton} from './component';

@NgModule({
  declarations: [
    CentaurButton,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [CentaurButton],
})
export class CentaurButtonModule {
}
