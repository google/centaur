import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {InstructionsDialog} from './component';

@NgModule({
  declarations: [
    InstructionsDialog,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [InstructionsDialog],
})
export class InstructionsDialogModule {
}
