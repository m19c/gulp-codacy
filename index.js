var pluginName = 'gulp-codacy';
var gutil = require('gulp-util');
var through2 = require('through2');
var merge = require('lodash.merge');
var codacy = require('codacy-coverage/lib/handleInput');

module.exports = function ccm(options) {
  options = merge({
    token: null,
    commit: null,
    format: 'lcov',
    prefix: '',
    verbose: false
  }, options || {});

  return through2.obj(function handleItem(item, encoding, callback) {
    var stream = this;

    if (item.isStream()) {
      stream.emit('error', new gutil.PluginError({
        plugin: pluginName,
        message: 'Streams are not supported.'
      }));

      return callback();
    }

    codacy(item.contents.toString(), options)
      .then(function handleCodacyResult() {
        // TODO: gulp-istanbul should ignore this if statement block
        if (options.verbose) {
          gutil.log('Coverage file posted: "%s"', item.path);
        }

        stream.emit('end');
      })
      .catch(function handleError(err) {
        stream.emit('error', new gutil.PluginError({
          plugin: pluginName,
          message: err.message,
          stack: err.stack
        }));

        callback();
      })
    ;

    // exec(util.format('CODACY_PROJECT_TOKEN=%s %s < "%s"', options.token, options.executable, file.path))
    //   .then(function execCompleted(stdout, stderr) {
    //     if (stderr) {
    //       stream.emit('error', new gutil.PluginError({
    //         plugin: pluginName,
    //         message: stderr
    //       }));
    //
    //       return callback();
    //     }
    //
    //     if (options.verbose) {
    //       gutil.log('Coverage file posted: "%s"', file.path);
    //     }
    //
    //     stream.emit('end');
    //   })
    //   .catch(function throwPluginError(err) {
    //     stream.emit('error', new gutil.PluginError({
    //       plugin: pluginName,
    //       message: err.message
    //     }));
    //
    //     callback();
    //   })
    // ;
  });
};
