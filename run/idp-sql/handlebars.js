// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const handlebars = require('handlebars');
const {readFile} = require('fs').promises;

let index, template;

/**
 * Builds and executes Handlebars.js template for rendered HTML
 *
 * @param {object} config The template config object.
 * @returns {Promise}
 */
const buildRenderedHtml = async config => {
  if (!index) index = await readFile(__dirname + '/views/index.html', 'utf8');
  if (!template) template = handlebars.compile(index);
  return template(config);
};

// Register customer Handlebars.js helper
handlebars.registerHelper('ternary', (comp1, comp2, opt1, opt2) => {
  return comp1.trim() === comp2.trim() ? opt1 : opt2;
});

module.exports = {buildRenderedHtml};
