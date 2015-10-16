## Grunt on Google App Engine

> [Grunt](http://gruntjs.com/): The JavaScript Task Runner.

### Create a new app

[View the Grunt docs](http://gruntjs.com/getting-started).

### Configure

Create an `app.yaml` in the root of your application with the following
contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  NPM_CONFIG_DEV: true
  PORT: 8080
```

Run `npm install --save-dev grunt-cli` to make the Grunt command line tools
available locally during the build.

### Deploy

Modify your `package.json` to include an npm `postinstall` script.  This will
be run during your applications `npm install` phase.

For convenience, you can use an npm script to run the deploy command. Modify
your `package.json` to include:

```json
"scripts": {
  "start": "node ./src/bin/www",
  "postinstall": "./node_modules/grunt-cli/bin/grunt build",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```

The `postinstall` script causes the `grunt build` command to be executed after
the `npm install` command succeeds. This allows you to execute the build after
deployment.
