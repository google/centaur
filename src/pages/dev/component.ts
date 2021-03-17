import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Formula, FormulaData, Passage} from '../../common/interfaces';  // from ../../common/interfaces
import {SEMIRARE} from '../../common/wordlists';  // from ../../common:wordlists
import {CentaurButton} from '../../components/button/component';  // from ../../components/button:button
import {FewshotEditor} from '../../components/fewshot_editor/component';  // from ../../components/fewshot_editor:fewshot_editor
import {InstructionsDialog} from '../../components/instructions/component';  // from ../../components/instructions:instructions
import {WrittenPage} from '../../components/page/component';  // from ../../components/suggestion:suggestion
import {SuggestionPanel} from '../../components/suggestion/component';  // from ../../components/suggestion:suggestion
import {PassageService} from '../../services/passage_service';  // from ../../services:services
import {ThemeService} from '../../services/theme_service';  // from ../../services:services

// tslint:disable:no-any this is my reasoning

const EDITOR_PASSAGE_NAME = 'program';

const INIT_IO_PAIRS: FormulaData[] = [];

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class DevPage implements AfterViewInit, OnInit {
  @ViewChild('fewshotedtor') fewshot?: FewshotEditor;

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
    const editorPassage = new Formula(EDITOR_PASSAGE_NAME, '');
    editorPassage.data = INIT_IO_PAIRS;
    editorPassage.serialization = {
      'inputMarkers': ['', '\n[ '],
      'splitMarker': ' ]\n',
      'outputMarkers': [''],
      'endMarker': '\n\n',
    };
    editorPassage.updatePreamble();
    this.passageService.setPassage(editorPassage);
    this.fewshot!.addIO();
  }

  save() {
    const editorPassage = this.passageService.getOrEmpty('editor') as Formula;
    const data = JSON.stringify({
      'data': editorPassage.data,
      'serialization': editorPassage.serialization
    });
    const el = document.createElement('textarea');
    el.value = data;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  load() {
    const dialogRef = this.dialog.open(JankyloadDialog, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The jankyload dialog was closed', result);
      if (result) {
        const data = JSON.parse(result);
        const editorPassage = new Passage(EDITOR_PASSAGE_NAME, '') as Formula;
        editorPassage.data = data['data'];
        editorPassage.serialization = data['serialization'];
        editorPassage.updatePreamble();
        this.passageService.setPassage(editorPassage);
        this.fewshot!.refreshFromParent();
      }
    });
  }
}

export interface EmptyDialogData {}

@Component({
  selector: 'jankyload',
  templateUrl: 'jankyload-dialog.ng.html',
  styleUrls: ['./jankyload.scss'],
})
export class JankyloadDialog {
  constructor(
      public dialogRef: MatDialogRef<JankyloadDialog>,
      @Inject(MAT_DIALOG_DATA) public data: EmptyDialogData) {}

  loaddata = '';

  onOK(): void {
    this.dialogRef.close(this.loaddata);
  }
}
