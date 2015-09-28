# Loopback -> Google App Engine

This is a simple guide to running [loopback](http://loopback.io/) on Google App Engine. 

1. [Create a new loopback app](http://loopback.io/getting-started/).  

2. Create an `app.yaml` in the root of your application with the following contents:

	```yaml
	runtime: nodejs
	vm: true
	api_version: 1
	env_variables:
  		PORT: 8080
	```

3. Create a `start` deploy script, and deploy! For convenience, you can modify your `package.json` to use an npm script for deployment:

	```js
	"scripts": {
		"start": "node .",
	    "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
	  }
	```

	At the terminal you can now run `npm run deploy` to deploy your application. 
