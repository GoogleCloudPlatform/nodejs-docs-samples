# Google Cloud Endpoints sample for Node.js

This sample demonstrates how to use Google Cloud Endpoints with Node.js.

For a complete walkthrough showing how to run this sample in different
environments, see the [Google Cloud Endpoints Quickstarts](https://cloud.google.com/endpoints/docs/quickstarts).

## Running locally

### Start a local server
```
$ node server.js -p 50051
```

### Run the client
```
$ node client.js -h localhost:50051
```

## Running on Google Cloud Platform
### Setup
Make sure you have [gcloud](https://cloud.google.com/sdk/gcloud/) and [Node.js](https://nodejs.org/) installed.

To update `gcloud`, use the `gcloud components update` command.

### Deploying to Endpoints
1. Install [protoc](https://github.com/google/protobuf/#protocol-compiler-installation).

1. Compile the proto file using protoc.
```
$ protoc --include_imports --include_source_info protos/helloworld.proto --descriptor_set_out out.pb
```

1. In `api_config.yaml`, replace `MY_PROJECT_ID` with your Project ID.

1. Deploy your service's configuration to Endpoints. Take note of your service's config ID and name once the deployment completes.
```
$ gcloud service-management deploy out.pb api_config.yaml
...
Service Configuration [SERVICE_CONFIG_ID] uploaded for service [SERVICE_NAME]
```

1. Build a Docker image for later use using the following command. Make sure to replace `[YOUR_PROJECT_ID]` with your Project ID.
```
$ gcloud container builds submit --tag gcr.io/[YOUR_PROJECT_ID]/endpoints-example:1.0 .
```

### Running your service
#### Compute Engine
1. [Create](https://console.cloud.google.com/compute/instancesAdd) a Compute Engine instance. Be sure to check **Allow HTTP traffic** and **Allow HTTPS traffic** when creating the instance.

1. Once your instance is created, take note of its IP address.

Note: this IP address is _ephemeral_ by default, and may change unexpectedly. If you plan to use this instance in the future, [reserve a static IP address](https://cloud.google.com/compute/docs/configure-ip-addresses#reserve_new_static) instead.

1. SSH into your instance, and install Docker.
```
$ sudo apt-get update
$ sudo apt-get install docker.io
```

1. Using the SSH connection to your instance, initialize the required Docker images in the order specified below. Replace `[YOUR_GCLOUD_PROJECT]`, `[YOUR_SERVICE_NAME]` and `[YOUR_SERVICE_CONFIG_ID]` with your GCloud Project ID, your service's name and your service's config ID respectively.
```
$ sudo docker run -d --name=helloworld gcr.io/[YOUR_GCLOUD_PROJECT]/endpoints-example:1.0
```

```
$ sudo docker run --detach --name=esp \
    -p 80:9000 \
    --link=helloworld:helloworld \
    gcr.io/endpoints-release/endpoints-runtime:1 \
    -s [YOUR_SERVICE_NAME] \
    -v [YOUR_SERVICE_CONFIG_ID] \
    -P 9000 \
    -a grpc://helloworld:50051
```

1. On your local machine, use the client to test your Endpoints deployment. Replace `[YOUR_INSTANCE_IP_ADDRESS]` with your instance's external IP address, and `[YOUR_API_KEY]` with a [valid Google Cloud Platform API key](https://support.google.com/cloud/answer/6158862?hl=en).
```
$ node client.js -h [YOUR_INSTANCE_IP_ADDRESS]:80 -k [YOUR_API_KEY]
```

#### Container Engine
1. If you haven't already, install `kubectl`.
```
$ gcloud components install kubectl
```

1. [Create](https://console.cloud.google.com/kubernetes/add) a container cluster with the default settings. Remember the cluster's name and zone, as you will need these later.


1. Configure `kubectl` to have access to the cluster. Replace `[YOUR_CLUSTER_NAME]` and `[YOUR_CLUSTER_ZONE]` with your cluster's name and zone respectively.
```
$ gcloud container clusters get-credentials [YOUR_CLUSTER_NAME] --zone [YOUR_CLUSTER_ZONE]
```

1. Edit the `container_engine.yaml` file, and replace `GCLOUD_PROJECT`, `SERVICE_NAME`, and `SERVICE_CONFIG` with your Project ID and your Endpoints service's name and config ID respectively.

1. Add a [Kubernetes service](https://kubernetes.io/docs/user-guide/services/) to the cluster you created. Note that Kubernetes services should not be confused with [Endpoints services](https://cloud.google.com/endpoints/docs/grpc).
```
$ kubectl create -f container-engine.yaml
```

1. Get the external IP of your service. This may take a few minutes to be provisioned.
```
$ kubectl get service
```

1. Use the client to test your Endpoints deployment. Replace `[YOUR_CLUSTER_IP_ADDRESS]` with your service's external IP address, and `[YOUR_API_KEY]` with a [valid Google Cloud Platform API key](https://support.google.com/cloud/answer/6158862?hl=en).
```
$ node client.js -h [YOUR_CLUSTER_IP_ADDRESS]:80 -k [YOUR_API_KEY]
```

## Cleanup
If you do not intend to use the resources you created for this tutorial in the future, delete your [VM instances](https://console.cloud.google.com/compute/instances) and/or [container clusters](https://console.cloud.google.com/kubernetes/list) to prevent additional charges.

## Troubleshooting
If you're having issues with this tutorial, here are some things to try:
- [Check](https://console.cloud.google.com/logs/viewer) your VM instance's/cluster's logs
- Make sure your Compute Engine instance's [firewall](https://console.cloud.google.com/networking/firewalls/list) permits TCP access to port 80

If those suggestions don't solve your problem, please [let us know](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/issues) or [submit a PR](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/pulls).