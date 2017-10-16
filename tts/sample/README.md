# Text to Speech (TTS)

This sample lets you synthesize text into speech.

# Setup

Install the NodeJS module dependencies.

   npm install

## Usage

Create application service credentials for a Google Cloud Project with the
text to speech API enabled.

Configure your service account credentials:

   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service.json

or

   set GOOGLE_APPLICATION_CREDENTIALS=c:\Users\name\Downloads\service.json

Run the sample with node:

   node speak.js

Commands:
  list-voices <lang> <gender>     List the voices available for speech synthesis.
  synthesize <text>               Synthesizes the text passed to the sample app.
  synthesize-ssml <ssml>          Synthesizes the SSML passed to the sample app.
  synthesize-file <filepath>      Synthesizes the text in the file passed to the sample app.
  synthesize-ssmlFile <filepath>  Synthesizes the SSML in the file passed to the sample app.

Options:
  --help  Show help               [boolean]

Examples:
  node speak.js list-voices "" ""
  node speak.js synthesize "Take me to your leader."
  node speak.js synthesize-ssml "<?xml version=\"1.0\"?> \
  <speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" \
  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" \
  xsi:schemaLocation=\"http://www.w3.org/2001/10/synthesis \
  http://www.w3.org/TR/speech-synthesis/synthesis.xsd\" xml:lang=\"en-US\"> \
  Hello there. \
  </speak>"
  node speak.js synthesize-file resources/text.txt
  node speak.js synthesize-ssmlFile resources/ssml.xml

For more information, see https://cloud.google.com/tts/docs
