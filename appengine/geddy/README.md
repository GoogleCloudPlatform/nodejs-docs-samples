# Geddy -> Google App Engine

This is a simple guide to running [geddy](http://geddyjs.org/) on Google App Engine.  

1. [Create a new geddy app](http://geddyjs.org/tutorial).

2. Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

3. Create a `server.js` that contains the following code:

```js
var geddy = require('geddy');

geddy.start({
  port: process.env.PORT || '3000'
});
```

4. Run `npm install --save geddy`

5. Deploy! For convenience, you can modify your `package.json` to use an npm script for deployment:

```js
"scripts": {
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application. 
