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

import {WorkflowsClient} from '@google-cloud/workflows';
import * as assert from 'assert';
import * as cp from 'child_process';
import {before, beforeEach, describe, it} from 'mocha';

const client: WorkflowsClient = new WorkflowsClient();
const execSync = (cmd: string) => cp.execSync(cmd, {encoding: 'utf-8'});

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT as string;
const LOCATION_ID = 'us-central1';
const WORKFLOW_ID = 'myFirstWorkflow';
const SEARCH_TERM = 'cloud';

describe('Cloud Workflows Quickstart Tests', () => {
  before(async () => {
    // Ensure project is configured
    assert.notStrictEqual(
      PROJECT_ID,
      undefined,
      'GOOGLE_CLOUD_PROJECT must be set'
    );
  });

  beforeEach(async () => {
    /**
     * Check if the workflow exists
     */
    async function workflowExists() {
      try {
        // Try to get the workflow
        const [workflowGet] = await client.getWorkflow({
          name: client.workflowPath(PROJECT_ID, LOCATION_ID, WORKFLOW_ID),
        });
        return workflowGet.state === 'ACTIVE';
      } catch {
        // If there is an error getting the workflow, it probably doesn't exist.
        return false;
      }
    }

    // Create a new workflow if it doesn't exist.
    if (!(await workflowExists())) {
      await client.createWorkflow({
        parent: client.locationPath(PROJECT_ID, LOCATION_ID),
        workflow: {
          name: WORKFLOW_ID,
          // Copied from:
          // https://github.com/GoogleCloudPlatform/workflows-samples/blob/main/src/myFirstWorkflow.workflows.yaml
          sourceContents:
            '# Copyright 2020 Google LLC\n#\n# Licensed under the Apache License, Version 2.0 (the "License");\n# you may not use this file except in compliance with the License.\n# You may obtain a copy of the License at\n#\n#      http://www.apache.org/licenses/LICENSE-2.0\n#\n# Unless required by applicable law or agreed to in writing, software\n# distributed under the License is distributed on an "AS IS" BASIS,\n# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n# See the License for the specific language governing permissions and\n# limitations under the License.\n\n- getCurrentTime:\n    call: http.get\n    args:\n      url: https://timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam\n    result: currentTime\n- readWikipedia:\n    call: http.get\n    args:\n      url: https://en.wikipedia.org/w/api.php\n      query:\n        action: opensearch\n        search: ${currentTime.body.dayOfWeek}\n    result: wikiResult\n- returnResult:\n    return: ${wikiResult.body[1]}\n',
        },
        workflowId: WORKFLOW_ID,
      });
    }
  });

  it('should execute the quickstart without optional search term', async () => {
    // Execute workflow, with long test timeout
    const result = execSync(
      `node --loader ts-node/esm ./index.ts ${PROJECT_ID} ${LOCATION_ID} ${WORKFLOW_ID}`
    );

    assert.strictEqual(
      result.length > 0,
      true,
      'Quickstart must return non-empty result'
    );
  }).timeout(5000);

  it('should execute the quickstart with optional search term', async () => {
    // Execute workflow, with long test timeout
    const result = execSync(
      `node --loader ts-node/esm ./index.ts ${PROJECT_ID} ${LOCATION_ID} ${WORKFLOW_ID} ${SEARCH_TERM}`
    );

    assert.strictEqual(
      result.length > 0,
      true,
      'Quickstart must return non-empty result'
    );
  }).timeout(5000);
});
