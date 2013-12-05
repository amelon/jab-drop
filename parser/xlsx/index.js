'use strict';

var xlsx = {
  fromFile: require('./file')
, fromClipboard: require('./clipboard')
, lib: require('../../lib/vendor/file_xlsx')
};

if (global.$ && global.$.jabdrop) {
  global.$.jabdrop.parser.xlsx = xlsx;
}

module.exports = xlsx;