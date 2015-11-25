var gulp = require('gulp');
var sequence = require('gulp-sequence');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');
var codacy = require('./');

gulp.task('lint', function lint() {
  return gulp
    .src(['index.js', 'gulpfile.js', 'test/**/*.test.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
  ;
});

gulp.task('test.instrument', function testInstrument() {
  return gulp
    .src(['index.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
  ;
});

gulp.task('test', ['test.instrument'], function test() {
  return gulp
    .src(['test/**/*.test.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports({
      dir: './dist/report'
    }))
  ;
});

gulp.task('codacy', function sendToCodacy() {
  return gulp
    .src(['dist/report/lcov.info'], { read: false })
    .pipe(gulpIf(!!process.env.TRAVIS, codacy({
      token: '2dfdf24f7c8c47e79e1c6ca4c46ed44b'
    })))
  ;
});

gulp.task('default', sequence(['lint', 'test'], 'codacy'));
