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
