## Koa on Google App Engine

> [koa](http://koajs.com) is a next generation web framework for node.js

### Create a new Koa app

[View the Koa docs](http://koajs.com/).

Start by creating an `app.js`:

```js
var koa = require('koa');
var app = koa();

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(process.env.PORT || 8080);
```

### Configure

Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

### Prepare the app

Run `npm init` to initialize a `package.json`.

Modify your `package.json`.  Add a `start` command - take care to include the `--harmony` flag, as koa requires generators.

### Deploy

For convenience, you can use an npm script to run the deploy command. Modify your `package.json` to include:

```json
"scripts": {
  "start": "node --harmony app.js",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application.