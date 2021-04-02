# Story Centaur

A Human Computer Interface for few shot learning aimed at creative writers.

In order to use the OpenAI GPT-X models, which this is set up to do by default,
you will need to provide the url you want to call and your API key.  You can 
do this by creating a file in src/environments/ called environments.ts, and in it
define a variable like this

export const environment = {
    OPEN_AI_KEY:----,
    OPEN_AI_URL:----,
  };

with the ----'s filled in with the right values.

To run this tool locally, just clone the repo and run "npm install" followed by "ng serve".
If you don't have angular installed, you'll need to run "npm install -g @angular/cli" first.
