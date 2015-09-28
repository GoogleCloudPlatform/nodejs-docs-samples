# Grunt -> Google App Engine

This is a simple guide to using [grunt](http://gruntjs.com/) with Google App Engine. 

1. Follow the [grunt getting started guide](http://gruntjs.com/getting-started) to get up and runnning. 

2. Create an `app.yaml` in the root of your application with the following contents:

```yaml
runtime: nodejs
vm: true
api_version: 1
env_variables:
  PORT: 8080
```

3. Run `npm install --save-dev grunt-cli` to make the Grunt command line tools available locally during the build. 

4. Modify your `package.json` to include an npm `postinstall` script.  This will be run during your applications `npm install` phase. For convenience, you can use an npm script to deploy as well:

```js
"scripts": {
  "start": "node ./src/bin/www",
  "postinstall": "./node_modules/grunt-cli/bin/grunt build",
  "deploy": "gcloud preview app deploy app.yaml --set-default --project gruntjs-demo",
  "browse": "open http://gruntjs-demo.appspot.com"
},
```

At the terminal you can now run `npm run deploy` to deploy your application. 
