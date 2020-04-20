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
const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.send('works')

  // console.log('req.headers in renderer: ', req.headers);
  // console.log('req.params in renderer: ', req.params);
  // console.log('req.body in renderer: ', req.body);
  // const markdown = req.body;
  // const converter = new showdown.Converter();
  // const html = converter.makeHtml(markdown)
  // res.send(html)
})

app.post('/', (req, res) => {
  console.log('req.headers in renderer: ', req.headers);
  console.log('req.params in renderer: ', req.params);
  console.log('req.body in renderer: ', req.body);
  const markdown = req.body;
  console.log(markdown);
  const converter = new showdown.Converter();
  const html = converter.makeHtml(markdown)
  res.send(html)
})

const port = process.env.PORT || 8080;

app.listen(port, err => {
  if (err) console.log('Error: ', err);
  console.log('Server is listening on port ', port)
})
