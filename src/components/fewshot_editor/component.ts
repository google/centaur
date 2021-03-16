import {AfterViewInit, Component, EventEmitter, Inject, Input, NgZone, Output, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSliderChange} from '@angular/material/slider';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {FewshotContextIO} from 'google3/experimental/centaur/common/interfaces';  // from google3/experimental/centaur/common/interfaces
import {Passage} from 'google3/experimental/centaur/common/interfaces';  // from google3/experimental/centaur/common:interfaces
import {CentralGenerationService} from 'google3/experimental/centaur/services/central_generation_service';  // from google3/experimental/centaur/services:central_generation_service
import {PassageService} from 'google3/experimental/centaur/services/passage_service';  // from google3/experimental/centaur/services:services

@Component({
  selector: 'fewshot',
  templateUrl: 'component.ng.html',
  styleUrls: ['./component.scss'],
})
export class FewshotEditor implements AfterViewInit {
  constructor(
      private readonly passageService: PassageService,
      private readonly generationService: CentralGenerationService,
      private readonly snackBar: MatSnackBar,
      private zone: NgZone,
  ) {
    this.parent = this.passageService.getOrEmpty(this.parentChannel!);
    this.passageService.setPassage(this.parent);
    this.program = this.passageService.getOrEmpty(this.editorChannel!);
    this.refreshFromParent();
  }

  ngAfterViewInit() {
    console.log('AVI', this.parentChannel);
    // to capture possible new inputs.
    this.refreshFromParent();
    this.refreshMarkerDemo(undefined);
  }

  refreshFromParent() {
    console.log('STARTING WITH PARENT', this.parentChannel);
    this.parent = this.passageService.getOrEmpty(this.parentChannel!);
    this.program = this.parent.clone(this.editorChannel!);
    this.passageService.setPassage(this.program);
    this.testInputs = [];
    for (let i = 0; i < this.program.numInputs(); ++i) {
      this.testInputs.push('');
    }
    this.refreshMarkerDemo(null);
  }

  @Input() parentChannel: string = 'edit-main';
  @Input() editorChannel: string = 'edit-main-tmp';

  @Input() allowSerializationEdit = true;
  @Input() includeQuickTest = false;

  parent: Passage;
  program: Passage;

  testInputs: string[] = [];
  testOutputs: string[][] = [];
  testFails = 0;
  testTotal = 0;

  isGenerating = false;
  isGeneratingTest = false;

  useGreedy = false;

  displayedColumns = ['inputs', 'output', 'buttons'];

  addIO() {
    const inputs = [];
    for (let i = 0; i < this.program.numInputs(); ++i) {
      inputs.push('');
    }
    const outputs = [];
    console.log('OK!', this.program.numOutputs());
    for (let i = 0; i < this.program.numOutputs(); ++i) {
      outputs.push('');
    }
    this.program.pairs.push({inputs, outputs});
    this.program.pairs = [...this.program.pairs];
    this.passageService.setPassage(this.program);
  }

  deleteIO(i: number) {
    this.program.pairs.splice(i, 1);
    this.program.pairs = [...this.program.pairs];
    this.passageService.setPassage(this.program);
    this.refreshText(null);
  }

  importFromIOPairs() {
    console.log('IMPORT FROM IO');
    this.program.convertFromIO();
    this.passageService.setPassage(this.program);
  }

  async generateNewPair() {
    if (this.program.pairs.length < 2) {
      this.zone.run(() => {
        const config = new MatSnackBarConfig();
        config.duration = 3000;
        this.snackBar.open(
            'At least two examples are required to AutoGenerate.', undefined,
            config);
      });
      return;
    }
    this.isGenerating = true;
    const context = this.program.getTemplateFromIOPairs(this.program.pairs);
    const result = await this.generationService.generateText(context);
    if (!result['error']) {
      let gotOne = false;
      for (const t of result['text']) {
        const newExample = this.program.extractExample(t);
        if (newExample) {
          gotOne = true;
          this.program.pairs.push(newExample);
        }
      }
      if (!gotOne) {
        this.zone.run(() => {
          const config = new MatSnackBarConfig();
          config.duration = 5000;
          this.snackBar
              .open('No AutoGen deserialized sucessfully.', 'TryAgain', config)
              .onAction()
              .subscribe(() => {
                this.generateNewPair();
              });
        });
      }
      this.program.pairs = [...this.program.pairs];
      this.passageService.setPassage(this.program);
      this.commitMarkerChanges();
    }
    this.isGenerating = false;
  }

  refreshText(event: any) {
    this.importFromIOPairs();
  }

  refreshMarkerDemo(event: any) {
    console.log('CALLING!', this.program);
    const numDemos = 2;
    const demoData: FewshotContextIO[] = [];
    for (let i = 0; i < numDemos; ++i) {
      const pair: FewshotContextIO = {'inputs': [], 'outputs': []};
      for (let j = 0; j < this.program!.numInputs(); ++j) {
        pair['inputs'].push(
            '[Example ' + (i + 1) + ' - Input ' + (j + 1) + ']');
      }
      for (let j = 0; j < this.program!.numOutputs(); ++j) {
        pair['outputs'].push(
            '[Example ' + (i + 1) + ' - Output ' + (j + 1) + ']');
      }
      demoData.push(pair);
    }
    console.log(demoData);
    const preamble = this.program.getTemplateFromIOPairs(demoData);
    console.log(preamble);
    const markerdemo =
        this.passageService.getOrEmpty(this.editorChannel + '-markerdemo');
    markerdemo['text'] = preamble;
    this.passageService.setPassage(markerdemo);
  }

  trackByFn(index: number, item: any) {
    return index;
  }

  numInputsChange(event: MatSliderChange) {
    const newNumInputs = event.value!;
    console.log('NEW #INPUTS - ', newNumInputs);
    let markers = this.program.conversionSpec['inputMarkers'];
    const curNumInputs = markers.length;
    if (curNumInputs > newNumInputs) {
      markers = markers.slice(0, newNumInputs);
    } else {
      for (let i = curNumInputs; i < newNumInputs; ++i) {
        markers.push('');
      }
    }
    console.log('NEW MARKERS = ', markers);
    this.program.conversionSpec['inputMarkers'] = markers;
    this.refreshMarkerDemo(undefined);
    this.commitMarkerChanges();
  }

  numOutputsChange(event: MatSliderChange) {
    const newNumOutputs = event.value!;
    console.log('NEW #Outputs - ', newNumOutputs);
    let markers = this.program.conversionSpec['outputMarkers'];
    const curNumOutputs = markers.length;
    if (curNumOutputs > newNumOutputs) {
      markers = markers.slice(0, newNumOutputs);
    } else {
      for (let i = curNumOutputs; i < newNumOutputs; ++i) {
        markers.push('');
      }
    }
    this.program.conversionSpec!['outputMarkers'] = markers;
    this.refreshMarkerDemo(undefined);
    this.commitMarkerChanges();
  }

  commitMarkerChanges() {
    const newNumInputs = this.program.numInputs();
    const newNumOutputs = this.program.numOutputs();
    console.log('CHANGING INPUT!', {newNumInputs, newNumOutputs});
    const prev = this.program.pairs;
    this.program.pairs = [];
    for (const p of prev) {
      const curNumInputs = p['inputs'].length;
      if (curNumInputs > newNumInputs) {
        console.log('BEFORE', p['inputs']);
        p['inputs'].splice(newNumInputs, curNumInputs - newNumInputs);
        console.log('AFER', p['inputs']);
      } else {
        for (let i = curNumInputs; i < newNumInputs; ++i) {
          p['inputs'].push('');
        }
      }
      const curNumOutputs = p['outputs'].length;
      if (curNumOutputs > newNumOutputs) {
        p['outputs'].splice(newNumOutputs, curNumOutputs - newNumOutputs);
      } else {
        for (let i = curNumOutputs; i < newNumOutputs; ++i) {
          p['outputs'].push('');
        }
      }
      this.program.pairs.push(p);
    }
    console.log('RESULT OF CHANGE', {result: this.program.pairs});
    this.passageService.setPassage(this.program);
    this.testInputs = [];
    for (let i = 0; i < this.program.numInputs(); ++i) {
      this.testInputs.push('');
    }
  }

  formatLabel(value: number) {
    return value;
  }

  async refreshTest() {
    this.isGeneratingTest = true;
    this.testOutputs = [];

    // this.testOutputs =
    //     [['Output 1-1', 'Output 1-2'], ['Output 2-1', 'Output 2-2']];


    const prompt = this.program.makeFewshotPrompt(this.testInputs);
    const result = await this.generationService.generateText(
        prompt, this.useGreedy ? 0.00001 : undefined);
    if (!result['error']) {
      this.testFails = 0;
      this.testTotal = result['text'].length;
      for (const t of result['text']) {
        const outputs = this.program.extractResult(t);
        if (outputs) {
          this.testOutputs.push(outputs);
          this.testFails += 1;
        }
      }
      this.zone.run(() => {
        const config = new MatSnackBarConfig();
        config.duration = 5000;
        this.snackBar.open(
            this.testFails + ' of ' + this.testTotal +
                ' outputs fit the pattern.',
            'High Five', config);
      });
    }
    this.isGeneratingTest = false;
  }

  addTestToData(index: number) {
    const inputs = this.testInputs;
    const outputs = this.testOutputs[index];
    this.program.pairs.push({inputs, outputs});
    this.program.pairs = [...this.program.pairs];
    this.passageService.setPassage(this.program);
  }

  toggleGreedy(checked: boolean) {
    this.useGreedy = checked;
  }
}
