'use strict';

var path = require('path');

module.exports = function dustjs(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-dustjs');

	// Options
	return {
	    build: {
	        files: [
	            {
	                expand: true,
            
                    cwd: 'public/templates/',
            
	                src: '**/*.dust',
	                dest: '.build/templates',
	                ext: '.js'
	            }
	        ],
	        options: {
            
                fullname: function (filepath) {
                    return path.relative('public/templates/', filepath).replace(/[.]dust$/, '');
                }
            
	        }
	    }
	};
};
