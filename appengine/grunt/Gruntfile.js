module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
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

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['jshint', 'cssmin']);
  grunt.registerTask('default', ['watch']);
};