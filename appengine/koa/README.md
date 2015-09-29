# Koa -> Google App Engine

This is a simple guide to running [koa](http://koajs.com/) on Google App Engine. 

1. [Create a new Koa app](http://koajs.com/).  Start by creating an `app.js`:

```js
var koa = require('koa');
var app = koa();

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(process.env.PORT || 8080);
```

2. Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

3. Run `npm init` to initialize a `package.json`.

4. Modify your `package.json`.  Add a `start` command - take care to include the `--harmony` flag, as koa requires generators.  For convenience, you can use an npm script to run the command:

```js
"scripts": {
  "start": "node --harmony app.js",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application. 
