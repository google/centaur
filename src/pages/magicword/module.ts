/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

import {MagicWordPage} from './component';

@NgModule({
  declarations: [
    MagicWordPage,
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
  exports: [MagicWordPage],
})
export class MagicWordPageModule {
}
