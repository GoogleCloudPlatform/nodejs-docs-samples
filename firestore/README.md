[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Cloud Firestore: Node.js Samples](https://github.com/googleapis/nodejs-firestore)

[![Open in Cloud Shell][shell_img]][shell_link]

This is the Node.js Server SDK for [Google Cloud Firestore](https://firebase.google.com/docs/firestore/). Google Cloud Firestore is a NoSQL document database built for automatic scaling, high performance, and ease of application development.

This Cloud Firestore Server SDK uses Google’s Cloud Identity and Access Management for authentication and should only be used in trusted environments. Your Cloud Identity credentials allow you bypass all access restrictions and provide read and write access to all data in your Cloud Firestore project.

The Cloud Firestore Server SDKs are designed to manage the full set of data in your Cloud Firestore project and work best with reliable network connectivity. Data operations performed via these SDKs directly access the Cloud Firestore backend and all document reads and writes are optimized for high throughput.

Applications that use Google&#x27;s Server SDKs should not be used in end-user environments, such as on phones or on publicly hosted websites. If you are developing a Web or Node.js application that accesses Cloud Firestore on behalf of end users, use the firebase Client SDK.

**Note:** This Cloud Firestore Server SDK does not support Firestore databases created in [Datastore mode](https://cloud.google.com/datastore/docs/firestore-or-datastore#in_datastore_mode). To access these databases, use the [Datastore SDK](https://www.npmjs.com/package/@google-cloud/datastore).

## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
  * [Limit-to-last-query](#limit-to-last-query)
  * [Pipelines-quickstart](#pipelines-quickstart)
  * [Quickstart](#quickstart)
  * [Solution-counters](#solution-counters)

## Before you begin

Before running the samples, make sure you've followed the steps outlined in
[Using the client library](https://github.com/googleapis/nodejs-firestore#using-the-client-library).

`cd samples`

`npm install`

`cd ..`

## Samples



### Limit-to-last-query

View the [source code](https://github.com/googleapis/nodejs-firestore/blob/main/samples/limit-to-last-query.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-firestore&page=editor&open_in_editor=samples/limit-to-last-query.js,samples/README.md)

__Usage:__


`node samples/limit-to-last-query.js`


-----




### Pipelines-quickstart

View the [source code](https://github.com/googleapis/nodejs-firestore/blob/main/samples/pipelines-quickstart.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-firestore&page=editor&open_in_editor=samples/pipelines-quickstart.js,samples/README.md)

__Usage:__


`node samples/pipelines-quickstart.js`


-----




### Quickstart

View the [source code](https://github.com/googleapis/nodejs-firestore/blob/main/samples/quickstart.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-firestore&page=editor&open_in_editor=samples/quickstart.js,samples/README.md)

__Usage:__


`node samples/quickstart.js`


-----




### Solution-counters

View the [source code](https://github.com/googleapis/nodejs-firestore/blob/main/samples/solution-counters.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-firestore&page=editor&open_in_editor=samples/solution-counters.js,samples/README.md)

__Usage:__


`node samples/solution-counters.js`






[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-firestore&page=editor&open_in_editor=samples/README.md
[product-docs]: https://cloud.google.com/firestore
