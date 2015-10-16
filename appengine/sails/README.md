## Sails on Google App Engine

> [Sails](http://sailsjs.org/) makes it easy to build custom, enterprise-grade Node.js apps.

### Create a new Sails app

[View the Sails docs](http://sailsjs.org/get-started)

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
  "debug": "node debug app.js",
  "start": "node app.js",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```