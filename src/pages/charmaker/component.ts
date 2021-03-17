import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Formula, Passage} from '../../common/interfaces';  // from ../../common:interfaces
import {SEMIRARE} from '../../common/wordlists';  // from ../../common:wordlists
import {CentaurButton} from '../../components/button/component';  // from ../../components/button:button
import {InstructionsDialog} from '../../components/instructions/component';  // from ../../components/instructions:instructions
import {WrittenPage} from '../../components/page/component';  // from ../../components/suggestion:suggestion
import {SuggestionPanel} from '../../components/suggestion/component';  // from ../../components/suggestion:suggestion
import {TextGenerationService} from '../../services/interfaces';  // from ../../services:central_generation_service
import {TextGenerationResult} from '../../services/interfaces';  // from ../../services:services
import {PassageService} from '../../services/passage_service';  // from ../../services:services
import {ThemeService} from '../../services/theme_service';  // from google3/experimental/centaur/services:services

// tslint:disable:no-any this is my reasoning

const REFERENCE_CHARS: {[name: string]: string}[] = [
  {
    'Super-Objective': 'to find love',
    'Sub-Objective': 'to be beautiful',
    'Scene Objective': 'to get a good haircut',
    'Internal Obstacles': 'is very picky',
    'External Obstacles': 'the barbershop is closed',
    'Tactics': 'convincing friends to help',
    'Physical Attributes': 'fit and well-dressed',
    'Backstory': 'comes from a rich family',
  },
  {
    'Super-Objective': 'to see the world',
    'Sub-Objective': 'to get into India',
    'Scene Objective': 'to get a passport',
    'Internal Obstacles': 'is impatient',
    'External Obstacles': 'lots of paperwork is required',
    'Tactics': 'yelling',
    'Physical Attributes': 'young and unshaven',
    'Backstory': 'from a small town in Maine',
  },
  {
    'Super-Objective': 'to be famous',
    'Sub-Objective': 'to get on TV',
    'Scene Objective': 'to memorize lines for an audition',
    'Internal Obstacles': 'is sleepy',
    'External Obstacles': 'has to go shopping',
    'Tactics': 'persistence',
    'Physical Attributes': 'short and trendy',
    'Backstory': 'from Fargo, North Dakota',
  },
  {
    'Super-Objective': 'to get rich',
    'Sub-Objective': 'to win the lottery',
    'Scene Objective': 'to pick lottery numbers',
    'Internal Obstacles': 'is shy',
    'External Obstacles': 'has no money',
    'Tactics': 'steals the ticket',
    'Physical Attributes': 'tall',
    'Backstory': 'comes from Boston',
  },
];

const DEFAULT_CHAR: {[name: string]: string} = {
  'Super-Objective': 'to write a novel',
  'Sub-Objective': 'to come up with a main character',
  'Scene Objective': 'to find inspiration',
  'Internal Obstacles': 'is bored',
  'External Obstacles': 'can\'t find your pen',
  'Tactics': 'trying AI',
  'Physical Attributes': 'exceptionally average',
  'Backstory': 'a Google employee',
};

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class CharMakerPage implements AfterViewInit, OnInit {

  cleared: boolean[] = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  traits: string[] = [
    'Super-Objective',
    'Sub-Objective',
    'Scene Objective',
    'Internal Obstacles',
    'External Obstacles',
    'Tactics',
    'Physical Attributes',
    'Backstory',
  ];

  traitMarkers: string[] = [
    '\\nSuper-Objective: ',
    '\\nSub-Objective: ',
    '\\nScene Objective: ',
    '\\nInternal Obstacles: ',
    '\\nExternal Obstacles: ',
    '\\nTactics: ',
    '\\nPhysical Attributes: ',
    '\\nBackstory: ',
  ];

  generating = false;

  constructor(
      private readonly passageService: PassageService,
      readonly themeService: ThemeService,
      private readonly generationService: TextGenerationService,
  ) {
    this.themeService.cycleTheme();
    this.themeService.cycleTheme();

    for (let i = 0; i < this.traits.length; ++i) {
      this.passageService.setPassageText(
          DEFAULT_CHAR[this.traits[i]], 'trait-value-' + i);
    }
  }

  async ngOnInit() {
    console.log('ModelChar starting...');
  }

  async ngAfterViewInit() {
    console.log('Initializing Passages');
  }

  deleteTrait(idx: number) {
    this.cleared[idx] = true;
    this.passageService.setPassageText('', 'trait-value-' + idx);
  }

  generate(idx: number) {
    this.generating = true;

    // Need the formula and the inputs.
    const formula = new Formula('formula', '');
    formula.serialization = {
      'inputMarkers': [],
      'splitMarker': '',
      'outputMarkers': [this.traitMarkers[idx]],
      'endMarker': '\\n\\n[DONE]\\n\\n',
    };
    for (let j = 0; j < REFERENCE_CHARS.length; ++j) {
      formula.data.push({
        'inputs': [],
        'outputs': [REFERENCE_CHARS[j][this.traits[idx]]],
      });
    }
    const inputs: string[] = [];
    for (let i = 0; i < this.traits.length; ++i) {
      if (this.cleared[i]) {
        continue;
      }
      formula.serialization['inputMarkers'].push(this.traitMarkers[i]);
      inputs.push(this.passageService.getOrEmpty('trait-value-' + i)['text']);
      for (let j = 0; j < REFERENCE_CHARS.length; ++j) {
        formula.data[j]['inputs'].push(REFERENCE_CHARS[j][this.traits[i]]);
      }
    }
    const prompt = formula.makeFewshotPrompt(inputs);
      this.generationService.generateText(prompt, -1).then(
        (result: TextGenerationResult) => {
          if (result['error']) {
            console.log('ERROR!');
            this.generating = false;
            return;
          }
          for (const t of result['text']) {
            const extracted = formula.extractResult(t);
            if (extracted) {
              this.passageService.setPassageText(
                  extracted[0], 'trait-value-' + idx);
              this.cleared[idx] = false;
              break;
            }
          }
          this.generating = false;
        });
  }

  checkClear(idx: number) {
    const text = this.passageService.getOrEmpty('trait-value-' + idx)['text'];
    this.cleared[idx] = (text.length === 0);
  }
}
