import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSelectChange} from '@angular/material/select';
import {Formula, Passage} from '../../common/interfaces';  // from ../../common:interfaces
import {SEMIRARE} from '../../common/wordlists';  // from ../../common:wordlists
import {CentaurButton} from '../../components/button/component';  // from ../../components/button:button
import {InstructionsDialog} from '../../components/instructions/component';  // from ../../components/instructions:instructions
import {WrittenPage} from '../../components/page/component';  // from ../../components/suggestion:suggestion
import {SuggestionPanel} from '../../components/suggestion/component';  // from ../../components/suggestion:suggestion
import {TextGenerationResult, TextGenerationService} from '../../services/interfaces';  // from ../../services:services
import {PassageService} from '../../services/passage_service';  // from ../../services:services
import {ThemeService} from '../../services/theme_service';  // from ../../services:services

// tslint:disable:no-any this is my reasoning

const CRIME_FORMULA =
    `{"pairs":[{"inputs":["shoplifting"],"outputs":["two jerseys from an athletic store","Who was your accomplice?"]},{"inputs":["smuggling"],"outputs":["three belts from a department store across international borders","What country did you smuggle them into?"]},{"inputs":["writing"],"outputs":["graffiti on the wall of the school","What did you write?"]},{"inputs":["attempting"],"outputs":["to buy drugs from an undercover police officer","What did you try to buy?"]},{"inputs":["a"],"outputs":["fire in a movie theatre","What type of movie was playing?"]},{"inputs":["stealing"],"outputs":["three bags of fertilizer from an organic plant nursery","Who was your accomplice?"]},{"inputs":["stealing"],"outputs":["three pairs of earrings from a local department store","When did you steal them?"]},{"inputs":["driving"],"outputs":["an illegally modified truck on a restricted military course","Where are you taking this truck?"]},{"inputs":["driving"],"outputs":["with drugs in your car","What kind of drugs were they?"]},{"inputs":["robbing"],"outputs":["a 7-11 convenience store","Describe the clerk."]},{"inputs":["setting"],"outputs":["a fire in a movie theater","What is your occupation and where did you find the accelerant?"]},{"inputs":["driving"],"outputs":["drunk","How many drinks did you have?"]},{"inputs":["shoplifting"],"outputs":["a package of cigarettes from a convenient store","Who was your accomplice?"]}],"conversionSpec":{"inputMarkers":["You are accused of "],"splitMarker":" ","outputMarkers":["",". "],"endMarker":"\\n\\n"}}`;

const BORING_FORMULA =
    `{"pairs":[{"inputs":["Hi there."],"outputs":["Hi, how are you."]},{"inputs":["I like your shoes."],"outputs":["Thanks"]},{"inputs":["What do you do for fun?"],"outputs":["I read"]},{"inputs":["Nice shirt."],"outputs":["I like yours as well."]},{"inputs":["Nice to meet you."],"outputs":["Yeah, you too."]},{"inputs":["I'm not feeling too good today."],"outputs":["I feel the same."]},{"inputs":["I think I'm going to go soon."],"outputs":["Cool, I'm heading out too."]},{"inputs":["Goodbye now."],"outputs":["Bye."]},{"inputs":["Hey, what's going on?"],"outputs":["Not much."]},{"inputs":["Hey, how are you?"],"outputs":["I'm doing just fine, thank you."]},{"inputs":["How y'all doin'?"],"outputs":["We're doing well, thanks!"]},{"inputs":["Good morning."],"outputs":["Morning."]}],"conversionSpec":{"inputMarkers":["I said \\""],"splitMarker":"\\" and then you simply replied  \\"","outputMarkers":[""],"endMarker":"\\" \\nOur boring conversation continued.\\n"}}`;

const BORING_CONTEXT_FORMULA =
    `{"pairs":[{"inputs":[""],"outputs":["just woke up naked next to each other in bed!"]},{"inputs":[""],"outputs":["were married for 30 years, got divorced, and just ran into each other on online dating!"]},{"inputs":[""],"outputs":["are both secretly sure that the other person is a spy!"]},{"inputs":[""],"outputs":["look identical, but have never met before in their life!"]}],"conversionSpec":{"inputMarkers":[""],"splitMarker":"This conversation is going to be really funny, because these two people ","outputMarkers":[""],"endMarker":"\\n[DONE]\\n"}}`;

interface ImprovGame {
  name: string;
  title: string;
}

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class ImprovPage implements AfterViewInit, OnInit {
  @ViewChild('butt') generateButton!: CentaurButton;

  gameList: ImprovGame[] = [
    {
      name: 'Empty',
      title: 'Empty Text',
    },
    {
      name: 'Interrogation',
      title: 'The Interrogation Game',
    },
  ];

  currentGame: ImprovGame = this.gameList[0];

  crimeverb = '';
  crime: string|undefined;
  constraint: string|undefined;

  boringText: string[] = [];
  boringContext: string|undefined = undefined;

  crimeFormula = new Formula('crime', '').readSerializedForSave(CRIME_FORMULA);
  boringFormula = new Formula('boring', '').readSerializedForSave(BORING_FORMULA);
  boringContextFormula =
      new Formula('boringContext', '').readSerializedForSave(BORING_CONTEXT_FORMULA);

  constructor(
      private readonly passageService: PassageService,
      readonly themeService: ThemeService,
      private readonly generationService: TextGenerationService,
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
  }

  generate() {
    if (this.currentGame['name'] === 'Interrogation') {
      this.crimeGenerate();
    } else if (this.currentGame['name'] === 'Empty') {
      this.emptyGenerate();
    }
  }

  crimeGenerate() {
    const prompt = this.crimeFormula.makeFewshotPrompt([this.crimeverb]);
      this.generationService.generateText(prompt, -1).then(
        (result: TextGenerationResult) => {
          if (result['error']) {
            console.log('ERROR!');
            return;
          }
          for (const t of result['text']) {
            const extracted = this.crimeFormula.extractResult(t);
            if (extracted) {
              this.crime = extracted[0];
              this.constraint = extracted[1];
              this.generateButton!.doneWaiting();
              break;
            }
          }
        });
  }

  async emptyGenerate() {
    this.boringContext = undefined;
    const promptContext = this.boringContextFormula.makeFewshotPrompt(['']);
    const result: TextGenerationResult =
          await this.generationService.generateText(promptContext, -1);
    if (result['error']) {
      console.log('ERROR!');
      return;
    }
    for (const t of result['text']) {
      const extracted = this.boringContextFormula.extractResult(t);
      if (extracted) {
        this.boringContext = extracted[0];
        break;
      }
    }

    this.boringText = ['Hi, how are you?'];
    for (let i = 0; i < 10; ++i) {
      const prompt = this.boringFormula.makeFewshotPrompt([this.boringText[i]]);
      const result: TextGenerationResult =
            await this.generationService.generateText(prompt, -1);
      if (result['error']) {
        console.log('ERROR!');
        return;
      }
      for (const t of result['text']) {
        const extracted = this.boringFormula.extractResult(t);
        if (extracted) {
          const text = extracted[0];
          if (text && !this.boringText.includes(text)) {
            this.boringText.push(text);
            console.log('NEW BORINGTEXT', this.boringText);
            break;
          }
        }
      }
    }

    this.generateButton!.doneWaiting();
  }

  changeGame(key: MatSelectChange) {
    for (const x of this.gameList) {
      if (key.value === x['name']) {
        this.currentGame = x;
        break;
      }
    }
  }
}
