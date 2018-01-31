jab-drop
========

drop file in browser and work with it on browser (optionally click or paste)


## Deprecated
see: https://www.npmjs.com/package/@b-flower/bdn-xlsx-drop


## Motivation

Initialy a port of [component\drop][1] (too many browserify issues) with addition of [filepicker][2] and then adding some browser treatement to be able to read xlsx file.
Thanks to [file][3] component ...

Steal inspired by [component][4] team I've added [clipboard][5] capabilities.

Parsing file in browser has been made available with wonderfull [xlsx.js][6] project.

Finally, [sheetclip][7] comes to me for clipboard parsing.


For instance I have copied all of these components - not using npm :( - because of too many issues with [browserify][8] combination.

## Usage
### Some html
    index.html

    <!DOCTYPE html>
    <html>
      <head>
       <style>
          body {
            padding: 50px;
          }
          .drop { width: 400px; height: 50px; border: 1px dotted #ddd; }
          .drop:empty:after {
            content: "Click or drag xlsx file ";
            color: #eee;
            font-size: 1.5em;
            text-align: center;
            display: block;
            margin: 10px;
          }

          .drop.over {
            border: 3px dotted #ddd;
          }
        </style>
      </head>
      <body>
        <div id="drop" class="drop"></div>
        <div id="preview"></div>

        <script src="/bundle/bundle.js"></script>
      </body>
    </html>


### Some javascript

Example below use browserify and make jquery global object (window.$ must be available to use jab-drop)

    // test.js
    // jquery installed with bower
    require('./bower_components/jquery');

    var _ = require('lodash');

    require('jab-drop');
    require('jab-drop/parser/xlsx');

    var el = document.querySelector('#drop');

    // $.jabdrop.parser.xlsx provided by jab-drop/parser/xlsx

    var parser = $.jabdrop.parser.xlsx;


    $(el).jabdrop({
      callback: processItem
    , filter: filterItem
    , accept: '.xlsx'
    // filepicker make el click opening file dialog selection
    , filepicker: true
    // paste_on_document make clipboard operation possible
    , paste_on_document: true
    });


    // filter xlsx file
    function isXlsxFile(item) {
      return item.kind == 'file' && item.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }


    // filter string text/plain only
    // copy/paste from excel to browser create 4 items available
    //   - image (.png)
    //   - string (text/plain)
    //   - string (text/html)
    //   - string (text/rtf) - but empty (???)
    function isStringTextPlain(item) {
      return item.kind == 'string' && item.type == 'text/plain';
    }


    function filterItem(item) {
      return isXlsxFile(item) || isStringTextPlain(item);
    }


    function processItem(e) {
      // receive only filtered items
      var item = e.items.length && e.items[0]
        , parse;

      if (!item) return;

      if ( isXlsxFile(item) ) {
        // create fromFile parser
        parse = new parser.fromFile({
            // parser xlsx file options
            // worksheet_filter
            worksheet_filter: function(worksheet) {
              return worksheet.maxRow > 1 && worksheet.maxCol > 1;
            }

          // these options limit result
          // limit the number of cols to return
          , col_limit: 2

          // limit the number of rows to return
          , row_limit: 100


        // these options block process
        // if file size is bigger return error or false to bypass test
        , max_file_size: 400000 // in byte

        // if sheet rows is bigger return error or false to bypass test
        , max_rows: false

        // if sheet cols is bigger return error or false to bypass test
        , max_cols: false
          });
      }

      if ( isStringTextPlain(item) ) {
        // clipboard parser
        // you can receive same options as fromFile but worksheet_filter & max_file_size will be ignored
        parse = parser.fromClipboard({
            col_limit: 2
          , row_limit: 100
          , max_rows: false
          , max_cols: false
          });
      }

      parse && parse.toArray(item, function(err, arr) {
        // once parsed make some stuff with array
        if (!err) processFinalRows(arr);
      });
    }



    function processFinalRows(rows) {
      var res = _.map(rows, rowToHtml );

      $('#preview').html(['<table>', res.join(''), '</table>'].join(''));
    }

    function rowToHtml(row) {
      if (!row) return '';
      return '<tr>' +
             _.reduce(row, function(str, col) { return str + '<td>' + col + '</td>'; }, '') +
             '</tr>';
    }

### Some browserify if interrested
Using grunt-browserify

    grunt.initConfig({
        bundle_dest: 'public/bundle'
      , app_cli_path: 'assets'
      , app_cli_js: '<%= app_cli_path %>'
      , bower_src: '<%= app_cli_path %>/bower_components'

      , browserify: {
         all: {
            src: ['<%= app_cli_js %>/test.js']
          , dest: '<%= bundle_dest %>/bundle.js'
          , noParse: [
              '<%= bower_src %>/jquery/jquery.js'
            ]
          , options: {
              debug: true
            , fast: true
            , alias : [
                'lodash:underscore'
              , '<%= bower_src %>/jquery/jquery.js:jquery'
              ]
            }
          }
        }
      })



  [1]: https://github.com/component/drop
  [2]: https://github.com/component/file-picker
  [3]: https://github.com/component/file
  [4]: https://github.com/component/component
  [5]: https://github.com/component/clipboard
  [6]: https://github.com/stephen-hardy/xlsx.js
  [7]: https://github.com/warpech/sheetclip
  [8]: http://browserify.org/