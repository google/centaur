import { environment } from './../environments/environments';
import {Injectable} from '@angular/core';
import {TextGenerationResult, TextGenerationService} from './interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const OPEN_AI_AUTH = `Bearer ${environment.OPEN_AI_KEY}`;
const NUMBER_OF_SAMPLES = 16;
const SAMPLING_TEMP = .4;
const MAX_GENERATION_TOKENS = 256;

 /** Generates text using OpenAI's API*/
 @Injectable({
   providedIn: 'root',
 })
 export class OpenAIGenerationService implements TextGenerationService {

    constructor(private http: HttpClient) { }
    
   async generateText(context: string, samplingTemp: number = -1):
       Promise<TextGenerationResult> {

     console.log('Generating - ', {context});

     const req = {
          prompt: context,
          echo: true,
          model: undefined,
          logit_bias: undefined,
          stop: '',
          user: 'story-centaur',
          n: NUMBER_OF_SAMPLES,
          temperature: SAMPLING_TEMP,
          frequency_penalty: undefined,
          presence_penalty: undefined,
          max_tokens: MAX_GENERATION_TOKENS,
          completion_config: undefined,
        };

    
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json',
            Authorization: OPEN_AI_AUTH,
        })
    };

    const result : any = await this.http.post(environment.OPEN_AI_URL, req, httpOptions).toPromise();

    const generated : string[] = result.choices.length > 0 ? result.choices.map(x => {
        return x.text.substring(context.length);  
    }) : [''];

    console.log('Generated - ', {generated});

    return {'text': generated};
   }
 }
 