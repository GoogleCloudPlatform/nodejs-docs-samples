# Hapi -> Google App Engine

This is a simple guide to running [hapijs](http://hapijs.com/) on Google App Engine. 

1. [Create a new Hapi app](http://hapijs.com/)

2. Update `package.json` to add an `npm start` command:

	```js
	"scripts": {
		"start": "node index.js",
	},
	```

3. Update the port in `index.js` to use `process.env.PORT || 8080`, and `0.0.0.0`:

	```js
	server.connection({ 
	    host: '0.0.0.0', 
	    port: process.env.PORT || 8080
	});
	```

4. Create an `app.yaml` in the root of your application with the following contents:

	```yaml
	runtime: nodejs
	vm: true
	api_version: 1
	```

5. Deploy your app. For convenience, you can use an npm script to run the command. Modify your `package.json` to include:

	```js
	"scripts": {
		"start": "node index.js",
	    "deploy": "gcloud preview app deploy app.yaml --set-default --project [project id]"
	  }
	```

	At the terminal you can now run `npm run deploy` to deploy your application. 
