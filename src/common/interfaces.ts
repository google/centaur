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

export interface FormulaData {
    inputs: string[], outputs: string[]
}

export interface FormulaSerialization {
    inputMarkers: string[], splitMarker: string, outputMarkers: string[],
    endMarker: string,
}

export interface FormulaExtractionResult {
    results: string[],
    cursor:
    number  // The char index in in the input where the extraction ended.
}


/** A Written Passage stored on a channel (and shared between components) */
export class Passage {
    constructor(
        public channel: string,
        public text: string,
    ) {}
}

/** A Fewshot formula that caches its preamble in a Passage.*/
export class Formula extends Passage {
    constructor(
        public channel: string,
        public text: string,
    ) {
        super(channel, text);
    }

    data: FormulaData[] = [];
    serialization: FormulaSerialization = {
        'inputMarkers': [''],
        'splitMarker': '',
        'outputMarkers': [''],
        'endMarker': '',
    };

    numInputs() {
        return this.serialization['inputMarkers'].length;
    }

    numOutputs() {
        return this.serialization['outputMarkers'].length;
    }

    clone(newChannel: string) {
        const p = new Formula(newChannel, this.text);
        p.data = this.data;
        p.serialization = this.serialization;
        return p;
    }

    copyFrom(other: Formula) {
        this.text = other.text;
        this.data = other.data;
        this.serialization = other.serialization;
        this.updatePreamble();
    }

    getPreambleUsingData(data: FormulaData[]) {
        if (!this.serialization) {
            return '';
        }

        let ret = '';
        for (const r of data) {
            for (let i = 0; i < r['inputs'].length; ++i) {
                ret += this.serialization['inputMarkers'][i] + r['inputs'][i];
            }

            ret += this.serialization['splitMarker'];

            for (let i = 0; i < r['outputs'].length; ++i) {
                ret += this.serialization['outputMarkers'][i] + r['outputs'][i];
            }
            ret += this.serialization['endMarker'];
        }
        return ret;
    }

    updatePreamble() {
        this.text = this.getPreambleUsingData(this.data);
    }

    makeFewshotPrompt(inputs: string[]) {
        this.updatePreamble();
        let ret = this.text;
        for (let i = 0; i < inputs.length; ++i) {
            ret += this.serialization['inputMarkers'][i] + inputs[i];
        }
        ret += this.serialization['splitMarker'];
        return ret;
    }

    extractResult(generatedText: string): string[]|null {
        const result = this.extract(
            generatedText, this.serialization['outputMarkers'],
            this.serialization['endMarker']);
        if (result) {
            return result.results;
        }
        return null;
    }

    extract(text: string, markers: string[], endMarker: string): FormulaExtractionResult
        |null {
        const results: string[] = [];
        const numResults = markers.length;
        let cursor = 0;
        for (let i = 0; i < numResults; ++i) {
            if (markers[i].length > 0 &&
                text.indexOf(markers[i], cursor) !== cursor) {
                console.log('Extraction failed to find output marker', {
                    'index': i,
                    'text': text,
                    'marker': markers[i],
                    cursor,
                    'result': text.indexOf(markers[i], cursor)
                });
                return null;
            }
            cursor += markers[i].length;
            const nextMark = i + 1 < numResults ? markers[i + 1] : endMarker;
            const nextMarkIndex = text.indexOf(nextMark, cursor);
            if (nextMarkIndex === -1) {
                console.log(
                    'Extraction failed to find next marker',
                    {'index': i, 'text': text, nextMark, nextMarkIndex, cursor});
                return null;
            }
            results.push(text.substr(cursor, nextMarkIndex - cursor));
            cursor = nextMarkIndex;
        }
        cursor += endMarker.length;
        return {results, cursor};
    }

    extractExample(generatedText: string): FormulaData|null {
        const inputResult = this.extract(
            generatedText, this.serialization['inputMarkers'],
            this.serialization['splitMarker']);
        if (!inputResult) {
            return null;
        }

        const outputResult = this.extract(
            generatedText.substr(inputResult.cursor),
            this.serialization['outputMarkers'], this.serialization['endMarker']);

        if (!outputResult) {
            return null;
        }

        return {
            'inputs': inputResult.results,
            'outputs': outputResult.results,
        };
    }

    serializeForSave() {
        return JSON.stringify(
            {'data': this.data, 'serialization': this.serialization});
    }

    readSerializedForSave(s: string) {
        const jsonData = JSON.parse(s);
        this.data = jsonData['data'];
        this.serialization = jsonData['serialization'];
        return this;  // for chaining
    }
}
