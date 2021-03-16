import {Component, ElementRef, Input} from '@angular/core';

/**
 * Instructions modal dialog
 */
@Component({
  selector: 'instructions-dialog',
  templateUrl: 'component.ng.html',
  styleUrls: ['./component.scss'],
})
export class InstructionsDialog {
  @Input() paragraphs: string[] = [];

  constructor(private element: ElementRef) {
    this.hideMe();
  }

  show() {
    this.element.nativeElement.removeAttribute('hidden');
  }

  hideMe() {
    this.element.nativeElement.setAttribute('hidden', '');
  }
}
