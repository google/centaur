import {Injectable} from '@angular/core';
import {TextGenerationResult, TextGenerationService} from './interfaces';


/** Generates text */
@Injectable({
  providedIn: 'root',
})
export class ParrotGenerationService implements TextGenerationService {
  async generateText(context: string, samplingTemp: number = -1):
      Promise<TextGenerationResult> {
    console.log('Generating - ', {context});
    console.log('Generated - ', {context});
      return {'text': [context]};
  }
}
