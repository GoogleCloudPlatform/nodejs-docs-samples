# Brunch with ES6 running on Google App Engine.

This sample demonstrates how to use [Brunch](http://brunch.io) on
[Google App Engine Managed VMs](https://cloud.google.com/appengine).

For more information about getting started with Brunch, see the
[Getting Started with Brunch Guide](https://github.com/brunch/brunch-guide/blob/master/content/en/chapter02-getting-started.md) .

You can also view the [live demo](https://alien-lattice-123714.appspot.com) and read the full [Brunch documentation](https://github.com/brunch/brunch-guide).

## Setup
Add the necessary modules in your `package.json`:
```sh
$ npm install --save-dev express body-parser morgan
```

## Running locally
Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.

To support custom web servers an `app.js` file was added.
```sh
$ npm start
```
Will bypass the `brunch-config.js` file and use settings provided in the `app.js` file.

```sh
$ brunch watch --server
```
Will use settings provided in the `brunch-config.js` file.
