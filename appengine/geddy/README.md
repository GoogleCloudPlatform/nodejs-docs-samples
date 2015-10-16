## Geddy on Google App Engine

> [Geddy](http://geddyjs.org/) is a simple, structured web framework for Node.

You can view the deployed demo app [here](https://geddy-demo.appspot.com).

### Create a new Geddy app

[View the Geddy tutorial](http://geddyjs.org/tutorial).

### Configure

Create an `app.yaml` in the root of your application with the following
contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

### Prepare the app

If you haven't already, install the Geddy CLI:

```
$ npm install -g geddy
```

Create a `config/secrets.json` file:

```
$ echo "{}" > config/secrets.json
```

Generate an app secret:

```
$ geddy gen secret
```

### Deploy

For convenience, you can use an npm script to run the `gcloud` command. Add
these lines to your `package.json` file:

```json
"scripts": {
  "start": "node node_modules/geddy/bin/cli.js",
  "debug": "node node_modules/geddy/bin/cli.js --debug",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```