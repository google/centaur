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

import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {Passage} from '../../common/interfaces';
import {PassageService} from '../../services/passage_service';

/**
 * Repesents a written passage
 *
 * The passage is (usually) connected to a channel, which is synchronized
 * between components by the PassageService.
 *
 * If the channel is set to null, the Page is not connected to the passage
 * service.
 */
@Component({
  selector: 'written-page',
  templateUrl: 'component.ng.html',
  styleUrls: ['./component.scss'],
})
export class WrittenPage implements AfterViewInit, OnChanges {
  @Input() enabled = true;
  @Output() keyup = new EventEmitter<KeyboardEvent>();
  @ViewChild('pb_textarea') textbox!: ElementRef;

  @Input() channel: string|null = 'main';

  constructor(
      private readonly passageService: PassageService,
  ) {
    if (this.channel) {
      this.passageService.passage$.subscribe(passage => {
        if (passage.channel === this.channel) {
          this.updateContentFromPassage(passage);
        }
      });
    }
  }

  ngAfterViewInit() {
    if (this.channel) {
      this.updateContentFromPassage(
          this.passageService.getOrEmpty(this.channel));
    }
  }

  inputOnKey(event: KeyboardEvent) {
    if (this.channel) {
      const content = this.textbox.nativeElement.innerText;
      const page = this.passageService.getOrEmpty(this.channel);
      page['text'] = content;
      page['useRaw'] = true;
    }
    this.keyup.emit(event);
  }

  setText(s: string) {
    this.textbox.nativeElement.innerText = s;
  }

  getText() {
    return this.textbox.nativeElement.innerText;
  }

  updateContentFromPassage(passage: Passage) {
    if (this.textbox) {
      if (this.textbox.nativeElement.innerText !== passage.text) {
        this.textbox.nativeElement.innerText = passage.text;
      }
    }
  }

  disable() {
    this.textbox.nativeElement.setAttribute('disabled', '');
  }

  enable() {
    this.textbox.nativeElement.removeAttribute('disabled');
  }

  ngOnChanges() {
    if (this.textbox) {
      if (this.enabled) {
        this.enable();
      } else {
        this.disable();
      }
    }
  }
}
