/** Text Generation result. */
export interface TextGenerationResult {
  text: string[];
  error?: string;
}

/**
    A Service that generates text given previoustext e.g. with a LM
    This base class is not intended to be used, the service should be
    provided via dependency injection at the root module.
*/
export class TextGenerationService {
  async generateText(context: string, samplingTemp: number):
    Promise<TextGenerationResult> {
      return {'text': ['error'],
              'error': 'Don\'t use the base TextGenerationService!  Inject a real one.'};
  }
}
