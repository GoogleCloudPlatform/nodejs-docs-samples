# Node.js websockets sample for Google App Engine

This sample demonstrates how to use websockets on
[Google App Engine Flexible Environment](https://cloud.google.com/appengine) with Node.js.

__Note:__ Secure WebSockets are currently not supported by App Engine Flexible Environment.
WebSockets will only work if you load your page over HTTP (not HTTPS).

To use Secure WebSockets now, you can launch a VM on Google Compute Engine using
a custom image where you have added SSL support for WebSockets.

Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

## Setup

Before you can run or deploy the sample, you will need to create a new firewall
rule to allow traffic on port 65080. This port will be used for websocket
connections. You can do this with the
[Google Cloud SDK](https://cloud.google.com/sdk) with the following command:

    gcloud compute firewall-rules create default-allow-websockets \
      --allow tcp:65080 \
      --target-tags websocket \
      --description "Allow websocket traffic on port 65080"
