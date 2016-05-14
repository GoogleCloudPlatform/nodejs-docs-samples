## Gulp.js on Google App Engine

> [Gulp][1]: The JavaScript Task Runner.

This sample demonstrates how to use [Gulp](http://gulpjs.com/) on
[Google App Engine Managed VMs](https://cloud.google.com/appengine/docs/managed-vms/).

For more information about getting started with Gulp, see the
[Getting Started with Gulp Guide](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).

## Setup
Add the necessary modules
```sh
$ npm install
```

Run gulp build to minify css and lint javascript files
```sh
$ npm run build
```

## Running locally
Refer to the [appengine/README.md](../README.md) file for instructions on
running and deploying.


Run gulp, gulp default watches javascript and css files in src.  Run npm start to start the express server.

```sh
$ gulp
$ npm start
```
