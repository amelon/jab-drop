/**
 * component build from
 */

module.exports = file;

/**
 * Initialize a new `File` wrapping `file`.
 *
 * @param {File} file
 * @return {File}
 * @api public
 */

function file(file) {
  return new File(file);
}


/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};



/**
 * Initialize a new `File` wrapper.
 *
 * @param {File} file
 * @api private
 */

function File(file) {
  Emitter.call(this);
  this.file = file;
  for (var key in file) this[key] = file[key];
}

/**
 * Inherits from `Emitter.prototype`.
 */

Emitter(File.prototype);

/**
 * Check if the mime type matches `type`.
 *
 * Examples:
 *
 *    file.is('image/jpeg')
 *    file.is('image/*')
 *
 * @param {String} type
 * @return {Boolean}
 * @api public
 */

File.prototype.is = function(type){
  var real = this.file.type;

  // identical
  if (type == real) return true;

  real = real.split('/');
  type = type.split('/');

  // type/*
  if (type[0] == real[0] && type[1] == '*') return true;

  // */subtype
  if (type[1] == real[1] && type[0] == '*') return true;

  return false;
};

/**
 * Convert to `type` and invoke `fn(err, result)`.
 *
 * @param {String} type
 * @param {Function} fn
 * @return {Reader}
 * @api private
 */

File.prototype.to = function(type, fn){
  if (!window.FileReader) return fn();
  var reader = reader_get();
  reader.on('error', fn);
  reader.on('end', function(res){ fn(null, res) });
  reader.read(this.file, type);
  return reader;
};

/**
 * Convert to an `ArrayBuffer`.
 *
 * @param {Function} fn
 * @return {Reader}
 * @api public
 */

File.prototype.toArrayBuffer = function(fn){
  return this.to('ArrayBuffer', fn);
};

/**
 * Convert to text.
 *
 * @param {Function} fn
 * @return {Reader}
 * @api public
 */

File.prototype.toText = function(fn){
  // TODO: encoding
  return this.to('Text', fn);
};

/**
 * Convert to a data uri.
 *
 * @param {Function} fn
 * @return {Reader}
 * @api public
 */

File.prototype.toDataURL = function(fn){
  return this.to('DataURL', fn);
};



/**
 * Initialize a new `Reader` from optional `reader`
 * or a new `FileReader` is created.
 *
 * @param {FileReader} reader
 * @return {Reader}
 * @api public
 */

function reader_get(reader) {
  return reader
    ? new Reader(reader)
    : new Reader(new FileReader);
}

/**
 * Initialize a new `Reader`, a wrapper
 * around a `FileReader`.
 *
 * Emits:
 *
 *   - `error` an error occurred
 *   - `progress` in progress (`e.percent` etc)
 *   - `end` read is complete
 *
 * @param {FileReader} reader
 * @api private
 */

function Reader(reader) {
  Emitter.call(this);
  this.reader = reader;
  reader.onerror = this.emit.bind(this, 'error');
  reader.onabort = this.emit.bind(this, 'error', new Error('abort'));
  reader.onprogress = this.onprogress.bind(this);
  reader.onload = this.onload.bind(this);
}

/**
 * Inherits from `Emitter.prototype`.
 */

Emitter(Reader.prototype);

/**
 * Onload handler.
 *
 * @api private
 */

Reader.prototype.onload = function(e){
  this.emit('end', this.reader.result);
};

/**
 * Progress handler.
 *
 * @api private
 */

Reader.prototype.onprogress = function(e){
  e.percent = e.loaded / e.total * 100 | 0;
  this.emit('progress', e);
};

/**
 * Abort.
 *
 * @api public
 */

Reader.prototype.abort = function(){
  this.reader.abort();
};

/**
 * Read `file` as `type`.
 *
 * @param {File} file
 * @param {String} type
 * @api private
 */

Reader.prototype.read = function(file, type){
  var method = 'readAs' + type;
  this.reader[method](file);
};
