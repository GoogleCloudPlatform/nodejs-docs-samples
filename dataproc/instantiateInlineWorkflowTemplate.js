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

// This sample instantiates an inline workflow template using the client
// library for Dataproc.

// sample-metadata:
//   title: Instantiate an inline workflow template
//   usage: node instantiateInlineWorkflowTemplate.js <PROJECT_ID> <REGION>

/*eslint no-warning-comments: [0, { "terms": ["todo", "fixme"], "location": "anywhere" }]*/

async function main(projectId = 'YOUR_PROJECT_ID', region = 'YOUR_REGION') {
  // [START dataproc_instantiate_inline_workflow_template]
  const dataproc = require('@google-cloud/dataproc');

  // TODO(developer): Uncomment and set the following variables
  // projectId = 'YOUR_PROJECT_ID'
  // region = 'YOUR_REGION'

  // Create a client with the endpoint set to the desired region
  const client = new dataproc.v1.WorkflowTemplateServiceClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
    projectId: projectId,
  });

  async function instantiateInlineWorkflowTemplate() {
    // Create the formatted parent.
    const parent = client.regionPath(projectId, region);

    // Create the template
    const template = {
      jobs: [
        {
          hadoopJob: {
            mainJarFileUri:
              'file:///usr/lib/hadoop-mapreduce/hadoop-mapreduce-examples.jar',
            args: ['teragen', '1000', 'hdfs:///gen/'],
          },
          stepId: 'teragen',
        },
        {
          hadoopJob: {
            mainJarFileUri:
              'file:///usr/lib/hadoop-mapreduce/hadoop-mapreduce-examples.jar',
            args: ['terasort', 'hdfs:///gen/', 'hdfs:///sort/'],
          },
          stepId: 'terasort',
          prerequisiteStepIds: ['teragen'],
        },
      ],
      placement: {
        managedCluster: {
          clusterName: 'my-managed-cluster',
          config: {
            gceClusterConfig: {
              // Leave 'zoneUri' empty for 'Auto Zone Placement'
              // zoneUri: ''
              zoneUri: 'us-central1-a',
            },
          },
        },
      },
    };

    const request = {
      parent: parent,
      template: template,
    };

    // Submit the request to instantiate the workflow from an inline template.
    const [operation] = await client.instantiateInlineWorkflowTemplate(request);
    await operation.promise();

    // Output a success message
    console.log('Workflow ran successfully.');
    // [END dataproc_instantiate_inline_workflow_template]
  }

  instantiateInlineWorkflowTemplate();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
