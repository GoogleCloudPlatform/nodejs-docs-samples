<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Cloud Workflows Quickstart – Node.js

This sample shows how to execute a Cloud Workflow and wait for the workflow execution results.

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.

1. Deploy the workflow, `myFirstWorkflow`:

    1. Copy the YAML from this file: https://github.com/GoogleCloudPlatform/workflows-samples/blob/main/src/myFirstWorkflow.workflows.yaml
    1. Paste the YAML into a file called `myFirstWorkflow.workflows.yaml`.
    1. Run the command: `gcloud beta workflows deploy $WORKFLOW --source myFirstWorkflow.workflows.yaml`

## Run the Quickstart

1. Run the script, either with environment variables or command-line arguments:

    `node . <projectId> [cloudRegion] [workflowName]`.

    _or_

    `GOOGLE_CLOUD_PROJECT=... node .`: The Cloud project with the workflow `myFirstWorkflow`.

1. Observe the results:

    In stdout, you should see a JSON response from your workflow like the following:

    ```json
    ["Wednesday","Wednesday Night Wars","Wednesday 13","Wednesday Addams","Wednesday Campanella","Wednesdayite","Wednesday Martin","Wednesday Campanella discography","Wednesday Night Hockey (American TV program)","Wednesday Morning, 3 A.M."]
    ```

[prereq]: ../../README.md#prerequisities
