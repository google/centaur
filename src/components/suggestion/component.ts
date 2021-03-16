import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {CentralGenerationService} from 'google3/experimental/centaur/services/central_generation_service';  // from google3/experimental/centaur/services:central_generation_service
import {TextGenerationResult} from 'google3/experimental/centaur/services/interfaces';  // from google3/experimental/centaur/services:services
import {PassageService} from 'google3/experimental/centaur/services/passage_service';  // from google3/experimental/centaur/services:services

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
      private readonly generationService: CentralGenerationService,
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
          this.passageService.getOrEmpty(promptGeneratorPassageName);
      prompt = program.makeFewshotPrompt(inputs);
    } else {
      prompt = inputs.join('\n');
    }

    this.isGenerating = true;
    this.isComponentHidden = false;
    this.suggestions = [];

    this.generationService.generateText(prompt).then(
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
                  this.passageService.getOrEmpty(promptGeneratorPassageName);
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
  styleUrls: ['./component.css'],
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
