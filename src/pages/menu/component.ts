import {AfterViewInit, Component, Inject, NgZone, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {Formula, FormulaData, Passage} from '../../common/interfaces';  // from ../../common/interfaces
import {TextGenerationService} from '../../services/interfaces';
import {SEMIRARE} from '../../common/wordlists';  // from ../../common:wordlists
import {CentaurButton} from '../../components/button/component';  // from ../../components/button:button
import {InstructionsDialog} from '../../components/instructions/component';  // from ../../components/instructions:instructions
import {WrittenPage} from '../../components/page/component';  // from ../../components/suggestion:suggestion
import {SuggestionPanel} from '../../components/suggestion/component';  // from ../../components/suggestion:suggestion
import {TextGenerationResult} from '../../services/interfaces';  // from ../../services:services
import {PassageService} from '../../services/passage_service';  // from ../../services:services
import {ThemeService} from '../../services/theme_service';  // from ../../services:services

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
