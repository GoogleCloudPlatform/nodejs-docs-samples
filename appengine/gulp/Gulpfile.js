var gulp = require('gulp');
var jshint = require('gulp-jshint');
var cssnano = require('gulp-cssnano');

// Lint Task
gulp.task('lint', function() {
  return gulp.src(['Gulpfile.js', 'src/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Minify CSS
gulp.task('styles', function() {
  return gulp.src('src/public/stylesheets/*.css')
    .pipe(cssnano())
    .pipe(gulp.dest('src/public/stylesheets'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['lint', 'scripts']);
  gulp.watch('src/public/stylesheets/*.css', ['styles']);
});


gulp.task('build', ['lint', 'styles']);
gulp.task('default', ['lint', 'styles', 'watch']);
