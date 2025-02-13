/*
 Copyright 2025 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const PROJECT_ID = 'long-door-651';

export default function setupVars({core, setup}) {
  const env = {
    GOOGLE_SAMPLES_PROJECT: PROJECT_ID,
    PROJECT_ID: PROJECT_ID,
    ...(setup.env || {}),
  };
  for (const key in env) {
    console.log(`${key}: ${env[key]}`);
    core.exportVariable(key, env[key]);
  }
  return {
    env: env,
    secrets: Object.keys(setup.secrets || {})
      .map(key => `${key}:${setup.secrets[key]}`)
      .join('\n'),
  };
}
