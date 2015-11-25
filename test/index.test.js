var codacy = require('../');
var util = require('gulp-util');
var array = require('stream-array');
var File = util.File;

describe('gulp-codacy', function gulpCodacyTestSuite() {
  it('rejects if the required token is not provided', function withSpaces(done) {
    var file = new File({
      cwd: process.cwd(),
      path: 'test/coverage-with-spaces.lcov',
      contents: new Buffer('')
    });

    array([file])
      .pipe(codacy({}))
      .on('error', function handleExpectedError() {
        done();
      })
      .on('end', function failWithoutError() {
        done(new Error('Expect error'));
      })
    ;
  });

  it('rejects if the obtained file doesnt contain content', function noContentTest(done) {
    var file = new File({
      cwd: process.cwd(),
      path: 'path/to/somewhere.lcov',
      contents: new Buffer('')
    });

    array([file])
      .pipe(codacy({ token: '...' }))
      .on('error', function handleExpectedError() {
        done();
      })
      .on('end', function handleEnd() {
        done(new Error('Expect error'));
      })
    ;
  });

  it('should submit the obtained coverage', function successTest(done) {
    var file = new File({
      cwd: process.cwd(),
      path: 'path/to/somewhere.lcov',
      contents: new Buffer(['TN:gulp-coverage output', 'TN:', 'SF:./src/foo/bar.js', 'end_of_record'].join('\n'))
    });

    array([file])
      .pipe(codacy({
        token: '...'
      }))
      .on('error', function handleError(err) {
        done(err);
      })
      .on('end', function handleEnd() {
        done();
      })
    ;
  });

  // use vinyl file stream instead of stream-array
  // it('does not support streams', function noStreamsTest(done) {
  //   array([array([])])
  //     .pipe(codacy())
  //     .on('error', function handleExpectedError() {
  //       done();
  //     })
  //     .on('end', function failWithoutError() {
  //       done(new Error('Expect error'));
  //     })
  //   ;
  // });
});
