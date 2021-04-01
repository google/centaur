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

import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Formula, Passage} from '../../common/interfaces';
import {SEMIRARE} from '../../common/wordlists';
import {CentaurButton} from '../../components/button/component';
import {InstructionsDialog} from '../../components/instructions/component';
import {WrittenPage} from '../../components/page/component';
import {SuggestionPanel} from '../../components/suggestion/component';
import {PassageService} from '../../services/passage_service';
import {ThemeService} from '../../services/theme_service';

// tslint:disable:no-any this is my reasoning

const INIT_MAGICWORD = 'chance';

const PAGE_PASSAGE_NAME = 'main';

const EDITOR_PASSAGE_NAME = 'editor';

const INIT_TEXT =
    'Our story begins, as probably approximately three quarters of all good stories do, on a Tuesday.';

const MAX_SUGGESTIONS = 3;

const MAGIC_WORD_FORMULA =
    `{"data":[{"inputs":["I opened the door and looked inside.","ball"],"outputs":["I saw a ball on the floor."]},{"inputs":["The waves rolled by slowly outside his window.","sun"],"outputs":["Rays of sun light flickered on the carpet of his cabin."]},{"inputs":["All of a sudden, he felt very hungry!","ham"],"outputs":["He went into the diner and ordered a ham and cheese sandwich."]},{"inputs":["She made a picture frame for a picture.","picture"],"outputs":["She put the picture into the frame."]},{"inputs":["Before he went to bed, he decided to try one more time.","tent"],"outputs":["He pitched his tent near a water hole."]},{"inputs":["The mood in the city was foreboding.","cloud"],"outputs":["An evil cloud drifted over the city."]},{"inputs":["The engines of the plane began to fail","parachute"],"outputs":["He jumped out of the plane with a parachute."]},{"inputs":["He looked up her address and drove to her house.","state"],"outputs":["It was a long drive to her house, in another state."]},{"inputs":[" I saw a woman in the grocery store today.","noticed"],"outputs":["I noticed she was wearing a floral dress."]},{"inputs":["An angry mob surrounded them. He pulled out a gun.","riot"],"outputs":["He fired his gun into the air. The riot was quickly dispersed."]},{"inputs":["It took forever for him to saw through that thick metal.","saw"],"outputs":["His saw blade nearly broke."]},{"inputs":["In the mountains of Peru, they ran out of water.","sacrifice"],"outputs":["They sacrificed their chickens to the Inca god so they would have rain."]},{"inputs":["I watched the waves on the shore.","ocean"],"outputs":["I smelled the fresh scent of the ocean."]}],"serialization":{"inputMarkers":["The story so far: ","\\n(The next line contains the word "],"splitMarker":")\\n","outputMarkers":[""],"endMarker":"\\n\\nNext!\\n\\n"}}`;

export interface EmptyDialogData {}

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class MagicWordPage implements AfterViewInit, OnInit {
  @ViewChild('panel') panel!: SuggestionPanel;
  @ViewChild('help') help!: InstructionsDialog;
  @ViewChild('page') page!: WrittenPage;
  @ViewChild('butt') button!: CentaurButton;

  magicword = INIT_MAGICWORD;
  editorChannel = EDITOR_PASSAGE_NAME;
  pageChannel = PAGE_PASSAGE_NAME;

  constructor(
      private readonly passageService: PassageService,
      readonly themeService: ThemeService,
      public dialog: MatDialog,
  ) {
    this.themeService.cycleTheme();
    this.themeService.cycleTheme();
  }

  async ngOnInit() {
    console.log('ModelZero starting...');
  }

  async ngAfterViewInit() {
    console.log('Initializing Passages');
    this.passageService.setPassage(new Passage(PAGE_PASSAGE_NAME, INIT_TEXT));
    const editorPassage =
        new Formula(EDITOR_PASSAGE_NAME, '').readSerializedForSave(MAGIC_WORD_FORMULA);
    this.passageService.setFormula(editorPassage);
  }

  handleSuggestion(s: string) {
    this.passageService.appendToPassage(s, PAGE_PASSAGE_NAME);
    this.page!.enable();
    this.magicword = SEMIRARE[Math.floor(Math.random() * SEMIRARE.length)];
    this.button!.doneWaiting();
  }

  reenableGen() {
    this.button!.doneWaiting();
  }

  generate() {
    this.page!.disable();
    const pageText = this.passageService.getOrEmpty(PAGE_PASSAGE_NAME)['text'];
    this.panel.fillWithSuggestions(
        [pageText, this.magicword], EDITOR_PASSAGE_NAME, MAX_SUGGESTIONS,
        (s: string) => {
          return s.indexOf(this.magicword) >= 0;
        });
  }

  showHelp() {
    this.help.show();
  }
}
