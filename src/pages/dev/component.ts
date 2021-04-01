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
import {Formula, FormulaData, Passage} from '../../common/interfaces';
import {SEMIRARE} from '../../common/wordlists';
import {CentaurButton} from '../../components/button/component';
import {FewshotEditor} from '../../components/fewshot_editor/component';
import {InstructionsDialog} from '../../components/instructions/component';
import {WrittenPage} from '../../components/page/component';
import {SuggestionPanel} from '../../components/suggestion/component';
import {PassageService} from '../../services/passage_service';
import {ThemeService} from '../../services/theme_service';

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
        const editorPassage = new Formula(EDITOR_PASSAGE_NAME, '');
        editorPassage.data = data['data'];
        editorPassage.serialization = data['serialization'];
        editorPassage.updatePreamble();
        this.passageService.setFormula(editorPassage);
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
