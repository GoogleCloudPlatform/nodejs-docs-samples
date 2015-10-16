## Loopback on Google App Engine

> [Loopback](http://loopback.io/) is a highly-extensible, open-source Node.js framework.

You can view the deployed demo app [here](https://strongloop-demo.appspot.com).

### Create a new Loopback app

[View the Loopback docs](http://loopback.io/getting-started/).

### Configure

Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

### Deploy

For convenience, you can use an npm script to run the `gcloud` command. Add
these lines to your `package.json` file:

```json
"scripts": {
  "start": "node server/server.js",
  "deploy": "gcloud preview app deploy app.yaml --promote --project [project id]"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```