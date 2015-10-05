## Sails on Google App Engine

> [Sails](http://sailsjs.org/) makes it easy to build custom, enterprise-grade Node.js apps.

##### Create a new Sails app

[View the Sails docs](http://sailsjs.org/get-started)

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
  "debug": "node debug app.js",
  "start": "node app.js",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.
