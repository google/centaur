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

import {AfterViewInit, Component, EventEmitter, Inject, Input, NgZone, Output, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSliderChange} from '@angular/material/slider';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {Formula, FormulaData, Passage} from '../../common/interfaces';
import {TextGenerationService} from '../../services/interfaces';
import {PassageService} from '../../services/passage_service';

@Component({
    selector: 'fewshot',
    templateUrl: 'component.ng.html',
    styleUrls: ['./component.scss'],
})
export class FewshotEditor implements AfterViewInit {
    constructor(
        private readonly passageService: PassageService,
        private readonly generationService: TextGenerationService,
        private readonly snackBar: MatSnackBar,
        private zone: NgZone,
    ) {
        this.parent = this.passageService.getOrEmpty(this.parentChannel!) as Formula;
        this.passageService.setFormula(this.parent);
        this.program = this.passageService.getOrEmpty(this.editorChannel!) as Formula;
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
        this.parent = this.passageService.getOrEmpty(this.parentChannel!) as Formula;
        this.program = this.parent.clone(this.editorChannel!);
        this.passageService.setFormula(this.program);
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

    parent: Formula;
    program: Formula;

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
        this.program.data.push({inputs, outputs});
        this.program.data = [...this.program.data];
        this.passageService.setFormula(this.program);
    }

    deleteIO(i: number) {
        this.program.data.splice(i, 1);
        this.program.data = [...this.program.data];
        this.passageService.setFormula(this.program);
        this.refreshText(null);
    }

    importFromIOPairs() {
        this.program.updatePreamble();
        this.passageService.setFormula(this.program);
    }

    async generateNewPair() {
        if (this.program.data.length < 2) {
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
        const context = this.program.getPreambleUsingData(this.program.data);
        const result = await this.generationService.generateText(context, -1);
        if (!result['error']) {
            let gotOne = false;
            for (const t of result['text']) {
                const newExample = this.program.extractExample(t);
                if (newExample) {
                    gotOne = true;
                    this.program.data.push(newExample);
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
            this.program.data = [...this.program.data];
            this.passageService.setFormula(this.program);
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
        const demoData: FormulaData[] = [];
        for (let i = 0; i < numDemos; ++i) {
            const pair: FormulaData = {'inputs': [], 'outputs': []};
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
        const preamble = this.program.getPreambleUsingData(demoData);
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
        let markers = this.program.serialization['inputMarkers'];
        const curNumInputs = markers.length;
        if (curNumInputs > newNumInputs) {
            markers = markers.slice(0, newNumInputs);
        } else {
            for (let i = curNumInputs; i < newNumInputs; ++i) {
                markers.push('');
            }
        }
        console.log('NEW MARKERS = ', markers);
        this.program.serialization['inputMarkers'] = markers;
        this.refreshMarkerDemo(undefined);
        this.commitMarkerChanges();
    }

    numOutputsChange(event: MatSliderChange) {
        const newNumOutputs = event.value!;
        console.log('NEW #Outputs - ', newNumOutputs);
        let markers = this.program.serialization['outputMarkers'];
        const curNumOutputs = markers.length;
        if (curNumOutputs > newNumOutputs) {
            markers = markers.slice(0, newNumOutputs);
        } else {
            for (let i = curNumOutputs; i < newNumOutputs; ++i) {
                markers.push('');
            }
        }
        this.program.serialization!['outputMarkers'] = markers;
        this.refreshMarkerDemo(undefined);
        this.commitMarkerChanges();
    }

    commitMarkerChanges() {
        const newNumInputs = this.program.numInputs();
        const newNumOutputs = this.program.numOutputs();
        console.log('CHANGING INPUT!', {newNumInputs, newNumOutputs});
        const prev = this.program.data;
        this.program.data = [];
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
            this.program.data.push(p);
        }
        console.log('RESULT OF CHANGE', {result: this.program.data});
        this.passageService.setFormula(this.program);
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
        this.program.data.push({inputs, outputs});
        this.program.data = [...this.program.data];
        this.passageService.setFormula(this.program);
    }

    toggleGreedy(checked: boolean) {
        this.useGreedy = checked;
    }
}
