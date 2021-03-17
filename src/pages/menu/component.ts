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

import {AfterViewInit, Component, Inject, NgZone, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {Formula, FormulaData, Passage} from '../../common/interfaces';
import {TextGenerationService} from '../../services/interfaces';
import {SEMIRARE} from '../../common/wordlists';
import {CentaurButton} from '../../components/button/component';
import {InstructionsDialog} from '../../components/instructions/component';
import {WrittenPage} from '../../components/page/component';
import {SuggestionPanel} from '../../components/suggestion/component';
import {TextGenerationResult} from '../../services/interfaces';
import {PassageService} from '../../services/passage_service';
import {ThemeService} from '../../services/theme_service';

// tslint:disable:no-any this is my reasoning

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class MenuPage implements AfterViewInit {
  @ViewChild('panel') panel!: SuggestionPanel;
  @ViewChild('help') help!: InstructionsDialog;
  @ViewChild('page') page!: WrittenPage;
  @ViewChild('butt') button!: CentaurButton;

  constructor(
      private readonly passageService: PassageService,
      readonly themeService: ThemeService,
      private readonly generationService: TextGenerationService,
      private readonly snackBar: MatSnackBar,
      private zone: NgZone,

  ) {
    this.themeService.cycleTheme();
  }

  async ngOnInit() {
    console.log('ModelMenu starting...');
  }

  async ngAfterViewInit() {
    console.log('Initializing Passages');
    this.passageService.setPassage(
        new Passage('main', 'Text like this can be edited by you.'));
    setTimeout(() => {
      this.panel!.setSuggestions(['Text like this can be clicked.']);
    }, 1000);
  }

  handleSuggestion(s: string) {
    this.panel!.setSuggestions([s]);
  }

  generate() {
    const t = this.passageService.getOrEmpty('main')['text'];
      this.generationService.generateText(t, -1).then(
        (result: TextGenerationResult) => {
          if (!result['error']) {
            this.passageService.appendToPassage(result['text'][0], 'main');
          }
          this.button!.doneWaiting();
        });
  }

  showHelp() {
    this.help.show();
  }
}
