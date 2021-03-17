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

import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {TextGenerationService} from '../../services/interfaces';
import {TextGenerationResult} from '../../services/interfaces';
import {PassageService} from '../../services/passage_service';
import {Formula} from '../../common/interfaces';

/**
 * A set of model generated suggestions
 */
@Component({
  selector: 'suggestion-panel',
  templateUrl: 'component.ng.html',
  styleUrls: ['./component.scss'],
})
export class SuggestionPanel {
  @Input() clearOnChoice = true;
  @Output() suggestionChosen = new EventEmitter<string|null>();
  @Output() generationFailed = new EventEmitter<null>();
  @Output() generationDone = new EventEmitter<null>();

  isGenerating = false;
  isComponentHidden = true;
  suggestions: string[] = [];

  constructor(
      private readonly passageService: PassageService,
      private readonly generationService: TextGenerationService,
      private readonly snackBar: MatSnackBar,
      private zone: NgZone,
  ) {}

  clickedSuggestion(s: string) {
    this.suggestionChosen.emit(s);
    if (this.clearOnChoice) {
      this.clear();
    }
  }

  clear() {
    console.log('Clearing suggestions');
    this.suggestions = [];
    this.isComponentHidden = true;
  }

  setSuggestions(suggestions: string[]) {
    this.suggestions = [];
    this.isComponentHidden = false;
    this.isGenerating = false;
    console.log('Setting suggestions', this.suggestions);
    setTimeout(() => {
      this.suggestions = suggestions;
    }, 500);
  }

  fillWithSuggestions(
      inputs: string[], promptGeneratorPassageName: string|undefined,
      maxSuggestions: number, filter: (s: string) => boolean) {
    if (this.isGenerating) {
      console.log('Already generating...');
      this.snack('Stop pressing Generate, be patient', 'I\'m Sorry.', () => {});
      return;
    }

    let prompt = '';
    if (promptGeneratorPassageName) {
      const program =
          this.passageService.getOrEmpty(promptGeneratorPassageName) as Formula;
      prompt = program.makeFewshotPrompt(inputs);
    } else {
      prompt = inputs.join('\n');
    }

    this.isGenerating = true;
    this.isComponentHidden = false;
    this.suggestions = [];

      this.generationService.generateText(prompt, -1).then(
        (result: TextGenerationResult) => {
          if (result['error']) {
            this.generationFailed.emit();
            this.isGenerating = false;
            this.clear();
            return;
          }
          this.generationDone.emit();
          const parsedResults: string[] = [];
          for (const t of result['text']) {
            if (promptGeneratorPassageName) {
              const program =
                  this.passageService.getOrEmpty(promptGeneratorPassageName) as Formula;
              const extracted = program.extractResult(t);
              if (extracted && filter(extracted[0])) {
                parsedResults.push(extracted[0]);
              }
            } else {
              parsedResults.push(t);
            }
          }
          if (parsedResults.length === 0) {
            this.snack('No acceptible results...', 'TryAgain', () => {
              this.fillWithSuggestions(
                  inputs, promptGeneratorPassageName, maxSuggestions, filter);
            });
            this.generationFailed.emit();
            this.isGenerating = false;
            this.clear();
          }
          for (let i = 0; i < maxSuggestions; ++i) {
            if (i < parsedResults.length) {
              this.suggestions.push(parsedResults[i]);
            }
          }
          this.isGenerating = false;
        });
  }

  snack(s: string, b: string, f: () => void) {
    this.zone.run(() => {
      const config = new MatSnackBarConfig();
      config.duration = 5000;
      this.snackBar.open(s, b, config).onAction().subscribe(f);
    });
  }
}

@Component({
  selector: 'suggestion',
  template: `
      <button>{{shownText}}</button>
   `,
  styleUrls: ['./component.scss'],
})
export class Suggestion implements OnInit {
  @Input() text: string = '';
  @Output() typewriterComplete = new EventEmitter<void>();

  shownText: string = '';

  ngOnInit() {
    this.typewriter(this.text, 0);
  }

  typewriter(str: string, index: number) {
    if (index === 0) {
      this.shownText = '';
    }
    // Remove the previous caret.
    this.shownText = (this.shownText || ' ').slice(0, -1);
    if (index < str.length) {
      // Add the new character, with a caret.
      this.shownText += str.charAt(index) + '_';
      setTimeout(() => {
        this.typewriter(str, index + 1);
      }, 50);
    } else {
      this.typewriterComplete.emit();
    }
  }
}
