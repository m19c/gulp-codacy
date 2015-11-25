var codacy = require('../');
var nock = require('nock');
var fs = require('vinyl-fs');
var git = require('codacy-coverage/lib/getGitData');

require('should');

describe('gulp-codacy', function gulpCodacyTestSuite() {
  it('rejects if the required token is not provided', function withSpaces(done) {
    fs.src(['no-content.lcov'], { cwd: __dirname })
      .pipe(codacy({}))
      .on('error', function handleExpectedError(err) {
        err.message.should.equal('Token is required');
        done();
      })
      .on('end', function failWithoutError() {
        done(new Error('Expect error'));
      })
    ;
  });

  it('rejects if the obtained file doesnt contain content', function emptyContentTest(done) {
    fs.src(['no-content.lcov'], { cwd: __dirname })
      .pipe(codacy({ token: '...' }))
      .on('error', function handleExpectedError(err) {
        err.message.should.equal('"value" is not allowed to be empty');
        done();
      })
      .on('end', function handleEnd() {
        done(new Error('Expect error'));
      })
    ;
  });

  it('should submit the obtained coverage', function successTest(done) {
    git.getCommitId()
      .then(function handleCommitId(id) {
        var mock = nock('https://api.codacy.com')
          .post('/2.0/coverage/' + id + '/javascript').reply(200, {})
        ;

        fs.src(['coverage.lcov'], { cwd: __dirname })
          .pipe(codacy({
            token: '12345678901234567890123456789012'
          }))
          .on('error', function handleError(err) {
            done(err);
            mock.done();
            nock.cleanAll();
          })
          .on('end', function handleEnd() {
            done();
            mock.done();
            nock.cleanAll();
          })
        ;
      })
    ;
  });

  it('rejects if the passed file has no content', function noContentTest(done) {
    fs.src(['no-content.lcov'], { cwd: __dirname, read: false })
      .pipe(codacy({ token: '...' }))
      .on('error', function handleExpectedError(err) {
        err.message.should.equal('The file "no-content.lcov" does not contain any content (this usually happens when you pass the { read: false } option to vinyl-fs)');
        done();
      })
      .on('end', function handleEnd() {
        done(new Error('Expect error'));
      })
    ;
  });
});
