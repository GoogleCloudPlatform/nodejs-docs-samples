# Sails -> Google App Engine

This is a simple guide to running [sails](http://sailsjs.com/) on Google App Engine. 

1. [Create a new sailsjs app](http://sailsjs.org/get-started)

2. Create an `app.yaml` in the root of your application with the following contents:

	```yaml
	runtime: nodejs
	vm: true
	api_version: 1
	env_variables:
  		PORT: 8080
	```

3. Deploy your app. For convenience, you can use an npm script to run the command. Modify your `package.json` to include:

	```js
	"scripts": {
    	"debug": "node debug app.js",
    	"start": "node app.js",
    	"deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
  	},
	```

	At the terminal you can now run `npm run deploy` to deploy your application. 
