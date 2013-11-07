
'use strict';


var paste_xlsx = require('../../lib/vendor/clipboard_xlsx')
  , _ = require('lodash');

module.exports = XlsxStringToArray;


/**
 * defaults options
 * @type {Object}
 */
var defaults = {

// these options limit result
// limit the number of cols to return
  col_limit: false
// limit the number of rows to return
, row_limit: false

// these options block process
// if sheet rows is bigger return error or false to bypass test
, max_rows: false
// if sheet cols is bigger return error or false to bypass test
, max_cols: false
};


/**
 * Contructor
 *
 * @param {Object} options - see defaults
 */
function XlsxStringToArray(options) {
  _.defaults(options, defaults);

  this.options = options;
}

XlsxStringToArray.prototype.toArray = function(str, cb) {
  var options = this.options
    , row_limit = options.row_limit
    , col_limit = options.col_limit
    , rows, header;

  if (typeof str == 'object' && str.kind && str.kind == 'string') str = str.string;

  rows = paste_xlsx.parse(str);
  if (!rows.length) return cb(null, []);

  if (options.max_rows && rows.length > options.max_rows) return cb(new Error(['rows exceed ', options.max_rows].join('') ));
  header = rows[0];
  if (options.max_cols && header.length > options.max_cols) return cb(new Error(['cols exceed ', options.max_cols].join('') ));

  if (row_limit) {
    rows = _.first(rows, row_limit);
  }

  if (col_limit) {
    rows = _.map(rows, function(row) {
      return _.first(row, col_limit);
    });
  }

  cb(null, rows);
};

