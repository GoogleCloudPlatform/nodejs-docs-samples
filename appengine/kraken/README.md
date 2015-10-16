## Kraken on Google App Engine

> [Kraken](http://krakenjs.com) is a secure and scalable layer that extends express by providing structure and convention.

### Create a new Kraken app

[View the Kraken docs](http://krakenjs.com/index.html#getting-started).

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
  "start": "server.js",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```