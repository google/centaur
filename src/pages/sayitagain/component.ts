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

import {AfterViewInit, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSelectChange} from '@angular/material/select';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {Formula, Passage} from '../../common/interfaces';
import {SEMIRARE} from '../../common/wordlists'; 
import {CentaurButton} from '../../components/button/component';
import {InstructionsDialog} from '../../components/instructions/component';
import {WrittenPage} from '../../components/page/component';
import {SuggestionPanel} from '../../components/suggestion/component';
import {TextGenerationService, TextGenerationResult} from '../../services/interfaces';
import {PassageService} from '../../services/passage_service';
import {ThemeService} from '../../services/theme_service';

interface TestPair {
  input: string, output: string
}

const MAX_RETRIES = 5;

const PAGE_PASSAGE_NAME = 'main';

const EDITOR_PASSAGE_NAME = 'editor';

const ROMEO_FORMULA =
    `{"data":[{"inputs":["How are you doing this morning?"],"outputs":["How fareth thee upon this fine morning?"]},{"inputs":["I dropped my fork!"],"outputs":["Forsooth, I hath dropped my fork upon the ground, sir!"]},{"inputs":["I have no idea what you're talking about"],"outputs":["I hath not the faintest inkling of your thesis, good sir."]},{"inputs":["What did you do this weekend?"],"outputs":["What hath thou done this weekende?"]},{"inputs":["I don't buy it"],"outputs":["I say, I hath doubts of your sincerity, sir."]}],"serialization":{"inputMarkers":[""],"splitMarker":"\\nRepeat that like Shakespeare!\\n","outputMarkers":[""],"endMarker":"\\nShall we try that again?\\n"}}`;

const CUSTOM_FORMULA =
    `{"data":[{"inputs":["Welcome to my shop.","a Shakespearian fop"],"outputs":["I bid thee welcome to my fair establishment, sir!"]},{"inputs":["I'm hungry!","Cookie Monster"],"outputs":["Me hungry for cookies!"]},{"inputs":["It wasn't me.","a sniveling henchman"],"outputs":["I beg you master, please believe me, It wasn't my fault!"]},{"inputs":["The world is doomed!","a Bond villain"],"outputs":["World is doomed, Mr Bond! Mwa ha ha ha!"]},{"inputs":["I've had enough!","your mother"],"outputs":["You had better do as you are told and behave yourself in my house, young man!"]},{"inputs":["You've got to be kidding me.","a little girl finding a hidden passage in her house"],"outputs":["You're kidding! There's a tunnel!?"]},{"inputs":["You want to try some of this?","a stereotypical stoner"],"outputs":["Dude, you want a hit of this?"]},{"inputs":["Who wants the next round?","an alcoholic"],"outputs":["Drinks are on you, suckers!"]},{"inputs":["I found a secret door.","a curious child"],"outputs":["I found a secret door. Wonder what it does."]},{"inputs":["We did not mean to offend.","a stereotypical rich person"],"outputs":["I'm sorry for my lack of tact, peasants."]},{"inputs":["I found the body!","a panicked girl about to see a murder"],"outputs":["Holy shit!! I looked in the closet and there's a body in there!"]},{"inputs":["I've had this for years.","an old man"],"outputs":["Got this here from my great gran-pappy."]},{"inputs":["I'm just going to be a minute.","someone about to have an affair"],"outputs":["We'll only be gone for a little while. I promise!"]},{"inputs":["Why bother?","a disgruntled cubicle worker"],"outputs":["Look at all these applications to file! Why even bother?"]}],"serialization":{"inputMarkers":["","\\nSaid like "],"splitMarker":":\\n","outputMarkers":[""],"endMarker":"\\n\\nNext...\\n\\n"}}`;

const BLACKBEARD_FORMULA =
    `{"data":[{"inputs":["How are you doing this morning?"],"outputs":["How be ye today, landlubber?"]},{"inputs":["I dropped my fork!"],"outputs":["Shiver me timbers, I dropped fork on the ground."]},{"inputs":["I have no idea what you're talking about"],"outputs":["I ain't followin' ya, matey."]},{"inputs":["What did you do this weekend?"],"outputs":["Aye, you were tellin' me about yer weekend, were ye not?"]},{"inputs":["I don't buy it"],"outputs":["I trust ye less than me mutinous first mate."]}],"serialization":{"inputMarkers":[""],"splitMarker":"\\nYarr now sat it like a swarthy pirate.\\n","outputMarkers":[""],"endMarker":"\\nLet's go for that again, eh?\\n"}}`;

const YODA_FORMULA =
    `{"data":[{"inputs":["How are you doing this morning?"],"outputs":["Feeling good this morning, are you, yes?"]},{"inputs":["I dropped my fork!"],"outputs":["Dropped my for on the ground have I, oh?"]},{"inputs":["I have no idea what you're talking about"],"outputs":["Understand your idea I do not, young one."]},{"inputs":["What did you do this weekend?"],"outputs":["Your weekend you will tell me about now, yes?"]},{"inputs":["I don't buy it"],"outputs":["I believe you not."]}],"serialization":{"inputMarkers":[""],"splitMarker":"\\nHow would Master Yoda say this?\\n","outputMarkers":[""],"endMarker":"\\nExcellent, Jedi.  Please try again.\\n"}}`;

const BILLANDTED_FORMULA =
    `{"data":[{"inputs":["How are you doing this morning?"],"outputs":["Most excellent to meet you, dude!"]},{"inputs":["I dropped my fork!"],"outputs":["Aw bummer dude!  Totally  dropped my fork again!"]},{"inputs":["I have no idea what you're talking about"],"outputs":["Dude, I have no clue what you mean."]},{"inputs":["What did you do this weekend?"],"outputs":["Was your weekend most triumphant?"]},{"inputs":["I don't buy it"],"outputs":["No way, dude."]}],"serialization":{"inputMarkers":[""],"splitMarker":"\\nHow would Bill and Ted say this?\\n","outputMarkers":[""],"endMarker":"\\nMost excellent!  Let's totally do that again.\\n"}}`;
interface Voice {
  name: string, formula: Formula,
}

// tslint:disable:no-any this is my reasoning
export interface EmptyDialogData {}

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class SayItAgainPage implements AfterViewInit, OnInit {
  @ViewChild('help') help!: InstructionsDialog;
  @ViewChild('butt') generateButton!: CentaurButton;
  @ViewChildren('linebutt') lineButtons!: QueryList<CentaurButton>;

  helpText = [
    'This experiment uses formulas that rephrase neutral style into a chracters\' style.',
    'You can select from the available fewshot style formulas or try the CUSTOM style, which can be anything.',
    'Expect CUSTOM to work best when referencing pop-culture characters or familiar character archetypes, as it only takes the style name as input; the other voices have access to a 5-10 examples of correct I/O as well as the voice name.',
  ];

  customVoice = 'A Robot';
  voiceList: Voice[] = [
    {
      name: 'Romeo',
      formula: new Formula('romeo', '').readSerializedForSave(ROMEO_FORMULA)
    },
    {name: 'Yoda', formula: new Formula('yoda', '').readSerializedForSave(YODA_FORMULA)},
    {
      name: 'Blackbeard',
      formula: new Formula('blackbeard', '').readSerializedForSave(BLACKBEARD_FORMULA)
    },
    {
      name: 'Bill and Ted',
      formula: new Formula('bilnted', '').readSerializedForSave(BILLANDTED_FORMULA)
    },
    {
      name: 'CUSTOM',
      formula: new Formula('custom', '').readSerializedForSave(CUSTOM_FORMULA)
    },
  ];

  currentVoice: Voice = this.voiceList[0];

  constructor(
      private readonly passageService: PassageService,
      readonly themeService: ThemeService,
      public dialog: MatDialog,
      private readonly generationService: TextGenerationService,
      private readonly snackBar: MatSnackBar,
  ) {
    this.themeService.cycleTheme();
    this.themeService.cycleTheme();
  }

  testData: TestPair[] = [
    {
      'input': 'Hello, welcome to my shop!',
      'output': '',
    },
    {
      'input': 'Sorry, I need to leave',
      'output': '',
    },
    {
      'input': 'Would you like to hear my story?',
      'output': '',
    },
  ];

  async ngOnInit() {
    console.log('ModelZero starting...');
  }

  async ngAfterViewInit() {
    console.log('Initializing Passages');
    for (let i = 0; i < this.testData.length; ++i) {
      this.passageService.setPassage(
          new Passage('input' + i, this.testData[i]['input']));
    }
    this.currentVoice = this.voiceList[0];
  }

  changeVoice(key: MatSelectChange) {
    for (const x of this.voiceList) {
      if (key.value === x['name']) {
        this.currentVoice = x;
        break;
      }
    }
  }

  generate() {
    this.generateOne(0, 0, true);
  }

  generateOne(index: number, retries: number, goOn: boolean) {
    const d = this.testData[index];
    const inputText = this.passageService.getOrEmpty('input' + index)['text'];
    const formula = this.currentVoice.formula;
    let prompt = 'ERROR';
    if (this.currentVoice.name === 'CUSTOM') {
      prompt = formula.makeFewshotPrompt([inputText, this.customVoice]);
    } else {
      prompt = formula.makeFewshotPrompt([inputText]);
    }
      this.generationService.generateText(prompt, -1).then(
        (result: TextGenerationResult) => {
          if (result['error']) {
            if (retries < MAX_RETRIES) {
              setTimeout(
                  () => this.generateOne(index, retries + 1, goOn), 3000);
            } else {
              d['output'] = 'ERROR :(';
              this.lineButtons.toArray()[index].doneWaiting();
              if (index < this.testData.length) {
                if (goOn) {
                  this.generateOne(index + 1, 0, goOn);
                }
              } else {
                this.generateButton!.doneWaiting();
              }
            }
            return;
          }
          for (const t of result['text']) {
            const extracted = formula.extractResult(t);
            if (extracted) {
              d['output'] = extracted[0];
              this.lineButtons.toArray()[index].doneWaiting();
              if (index + 1 < this.testData.length) {
                if (goOn) {
                  this.generateOne(index + 1, 0, goOn);
                }
              } else {
                this.generateButton!.doneWaiting();
              }
              break;
            }
          }
        });
  }

  showHelp() {
    this.help.show();
  }

  openEditorDialog() {
    const dialogRef = this.dialog.open(EditTemplateDialog, {
      width: '95%',
      height: '95%',
      maxWidth: '95%',
      data: {
        'channel': EDITOR_PASSAGE_NAME,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  trackByFn(index: number, item: any) {
    return index;
  }
}


@Component({
  selector: 'edit-template-dialog',
  template: `
    <div class="edit-outer">
      <fewshot style="flex-grow:4;" [allowSerializationEdit]="false" [parentChannel]="'${
      EDITOR_PASSAGE_NAME}'" [editorChannel]="'${
      EDITOR_PASSAGE_NAME}-tmp'"></fewshot>
      <div class="button-panel">
    <button
      mat-raised-button
      class="butt"
      type="button"
      color="primary"
      (click)="onOK()"
    >
      <mat-icon>done_outline</mat-icon>
      Save
    </button>

    <button
      mat-raised-button
      class="butt"
      type="button"
      color="primary"
      (click)="cancel()"
    >
      <mat-icon>cancel</mat-icon>
      Cancel
    </button>
      </div>
      </div>
      `,
  styles: [
    `
      ::host {
         position:relative; 
      }
      
      .butt {
          margin: 10px;
        }

      .edit-outer {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    
      .button-panel {
        height: 60px;
      }
      `,
  ]
})
export class EditTemplateDialog {
  constructor(
      public dialogRef: MatDialogRef<EditTemplateDialog>,
      private readonly passageService: PassageService,
      @Inject(MAT_DIALOG_DATA) public data: EmptyDialogData) {}

  cancel() {
    this.dialogRef.close(null);
  }

  onOK(): void {
    const passage = this.passageService.getOrEmpty(EDITOR_PASSAGE_NAME);
    console.log(
        'COPYFROM',
        this.passageService.getOrEmpty(EDITOR_PASSAGE_NAME + '-tmp'));
    passage.copyFrom(
        this.passageService.getOrEmpty(EDITOR_PASSAGE_NAME + '-tmp'));
    this.passageService.setPassage(passage);
    this.dialogRef.close(passage);
  }
}
