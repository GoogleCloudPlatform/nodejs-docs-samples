<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Run Node.js Samples

[Cloud Run][run_docs] runs stateless [containers](https://cloud.google.com/containers/) on a fully managed environment or in your own GKE cluster.

## Samples

|                 Sample                  |        Description       |     Deploy    |
| --------------------------------------- | ------------------------ | ------------- |
|[Hello World][helloworld]&nbsp;&#10149;  | Quickstart | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_helloworld] |
|[System Packages][system_package]       | Use system-installed binaries in your service. | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30">][run_button_system_package] |
|[Pub/Sub][pubsub]                        | Event-driven service with a Pub/Sub push subscription | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_pubsub] |
|[Image Processing][image_processing]     | Event-driven image analysis & transformation | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_image_processing] |
|[Manual Logging][manual_logging]         | Structured logging without client library | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_manual_logging] |
|[Cloud SQL (MySQL)][mysql]               | Use MySQL with Cloud Run | - |
|[Hello Broken][hello_broken]             | Something is wrong, how do you fix it? | [<img src="https://storage.googleapis.com/cloudrun/button.svg" alt="Run on Google Cloud" height="30"/>][run_button_hello_broken] |

For more Cloud Run samples beyond Node.js, see the main list in the [Cloud Run Samples repository](https://github.com/GoogleCloudPlatform/cloud-run-samples).

## Setup

1. [Set up for Cloud Run development](https://cloud.google.com/run/docs/setup)

2. Clone this repository:

    ```
    git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git
    ```

    Note: Some samples in the list above are hosted in other repositories. They are noted with the symbol "&#10149;".


## How to run a sample locally

1. [Install docker locally](https://docs.docker.com/install/)

2. [Build the sample container](https://cloud.google.com/run/docs/building/containers#building_locally_and_pushing_using_docker):

    ```
    export SAMPLE=$sample
    cd $SAMPLE
    docker build --tag $sample .
    ```

3. [Run containers locally](https://cloud.google.com/run/docs/testing/local)

    With the built container:

    ```
    PORT=8080 && docker run --rm -p 8080:${PORT} -e PORT=${PORT} $SAMPLE
    ```

    Overriding the built container with local code:

    ```
    PORT=8080 && docker run --rm \
        -p 8080:${PORT} -e PORT=${PORT} \
        -v $PWD:/usr/src/app $SAMPLE
    ```

    Injecting your service account key:

    ```
    export SA_KEY_NAME=my-key-name-123
    PORT=8080 && docker run --rm \
        -p 8080:${PORT} -e PORT=${PORT} \
        -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/keys/${SA_KEY_NAME}.json \
        -v $GOOGLE_APPLICATION_CREDENTIALS:/tmp/keys/${SA_KEY_NAME}.json:ro \
        -v $PWD:/usr/src/app $SAMPLE
    ```

    Opening a shell in the container (e.g., updating the `package-lock.json`):

    1. Build the container.

    2. Run the container with a shell:

    ```
    PORT=8080 && docker run --rm \
        --interactive --tty \
        -p 8080:${PORT} -e PORT=${PORT} \
        -v $PWD:/usr/src/app $SAMPLE \
        /bin/bash
    ```
    3. Re-generate the `package-lock.json`:

    ```
    rm package-lock.json
    npm install
    ```

    Because we're using a read/write volume mount, the revised file will be
    written to the host's local filesystem. Once you exit the container you can
    add the file to version control.

    4. Exit the container: `Ctrl-D`

## Deploying

```
gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/${SAMPLE}
gcloud beta run deploy $SAMPLE \
  # Needed for Manual Logging sample.
  --set-env-var GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT} \
  --image gcr.io/${GOOGLE_CLOUD_PROJECT}/${SAMPLE}
```

See [Building containers][run_build] and [Deploying container images][run_deploy]
for more information.

[run_docs]: https://cloud.google.com/run/docs/
[run_build]: https://cloud.google.com/run/docs/building/containers
[run_deploy]: https://cloud.google.com/run/docs/deploying
[helloworld]: https://github.com/knative/docs/tree/master/docs/serving/samples/hello-world/helloworld-nodejs
[system_package]: system-package/
[pubsub]: pubsub/
[image_processing]: image-processing/
[manual_logging]: logging-manual/
[mysql]: ../cloud-sql/mysql/mysql
[hello_broken]: hello-broken/
[run_button_helloworld]: https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/knative/docs&cloudshell_working_dir=docs/serving/samples/hello-world/helloworld-nodejs
[run_button_system_package]: https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&cloudshell_working_dir=run/system-package
[run_button_pubsub]: https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&cloudshell_working_dir=run/pubsub
[run_button_image_processing]: https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&cloudshell_working_dir=run/image-processing
[run_button_manual_logging]: https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&cloudshell_working_dir=run/logging-manual
[run_button_hello_broken]: https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/GoogleCloudPlatform/nodejs-docs-samples&cloudshell_working_dir=run/hello-broken