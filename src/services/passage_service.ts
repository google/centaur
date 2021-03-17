import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

import {Formula, Passage} from '../common/interfaces';

/**
 *  Coordinates passages on string indexed channels.
 *
 *  Different components use this to share a working copy of a string,
 *  usually displayed in a WrittenPage component and edited by generation,
 *  manual editing, or manual selection of generations in other components.
 *
 */
@Injectable({
  providedIn: 'root',
})
export class PassageService {
  private readonly passageSource = new Subject<Formula>();
  passage$ = this.passageSource.asObservable();

  memory = new Map<string, Formula>();

  getOrEmpty(channel: string) {
    if (this.memory.has(channel)) {
      return this.memory.get(channel)!;
    }
    return new Formula(channel, '');
  }

  setFormula(passage: Formula) {
    this.memory.set(passage.channel, passage);
    console.log('Updating Formula', passage);
    this.passageSource.next(passage);
  }

    setPassage(passage: Passage) {
        const newFormula = new Formula(passage.channel, passage.text);
    this.memory.set(passage.channel, newFormula);
    console.log('Updating Passage', passage);
    this.passageSource.next(newFormula);
  }

  setPassageText(s: string, channel: string) {
    const passage = this.getOrEmpty(channel);
    passage.text = s;
    this.setPassage(passage);
  }

  appendToPassage(s: string, channel: string) {
    const passage = this.getOrEmpty(channel);
    passage.text += ' ' + s;
    this.setPassage(passage);
  }
}
