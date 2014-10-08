/* global global */

// http://www.html5rocks.com/en/tutorials/file/dndfiles/
// https://github.com/stephen-hardy/xlsx.js/blob/master/xlsx.js
// https://github.com/Stuk/jszip/blob/master/package.json
// attention, pour les tests drop-component et drop-file ont été modifiés (pb dans package.json
//    - doit inclure browser key ... pour être compatible avec le build de browserify)
//    ex avec drop-component
//      "browser": {
//        "classes": "classes-component",
//        "events": "events-component-2"
//       },

// make global for file_xlsx
global.JSZip = require('jszip');

var _ = require('lodash')
  // xlsx file parser
  , xlsx = require('../../lib/vendor/file_xlsx')
  // browser file reader
  , file = require('../../lib/vendor/file');


module.exports = XlsxFileToArray;


/**
 * default worksheet filter
 * @param  {Object} worksheet
 * @return {Boolean} if true, worksheet is the one
 */
function defaultWorksheetFilter(worksheet) {
  return worksheet.maxRow > 1 && worksheet.maxCol > 1;
}




/**
 * defaults options
 * @type {Object}
 */
var defaults = {
  // worksheet filter selector
  // very basic @see defaultWorksheetFilter
  worksheet_filter: defaultWorksheetFilter

// these options limit result
// limit the number of cols to return
, col_limit: false
// limit the number of rows to return
, row_limit: false

// these options block process
// if file size is bigger return error or false to bypass test
, max_file_size: false
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
function XlsxFileToArray(options) {
  _.defaults(options, defaults);

  this.options = options;
}




XlsxFileToArray.prototype.toArray = function(item, cb) {
  var options = this.options;
  var data = file(item);

  if (options.max_file_size && data.size > options.max_file_size) return cb(new Error('file exceed 300k'));

  data.toArrayBuffer(function(err, data) {
    if (err) return cb(err);

    var sheet = xlsx(arrayBufferToBase64(data))
      , worksheet = firstWorksheetWithContent(sheet.worksheets, options.worksheet_filter)
      , rows = worksheet && worksheet.data;

    if (!rows) return cb(null, []);

    if (options.max_rows && worksheet.maxRow > options.max_rows) return cb(new Error(['rows exceed ', options.max_rows].join('') ));
    if (options.max_cols && worksheet.maxCol > options.max_cols) return cb(new Error(['cols exceed ', options.max_cols].join('') ));

    if (!rows.length) return cb(null, []);

    cb(null, extractRows(rows, options));
  });

};





function extractRows(xls_rows, options) {
  var indices = getIndicesUsed(xls_rows, options.col_limit);

  if (indices) {
    return xlsRowsEach(xls_rows, indices, options.row_limit);
  }

  return [];
}




function getIndicesUsed(xls_rows, col_limit) {
  var header      = first(xls_rows)
    , indices;

  if (header.length) {
    indices = firstIndices(header[0], col_limit);
    return indices;
  }
}




function firstWorksheetWithContent(worksheets, filter) {
  var i = _.findIndex(worksheets, filter);

  if (i >= 0) return worksheets[i];
}





function xlsRowClean(v) {
  return v && v.value || '';
}


function xlsRowsEach(rows, indices, row_limit) {
  var clean_rows = []
    , nb_rows = 0
    , row;

  // preserve indices to have a square table and not a fragmented one
  // use for in and not _.each because of possible fragmentation issue with xlsx rows
  for(var i in rows) {
    row = _.at(rows[i], indices);
    clean_rows.push(_.map(row, xlsRowClean));
    nb_rows++;
    if (row_limit && nb_rows == row_limit) return clean_rows;
  }
  return clean_rows;
}





/**
 *
 * @param  {ArrayBuffer} array_buffer
 * @return {Object} Base64 string encoding
 */
function arrayBufferToBase64(array_buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(array_buffer)));
}




/**
 * get first indices used in row
 * don't use lodash because of complex structure of data - missing indices
 *
 * @param  {Array} xls_row - array of object with possibly missing indices
 * @param  {Integer} col_limit - get col_limit first indices
 * @return {Array}   array of first indices used in xls_row
 */
function firstIndices(xls_row, col_limit) {
  var nb = 0, res = [], i;

  for (i in xls_row) {
    res.push(Number(i));
    nb++;
    if (col_limit && nb == col_limit) break;
  }

  return res;
}



/**
 * get first values used in row
 * don't use lodash because of complex structure of data - missing indices - kind of [undef, undef, {}, {}, undef]
 *
 * @param  {Array} arr - array of object with possibly missing indices
 * @param  {Integer} n - get N first values
 * @return {Array}   array of first indices used in xls_row
 */
function first(arr, n) {
  var nb = 0
   , res = []
   , i;

  n = n || 1;

  for (i in arr) {
    res.push(arr[i]);
    nb++;
    if (n && nb == n) break;
  }
  return res;
}

