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

'use strict';

const quickstart = require('../index');
const assert = require('assert');

const {WorkflowsClient} = require('@google-cloud/workflows');
const client = new WorkflowsClient();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION_ID = 'us-central1';
const WORKFLOW_ID = 'myFirstWorkflow';

describe('Cloud Workflows Quickstart Tests', () => {
  beforeEach(async () => {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    // Ensure project is configured
    assert.notStrictEqual(
      PROJECT_ID,
      undefined,
      'GOOGLE_CLOUD_PROJECT must be set'
    );

    /**
     * Check if the workflow exists
     */
    async function worklowExists() {
      try {
        // Try to get the workflow
        const [workflowGet] = await client.getWorkflow({
          name: client.workflowPath(projectId, LOCATION_ID, WORKFLOW_ID),
        });
        return workflowGet.state === 'ACTIVE';
      } catch (e) {
        // If there is an error getting the workflow, it probably doesn't exist.
        return false;
      }
    }

    // Create a new workflow if it doesn't exist.
    if (!(await worklowExists())) {
      await client.createWorkflow({
        parent: client.locationPath(projectId, LOCATION_ID),
        workflow: {
          name: WORKFLOW_ID,
          // Copied from:
          // https://github.com/GoogleCloudPlatform/workflows-samples/blob/main/src/myFirstWorkflow.workflows.yaml
          sourceContents:
            '# Copyright 2020 Google LLC\n#\n# Licensed under the Apache License, Version 2.0 (the "License");\n# you may not use this file except in compliance with the License.\n# You may obtain a copy of the License at\n#\n#      http://www.apache.org/licenses/LICENSE-2.0\n#\n# Unless required by applicable law or agreed to in writing, software\n# distributed under the License is distributed on an "AS IS" BASIS,\n# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n# See the License for the specific language governing permissions and\n# limitations under the License.\n\n# [START workflows_myfirstworkflow]\n- getCurrentTime:\n    call: http.get\n    args:\n      url: https://us-central1-workflowsample.cloudfunctions.net/datetime\n    result: currentTime\n- readWikipedia:\n    call: http.get\n    args:\n      url: https://en.wikipedia.org/w/api.php\n      query:\n        action: opensearch\n        search: ${currentTime.body.dayOfTheWeek}\n    result: wikiResult\n- returnResult:\n    return: ${wikiResult.body[1]}\n# [END workflows_myfirstworkflow]\n',
        },
        workflowId: WORKFLOW_ID,
      });
    }
  });

  it('should execute the quickstart', async () => {
    // Execute workflow, with long test timeout
    const result = await quickstart(PROJECT_ID, LOCATION_ID, WORKFLOW_ID);
    assert.strictEqual(
      result.length > 0,
      true,
      'Quickstart must return non-empty result'
    );
  }).timeout(5000);
});
