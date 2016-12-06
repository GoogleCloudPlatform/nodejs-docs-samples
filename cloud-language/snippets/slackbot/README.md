
# Building a Botkit-based Slack Bot that uses the GCP NL API and runs on Google Container Engine


This example shows a Slack bot built using the [Botkit](https://github.com/howdyai/botkit) library.
It runs on a Google Container Engine (Kubernetes) cluster, and uses one of the Google Cloud Platform's ML
APIs, the Natural Language (NL) API, to interact in a Slack channel.

It uses the NL API in two different ways.
First, it uses the [Google Cloud NL API](https://cloud.google.com/natural-language/) to assess
the [sentiment](https://cloud.google.com/natural-language/docs/basics) of any message posted to
the channel, and if the positive or negative magnitude of the statement is
sufficiently large, it sends a 'thumbs up' or 'thumbs down' in reaction.

Additionally, it uses the NL API to identify [entities](https://cloud.google.com/natural-language/docs/basics) in each
posted message, and tracks them in a database (using sqlite3).  Then, at any time you can query the NL slackbot to ask
it for the top N entities used in the channel.

The example uses [Google Container
Engine](https://cloud.google.com/container-engine/), a hosted version of
[Kubernetes](http://kubernetes.io), to run the bot, and uses [Google Container
Registry](https://cloud.google.com/container-registry/) to store a Docker image
for the bot.


## Setting up your environment

### Container Engine prerequisites

First, set up the Google Container Engine
[prerequisites](https://cloud.google.com/container-engine/docs/before-you-begin), including [installation of the Google Cloud SDK](https://cloud.google.com/sdk/downloads).

### NL API prerequisites

Next, enable the NL API for your project and authenticate to your service account as described [here](https://cloud.google.com/natural-language/docs/getting-started). (The service account step is not necessary when running the bot on Container Engine, but it is useful if you're testing locally).

### Create a cluster

Next,
[create a Kubernetes cluster](https://cloud.google.com/container-engine/docs/clusters/operations#creating_a_container_cluster) using Container Engine as follows:

```bash
gcloud container clusters create "slackbot-cluster" --scopes "https://www.googleapis.com/auth/cloud-platform"
```

You can name the cluster something other than "slackbot-cluster" if you like.

### Install Docker

If you do not already have [Docker](https://www.docker.com/) installed locally, follow the [installation instructions](https://docs.docker.com/engine/installation/) on the Docker site.

## Get a Slack token and invite the bot to a Slack channel

Then, create a [Slack bot user](https://api.slack.com/bot-users) and get an
authentication token.

Then, 'invite' your new bot to a channel on a Slack team.

## Running the slackbot on Kubernetes

### Upload the slackbot token to Kubernetes

We will be loading this token in our bot using
[secrets](http://kubernetes.io/v1.1/docs/user-guide/secrets.html).

Run the following script to create a secret .yaml file (replacing `MY-SLACK-TOKEN` with your token), then use that yaml file to create a secret on your Kubernetes cluster.

```bash
./generate-secret.sh MY-SLACK-TOKEN
kubectl create -f slack-token-secret.yaml
```

### Build the bot's container

We'll run the slackbot app in our Kubernetes cluster as a [Replication Controller](http://kubernetes.io/docs/user-guide/replication-controller/) with one replica.

So, first, we need to build its Docker container. Replace `my-cloud-project-id` below with your
Google Cloud Project ID. This tags the container so that gcloud can upload it to
your private Google Container Registry.

```bash
export PROJECT_ID=my-cloud-project-id
docker build -t gcr.io/${PROJECT_ID}/slack-bot .
```

Once the build completes, upload it to the Google Container registry:

```bash
gcloud docker -- push gcr.io/${PROJECT_ID}/slack-bot
```


### Running the container

First, create a Replication Controller configuration, populated with your Google
Cloud Project ID, so that Kubernetes knows where to find the Docker image.

```bash
./generate-rc.sh $PROJECT_ID
```

Now, tell Kubernetes to create the bot's replication controller.  This will launch 1 pod replica running the bot.

```bash
kubectl create -f slack-bot-rc.yaml
```

You can check the status of your bot with:

```bash
kubectl get pods
```

Now your bot should be online.  As a sanity check, check that it responds to a "Hello" message directed to it.

Note: if you have forgotten to create the secret first, the pod won't come up successfully.

## Running the bot locally

If you want, you can run your slackbot locally instead.  This is handy if
you've made some changes and want to test them out before redeploying.  To do
this, first run:

```bash
npm install
```

Then, set GCLOUD_PROJECT to your project id:

```bash
export GCLOUD_PROJECT=my-cloud-project-id
```

Then, create a file containing your Slack token, and point 'SLACK_TOKEN_PATH' to that file when you run the script
(substitute 'my-slack-token with your actual token):

    echo my-slack-token > slack-token
    SLACK_TOKEN_PATH=./slack-token node demo_bot.js

## Using the Bot

Once you've confirmed the bot is running, you can start putting it through its paces.

### Sentiment Analysis

The slackbot will give a 'thumbs up' or 'thumbs down' if it thinks a message is above a certain magnitude in positive or negative sentiment.

E.g., try posting this message to the channel (you don't need to explicitly mention the bot in this message):

```
I hate bananas.
```

You should see that bot give a thumbs down in reply, indicatig that the NL API
reported negative sentiment for this sentence. Next, try:

```
I love coffee.
```

This should generate a thumbs up.  Posted text won't get a reply from the bot
unless the magnitude of the sentiment is above a given threshold, 30 by
default.  E.g., with a neutral statement like `The temperature is seventy
degrees.` the bot is unlikely to give a response.

### Entity Analysis

For every message posted to the channel, the bot-- behind the scenes-- is
analyzing and storing information about the entities it detects.  At any time
you can query the bot to get the current N most frequent entities, where N is
20 by default.  It will be more interesting if you wait until a few messages
have been posted to the channel, so that the bot has the chance to identify
and log some entities.

E.g., suppose your bot is called `nlpbot`.
To see the top entities, send it this message:

```
@nlpbot top entities
```


## Shutting down

To shutdown your bot, we tell Kubernetes to delete the replication controller.

```bash
kubectl delete -f slack-bot-rc.yaml
```


## Cleanup

If you have created a container cluster, you may still get charged for the
Google Compute Engine resources it is using, even if they are idle. To delete
the cluster, run:

```bash
gcloud container clusters delete slackbot-cluster
```

(If you used a different name for your cluster, substitute that name for `slackbot-cluster`.)
This deletes the Google Compute Engine instances that are running the cluster.

