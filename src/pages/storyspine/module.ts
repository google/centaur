import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

import {CentaurButtonModule} from '../../components/button/module';
import {FewshotEditorModule} from '../../components/fewshot_editor/module';
import {InstructionsDialogModule} from '../../components/instructions/module';
import {WrittenPageModule} from '../../components/page/module';
import {SuggestionPanelModule} from '../../components/suggestion/module';

import {StorySpinePage} from './component';

@NgModule({
  declarations: [
    StorySpinePage,
  ],
  imports: [
    CommonModule,
    SuggestionPanelModule,
    WrittenPageModule,
    CentaurButtonModule,
    InstructionsDialogModule,
    FewshotEditorModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
  exports: [StorySpinePage],
})
export class StorySpinePageModule {
}
