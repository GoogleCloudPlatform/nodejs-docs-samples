<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Translate API Node.js Samples

With the [Google Translate API][translate_docs], you can dynamically translate
text between thousands of language pairs.

[translate_docs]: https://cloud.google.com/translate/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Translate](#translate)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Translate

View the [documentation][translate_docs] or the [source code][translate_code].

__Usage:__ `node translate --help`

```
Commands:
  detect <text>     Detect the language of the provided text
  list              List available translation languages.
  translate <text>  Translate the provided text to the target language.

Options:
  --help     Show help                                                 [boolean]
  --key, -k                                                  [string] [required]

Examples:
  node translate detect "Hello world!"      Detect the language of "Hello
                                            world!".
  node translate list                       List available translation
                                            languages.
  node translate translate --to ru "Good    Translate "Good morning!" to
  morning!"                                 Russian, auto-detecting English.
  node translate translate --key            Translate "Good morning!" to Russian
  asdfqwerzxcv --to ru --from en "Good      from English.
  morning!"

For more information, see https://cloud.google.com/translate/docs
```

[translate_docs]: https://cloud.google.com/translate/docs
[translate_code]: translate.js
