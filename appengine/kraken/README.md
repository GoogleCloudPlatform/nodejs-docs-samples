# Kraken -> Google App Engine

This is a simple guide to running [krakenjs](http://krakenjs.com/) on Google App Engine. 

1. [Create a new kraken app](http://krakenjs.com/index.html#getting-started).  

2. Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

4. Deploy! For convenience, you can modify your `package.json` to use an npm script for deployment:

```js
"scripts": {
  "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
}
```

At the terminal you can now run `npm run deploy` to deploy your application. 
