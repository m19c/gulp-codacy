var gulp = require('gulp');
var util = require('gulp-util');
var sequence = require('gulp-sequence');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');
var depcheck = require('depcheck');
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

gulp.task('depcheck', function depcheckTask(done) {
  var hidden = ['babel-eslint', 'eslint', 'pre-commit'];
  var options = {
    withoutDev: false,
    ignoreBinPackage: false,
    ignoreDirs: ['dist', 'node_modules'],
    detectors: [
      depcheck.detector.requireCallExpression,
      depcheck.detector.importDeclaration
    ]
  };

  depcheck(__dirname, options, function handleUnused(unused) {
    var reallyUnused = [];

    [unused.dependencies, unused.devDependencies].forEach((deps) => {
      deps.forEach(function eachDep(dep) {
        if (hidden.indexOf(dep) === -1) {
          reallyUnused.push(dep);
        }
      });
    });

    if (reallyUnused.length > 0) {
      return done(new util.PluginError('depcheck', 'One or more dependencies are unused: ' + reallyUnused.join(', ')));
    }

    done();
  });
});

gulp.task('default', sequence(['lint', 'test'], 'codacy', 'depcheck'));
