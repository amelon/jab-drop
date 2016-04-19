
/**
 * Module dependencies.
 */


+function ($) {
  'use strict';

  if (!$) throw new Error('jQuery not defined');


  function map(arr, iterator) {
    var res = [];
    for(var i = 0, l = arr.length; i < l; i++) {
      if (iterator(arr[i])) res.push(arr[i]);
    }
    return res;
  }



  function noop() {}



  var filepicker = require('./lib/filepicker')($);
  var normalize = require('normalized-upload');


  function sendFilteredFiles(obj_with_files, filter, callback) {
    // e has items
    normalize(obj_with_files, function(e) {
      if (filter === noop) return callback(e);
      e.items = map(e.items, filter);
      callback(e)
    })
  }


  /**
   * Initialize a drop point
   * on the given `el` and callback `fn(e)`.
   *
   * @param {Element} el
   * @param {Function} fn
   * @api public
   */



  function Drop(el, options) {
    var $el = $(el);
    var callback = options.callback;
    var file_filter = options.filter || noop;
    var notify = options.notify || noop;

    if ($el.data('jab-drop')) return;
    $el.data('jab-drop', true);

    $el.on({
      dragenter: function(e) {
        notify('dragenter')
        $el.addClass('over');
      }
    , dragover: function(e) {
        notify('dragover')
        e.preventDefault();
      }
    , dragleave: function(e) {
        notify('drapleave')
        $el.removeClass('over');
      }
    , drop: function(e) {
        e.stopPropagation();
        e.preventDefault();
        $el.removeClass('over');
        notify('drop')
        sendFilteredFiles(e.originalEvent, file_filter, callback)
      }
    , click: function(e) {
        e.preventDefault();
        if (!options.filepicker) return;

        filepicker(options, function(files, e, input) {
          // make files compatible with normalize mimic event form
          var e_mic = {dataTransfer: {files: files}};
          notify('drop')
          sendFilteredFiles(e_mic, file_filter, callback);
        })
      }
    , 'destroy.jab.drop': function() {
        $el.unbind('dragenter', 'dragleave', 'dragover', 'drop', 'click');
        $el.data('jab-drop', false);
        if (options.paste_on_document) {
          document.onpaste = null;
        }
      }
    });

    if (options.paste_on_document) {
      document.onpaste = function(e) {
        e.preventDefault()
        e.stopPropagation()
        notify('drop')
        sendFilteredFiles(e, file_filter, callback);
      };
    }
  }



  $.fn.jabdrop = function (options) {
    var opts, fn;

    if (typeof options == 'function') {
      fn = options;
      options = { callback: fn };
    }
    opts = $.extend( {}, $.fn.jabdrop.defaults, options );

    return this.each(function () {
      if (typeof options == 'string') {
        if (options == 'destroy') $(this).trigger('destroy.jab.drop');
      } else {
        new Drop(this, opts);
      }
    });
  };



  $.fn.jabdrop.defaults = {
      callback: noop,
      notify: noop,
    // http://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful/10503561#10503561
    // null => accept everything
      accept: null,
      multiple: false,
      directory: false,
      filter: noop,
      filepicker: false,
      paste_on_document: false,
    };

  $.jabdrop = { parser: {}  };

}(window.jQuery);
