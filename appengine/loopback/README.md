## Loopback on Google App Engine

> [Loopback](http://loopback.io/) is a highly-extensible, open-source Node.js framework.

##### Create a new Loopback app

[View the Loopback docs](http://loopback.io/getting-started/).

##### Configure

Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

##### Deploy

For convenience, you can use an npm script to run the deploy command. Modify your `package.json` to include:

```json
"scripts": {
  "start": "node .",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.
