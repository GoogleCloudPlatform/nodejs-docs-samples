// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    // [START config]
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        jshintrc: './.jshintrc',
        globals: {
          jQuery: true
        }
      }
    },
    cssmin: {
      minify: {
        src: 'src/public/stylesheets/style.css',
        dest: 'src/public/stylesheets/style.min.css'
      }
    },
    // [END config]
    clean: ['src/public/stylesheets/style.min.css'],
    watch: {
      js: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint']
      },

      css: {
        files: ['<%= cssmin.minify.src %>'],
        tasks: ['cssmin']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // [START tasks]
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('build', ['jshint', 'cssmin']);
  // [END tasks]

  grunt.registerTask('default', ['watch']);
};
