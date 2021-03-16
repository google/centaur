import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {Suggestion, SuggestionPanel} from './component';

@NgModule({
  declarations: [
    SuggestionPanel,
    Suggestion,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [SuggestionPanel],
})
export class SuggestionPanelModule {
}
