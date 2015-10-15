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

Modify your `package.json`.  Add a `start` command - take care to include the
`--harmony` flag, as Koa.js requires generators.

### Deploy

For convenience, you can use an npm script to run the `gcloud` command. Add
these lines to your `package.json` file:

```json
"scripts": {
  "start": "node --harmony app.js",
  "deploy": "gcloud preview app deploy app.yaml --promote --project <your-project-id>"
}
```

At the terminal you can now run the following command to deploy your
application:

```
$ npm deploy
```