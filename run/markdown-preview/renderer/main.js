// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Sample editor provides a frontend to a markdown rendering microservice.

const showdown = require('showdown');
const express = require('express')

const app = express();

const main = () => {
  app.get('/', (req, res) => {markdownHandler(req,res)})

  const port = process.env.PORT || 8080;
  app.listen(port, err => {
    if (err) console.log('Error: ', err);
    console.log('Server is listening on port ', port)
  })
}

const markdownHandler = (req, res) => {
  console.log(req.headers);

  const testMarkdown = 'this is *markdown* text';
  const converter = new showdown.Converter();
  const html = converter.makeHtml(testMarkdown)
  const fullString = testMarkdown + html;
  res.send(fullString)
}
main();