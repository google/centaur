/** Text Generation result. */
export interface TextGenerationResult {
  text: string[];
  error?: string;
}

/** A Service that generates text given previoustext e.g. with a LM */
export interface TextGenerationService {
  generateText(context: string, samplingTemp: number):
      Promise<TextGenerationResult>;
}
