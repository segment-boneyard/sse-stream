
/**
 * Module dependencies.
 */

var Transform = require('stream').Transform;
var inherits = require('util').inherits;

/**
 * Expose `SSE`.
 */

module.exports = SSE;

/**
* Inherit prototype methods.
*/

inherits(SSE, Transform);

/**
 * Create a Server-Sent Events transform stream.
 *
 * @return {Stream}
 * @api public
 */

function SSE(options){
  if (!(this instanceof SSE)) return new SSE(options);
  options = options || {};
  Transform.call(this, options);
  this._writableState.objectMode = true;
}

SSE.prototype._transform = function(chunk, _, done){
  try {
    chunk = stringify(chunk);
  } catch(err) {
    return done(err);
  }

  var out = chunk.split('\n').map(function(line){
    return 'data: ' + line + '\n';
  }).join('') + '\n';

  done(null, out);
};

/**
 * Stringify `x`.
 *
 * @param {String|Number|Buffer|Object} x
 * @return {String}
 * @throws {TypeError|Error}
 * @api private
 */

function stringify(x){
  if ('string' == typeof x) return x;
  if ('number' == typeof x) return ''+x;
  if ('function' == typeof x) throw new TypeError;
  if (Buffer.isBuffer(x)) return x.toString('utf8');
  return JSON.stringify(x);
}
