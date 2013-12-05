/**
 * Expose `FilePicker`
 */

/**
 *

  hard copy of https://github.com/component/file-picker
  too many package.json cleaning to make it available with browserify

  And wrapped it around jQuery for binding instead of event-component

  var filePicker = require('file-picker');

  // Upload a single file
  $('single-link').click(function() {
    filePicker(function(files){});
  });

  // Upload multiple files (on supported web browsers)
  $('multiple-link').click(function() {
    filePicker({ multiple: true }, function(files){});
  });

  // Upload a directory (on supported web browsers)
  $('directory-link').click(function() {
    filePicker({ directory: true }, function(files){});
  });

  // Accept only image files or .psd files
  $('image-link').click(function() {
    filePicker({ accept: [ 'image/*', '.psd' ] }, function(files){});
  });

 */

/**
 * Input template
 */

module.exports = function($) {
  var form, input;

  function initForm() {
    form = document.createElement('form');
    form.innerHTML = '<input type="file" style="top: -1000px; position: absolute" aria-hidden="true">';
    document.body.appendChild(form);
    input = form.childNodes[0];
  }

  /**
   * Already bound
   */

  var bound = false;

  /**
   * Opens a file picker dialog.
   *
   * @param {Object} options (optional)
   * @param {Function} fn callback function
   * @api public
   */

  function filepicker(opts, fn) {
    if (!form) initForm();

    if ('function' == typeof opts) {
      fn = opts;
      opts = {};
    }
    opts = opts || {};

    // multiple files support
    input.multiple = !!opts.multiple;

    // directory support
    input.webkitdirectory = input.mozdirectory = input.directory = !!opts.directory;

    // accepted file types support
    if (null == opts.accept) {
      delete input.accept;
    } else if (opts.accept.join) {
      // got an array
      input.accept = opts.accept.join(',');
    } else if (opts.accept) {
      // got a regular string
      input.accept = opts.accept;
    }

    // listen to change event (unbind old one if already listening)
    if (bound) $(input).unbind('change', bound);
    $(input).bind('change', onchange);
    bound = onchange;

    function onchange(e) {
      fn(input.files, e.originalEvent, input);
      $(input).unbind('change', onchange);
      bound = false;
    }

    // reset the form
    form.reset();

    // trigger input dialog
    input.click();
  }

  return filepicker;
};