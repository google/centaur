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

import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Formula, Passage} from '../../common/interfaces';
import {SuggestionPanel} from '../../components/suggestion/component';
import {PassageService} from '../../services/passage_service';
import {ThemeService} from '../../services/theme_service';

// tslint:disable:no-any this is my reasoning

const SPINE_FORMULA =
    `{"data":[{"inputs":["I was feeling hungry.\\nI went to the store.\\nI looked through the shelves.\\nI saw a sandwich that looked delicious."],"outputs":["I bought a sandwich."]},{"inputs":["The man was walking through a forest.\\nHe was a long way from home.\\nIt was getting dark.\\nHe needed to find someplace to stay the night."],"outputs":["He found a place to make a fire and set up camp."]},{"inputs":["John, Jack, and Jill walked in to a bar.\\nThey sat down at the bar.\\nThe bartender flirted with Jack.\\nJack was not interested."],"outputs":["They ordered three drinks."]},{"inputs":["The man was starving.\\nHe hadn't eaten in two days.\\nHe wandered down the road.\\nHis stomach was growling.\\nHe was very tired."],"outputs":["The man came across a restaurant."]},{"inputs":["The officer got an emergency call on his radio.\\nHe sped down the highway.\\nHe took exit number 203.\\nHe pulled over into the McDonalds parking lot.\\nThe police officer stopped his car.\\nHe jumped out."],"outputs":["He gave chase on foot and finally caught the criminal."]},{"inputs":["It had been a long day at the office.\\nShe got in her car and drove home.\\nAlong the way, she noticed that a storm was coming.\\nIt began to rain.\\nShe got home and parked in the garage.\\nThe woman was on her way to bed."],"outputs":["She brushed her teeth and climbed into bed."]}],"serialization":{"inputMarkers":["\\n\\nHere's the background story:\\n"],"splitMarker":"\\nOk so now let me tell you what happened next:\\n","outputMarkers":[""],"endMarker":"\\nOk, let me tell you a different story.\\n"}}`;

const COLOR_FORMULA =
    `{"data":[{"inputs":["The TV remote was out of batteries, and he wasn't about to miss the game, so he decided to step out and pick some up.","Mike went to the store."],"outputs":["Mike strolled down the street whistling a quick tune on his way to the store."]},{"inputs":["I was cleaning my room and although I was afraid of touching something gross, I reached under the bed.","I found a dollar under the bed."],"outputs":["Reaching down underneath the bed, I felt the familiar feeling of a dollar bill!"]},{"inputs":["Billy got a bike for his 11th birthday.  He rode it every day and when he turned 16 he started to compete professionally! ","Billy won a bike race."],"outputs":["Billy's training really paid off when he won his first bike race!"]},{"inputs":["It has been one week now without wind.","The wind picked up."],"outputs":["Suddenly, Erren felt the tug of the sails fill with a mighty burst of wind!"]},{"inputs":["In his old age, Eric spent more and more of his evenings out on the porch.","He watched the sun set."],"outputs":["As the sun set, he reflected on what the day had been like."]}],"serialization":{"inputMarkers":["","\\n\\nWhat happened next?\\n\\n"],"splitMarker":"  \\n\\nTo be more specific,\\n\\n","outputMarkers":[""],"endMarker":"\\n\\nBreak between stories.\\n\\n"}}`;

interface SpineSegment {
  bone: string;
  meat: string;
}

@Component({
  selector: 'component',
  templateUrl: './component.ng.html',
  styleUrls: ['./component.scss'],
})
export class StorySpinePage implements AfterViewInit {
  @ViewChild('suggestions') suggestions!: SuggestionPanel;

  spineFormula: Formula;
  colorFormula: Formula;
  spine: SpineSegment[] =
      [{'bone': 'It was raining in the city by the bay.', 'meat': ''}];

  generating: string|number|null = null;
  generatingIndex = 0;

  constructor(
      readonly themeService: ThemeService,
      private readonly passageService: PassageService,
  ) {
    this.themeService.cycleTheme();
    this.themeService.cycleTheme();

    // The first argument to the constructor is the "channel" for that
    // passage, which is its key to be synchronized between components.
    this.spineFormula = new Formula('spine', '');
    this.spineFormula.readSerializedForSave(SPINE_FORMULA);
    this.passageService.setFormula(this.spineFormula);

    this.colorFormula = new Formula('color', '');
    this.colorFormula.readSerializedForSave(COLOR_FORMULA);
    this.passageService.setFormula(this.colorFormula);
  }

  async ngAfterViewInit() {
    console.log('Initializing');
  }

  addSpine() {
    this.generating = 'bone';
    const prev = [];

    for (let i = 0; i < 5; ++i) {
      const idx = this.spine.length - 1 - i;
      if (idx < 0) {
        break;
      } else {
        prev.unshift(this.spine[idx]['bone']);
      }
    }

    this.suggestions!.fillWithSuggestions([prev.join('\n')], 'spine', 5, () => {
      return true;
    } /** no-op filter */);
  }

  cutSpine(index: number) {
    this.spine.splice(index, this.spine.length - index);
    this.spine = [...this.spine];
  }

  addMeat(index: number) {
    if (this.generating) {
      return;
    }
    this.generating = 'meat';
    this.generatingIndex = index;

    const prev = [];
    for (let i = 0; i < index; ++i) {
      prev.push(this.spine[i]['meat']);
    }

    this.suggestions!.fillWithSuggestions(
        [prev.join(' '), this.spine[index]['bone']], 'color', 3, () => {
          return true;
        } /** no-op filter */);
  }

  handleSuggestion(s: string) {
    if (this.generating === 'bone') {
      this.spine.push({
        'bone': s,
        'meat': '',
      });
    } else if (this.generating === 'meat') {
      this.spine[this.generatingIndex]['meat'] = s;
      for (let i = this.generatingIndex + 1; i < this.spine.length; ++i) {
        this.spine[i]['meat'] = '';
      }
    }
    this.generating = null;
  }

  checkMeatAt(idx: number) {
    return idx < 0 || this.spine[idx]['meat'].length > 0;
  }
}
