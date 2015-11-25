var pluginName = 'gulp-codacy';
var gutil = require('gulp-util');
var through2 = require('through2');
var defaults = require('lodash.defaults');
var codacy = require('codacy-coverage/lib/handleInput');

module.exports = function ccm(options) {
  options = defaults(options || {}, {
    token: null,
    commit: null,
    format: 'lcov',
    prefix: '',
    verbose: false
  });

  return through2.obj(function handleItem(item, encoding, callback) {
    var stream = this;

    if (item.isStream()) {
      stream.emit('error', new gutil.PluginError({
        plugin: pluginName,
        message: 'Streams are not supported.'
      }));

      return callback();
    }

    if (item.contents === null) {
      stream.emit('error', new gutil.PluginError({
        plugin: pluginName,
        message: 'The file "' + item.relative + '" does not contain any content (this usually happens when you pass the { read: false } option to vinyl-fs)'
      }));

      return callback();
    }

    codacy(item.contents.toString(), options)
      .then(function handleCodacyResult() {
        /* istanbul ignore if */
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
  });
};
