'use strict';

var xlsx = {
  fromFile: require('./file')
, fromClipboard: require('./clipboard')
};

if (global.$ && global.$.jabdrop) {
  global.$.jabdrop.parser.xlsx = xlsx;
}

module.exports = xlsx;