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

export default function setupVars({project_id, core, setup}, runId = null) {
  const vars = {
    PROJECT_ID: project_id,
    RUN_ID: runId || uniqueId(),
    ...(setup.env || {}),
  };
  const env = Object.fromEntries(
    Object.keys(vars).map(key => [key, substituteVars(vars[key], vars)])
  );
  if (env) {
    console.log('env:');
  }
  for (const key in env) {
    const value = env[key];
    console.log(`  ${key}: ${value}`);
    core.exportVariable(key, value);
  }
  if (setup.secrets) {
    console.log('secrets:');
  }
  for (const key in setup.secrets || {}) {
    // This is the Google Cloud Secret Manager secret ID, so it's ok to show.
    console.log(`  ${key}: ${setup.secrets[key]}`);
  }
  return {
    env: env,
    secrets: Object.keys(setup.secrets || {})
      .map(key => `${key}:${setup.secrets[key]}`)
      .join('\n'),
  };
}

export function substituteVars(value, env) {
  for (const key in env) {
    let re = new RegExp(`\\$(${key}\\b|\\{\\s*${key}\\s*\\})`, 'g');
    value = value.replaceAll(re, env[key]);
  }
  return value;
}

export function uniqueId(length = 6) {
  const min = 2 ** 32;
  const max = 2 ** 64;
  return Math.floor(Math.random() * max + min)
    .toString(36)
    .slice(0, length);
}
