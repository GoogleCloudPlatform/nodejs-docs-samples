## Grunt on Google App Engine

> [Grunt](http://gruntjs.com/): The JavaScript Task Runner.

##### Create a new app

[View the Grunt docs](http://gruntjs.com/getting-started).

##### Configure

Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

Run `npm install --save-dev grunt-cli` to make the Grunt command line tools available locally during the build. 

##### Deploy

Modify your `package.json` to include an npm `postinstall` script.  This will be run during your applications `npm install` phase.

For convenience, you can use an npm script to run the deploy command. Modify your `package.json` to include:

```json
"scripts": {
  "start": "node ./src/bin/www",
  "postinstall": "./node_modules/grunt-cli/bin/grunt build",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project gruntjs-demo",
  "browse": "open http://gruntjs-demo.appspot.com"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.
