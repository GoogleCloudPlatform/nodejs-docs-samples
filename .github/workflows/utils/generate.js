// Copyright 2021 Google LLC
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

const nunjucks = require('nunjucks');
const {program, Option} = require('commander');
const fs = require('fs').promises;

// Three templates:
//   standard: most samples use this workflow
//   matrix: uses GitHub Actions matrix feature to run different permutations of the same workflow
//   secrets: samples that use secrets to populate environment variables
const templates = {
  standard: 'utils/ci.yaml.njk',
  matrix: 'utils/ci-matrix.yaml.njk',
  secrets: 'utils/ci-secrets.yaml.njk',
};
const workflow_files = {
  standard: './workflows.json',
  matrix: './workflows-matrix.json',
  secrets: './workflows-secrets.json',
};
const workflows_dir = '.github/workflows';

async function main() {
  nunjucks.configure(workflows_dir, {autoescape: true});

  program
    .addOption(
      new Option('-t, --type <template>', 'standard, matrix, or secrets')
        .choices(['standard', 'matrix', 'secrets'])
        .default('standard')
    )
    .addOption(
      new Option(
        '-s, --sample [directory]',
        '(optional) specific sample workflow to generate, e.g. scheduler'
      )
    );

  program.parse();
  program.showHelpAfterError();
  const options = program.opts();

  const workflows = require(workflow_files[options.type]);
  for (const workflow of workflows) {
    // Only generate the workflow the user has specified with the -s option
    // If unspecified, generate all workflows
    if (options.sample === undefined || options.sample === workflow) {
      const path = workflow;
      const name = workflow.split('/').join('-');
      const suite = name.split('-').join('_');
      const data = nunjucks.render(templates[options.type], {
        path,
        name,
        suite,
      });
      await fs.writeFile(`${workflows_dir}/${name}.yaml`, data);
    }
  }
}

main();
