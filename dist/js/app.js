(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function clone(point) { //TODO: use gl-vec2 for this
    return [point[0], point[1]]
}

function vec2(x, y) {
    return [x, y]
}

module.exports = function createBezierBuilder(opt) {
    opt = opt||{}

    var RECURSION_LIMIT = typeof opt.recursion === 'number' ? opt.recursion : 8
    var FLT_EPSILON = typeof opt.epsilon === 'number' ? opt.epsilon : 1.19209290e-7
    var PATH_DISTANCE_EPSILON = typeof opt.pathEpsilon === 'number' ? opt.pathEpsilon : 1.0

    var curve_angle_tolerance_epsilon = typeof opt.angleEpsilon === 'number' ? opt.angleEpsilon : 0.01
    var m_angle_tolerance = opt.angleTolerance || 0
    var m_cusp_limit = opt.cuspLimit || 0

    return function bezierCurve(start, c1, c2, end, scale, points) {
        if (!points)
            points = []

        scale = typeof scale === 'number' ? scale : 1.0
        var distanceTolerance = PATH_DISTANCE_EPSILON / scale
        distanceTolerance *= distanceTolerance
        begin(start, c1, c2, end, points, distanceTolerance)
        return points
    }


    ////// Based on:
    ////// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp

    function begin(start, c1, c2, end, points, distanceTolerance) {
        points.push(clone(start))
        var x1 = start[0],
            y1 = start[1],
            x2 = c1[0],
            y2 = c1[1],
            x3 = c2[0],
            y3 = c2[1],
            x4 = end[0],
            y4 = end[1]
        recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0)
        points.push(clone(end))
    }

    function recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, level) {
        if(level > RECURSION_LIMIT) 
            return

        var pi = Math.PI

        // Calculate all the mid-points of the line segments
        //----------------------
        var x12   = (x1 + x2) / 2
        var y12   = (y1 + y2) / 2
        var x23   = (x2 + x3) / 2
        var y23   = (y2 + y3) / 2
        var x34   = (x3 + x4) / 2
        var y34   = (y3 + y4) / 2
        var x123  = (x12 + x23) / 2
        var y123  = (y12 + y23) / 2
        var x234  = (x23 + x34) / 2
        var y234  = (y23 + y34) / 2
        var x1234 = (x123 + x234) / 2
        var y1234 = (y123 + y234) / 2

        if(level > 0) { // Enforce subdivision first time
            // Try to approximate the full cubic curve by a single straight line
            //------------------
            var dx = x4-x1
            var dy = y4-y1

            var d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx)
            var d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx)

            var da1, da2

            if(d2 > FLT_EPSILON && d3 > FLT_EPSILON) {
                // Regular care
                //-----------------
                if((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {
                    // If the curvature doesn't exceed the distanceTolerance value
                    // we tend to finish subdivisions.
                    //----------------------
                    if(m_angle_tolerance < curve_angle_tolerance_epsilon) {
                        points.push(vec2(x1234, y1234))
                        return
                    }

                    // Angle & Cusp Condition
                    //----------------------
                    var a23 = Math.atan2(y3 - y2, x3 - x2)
                    da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1))
                    da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23)
                    if(da1 >= pi) da1 = 2*pi - da1
                    if(da2 >= pi) da2 = 2*pi - da2

                    if(da1 + da2 < m_angle_tolerance) {
                        // Finally we can stop the recursion
                        //----------------------
                        points.push(vec2(x1234, y1234))
                        return
                    }

                    if(m_cusp_limit !== 0.0) {
                        if(da1 > m_cusp_limit) {
                            points.push(vec2(x2, y2))
                            return
                        }

                        if(da2 > m_cusp_limit) {
                            points.push(vec2(x3, y3))
                            return
                        }
                    }
                }
            }
            else {
                if(d2 > FLT_EPSILON) {
                    // p1,p3,p4 are collinear, p2 is considerable
                    //----------------------
                    if(d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {
                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {
                            points.push(vec2(x1234, y1234))
                            return
                        }

                        // Angle Condition
                        //----------------------
                        da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1))
                        if(da1 >= pi) da1 = 2*pi - da1

                        if(da1 < m_angle_tolerance) {
                            points.push(vec2(x2, y2))
                            points.push(vec2(x3, y3))
                            return
                        }

                        if(m_cusp_limit !== 0.0) {
                            if(da1 > m_cusp_limit) {
                                points.push(vec2(x2, y2))
                                return
                            }
                        }
                    }
                }
                else if(d3 > FLT_EPSILON) {
                    // p1,p2,p4 are collinear, p3 is considerable
                    //----------------------
                    if(d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {
                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {
                            points.push(vec2(x1234, y1234))
                            return
                        }

                        // Angle Condition
                        //----------------------
                        da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2))
                        if(da1 >= pi) da1 = 2*pi - da1

                        if(da1 < m_angle_tolerance) {
                            points.push(vec2(x2, y2))
                            points.push(vec2(x3, y3))
                            return
                        }

                        if(m_cusp_limit !== 0.0) {
                            if(da1 > m_cusp_limit)
                            {
                                points.push(vec2(x3, y3))
                                return
                            }
                        }
                    }
                }
                else {
                    // Collinear case
                    //-----------------
                    dx = x1234 - (x1 + x4) / 2
                    dy = y1234 - (y1 + y4) / 2
                    if(dx*dx + dy*dy <= distanceTolerance) {
                        points.push(vec2(x1234, y1234))
                        return
                    }
                }
            }
        }

        // Continue subdivision
        //----------------------
        recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level + 1) 
        recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level + 1) 
    }
}

},{}],2:[function(require,module,exports){
module.exports = require('./function')()
},{"./function":1}],3:[function(require,module,exports){
function clone(point) { //TODO: use gl-vec2 for this
    return [point[0], point[1]]
}

function vec2(x, y) {
    return [x, y]
}

module.exports = function createQuadraticBuilder(opt) {
    opt = opt||{}

    var RECURSION_LIMIT = typeof opt.recursion === 'number' ? opt.recursion : 8
    var FLT_EPSILON = typeof opt.epsilon === 'number' ? opt.epsilon : 1.19209290e-7
    var PATH_DISTANCE_EPSILON = typeof opt.pathEpsilon === 'number' ? opt.pathEpsilon : 1.0

    var curve_angle_tolerance_epsilon = typeof opt.angleEpsilon === 'number' ? opt.angleEpsilon : 0.01
    var m_angle_tolerance = opt.angleTolerance || 0

    return function quadraticCurve(start, c1, end, scale, points) {
        if (!points)
            points = []

        scale = typeof scale === 'number' ? scale : 1.0
        var distanceTolerance = PATH_DISTANCE_EPSILON / scale
        distanceTolerance *= distanceTolerance
        begin(start, c1, end, points, distanceTolerance)
        return points
    }

    ////// Based on:
    ////// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp

    function begin(start, c1, end, points, distanceTolerance) {
        points.push(clone(start))
        var x1 = start[0],
            y1 = start[1],
            x2 = c1[0],
            y2 = c1[1],
            x3 = end[0],
            y3 = end[1]
        recursive(x1, y1, x2, y2, x3, y3, points, distanceTolerance, 0)
        points.push(clone(end))
    }



    function recursive(x1, y1, x2, y2, x3, y3, points, distanceTolerance, level) {
        if(level > RECURSION_LIMIT) 
            return

        var pi = Math.PI

        // Calculate all the mid-points of the line segments
        //----------------------
        var x12   = (x1 + x2) / 2                
        var y12   = (y1 + y2) / 2
        var x23   = (x2 + x3) / 2
        var y23   = (y2 + y3) / 2
        var x123  = (x12 + x23) / 2
        var y123  = (y12 + y23) / 2

        var dx = x3-x1
        var dy = y3-y1
        var d = Math.abs(((x2 - x3) * dy - (y2 - y3) * dx))

        if(d > FLT_EPSILON)
        { 
            // Regular care
            //-----------------
            if(d * d <= distanceTolerance * (dx*dx + dy*dy))
            {
                // If the curvature doesn't exceed the distance_tolerance value
                // we tend to finish subdivisions.
                //----------------------
                if(m_angle_tolerance < curve_angle_tolerance_epsilon)
                {
                    points.push(vec2(x123, y123))
                    return
                }

                // Angle & Cusp Condition
                //----------------------
                var da = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1))
                if(da >= pi) da = 2*pi - da

                if(da < m_angle_tolerance)
                {
                    // Finally we can stop the recursion
                    //----------------------
                    points.push(vec2(x123, y123))
                    return                 
                }
            }
        }
        else
        {
            // Collinear case
            //-----------------
            dx = x123 - (x1 + x3) / 2
            dy = y123 - (y1 + y3) / 2
            if(dx*dx + dy*dy <= distanceTolerance)
            {
                points.push(vec2(x123, y123))
                return
            }
        }

        // Continue subdivision
        //----------------------
        recursive(x1, y1, x12, y12, x123, y123, points, distanceTolerance, level + 1) 
        recursive(x123, y123, x23, y23, x3, y3, points, distanceTolerance, level + 1) 
    }
}
},{}],4:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./function":3,"dup":2}],5:[function(require,module,exports){
var str = Object.prototype.toString

module.exports = anArray

function anArray(arr) {
  return (
       arr.BYTES_PER_ELEMENT
    && str.call(arr.buffer) === '[object ArrayBuffer]'
    || Array.isArray(arr)
  )
}

},{}],6:[function(require,module,exports){
module.exports = function numtype(num, def) {
	return typeof num === 'number'
		? num 
		: (typeof def === 'number' ? def : 0)
}
},{}],7:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],8:[function(require,module,exports){
var Buffer = require('buffer').Buffer; // for use with browserify

module.exports = function (a, b) {
    if (!Buffer.isBuffer(a)) return undefined;
    if (!Buffer.isBuffer(b)) return undefined;
    if (typeof a.equals === 'function') return a.equals(b);
    if (a.length !== b.length) return false;
    
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    
    return true;
};

},{"buffer":9}],9:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":7,"ieee754":20}],10:[function(require,module,exports){
module.exports = function(dtype) {
  switch (dtype) {
    case 'int8':
      return Int8Array
    case 'int16':
      return Int16Array
    case 'int32':
      return Int32Array
    case 'uint8':
      return Uint8Array
    case 'uint16':
      return Uint16Array
    case 'uint32':
      return Uint32Array
    case 'float32':
      return Float32Array
    case 'float64':
      return Float64Array
    case 'array':
      return Array
    case 'uint8_clamped':
      return Uint8ClampedArray
  }
}

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],12:[function(require,module,exports){
/*eslint new-cap:0*/
var dtype = require('dtype')
module.exports = flattenVertexData
function flattenVertexData (data, output, offset) {
  if (!data) throw new TypeError('must specify data as first parameter')
  offset = +(offset || 0) | 0

  if (Array.isArray(data) && Array.isArray(data[0])) {
    var dim = data[0].length
    var length = data.length * dim

    // no output specified, create a new typed array
    if (!output || typeof output === 'string') {
      output = new (dtype(output || 'float32'))(length + offset)
    }

    var dstLength = output.length - offset
    if (length !== dstLength) {
      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
        ' does not match destination length ' + dstLength)
    }

    for (var i = 0, k = offset; i < data.length; i++) {
      for (var j = 0; j < dim; j++) {
        output[k++] = data[i][j]
      }
    }
  } else {
    if (!output || typeof output === 'string') {
      // no output, create a new one
      var Ctor = dtype(output || 'float32')
      if (offset === 0) {
        output = new Ctor(data)
      } else {
        output = new Ctor(data.length + offset)
        output.set(data, offset)
      }
    } else {
      // store output in existing array
      output.set(data, offset)
    }
  }

  return output
}

},{"dtype":10}],13:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":23}],14:[function(require,module,exports){
module.exports = add

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    return out
}
},{}],15:[function(require,module,exports){
module.exports = dot

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1]
}
},{}],16:[function(require,module,exports){
module.exports = normalize

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1]
    var len = x*x + y*y
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
    }
    return out
}
},{}],17:[function(require,module,exports){
module.exports = set

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function set(out, x, y) {
    out[0] = x
    out[1] = y
    return out
}
},{}],18:[function(require,module,exports){
module.exports = subtract

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    return out
}
},{}],19:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],21:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],22:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],23:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],24:[function(require,module,exports){
var wordWrap = require('word-wrapper')
var xtend = require('xtend')
var number = require('as-number')

var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
var M_WIDTHS = ['m', 'w']
var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


var TAB_ID = '\t'.charCodeAt(0)
var SPACE_ID = ' '.charCodeAt(0)
var ALIGN_LEFT = 0, 
    ALIGN_CENTER = 1, 
    ALIGN_RIGHT = 2

module.exports = function createLayout(opt) {
  return new TextLayout(opt)
}

function TextLayout(opt) {
  this.glyphs = []
  this._measure = this.computeMetrics.bind(this)
  this.update(opt)
}

TextLayout.prototype.update = function(opt) {
  opt = xtend({
    measure: this._measure
  }, opt)
  this._opt = opt
  this._opt.tabSize = number(this._opt.tabSize, 4)

  if (!opt.font)
    throw new Error('must provide a valid bitmap font')

  var glyphs = this.glyphs
  var text = opt.text||'' 
  var font = opt.font
  this._setupSpaceGlyphs(font)
  
  var lines = wordWrap.lines(text, opt)
  var minWidth = opt.width || 0

  //clear glyphs
  glyphs.length = 0

  //get max line width
  var maxLineWidth = lines.reduce(function(prev, line) {
    return Math.max(prev, line.width, minWidth)
  }, 0)

  //the pen position
  var x = 0
  var y = 0
  var lineHeight = number(opt.lineHeight, font.common.lineHeight)
  var baseline = font.common.base
  var descender = lineHeight-baseline
  var letterSpacing = opt.letterSpacing || 0
  var height = lineHeight * lines.length - descender
  var align = getAlignType(this._opt.align)

  //draw text along baseline
  y -= height
  
  //the metrics for this text layout
  this._width = maxLineWidth
  this._height = height
  this._descender = lineHeight - baseline
  this._baseline = baseline
  this._xHeight = getXHeight(font)
  this._capHeight = getCapHeight(font)
  this._lineHeight = lineHeight
  this._ascender = lineHeight - descender - this._xHeight
    
  //layout each glyph
  var self = this
  lines.forEach(function(line, lineIndex) {
    var start = line.start
    var end = line.end
    var lineWidth = line.width
    var lastGlyph
    
    //for each glyph in that line...
    for (var i=start; i<end; i++) {
      var id = text.charCodeAt(i)
      var glyph = self.getGlyph(font, id)
      if (glyph) {
        if (lastGlyph) 
          x += getKerning(font, lastGlyph.id, glyph.id)

        var tx = x
        if (align === ALIGN_CENTER) 
          tx += (maxLineWidth-lineWidth)/2
        else if (align === ALIGN_RIGHT)
          tx += (maxLineWidth-lineWidth)

        glyphs.push({
          position: [tx, y],
          data: glyph,
          index: i,
          line: lineIndex
        })  

        //move pen forward
        x += glyph.xadvance + letterSpacing
        lastGlyph = glyph
      }
    }

    //next line down
    y += lineHeight
    x = 0
  })
  this._linesTotal = lines.length;
}

TextLayout.prototype._setupSpaceGlyphs = function(font) {
  //These are fallbacks, when the font doesn't include
  //' ' or '\t' glyphs
  this._fallbackSpaceGlyph = null
  this._fallbackTabGlyph = null

  if (!font.chars || font.chars.length === 0)
    return

  //try to get space glyph
  //then fall back to the 'm' or 'w' glyphs
  //then fall back to the first glyph available
  var space = getGlyphById(font, SPACE_ID) 
          || getMGlyph(font) 
          || font.chars[0]

  //and create a fallback for tab
  var tabWidth = this._opt.tabSize * space.xadvance
  this._fallbackSpaceGlyph = space
  this._fallbackTabGlyph = xtend(space, {
    x: 0, y: 0, xadvance: tabWidth, id: TAB_ID, 
    xoffset: 0, yoffset: 0, width: 0, height: 0
  })
}

TextLayout.prototype.getGlyph = function(font, id) {
  var glyph = getGlyphById(font, id)
  if (glyph)
    return glyph
  else if (id === TAB_ID) 
    return this._fallbackTabGlyph
  else if (id === SPACE_ID) 
    return this._fallbackSpaceGlyph
  return null
}

TextLayout.prototype.computeMetrics = function(text, start, end, width) {
  var letterSpacing = this._opt.letterSpacing || 0
  var font = this._opt.font
  var curPen = 0
  var curWidth = 0
  var count = 0
  var glyph
  var lastGlyph

  if (!font.chars || font.chars.length === 0) {
    return {
      start: start,
      end: start,
      width: 0
    }
  }

  end = Math.min(text.length, end)
  for (var i=start; i < end; i++) {
    var id = text.charCodeAt(i)
    var glyph = this.getGlyph(font, id)

    if (glyph) {
      //move pen forward
      var xoff = glyph.xoffset
      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0
      curPen += kern

      var nextPen = curPen + glyph.xadvance + letterSpacing
      var nextWidth = curPen + glyph.width

      //we've hit our limit; we can't move onto the next glyph
      if (nextWidth >= width || nextPen >= width)
        break

      //otherwise continue along our line
      curPen = nextPen
      curWidth = nextWidth
      lastGlyph = glyph
    }
    count++
  }
  
  //make sure rightmost edge lines up with rendered glyphs
  if (lastGlyph)
    curWidth += lastGlyph.xoffset

  return {
    start: start,
    end: start + count,
    width: curWidth
  }
}

//getters for the private vars
;['width', 'height', 
  'descender', 'ascender',
  'xHeight', 'baseline',
  'capHeight',
  'lineHeight' ].forEach(addGetter)

function addGetter(name) {
  Object.defineProperty(TextLayout.prototype, name, {
    get: wrapper(name),
    configurable: true
  })
}

//create lookups for private vars
function wrapper(name) {
  return (new Function([
    'return function '+name+'() {',
    '  return this._'+name,
    '}'
  ].join('\n')))()
}

function getGlyphById(font, id) {
  if (!font.chars || font.chars.length === 0)
    return null

  var glyphIdx = findChar(font.chars, id)
  if (glyphIdx >= 0)
    return font.chars[glyphIdx]
  return null
}

function getXHeight(font) {
  for (var i=0; i<X_HEIGHTS.length; i++) {
    var id = X_HEIGHTS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx].height
  }
  return 0
}

function getMGlyph(font) {
  for (var i=0; i<M_WIDTHS.length; i++) {
    var id = M_WIDTHS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx]
  }
  return 0
}

function getCapHeight(font) {
  for (var i=0; i<CAP_HEIGHTS.length; i++) {
    var id = CAP_HEIGHTS[i].charCodeAt(0)
    var idx = findChar(font.chars, id)
    if (idx >= 0) 
      return font.chars[idx].height
  }
  return 0
}

function getKerning(font, left, right) {
  if (!font.kernings || font.kernings.length === 0)
    return 0

  var table = font.kernings
  for (var i=0; i<table.length; i++) {
    var kern = table[i]
    if (kern.first === left && kern.second === right)
      return kern.amount
  }
  return 0
}

function getAlignType(align) {
  if (align === 'center')
    return ALIGN_CENTER
  else if (align === 'right')
    return ALIGN_RIGHT
  return ALIGN_LEFT
}

function findChar (array, value, start) {
  start = start || 0
  for (var i = start; i < array.length; i++) {
    if (array[i].id === value) {
      return i
    }
  }
  return -1
}
},{"as-number":6,"word-wrapper":50,"xtend":53}],25:[function(require,module,exports){
(function (Buffer){
var xhr = require('xhr')
var noop = function(){}
var parseASCII = require('parse-bmfont-ascii')
var parseXML = require('parse-bmfont-xml')
var readBinary = require('parse-bmfont-binary')
var isBinaryFormat = require('./lib/is-binary')
var xtend = require('xtend')

var xml2 = (function hasXML2() {
  return self.XMLHttpRequest && "withCredentials" in new XMLHttpRequest
})()

module.exports = function(opt, cb) {
  cb = typeof cb === 'function' ? cb : noop

  if (typeof opt === 'string')
    opt = { uri: opt }
  else if (!opt)
    opt = {}

  var expectBinary = opt.binary
  if (expectBinary)
    opt = getBinaryOpts(opt)

  xhr(opt, function(err, res, body) {
    if (err)
      return cb(err)
    if (!/^2/.test(res.statusCode))
      return cb(new Error('http status code: '+res.statusCode))
    if (!body)
      return cb(new Error('no body result'))

    var binary = false 

    //if the response type is an array buffer,
    //we need to convert it into a regular Buffer object
    if (isArrayBuffer(body)) {
      var array = new Uint8Array(body)
      body = new Buffer(array, 'binary')
    }

    //now check the string/Buffer response
    //and see if it has a binary BMF header
    if (isBinaryFormat(body)) {
      binary = true
      //if we have a string, turn it into a Buffer
      if (typeof body === 'string') 
        body = new Buffer(body, 'binary')
    } 

    //we are not parsing a binary format, just ASCII/XML/etc
    if (!binary) {
      //might still be a buffer if responseType is 'arraybuffer'
      if (Buffer.isBuffer(body))
        body = body.toString(opt.encoding)
      body = body.trim()
    }

    var result
    try {
      var type = res.headers['content-type']
      if (binary)
        result = readBinary(body)
      else if (/json/.test(type) || body.charAt(0) === '{')
        result = JSON.parse(body)
      else if (/xml/.test(type)  || body.charAt(0) === '<')
        result = parseXML(body)
      else
        result = parseASCII(body)
    } catch (e) {
      cb(new Error('error parsing font '+e.message))
      cb = noop
    }
    cb(null, result)
  })
}

function isArrayBuffer(arr) {
  var str = Object.prototype.toString
  return str.call(arr) === '[object ArrayBuffer]'
}

function getBinaryOpts(opt) {
  //IE10+ and other modern browsers support array buffers
  if (xml2)
    return xtend(opt, { responseType: 'arraybuffer' })
  
  if (typeof self.XMLHttpRequest === 'undefined')
    throw new Error('your browser does not support XHR loading')

  //IE9 and XML1 browsers could still use an override
  var req = new self.XMLHttpRequest()
  req.overrideMimeType('text/plain; charset=x-user-defined')
  return xtend({
    xhr: req
  }, opt)
}

}).call(this,require("buffer").Buffer)
},{"./lib/is-binary":26,"buffer":9,"parse-bmfont-ascii":28,"parse-bmfont-binary":29,"parse-bmfont-xml":30,"xhr":51,"xtend":53}],26:[function(require,module,exports){
(function (Buffer){
var equal = require('buffer-equal')
var HEADER = new Buffer([66, 77, 70, 3])

module.exports = function(buf) {
  if (typeof buf === 'string')
    return buf.substring(0, 3) === 'BMF'
  return buf.length > 4 && equal(buf.slice(0, 4), HEADER)
}
}).call(this,require("buffer").Buffer)
},{"buffer":9,"buffer-equal":8}],27:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],28:[function(require,module,exports){
module.exports = function parseBMFontAscii(data) {
  if (!data)
    throw new Error('no data provided')
  data = data.toString().trim()

  var output = {
    pages: [],
    chars: [],
    kernings: []
  }

  var lines = data.split(/\r\n?|\n/g)

  if (lines.length === 0)
    throw new Error('no data in BMFont file')

  for (var i = 0; i < lines.length; i++) {
    var lineData = splitLine(lines[i], i)
    if (!lineData) //skip empty lines
      continue

    if (lineData.key === 'page') {
      if (typeof lineData.data.id !== 'number')
        throw new Error('malformed file at line ' + i + ' -- needs page id=N')
      if (typeof lineData.data.file !== 'string')
        throw new Error('malformed file at line ' + i + ' -- needs page file="path"')
      output.pages[lineData.data.id] = lineData.data.file
    } else if (lineData.key === 'chars' || lineData.key === 'kernings') {
      //... do nothing for these two ...
    } else if (lineData.key === 'char') {
      output.chars.push(lineData.data)
    } else if (lineData.key === 'kerning') {
      output.kernings.push(lineData.data)
    } else {
      output[lineData.key] = lineData.data
    }
  }

  return output
}

function splitLine(line, idx) {
  line = line.replace(/\t+/g, ' ').trim()
  if (!line)
    return null

  var space = line.indexOf(' ')
  if (space === -1) 
    throw new Error("no named row at line " + idx)

  var key = line.substring(0, space)

  line = line.substring(space + 1)
  //clear "letter" field as it is non-standard and
  //requires additional complexity to parse " / = symbols
  line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, '')  
  line = line.split("=")
  line = line.map(function(str) {
    return str.trim().match((/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g))
  })

  var data = []
  for (var i = 0; i < line.length; i++) {
    var dt = line[i]
    if (i === 0) {
      data.push({
        key: dt[0],
        data: ""
      })
    } else if (i === line.length - 1) {
      data[data.length - 1].data = parseData(dt[0])
    } else {
      data[data.length - 1].data = parseData(dt[0])
      data.push({
        key: dt[1],
        data: ""
      })
    }
  }

  var out = {
    key: key,
    data: {}
  }

  data.forEach(function(v) {
    out.data[v.key] = v.data;
  })

  return out
}

function parseData(data) {
  if (!data || data.length === 0)
    return ""

  if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
    return data.substring(1, data.length - 1)
  if (data.indexOf(',') !== -1)
    return parseIntList(data)
  return parseInt(data, 10)
}

function parseIntList(data) {
  return data.split(',').map(function(val) {
    return parseInt(val, 10)
  })
}
},{}],29:[function(require,module,exports){
var HEADER = [66, 77, 70]

module.exports = function readBMFontBinary(buf) {
  if (buf.length < 6)
    throw new Error('invalid buffer length for BMFont')

  var header = HEADER.every(function(byte, i) {
    return buf.readUInt8(i) === byte
  })

  if (!header)
    throw new Error('BMFont missing BMF byte header')

  var i = 3
  var vers = buf.readUInt8(i++)
  if (vers > 3)
    throw new Error('Only supports BMFont Binary v3 (BMFont App v1.10)')
  
  var target = { kernings: [], chars: [] }
  for (var b=0; b<5; b++)
    i += readBlock(target, buf, i)
  return target
}

function readBlock(target, buf, i) {
  if (i > buf.length-1)
    return 0

  var blockID = buf.readUInt8(i++)
  var blockSize = buf.readInt32LE(i)
  i += 4

  switch(blockID) {
    case 1: 
      target.info = readInfo(buf, i)
      break
    case 2:
      target.common = readCommon(buf, i)
      break
    case 3:
      target.pages = readPages(buf, i, blockSize)
      break
    case 4:
      target.chars = readChars(buf, i, blockSize)
      break
    case 5:
      target.kernings = readKernings(buf, i, blockSize)
      break
  }
  return 5 + blockSize
}

function readInfo(buf, i) {
  var info = {}
  info.size = buf.readInt16LE(i)

  var bitField = buf.readUInt8(i+2)
  info.smooth = (bitField >> 7) & 1
  info.unicode = (bitField >> 6) & 1
  info.italic = (bitField >> 5) & 1
  info.bold = (bitField >> 4) & 1
  
  //fixedHeight is only mentioned in binary spec 
  if ((bitField >> 3) & 1)
    info.fixedHeight = 1
  
  info.charset = buf.readUInt8(i+3) || ''
  info.stretchH = buf.readUInt16LE(i+4)
  info.aa = buf.readUInt8(i+6)
  info.padding = [
    buf.readInt8(i+7),
    buf.readInt8(i+8),
    buf.readInt8(i+9),
    buf.readInt8(i+10)
  ]
  info.spacing = [
    buf.readInt8(i+11),
    buf.readInt8(i+12)
  ]
  info.outline = buf.readUInt8(i+13)
  info.face = readStringNT(buf, i+14)
  return info
}

function readCommon(buf, i) {
  var common = {}
  common.lineHeight = buf.readUInt16LE(i)
  common.base = buf.readUInt16LE(i+2)
  common.scaleW = buf.readUInt16LE(i+4)
  common.scaleH = buf.readUInt16LE(i+6)
  common.pages = buf.readUInt16LE(i+8)
  var bitField = buf.readUInt8(i+10)
  common.packed = 0
  common.alphaChnl = buf.readUInt8(i+11)
  common.redChnl = buf.readUInt8(i+12)
  common.greenChnl = buf.readUInt8(i+13)
  common.blueChnl = buf.readUInt8(i+14)
  return common
}

function readPages(buf, i, size) {
  var pages = []
  var text = readNameNT(buf, i)
  var len = text.length+1
  var count = size / len
  for (var c=0; c<count; c++) {
    pages[c] = buf.slice(i, i+text.length).toString('utf8')
    i += len
  }
  return pages
}

function readChars(buf, i, blockSize) {
  var chars = []

  var count = blockSize / 20
  for (var c=0; c<count; c++) {
    var char = {}
    var off = c*20
    char.id = buf.readUInt32LE(i + 0 + off)
    char.x = buf.readUInt16LE(i + 4 + off)
    char.y = buf.readUInt16LE(i + 6 + off)
    char.width = buf.readUInt16LE(i + 8 + off)
    char.height = buf.readUInt16LE(i + 10 + off)
    char.xoffset = buf.readInt16LE(i + 12 + off)
    char.yoffset = buf.readInt16LE(i + 14 + off)
    char.xadvance = buf.readInt16LE(i + 16 + off)
    char.page = buf.readUInt8(i + 18 + off)
    char.chnl = buf.readUInt8(i + 19 + off)
    chars[c] = char
  }
  return chars
}

function readKernings(buf, i, blockSize) {
  var kernings = []
  var count = blockSize / 10
  for (var c=0; c<count; c++) {
    var kern = {}
    var off = c*10
    kern.first = buf.readUInt32LE(i + 0 + off)
    kern.second = buf.readUInt32LE(i + 4 + off)
    kern.amount = buf.readInt16LE(i + 8 + off)
    kernings[c] = kern
  }
  return kernings
}

function readNameNT(buf, offset) {
  var pos=offset
  for (; pos<buf.length; pos++) {
    if (buf[pos] === 0x00) 
      break
  }
  return buf.slice(offset, pos)
}

function readStringNT(buf, offset) {
  return readNameNT(buf, offset).toString('utf8')
}
},{}],30:[function(require,module,exports){
var parseAttributes = require('./parse-attribs')
var parseFromString = require('xml-parse-from-string')

//In some cases element.attribute.nodeName can return
//all lowercase values.. so we need to map them to the correct 
//case
var NAME_MAP = {
  scaleh: 'scaleH',
  scalew: 'scaleW',
  stretchh: 'stretchH',
  lineheight: 'lineHeight',
  alphachnl: 'alphaChnl',
  redchnl: 'redChnl',
  greenchnl: 'greenChnl',
  bluechnl: 'blueChnl'
}

module.exports = function parse(data) {
  data = data.toString()
  
  var xmlRoot = parseFromString(data)
  var output = {
    pages: [],
    chars: [],
    kernings: []
  }

  //get config settings
  ;['info', 'common'].forEach(function(key) {
    var element = xmlRoot.getElementsByTagName(key)[0]
    if (element)
      output[key] = parseAttributes(getAttribs(element))
  })

  //get page info
  var pageRoot = xmlRoot.getElementsByTagName('pages')[0]
  if (!pageRoot)
    throw new Error('malformed file -- no <pages> element')
  var pages = pageRoot.getElementsByTagName('page')
  for (var i=0; i<pages.length; i++) {
    var p = pages[i]
    var id = parseInt(p.getAttribute('id'), 10)
    var file = p.getAttribute('file')
    if (isNaN(id))
      throw new Error('malformed file -- page "id" attribute is NaN')
    if (!file)
      throw new Error('malformed file -- needs page "file" attribute')
    output.pages[parseInt(id, 10)] = file
  }

  //get kernings / chars
  ;['chars', 'kernings'].forEach(function(key) {
    var element = xmlRoot.getElementsByTagName(key)[0]
    if (!element)
      return
    var childTag = key.substring(0, key.length-1)
    var children = element.getElementsByTagName(childTag)
    for (var i=0; i<children.length; i++) {      
      var child = children[i]
      output[key].push(parseAttributes(getAttribs(child)))
    }
  })
  return output
}

function getAttribs(element) {
  var attribs = getAttribList(element)
  return attribs.reduce(function(dict, attrib) {
    var key = mapName(attrib.nodeName)
    dict[key] = attrib.nodeValue
    return dict
  }, {})
}

function getAttribList(element) {
  //IE8+ and modern browsers
  var attribs = []
  for (var i=0; i<element.attributes.length; i++)
    attribs.push(element.attributes[i])
  return attribs
}

function mapName(nodeName) {
  return NAME_MAP[nodeName.toLowerCase()] || nodeName
}
},{"./parse-attribs":31,"xml-parse-from-string":52}],31:[function(require,module,exports){
//Some versions of GlyphDesigner have a typo
//that causes some bugs with parsing. 
//Need to confirm with recent version of the software
//to see whether this is still an issue or not.
var GLYPH_DESIGNER_ERROR = 'chasrset'

module.exports = function parseAttributes(obj) {
  if (GLYPH_DESIGNER_ERROR in obj) {
    obj['charset'] = obj[GLYPH_DESIGNER_ERROR]
    delete obj[GLYPH_DESIGNER_ERROR]
  }

  for (var k in obj) {
    if (k === 'face' || k === 'charset') 
      continue
    else if (k === 'padding' || k === 'spacing')
      obj[k] = parseIntList(obj[k])
    else
      obj[k] = parseInt(obj[k], 10) 
  }
  return obj
}

function parseIntList(data) {
  return data.split(',').map(function(val) {
    return parseInt(val, 10)
  })
}
},{}],32:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":13,"trim":49}],33:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this,require('_process'))
},{"_process":36}],34:[function(require,module,exports){
var add = require('gl-vec2/add')
var set = require('gl-vec2/set')
var normalize = require('gl-vec2/normalize')
var subtract = require('gl-vec2/subtract')
var dot = require('gl-vec2/dot')

var tmp = [0, 0]

module.exports.computeMiter = function computeMiter(tangent, miter, lineA, lineB, halfThick) {
    //get tangent line
    add(tangent, lineA, lineB)
    normalize(tangent, tangent)

    //get miter as a unit vector
    set(miter, -tangent[1], tangent[0])
    set(tmp, -lineA[1], lineA[0])

    //get the necessary length of our miter
    return halfThick / dot(miter, tmp)
}

module.exports.normal = function normal(out, dir) {
    //get perpendicular
    set(out, -dir[1], dir[0])
    return out
}

module.exports.direction = function direction(out, a, b) {
    //get unit dir of two lines
    subtract(out, a, b)
    normalize(out, out)
    return out
}
},{"gl-vec2/add":14,"gl-vec2/dot":15,"gl-vec2/normalize":16,"gl-vec2/set":17,"gl-vec2/subtract":18}],35:[function(require,module,exports){
var util = require('polyline-miter-util')

var lineA = [0, 0]
var lineB = [0, 0]
var tangent = [0, 0]
var miter = [0, 0]

module.exports = function(points, closed) {
    var curNormal = null
    var out = []
    if (closed) {
        points = points.slice()
        points.push(points[0])
    }

    var total = points.length
    for (var i=1; i<total; i++) {
        var last = points[i-1]
        var cur = points[i]
        var next = i<points.length-1 ? points[i+1] : null

        util.direction(lineA, cur, last)
        if (!curNormal)  {
            curNormal = [0, 0]
            util.normal(curNormal, lineA)
        }

        if (i === 1) //add initial normals
            addNext(out, curNormal, 1)

        if (!next) { //no miter, simple segment
            util.normal(curNormal, lineA) //reset normal
            addNext(out, curNormal, 1)
        } else { //miter with last
            //get unit dir of next line
            util.direction(lineB, next, cur)

            //stores tangent & miter
            var miterLen = util.computeMiter(tangent, miter, lineA, lineB, 1)
            addNext(out, miter, miterLen)
        }
    }

    //if the polyline is a closed loop, clean up the last normal
    if (points.length > 2 && closed) {
        var last2 = points[total-2]
        var cur2 = points[0]
        var next2 = points[1]

        util.direction(lineA, cur2, last2)
        util.direction(lineB, next2, cur2)
        util.normal(curNormal, lineA)
        
        var miterLen2 = util.computeMiter(tangent, miter, lineA, lineB, 1)
        out[0][0] = miter.slice()
        out[total-1][0] = miter.slice()
        out[0][1] = miterLen2
        out[total-1][1] = miterLen2
        out.pop()
    }

    return out
}

function addNext(out, normal, length) {
    out.push([[normal[0], normal[1]], length])
}
},{"polyline-miter-util":34}],36:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],37:[function(require,module,exports){
var dtype = require('dtype')
var anArray = require('an-array')
var isBuffer = require('is-buffer')

var CW = [0, 2, 3]
var CCW = [2, 1, 3]

module.exports = function createQuadElements(array, opt) {
    //if user didn't specify an output array
    if (!array || !(anArray(array) || isBuffer(array))) {
        opt = array || {}
        array = null
    }

    if (typeof opt === 'number') //backwards-compatible
        opt = { count: opt }
    else
        opt = opt || {}

    var type = typeof opt.type === 'string' ? opt.type : 'uint16'
    var count = typeof opt.count === 'number' ? opt.count : 1
    var start = (opt.start || 0) 

    var dir = opt.clockwise !== false ? CW : CCW,
        a = dir[0], 
        b = dir[1],
        c = dir[2]

    var numIndices = count * 6

    var indices = array || new (dtype(type))(numIndices)
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
        var x = i + start
        indices[x + 0] = j + 0
        indices[x + 1] = j + 1
        indices[x + 2] = j + 2
        indices[x + 3] = j + a
        indices[x + 4] = j + b
        indices[x + 5] = j + c
    }
    return indices
}
},{"an-array":5,"dtype":10,"is-buffer":22}],38:[function(require,module,exports){
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var now = require('right-now')
var raf = require('raf')

module.exports = Engine
function Engine(fn) {
    if (!(this instanceof Engine)) 
        return new Engine(fn)
    this.running = false
    this.last = now()
    this._frame = 0
    this._tick = this.tick.bind(this)

    if (fn)
        this.on('tick', fn)
}

inherits(Engine, EventEmitter)

Engine.prototype.start = function() {
    if (this.running) 
        return
    this.running = true
    this.last = now()
    this._frame = raf(this._tick)
    return this
}

Engine.prototype.stop = function() {
    this.running = false
    if (this._frame !== 0)
        raf.cancel(this._frame)
    this._frame = 0
    return this
}

Engine.prototype.tick = function() {
    this._frame = raf(this._tick)
    var time = now()
    var dt = time - this.last
    this.emit('tick', dt)
    this.last = time
}
},{"events":11,"inherits":21,"raf":39,"right-now":40}],39:[function(require,module,exports){
(function (global){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function() {
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"performance-now":33}],40:[function(require,module,exports){
(function (global){
module.exports =
  global.performance &&
  global.performance.now ? function now() {
    return performance.now()
  } : Date.now || function now() {
    return +new Date
  }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],41:[function(require,module,exports){
var createLayout = require('layout-bmfont-text')
var inherits = require('inherits')
var createIndices = require('quad-indices')
var buffer = require('three-buffer-vertex-data')
var assign = require('object-assign')

var vertices = require('./lib/vertices')
var utils = require('./lib/utils')

var Base = THREE.BufferGeometry

module.exports = function createTextGeometry (opt) {
  return new TextGeometry(opt)
}

function TextGeometry (opt) {
  Base.call(this)

  if (typeof opt === 'string') {
    opt = { text: opt }
  }

  // use these as default values for any subsequent
  // calls to update()
  this._opt = assign({}, opt)

  // also do an initial setup...
  if (opt) this.update(opt)
}

inherits(TextGeometry, Base)

TextGeometry.prototype.update = function (opt) {
  if (typeof opt === 'string') {
    opt = { text: opt }
  }

  // use constructor defaults
  opt = assign({}, this._opt, opt)

  if (!opt.font) {
    throw new TypeError('must specify a { font } in options')
  }

  this.layout = createLayout(opt)

  // get vec2 texcoords
  var flipY = opt.flipY !== false

  // the desired BMFont data
  var font = opt.font

  // determine texture size from font file
  var texWidth = font.common.scaleW
  var texHeight = font.common.scaleH

  // get visible glyphs
  var glyphs = this.layout.glyphs.filter(function (glyph) {
    var bitmap = glyph.data
    return bitmap.width * bitmap.height > 0
  })

  // provide visible glyphs for convenience
  this.visibleGlyphs = glyphs

  // get common vertex data
  var positions = vertices.positions(glyphs)
  var uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY)
  var indices = createIndices({
    clockwise: true,
    type: 'uint16',
    count: glyphs.length
  })

  // update vertex data
  buffer.index(this, indices, 1, 'uint16')
  buffer.attr(this, 'position', positions, 2)
  buffer.attr(this, 'uv', uvs, 2)

  // update multipage data
  if (!opt.multipage && 'page' in this.attributes) {
    // disable multipage rendering
    this.removeAttribute('page')
  } else if (opt.multipage) {
    var pages = vertices.pages(glyphs)
    // enable multipage rendering
    buffer.attr(this, 'page', pages, 1)
  }
}

TextGeometry.prototype.getTextData = function ( opt ) {

  if (typeof opt === 'string') {
    opt = { text: opt }
  }

  // use constructor defaults
  opt = assign({}, this._opt, opt)

  if (!opt.font) {
    throw new TypeError('must specify a { font } in options')
  }

  this.layout = createLayout(opt)

  // get vec2 texcoords
  var flipY = opt.flipY !== false

  // the desired BMFont data
  var font = opt.font

  // determine texture size from font file
  var texWidth = font.common.scaleW
  var texHeight = font.common.scaleH

  // get visible glyphs
  var glyphs = this.layout.glyphs.filter(function (glyph) {
    var bitmap = glyph.data
    return bitmap.width * bitmap.height > 0
  })

  // provide visible glyphs for convenience
  this.visibleGlyphs = glyphs

  // get common vertex data
  var positions = vertices.positions(glyphs)
  var uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY)
  var indices = createIndices({
    clockwise: true,
    type: 'uint16',
    count: glyphs.length
  })

  return {

    indices: indices,
    positions: positions,
    uvs: uvs,
    width: this.layout.width,
    height: this.layout.height,

  }

}

TextGeometry.prototype.computeBoundingSphere = function () {
  if (this.boundingSphere === null) {
    this.boundingSphere = new THREE.Sphere()
  }

  var positions = this.attributes.position.array
  var itemSize = this.attributes.position.itemSize
  if (!positions || !itemSize || positions.length < 2) {
    this.boundingSphere.radius = 0
    this.boundingSphere.center.set(0, 0, 0)
    return
  }
  utils.computeSphere(positions, this.boundingSphere)
  if (isNaN(this.boundingSphere.radius)) {
    console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
      'Computed radius is NaN. The ' +
      '"position" attribute is likely to have NaN values.')
  }
}

TextGeometry.prototype.computeBoundingBox = function () {
  if (this.boundingBox === null) {
    this.boundingBox = new THREE.Box3()
  }

  var bbox = this.boundingBox
  var positions = this.attributes.position.array
  var itemSize = this.attributes.position.itemSize
  if (!positions || !itemSize || positions.length < 2) {
    bbox.makeEmpty()
    return
  }
  utils.computeBox(positions, bbox)
}

},{"./lib/utils":42,"./lib/vertices":43,"inherits":21,"layout-bmfont-text":24,"object-assign":27,"quad-indices":37,"three-buffer-vertex-data":46}],42:[function(require,module,exports){
var itemSize = 2
var box = { min: [0, 0], max: [0, 0] }

function bounds (positions) {
  var count = positions.length / itemSize
  box.min[0] = positions[0]
  box.min[1] = positions[1]
  box.max[0] = positions[0]
  box.max[1] = positions[1]

  for (var i = 0; i < count; i++) {
    var x = positions[i * itemSize + 0]
    var y = positions[i * itemSize + 1]
    box.min[0] = Math.min(x, box.min[0])
    box.min[1] = Math.min(y, box.min[1])
    box.max[0] = Math.max(x, box.max[0])
    box.max[1] = Math.max(y, box.max[1])
  }
}

module.exports.computeBox = function (positions, output) {
  bounds(positions)
  output.min.set(box.min[0], box.min[1], 0)
  output.max.set(box.max[0], box.max[1], 0)
}

module.exports.computeSphere = function (positions, output) {
  bounds(positions)
  var minX = box.min[0]
  var minY = box.min[1]
  var maxX = box.max[0]
  var maxY = box.max[1]
  var width = maxX - minX
  var height = maxY - minY
  var length = Math.sqrt(width * width + height * height)
  output.center.set(minX + width / 2, minY + height / 2, 0)
  output.radius = length / 2
}

},{}],43:[function(require,module,exports){
module.exports.pages = function pages (glyphs) {
  var pages = new Float32Array(glyphs.length * 4 * 1)
  var i = 0
  glyphs.forEach(function (glyph) {
    var id = glyph.data.page || 0
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
    pages[i++] = id
  })
  return pages
}

module.exports.uvs = function uvs (glyphs, texWidth, texHeight, flipY) {
  var uvs = new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data
    var bw = (bitmap.x + bitmap.width)
    var bh = (bitmap.y + bitmap.height)

    // top left position
    var u0 = bitmap.x / texWidth
    var v1 = bitmap.y / texHeight
    var u1 = bw / texWidth
    var v0 = bh / texHeight

    if (flipY) {
      v1 = (texHeight - bitmap.y) / texHeight
      v0 = (texHeight - bh) / texHeight
    }

    // BL
    uvs[i++] = u0
    uvs[i++] = v1
    // TL
    uvs[i++] = u0
    uvs[i++] = v0
    // TR
    uvs[i++] = u1
    uvs[i++] = v0
    // BR
    uvs[i++] = u1
    uvs[i++] = v1
  })
  return uvs
}

module.exports.positions = function positions (glyphs) {
  var positions = new Float32Array(glyphs.length * 4 * 2)
  var i = 0
  glyphs.forEach(function (glyph) {
    var bitmap = glyph.data

    // bottom left position
    var x = glyph.position[0] + bitmap.xoffset
    var y = glyph.position[1] + bitmap.yoffset

    // quad size
    var w = bitmap.width
    var h = bitmap.height

    // BL
    positions[i++] = x
    positions[i++] = y
    // TL
    positions[i++] = x
    positions[i++] = y + h
    // TR
    positions[i++] = x + w
    positions[i++] = y + h
    // BR
    positions[i++] = x + w
    positions[i++] = y
  })
  return positions
}

},{}],44:[function(require,module,exports){
var assign = require('object-assign');

module.exports = function createMSDFShader (opt) {
  opt = opt || {};
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1;
  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;
  var precision = opt.precision || 'highp';
  var color = opt.color;
  var map = opt.map;

  // remove to satisfy r73
  delete opt.map;
  delete opt.color;
  delete opt.precision;
  delete opt.opacity;

  return assign({
    uniforms: {
      opacity: { type: 'f', value: opacity },
      map: { type: 't', value: map || new THREE.Texture() },
      color: { type: 'c', value: new THREE.Color(color) }
    },
    vertexShader: [
      'attribute vec2 uv;',
      'attribute vec4 position;',
      'uniform mat4 projectionMatrix;',
      'uniform mat4 modelViewMatrix;',
      'varying vec2 vUv;',
      'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * position;',
      '}'
    ].join('\n'),
    fragmentShader: [
      '#ifdef GL_OES_standard_derivatives',
      '#extension GL_OES_standard_derivatives : enable',
      '#endif',
      'precision ' + precision + ' float;',
      'uniform float opacity;',
      'uniform vec3 color;',
      'uniform sampler2D map;',
      'varying vec2 vUv;',

      'float median(float r, float g, float b) {',
      '  return max(min(r, g), min(max(r, g), b));',
      '}',

      'void main() {',
      '  vec3 sample = 1.0 - texture2D(map, vUv).rgb;',
      '  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;',
      '  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);',
      '  gl_FragColor = vec4(color.xyz, alpha * opacity);',
      alphaTest === 0
        ? ''
        : '  if (gl_FragColor.a < ' + alphaTest + ') discard;',
      '}'
    ].join('\n')
  }, opt);
};

},{"object-assign":27}],45:[function(require,module,exports){
var assign = require('object-assign')

module.exports = function createSDFShader (opt) {
  opt = opt || {}
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1
  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001
  var precision = opt.precision || 'highp'
  var color = opt.color
  var map = opt.map

  // remove to satisfy r73
  delete opt.map
  delete opt.color
  delete opt.precision
  delete opt.opacity

  return assign({
    uniforms: {
      opacity: { type: 'f', value: opacity },
      map: { type: 't', value: map || new THREE.Texture() },
      color: { type: 'c', value: new THREE.Color(color) }
    },
    vertexShader: [
      'attribute vec2 uv;',
      'attribute vec4 position;',
      'uniform mat4 projectionMatrix;',
      'uniform mat4 modelViewMatrix;',
      'varying vec2 vUv;',
      'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * position;',
      '}'
    ].join('\n'),
    fragmentShader: [
      '#ifdef GL_OES_standard_derivatives',
      '#extension GL_OES_standard_derivatives : enable',
      '#endif',
      'precision ' + precision + ' float;',
      'uniform float opacity;',
      'uniform vec3 color;',
      'uniform sampler2D map;',
      'varying vec2 vUv;',

      'float aastep(float value) {',
      '  #ifdef GL_OES_standard_derivatives',
      '    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;',
      '  #else',
      '    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
      '  #endif',
      '  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
      '}',

      'void main() {',
      '  vec4 texColor = texture2D(map, vUv);',
      '  float alpha = aastep(texColor.a);',
      '  gl_FragColor = vec4 ( 0.5, 0.5, 0.5, 1.0 ); ',
      '  gl_FragColor.rgb *= 1.0 - alpha;',
      '  gl_FragColor.a *= opacity;',
      alphaTest === 0
        ? ''
        : '  if (gl_FragColor.a < ' + alphaTest + ') discard;',
      '}'
    ].join('\n')
  }, opt)
}

},{"object-assign":27}],46:[function(require,module,exports){
var flatten = require('flatten-vertex-data')
var warned = false;

module.exports.attr = setAttribute
module.exports.index = setIndex

function setIndex (geometry, data, itemSize, dtype) {
  if (typeof itemSize !== 'number') itemSize = 1
  if (typeof dtype !== 'string') dtype = 'uint16'

  var isR69 = !geometry.index && typeof geometry.setIndex !== 'function'
  var attrib = isR69 ? geometry.getAttribute('index') : geometry.index
  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
  if (newAttrib) {
    if (isR69) geometry.addAttribute('index', newAttrib)
    else geometry.index = newAttrib
  }
}

function setAttribute (geometry, key, data, itemSize, dtype) {
  if (typeof itemSize !== 'number') itemSize = 3
  if (typeof dtype !== 'string') dtype = 'float32'
  if (Array.isArray(data) &&
    Array.isArray(data[0]) &&
    data[0].length !== itemSize) {
    throw new Error('Nested vertex array has unexpected size; expected ' +
      itemSize + ' but found ' + data[0].length)
  }

  var attrib = geometry.getAttribute(key)
  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
  if (newAttrib) {
    geometry.addAttribute(key, newAttrib)
  }
}

function updateAttribute (attrib, data, itemSize, dtype) {
  data = data || []
  if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
    // create a new array with desired type
    data = flatten(data, dtype)

    var needsNewBuffer = attrib && typeof attrib.setArray !== 'function'
    if (!attrib || needsNewBuffer) {
      // We are on an old version of ThreeJS which can't
      // support growing / shrinking buffers, so we need
      // to build a new buffer
      if (needsNewBuffer && !warned) {
        warned = true
        console.warn([
          'A WebGL buffer is being updated with a new size or itemSize, ',
          'however this version of ThreeJS only supports fixed-size buffers.',
          '\nThe old buffer may still be kept in memory.\n',
          'To avoid memory leaks, it is recommended that you dispose ',
          'your geometries and create new ones, or update to ThreeJS r82 or newer.\n',
          'See here for discussion:\n',
          'https://github.com/mrdoob/three.js/pull/9631'
        ].join(''))
      }

      // Build a new attribute
      attrib = new THREE.BufferAttribute(data, itemSize);
    }

    attrib.itemSize = itemSize
    attrib.needsUpdate = true

    // New versions of ThreeJS suggest using setArray
    // to change the data. It will use bufferData internally,
    // so you can change the array size without any issues
    if (typeof attrib.setArray === 'function') {
      attrib.setArray(data)
    }

    return attrib
  } else {
    // copy data into the existing array
    flatten(data, attrib.array)
    attrib.needsUpdate = true
    return null
  }
}

// Test whether the attribute needs to be re-created,
// returns false if we can re-use it as-is.
function rebuildAttribute (attrib, data, itemSize) {
  if (attrib.itemSize !== itemSize) return true
  if (!attrib.array) return true
  var attribLength = attrib.array.length
  if (Array.isArray(data) && Array.isArray(data[0])) {
    // [ [ x, y, z ] ]
    return attribLength !== data.length * itemSize
  } else {
    // [ x, y, z ]
    return attribLength !== data.length
  }
  return false
}

},{"flatten-vertex-data":12}],47:[function(require,module,exports){
var inherits = require('inherits');
var getNormals = require('polyline-normals');
var VERTS_PER_POINT = 2;

module.exports = function createLineMesh (THREE) {
  function LineMesh (path, opt) {
    if (!(this instanceof LineMesh)) {
      return new LineMesh(path, opt);
    }
    THREE.BufferGeometry.call(this);

    if (Array.isArray(path)) {
      opt = opt || {};
    } else if (typeof path === 'object') {
      opt = path;
      path = [];
    }

    opt = opt || {};

    this.addAttribute('position', new THREE.BufferAttribute(undefined, 3));
    this.addAttribute('lineNormal', new THREE.BufferAttribute(undefined, 2));
    this.addAttribute('lineMiter', new THREE.BufferAttribute(undefined, 1));
    if (opt.distances) {
      this.addAttribute('lineDistance', new THREE.BufferAttribute(undefined, 1));
    }
    if (typeof this.setIndex === 'function') {
      this.setIndex(new THREE.BufferAttribute(undefined, 1));
    } else {
      this.addAttribute('index', new THREE.BufferAttribute(undefined, 1));
    }
    this.update(path, opt.closed);
  }

  inherits(LineMesh, THREE.BufferGeometry);

  LineMesh.prototype.update = function (path, closed) {
    path = path || [];
    var normals = getNormals(path, closed);

    if (closed) {
      path = path.slice();
      path.push(path[0]);
      normals.push(normals[0]);
    }

    var attrPosition = this.getAttribute('position');
    var attrNormal = this.getAttribute('lineNormal');
    var attrMiter = this.getAttribute('lineMiter');
    var attrDistance = this.getAttribute('lineDistance');
    var attrIndex = typeof this.getIndex === 'function' ? this.getIndex() : this.getAttribute('index');

    var indexCount = Math.max(0, (path.length - 1) * 6);
    if (!attrPosition.array ||
        (path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT)) {
      var count = path.length * VERTS_PER_POINT;
      attrPosition.array = new Float32Array(count * 3);
      attrNormal.array = new Float32Array(count * 2);
      attrMiter.array = new Float32Array(count);
      attrIndex.array = new Uint16Array(indexCount);

      if (attrDistance) {
        attrDistance.array = new Float32Array(count);
      }
    }

    if (undefined !== attrPosition.count) {
      attrPosition.count = count;
    }
    attrPosition.needsUpdate = true;

    if (undefined !== attrNormal.count) {
      attrNormal.count = count;
    }
    attrNormal.needsUpdate = true;

    if (undefined !== attrMiter.count) {
      attrMiter.count = count;
    }
    attrMiter.needsUpdate = true;

    if (undefined !== attrIndex.count) {
      attrIndex.count = indexCount;
    }
    attrIndex.needsUpdate = true;

    if (attrDistance) {
      if (undefined !== attrDistance.count) {
        attrDistance.count = count;
      }
      attrDistance.needsUpdate = true;
    }

    var index = 0;
    var c = 0;
    var dIndex = 0;
    var indexArray = attrIndex.array;

    path.forEach(function (point, pointIndex, list) {
      var i = index;
      indexArray[c++] = i + 0;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 3;

      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);

      if (attrDistance) {
        var d = pointIndex / (list.length - 1);
        attrDistance.setX(dIndex++, d);
        attrDistance.setX(dIndex++, d);
      }
    });

    var nIndex = 0;
    var mIndex = 0;
    normals.forEach(function (n) {
      var norm = n[0];
      var miter = n[1];
      attrNormal.setXY(nIndex++, norm[0], norm[1]);
      attrNormal.setXY(nIndex++, norm[0], norm[1]);

      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
    });
  };

  return LineMesh;
};

},{"inherits":21,"polyline-normals":35}],48:[function(require,module,exports){
var assign = require('object-assign');

module.exports = function (THREE) {
  return function (opt) {
    opt = opt || {};
    var thickness = typeof opt.thickness === 'number' ? opt.thickness : 0.1;
    var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1.0;
    var diffuse = opt.diffuse !== null ? opt.diffuse : 0xffffff;

    // remove to satisfy r73
    delete opt.thickness;
    delete opt.opacity;
    delete opt.diffuse;
    delete opt.precision;

    var ret = assign({
      uniforms: {
        thickness: { type: 'f', value: thickness },
        opacity: { type: 'f', value: opacity },
        diffuse: { type: 'c', value: new THREE.Color(diffuse) }
      },
      vertexShader: [
        'uniform float thickness;',
        'attribute float lineMiter;',
        'attribute vec2 lineNormal;',
        'void main() {',
        'vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiter, 0.0);',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 diffuse;',
        'uniform float opacity;',
        'void main() {',
        'gl_FragColor = vec4(diffuse, opacity);',
        '}'
      ].join('\n')
    }, opt);

    var threeVers = (parseInt(THREE.REVISION, 10) || 0) | 0;
    if (threeVers < 72) {
      // Old versions need to specify shader attributes
      ret.attributes = {
        lineMiter: { type: 'f', value: 0 },
        lineNormal: { type: 'v2', value: new THREE.Vector2() }
      };
    }
    return ret;
  };
};


},{"object-assign":27}],49:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],50:[function(require,module,exports){
var newline = /\n/
var newlineChar = '\n'
var whitespace = /\s/

module.exports = function(text, opt) {
    var lines = module.exports.lines(text, opt)
    return lines.map(function(line) {
        return text.substring(line.start, line.end)
    }).join('\n')
}

module.exports.lines = function wordwrap(text, opt) {
    opt = opt||{}

    //zero width results in nothing visible
    if (opt.width === 0 && opt.mode !== 'nowrap') 
        return []

    text = text||''
    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE
    var start = Math.max(0, opt.start||0)
    var end = typeof opt.end === 'number' ? opt.end : text.length
    var mode = opt.mode

    var measure = opt.measure || monospace
    if (mode === 'pre')
        return pre(measure, text, start, end, width)
    else
        return greedy(measure, text, start, end, width, mode)
}

function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start)
    if (idx === -1 || idx > end)
        return end
    return idx
}

function isWhitespace(chr) {
    return whitespace.test(chr)
}

function pre(measure, text, start, end, width) {
    var lines = []
    var lineStart = start
    for (var i=start; i<end && i<text.length; i++) {
        var chr = text.charAt(i)
        var isNewline = newline.test(chr)

        //If we've reached a newline, then step down a line
        //Or if we've reached the EOF
        if (isNewline || i===end-1) {
            var lineEnd = isNewline ? i : i+1
            var measured = measure(text, lineStart, lineEnd, width)
            lines.push(measured)
            
            lineStart = i+1
        }
    }
    return lines
}

function greedy(measure, text, start, end, width, mode) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    var lines = []

    var testWidth = width
    //if 'nowrap' is specified, we only wrap on newline chars
    if (mode === 'nowrap')
        testWidth = Number.MAX_VALUE

    while (start < end && start < text.length) {
        //get next newline position
        var newLine = idxOf(text, newlineChar, start, end)

        //eat whitespace at start of line
        while (start < newLine) {
            if (!isWhitespace( text.charAt(start) ))
                break
            start++
        }

        //determine visible # of glyphs for the available width
        var measured = measure(text, start, newLine, testWidth)

        var lineEnd = start + (measured.end-measured.start)
        var nextStart = lineEnd + newlineChar.length

        //if we had to cut the line before the next newline...
        if (lineEnd < newLine) {
            //find char to break on
            while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd)))
                    break
                lineEnd--
            }
            if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--
                lineEnd = nextStart // If no characters to break, show all.
            } else {
                nextStart = lineEnd
                //eat whitespace at end of line
                while (lineEnd > start) {
                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
                        break
                    lineEnd--
                }
            }
        }
        if (lineEnd >= start) {
            var result = measure(text, start, lineEnd, testWidth)
            lines.push(result)
        }
        start = nextStart
    }
    return lines
}

//determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
    var glyphs = Math.min(width, end-start)
    return {
        start: start,
        end: start+glyphs
    }
}
},{}],51:[function(require,module,exports){
"use strict";
var window = require("global/window")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            setTimeout(loadFunc, 0)
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer
    var failureResponse = {
        body: undefined,
        headers: {},
        statusCode: 0,
        method: method,
        url: uri,
        rawRequest: xhr
    }

    if ("json" in options && options.json !== false) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json === true ? body : options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.onabort = function(){
        aborted = true;
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            if (aborted) return
            aborted = true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.
    xhr.send(body || null)

    return xhr


}

function getXml(xhr) {
    if (xhr.responseType === "document") {
        return xhr.responseXML
    }
    var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML
    }

    return null
}

function noop() {}

},{"global/window":19,"is-function":23,"parse-headers":32,"xtend":53}],52:[function(require,module,exports){
module.exports = (function xmlparser() {
  //common browsers
  if (typeof self.DOMParser !== 'undefined') {
    return function(str) {
      var parser = new self.DOMParser()
      return parser.parseFromString(str, 'application/xml')
    }
  } 

  //IE8 fallback
  if (typeof self.ActiveXObject !== 'undefined'
      && new self.ActiveXObject('Microsoft.XMLDOM')) {
    return function(str) {
      var xmlDoc = new self.ActiveXObject("Microsoft.XMLDOM")
      xmlDoc.async = "false"
      xmlDoc.loadXML(str)
      return xmlDoc
    }
  }

  //last resort fallback
  return function(str) {
    var div = document.createElement('div')
    div.innerHTML = str
    return div
  }
})()

},{}],53:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.BlackMatter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BlackMatter = exports.BlackMatter = function (_PhysicalElement) {
		_inherits(BlackMatter, _PhysicalElement);

		function BlackMatter(_options) {
				_classCallCheck(this, BlackMatter);

				var _this = _possibleConstructorReturn(this, (BlackMatter.__proto__ || Object.getPrototypeOf(BlackMatter)).call(this, _options));

				_this.targetScale = vec3.clone(_this.scale);
				_this.scale = vec3.create();
				_this.applyForce([(Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300]);

				_this.maxMass = _this.mass;
				_this.targetMass = _this.maxMass;
				_this.mass = 0;

				_this.enabled = true;

				return _this;
		}

		_createClass(BlackMatter, [{
				key: "update",
				value: function update() {

						_get(BlackMatter.prototype.__proto__ || Object.getPrototypeOf(BlackMatter.prototype), "update", this).call(this);

						this.scale[0] += (this.targetScale[0] - this.scale[0]) * 0.07;
						this.scale[1] += (this.targetScale[1] - this.scale[1]) * 0.07;
						this.scale[2] += (this.targetScale[2] - this.scale[2]) * 0.07;

						this.mass = this.scale[0] / this.targetScale[0] * this.targetMass;
						this.targetMass = this.maxMass * this.lifePercent;

						this.color[3] = this.lifePercent;
				}
		}]);

		return BlackMatter;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.ElectricLevel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _LevelCore2 = require("./LevelCore");

var _shaderHelper = require("./shaderHelper");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ElectricLevel = exports.ElectricLevel = function (_LevelCore) {
		_inherits(ElectricLevel, _LevelCore);

		function ElectricLevel(_options) {
				_classCallCheck(this, ElectricLevel);

				try {
						var _this = _possibleConstructorReturn(this, (ElectricLevel.__proto__ || Object.getPrototypeOf(ElectricLevel)).call(this, _options));

						_this.build();
				} catch (e) {

						console.error(e);
				}

				_this.ready = false;
				_this.createdInstance = null;
				_this.currentInstance = null;
				_this.mouseOnDown = null;

				// Build scan background

				var maxScale = _this.getWorldRight() > _this.getWorldTop() ? _this.getWorldRight() * 2 : _this.getWorldTop() * 2;
				_this.scanGeometry = new THREE.PlaneGeometry(1, 1, 150, 150);
				_this.scanMaterial = new THREE.ShaderMaterial({

						vertexShader: _shaderHelper.shaderHelper.equipotentialLines.vertex,
						fragmentShader: _shaderHelper.shaderHelper.equipotentialLines.fragment,
						transparent: true,

						uniforms: {

								numCharges: { value: 0 },
								charges: { value: [0, 0, 0] }

						}

				});

				_this.scanMesh = new THREE.Mesh(_this.scanGeometry, _this.scanMaterial);
				_this.scanMesh.renderOrder = 0;
				_this.scanMesh.scale.set(maxScale, maxScale, 1.0);
				_this.scanScene.add(_this.scanMesh);
				_this.scanMaterial.extensions.derivatives = true;

				_this.canUpdateTexts = true;
				_this.won = false;

				return _this;
		}

		_createClass(ElectricLevel, [{
				key: "build",
				value: function build() {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "build", this).call(this);

						this.onLoad(function () {

								this.gameElements.arrival.instances[0].position[1] = this.getWorldBottom() + 0.5;
						}.bind(this));
				}
		}, {
				key: "onUp",
				value: function onUp(_position) {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "onUp", this).call(this, _position);

						this.currentInstance = null;
						this.createdInstance = null;
				}
		}, {
				key: "onDown",
				value: function onDown(_position) {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "onDown", this).call(this, _position);

						if (!this.activeScreen) {

								this.currentInstance = this.checkCharges(vec3.fromValues(this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z));

								if (!this.currentInstance) {

										this.createdInstance = this.addInstanceOf('charges', {

												position: [this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z],
												color: [0.0, 0.0, 0.0, 1.0],
												rotation: [0, 0, Math.random() * Math.PI * 2],
												mass: 15,
												drag: 0.85,
												enabled: true

										});
								}
						}

						this.mouseOnDown = vec3.fromValues(this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z);
				}
		}, {
				key: "onClick",
				value: function onClick(_position) {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "onClick", this).call(this, _position);
				}
		}, {
				key: "onMove",
				value: function onMove(_position) {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "onMove", this).call(this, _position);
				}
		}, {
				key: "onDrag",
				value: function onDrag(_position) {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "onDrag", this).call(this, _position);

						var mouse = vec3.fromValues(this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z);

						if (this.createdInstance) {

								var dist = vec3.length(vec3.sub(vec3.create(), this.createdInstance.position, mouse));
								var yDist = mouse[1] - this.createdInstance.position[1];
								this.createdInstance.sign = Math.sign(yDist);
								this.createdInstance.targetRadius = dist;
						} else if (this.currentInstance && this.currentInstance.element.enabled) {

								var dir = null;
								var _dist = null;
								var _yDist = null;

								switch (this.currentInstance.type) {

										case 'center':

												// this.currentInstance.element.targetPosition = mouse;

												// this.currentInstance.element.targetRadius = 0;

												break;

										case 'edge':

												_dist = vec3.length(vec3.sub(vec3.create(), this.currentInstance.element.position, mouse));
												_yDist = mouse[1] - this.currentInstance.element.position[1];
												this.currentInstance.element.sign = Math.sign(_yDist);
												this.currentInstance.element.targetRadius = _dist;

												break;

								}
						}
				}
		}, {
				key: "onResize",
				value: function onResize() {

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "onResize", this).call(this);

						var maxScale = this.getWorldRight() > this.getWorldTop() ? this.getWorldRight() * 2 : this.getWorldTop() * 2;
						this.scanMesh.scale.set(maxScale, maxScale, 1.0);
				}
		}, {
				key: "update",
				value: function update() {

						// Check if all is loaded.

						if (!this.ready) {

								if (Object.keys(this.gameElements).length == this.elementToLoad) {

										this.updateRenderer();
										this.ready = true;
										// this.start = this.getInstanceByName ( 'goals', 'top' );
										// this.arrival = this.getInstanceByName ( 'goals', 'bottom' );
										this.arrivedInGame = false;
										this.gameElements.player.instances[0].mass = 400;
										this.gameElements.player.instances[0].enabled = true;
										this.resetPlayer();
								} else {

										return;
								}
						}

						_get(ElectricLevel.prototype.__proto__ || Object.getPrototypeOf(ElectricLevel.prototype), "update", this).call(this);

						if (!this.won && this.levelCompleted) {

								if (this.onWinCallback) this.onWinCallback(this.levelFile);
								this.won = true;
						}

						if (this.levelCompleted) {

								var _charges = this.gameElements.charges.instances;
								var _fixedCharges = this.gameElements.fixedCharges.instances;

								for (var i = 0; i < _charges.length; i++) {

										_charges[i].kill();
								}

								for (var _i = 0; _i < _fixedCharges.length; _i++) {

										_fixedCharges[_i].kill();
								}

								// return;
						}

						// main player

						var player = this.gameElements.player.instances[0];
						if (this.checkEdges(player.position, 0.2) && !this.levelCompleted) this.resetPlayer();

						// Obstacles

						var obstacles = this.gameElements.obstacles.instances;

						for (var _i2 = 0; _i2 < obstacles.length; _i2++) {

								var obstacle = obstacles[_i2];

								if (this.isInBox(obstacle, player.position)) {

										if (!this.levelCompleted) this.resetPlayer();
										break;
								}
						}

						// Compute te electric force
						// F = k * ( q1 * q2 ) / r^2
						// F = q * E
						// E = k * Q / r * r

						var forceResult = vec3.create();

						// Fixed charges

						var fixedCharges = this.gameElements.fixedCharges.instances;
						var chargesUniform = [];

						for (var _i3 = 0; _i3 < fixedCharges.length; _i3++) {

								var charge = fixedCharges[_i3];

								chargesUniform.push(charge.position[0]);
								chargesUniform.push(charge.position[1]);
								chargesUniform.push(Math.abs(charge.charge / charge.maxCharge) * charge.sign);

								var dist = vec3.length(vec3.sub(vec3.create(), charge.position, player.position));

								if (dist < charge.radius) {

										if (!this.levelCompleted) this.resetPlayer();
								} else {

										var force = this.computeElectricForce(charge, player);
										vec3.add(forceResult, forceResult, force);
								}
						}

						// Charges

						// Update current charge

						if (this.currentInstance && this.currentInstance.type == 'center') {

								var dir = vec3.sub(vec3.create(), this.glMouseWorld, this.currentInstance.element.position);
								this.currentInstance.element.applyForce(dir);
						}

						var charges = this.gameElements.charges.instances;

						for (var _i4 = 0; _i4 < charges.length; _i4++) {

								var _charge = charges[_i4];

								if (this.checkEdges(_charge.position, 0.2)) {

										_charge.update();
										if (!_charge.killed) {

												_charge.kill();
										}
								}

								chargesUniform.push(_charge.position[0]);
								chargesUniform.push(_charge.position[1]);
								chargesUniform.push(Math.abs(_charge.charge / _charge.maxCharge) * _charge.sign);

								var _dist2 = vec3.length(vec3.sub(vec3.create(), _charge.position, player.position));

								if (_dist2 < _charge.radius) {

										if (!this.levelCompleted) this.resetPlayer();
								} else {

										var _force = this.computeElectricForce(_charge, player);
										vec3.add(forceResult, forceResult, _force);
								}

								// Check overlapping charges.

								for (var j = 0; j < charges.length; j++) {

										if (j != _i4) {

												var _dir = vec3.sub(vec3.create(), _charge.position, charges[j].position);
												var _dist3 = vec3.length(_dir);
												var minDist = _charge.scale[0] + charges[j].scale[0];
												var offset = -0.15;

												if (_dist3 < minDist + offset) {

														vec3.scale(_dir, _dir, Math.pow(minDist - _dist3, 3) * 5);
														_charge.applyForce(_dir);
												}
										}
								}

								for (var _j = 0; _j < fixedCharges.length; _j++) {

										var _dir2 = vec3.sub(vec3.create(), _charge.position, fixedCharges[_j].position);
										var _dist4 = vec3.length(_dir2);
										var _minDist = _charge.scale[0] + fixedCharges[_j].scale[0];
										var _offset = -0.07;

										if (_dist4 < _minDist + _offset) {

												vec3.scale(_dir2, _dir2, Math.pow(_minDist - _dist4, 2) * 5);
												_charge.applyForce(_dir2);
										}
								}
						}

						if (chargesUniform.length > 0) {

								this.scanMaterial.uniforms.numCharges.value = chargesUniform.length / 3;
								this.scanMaterial.uniforms.charges.value = chargesUniform;
						}

						if (!this.levelCompleted) player.applyForce(forceResult);

						// Update the particles emitted by the player.

						var playerParticles = this.gameElements.playerParticles.instances;

						for (var _j2 = 0; _j2 < playerParticles.length; _j2++) {

								var particle = playerParticles[_j2];

								var _dir3 = vec3.sub(vec3.create(), player.position, particle.position);
								var _dist5 = vec3.length(_dir3);

								vec3.normalize(_dir3, _dir3);
								vec3.scale(_dir3, _dir3, 1 / Math.pow(_dist5 + 1.0, 2) * 2);

								particle.applyForce(_dir3);

								for (var _i5 = 0; _i5 < charges.length; _i5++) {

										var _charge2 = charges[_i5];

										var _dir4 = vec3.sub(vec3.create(), _charge2.position, particle.position);
										var _minDist2 = _charge2.scale[0] + particle.scale[0];
										var _dist6 = vec3.length(_dir4);

										if (_dist6 < _minDist2) {

												vec3.scale(_dir4, _dir4, -(_minDist2 - _dist6) * 100);
												particle.applyForce(_dir4);
										} else {

												var _force2 = this.computeElectricForce(_charge2, particle);
												particle.applyForce(vec3.scale(_force2, _force2, 0.5));
										}
								}
						}

						// Update FX particles

						for (var _i6 = 0; _i6 < 2; _i6++) {

								var instance = this.addInstanceOf('playerParticles', {

										enabled: Math.random() > 0.05 ? true : false,
										position: vec3.clone(player.position),
										canDye: true,
										lifeSpan: Math.random() * 1000 + 1000,
										drag: 0.95,
										mass: Math.random() * 100 + 200,
										initialRadius: Math.random() * 0.06 + 0.03,
										velocity: vec3.scale(vec3.create(), vec3.clone(player.velocity), 0.1)

								});

								instance.applyForce(vec3.fromValues((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30));
						}

						// Update texts

						if (!this.infoScreenOpened) return;

						if (this.canUpdateTexts) {

								this.canUpdateTexts = false;
								this.updateTexts();
								setTimeout(function () {

										this.canUpdateTexts = true;
								}.bind(this), 5);
						}
				}
		}, {
				key: "updateTexts",
				value: function updateTexts() {

						if (!this.textsGeometry) return;

						var player = this.gameElements.player.instances[0];
						var points = this.gameElements.charges.textPoints;

						var indices = [];
						var positions = [];
						var uvs = [];

						var modelMatrix = mat4.create();

						var fixedChargesPoints = this.gameElements.fixedCharges.textPoints;

						for (var pp in fixedChargesPoints) {

								var point = fixedChargesPoints[pp].point;
								var instances = fixedChargesPoints[pp].instances;

								var totalForce = 0;
								var totalMass = 0;
								var hack = false;

								for (var i = 0; i < instances.length; i++) {

										totalForce += vec3.length(this.computeElectricForce(instances[i], player));
										totalMass += instances[i].mass;

										if (instances[i].hack) hack = true;
								}

								var textData = this.textsGeometry.getTextData(totalMass + ' kg\n' + Math.floor(totalForce * 100) / 100 + ' N');

								mat4.identity(modelMatrix);
								mat4.translate(modelMatrix, modelMatrix, [point[0] - textData.width * 0.0025 * 0.5, -point[1] + 0.1 + textData.height * 0.0025, 0]);
								mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.0025, 0.0025, 0.0025));

								if (!hack) {

										for (var j = 0; j < textData.indices.length; j++) {

												indices.push(textData.indices[j] + positions.length / 2);
										}

										for (var _j3 = 0; _j3 < textData.positions.length; _j3 += 2) {

												var v = [textData.positions[_j3 + 0], textData.positions[_j3 + 1], 0];
												vec3.transformMat4(v, v, modelMatrix);

												positions.push(v[0]);
												positions.push(v[1]);
										}

										for (var _j4 = 0; _j4 < textData.uvs.length; _j4++) {

												uvs.push(textData.uvs[_j4]);
										}
								}
						}

						for (var p in points) {

								var _point = points[p].point;
								var _instances = points[p].instances;

								var _totalForce = 0;
								var _totalMass = 0;

								for (var _i7 = 0; _i7 < _instances.length; _i7++) {

										_totalForce += vec3.length(this.computeElectricForce(_instances[_i7], player));
										_totalMass += _instances[_i7].mass;
								}

								var _textData = this.textsGeometry.getTextData(Math.floor(_totalMass) + ' kg\n' + Math.floor(_totalForce * 100) / 100 + ' N');

								mat4.identity(modelMatrix);
								mat4.translate(modelMatrix, modelMatrix, [_point[0] - _textData.width * 0.0025 * 0.5, -_point[1] - 0.1, 0]);
								mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.0025, 0.0025, 0.0025));

								for (var _j5 = 0; _j5 < _textData.indices.length; _j5++) {

										indices.push(_textData.indices[_j5] + positions.length / 2);
								}

								for (var _j6 = 0; _j6 < _textData.positions.length; _j6 += 2) {

										var _v = [_textData.positions[_j6 + 0], _textData.positions[_j6 + 1], 0];
										vec3.transformMat4(_v, _v, modelMatrix);

										positions.push(_v[0]);
										positions.push(_v[1]);
								}

								for (var _j7 = 0; _j7 < _textData.uvs.length; _j7++) {

										uvs.push(_textData.uvs[_j7]);
								}
						}

						if (positions.length > 0) {

								this.dynamicBuffer.index(this.textsGeometry, indices, 1);
								this.dynamicBuffer.attr(this.textsGeometry, 'position', positions, 2);
								this.dynamicBuffer.attr(this.textsGeometry, 'uv', uvs, 2);
						} else {

								var _textData2 = this.textsGeometry.getTextData('');

								this.dynamicBuffer.index(this.textsGeometry, _textData2.indices, 1);
								this.dynamicBuffer.attr(this.textsGeometry, 'position', _textData2.positions, 2);
								this.dynamicBuffer.attr(this.textsGeometry, 'uv', _textData2.uvs, 2);
						}
				}
		}, {
				key: "checkCharges",
				value: function checkCharges(_position) {

						var totalCharges = [];
						var charges = this.gameElements.charges.instances;
						var fixedCharges = this.gameElements.fixedCharges.instances;

						totalCharges = totalCharges.concat(charges);
						totalCharges = totalCharges.concat(fixedCharges);

						for (var i = 0; i < totalCharges.length; i++) {

								var rangeCenter = totalCharges[i].radius * 0.5;
								var distToCenter = vec3.length(vec3.sub(vec3.create(), totalCharges[i].position, _position));

								var rangeEdge = 0.2;
								var distToEdge = Math.abs(distToCenter - totalCharges[i].radius);

								if (distToEdge < rangeEdge) {

										var tC = totalCharges[i];

										return {

												element: tC,
												type: 'edge'

										};
								} else if (distToEdge > rangeEdge && distToCenter < totalCharges[i].radius) {

										var _tC = totalCharges[i];

										return {

												element: _tC,
												type: 'center'

										};
								}
						}

						return null;
				}
		}, {
				key: "computeElectricForce",
				value: function computeElectricForce(_e1, _e2) {

						var k = 8.99 * Math.pow(10, 1.5); // Here we tweak a little bit the real values.
						var dir = vec3.sub(vec3.create(), _e1.position, _e2.position);
						var dist = vec3.length(dir);

						vec3.normalize(dir, dir);
						var mag = k * (_e1.charge * _e2.charge) / Math.pow(dist, 2);

						return vec3.scale(dir, dir, mag);
				}
		}, {
				key: "resetPlayer",
				value: function resetPlayer() {

						this.explosionSound();
						this.gameElements.player.instances[0].color[3] = 0;
						this.gameElements.player.instances[0].position = vec3.fromValues(0, this.getWorldTop() + 0.1, 0);
						this.gameElements.player.instances[0].velocity = vec3.create();
						this.gameElements.player.instances[0].applyForce([0, -10, 0]);
				}
		}, {
				key: "reloadLevel",
				value: function reloadLevel() {

						var charges = this.gameElements.charges.instances;

						for (var i = charges.length - 1; i >= 0; i--) {

								charges[i].kill();
						}
				}
		}]);

		return ElectricLevel;
}(_LevelCore2.LevelCore);

},{"./LevelCore":61,"./shaderHelper":69}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.ElectricParticle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ElectricParticle = exports.ElectricParticle = function (_PhysicalElement) {
		_inherits(ElectricParticle, _PhysicalElement);

		function ElectricParticle(_options) {
				_classCallCheck(this, ElectricParticle);

				var _this = _possibleConstructorReturn(this, (ElectricParticle.__proto__ || Object.getPrototypeOf(ElectricParticle)).call(this, _options));

				_this.isKilled = false;

				// Charge

				_this.chargeDenominator = -3;
				_this.sign = _options.sign || (Math.random() > 0.3 ? 1 : -1);
				_this.minCharge = _options.minCharge || -10.0 * Math.pow(10, _this.chargeDenominator);
				_this.maxCharge = _options.maxCharge || 10.0 * Math.pow(10, _this.chargeDenominator);

				_this.charge = _options.charge || 1; // μC ( micro Coulombs );

				// Scale

				_this.maxRadius = _options.maxRadius || 0.8;
				_this.minRadius = _options.minRadius || 0.25;
				_this.rangeScale = _this.maxRadius - _this.minRadius;
				_this.targetRadius = _options.targetRadius || 0.2;
				_this.radius = 0;

				// Position

				_this.targetPosition = vec3.clone(_this.position);

				// Color

				_this.neutralColor = vec4.fromValues(0.7, 0.7, 0.7, 1.0);
				_this.positiveColor = vec4.fromValues(252 / 255 + rCV(), 74 / 255 + rCV(), 50 / 255 + rCV(), 1.0);
				_this.negativeColor = vec4.fromValues(50 / 255 + rCV(), 104 / 255 + rCV(), 252 / 255 + rCV(), 1.0);
				_this.color = vec4.clone(_this.neutralColor);
				_this.alphaTarget = 1.0;

				function rCV() {

						return (Math.random() - 0.5) * 0.1;
				}

				return _this;
		}

		_createClass(ElectricParticle, [{
				key: "update",
				value: function update() {

						_get(ElectricParticle.prototype.__proto__ || Object.getPrototypeOf(ElectricParticle.prototype), "update", this).call(this);

						// Clamp scale 

						if (this.targetRadius > this.maxRadius) {

								this.targetRadius = this.maxRadius;
						} else if (this.targetRadius < this.minRadius) {

								this.targetRadius = this.minRadius;
						}

						// Interpolate scale changes to make a smooth animation.

						this.color[3] += (this.alphaTarget - this.color[3]) * 0.05;
						this.radius += (this.targetRadius - this.radius) * 0.1;
						this.scale = vec3.fromValues(this.radius, this.radius, this.radius);

						// Change the value of the color acoording to the charge.

						if (this.charge > 0.0001) {

								this.color[0] += (this.positiveColor[0] - this.color[0]) * 0.05;
								this.color[1] += (this.positiveColor[1] - this.color[1]) * 0.05;
								this.color[2] += (this.positiveColor[2] - this.color[2]) * 0.05;
						} else if (this.charge < -0.0001) {

								this.color[0] += (this.negativeColor[0] - this.color[0]) * 0.05;
								this.color[1] += (this.negativeColor[1] - this.color[1]) * 0.05;
								this.color[2] += (this.negativeColor[2] - this.color[2]) * 0.05;
						} else {

								this.color[0] += (this.neutralColor[0] - this.color[0]) * 0.05;
								this.color[1] += (this.neutralColor[1] - this.color[1]) * 0.05;
								this.color[2] += (this.neutralColor[2] - this.color[2]) * 0.05;
						}

						// Update charge according to the size.

						this.charge = (this.radius - this.minRadius) / this.maxRadius * this.maxCharge * this.sign;

						// Update the position.

						var dir = vec3.sub(vec3.create(), this.targetPosition, this.position);
						vec3.scale(dir, dir, 0.5);
						// this.applyForce ( dir );
				}
		}, {
				key: "kill",
				value: function kill() {

						if (this.killed) return;
						this.isKilled = true;
						this.canDye = true;

						setTimeout(function () {

								this.alphaTarget = 0;
								this.targetRadius = this.minRadius;

								setTimeout(function () {

										this.lifeLeft = 0;
								}.bind(this), 1000);
						}.bind(this), Math.random() * 500);
				}
		}]);

		return ElectricParticle;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.ElectricPlanetParticle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ElectricPlanetParticle = exports.ElectricPlanetParticle = function (_PhysicalElement) {
		_inherits(ElectricPlanetParticle, _PhysicalElement);

		function ElectricPlanetParticle(_options) {
				_classCallCheck(this, ElectricPlanetParticle);

				// Charge

				var _this = _possibleConstructorReturn(this, (ElectricPlanetParticle.__proto__ || Object.getPrototypeOf(ElectricPlanetParticle)).call(this, _options));

				_this.chargeDenominator = -3;
				_this.sign = _options.sign || (Math.random() > 0.5 ? 1 : -1);
				_this.minCharge = _options.minCharge || -10.0 * Math.pow(10, _this.chargeDenominator);
				_this.maxCharge = _options.maxCharge || 10.0 * Math.pow(10, _this.chargeDenominator);

				_this.charge = 0; // μC ( micro Coulombs );

				// Scale

				_this.maxRadius = _options.maxRadius || 20;
				_this.minRadius = _options.minRadius || 0.0;
				_this.rangeScale = _this.maxRadius - _this.minRadius;
				_this.radius = _options.radius || 0.2;
				_this.targetRadius = Math.random() * 0.1 + 0.07;

				// Position

				_this.targetPosition = vec3.clone(_this.position);

				// Color

				_this.neutralColor = vec4.fromValues(0.8, 0.8, 0.8, 1.0);
				_this.positiveColor = vec4.fromValues(252 / 255 + rCV(), 74 / 255 + rCV(), 50 / 255 + rCV(), 1.0);
				_this.negativeColor = vec4.fromValues(50 / 255 + rCV(), 104 / 255 + rCV(), 252 / 255 + rCV(), 1.0);
				_this.color = vec4.clone(_this.neutralColor);

				function rCV() {

						return (Math.random() - 0.5) * 0.1;
				}

				return _this;
		}

		_createClass(ElectricPlanetParticle, [{
				key: "update",
				value: function update() {

						_get(ElectricPlanetParticle.prototype.__proto__ || Object.getPrototypeOf(ElectricPlanetParticle.prototype), "update", this).call(this);

						// Clamp scale 

						if (this.targetRadius > this.maxRadius) {

								this.targetRadius = this.maxRadius;
						} else if (this.targetRadius < this.minRadius) {

								this.targetRadius = this.minRadius;
						}

						// Interpolate scale changes to make a smooth animation.

						this.radius += (this.targetRadius - this.radius) * 0.1;
						this.scale = vec3.fromValues(this.radius, this.radius, this.radius);

						// Change the value of the color acoording to the charge.

						if (this.charge > 0.0001) {

								this.color[0] += (this.positiveColor[0] - this.color[0]) * 0.05;
								this.color[1] += (this.positiveColor[1] - this.color[1]) * 0.05;
								this.color[2] += (this.positiveColor[2] - this.color[2]) * 0.05;
						} else if (this.charge < -0.0001) {

								this.color[0] += (this.negativeColor[0] - this.color[0]) * 0.05;
								this.color[1] += (this.negativeColor[1] - this.color[1]) * 0.05;
								this.color[2] += (this.negativeColor[2] - this.color[2]) * 0.05;
						} else {

								this.color[0] += (this.neutralColor[0] - this.color[0]) * 0.05;
								this.color[1] += (this.neutralColor[1] - this.color[1]) * 0.05;
								this.color[2] += (this.neutralColor[2] - this.color[2]) * 0.05;
						}

						// Update the position.

						var dir = vec3.sub(vec3.create(), this.targetPosition, this.position);
						vec3.scale(dir, dir, 1);
						this.applyForce(dir);
				}
		}]);

		return ElectricPlanetParticle;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ElementCore = exports.ElementCore = function () {
		function ElementCore(_options) {
				_classCallCheck(this, ElementCore);

				_options = _options || {};

				this.type = this.constructor.name;
				this.name = _options.name || 'gameElement';
				this.color = _options.color || [1, 1, 1, 1];
				this.enabled = _options.enabled;

				this.canDye = _options.canDye || false;
				this.lifeSpan = _options.lifeSpan || 10000.0;
				this.lifeLeft = _options.lifeLeft || this.lifeSpan;

				this.lastTime = performance.now();
				this.time = this.lastTime;
				this.deltaTime = this.time - this.lastTime;

				this.lifeStartMultiplier = 0;
				this.lifeStartSpeed = _options.lifeStartSpeed || 0.05;

				for (var o in _options) {

						if (!this[o]) this[o] = _options[o];
				}
		}

		_createClass(ElementCore, [{
				key: 'update',
				value: function update() {

						this.time = performance.now();
						this.deltaTime = this.time - this.lastTime;
						this.lastTime = this.time;

						this.lifeStartMultiplier += (1 - this.lifeStartMultiplier) * this.lifeStartSpeed;
						this.lifeLeft -= this.deltaTime;

						// Clamp the value when it reaches 0.

						this.lifeLeft = Math.max(0, this.lifeLeft);
				}
		}, {
				key: 'isDead',
				value: function isDead() {

						if (!this.canDye) return false;
						if (this.lifeLeft > 0) return false;else return true;
				}
		}, {
				key: 'lifePercent',
				get: function get() {

						return this.lifeLeft / this.lifeSpan;
				}
		}]);

		return ElementCore;
}();

},{}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.GravityElectricLevel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _utils = require('../utils');

var _shaderHelper = require('./shaderHelper');

var _LevelCore2 = require('./LevelCore');

var _Text = require('./Text');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GravityElectricLevel = exports.GravityElectricLevel = function (_LevelCore) {
		_inherits(GravityElectricLevel, _LevelCore);

		function GravityElectricLevel(_options) {
				_classCallCheck(this, GravityElectricLevel);

				try {
						var _this = _possibleConstructorReturn(this, (GravityElectricLevel.__proto__ || Object.getPrototypeOf(GravityElectricLevel)).call(this, _options));

						_this.build();
				} catch (e) {

						console.error(e);
				}

				_this.activePlanet = null;
				_this.canUpdateTexts = true;

				_this.won = false;

				return _this;
		}

		_createClass(GravityElectricLevel, [{
				key: 'build',
				value: function build() {

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'build', this).call(this);

						// Build the scan background.
						// Electric Potential of the planets
						var maxScale = this.getWorldRight() > this.getWorldTop() ? this.getWorldRight() * 2 : this.getWorldTop() * 2;
						var scanElectricGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
						this.scanElectricMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.equipotentialLines.vertex,
								fragmentShader: _shaderHelper.shaderHelper.equipotentialLines.fragment,

								uniforms: {

										numCharges: { value: 0 },
										charges: { value: [0, 0, 0] }

								},

								transparent: true

						});

						this.scanElectric = new THREE.Mesh(scanElectricGeometry, this.scanElectricMaterial);
						this.scanElectric.scale.set(maxScale, maxScale, 1.0);
						this.scanScene.add(this.scanElectric);
						this.scanElectricMaterial.extensions.derivatives = true;

						// Gravity bending

						this.scanGravityMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.grid.vertex,
								fragmentShader: _shaderHelper.shaderHelper.grid.fragment,

								uniforms: {

										gridSubdivisions: { value: 60 },
										mainAlpha: { value: 0.5 },
										numMasses: { value: 0 },
										masses: { value: [0, 0, 0] }

								},

								transparent: true

						});

						this.scanGravity = new THREE.Mesh(scanElectricGeometry, this.scanGravityMaterial);
						this.scanGravity.scale.set(maxScale * 1.4, maxScale * 1.4, 1.0);
						this.scanScene.add(this.scanGravity);
						this.scanGravityMaterial.extensions.derivatives = true;

						this.mouseDown = false;
				}
		}, {
				key: 'onUp',
				value: function onUp(_position) {

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'onUp', this).call(this, _position);
						this.activePlanet = null;

						this.indicatorScaleTarget = 0.0;
						this.indicatorAlphaTarget = 0.0;

						this.mouseDown = false;
				}
		}, {
				key: 'onDown',
				value: function onDown(_position) {

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'onDown', this).call(this, _position);
						this.activePlanet = this.checkPlanets(this.glMouseWorld);

						if (!this.activeScreen && this.activePlanet) {

								// this.indicatorObj.position.x = this.activePlanet.position[ 0 ];
								// this.indicatorObj.position.y = this.activePlanet.position[ 1 ];
								// this.indicatorObj.position.z = this.activePlanet.position[ 2 ];

								var dir = vec3.sub(vec3.create(), this.glMouseWorld, this.activePlanet.position);
								var angle = Math.atan2(dir[1], dir[0]) - Math.PI * 0.5;
								var dist = vec3.length(dir);

								// this.indicatorAlphaTarget = 1.0;
								// this.indicatorObj.rotation.z = angle;
								// this.indicatorScaleTarget = dist;
						}

						this.mouseDown = true;
				}
		}, {
				key: 'onClick',
				value: function onClick(_position) {

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'onClick', this).call(this, _position);
				}
		}, {
				key: 'onMove',
				value: function onMove(_position) {

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'onMove', this).call(this, _position);
				}
		}, {
				key: 'onDrag',
				value: function onDrag(_position) {

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'onDrag', this).call(this, _position);

						if (!this.activeScreen && this.activePlanet) {

								var dir = vec3.sub(vec3.create(), this.glMouseWorld, this.activePlanet.position);
								var sign = Math.sign(dir[1]);
								var dist = vec3.length(dir);
								var maxDist = this.activePlanet.scale[0] * 1.2;

								this.activePlanet.sign = sign;
								this.activePlanet.targetCharge = dist / maxDist * this.activePlanet.maxCharge;

								var angle = Math.atan2(dir[1], dir[0]) - Math.PI * 0.5;

								// this.indicatorAlphaTarget = 1.0;
								// this.indicatorObj.rotation.z = angle;
								// this.indicatorScaleTarget = dist;
						}
				}
		}, {
				key: 'update',
				value: function update() {

						// Check if all is loaded.

						if (!this.ready) {

								if (Object.keys(this.gameElements).length == this.elementToLoad) {

										this.ready = true;
										this.gameElements.player.instances[0].mass = 1000000;
										this.gameElements.player.instances[0].enabled = true;
										this.resetPlayer();
										// this.start = this.getInstanceByName ( 'goals', 'bottom' );
										// this.arrival = this.getInstanceByName ( 'goals', 'top' );
										this.arrivedInGame = false;
										this.buildCharges();
								} else {

										return;
								}
						}

						if (!this.won && this.levelCompleted) {

								if (this.onWinCallback) this.onWinCallback(this.levelFile);
								this.won = true;
						}

						_get(GravityElectricLevel.prototype.__proto__ || Object.getPrototypeOf(GravityElectricLevel.prototype), 'update', this).call(this);

						// this.indicatorObj.scale.y += ( this.indicatorScaleTarget - this.indicatorObj.scale.y ) * 0.2;
						// this.indicatorObj.rotation.z += ( this.indicatorAngleTarget - this.indicatorObj.rotation.z ) * 0.2;
						// this.indicatorMaterial.uniforms.alpha.value += ( this.indicatorAlphaTarget - this.indicatorMaterial.uniforms.alpha.value ) * 0.1;

						// main player

						var player = this.gameElements.player.instances[0];
						if (this.checkEdges(player.position, 0.2) && !this.levelCompleted) this.resetPlayer();
						// if ( this.isInBox ( this.arrival, player.position ) ) this.onWinCallback ();
						// if ( this.isInBox ( this.start, player.position ) ) this.arrivedInGame = true;

						// Compute the physics behind.
						// Here we take two different équations to compute the forces.

						var resultForce = vec3.create();

						var chargesUniform = [];
						var massesUniforms = [];
						var planets = this.gameElements.planets.instances;

						for (var i = 0; i < planets.length; i++) {

								// Update the uniforms passed to the scan vertex shader.

								chargesUniform.push(planets[i].position[0]);
								chargesUniform.push(planets[i].position[1]);
								chargesUniform.push(Math.abs(planets[i].charge / planets[i].maxCharge) * planets[i].sign);

								massesUniforms.push(planets[i].position[0]);
								massesUniforms.push(planets[i].position[1]);
								massesUniforms.push(3.0);

								// Put this after uniform update to prevent glitches.

								var dist = vec3.length(vec3.sub(vec3.create(), planets[i].position, player.position));

								if (dist < planets[i].scale[0]) {

										this.resetPlayer();
								}

								var gravityForce = this.computeGravityForce(planets[i], player);
								vec3.add(resultForce, resultForce, gravityForce);
								var electricForce = this.computeElectricForce(planets[i], player);
								vec3.add(resultForce, resultForce, electricForce);

								// Update the charges inside it.

								var charges = planets[i].charges;

								for (var j = 0; j < charges.length; j++) {

										if (this.mouseDown) {

												var dir = vec3.sub(vec3.create(), charges[j].position, this.glMouseWorld);
												var _dist = vec3.length(dir);
												var maxDist = 2.0;
												vec3.normalize(dir, dir);
												var amp = (0, _utils.clamp)(_dist / maxDist, 0, 1);

												if (_dist < 0.5) {

														charges[j].applyForce(vec3.scale(dir, dir, amp * 3));
												}
										}

										for (var k = 0; k < charges.length; k++) {

												if (j != k) {

														var _dir = vec3.sub(vec3.create(), charges[k].position, charges[j].position);
														var _dist2 = vec3.length(_dir);
														vec3.normalize(_dir, _dir);

														var offset = 0.23;
														var minDist = charges[k].scale[0] + charges[j].scale[0] + offset;

														if (_dist2 < minDist) {

																vec3.scale(_dir, _dir, -Math.pow(minDist - _dist2, 3) * 120);
																charges[j].applyForce(_dir);
														} else {

																vec3.scale(_dir, _dir, 1.0 / Math.pow(_dist2 + 1.0, 2) * 0.1);
																charges[j].applyForce(_dir);
														}
												}
										}
								}
						}

						// Change the uniform's values.

						if (chargesUniform.length > 0) {

								this.scanElectricMaterial.uniforms.numCharges.value = chargesUniform.length / 3;
								this.scanElectricMaterial.uniforms.charges.value = chargesUniform;
						}

						if (massesUniforms.length > 0) {

								this.scanGravityMaterial.uniforms.numMasses.value = massesUniforms.length / 3;
								this.scanGravityMaterial.uniforms.masses.value = massesUniforms;
						}

						// Update the player according to the resulting of all forces merged together.

						if (!this.levelCompleted) player.applyForce(resultForce);

						// Update particles emitted by the player.

						var playerParticles = this.gameElements.playerParticles.instances;

						for (var _j = 0; _j < playerParticles.length; _j++) {

								var particle = playerParticles[_j];

								var _dir2 = vec3.sub(vec3.create(), player.position, particle.position);
								var _dist3 = vec3.length(_dir2);

								vec3.normalize(_dir2, _dir2);
								vec3.scale(_dir2, _dir2, 1 / Math.pow(_dist3 + 1.0, 2) * 2);

								particle.applyForce(_dir2);
						}

						// Obstacles

						if (this.gameElements.obstacles) {

								var obstacles = this.gameElements.obstacles.instances || [];

								for (var _i = 0; _i < obstacles.length; _i++) {

										var obstacle = obstacles[_i];

										if (this.isInBox(obstacle, player.position)) {

												this.resetPlayer();
												break;
										}
								}
						}

						// Update FX particles

						// for ( let i = 0; i < 2; i ++ ) {

						// 	let instance = this.addInstanceOf ( 'playerParticles', {

						// 		enabled: Math.random () > 0.05 ? true : false,
						// 		position: vec3.clone ( player.position ),
						// 		canDye: true,
						// 		lifeSpan: Math.random () * 1000 + 1000,
						// 		drag: 0.95,
						// 		mass: Math.random () * 100 + 200,
						// 		initialRadius: Math.random () * 0.06 + 0.03,
						// 		velocity: vec3.scale ( vec3.create (), vec3.clone ( player.velocity ), 0.1 ),

						// 	} );

						// 	instance.applyForce ( vec3.fromValues ( ( Math.random () - 0.5 ) * 30, ( Math.random () - 0.5 ) * 30, ( Math.random () - 0.5 ) * 30 ) );

						// }

						if (!this.infoScreenOpened) return;

						if (this.canUpdateTexts) {

								this.canUpdateTexts = false;
								this.updateTexts();
								setTimeout(function () {

										this.canUpdateTexts = true;
								}.bind(this), 5);
						}
				}
		}, {
				key: 'updateTexts',
				value: function updateTexts() {

						if (!this.textsGeometry) return;

						var player = this.gameElements.player.instances[0];
						var points = this.gameElements.planets.textPoints;

						var indices = [];
						var positions = [];
						var uvs = [];

						var modelMatrix = mat4.create();

						var planetPoints = this.gameElements.planets.textPoints;

						for (var pp in planetPoints) {

								var point = planetPoints[pp].point;
								var instances = planetPoints[pp].instances;

								var totalForce = 0;
								var totalMass = 0;

								for (var i = 0; i < instances.length; i++) {

										totalForce += vec3.length(this.computeGravityForce(instances[i], player));
										totalMass += instances[i].mass;
								}

								var textData = this.textsGeometry.getTextData(totalMass + ' kg\n' + Math.floor(totalForce * 100) / 100 + ' N');

								mat4.identity(modelMatrix);
								mat4.translate(modelMatrix, modelMatrix, [point[0] - textData.width * 0.0025 * 0.5, -point[1] + 0.1 + textData.height * 0.0025, 0]);
								mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.0025, 0.0025, 0.0025));

								for (var j = 0; j < textData.indices.length; j++) {

										indices.push(textData.indices[j] + positions.length / 2);
								}

								for (var _j2 = 0; _j2 < textData.positions.length; _j2 += 2) {

										var v = [textData.positions[_j2 + 0], textData.positions[_j2 + 1], 0];
										vec3.transformMat4(v, v, modelMatrix);

										positions.push(v[0]);
										positions.push(v[1]);
								}

								for (var _j3 = 0; _j3 < textData.uvs.length; _j3++) {

										uvs.push(textData.uvs[_j3]);
								}
						}

						if (positions.length > 0) {

								this.dynamicBuffer.index(this.textsGeometry, indices, 1);
								this.dynamicBuffer.attr(this.textsGeometry, 'position', positions, 2);
								this.dynamicBuffer.attr(this.textsGeometry, 'uv', uvs, 2);
						} else {

								var _textData = this.textsGeometry.getTextData('');

								this.dynamicBuffer.index(this.textsGeometry, _textData.indices, 1);
								this.dynamicBuffer.attr(this.textsGeometry, 'position', _textData.positions, 2);
								this.dynamicBuffer.attr(this.textsGeometry, 'uv', _textData.uvs, 2);
						}
				}

				// Build the charges contained in the planets.

		}, {
				key: 'buildCharges',
				value: function buildCharges() {

						var planets = this.gameElements.planets.instances;

						for (var i = 0; i < planets.length; i++) {

								var planet = planets[i];
								var layers = planet.particles;

								for (var j = 0; j < layers.length; j++) {

										for (var k = 0; k < layers[j]; k++) {

												var step = Math.PI * 2.0 / layers[j];
												var angle = step * k; // + ( Math.random() - 0.5 ) * 0.2;
												var dist = planet.scale[0] * 0.50 / (layers.length - 1) * j;

												var rSize = Math.random() * 0.05 + 0.12;

												var color = null;

												if (Math.random() > 0.5) {

														color = vec4.fromValues(50 / 255, 104 / 255, 252 / 255, 1.0);
												} else {

														color = vec4.fromValues(252 / 255, 74 / 255, 50 / 255, 1.0);
												}

												// Store the charges in the planet to have an easy access.

												planets[i].charges.push(this.addInstanceOf('charges', {

														name: 'gravityChargeParticle',
														position: vec3.fromValues(planet.position[0] + Math.cos(angle) * dist, planet.position[1] + Math.sin(angle) * dist, 0.0),
														rotation: [0, 0, Math.random() * Math.PI * 2],
														minRadius: 0.1,
														maxRadius: 0.5,
														radius: j == 0 ? 0.2 : 0.05,
														targetRadius: j == 0 ? 0.2 : Math.random() * 0.1 + 0.1,
														mass: 400,
														drag: 0.9,
														enabled: j == 0 ? false : true // disable the first instance to keep it in the center.

												}));
										}
								}
						}
				}

				// Compute natural forces according to some basic equations.

		}, {
				key: 'computeElectricForce',
				value: function computeElectricForce(_e1, _e2) {

						var k = 8.99 * Math.pow(10, 1.5); // Here we tweak a little bit the real values.
						var dir = vec3.sub(vec3.create(), _e1.position, _e2.position);
						var dist = vec3.length(dir);

						vec3.normalize(dir, dir);
						var mag = k * (_e1.charge * _e1.sign * _e2.charge * _e2.sign) / Math.pow(dist, 2);

						return vec3.scale(dir, dir, mag);
				}
		}, {
				key: 'computeGravityForce',
				value: function computeGravityForce(_e1, _e2) {

						var G = 6.674 * Math.pow(10, -9); // Here we tweak a little bit the real values.
						var dir = vec3.sub(vec3.create(), _e1.position, _e2.position);
						var dist = vec3.length(dir);

						vec3.normalize(dir, dir);
						var mag = G * (_e1.mass * _e2.mass) / Math.pow(dist, 2);

						return vec3.scale(dir, dir, mag);
				}

				// Interactions

		}, {
				key: 'checkPlanets',
				value: function checkPlanets(_vector) {

						var planets = this.gameElements.planets.instances;

						for (var i = 0; i < planets.length; i++) {

								var dist = vec3.length(vec3.sub(vec3.create(), planets[i].position, _vector));

								if (dist < planets[i].scale[0]) {

										return planets[i];
								}
						}

						return null;
				}
		}, {
				key: 'resetPlayer',
				value: function resetPlayer() {

						this.explosionSound();
						this.gameElements.player.instances[0].position = vec3.fromValues(0, this.getWorldBottom() - 0.1, 0);
						this.gameElements.player.instances[0].velocity = vec3.create();
						this.gameElements.player.instances[0].applyForce([0, 10000, 0]);
				}
		}, {
				key: 'reloadLevel',
				value: function reloadLevel() {

						this.resetPlayer();
						var planets = this.gameElements.planets.instances;

						for (var i = 0; i < planets.length; i++) {

								planets[i].charge = 0;
								planets[i].targetCharge = 0;
						}
				}
		}]);

		return GravityElectricLevel;
}(_LevelCore2.LevelCore);

},{"../utils":76,"./LevelCore":61,"./Text":67,"./shaderHelper":69}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.GravityLevel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _PhysicalElement = require("./PhysicalElement");

var _shaderHelper = require("./shaderHelper");

var _LevelCore2 = require("./LevelCore");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GravityLevel = exports.GravityLevel = function (_LevelCore) {
		_inherits(GravityLevel, _LevelCore);

		function GravityLevel(_options) {
				_classCallCheck(this, GravityLevel);

				try {
						var _this = _possibleConstructorReturn(this, (GravityLevel.__proto__ || Object.getPrototypeOf(GravityLevel)).call(this, _options));

						_this.build();
				} catch (e) {

						console.error(e);
				}

				_this.ready = false;

				// build a grid

				var maxScale = _this.getWorldRight() > _this.getWorldTop() ? _this.getWorldRight() * 2 : _this.getWorldTop() * 2;
				var gridGeometry = new THREE.PlaneBufferGeometry(1, 1, 80, 80);
				_this.gridMaterial = new THREE.ShaderMaterial({

						vertexShader: _shaderHelper.shaderHelper.grid.vertex,
						fragmentShader: _shaderHelper.shaderHelper.grid.fragment,
						transparent: true,

						uniforms: {

								mainAlpha: { value: 1.0 },
								gridSubdivisions: { value: 60 },
								numMasses: { value: 0 },
								masses: { value: [0, 0, 0] }

						}

						// side: THREE.DoubleSide,

				});

				_this.grid = new THREE.Mesh(gridGeometry, _this.gridMaterial);
				_this.grid.scale.set(maxScale * 1.4, maxScale * 1.4, 1);
				_this.grid.renderOrder = 0;
				_this.scanScene.add(_this.grid);
				_this.gridMaterial.extensions.derivatives = true;

				// Blackmatter

				_this.canDraw = true;
				_this.canUpdateTexts = true;

				_this.won = false;

				return _this;
		}

		_createClass(GravityLevel, [{
				key: "build",
				value: function build() {

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "build", this).call(this);

						this.onLoad(function () {

								this.render();
						}.bind(this));
				}
		}, {
				key: "onUp",
				value: function onUp(_position) {

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "onUp", this).call(this, _position);
				}
		}, {
				key: "onDown",
				value: function onDown(_position) {

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "onDown", this).call(this, _position);
				}
		}, {
				key: "onClick",
				value: function onClick(_position) {

						if (this.levelCompleted) return;

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "onClick", this).call(this, _position);
				}
		}, {
				key: "onMove",
				value: function onMove(_position) {

						if (this.levelCompleted) return;

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "onMove", this).call(this, _position);
				}
		}, {
				key: "onDrag",
				value: function onDrag(_position) {

						if (this.levelCompleted) return;

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "onDrag", this).call(this, _position);

						if (!this.activeScreen && this.canDraw) {

								var r = rc();
								var s = Math.random() * 0.3 + 0.2;

								// On the iPad Air the max number of vectors we can pass to a vertex shader is 108.

								if (this.gameElements.blackMatter.instances.length < 108) {

										this.addInstanceOf('blackMatter', {

												position: [this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z],
												scale: [s, s, s],
												color: [0.8 + r, 0.8 + r, 0.8 + r, 1.0],
												rotation: [0, 0, Math.random() * Math.PI * 2],
												mass: 20000,
												drag: 0.95,
												lifeSpan: Math.random() * 4000 + 6000,
												canDye: true,
												targetLinePosition: [-2.0, 2.0, 0.0]

										});
								}
						}

						if (this.canDraw) {

								this.canDraw = false;

								setTimeout(function () {

										this.canDraw = true;
								}.bind(this), 100);
						}

						function rc() {

								return (Math.random() - 0.5) * 0.07;
						}
				}
		}, {
				key: "onResize",
				value: function onResize() {

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "onResize", this).call(this);

						var maxScale = this.getWorldRight() > this.getWorldTop() ? this.getWorldRight() * 2 : this.getWorldTop() * 2;
						this.grid.scale.set(maxScale * 1.5, maxScale * 1.5, 1.0);
				}
		}, {
				key: "update",
				value: function update(_deltaTime) {

						// Check if all is loaded.

						if (!this.ready) {

								if (this.levelLoaded && this.levelStarted) {

										this.ready = true;
										// this.start = this.getInstanceByName ( 'goals', 'bottom' );
										// this.arrival = this.getInstanceByName ( 'goals', 'top' );
										this.arrivedInGame = false;
										this.gameElements.player.instances[0].enabled = true;
										this.resetPlayer();
								} else {

										return;
								}
						};

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "update", this).call(this, _deltaTime);

						if (!this.won && this.levelCompleted) {

								this.won = true;
								this.onWinCallback(this.levelFile);
						}

						if (this.levelCompleted) {

								// console.log('sfélkjélkj');
								return;
						}

						// Here all the objects's geometries are updated.
						// Main player

						var player = this.gameElements.player.instances[0];
						if (this.checkEdges(player.position, 0.2) && !this.levelCompleted) this.resetPlayer();
						// if ( this.isInBox ( this.arrival, player.position ) ) this.onWinCallback ();
						// if ( this.isInBox ( this.start, player.position ) ) this.arrivedInGame = true;

						// Compute the gravitational field.
						//
						// G = 6.674 * 10-11 ( m3 kg-1 s-2 )
						//
						// F = G * ( m1 * m2 ) / r^2
						//

						var forceResult = vec3.create();

						// Black matter

						var massesUniforms = [];
						var blackMatterInstances = this.gameElements.blackMatter.instances;

						for (var i = 0; i < blackMatterInstances.length; i++) {

								var bC = blackMatterInstances[i];
								var dir = vec3.sub(vec3.create(), bC.position, player.position);
								var dist = vec3.length(dir);

								massesUniforms.push(bC.position[0]);
								massesUniforms.push(bC.position[1]);
								massesUniforms.push(bC.mass / bC.maxMass);

								if (dist > bC.scale[0]) {

										var force = this.computeGravityAttraction(bC, player);
										vec3.add(forceResult, forceResult, force);
								} else {

										if (!this.levelCompleted) this.resetPlayer();
								}
						}

						// Planets & particles

						var playerParticles = this.gameElements.playerParticles.instances;
						var planetsInstances = this.gameElements.planets.instances;

						for (var _i = 0; _i < planetsInstances.length; _i++) {

								var planet = planetsInstances[_i];
								var _dir = vec3.sub(vec3.create(), planet.position, player.position);
								var _dist = vec3.length(_dir);

								massesUniforms.push(planet.position[0]);
								massesUniforms.push(planet.position[1]);
								massesUniforms.push(planet.mass / planet.maxMass * 2.0);

								if (_dist > planet.scale[0]) {

										var _force = this.computeGravityAttraction(planet, player);
										vec3.add(forceResult, forceResult, _force);
								} else {

										if (!this.levelCompleted) this.resetPlayer();
								}

								// for ( let j = 0; j < playerParticles.length; j ++ ) {

								// 	let particle = playerParticles[ j ];

								// 	let dirToPlanet = vec3.sub ( vec3.create (), planet.position, particle.position );
								// 	let distToPlanet = vec3.length ( dirToPlanet );
								// 	let minDistToPlanet = planet.scale[ 0 ] + particle.scale[ 0 ] - 0.01;
								// 	let force = null;

								// 	if ( distToPlanet < minDistToPlanet ) {

								// 		let mag = ( minDistToPlanet - distToPlanet ) * 50;
								// 		vec3.normalize ( distToPlanet, distToPlanet );
								// 		force = vec3.scale ( dirToPlanet, dirToPlanet, -mag );

								// 	} else {

								// 		force = this.computeGravityAttraction ( planet, particle );

								// 		if ( vec3.length ( force ) > 1 ) {

								// 			vec3.normalize ( force, force );
								// 			vec3.scale ( force, force, 1 );

								// 		}

								// 	}

								// 	particle.applyForce ( force );

								// }
						}

						// Update the grid in the scan scene.

						if (massesUniforms.length > 0) {

								this.gridMaterial.uniforms.numMasses.value = massesUniforms.length / 3;
								this.gridMaterial.uniforms.masses.value = massesUniforms;
						}

						for (var j = 0; j < playerParticles.length; j++) {

								var particle = playerParticles[j];

								var _dir2 = vec3.sub(vec3.create(), player.position, particle.position);
								var _dist2 = vec3.length(_dir2);

								vec3.normalize(_dir2, _dir2);
								vec3.scale(_dir2, _dir2, 1 / Math.pow(_dist2 + 1.0, 2) * 2);

								particle.applyForce(_dir2);
						}

						player.applyForce(forceResult);

						// Update FX particles

						for (var _i2 = 0; _i2 < 1; _i2++) {

								var instance = this.addInstanceOf('playerParticles', {

										enabled: Math.random() > 0.05 ? true : false,
										position: vec3.clone(player.position),
										canDye: true,
										lifeSpan: Math.random() * 1000 + 1000,
										drag: 0.95,
										mass: Math.random() * 100 + 200,
										initialRadius: Math.random() * 0.06 + 0.03,
										velocity: vec3.scale(vec3.create(), vec3.clone(player.velocity), 0.1)

								});

								instance.applyForce(vec3.fromValues((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30));
						}

						if (!this.infoScreenOpened) return;

						// Update text

						if (this.canUpdateTexts) {

								this.canUpdateTexts = false;
								this.updateTexts();
								setTimeout(function () {

										this.canUpdateTexts = true;
								}.bind(this), 5);
						}
				}
		}, {
				key: "updateTexts",
				value: function updateTexts() {

						if (!this.textsGeometry) return;

						var player = this.gameElements.player.instances[0];
						var points = this.gameElements.blackMatter.textPoints;

						var indices = [];
						var positions = [];
						var uvs = [];

						var modelMatrix = mat4.create();

						var planetPoints = this.gameElements.planets.textPoints;

						for (var pp in planetPoints) {

								var point = planetPoints[pp].point;
								var instances = planetPoints[pp].instances;

								var totalForce = 0;
								var totalMass = 0;

								for (var i = 0; i < instances.length; i++) {

										totalForce += vec3.length(this.computeGravityAttraction(instances[i], player));
										totalMass += instances[i].mass;
								}

								var textData = this.textsGeometry.getTextData(totalMass + ' kg\n' + Math.floor(totalForce * 100) / 100 + ' N');

								mat4.identity(modelMatrix);
								mat4.translate(modelMatrix, modelMatrix, [point[0] - textData.width * 0.0025 * 0.5, -point[1] + 0.1 + textData.height * 0.0025, 0]);
								mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.0025, 0.0025, 0.0025));

								for (var j = 0; j < textData.indices.length; j++) {

										indices.push(textData.indices[j] + positions.length / 2);
								}

								for (var _j = 0; _j < textData.positions.length; _j += 2) {

										var v = [textData.positions[_j + 0], textData.positions[_j + 1], 0];
										vec3.transformMat4(v, v, modelMatrix);

										positions.push(v[0]);
										positions.push(v[1]);
								}

								for (var _j2 = 0; _j2 < textData.uvs.length; _j2++) {

										uvs.push(textData.uvs[_j2]);
								}
						}

						for (var p in points) {

								var _point = points[p].point;
								var _instances = points[p].instances;

								var _totalForce = 0;
								var _totalMass = 0;

								for (var _i3 = 0; _i3 < _instances.length; _i3++) {

										_totalForce += vec3.length(this.computeGravityAttraction(_instances[_i3], player));
										_totalMass += _instances[_i3].mass;
								}

								var _textData = this.textsGeometry.getTextData(Math.floor(_totalMass) + ' kg\n' + Math.floor(_totalForce * 100) / 100 + ' N');

								mat4.identity(modelMatrix);
								mat4.translate(modelMatrix, modelMatrix, [_point[0] - _textData.width * 0.0025 * 0.5, -_point[1] - 0.1, 0]);
								mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.0025, 0.0025, 0.0025));

								for (var _j3 = 0; _j3 < _textData.indices.length; _j3++) {

										indices.push(_textData.indices[_j3] + positions.length / 2);
								}

								for (var _j4 = 0; _j4 < _textData.positions.length; _j4 += 2) {

										var _v = [_textData.positions[_j4 + 0], _textData.positions[_j4 + 1], 0];
										vec3.transformMat4(_v, _v, modelMatrix);

										positions.push(_v[0]);
										positions.push(_v[1]);
								}

								for (var _j5 = 0; _j5 < _textData.uvs.length; _j5++) {

										uvs.push(_textData.uvs[_j5]);
								}
						}

						if (positions.length > 0) {

								this.dynamicBuffer.index(this.textsGeometry, indices, 1);
								this.dynamicBuffer.attr(this.textsGeometry, 'position', positions, 2);
								this.dynamicBuffer.attr(this.textsGeometry, 'uv', uvs, 2);
						} else {

								var _textData2 = this.textsGeometry.getTextData('');

								this.dynamicBuffer.index(this.textsGeometry, _textData2.indices, 1);
								this.dynamicBuffer.attr(this.textsGeometry, 'position', _textData2.positions, 2);
								this.dynamicBuffer.attr(this.textsGeometry, 'uv', _textData2.uvs, 2);
						}
				}
		}, {
				key: "computeGravityAttraction",
				value: function computeGravityAttraction(_e1, _e2) {

						var G = 6.674 * Math.pow(10, -9); // Here we tweak a little bit the real values.
						var dir = vec3.sub(vec3.create(), _e1.position, _e2.position);
						var dist = vec3.length(dir);

						vec3.normalize(dir, dir);
						var mag = G * (_e1.mass * _e2.mass) / Math.pow(dist, 2);

						return vec3.scale(dir, dir, mag);
				}
		}, {
				key: "resetPlayer",
				value: function resetPlayer() {

						this.explosionSound();
						this.gameElements.player.instances[0].position = vec3.fromValues(0, this.getWorldBottom(), 0);
						this.gameElements.player.instances[0].velocity = vec3.create();
						this.gameElements.player.instances[0].applyForce([0, 1000, 0]);
				}
		}, {
				key: "render",
				value: function render() {

						_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "render", this).call(this);
				}
		}]);

		return GravityLevel;
}(_LevelCore2.LevelCore);

},{"./LevelCore":61,"./PhysicalElement":64,"./shaderHelper":69}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.LevelCore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

var _shaderHelper = require('./shaderHelper');

var _library = require('./library');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Import some npm libs

var sdfShader = require('three-bmfont-text/shaders/sdf');
var msdfShader = require('three-bmfont-text/shaders/msdf');
var bmfontGeometry = require('three-bmfont-text');
var bmfontLoader = require('load-bmfont');

var bezier = require('adaptive-bezier-curve');
var quadratic = require('adaptive-quadratic-curve');
var line = require('three-line-2d')(THREE);
var basicShader = require('three-line-2d/shaders/basic')(THREE);
var getNormals = require('polyline-normals');
var dynamicBuffer = require('three-buffer-vertex-data');

var LevelCore = exports.LevelCore = function () {
		function LevelCore(_options) {
				_classCallCheck(this, LevelCore);

				if (!_options || !_options.levelFile) {

						this.throwError('You must specify a level file to build a level');
						return;
				} else if (!_options || !_options.renderer) {

						this.throwError('You must pass the renderer element to the level');
						return;
				}

				// Core elements

				this.levelCompleted = false;
				this.loadObjects = 0;
				this.levelLoaded = false;
				this.levelStarted = false;
				this.levelIsReady = false;
				this.elementToLoad = 0;
				this.levelFile = _options.levelFile;
				this.renderer = _options.renderer;
				this.renderer.autoClear = false;
				this.onWinCallback = function () {
						console.log('you won');
				};
				this.soundManager = _options.soundManager;

				this.mouseDown = false;
				this.glMouse = vec3.create();
				this.glMouseWorld = vec3.create();
				this.mouse = new THREE.Vector2();
				this.mouseWorld = new THREE.Vector3();
				this.raycaster = new THREE.Raycaster();

				// Level elements

				this.mainCamera = new THREE.PerspectiveCamera(75, this.getWidth() / this.getHeight(), 0.1, 1000);
				this.mainCamera.position.z = 5;

				this.mainScene = new THREE.Scene();
				this.mainScene.background = new THREE.Color(0xEFEFEF);

				this.genericQuad = this.getQuad([0, 0, 0], [0, 0, 0], [1, 1, 1]);
				this.quadGeometry = new THREE.PlaneGeometry(1, 1);
				this.screensScene = new THREE.Scene();
				this.activeScreen = null;
				this.screenMaterial = new THREE.ShaderMaterial({

						vertexShader: _shaderHelper.shaderHelper.screen.vertex,
						fragmentShader: _shaderHelper.shaderHelper.screen.fragment,
						uniforms: {

								texture: { value: null },
								screenDimentions: { value: [this.getWidth(), this.getHeight()] }

						},
						transparent: true,
						depthWrite: false,
						depthTest: false

				});

				this.scanScene = new THREE.Scene();
				this.scanScene.background = new THREE.Color(0x000000);
				this.scanSceneRenderTarget = new THREE.WebGLRenderTarget(this.getWidth(), this.getHeight(), { depthBuffer: false, stencilBuffer: false });

				this.scanScreenTargetPosition = new THREE.Vector3(0, 0, 0);
				this.scanScreenClosed = true;
				this.scanScreenOpened = false;
				this.scanScreen = new THREE.Mesh(this.quadGeometry, this.screenMaterial.clone());
				this.scanScreen.material.uniforms.texture.value = this.scanSceneRenderTarget.texture;

				this.scanScreenButtonMaterial = this.scanScreen.material.clone();
				this.scanScreenButtonMaterial.vertexShader = _shaderHelper.shaderHelper.screenButton.vertex;
				this.scanScreenButtonMaterial.fragmentShader = _shaderHelper.shaderHelper.screenButton.fragment;
				this.scanScreenButtonMaterial.uniforms.texture.value = this.scanSceneRenderTarget.texture;
				this.scanScreenButton = new THREE.Mesh(this.quadGeometry, this.scanScreenButtonMaterial);
				this.scanScreenButton.scale.set(0.5, 0.5, 0.5);

				this.screensScene.add(this.scanScreen);
				this.screensScene.add(this.scanScreenButton);

				this.infoScene = new THREE.Scene();
				this.infoScene.background = new THREE.Color(0x808080);
				this.infoSceneRenderTarget = new THREE.WebGLRenderTarget(this.getWidth(), this.getHeight(), { depthBuffer: false, stencilBuffer: false });

				this.infoScreenTargetPosition = new THREE.Vector3(0, 0, 0);
				this.infoScreenClosed = true;
				this.infoScreenOpened = false;
				this.infoScreen = new THREE.Mesh(this.quadGeometry, this.screenMaterial.clone());
				this.infoScreen.material.uniforms.texture.value = this.infoSceneRenderTarget.texture;

				this.infoScreenButtonMaterial = this.infoScreen.material.clone();
				this.infoScreenButtonMaterial.vertexShader = _shaderHelper.shaderHelper.screenButton.vertex;
				this.infoScreenButtonMaterial.fragmentShader = _shaderHelper.shaderHelper.screenButton.fragment;
				this.infoScreenButtonMaterial.uniforms.texture.value = this.infoSceneRenderTarget.texture;
				this.infoScreenButton = new THREE.Mesh(this.quadGeometry, this.infoScreenButtonMaterial);
				this.infoScreenButton.scale.set(0.5, 0.5, 0.5);

				this.screensScene.add(this.infoScreen);
				this.screensScene.add(this.infoScreenButton);

				// Display the scan screen button also in the info scene

				// this.infoScanButton = new THREE.Mesh ( this.scanScreenButton.geometry.clone (), this.scanScreenButton.material.clone () );

				this.circleMaterial = new THREE.ShaderMaterial({

						vertexShader: _shaderHelper.shaderHelper.circle.vertex,
						fragmentShader: _shaderHelper.shaderHelper.circle.fragment,

						uniforms: {

								diffuse: { value: [0, 0, 0, 1] }

						},

						transparent: true

				});

				this.scanScreenButton2 = new THREE.Mesh(this.quadGeometry, this.circleMaterial);
				this.scanScreenButton2.scale.set(0.5, 0.5, 0.5);
				this.infoScene.add(this.scanScreenButton2);

				// Render all scenes once the get right matrices.

				this.renderer.render(this.scanScene, this.mainCamera, this.scanSceneRenderTarget);
				this.renderer.render(this.infoScene, this.mainCamera, this.infoSceneRenderTarget);
				this.renderer.render(this.mainScene, this.mainCamera);

				// Add 

				// Declare objects for drawing lines

				this.line = line;
				this.bezier = bezier;
				this.quadratic = quadratic;
				this.basicShader = basicShader;
				this.dynamicBuffer = dynamicBuffer;

				// Objects

				this.player = new THREE.Object3D();
				this.gameElements = {};

				// End circle

				this.arrivalScaleTarget = 0.4;
				this.endCircleTargetScale = 0.0;
				this.endCircleAlphaTarget = 1.0;
				this.endCircleMaterial = new THREE.ShaderMaterial({

						vertexShader: _shaderHelper.shaderHelper.introEndCircles.vertex,
						fragmentShader: _shaderHelper.shaderHelper.introEndCircles.fragment,

						uniforms: {

								alpha: { value: 1.0 },
								scale: { value: 1.0 }

						},

						transparent: true

				});

				this.endCircle = new THREE.Mesh(this.quadGeometry, this.endCircleMaterial);
				this.mainScene.add(this.endCircle);
		}

		_createClass(LevelCore, [{
				key: 'onMove',
				value: function onMove(_position) {

						this.mouse.x = _position[0] * this.renderer.getPixelRatio();
						this.mouse.y = _position[1] * this.renderer.getPixelRatio();

						this.glMouse = vec2.clone(_position);

						this.updateMouseWorld(this.mouse);
				}
		}, {
				key: 'onClick',
				value: function onClick(_position) {

						this.mouse.x = _position[0] * this.renderer.getPixelRatio();
						this.mouse.y = _position[1] * this.renderer.getPixelRatio();

						this.glMouse = vec2.clone(_position);

						this.updateMouseWorld(this.mouse);
				}
		}, {
				key: 'onDrag',
				value: function onDrag(_position) {

						this.mouse.x = _position[0] * this.renderer.getPixelRatio();
						this.mouse.y = _position[1] * this.renderer.getPixelRatio();

						this.glMouse = vec2.clone(_position);

						this.updateMouseWorld(this.mouse);

						if (this.activeScreen == this.scanScreen) {

								this.scanScreenTargetPosition.x = this.mouseWorld.x + this.getWorldRight();
						} else if (this.activeScreen == this.infoScreen) {

								this.infoScreenTargetPosition.x = this.mouseWorld.x - this.getWorldRight();
						}
				}
		}, {
				key: 'onDown',
				value: function onDown(_position) {

						this.mouseDown = true;

						if (!this.levelStarted) {

								this.levelStarted = true;

								// If there is a text intro remove it.

								this.removeTextIntro();
						}

						this.mouse.x = _position[0] * this.renderer.getPixelRatio();
						this.mouse.y = _position[1] * this.renderer.getPixelRatio();

						this.glMouse = vec2.clone(_position);
						this.updateMouseWorld(this.mouse);
						this.activeScreen = this.checkButtons();
				}
		}, {
				key: 'onUp',
				value: function onUp(_position) {

						this.mouse.x = _position[0] * this.renderer.getPixelRatio();
						this.mouse.y = _position[1] * this.renderer.getPixelRatio();
						this.glMouse = vec2.clone(_position);

						this.updateMouseWorld(this.mouse);

						this.activeScreen = null;
						this.mouseDown = false;
				}
		}, {
				key: 'onResize',
				value: function onResize() {

						this.mainCamera.aspect = window.innerWidth / window.innerHeight;
						this.mainCamera.updateProjectionMatrix();

						this.renderer.setSize(window.innerWidth, window.innerHeight);

						this.scanScreen.material.uniforms.screenDimentions.value = [this.getWidth(), this.getHeight()];
						this.scanScreenButton.material.uniforms.screenDimentions.value = [this.getWidth(), this.getHeight()];
						this.scanScreenTargetPosition.x = this.getWorldRight() * 2;
						this.scanScreen.scale.x = this.getWorldRight() * 2;

						this.infoScreen.material.uniforms.screenDimentions.value = [this.getWidth(), this.getHeight()];
						this.infoScreenButton.material.uniforms.screenDimentions.value = [this.getWidth(), this.getHeight()];
						this.infoScreenTargetPosition.x = this.getWorldLeft() * 2;
						this.infoScreen.scale.x = this.getWorldRight() * 2;
				}
		}, {
				key: 'build',
				value: function build() {

						// Sound

						this.backgroundSound = this.soundManager.play('Back_sound_' + Math.floor(Math.random() * 4), { loop: -1, volume: 0.5 });
						this.playerSound = this.soundManager.play('Player_sound_0', { loop: -1, volume: 0.10 });

						// Update screns size & position.

						this.scanScreenTargetPosition.set(0.0, 0.0, 0.0);
						this.scanScreen.position.set(this.scanScreenTargetPosition.x, this.scanScreenTargetPosition.y, this.scanScreenTargetPosition.z);

						this.scanScreen.scale.x = this.getWorldRight() * 2.0;
						this.scanScreen.scale.y = this.getWorldTop() * 2.0;

						this.infoScreenTargetPosition.set(0.0, 0.0, 0.0);
						this.infoScreen.position.set(this.infoScreenTargetPosition.x, this.infoScreenTargetPosition.y, this.infoScreenTargetPosition.z);

						this.infoScreen.scale.x = this.getWorldRight() * 2.0;
						this.infoScreen.scale.y = this.getWorldTop() * 2.0;

						// Load a font that will be used for font rendering in the level.

						this.addLoadingObject();
						bmfontLoader('./resources/fonts/GT-Walsheim.fnt', function (err, font) {

								if (err) {

										console.error(err);
								} else {

										this.addLoadingObject();
										this.objectOnLoad('fnt');

										var textureLoader = new THREE.TextureLoader();
										textureLoader.load('./resources/fonts/GT-Walsheim_sdf.png', function (texture) {

												this.objectOnLoad('font texture');

												// Check if an intro text is specified in the level file.
												// Text intro.

												this.textBackgroundMaterial = new THREE.MeshBasicMaterial({

														color: 'rgb( 128, 128, 128 )',
														opacity: 0.9,
														transparent: true

												});

												this.textBackground = new THREE.Mesh(this.quadGeometry, this.textBackgroundMaterial);
												this.textBackground.material.alphaTarget = 0.9;
												this.textBackground.renderOrder = 5;
												this.textBackground.scale.set(this.getWorldRight() * 2.0, this.getWorldTop() * 2.0, 3);
												this.infoScene.add(this.textBackground);

												var geometry = bmfontGeometry({

														width: 1000,
														align: 'center',
														font: font

												});

												geometry.update(this.levelFile.textIntro || '');
												geometry.computeBoundingBox();

												var material = new THREE.RawShaderMaterial(sdfShader({

														map: texture,
														side: THREE.DoubleSide,
														transparent: true,
														color: 'rgb(0, 0, 0)'

												}));

												this.textIntro = new THREE.Mesh(geometry, material);
												this.textIntro.material.alphaTarget = 1.0;
												this.infoScene.add(this.textIntro);
												this.textIntro.renderOrder = 6;
												geometry.computeBoundingSphere();
												this.textIntro.position.x -= geometry.boundingSphere.center.x * 0.0030;
												this.textIntro.position.y += geometry.boundingSphere.center.y * 0.0030;
												this.textIntro.rotation.x = Math.PI;
												this.textIntro.scale.set(0.0030, 0.0030, 0.0030);

												// Texts

												this.textsGeometry = bmfontGeometry({

														font: font,
														align: 'center'

												});

												this.textsGeometry.update('Pietro');

												this.textsMaterial = new THREE.RawShaderMaterial(sdfShader({

														map: texture,
														side: THREE.DoubleSide,
														transparent: true,
														color: 'rgb(0, 0, 0)'

												}));

												this.texts = new THREE.Mesh(this.textsGeometry, this.textsMaterial);
												this.texts.rotation.x = Math.PI;
												this.texts.renderOrder = 3;
												// this.texts.scale.set ( 0.0025, 0.0025, 0.0025 );
												this.infoScene.add(this.texts);

												this.render();
										}.bind(this));
								}
						}.bind(this));

						// Add the goals elements.

						this.addElement('arrival', {

								static: false,
								manualMode: false,
								transparent: true,
								individual: false,
								maxInstancesNum: 1,
								renderOrder: 0,

								shaders: {

										main: null,

										normal: {

												name: 'arrival',
												blending: 'NormalBlending',
												uniforms: {

														solidColor: { value: [0.8, 0.8, 0.8, 1.0] }

												},

												transparent: true

										},

										scan: null,
										infos: null

								},

								instances: {

										0: {

												enabled: true,
												name: 'top',
												position: vec3.fromValues(0, this.getWorldTop() - 0.5, 0),
												rotation: vec3.fromValues(0.0, 0.0, 0.0),
												scale: vec3.fromValues(0.4, 0.4, 0.5)

										}

								}

						});

						// Add level elements

						for (var elementName in this.levelFile.elements) {

								var element = this.levelFile.elements[elementName];
								var manualMode = element.manualMode;

								if (!manualMode) {

										this.addElement(elementName, element);
								}
						}

						this.addElement('playerParticles', {

								elementType: 'Particle',
								static: false,
								individual: false,
								manualMode: false,
								renderingOrder: 10,
								maxInstancesNum: 200,

								shaders: {

										main: null,

										normal: {

												name: 'playerParticles',
												transparent: true,
												blending: 'MultiplyBlending',
												textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {}

										},

										scan: null,
										infos: null

								},

								instances: {}

						});

						this.addElement('player', {

								elementType: 'Player',
								isMainPlayer: true,
								static: false,
								individual: true,
								manualMode: false,
								renderingOrder: 10,

								shaders: {

										main: null,

										normal: {

												name: 'player',
												transparent: true,
												blending: 'MultiplyBlending',
												textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {}

										},

										scan: {

												name: 'playerScan',
												transparent: true,
												textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {}

										},

										infos: {

												name: 'playerInfo',
												transparent: true,
												textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {}

										}

								},

								instances: {

										0: {

												enabled: false,
												position: vec3.fromValues(0, 10, 0),
												rotation: vec3.fromValues(0.0, 0.0, 0.0),
												scale: vec3.fromValues(0.12, 0.12, 1.0),
												velocity: vec3.create(),
												mass: 30000,
												drag: this.levelFile.playerDrag || 0.999999

										}

								}

						});

						// Build a base grid to draw infos.

						this.baseGridX = 7;
						this.baseGridY = 20;

						var gridGeometry = new THREE.PlaneBufferGeometry(this.getWorldRight() * 2.0, this.getWorldTop() * 2.0, this.baseGridX - 1, this.baseGridY - 1);
						var gridMaterialDebug = new THREE.MeshBasicMaterial({

								color: 0x000000,
								wireframe: true

						});

						var gridDebug = new THREE.Mesh(gridGeometry, gridMaterialDebug);
						// this.infoScene.add ( gridDebug );
						this.baseGrid = gridGeometry.attributes.position.array;

						// Add lines

						this.onLoad(function () {

								var linesData = this.getLinesData();

								this.linesGeometry = new THREE.BufferGeometry();
								this.linesGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(linesData.index), 1));
								this.linesGeometry.index.dynamic = true;
								this.linesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(linesData.position), 3));
								this.linesGeometry.attributes.position.dynamic = true;
								this.linesGeometry.addAttribute('lineNormal', new THREE.BufferAttribute(new Float32Array(linesData.lineNormal), 2));
								this.linesGeometry.attributes.lineNormal.dynamic = true;
								this.linesGeometry.addAttribute('lineMiter', new THREE.BufferAttribute(new Float32Array(linesData.lineMiter), 1));
								this.linesGeometry.attributes.lineMiter.dynamic = true;
								this.linesGeometry.addAttribute('lineOpacity', new THREE.BufferAttribute(new Float32Array(linesData.lineOpacity), 1));
								this.linesGeometry.attributes.lineOpacity.dynamic = true;

								var m = new THREE.ShaderMaterial({

										vertexShader: _shaderHelper.shaderHelper.line.vertex,
										fragmentShader: _shaderHelper.shaderHelper.line.fragment,
										side: THREE.DoubleSide,

										uniforms: {

												diffuse: { value: [0, 0, 0] },
												thickness: { value: 0.06 }

										},

										transparent: true

								});

								this.lines = new THREE.Mesh(this.linesGeometry, m);
								this.lines.renderOrder = 2;
								this.infoScene.add(this.lines);

								// Render all once when oll is loaded.

								setTimeout(function () {

										this.update(); // force update.

										this.renderer.clearDepth();
										this.renderer.clear();

										this.renderer.render(this.mainScene, this.mainCamera);
										this.renderer.render(this.scanScene, this.mainCamera, this.scanSceneRenderTarget);
										this.renderer.render(this.infoScene, this.mainCamera, this.infoSceneRenderTarget);

										this.renderer.clearDepth();
										this.renderer.render(this.screensScene, this.mainCamera);
								}.bind(this), 0);

								this.scanScreenButton2.position.x = this.getWorldRight();
						}.bind(this));
				}
		}, {
				key: 'addElement',
				value: function addElement(_name, _element) {
						var _this = this;

						this.addLoadingObject();
						this.elementToLoad++;

						var textureUrl = _element.texture;
						var shaders = _element.shaders;
						var instances = _element.instances;

						var gameObjectInstances = [];

						// For static objects just pack all the objects in a single buffer geometry to optimize rendering.

						if (_element.static) {

								// Build a geometry composed with quads.

								var vertices = [];
								var colors = [];
								var uvs = [];
								var indices = [];

								// Check all instances of this object and fill the single buffer geometry with data.

								for (var instanceIndex in instances) {

										var instance = instances[instanceIndex];

										// Create a game element to keep track of the three elements.

										if (_element.elementType) {

												var gameElement = new _library.library[_element.elementType](instance);
												gameObjectInstances.push(gameElement);
										} else {

												var _gameElement = new _library.library.PhysicalElement(instance);
												gameObjectInstances.push(_gameElement);
										}

										// Set default variables if missing.

										instance.position = instance.position || vec3.fromValues(0.0, 0.0, 0.0);
										instance.rotation = instance.rotation || vec3.fromValues(0.0, 0.0, 0.0);
										instance.scale = instance.scale || vec3.fromValues(1.0, 1.0, 1.0);
										instance.color = instance.color || vec4.fromValues(1.0, 1.0, 1.0, 1.0);

										// Create a quad with the position, rotation, and scale of the object.

										var quad = this.getQuad(instance.position, instance.rotation, instance.scale);

										// Update the indices

										for (var i = 0; i < quad.indices.length; i++) {

												indices.push(quad.indices[i] + vertices.length / 3);
										}

										// Update vertices

										// HAAAACKKKKKKK

										if (_name == 'planets') {

												for (var _i = 0; _i < quad.vertices.length; _i += 3) {

														vertices.push(quad.vertices[_i + 0]);
														vertices.push(quad.vertices[_i + 1]);
														vertices.push(instance.scale[0]);
												}
										} else {

												for (var _i2 = 0; _i2 < quad.vertices.length; _i2++) {

														vertices.push(quad.vertices[_i2]);
												}
										}

										// Update uvs

										for (var _i3 = 0; _i3 < quad.uvs.length; _i3++) {

												uvs.push(quad.uvs[_i3]);
										}

										// Update colors

										for (var _i4 = 0; _i4 < 4; _i4++) {

												colors.push(instance.color[0]);
												colors.push(instance.color[1]);
												colors.push(instance.color[2]);
												colors.push(instance.color[3]);
										}
								}

								var geometry = new THREE.BufferGeometry();
								geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
								geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
								geometry.addAttribute('rgbaColor', new THREE.BufferAttribute(new Float32Array(colors), 4));
								geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

								var mainMesh = new THREE.Mesh(geometry);
								var normalMesh = new THREE.Mesh(geometry);
								var scanMesh = new THREE.Mesh(geometry);
								var infoMesh = new THREE.Mesh(geometry);

								// Encapsulate the final step of the object creation in order to keep track of all elements.
								// As the getElementMaterial is asyncronous we must be sure that all values remains the same.

								(function (_name, _element, _gameObjectInstances) {

										this.getElementMaterial(_element, function (materials) {

												this.addMeshes(_element, {

														mainMesh: mainMesh,
														normalMesh: normalMesh,
														scanMesh: scanMesh,
														infoMesh: infoMesh

												}, materials);

												this.gameElements[_name] = {};
												for (var property in _element) {

														this.gameElements[_name][property] = _element[property];
												}

												// Override instances with newly created game objects

												this.gameElements[_name].mainGeometry = this.gameElements[_name].meshes[0].geometry;
												this.gameElements[_name].instances = _gameObjectInstances;
												this.objectOnLoad(_name);
										}.bind(this));
								}).bind(this)(_name, _element, gameObjectInstances);
						} else {

								// If individual
								// Just add a quad with the texture mapped on it.

								if (_element.individual) {

										var _instances2 = _element.instances;

										_element.instances = [];

										var _loop = function _loop(_instanceIndex) {

												var instance = _instances2[_instanceIndex];

												// Create a game element.

												if (_element.elementType) {

														var _gameElement2 = new _library.library[_element.elementType](instance);
														gameObjectInstances.push(_gameElement2);
												} else {

														var _gameElement3 = new _library.library.PhysicalElement(instance);
														gameObjectInstances.push(_gameElement3);
												}

												// Create a mesh to display the object.

												var planeGeometry = new THREE.PlaneGeometry(1, 1);

												var mainMesh = new THREE.Mesh(planeGeometry);
												var normalMesh = new THREE.Mesh(planeGeometry);
												var scanMesh = new THREE.Mesh(planeGeometry);
												var infoMesh = new THREE.Mesh(planeGeometry);

												mainMesh.position.set(instance.position[0], instance.position[1], instance.position[2]);
												normalMesh.position.set(instance.position[0], instance.position[1], instance.position[2]);
												scanMesh.position.set(instance.position[0], instance.position[1], instance.position[2]);
												infoMesh.position.set(instance.position[0], instance.position[1], instance.position[2]);

												mainMesh.rotation.set(instance.rotation[0], instance.rotation[1], instance.rotation[2]);
												normalMesh.rotation.set(instance.rotation[0], instance.rotation[1], instance.rotation[2]);
												scanMesh.rotation.set(instance.rotation[0], instance.rotation[1], instance.rotation[2]);
												infoMesh.rotation.set(instance.rotation[0], instance.rotation[1], instance.rotation[2]);

												mainMesh.scale.set(instance.scale[0], instance.scale[1], instance.scale[2]);
												normalMesh.scale.set(instance.scale[0], instance.scale[1], instance.scale[2]);
												scanMesh.scale.set(instance.scale[0], instance.scale[1], instance.scale[2]);
												infoMesh.scale.set(instance.scale[0], instance.scale[1], instance.scale[2]);

												// Encapsulate the final step of the object creation in order to keep track of all elements.
												// As the getElementMaterial is asyncronous we must be sure that all values remains the same.

												(function (_name, _element, _gameObjectInstances) {

														this.getElementMaterial(_element, function (materials) {

																this.addMeshes(_element, {

																		mainMesh: mainMesh,
																		normalMesh: normalMesh,
																		scanMesh: scanMesh,
																		infoMesh: infoMesh

																}, materials);

																this.gameElements[_name] = {};
																for (var property in _element) {

																		this.gameElements[_name][property] = _element[property];
																}

																// Override instances with newly created game objects

																this.gameElements[_name].mainGeometry = this.gameElements[_name].meshes[0].geometry;
																this.gameElements[_name].instances = _gameObjectInstances;
																this.objectOnLoad(_name);
														}.bind(this));
												}).bind(_this)(_name, _element, gameObjectInstances);
										};

										for (var _instanceIndex in _instances2) {
												_loop(_instanceIndex);
										}
								}

								// Here we pack multiple dynamic instances in one buffer and we will update them at runtime.

								else {

												// Create a geometry that will hold all the instances.
												// The transform will happen on the gpu to optimize the render loop.

												var maxInstancesNum = _element.maxInstancesNum;
												var geometryData = null;

												if (_element.buildFromInstances) {

														geometryData = this.getDataGeometryFromInstances(Object.keys(_element.instances).map(function (key) {
																return _element.instances[key];
														}));
												} else {

														geometryData = this.getDataGeometryFromNum(maxInstancesNum);
												}

												var _geometry = new THREE.BufferGeometry();

												var indexAttrib = new THREE.BufferAttribute(new Uint32Array(geometryData.indices), 1);
												var positionAttrib = new THREE.BufferAttribute(new Float32Array(geometryData.vertices), 3);
												var colorAttrib = new THREE.BufferAttribute(new Float32Array(geometryData.colors), 4);
												colorAttrib.dynamic = true;
												var uvAttrib = new THREE.BufferAttribute(new Float32Array(geometryData.uvs), 2);

												// Here we pass transform informations to the shader
												// x: pos.x
												// y: pos.y
												// z: radius
												// w: rotation.z

												var transformAttrib = new THREE.BufferAttribute(new Float32Array(geometryData.transform), 4);
												transformAttrib.dynamic = true;

												_geometry.setIndex(indexAttrib);
												_geometry.addAttribute('position', positionAttrib);
												_geometry.addAttribute('rgbaColor', colorAttrib);
												_geometry.addAttribute('uv', uvAttrib);
												_geometry.addAttribute('transform', transformAttrib);

												var _mainMesh = new THREE.Mesh(_geometry);
												var _normalMesh = new THREE.Mesh(_geometry);
												var _scanMesh = new THREE.Mesh(_geometry);
												var _infoMesh = new THREE.Mesh(_geometry);

												var _instances3 = _element.instances;

												for (var _instanceIndex2 in _instances3) {

														var _instance2 = _instances3[_instanceIndex2];

														// Create a game element.

														if (_element.elementType) {

																var _gameElement4 = new _library.library[_element.elementType](_instance2);
																gameObjectInstances.push(_gameElement4);
														} else {

																var _gameElement5 = new _library.library.PhysicalElement(_instance2);
																gameObjectInstances.push(_gameElement5);
														}
												}

												// Encapsulate the final step of the object creation in order to keep track of all elements.
												// As the getElementMaterial is asyncronous we must be sure that all values remains the same.

												(function (_name, _element, _gameObjectInstances) {

														this.getElementMaterial(_element, function (materials) {

																this.addMeshes(_element, {

																		mainMesh: _mainMesh,
																		normalMesh: _normalMesh,
																		scanMesh: _scanMesh,
																		infoMesh: _infoMesh

																}, materials);

																this.gameElements[_name] = {};
																for (var property in _element) {

																		this.gameElements[_name][property] = _element[property];
																}

																// Override instances with newly created game objects

																this.gameElements[_name].mainGeometry = this.gameElements[_name].meshes[0].geometry;
																this.gameElements[_name].instances = _gameObjectInstances;
																this.objectOnLoad(_name);
														}.bind(this));
												}).bind(this)(_name, _element, gameObjectInstances);
										}
						}
				}
		}, {
				key: 'addInstanceOf',
				value: function addInstanceOf(_name, _instance) {

						var gameElement = this.gameElements[_name];
						var newInstance = new _library.library[gameElement.elementType](_instance);

						if (gameElement.instances.length < gameElement.maxInstancesNum) {

								gameElement.instances.push(newInstance);
						}

						return newInstance;
				}
		}, {
				key: 'getInstanceByName',
				value: function getInstanceByName(_nameElement, _nameInstance) {

						for (var i = 0; i < this.gameElements[_nameElement].instances.length; i++) {

								if (this.gameElements[_nameElement].instances[i].name == _nameInstance) {

										return this.gameElements[_nameElement].instances[i];
								}
						}
				}

				// This function adds meshes to all of the layers.

		}, {
				key: 'addMeshes',
				value: function addMeshes(_element, _meshes, _materials) {

						if (_element) _element.meshes = [];

						if (_materials.main) {

								_meshes.mainMesh.material = _materials.main;
								this.mainScene.add(_meshes.mainMesh);
								this.scanScene.add(_meshes.mainMesh);
								this.infoScene.add(_meshes.mainMesh);

								if (_element) _element.meshes.push(_meshes.mainMesh);
						} else {

								if (_materials.normal) {

										_meshes.normalMesh.material = _materials.normal;
										_meshes.normalMesh.renderOrder = _element.renderOrder || 0;
										this.mainScene.add(_meshes.normalMesh);

										if (_element) _element.meshes.push(_meshes.normalMesh);
								}

								if (_materials.scan) {

										_meshes.scanMesh.material = _materials.scan;
										_meshes.scanMesh.renderOrder = _element.renderOrder || 0;
										this.scanScene.add(_meshes.scanMesh);

										if (_element) _element.meshes.push(_meshes.scanMesh);
								}

								if (_materials.infos) {

										_meshes.infoMesh.material = _materials.infos;
										_meshes.infoMesh.renderOrder = _element.renderOrder || 0;
										this.infoScene.add(_meshes.infoMesh);

										if (_element) _element.meshes.push(_meshes.infoMesh);
								}
						}
				}
		}, {
				key: 'getQuad',
				value: function getQuad(position, rotation, scale) {

						// Create a qud geometry composed of four vertices uvs and indices.

						var vertices = [];
						var uvs = [0, 0, 1, 0, 1, 1, 0, 1];
						var indices = [0, 1, 2, 2, 3, 0];

						var v = [vec3.fromValues(-1.0, -1.0, 0.0), vec3.fromValues(1.0, -1.0, 0.0), vec3.fromValues(1.0, 1.0, 0.0), vec3.fromValues(-1.0, 1.0, 0.0)];

						var modelMatrix = mat4.create();
						mat4.translate(modelMatrix, modelMatrix, position);
						mat4.rotateX(modelMatrix, modelMatrix, rotation[0], [1, 0, 0]);
						mat4.rotateY(modelMatrix, modelMatrix, rotation[1], [0, 1, 0]);
						mat4.rotateZ(modelMatrix, modelMatrix, rotation[2], [0, 0, 1]);
						mat4.scale(modelMatrix, modelMatrix, scale);

						for (var i = 0; i < 4; i++) {

								vec3.transformMat4(v[i], v[i], modelMatrix);

								vertices.push(v[i][0]);
								vertices.push(v[i][1]);
								vertices.push(v[i][2]);
						}

						return {

								vertices: vertices,
								uvs: uvs,
								indices: indices

						};
				}
		}, {
				key: 'getDataGeometryFromNum',
				value: function getDataGeometryFromNum(_num) {

						var indices = [];
						var vertices = [];
						var colors = [];
						var uvs = [];
						var transform = [];

						for (var i = _num - 1; i >= 0; i--) {

								// Update the indices

								for (var j = 0; j < this.genericQuad.indices.length; j++) {

										indices.push(this.genericQuad.indices[j] + vertices.length / 3);
								}

								// Update vertices

								for (var _j = 0; _j < this.genericQuad.vertices.length; _j += 3) {

										vertices.push(this.genericQuad.vertices[_j + 0]);
										vertices.push(this.genericQuad.vertices[_j + 1]);
										vertices.push(this.genericQuad.vertices[_j + 2]); // Hack pass the y scale
								}

								// Update uvs

								for (var _j2 = 0; _j2 < this.genericQuad.uvs.length; _j2++) {

										uvs.push(this.genericQuad.uvs[_j2]);
								}

								// Update colors

								for (var _j3 = 0; _j3 < 4; _j3++) {

										colors.push(1.0);
										colors.push(1.0);
										colors.push(1.0);
										colors.push(1.0);

										transform.push(0.0);
										transform.push(0.0);
										transform.push(0.0);
										transform.push(0.0);
								}
						}

						return {

								indices: indices,
								vertices: vertices,
								colors: colors,
								uvs: uvs,
								transform: transform

						};
				}
		}, {
				key: 'getDataGeometryFromInstances',
				value: function getDataGeometryFromInstances(_instances) {

						var indices = [];
						var vertices = [];
						var colors = [];
						var uvs = [];
						var transform = [];

						for (var i = _instances.length - 1; i >= 0; i--) {

								var instance = _instances[i];

								// Set default variables if missing.

								instance.position = instance.position || vec3.fromValues(0.0, 0.0, 0.0);
								instance.rotation = instance.rotation || vec3.fromValues(0.0, 0.0, 0.0);
								instance.scale = instance.scale || vec3.fromValues(1.0, 1.0, 1.0);
								instance.color = instance.color || vec4.fromValues(1.0, 1.0, 1.0, 1.0);

								// Update the indices

								for (var j = 0; j < this.genericQuad.indices.length; j++) {

										indices.push(this.genericQuad.indices[j] + vertices.length / 3);
								}

								// Update vertices

								for (var _j4 = 0; _j4 < this.genericQuad.vertices.length; _j4 += 3) {

										vertices.push(this.genericQuad.vertices[_j4 + 0]);
										vertices.push(this.genericQuad.vertices[_j4 + 1]);
										vertices.push(_instances[i].scale[1]); // Hack pass the y scale
								}

								// Update uvs

								for (var _j5 = 0; _j5 < this.genericQuad.uvs.length; _j5++) {

										uvs.push(this.genericQuad.uvs[_j5]);
								}

								// Update colors

								for (var _j6 = 0; _j6 < 4; _j6++) {

										colors.push(instance.color[0]);
										colors.push(instance.color[1]);
										colors.push(instance.color[2]);
										colors.push(instance.color[3]);

										transform.push(instance.position[0]);
										transform.push(instance.position[1]);
										transform.push(instance.scale[0]);
										transform.push(instance.rotation[2] || 0);
								}
						}

						return {

								indices: indices,
								vertices: vertices,
								colors: colors,
								uvs: uvs,
								transform: transform

						};
				}
		}, {
				key: 'getLinesData',
				value: function getLinesData() {

						var linesIndices = [];
						var linesPositions = [];
						var linesNormals = [];
						var linesMiters = [];
						var linesOpacities = [];

						for (var element in this.gameElements) {

								if (this.gameElements[element].drawInfos) {

										var maxInstancesNum = this.gameElements[element].maxInstancesNum || 0;

										var mainInfoPointIndex = undefined;

										if (this.gameElements[element].mainInfoPointIndex !== undefined) {

												mainInfoPointIndex = this.gameElements[element].mainInfoPointIndex;
										}

										// Create or overide an object to store where the text should be located

										this.gameElements[element].textPoints = {};
										var pointObjectIndex = 0;

										var instances = this.gameElements[element].instances;

										for (var i = 0; i < maxInstancesNum; i++) {

												var lPoints = null;
												var opacity = 0;

												if (i < instances.length) {

														var infoPointIndex = instances[i].infoPointIndex;

														var iPos2 = [instances[i].position[0], instances[i].position[1]]; // Object position
														var tPos2 = [0, 0];

														if (mainInfoPointIndex !== undefined && infoPointIndex === undefined) {

																var numPerPoint = Math.floor(this.baseGridX / instances.length);
																var attachedInstances = [];

																for (var j = 0; j < this.baseGridX; j++) {

																		// let index = j * 3 * this.baseGridX + mainInfoPointIndex * 3;
																		var fI = j;

																		if (fI == 0) fI = 1;

																		var _index = fI * 3 + this.baseGridX * 3 * mainInfoPointIndex;
																		var point = [this.baseGrid[_index + 0], this.baseGrid[_index + 1]];

																		var dY = Math.abs(iPos2[1] - point[1]);
																		var dX = Math.abs(iPos2[0] - point[0]);

																		// if ( dY < this.getWorldTop () / ( this.baseGridY - 1.0 ) ) {

																		// 	tPos2 = point;
																		// 	if ( !this.gameElements[ element ].textPoints[ j ] ) this.gameElements[ element ].textPoints[ j ] = { point: point, instances: [] };
																		// 	this.gameElements[ element ].textPoints[ j ].instances.push ( instances[ i ] );
																		// 	break;

																		// }

																		if (dX < this.getWorldRight() / (this.baseGridX - 1.0)) {

																				tPos2 = point;
																				if (!this.gameElements[element].textPoints[j]) this.gameElements[element].textPoints[j] = { point: point, instances: [] };
																				this.gameElements[element].textPoints[j].instances.push(instances[i]);
																				break;
																		}
																}
														} else if (infoPointIndex !== undefined) {

																var _index2 = infoPointIndex * 3;
																tPos2 = [this.baseGrid[_index2 + 0], this.baseGrid[_index2 + 1]];

																if (!this.gameElements[element].textPoints[i]) this.gameElements[element].textPoints[_index2] = { point: tPos2, instances: [] };
																this.gameElements[element].textPoints[_index2].instances.push(instances[i]);
														} else {

																tPos2 = [this.baseGrid[0 * 3 + 0], this.baseGrid[0 * 3 + 1]];
																if (!this.gameElements[element].textPoints[i]) this.gameElements[element].textPoints[index] = { point: tPos2, instances: [] };
																this.gameElements[element].textPoints[0].instances.push(instances[0]);
														}

														var dir = [(iPos2[0] - tPos2[0]) * 0.5, (iPos2[1] - tPos2[1]) * 0.5];

														var cPos2 = [tPos2[0] + dir[0], tPos2[1]];
														lPoints = this.quadratic(iPos2, cPos2, tPos2, 0);
														opacity = instances[i].color[3] * instances[i].lifeStartMultiplier;
												} else {

														var _iPos = [30, 30];
														var _tPos = [10, 10];
														var _cPos = [0, 0];
														lPoints = this.quadratic(_iPos, _cPos, _tPos, 0);
												}

												var lGeom = this.generateLine(lPoints);

												for (var _j7 = 0; _j7 < lGeom.index.length; _j7++) {

														linesIndices.push(lGeom.index[_j7] + linesPositions.length / 3);
												}

												for (var _j8 = 0; _j8 < lGeom.position.length; _j8++) {

														linesPositions.push(lGeom.position[_j8]);
												}

												for (var _j9 = 0; _j9 < lGeom.lineNormal.length; _j9++) {

														linesNormals.push(lGeom.lineNormal[_j9]);
												}

												for (var _j10 = 0; _j10 < lGeom.lineMiter.length; _j10++) {

														linesMiters.push(lGeom.lineMiter[_j10]);
														linesOpacities.push(opacity);
												}
										}
								}
						}

						return {

								index: linesIndices,
								position: linesPositions,
								lineNormal: linesNormals,
								lineMiter: linesMiters,
								lineOpacity: linesOpacities

						};
				}
		}, {
				key: 'generateLine',
				value: function generateLine(path, closed) {

						path = path || [];
						var normals = getNormals(path, closed);
						var indexCount = Math.max(0, (path.length - 1) * 6);

						var count = path.length * 2;
						var attrPosition = new Float32Array(count * 3);
						var attrNormal = new Float32Array(count * 2);
						var attrMiter = new Float32Array(count);
						var attrIndex = new Uint32Array(indexCount);

						var index = 0;
						var c = 0;
						var dIndex = 0;
						var indexArray = attrIndex;

						path.forEach(function (point, pointIndex, list) {

								var i = index;
								indexArray[c++] = i / 3 + 0;
								indexArray[c++] = i / 3 + 1;
								indexArray[c++] = i / 3 + 2;
								indexArray[c++] = i / 3 + 2;
								indexArray[c++] = i / 3 + 1;
								indexArray[c++] = i / 3 + 3;

								attrPosition[index++] = point[0];
								attrPosition[index++] = point[1];
								attrPosition[index++] = 0;
								attrPosition[index++] = point[0];
								attrPosition[index++] = point[1];
								attrPosition[index++] = 0;
						});

						var nIndex = 0;
						var mIndex = 0;

						normals.forEach(function (n) {

								var norm = n[0];
								var miter = n[1];

								attrNormal[nIndex++] = norm[0];
								attrNormal[nIndex++] = norm[1];
								attrNormal[nIndex++] = norm[0];
								attrNormal[nIndex++] = norm[1];

								attrMiter[mIndex++] = -miter;
								attrMiter[mIndex++] = miter;
						});

						return {

								position: attrPosition,
								lineNormal: attrNormal,
								lineMiter: attrMiter,
								index: attrIndex

						};
				}
		}, {
				key: 'getElementMaterial',
				value: function getElementMaterial(_element, _onLoad) {

						var shaders = _element.shaders;
						var materials = {};
						var numShaders = Object.keys(shaders).length;

						var _loop2 = function _loop2(type) {

								var shader = shaders[type];

								if (shader) {

										if (shader.textureUrl) {

												(function (shader) {

														var texture = new THREE.TextureLoader().load(shader.textureUrl, function (texture) {

																var uniforms = shader.uniforms || {};
																uniforms.texture = { value: texture };

																materials[type] = new THREE.ShaderMaterial({

																		vertexShader: _shaderHelper.shaderHelper[shader.name].vertex,
																		fragmentShader: _shaderHelper.shaderHelper[shader.name].fragment,
																		uniforms: uniforms,

																		transparent: shader.transparent || false,
																		depthWrite: _element.depthWrite || false,
																		depthTest: _element.depthTest || false,

																		blending: THREE[shader.blending] || THREE.NormalBlending

																});

																// Activate OES_standard_derivatives

																materials[type].extensions.derivatives = true;

																numShaders--;
																checkLoad();
														});
												})(shader);
										} else {

												materials[type] = new THREE.ShaderMaterial({

														vertexShader: _shaderHelper.shaderHelper[shader.name].vertex,
														fragmentShader: _shaderHelper.shaderHelper[shader.name].fragment,
														uniforms: shader.uniforms,

														blending: THREE[shader.blending] || THREE.NormalBlending,

														transparent: shader.transparent || false,
														depthWrite: _element.depthWrite || false,
														depthTest: _element.depthTest || false

												});

												// Activate OES_standard_derivatives

												materials[type].extensions.derivatives = true;

												numShaders--;
												checkLoad();
										}
								} else {

										numShaders--;
										materials[type] = null;
										checkLoad();
								}
						};

						for (var type in shaders) {
								_loop2(type);
						}

						function checkLoad() {

								if (numShaders == 0) {

										_onLoad(materials);
								}
						}
				}
		}, {
				key: 'initPlayer',
				value: function initPlayer(_numInstances, _options) {

						this.resetPlayer(_numInstances, _options);
				}
		}, {
				key: 'resetPlayer',
				value: function resetPlayer(_numInstances, _options) {}
		}, {
				key: 'makeTextSprite',
				value: function makeTextSprite(message, parameters) {

						function roundRect(ctx, x, y, w, h, r) {
								ctx.beginPath();ctx.moveTo(x + r, y);ctx.lineTo(x + w - r, y);ctx.quadraticCurveTo(x + w, y, x + w, y + r);ctx.lineTo(x + w, y + h - r);ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);ctx.lineTo(x + r, y + h);ctx.quadraticCurveTo(x, y + h, x, y + h - r);ctx.lineTo(x, y + r);ctx.quadraticCurveTo(x, y, x + r, y);ctx.closePath();ctx.fill();ctx.stroke();
						}

						if (parameters === undefined) parameters = {};
						var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
						var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
						var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
						var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
						var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };
						var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

						var canvas = document.createElement('canvas');
						var context = canvas.getContext('2d');
						context.font = "Bold " + fontsize + "px " + fontface;
						var metrics = context.measureText(message);
						var textWidth = metrics.width;

						context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
						context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

						context.lineWidth = borderThickness;
						roundRect(context, borderThickness / 2, borderThickness / 2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

						context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
						context.fillText(message, borderThickness, fontsize + borderThickness);

						var texture = new THREE.Texture(canvas);
						texture.needsUpdate = true;

						var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
						var sprite = new THREE.Sprite(spriteMaterial);
						sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
						return sprite;
				}
		}, {
				key: 'sign',
				value: function sign(p1, p2, p3) {

						return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
				}
		}, {
				key: 'isInBox',
				value: function isInBox(_instance, _pt) {

						var v = [];

						v.push(vec3.fromValues(-1.0, -1.0, 0.0));
						v.push(vec3.fromValues(1.0, -1.0, 0.0));
						v.push(vec3.fromValues(1.0, 1.0, 0.0));
						v.push(vec3.fromValues(-1.0, 1.0, 0.0));

						var modelMatrix = mat4.create();
						mat4.translate(modelMatrix, modelMatrix, _instance.position);
						mat4.rotateX(modelMatrix, modelMatrix, _instance.rotation[0]);
						mat4.rotateY(modelMatrix, modelMatrix, _instance.rotation[1]);
						mat4.rotateZ(modelMatrix, modelMatrix, _instance.rotation[2]);
						mat4.scale(modelMatrix, modelMatrix, _instance.scale);

						for (var i = 0; i < 4; i++) {

								vec3.transformMat4(v[i], v[i], modelMatrix);
						}

						var b1 = void 0,
						    b2 = void 0,
						    b3 = void 0;

						b1 = this.sign(_pt, v[0], v[1]) < 0.0;
						b2 = this.sign(_pt, v[1], v[2]) < 0.0;
						b3 = this.sign(_pt, v[2], v[0]) < 0.0;

						if (b1 == b2 && b2 == b3) {

								return true;
						} else {

								b1 = this.sign(_pt, v[0], v[2]) < 0.0;
								b2 = this.sign(_pt, v[2], v[3]) < 0.0;
								b3 = this.sign(_pt, v[3], v[0]) < 0.0;
						}

						return b1 == b2 && b2 == b3;
				}
		}, {
				key: 'getWidth',
				value: function getWidth() {

						return this.renderer.domElement.offsetWidth * this.renderer.getPixelRatio();
				}
		}, {
				key: 'getHeight',
				value: function getHeight() {

						return this.renderer.domElement.offsetHeight * this.renderer.getPixelRatio();
				}
		}, {
				key: 'getWorldTop',
				value: function getWorldTop() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(0, 0)).y;
				}
		}, {
				key: 'getWorldBottom',
				value: function getWorldBottom() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(0, this.getHeight())).y;
				}
		}, {
				key: 'getWorldLeft',
				value: function getWorldLeft() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(0, 0)).x;
				}
		}, {
				key: 'getWorldRight',
				value: function getWorldRight() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(this.getWidth(), 0)).x;
				}
		}, {
				key: 'checkEdges',
				value: function checkEdges(_vector, _offset) {

						_offset = _offset || 0;

						if (_vector[0] > this.getWorldRight() + _offset || _vector[0] < this.getWorldLeft() - _offset || _vector[1] > this.getWorldTop() + _offset || _vector[1] < this.getWorldBottom() - _offset) return true;
						return false;
				}
		}, {
				key: 'updateMouseWorld',
				value: function updateMouseWorld(_mouse) {

						this.mouseWorld = this.get3DPointOnBasePlane(_mouse);
						this.glMouseWorld = vec3.fromValues(this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z);
				}
		}, {
				key: 'get3DPointOnBasePlane',
				value: function get3DPointOnBasePlane(_vector) {

						var vector = new THREE.Vector3();
						vector.set(_vector.x / this.getWidth() * 2 - 1, -(_vector.y / this.getHeight()) * 2 + 1, 0.5);
						vector.unproject(this.mainCamera);
						var dir = vector.sub(this.mainCamera.position).normalize();
						var distance = -this.mainCamera.position.z / dir.z;

						return this.mainCamera.position.clone().add(dir.multiplyScalar(distance));
				}
		}, {
				key: 'get2DPos',
				value: function get2DPos(_vector) {

						var width = this.getWidth(),
						    height = this.getHeight();
						var widthHalf = width / 2,
						    heightHalf = height / 2;

						var pos = _vector.clone();
						pos.project(this.mainCamera);
						pos.x = pos.x * widthHalf + widthHalf;
						pos.y = -(pos.y * heightHalf) + heightHalf;

						return pos;
				}
		}, {
				key: 'checkButtons',
				value: function checkButtons() {

						var distToScanButton = this.mouseWorld.distanceTo(this.scanScreenButton.position);
						var onScan = false;

						if (distToScanButton < this.scanScreenButton.scale.x * 1.0) {

								onScan = true;
						}

						var distToInfoButton = this.mouseWorld.distanceTo(this.infoScreenButton.position);
						var onInfo = false;

						if (distToInfoButton < this.infoScreenButton.scale.x * 1.0) {

								onInfo = true;
						}

						// Check where the screens are to make an intuitive interaction when they are overlapping.

						if (this.scanScreenTargetPosition.x != 0.0 && this.infoScreenTargetPosition.x != 0.0) {

								if (onScan) return this.scanScreen;
								if (onInfo) return this.infoScreen;
						} else if (this.scanScreenTargetPosition.x == 0.0 && this.infoScreenTargetPosition.x != 0.0) {

								if (onScan) return this.scanScreen;
								if (onScan) return this.infoScreen;
						} else if (this.scanScreenTargetPosition.x != 0.0 && this.infoScreenTargetPosition.x == 0.0) {

								if (onInfo) return this.infoScreen;
								if (onScan) return this.scanScreen;
						}
				}
		}, {
				key: 'addLoadingObject',
				value: function addLoadingObject() {

						this.loadObjects++;
				}
		}, {
				key: 'objectOnLoad',
				value: function objectOnLoad(_string) {

						this.loadObjects--;

						if (_string) {

								console.log('loaded: ' + _string);
						}

						if (this.loadObjects == 0) {

								console.log('\n*** Level loaded ***\n ');

								this.levelLoaded = true;

								if (this.onLoadCallback) {

										for (var i = 0; i < this.onLoadCallback.length; i++) {

												this.onLoadCallback[i]();
										}
								}
						}
				}
		}, {
				key: 'onLoad',
				value: function onLoad(_callback) {

						if (!this.onLoadCallback) this.onLoadCallback = [];
						this.onLoadCallback.push(_callback);
				}
		}, {
				key: 'update',
				value: function update(_deltaTime, _forceUpdate) {

						if (!this.levelLoaded && !_forceUpdate) return;

						// Update the screens.

						if (this.scanScreen.position.x >= this.getWorldRight() * 1.8) this.scanScreenClosed = true;else this.scanScreenClosed = false;

						if (this.scanScreen.position.x <= 0.5) this.scanScreenOpened = true;else this.scanScreenOpened = false;

						this.scanScreen.position.x += (this.scanScreenTargetPosition.x - this.scanScreen.position.x) * 0.2;
						this.scanScreen.position.y += (this.scanScreenTargetPosition.y - this.scanScreen.position.y) * 0.2;
						this.scanScreenButton.position.x = this.scanScreen.position.x - this.getWorldRight();
						this.scanScreenButton.position.y = this.scanScreen.position.y;

						if (this.infoScreen.position.x <= this.getWorldLeft() * 1.8) this.infoScreenClosed = true;else this.infoScreenClosed = false;

						if (this.infoScreen.position.x >= -0.5) this.infoScreenOpened = true;else this.infoScreenOpened = false;

						this.infoScreen.position.x += (this.infoScreenTargetPosition.x - this.infoScreen.position.x) * 0.2;
						this.infoScreen.position.y += (this.infoScreenTargetPosition.y - this.infoScreen.position.y) * 0.2;
						this.infoScreenButton.position.x = this.infoScreen.position.x + this.getWorldRight();
						this.infoScreenButton.position.y = this.infoScreen.position.y;

						if (!this.mouseDown) {

								// Check screens limits.

								if (this.scanScreenButton.position.x > this.getWorldRight() * 0.7) {

										this.scanScreenTargetPosition.x = this.getWorldRight() * 2.0;
								}

								if (this.scanScreenButton.position.x < this.getWorldLeft() * 0.7) {

										this.scanScreenTargetPosition.x = 0.0;
								}

								if (this.infoScreenButton.position.x < this.getWorldLeft() * 0.7) {

										this.infoScreenTargetPosition.x = this.getWorldLeft() * 2.0;
								}

								if (this.infoScreenButton.position.x > this.getWorldRight() * 0.7) {

										this.infoScreenTargetPosition.x = 0.0;
								}
						}

						// Update the game elements.

						for (var elementName in this.gameElements) {

								var element = this.gameElements[elementName];

								if (!element.static && !element.manualMode) {

										if (element.individual) {

												var instances = this.gameElements[elementName].instances;

												for (var i = instances.length - 1; i >= 0; i--) {

														var instance = instances[i];

														if (!instance.isDead()) {

																instance.update(_deltaTime);

																for (var j = 0; j < element.meshes.length; j++) {

																		element.meshes[j].position.set(instance.position[0], instance.position[1], instance.position[2]);
																		element.meshes[j].rotation.set(instance.rotation[0], instance.rotation[1], instance.rotation[2]);
																		element.meshes[j].scale.set(instance.scale[0], instance.scale[1], instance.scale[2]);
																}
														} else {

																this.gameElements[elementName].instances.splice(i, 1);
														}
												}
										} else {

												var maxInstancesNum = this.gameElements[elementName].maxInstancesNum;
												var _instances4 = this.gameElements[elementName].instances;

												var geometry = element.mainGeometry;

												for (var _i5 = maxInstancesNum; _i5 >= 0; _i5--) {

														if (_i5 < _instances4.length) {

																if (!_instances4[_i5].isDead()) {

																		_instances4[_i5].update(_deltaTime);

																		for (var _j11 = 0; _j11 < 4; _j11++) {

																				geometry.attributes.transform.array[_i5 * 16 + _j11 * 4 + 0] = _instances4[_i5].position[0];
																				geometry.attributes.transform.array[_i5 * 16 + _j11 * 4 + 1] = _instances4[_i5].position[1];

																				geometry.attributes.transform.array[_i5 * 16 + _j11 * 4 + 3] = _instances4[_i5].rotation[2];

																				geometry.attributes.rgbaColor.array[_i5 * 16 + _j11 * 4 + 0] = _instances4[_i5].color[0];
																				geometry.attributes.rgbaColor.array[_i5 * 16 + _j11 * 4 + 1] = _instances4[_i5].color[1];
																				geometry.attributes.rgbaColor.array[_i5 * 16 + _j11 * 4 + 2] = _instances4[_i5].color[2];

																				// Hack pass the sign along with the scale & color alpha

																				if (_instances4[_i5].name == 'gravityChargeParticle') {

																						// console.log(instances[ i ].charge);
																						var s = Math.sign(_instances4[_i5].charge);
																						if (s == 0) s = 1;
																						geometry.attributes.transform.array[_i5 * 16 + _j11 * 4 + 2] = _instances4[_i5].scale[0] * s;
																				} else {

																						geometry.attributes.transform.array[_i5 * 16 + _j11 * 4 + 2] = _instances4[_i5].scale[0];
																						geometry.attributes.rgbaColor.array[_i5 * 16 + _j11 * 4 + 3] = _instances4[_i5].color[3];
																				}
																		}
																} else {

																		_instances4.splice(_i5, 1);
																}
														} else {

																for (var _j12 = 0; _j12 < 4; _j12++) {

																		geometry.attributes.transform.array[_i5 * 16 + _j12 * 4 + 0] = 0;
																		geometry.attributes.transform.array[_i5 * 16 + _j12 * 4 + 1] = 0;
																		geometry.attributes.transform.array[_i5 * 16 + _j12 * 4 + 2] = 0;
																		geometry.attributes.transform.array[_i5 * 16 + _j12 * 4 + 3] = 0;

																		geometry.attributes.rgbaColor.array[_i5 * 16 + _j12 * 4 + 0] = 0;
																		geometry.attributes.rgbaColor.array[_i5 * 16 + _j12 * 4 + 1] = 0;
																		geometry.attributes.rgbaColor.array[_i5 * 16 + _j12 * 4 + 2] = 0;
																		geometry.attributes.rgbaColor.array[_i5 * 16 + _j12 * 4 + 3] = 0;
																}
														}
												}

												geometry.attributes.transform.needsUpdate = true;
												geometry.attributes.rgbaColor.needsUpdate = true;
										}
								} else if (element.static && !element.manualMode) {

										var _instances5 = this.gameElements[elementName].instances;

										for (var _i6 = 0; _i6 < _instances5.length; _i6++) {

												_instances5[_i6].update(_deltaTime);
										}
								}
						}

						// Update end circle

						var aPos = this.gameElements.arrival.instances[0].position;
						var aSca = this.gameElements.arrival.instances[0].scale;

						aSca[0] += (this.arrivalScaleTarget - aSca[0]) * 0.05;
						aSca[1] += (this.arrivalScaleTarget - aSca[1]) * 0.05;

						this.endCircle.position.set(aPos[0], aPos[1], aPos[2]);
						this.endCircleMaterial.uniforms.alpha.value += (this.endCircleAlphaTarget - this.endCircleMaterial.uniforms.alpha.value) * 0.05;
						this.endCircleMaterial.uniforms.scale.value += (this.endCircleTargetScale - this.endCircleMaterial.uniforms.scale.value) * 0.05;

						// Check finish

						var dist = vec3.length(vec3.sub([0, 0, 0], this.gameElements.arrival.instances[0].position, this.gameElements.player.instances[0].position));

						if (dist < this.gameElements.arrival.instances[0].scale[0] && !this.levelCompleted && this.scanScreenClosed && this.infoScreenClosed) {

								this.levelCompleted = true;
								this.endCircleTargetScale = this.getWorldRight() > this.getWorldTop() ? this.getWorldRight() * 4 : this.getWorldTop() * 4;
								this.endCircleAlphaTarget = 0.0;
								this.arrivalScaleTarget = 0.0;

								this.soundManager.play('Gong_sound_' + Math.floor(Math.random() * 2), { volume: 0.2 });
								this.soundManager.play('Gong_sound_' + (Math.floor(Math.random() * 2) + 2), { volume: 0.2 });
								this.soundManager.play('Triangle_sound_' + Math.floor(Math.random() * 2), { volume: 0.2 });
						}

						// Update text intro

						if (this.textBackground) this.textBackground.material.opacity += (this.textBackground.material.alphaTarget - this.textBackground.material.opacity) * 0.1;
						if (this.textIntro) this.textIntro.material.uniforms.opacity.value += (this.textIntro.material.alphaTarget - this.textIntro.material.uniforms.opacity.value) * 0.1;

						// Update lines

						if (this.infoScreenClosed) return;

						var linesData = this.getLinesData();

						this.linesGeometry.index.array = new Uint32Array(linesData.index);
						this.linesGeometry.index.needsUpdate = true;

						this.linesGeometry.attributes.position.array = new Float32Array(linesData.position);
						this.linesGeometry.attributes.position.needsUpdate = true;

						this.linesGeometry.attributes.lineNormal.array = new Float32Array(linesData.lineNormal);
						this.linesGeometry.attributes.lineNormal.needsUpdate = true;

						this.linesGeometry.attributes.lineMiter.array = new Float32Array(linesData.lineMiter);
						this.linesGeometry.attributes.lineMiter.needsUpdate = true;

						this.linesGeometry.attributes.lineOpacity.array = new Float32Array(linesData.lineOpacity);
						this.linesGeometry.attributes.lineOpacity.needsUpdate = true;
				}
		}, {
				key: 'explosionSound',
				value: function explosionSound() {

						this.soundManager.play('Hit_sound_' + Math.floor(Math.random() * 4), { volume: 1.0 });
						this.soundManager.play('Gong_sound_' + Math.floor(Math.random() * 4), { volume: 0.05 });
						this.soundManager.play('Explosion_sound_' + Math.floor(Math.random() * 3), { volume: 0.1 });
				}
		}, {
				key: 'removeTextIntro',
				value: function removeTextIntro() {

						setTimeout(function () {

								this.infoScreenTargetPosition.x = this.getWorldLeft() * 2;
						}.bind(this), 1000);

						setTimeout(function () {

								this.scanScreenTargetPosition.x = this.getWorldRight() * 2;
						}.bind(this), 1800);

						if (this.textIntro) this.textIntro.material.alphaTarget = 0;
						if (this.textBackground) this.textBackground.material.alphaTarget = 0;
				}
		}, {
				key: 'reloadLevel',
				value: function reloadLevel() {}
		}, {
				key: 'clearLevel',
				value: function clearLevel(_onClear) {

						setTimeout(function () {

								this.renderer.clearDepth();
								this.renderer.clear();

								while (this.mainScene.children.length > 0) {

										// this.removeObj ( this.mainScene.children[ 0 ], this.mainScene );
										this.mainScene.remove(this.mainScene.children[0]);
								}

								while (this.scanScene.children.length > 0) {

										// this.removeObj ( this.mainScene.children[ 0 ] );
										this.scanScene.remove(this.scanScene.children[0]);
								}

								while (this.infoScene.children.length > 0) {

										this.infoScene.remove(this.infoScene.children[0]);
								}

								if (_onClear) _onClear();

								this.backgroundSound.stop();
						}.bind(this), 1000);
				}
		}, {
				key: 'removeObj',
				value: function removeObj(obj, scene) {

						if (obj instanceof THREE.Mesh) {

								obj.geometry.dispose();
								obj.geometry = null;
								obj.material.dispose();
								obj.material = null;
								obj.dispose(); // required in r69dev to remove references from the renderer.
								obj = null;
						} else {

								if (obj.children !== undefined) {

										while (obj.children.length > 0) {

												scene(obj.children[0]);
												obj.remove(obj.children[0]);
										}
								}
						}
				}
		}, {
				key: 'onWin',
				value: function onWin(_callback) {

						this.onWinCallback = _callback;
				}
		}, {
				key: 'updateRenderer',
				value: function updateRenderer() {

						this.renderer.clearDepth();
						this.renderer.clear();
						this.renderer.render(this.mainScene, this.mainCamera);
						this.renderer.render(this.scanScene, this.mainCamera, this.scanSceneRenderTarget);
						this.renderer.render(this.infoScene, this.mainCamera, this.infoSceneRenderTarget);
						this.renderer.clearDepth();
						this.renderer.render(this.screensScene, this.mainCamera);
				}
		}, {
				key: 'render',
				value: function render() {

						this.renderer.clearDepth();
						this.renderer.clear();

						if (!this.scanScreenOpened && !this.infoScreenOpened) {

								this.renderer.render(this.mainScene, this.mainCamera);
						}

						// Render to scan target

						if (!this.scanScreenClosed && !this.infoScreenOpened) {

								this.renderer.render(this.scanScene, this.mainCamera, this.scanSceneRenderTarget);
						}

						// Render to info target

						if (!this.infoScreenClosed) {

								this.renderer.render(this.infoScene, this.mainCamera, this.infoSceneRenderTarget);
						}

						this.renderer.clearDepth();
						this.renderer.render(this.screensScene, this.mainCamera);
				}
		}, {
				key: 'log',
				value: function log(_string) {

						var text = _string + "";
						console.log(this.constructor.name + ": " + text);
				}
		}, {
				key: 'logWarn',
				value: function logWarn(_string) {

						var text = _string + "";
						console.warn(this.constructor.name + " WARN: " + text);
				}
		}, {
				key: 'logError',
				value: function logError(_string) {

						var text = _string + "";
						console.error(this.constructor.name + " ERROR: " + text);
				}
		}, {
				key: 'throwError',
				value: function throwError(_string) {

						var text = _string + "";
						throw this.constructor.name + " ERROR: " + text;
				}
		}]);

		return LevelCore;
}();

},{"../utils":76,"./library":68,"./shaderHelper":69,"adaptive-bezier-curve":2,"adaptive-quadratic-curve":4,"load-bmfont":25,"polyline-normals":35,"three-bmfont-text":41,"three-bmfont-text/shaders/msdf":44,"three-bmfont-text/shaders/sdf":45,"three-buffer-vertex-data":46,"three-line-2d":47,"three-line-2d/shaders/basic":48}],62:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Obstacle = undefined;

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Obstacle = exports.Obstacle = function (_PhysicalElement) {
	_inherits(Obstacle, _PhysicalElement);

	function Obstacle(_options) {
		_classCallCheck(this, Obstacle);

		return _possibleConstructorReturn(this, (Obstacle.__proto__ || Object.getPrototypeOf(Obstacle)).call(this, _options));
	}

	return Obstacle;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Particle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Particle = exports.Particle = function (_PhysicalElement) {
		_inherits(Particle, _PhysicalElement);

		function Particle(_options) {
				_classCallCheck(this, Particle);

				var _this = _possibleConstructorReturn(this, (Particle.__proto__ || Object.getPrototypeOf(Particle)).call(this, _options));

				_this.radius = 0;
				_this.charge = 1;

				return _this;
		}

		_createClass(Particle, [{
				key: "update",
				value: function update() {

						_get(Particle.prototype.__proto__ || Object.getPrototypeOf(Particle.prototype), "update", this).call(this);

						this.color[3] = this.lifePercent;

						this.radius += (this.initialRadius - this.radius) * 0.08;

						this.scale = vec3.fromValues(this.lifePercent * this.radius, this.lifePercent * this.radius, this.lifePercent * this.radius);
				}
		}]);

		return Particle;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],64:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.PhysicalElement = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ElementCore2 = require("./ElementCore");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PhysicalElement = exports.PhysicalElement = function (_ElementCore) {
	_inherits(PhysicalElement, _ElementCore);

	function PhysicalElement(_options) {
		_classCallCheck(this, PhysicalElement);

		var _this = _possibleConstructorReturn(this, (PhysicalElement.__proto__ || Object.getPrototypeOf(PhysicalElement)).call(this, _options));

		_options = _options || {};

		_this.position = _options.position ? [_options.position[0], _options.position[1], _options.position[2]] : [0, 0, 0];
		_this.rotation = _options.rotation ? [_options.rotation[0], _options.rotation[1], _options.rotation[2]] : [0, 0, 0];
		_this.scale = _options.scale ? [_options.scale[0], _options.scale[1], _options.scale[2]] : [0, 0, 0];

		_this.velocity = _options.velocity ? [_options.velocity[0], _options.velocity[1], _options.velocity[2]] : [0, 0, 0];
		_this.acceleration = _options.acceleration ? [_options.acceleration[0], _options.acceleration[1], _options.acceleration[2]] : [0, 0, 0];

		_this.mass = _options.mass || 2.0;
		_this.drag = _options.drag || 0.7;
		_this.maxSpeed = _options.maxSpeed || 0.5;

		return _this;
	}

	_createClass(PhysicalElement, [{
		key: "applyForce",
		value: function applyForce(_force) {

			var newForce = this.divScal(_force, this.mass);
			this.acceleration = this.add(this.acceleration, newForce);
		}
	}, {
		key: "update",
		value: function update(_deltaTime) {

			_get(PhysicalElement.prototype.__proto__ || Object.getPrototypeOf(PhysicalElement.prototype), "update", this).call(this);

			_deltaTime = _deltaTime || 16.0;

			if (!this.enabled) return;

			// this.acceleration = this.mulScal ( this.acceleration, _deltaTime );
			this.velocity = this.add(this.velocity, this.acceleration);
			this.velocity = this.mulScal(this.velocity, _deltaTime * 0.063);
			this.velocity = this.mulScal(this.velocity, this.drag);

			if (this.len(this.velocity) > this.maxSpeed) {

				this.velocity = this.norm(this.velocity);
				this.velocity = this.mulScal(this.velocity, this.maxSpeed);
			}

			this.position = this.add(this.position, this.velocity);
			this.acceleration = this.mulScal(this.acceleration, 0);
		}
	}, {
		key: "add",
		value: function add(_v0, _v1) {

			return [_v0[0] + _v1[0], _v0[1] + _v1[1], _v0[2] + _v1[2]];
		}
	}, {
		key: "sub",
		value: function sub(_v0, _v1) {

			return [_v0[0] - _v1[0], _v0[1] - _v1[1], _v0[2] - _v1[2]];
		}
	}, {
		key: "mul",
		value: function mul(_v0, _v1) {

			return [_v0[0] * _v1[0], _v0[1] * _v1[1], _v0[2] * _v1[2]];
		}
	}, {
		key: "mulScal",
		value: function mulScal(_v0, _s) {

			return [_v0[0] * _s, _v0[1] * _s, _v0[2] * _s];
		}
	}, {
		key: "div",
		value: function div(_v0, _v1) {

			return [_v0[0] / _v1[0], _v0[1] / _v1[1], _v0[2] / _v1[2]];
		}
	}, {
		key: "divScal",
		value: function divScal(_v0, _s) {

			return [_v0[0] / _s, _v0[1] / _s, _v0[2] / _s];
		}
	}, {
		key: "len",
		value: function len(_v) {

			return Math.sqrt(Math.pow(_v[0], 2) + Math.pow(_v[1], 2) + Math.pow(_v[2], 2));
		}
	}, {
		key: "norm",
		value: function norm(_v) {

			var l = this.len(_v);
			return [_v[0] / l, _v[1] / l, _v[2] / l];
		}
	}]);

	return PhysicalElement;
}(_ElementCore2.ElementCore);

},{"./ElementCore":58}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Planet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _utils = require("../utils");

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Planet = exports.Planet = function (_PhysicalElement) {
		_inherits(Planet, _PhysicalElement);

		function Planet(_options) {
				_classCallCheck(this, Planet);

				var _this = _possibleConstructorReturn(this, (Planet.__proto__ || Object.getPrototypeOf(Planet)).call(this, _options));

				_this.sign = _options.sign || 1;
				_this.maxCharge = _options.maxCharge || 50;
				_this.minCharge = _options.minCharge || -_this.maxCharge;
				_this.charge = _options.charge || 0;
				_this.targetCharge = _this.charge;

				_this.charges = [];
				_this.maxMass = _this.mass;

				return _this;
		}

		_createClass(Planet, [{
				key: "update",
				value: function update() {

						_get(Planet.prototype.__proto__ || Object.getPrototypeOf(Planet.prototype), "update", this).call(this);

						this.targetCharge = (0, _utils.clamp)(this.targetCharge, this.minCharge, this.maxCharge);

						this.charge += (this.targetCharge - this.charge) * 0.1;

						var stepCharge = this.charges.length / this.maxCharge;

						var maxIndex = Math.floor(Math.abs(this.charge / this.maxCharge) * this.charges.length);

						for (var i = 0; i < this.charges.length; i++) {

								if (i <= maxIndex) this.charges[i].charge = this.sign;else this.charges[i].charge = 0;
						}
				}
		}]);

		return Planet;
}(_PhysicalElement2.PhysicalElement);

},{"../utils":76,"./PhysicalElement":64}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Player = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _PhysicalElement2 = require("./PhysicalElement");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Player = exports.Player = function (_PhysicalElement) {
		_inherits(Player, _PhysicalElement);

		function Player(_options) {
				_classCallCheck(this, Player);

				var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this, _options));

				_this.length = _this.scale[1];
				_this.sign = 1;
				_this.charge = 1;

				return _this;
		}

		_createClass(Player, [{
				key: "update",
				value: function update() {

						_get(Player.prototype.__proto__ || Object.getPrototypeOf(Player.prototype), "update", this).call(this);

						// console.log(obj);

						// this.scale[ 1 ] = this.length + vec3.length ( this.velocity ) * 1 ;
						this.color[3] += (1.0 - this.color[0]) * 0.1;
						this.rotation[2] = Math.atan2(this.velocity[1], this.velocity[0]) - Math.PI * 0.5;
				}
		}]);

		return Player;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],67:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.Text = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PhysicalElement2 = require('./PhysicalElement');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Text = exports.Text = function (_PhysicalElement) {
		_inherits(Text, _PhysicalElement);

		function Text(_options) {
				_classCallCheck(this, Text);

				var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, _options));

				_options = _options || {};

				_this.font = _options.font || 'Helvetica';
				_this.fontSize = (_options.fontSize || 20) + 'px';
				_this.size = _options.size || [512, 512];
				_this.canvas = document.createElement('canvas');
				_this.canvas.width = _this.size[0];
				_this.canvas.height = _this.size[1];
				_this.ctx = _this.canvas.getContext('2d');

				_this.lines = [];
				_this.content = '';
				_this.boundingBox = [0, 0];

				_this.geometry = new THREE.PlaneGeometry(1, 1);
				_this.material = new THREE.MeshBasicMaterial({ map: _this.ctx });
				_this.mesh = new THREE.Mesh(_this.geometry, _this.material);

				console.log(_this.fontSize, _this.font);

				_this.ctx.fillStyle = '#030303';
				_this.ctx.font = _this.fontSize + ' ' + _this.font;
				_this.ctx.fillText('sldkjllésddsadldkjhlsakjhflsakjdhflkjsadhlfkjsahlkfjhasldjhflasjdhklkjs', 0, 100);

				return _this;
		}

		_createClass(Text, [{
				key: 'write',
				value: function write(_string) {

						this.content += _string;
				}
		}, {
				key: 'build',
				value: function build() {}
		}]);

		return Text;
}(_PhysicalElement2.PhysicalElement);

},{"./PhysicalElement":64}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.library = undefined;

var _PhysicalElement = require("./PhysicalElement");

var _BlackMatter = require("./BlackMatter");

var _ElectricParticle = require("./ElectricParticle");

var _ElectricPlanetParticle = require("./ElectricPlanetParticle");

var _Particle = require("./Particle");

var _Planet = require("./Planet");

var _Obstacle = require("./Obstacle");

var _Player = require("./Player");

var library = {

	PhysicalElement: _PhysicalElement.PhysicalElement,
	BlackMatter: _BlackMatter.BlackMatter,
	ElectricParticle: _ElectricParticle.ElectricParticle,
	ElectricPlanetParticle: _ElectricPlanetParticle.ElectricPlanetParticle,
	Particle: _Particle.Particle,
	Obstacle: _Obstacle.Obstacle,
	Planet: _Planet.Planet,
	Player: _Player.Player

};

exports.library = library;

},{"./BlackMatter":54,"./ElectricParticle":56,"./ElectricPlanetParticle":57,"./Obstacle":62,"./Particle":63,"./PhysicalElement":64,"./Planet":65,"./Player":66}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
			value: true
});
var shaderHelper = {

			test: {

						vertex: "\n\t\t\tvoid main () {\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = vec4 ( 1.0, 0.0, 1.0, 1.0 );\n\n\t\t\t}\n\n\t\t"

			},

			solidQuad: {

						vertex: "\n\t\t\tvoid main () {\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform vec4 solidColor;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = solidColor;\n\n\t\t\t}\n\n\t\t"

			},

			simpleTexture: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = texture2D ( texture, f_Uv );\n\n\t\t\t}\n\n\t\t"

			},

			coloredTexture: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\t\t\tuniform vec4 solidColor;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = texture2D ( texture, f_Uv ) * solidColor;\n\n\t\t\t}\n\n\t\t"

			},

			player: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.3, 0.3, 0.3, 1.0 );\n\t\t\t\tgl_FragColor.rgb += smoothstep ( 0.0, 1.0, sdfDist ) * 0.7 + ( 1.0 - f_Color.a );\n\n\t\t\t}\n\n\t\t"

			},

			playerInfo: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat t = 0.80;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.6, 0.50, sdfDist );\n\n\n\t\t\t}\n\n\t\t"

			},

			playerScan: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat t = 0.80;\n\n\t\t\t\tgl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 );\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.6, 0.50, sdfDist );\n\n\n\t\t\t}\n\n\t\t"

			},

			playerParticles: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\t\t\t\tvec4 texture =  texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = texture.r * texture.g * texture.b;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.92, 0.92, 0.92, 1.0 );\n\t\t\t\tgl_FragColor.rgb += smoothstep ( 0.4, 1.0, sdfDist ) * 0.08;\n\n\t\t\t}\n\n\t\t"

			},

			// Gravity

			blackMatter: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\t\t\t\tvec4 texture =  texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = texture.r * texture.g * texture.b;\n\n\t\t\t\tfloat a = ( 1.0 - f_Color.a ) * 0.1;\n\t\t\t\tgl_FragColor = vec4 ( 0.91 + a, 0.91 + a, 0.91 + a, 1.0 );\n\t\t\t\tgl_FragColor.a = 1.0;\n\t\t\t\tgl_FragColor.rgb += smoothstep ( 0.95, 0.99, sdfDist );\n\n\n\n\t\t\t\t// gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 2.5, 0.0, cDist );\n\n\t\t\t\t// gl_FragColor = vec4( f_Color.rgb * 1.5, 1.0 );\n\t\t\t\t// gl_FragColor.rgb *= 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 2.0, 0.0, cDist ) );\n\t\t\t\t// gl_FragColor.rgb += 1.0 - f_Color.a;\n\n\t\t\t}\n\n\t\t"

			},

			blackMatterScan: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\t\t\t\tf_Scale = transform.z;\n\n\t\t\t\t// Transform the position\n\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.28 / ( f_Scale + 1.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 * f_Color.a );\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.rgba += smoothstep ( w, w - 0.2, abs ( t - sdfDist ) ) * f_Color.a;\n\n\t\t\t}\n\n\t\t"

			},

			blackMatterInfo: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = transform.z;\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.22 / ( f_Scale + 1.0 );\n\t\t\t\tfloat t = 0.98 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) ) * f_Color.a;\n\n\t\t\t}\n\n\t\t"

			},

			planet: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tgl_FragColor = f_Color;\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 3.5, 0.0, cDist );\n\n\t\t\t}\n\n\t\t"

			},

			scanPlanet: {

						vertex: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Scale = position.z;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z * f_Scale;\n\n\t\t\t\tfloat w = 0.070;\n\t\t\t\tfloat t = f_Scale - w - 0.05;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( f_Scale - 0.05, f_Scale - 0.08, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.rgba += smoothstep ( w, w - 0.05, abs ( t - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			infoPlanet: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tf_Scale = position.z;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z * f_Scale;\n\n\t\t\t\tfloat w = 0.070;\n\t\t\t\tfloat t = f_Scale - w - 0.05;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );\n\t\t\t\tgl_FragColor.a *= smoothstep ( w, w - 0.05, abs ( t - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			smoke: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tgl_PointSize = position.z;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - gl_PointCoord.xy ) * 2.0;\n\t\t\t\tgl_FragColor = f_Color;\n\t\t\t\tgl_FragColor.a *= smoothstep ( 1.0, 0.0, cDist );\n\t\t\t\t\n\t\t\t}\n\n\t\t"

			},

			screen: {

						vertex: "\n\t\t\tvoid main () {\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tuniform vec2 screenDimentions;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 screenColors = texture2D ( texture, gl_FragCoord.xy / screenDimentions );\n\t\t\t\tgl_FragColor = screenColors;\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"

			},

			screenButton: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\t\t\tuniform vec2 screenDimentions;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tvec4 screenColors = texture2D ( texture, gl_FragCoord.xy / screenDimentions );\n\t\t\t\tgl_FragColor = screenColors;\n\t\t\t\tgl_FragColor.a *= smoothstep ( 1.0, 0.98, cDist );\n\n\t\t\t}\n\n\t\t"

			},

			testDerivative: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tgl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 );\n\n\n\t\t\t\tfloat val = abs ( fract ( ( 1.0 - cDist ) * 20.0 ) - 0.5 ) * 2.0;\n\n\n\t\t\t\tfloat f = fwidth ( val );\n\n\t\t\t\tgl_FragColor.rgb *= smoothstep ( 0.99 * f * 1.5, 0.85 * f * 1.5, val );\n\n\n\t\t\t\t// gl_FragColor = vec4 ( f_Uv.x, f_Uv.y, 0.0, 1.0 );\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"

			},

			// Electric

			electricCharge: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tfloat s = abs ( transform.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( s ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\t\t\t\tvec4 texture =  texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = texture.r * texture.g * texture.b;\n\n\t\t\t\tfloat alphaVal = 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 4.0, 0.0, cDist ) ) * abs ( f_Color.a );\n\n\t\t\t\tgl_FragColor = abs ( f_Color );\n\t\t\t\tgl_FragColor.a = 1.0;\n\n\t\t\t\tgl_FragColor.r += alphaVal * ( 1.0 - gl_FragColor.r );\n\t\t\t\tgl_FragColor.g += alphaVal * ( 1.0 - gl_FragColor.g );\n\t\t\t\tgl_FragColor.b += alphaVal * ( 1.0 - gl_FragColor.b );\n\n\t\t\t\t// gl_FragColor.rgb += alphaVal;\n\n\t\t\t}\n\n\t\t"

			},

			electricChargeScan: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = transform.z;\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.18 / ( f_Scale + 1.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.rgba += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			electricChargeInfo: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = abs ( transform.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat xDist = abs ( 0.5 - f_Uv.x ) * 2.0 * f_Scale;\n\t\t\t\tfloat yDist = abs ( 0.5 - f_Uv.y ) * 2.0 * f_Scale;\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0 * f_Scale;\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.92 / ( (f_Scale + 1.0) * 5.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );\n\n\t\t\t\t// Draw sign.\n\n\t\t\t\tif ( abs ( f_Color.r - 0.8 ) > 0.1 ) {\n\n\t\t\t\t\t// Draw cross\n\n\t\t\t\t\tfloat r = 0.10;\n\t\t\t\t\tfloat w1 = 0.013;\n\n\t\t\t\t\tif ( f_Color.r > f_Color.b ) {\n\n\t\t\t\t\t\tgl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist ) + smoothstep ( w1, w1 - 0.005, xDist );\n\n\t\t\t\t\t} else if ( f_Color.r < f_Color.b ) {\n\n\t\t\t\t\t\tgl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist );\n\n\t\t\t\t\t}\n\n\t\t\t\t\tgl_FragColor.a *= smoothstep ( r, r - 0.03, cDist );\n\t\t\t\t\t\n\t\t\t\t} else {\n\n\t\t\t\t\tgl_FragColor.a = 0.0;\n\n\t\t\t\t}\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.a += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			fixedElectricCharge: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tfloat s = abs ( transform.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( s ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\t\t\t\tvec4 texture =  texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = texture.r * texture.g * texture.b;\n\n\t\t\t\tfloat alphaVal = 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 4.0, 0.0, cDist ) ) * abs ( f_Color.a );\n\n\t\t\t\tgl_FragColor = abs ( f_Color );\n\t\t\t\tgl_FragColor.a = 1.0;\n\n\n\t\t\t\tfloat w = 0.4;\n\t\t\t\tfloat t = 0.99 - w;\n\n\t\t\t\tfloat outLineMultiplier = smoothstep ( w, w - 0.03, abs ( t - sdfDist ) );\n\n\t\t\t\tgl_FragColor.r = outLineMultiplier * f_Color.r + ( 1.0 - outLineMultiplier ) * 1.0;\n\t\t\t\tgl_FragColor.g = outLineMultiplier * f_Color.g + ( 1.0 - outLineMultiplier ) * 1.0;\n\t\t\t\tgl_FragColor.b = outLineMultiplier * f_Color.b + ( 1.0 - outLineMultiplier ) * 1.0;\n\n\t\t\t\tgl_FragColor.r += alphaVal * ( 1.0 - gl_FragColor.r );\n\t\t\t\tgl_FragColor.g += alphaVal * ( 1.0 - gl_FragColor.g );\n\t\t\t\tgl_FragColor.b += alphaVal * ( 1.0 - gl_FragColor.b );\n\n\t\t\t}\n\n\t\t"

			},

			fixedElectricChargeScan: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = transform.z;\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.18 / ( f_Scale + 1.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\t\t\t\tfloat t2 = 0.5 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.rgba += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) ) + smoothstep ( w, w - 0.13, abs ( t2 - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			fixedElectricChargeInfo: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = abs ( transform.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat xDist = abs ( 0.5 - f_Uv.x ) * 2.0 * f_Scale;\n\t\t\t\tfloat yDist = abs ( 0.5 - f_Uv.y ) * 2.0 * f_Scale;\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0 * f_Scale;\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.92 / ( (f_Scale + 1.0) * 5.0 );\n\t\t\t\tfloat w2 = 0.57 / ( (f_Scale + 1.0) * 5.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\t\t\t\tfloat t2 = 0.5 - w2;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );\n\n\t\t\t\t// Draw sign.\n\n\t\t\t\tif ( abs ( f_Color.r - 0.8 ) > 0.1 ) {\n\n\t\t\t\t\t// Draw cross\n\n\t\t\t\t\tfloat r = 0.10;\n\t\t\t\t\tfloat w1 = 0.013;\n\n\t\t\t\t\tif ( f_Color.r > f_Color.b ) {\n\n\t\t\t\t\t\tgl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist ) + smoothstep ( w1, w1 - 0.005, xDist );\n\n\t\t\t\t\t} else if ( f_Color.r < f_Color.b ) {\n\n\t\t\t\t\t\tgl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist );\n\n\t\t\t\t\t}\n\n\t\t\t\t\tgl_FragColor.a *= smoothstep ( r, r - 0.03, cDist );\n\t\t\t\t\t\n\t\t\t\t} else {\n\n\t\t\t\t\tgl_FragColor.a = 0.0;\n\n\t\t\t\t}\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.a +=  smoothstep ( w, w - 0.1, abs ( t - sdfDist ) ) + smoothstep ( w2, w2 - 0.05, abs ( t2 - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			equipotentialLines: {

						vertex: "\n\t\t\tconst float MAX_Z = 2.0;\n\t\t\tconst int MAX_CHARGES = 20;\n\t\t\tuniform float numCharges;\n\t\t\tuniform vec3 charges[ MAX_CHARGES ];\n\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_maxZ;\n\t\t\tvarying float f_Z;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 vPos = modelViewMatrix * vec4 ( position.xyz, 1.0 );\n\t\t\t\tvec3 rV = vec3 ( 0.0 );\n\n\t\t\t\tfor ( int i = 0; i < MAX_CHARGES; i ++ ) {\n\n\t\t\t\t\tif ( i >= int ( numCharges ) ) break;\n\n\t\t\t\t\tvec2 dir = charges[ i ].xy - vPos.xy;\n\t\t\t\t\tfloat maxDist = 5.5;\n\t\t\t\t\tfloat dist = length ( dir );\n\n\t\t\t\t\tvec3 exDir = vec3 ( charges[ i ].xy, 0.0 ) - cameraPosition;\n\t\t\t\t\texDir = normalize ( exDir );\n\t\t\t\t\texDir *= normalMatrix;\n\t\t\t\t\texDir *= MAX_Z * ( 1.0 - clamp ( dist / maxDist, 0.0, 1.0 ) ) * ( 1.0 / pow ( dist + 1.0, 3.0 ) ) * charges[ i ].z;\n\n\t\t\t\t\trV += exDir;\n\n\t\t\t\t}\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tf_maxZ = MAX_Z;\n\n\t\t\t\tvec4 outPosition = projectionMatrix * modelViewMatrix * vec4 ( position.xyz + rV, 1.0 );\n\t\t\t\tf_Z = rV.z;\n\t\t\t\tgl_Position = outPosition;\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_maxZ;\n\t\t\tvarying float f_Z;\n\n\t\t\tvoid main()\n\t\t\t{\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0;\n\t\t\t\tvec3 P = vec3 ( f_Z );\n\n\t\t\t\tfloat gsize = 50.0;\n\t\t\t\tfloat gwidth = 1.5;\n\n\t\t\t\tvec3 f  = abs( fract ( P * gsize ) -0.5 );\n\t\t\t\tvec3 df = fwidth ( P * gsize );\n\t\t\t\tvec3 g = smoothstep ( -gwidth * df, gwidth * df, f );\n\t\t\t\tfloat c = g.x * g.y * g.z; \n\t\t\t\tgl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 - c );// * gl_Color;\n\t\t\t\tgl_FragColor.a *= 1.0 - cDist * 0.6;\n\t\t\t\tgl_FragColor.a *= pow ( clamp ( 1.0 / ( abs ( f_Z ) * 5.0 ), 0.0, 1.0 ), 2.0 );\n\t\t\t\t// gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t"

			},

			obstacle: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying vec2 f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = vec2 ( transform.z, position.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z, position.z, 1.0 ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying vec2 f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv );\n\n\t\t\t\tgl_FragColor = vec4 ( 0.85, 0.85, 0.85, 1.0 - cDist * 0.2 );\n\n\t\t\t}\n\n\t\t"

			},

			obstacleScan: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying vec2 f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = vec2 ( transform.z, position.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z, position.z, 1.0 ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying vec2 f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\t// float w = 0.18 / ( f_Scale + 1.0 );\n\t\t\t\t// float t = 0.99 - w;\n\n\t\t\t\tfloat x = abs ( f_Uv.x - 0.5 ) * 2.0 * f_Scale.x;\n\t\t\t\tfloat y = abs ( f_Uv.y - 0.5 ) * 2.0 * f_Scale.y;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.7 );\n\n\t\t\t\tgl_FragColor.rgba += smoothstep ( f_Scale.x - 0.015, f_Scale.x - 0.000, x ) + smoothstep ( f_Scale.y - 0.015, f_Scale.y - 0.000, y );\n\n\t\t\t}\n\n\t\t"

			},

			obstacleInfo: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying vec2 f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = vec2 ( transform.z, position.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z, position.z, 1.0 ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying vec2 f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\t// float w = 0.18 / ( f_Scale + 1.0 );\n\t\t\t\t// float t = 0.99 - w;\n\n\t\t\t\tfloat x = abs ( f_Uv.x - 0.5 ) * 2.0 * f_Scale.x;\n\t\t\t\tfloat y = abs ( f_Uv.y - 0.5 ) * 2.0 * f_Scale.y;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );\n\n\t\t\t\tgl_FragColor.a += smoothstep ( f_Scale.x - 0.020, f_Scale.x - 0.01, x ) + smoothstep ( f_Scale.y - 0.020, f_Scale.y - 0.01, y );\n\n\t\t\t}\n\n\t\t"

			},

			// Gravity Electric

			electricPlanet: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Scale = position.z;\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\t\t\t\tfloat sdfDist2 = sdf.x * sdf.y * sdf.z * f_Scale;\n\n\t\t\t\tfloat w = 0.15;\n\t\t\t\tfloat t = f_Scale - w;\n\t\t\t\tfloat outLineMultiplier = smoothstep ( w, w - 0.03, abs ( t - sdfDist2 ) );\n\n\t\t\t\tgl_FragColor = f_Color;\n\t\t\t\tgl_FragColor.r = outLineMultiplier * 0.7 + ( 1.0 - outLineMultiplier ) * f_Color.r;\n\t\t\t\tgl_FragColor.g = outLineMultiplier * 0.7 + ( 1.0 - outLineMultiplier ) * f_Color.g;\n\t\t\t\tgl_FragColor.b = outLineMultiplier * 0.7 + ( 1.0 - outLineMultiplier ) * f_Color.b;\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 2.5, 0.0, cDist );\n\t\t\t\tgl_FragColor.a *= smoothstep ( -0.5, 2.0, cDist );\n\n\t\t\t}\n\n\t\t"

			},

			electricParticlePlanetScan: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Scale = abs ( transform.z );\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( abs ( transform.z ) ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 0.3 / ( f_Scale + 1.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.rgba += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			electricParticlePlanetInfo: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tattribute vec4 transform;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tvarying float f_Sign;\n\t\t\tvarying float f_Zero;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Scale = abs ( transform.z );\n\t\t\t\tf_Sign = sign ( transform.z );\n\n\t\t\t\tif ( sign ( rgbaColor.a ) >= 0.0 ) f_Zero = 1.0;\n\t\t\t\telse f_Zero = 0.0;\n\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( abs ( transform.z ) ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Scale;\n\t\t\tvarying float f_Sign;\n\t\t\tvarying float f_Zero;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat xDist = abs ( 0.5 - f_Uv.x ) * 2.0 * f_Scale;\n\t\t\t\tfloat yDist = abs ( 0.5 - f_Uv.y ) * 2.0 * f_Scale;\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0 * f_Scale;\n\t\t\t\tvec4 sdf = texture2D ( texture, f_Uv );\n\t\t\t\tfloat sdfDist = sdf.x * sdf.y * sdf.z;\n\n\t\t\t\tfloat w = 1.6 / ( (f_Scale + 1.0) * 5.0 );\n\t\t\t\tfloat t = 0.99 - w;\n\n\t\t\t\t// Background\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );\n\n\t\t\t\t// Draw sign.\n\n\t\t\t\tif ( abs ( f_Color.r - 0.8 ) > 0.1 ) {\n\n\t\t\t\t\t// Draw cross\n\n\t\t\t\t\tfloat r = 0.08;\n\t\t\t\t\tfloat w1 = 0.013;\n\n\t\t\t\t\tif ( f_Color.r > f_Color.b ) {\n\n\t\t\t\t\t\tgl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist ) + smoothstep ( w1, w1 - 0.005, xDist );\n\n\t\t\t\t\t} else if ( f_Color.r < f_Color.b ) {\n\n\t\t\t\t\t\tgl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist );\n\n\t\t\t\t\t}\n\n\t\t\t\t\tgl_FragColor.a *= smoothstep ( r, r - 0.03, cDist );\n\t\t\t\t\t\n\t\t\t\t} else {\n\n\t\t\t\t\tgl_FragColor.a = 0.0;\n\n\t\t\t\t}\n\n\t\t\t\t// Outside\n\n\t\t\t\tgl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );\n\n\t\t\t\t// Outline\n\n\t\t\t\tgl_FragColor.a += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );\n\n\t\t\t}\n\n\t\t"

			},

			// General

			grid: {

						vertex: "\n\t\t\tconst float MAX_Z = 40.0;\n\t\t\tconst int MAX_MASSES = 108;\n\t\t\tuniform float numMasses;\n\t\t\tuniform vec3 masses[ MAX_MASSES ];\n\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_maxZ;\n\t\t\tvarying float f_Z;\n\n\t\t\tvoid main () {\n\n\t\t\t\tvec4 vPos = modelViewMatrix * vec4 ( position.xyz, 1.0 );\n\t\t\t\tvec3 rV = vec3 ( 0.0 );\n\n\t\t\t\tfor ( int i = 0; i < MAX_MASSES; i ++ ) {\n\n\t\t\t\t\tif ( i >= int ( numMasses ) ) break;\n\n\t\t\t\t\tvec2 dir = masses[ i ].xy - vPos.xy;\n\t\t\t\t\tfloat maxDist = 5.5;\n\t\t\t\t\tfloat dist = length ( dir );\n\n\t\t\t\t\tvec3 exDir = vec3 ( masses[ i ].xy, 0.0 ) - cameraPosition;\n\t\t\t\t\texDir = normalize ( exDir );\n\t\t\t\t\texDir *= normalMatrix;\n\t\t\t\t\texDir *= MAX_Z * ( 1.0 - clamp ( dist / maxDist, 0.0, 1.0 ) ) * ( 1.0 / pow ( dist + 1.0, 3.0 ) ) * pow ( masses[ i ].z, 2.0 );\n\n\t\t\t\t\trV += exDir;\n\n\t\t\t\t}\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tf_maxZ = MAX_Z;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xyz + rV, 1.0 );\n\t\t\t\tf_Z = gl_Position.z;\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform float gridSubdivisions;\n\t\t\tuniform float mainAlpha;\n\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_maxZ;\n\t\t\tvarying float f_Z;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\t// Pick a coordinate to visualize in a grid\n\t\t\t\tvec2 coord = f_Uv * gridSubdivisions;\n\n\t\t\t\t// Compute anti-aliased world-space grid lines\n\t\t\t\tvec2 grid = abs ( fract ( coord - 0.5 ) - 0.5 ) / fwidth ( coord );\n\t\t\t\tfloat line = min ( grid.x, grid.y );\n\n\t\t\t\t// Just visualize the grid lines directly\n\t\t\t\tgl_FragColor = vec4  ( 1.0, 1.0, 1.0, ( 1.5 - min ( line, 10.0 ) ) * 0.6 );\n\t\t\t\tgl_FragColor.a *= clamp ( ( 1.0 - cDist * 0.70 ) * pow ( clamp ( 1.0 - f_Z / ( f_maxZ + 30.0 ), 0.0, 1.0 ), 2.0 ), 0.0, 1.0 ) * mainAlpha;\n\t\t\t\t\n\t\t\t}\n\n\t\t"
			},

			indicator: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform float alpha;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat dX = abs ( 0.5 - f_Uv.x ) * 2.0;\n\t\t\t\tfloat w = 0.05;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );\n\t\t\t\tgl_FragColor.a *= smoothstep ( w, w - 0.02, dX ) * alpha;\n\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"
			},

			departure: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform float alpha;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tfloat w = 0.15;\n\t\t\t\tfloat t = 1.0 - w;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.9, 0.9, 0.9, smoothstep ( w, w - 0.01, abs ( t - cDist ) ) );\n\n\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"
			},

			arrival: {

						vertex: "\n\t\t\tattribute vec4 transform;\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tmat4 scaleMatrix ( vec3 scale ) {\n\n\t\t\t\treturn mat4(scale.x, 0.0, 0.0, 0.0,\n\t\t\t\t            0.0, scale.y, 0.0, 0.0,\n\t\t\t\t            0.0, 0.0, scale.z, 0.0,\n\t\t\t\t            0.0, 0.0, 0.0, 1.0);\n\n\t\t\t}\n\n\t\t\tmat4 rotationMatrix(vec3 axis, float angle) {\n\n\t\t\t\taxis = normalize(axis);\n\t\t\t\tfloat s = sin(angle);\n\t\t\t\tfloat c = cos(angle);\n\t\t\t\tfloat oc = 1.0 - c;\n\t\t\t\t    \n\t\t\t\treturn mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n\t\t\t\t            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n\t\t\t\t            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n\t\t\t\t            0.0,                                0.0,                                0.0,                                1.0);\n\t\t\t\t\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tvec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t\t// Transform the position\n\n\t\t\t\toutPosition *= scaleMatrix ( vec3 ( transform.z ) );\n\t\t\t\toutPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );\n\t\t\t\t\n\n\t\t\t\toutPosition.x += transform.x;\n\t\t\t\toutPosition.y += transform.y;\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform float alpha;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tfloat w = 0.15;\n\t\t\t\tfloat t = 1.0 - w;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.9, 0.9, 0.9, smoothstep ( w, w - 0.01, abs ( t - cDist ) ) );\n\t\t\t\tgl_FragColor.a += smoothstep ( 0.3, 0.29, cDist );\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"
			},

			sdfFont: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xyz, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\t// Just visualize the grid lines directly\n\t\t\t\tgl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\t\t\t\t// gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\t\t\t\tgl_FragColor.a *= texture2D ( texture, f_Uv ).a;\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"
			},

			line: {

						vertex: "\n\t\t\tuniform float thickness;\n\t        attribute float lineMiter;\n\t        attribute vec2 lineNormal;\n\t        attribute float lineOpacity;\n\t        varying float f_Edge;\n\t        varying float f_Thickness;\n\t        varying float f_Opacity;\n\n\t        void main() {\n\n\t        \tf_Opacity = lineOpacity;\n\t        \tf_Thickness = thickness;\n\t        \tf_Edge = sign ( lineMiter );\n\t        \tvec3 pointPos = position.xyz + vec3 ( lineNormal * thickness / 2.0 * lineMiter, 0.0 );\n\t        \tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( pointPos, 1.0 );\n\n\t        }\n\n\t\t",

						fragment: "\n\t\t\tuniform vec3 diffuse;\n\t        varying float f_Edge;\n\t        varying float f_Thickness;\n\t        varying float f_Opacity;\n\n\t        void main() {\n\n\t        \tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );\n\t        \tgl_FragColor.a += ( 1.0 - smoothstep ( 0.0, 0.3, abs ( f_Edge ) ) ) * f_Opacity;\n\t        \tgl_FragColor.a *= smoothstep ( 1.0, 0.8, abs ( f_Edge ) );\n\t        \n\t        }\n\n\t\t"

			},

			circle: {

						vertex: "\n\t      \tvarying vec2 f_Uv;\n\n\t        void main() {\n\t    \n\t    \t\tf_Uv = uv;\n\t        \tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t        }\n\n\t\t",

						fragment: "\n\t\t\tuniform vec4 diffuse;\n\t\t\tvarying vec2 f_Uv;\n\n\t        void main() {\n\n\t        \tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0;\n\n\t        \tgl_FragColor = diffuse;\n\t        \tgl_FragColor.a *= smoothstep ( 1.0, 0.95, cDist );\n\t        \n\t        }\n\n\t\t"

			},

			// Intro

			introParticles: {

						vertex: "\n\t        void main() {\n\t    \n\t    \t\tgl_PointSize = position.z;\n\t        \tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t        }\n\n\t\t",

						fragment: "\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - gl_PointCoord.xy ) * 2.0;\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, smoothstep ( 1.0, 0.85, cDist ) * 0.5 );\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"

			},

			introEndCircles: {

						vertex: "\n\t\t\tuniform float scale;\n\t\t\tvarying vec2 f_Uv;\n\n\t        void main() {\n\t    \n\t    \t\tf_Uv = uv;\n\t        \tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy * scale, 0.0, 1.0 );\n\n\t        }\n\n\t\t",

						fragment: "\n\t\t\tuniform float scale;\n\t\t\tuniform float alpha;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0 * scale;\n\n\t\t\t\tfloat w = 0.1;\n\t\t\t\tfloat t = scale - w;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, smoothstep ( w, w - 0.02, abs ( t - cDist ) ) ) * alpha;\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"

			},

			introArrival: {

						vertex: "\n\t      \tvarying vec2 f_Uv;\n\n\t        void main() {\n\t    \n\t    \t\tf_Uv = uv;\n\t        \tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t        }\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;\n\n\t\t\t\tfloat w = 0.15;\n\t\t\t\tfloat t = 1.0 - w;\n\n\t\t\t\tgl_FragColor = vec4 ( 0.8, 0.8, 0.8, smoothstep ( w, w - 0.01, abs ( t - cDist ) ) );\n\t\t\t\tgl_FragColor.a += smoothstep ( 0.3, 0.29, cDist );\n\t\t\t\t\t\n\t\t\t}\n\n\t\t"

			},

			introGenericCircle: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\t\t\tuniform vec4 solidColor;\n\n\t\t\tfloat aastep ( float value ) {\n\n\t\t\t    #ifdef GL_OES_standard_derivatives\n\n\t\t\t      float afwidth = length ( vec2 ( dFdx ( value ), dFdy ( value ) ) ) * 0.70710678118654757;\n\n\t\t\t    #else\n\n\t\t\t      float afwidth = ( 1.0 / 32.0 ) * ( 1.4142135623730951 / ( 2.0 * gl_FragCoord.w ) );\n\n\t\t\t    #endif\n\n\t\t\t    return smoothstep ( 0.5 - afwidth, 0.5 + afwidth, value );\n\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0;\n\t\t\t    vec4 texColor = texture2D ( texture, f_Uv );\n\t\t\t    float alpha = aastep ( texColor.a );\n\t\t\t    gl_FragColor = solidColor;\n\t\t\t    gl_FragColor.a *= alpha * smoothstep ( 3.0, 0.0, cDist );\n\n\t\t\t    // gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\t\t\t    if ( gl_FragColor.a < 0.0001 ) discard;\n\n\t\t\t    // gl_FragColor = texColor;\n\n\t\t\t}\n\n\t\t"

			},

			introGenericCirclePoint: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Size;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tf_Size = position.z;\n\t\t\t\tgl_PointSize = position.z;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tvarying float f_Size;\n\t\t\tuniform sampler2D texture;\n\t\t\tuniform vec4 solidColor;\n\n\t\t\tfloat aastep ( float value ) {\n\n\t\t\t    #ifdef GL_OES_standard_derivatives\n\n\t\t\t      float afwidth = length ( vec2 ( dFdx ( value ), dFdy ( value ) ) ) * 0.70710678118654757;\n\n\t\t\t    #else\n\n\t\t\t      float afwidth = ( 1.0 / 32.0 ) * ( 1.4142135623730951 / ( 2.0 * gl_FragCoord.w ) );\n\n\t\t\t    #endif\n\n\t\t\t    return smoothstep ( 0.5 - afwidth, 0.5 + afwidth, value );\n\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - gl_PointCoord.xy ) * 2.0;\n\t\t\t    vec4 texColor = texture2D ( texture, gl_PointCoord.xy );\n\t\t\t    float alpha = aastep ( texColor.a );\n\t\t\t\tgl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );\n\t\t\t    gl_FragColor.rgb += solidColor.rgb + ( vec3 ( 1.0 ) - solidColor.rgb ) * ( 1.0 - alpha ) + smoothstep ( 0.0, 5.0, cDist ) + ( f_Size / 100.0 - 0.5 ) * 0.05;\n\t\t\t    if ( alpha < 0.0001 ) discard;\n\n\t\t\t}\n\n\t\t"

			},

			introElectricPlanet: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\t\t\tuniform vec4 solidColor;\n\n\t\t\tfloat aastep ( float value ) {\n\n\t\t\t    #ifdef GL_OES_standard_derivatives\n\n\t\t\t      float afwidth = length ( vec2 ( dFdx ( value ), dFdy ( value ) ) ) * 0.70710678118654757;\n\n\t\t\t    #else\n\n\t\t\t      float afwidth = ( 1.0 / 32.0 ) * ( 1.4142135623730951 / ( 2.0 * gl_FragCoord.w ) );\n\n\t\t\t    #endif\n\n\t\t\t    return smoothstep ( 0.5 - afwidth, 0.5 + afwidth, value );\n\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0;\n\t\t\t    vec4 texColor = texture2D ( texture, f_Uv );\n\t\t\t    float alpha = aastep ( texColor.a - 0.2 );\n\n\t\t\t    float w = 0.2;\n\t\t\t    float t = 1.0 - w;\n\n\t\t\t    gl_FragColor = solidColor;\n\t\t\t    gl_FragColor.rgb -= smoothstep ( 1.0, 0.9, texColor.a ) * 0.4;\n\t\t\t    gl_FragColor.a *= alpha * smoothstep ( 3.0, 0.0, cDist ) * smoothstep ( 0.0, 2.0, cDist );\n\n\n\t\t\t    // gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\t\t\t    if ( gl_FragColor.a < 0.0001 ) discard;\n\n\t\t\t    // gl_FragColor = texColor;\n\n\t\t\t}\n\n\t\t"

			},

			introGenericCircleElectricPlanet: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tgl_PointSize = position.z;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec4 f_Color;\n\t\t\tuniform float globalAlpha;\n\n\t\t\tfloat aastep ( float value ) {\n\n\t\t\t    #ifdef GL_OES_standard_derivatives\n\n\t\t\t      float afwidth = length ( vec2 ( dFdx ( value ), dFdy ( value ) ) ) * 0.70710678118654757;\n\n\t\t\t    #else\n\n\t\t\t      float afwidth = ( 1.0 / 32.0 ) * ( 1.4142135623730951 / ( 2.0 * gl_FragCoord.w ) );\n\n\t\t\t    #endif\n\n\t\t\t    return smoothstep ( 0.5 - afwidth, 0.5 + afwidth, value );\n\n\t\t\t}\n\n\t\t\tvoid main () {\n\n\t\t\t\tfloat cDist = length ( vec2 ( 0.5 ) - gl_PointCoord.xy ) * 2.0;\n\t\t\t    vec4 texColor = texture2D ( texture, gl_PointCoord.xy );\n\t\t\t    float alpha = aastep ( texColor.a );\n\t\t\t    gl_FragColor = f_Color;\n\t\t\t    gl_FragColor.a *= alpha * smoothstep ( 3.0, 0.0, cDist ) * globalAlpha;\n\n\t\t\t    // gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\t\t\t    // if ( gl_FragColor.a < 0.0001 ) discard;\n\n\t\t\t    // gl_FragColor = texColor;\n\n\t\t\t}\n\n\t\t"

			}

};

exports.shaderHelper = shaderHelper;

},{}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GameManager = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils");

var _GravityLevel = require("./GameElements/GravityLevel");

var _ElectricLevel = require("./GameElements/ElectricLevel");

var _GravityElectricLevel = require("./GameElements/GravityElectricLevel");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameManager = exports.GameManager = function () {
	function GameManager(_options) {
		_classCallCheck(this, GameManager);

		this.renderer = _options.renderer;

		// General

		this.currentLevel = null;
		this.soundManager = _options.soundManager;
	}

	_createClass(GameManager, [{
		key: "onResize",
		value: function onResize() {

			if (this.currentLevel) {

				this.currentLevel.onResize();
			}
		}
	}, {
		key: "onMove",
		value: function onMove(_position) {

			if (this.currentLevel) {

				this.currentLevel.onMove(_position);
			}
		}
	}, {
		key: "onDrag",
		value: function onDrag(_position) {

			if (this.currentLevel) {

				this.currentLevel.onDrag(_position);
			}
		}
	}, {
		key: "onClick",
		value: function onClick(_position) {

			if (this.currentLevel) {

				this.currentLevel.onClick(_position);
			}
		}
	}, {
		key: "onDown",
		value: function onDown(_position) {

			if (this.currentLevel) {

				this.currentLevel.onDown(_position);
			}
		}
	}, {
		key: "onUp",
		value: function onUp(_position) {

			if (this.currentLevel) {

				this.currentLevel.onUp(_position);
			}
		}
	}, {
		key: "update",
		value: function update(_deltaTime) {

			if (this.currentLevel) {

				this.currentLevel.update(_deltaTime);
			}
		}
	}, {
		key: "render",
		value: function render(_deltaTime) {

			if (this.currentLevel) {

				this.currentLevel.render(_deltaTime);
			}
		}
	}, {
		key: "startLevel",
		value: function startLevel(_levelFile, _onStart) {

			this.end();

			// Create a new level according to the level file passed as an argument.

			switch (_levelFile.chapter) {

				case 'gravity':

					this.currentLevel = new _GravityLevel.GravityLevel({

						renderer: this.renderer,
						levelFile: (0, _utils.clone)(_levelFile),
						soundManager: this.soundManager

					});

					break;

				case 'electric':

					this.currentLevel = new _ElectricLevel.ElectricLevel({

						renderer: this.renderer,
						levelFile: (0, _utils.clone)(_levelFile),
						soundManager: this.soundManager

					});

					break;

				case 'gravity-electric':

					this.currentLevel = new _GravityElectricLevel.GravityElectricLevel({

						renderer: this.renderer,
						levelFile: (0, _utils.clone)(_levelFile),
						soundManager: this.soundManager

					});

					break;

			}

			if (this.currentLevel) {

				this.currentLevel.onLoad(function () {

					if (_onStart) _onStart();
				});

				this.currentLevel.onWin(function (levelFile) {

					if (this.onWinCallBack) this.onWinCallBack(_levelFile);
				}.bind(this));
			}
		}
	}, {
		key: "end",
		value: function end() {

			if (this.currentLevel) {

				this.currentLevel.clearLevel();
				delete this.currentLevel;
				this.currentLevel = null;
			}
		}
	}, {
		key: "onWin",
		value: function onWin(_callback) {

			if (!this.onWinCallBack) this.onWinCallBack = _callback;
		}
	}, {
		key: "pauseCurrentLevel",
		value: function pauseCurrentLevel() {}
	}, {
		key: "endCurrentLevel",
		value: function endCurrentLevel() {

			this.currentLevel = null;
		}
	}, {
		key: "reloadLevel",
		value: function reloadLevel() {

			this.currentLevel.reloadLevel();
		}
	}]);

	return GameManager;
}();

},{"./GameElements/ElectricLevel":55,"./GameElements/GravityElectricLevel":59,"./GameElements/GravityLevel":60,"./utils":76}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.IntroScene = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shaderHelper = require('./GameElements/shaderHelper');

var _PhysicalElement = require('./GameElements/PhysicalElement');

var _ElectricParticle = require('./GameElements/ElectricParticle');

var _Planet = require('./GameElements/Planet');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SDFSHader = require('three-bmfont-text/shaders/sdf');

var IntroScene = exports.IntroScene = function () {
		function IntroScene(_options) {
				_classCallCheck(this, IntroScene);

				this.renderer = _options.renderer;
				this.soundManager = _options.soundManager;

				this.run = false;
				var size = this.renderer.getSize();
				this.camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
				this.camera.position.z = 5;

				this.scene = new THREE.Scene();
				this.scene.background = new THREE.Color(0xE6E6E6);
				this.renderer.render(this.scene, this.camera);

				// General

				this.quadGeometry = new THREE.PlaneBufferGeometry(1, 1);

				// Step values

				this.run = false;
				this.intro = false;
				this.mainMenu = false;
				this.gravity = false;
				this.electric = false;
				this.gravityElectric = false;
		}

		_createClass(IntroScene, [{
				key: 'onResize',
				value: function onResize() {

						this.camera.aspect = window.innerWidth / window.innerHeight;
						this.camera.updateProjectionMatrix();

						this.renderer.setSize(window.innerWidth, window.innerHeight);
				}
		}, {
				key: 'build',
				value: function build(_callback) {

						// Build genereal

						this.quadGeometry = new THREE.PlaneBufferGeometry(1, 1);

						// Player

						this.player = new _PhysicalElement.PhysicalElement({

								position: [0, this.getWorldTop() + 0.2, 0],
								scale: [0.000001, 0.000001, 0.000001],
								enabled: true

						});

						this.playerScaleTarget = 0.13;

						this.playerMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.circle.vertex,
								fragmentShader: _shaderHelper.shaderHelper.circle.fragment,

								uniforms: {

										diffuse: { value: [0.2, 0.2, 0.2, 0.8] }

								},

								transparent: true

						});

						this.playerMesh = new THREE.Mesh(this.quadGeometry, this.playerMaterial);
						this.playerMesh.renderOrder = 20;
						this.playerMesh.position.set(this.player.position[0], this.player.position[1], this.player.position[2]);
						this.playerMesh.scale.set(this.player.scale[0], this.player.scale[1], this.player.scale[2]);
						this.scene.add(this.playerMesh);

						// Particles

						this.enableParticles = false;
						this.nParticles = 200;
						this.particles = [];

						this.particlesMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.introParticles.vertex,
								fragmentShader: _shaderHelper.shaderHelper.introParticles.fragment,
								transparent: true

						});

						this.particlesGeometry = new THREE.BufferGeometry();
						this.particlesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.nParticles * 3), 3));

						this.particlesPoints = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
						this.particlesPoints.renderOrder = 10000;

						this.scene.add(this.particlesPoints);

						//
						// Intro
						//

						this.introEnd = false;
						this.arrivalMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.introArrival.vertex,
								fragmentShader: _shaderHelper.shaderHelper.introArrival.fragment,
								transparent: true

						});

						this.arrivalScaleTarget = 0.0;
						this.arrival = new THREE.Mesh(this.quadGeometry, this.arrivalMaterial);
						this.arrival.scale.set(0.000001, 0.000001, 0.000001);
						this.scene.add(this.arrival);

						this.nParticles = 120;

						this.particles = [];

						this.particlesGeometry = new THREE.BufferGeometry();
						this.particlesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.nParticles * 3), 3));
						this.particlesGeometry.attributes.position.dynamic = true;
						this.particlesMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.introParticles.vertex,
								fragmentShader: _shaderHelper.shaderHelper.introParticles.fragment,
								transparent: true

						});

						this.particlePoints = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
						this.scene.add(this.particlePoints);

						// End circle

						this.endCircleScaleTarget = 0.0;
						this.endCircleAlphaTarget = 1.0;
						this.endCircleMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.introEndCircles.vertex,
								fragmentShader: _shaderHelper.shaderHelper.introEndCircles.fragment,

								uniforms: {

										alpha: { value: 0.0 },
										scale: { value: 0.0 }

								},

								transparent: true

						});

						this.endCircle = new THREE.Mesh(this.quadGeometry, this.endCircleMaterial);
						this.scene.add(this.endCircle);

						//
						// Gravity
						//

						this.nMasses = 50;
						this.masses = [];

						this.nPlanets = 3;
						this.planets = [];
						this.planetsMesh = [];

						this.planetMaterial = new THREE.ShaderMaterial({

								vertexShader: _shaderHelper.shaderHelper.planet.vertex,
								fragmentShader: _shaderHelper.shaderHelper.planet.fragment,
								transparent: true

						});

						for (var i = 0; i < this.nPlanets; i++) {

								this.planets.push(new _PhysicalElement.PhysicalElement({

										position: [0, 0, 0],
										scale: [2, 2, 2],
										mass: 10000

								}));

								this.planetsMesh.push(new THREE.Mesh(this.quadGeometry, this.planetMaterial));
						}

						//
						// Electric
						//

						this.nCharges = 5;
						this.charges = [];
						this.chargesMeshes = [];

						//
						// Gravity Electric
						//

						this.nElectricPlanets = 3;
						this.planets = [];
						this.planetCharges = [];

						var textureLoader = new THREE.TextureLoader().load('./resources/textures/generic_circle_sdf_unity.png', function (texture) {

								this.genericTexture = texture;
								this.canDrawMasses = true;
								this.canCreateCharge = true;

								_callback();
						}.bind(this));
				}
		}, {
				key: 'render',
				value: function render() {

						this.renderer.render(this.scene, this.camera);
				}
		}, {
				key: 'update',
				value: function update() {

						if (!this.run) return;

						this.updatePlayer();
						if (this.enableParticles) this.emitParticles();
						if (this.particles.length > 0) this.updateParticles();

						this.updateIntro();
						this.updateMainMenu();
						this.updateGravity();
						this.updateElectric();
						this.updateGravityElectric();
				}
		}, {
				key: 'init',
				value: function init() {}
		}, {
				key: 'onEnd',
				value: function onEnd(_callback) {

						this.onEndCallback = _callback;
				}
		}, {
				key: 'getWidth',
				value: function getWidth() {

						return this.renderer.domElement.offsetWidth * this.renderer.getPixelRatio();
				}
		}, {
				key: 'getHeight',
				value: function getHeight() {

						return this.renderer.domElement.offsetHeight * this.renderer.getPixelRatio();
				}
		}, {
				key: 'getWorldTop',
				value: function getWorldTop() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(0, 0)).y;
				}
		}, {
				key: 'getWorldBottom',
				value: function getWorldBottom() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(0, this.getHeight())).y;
				}
		}, {
				key: 'getWorldLeft',
				value: function getWorldLeft() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(0, 0)).x;
				}
		}, {
				key: 'getWorldRight',
				value: function getWorldRight() {

						return this.get3DPointOnBasePlane(new THREE.Vector2(this.getWidth(), 0)).x;
				}
		}, {
				key: 'get3DPointOnBasePlane',
				value: function get3DPointOnBasePlane(_vector) {

						var vector = new THREE.Vector3();
						vector.set(_vector.x / this.getWidth() * 2 - 1, -(_vector.y / this.getHeight()) * 2 + 1, 0.5);
						vector.unproject(this.camera);
						var dir = vector.sub(this.camera.position).normalize();
						var distance = -this.camera.position.z / dir.z;

						return this.camera.position.clone().add(dir.multiplyScalar(distance));
				}
		}, {
				key: 'disable',
				value: function disable() {

						this.intro = false;
						this.mainMenu = false;
						this.gravity = false;
						this.electric = false;
						this.gravityElectric = false;
				}
		}, {
				key: 'initIntro',
				value: function initIntro(_callback) {

						this.run = true;
						this.intro = true;
						this.player.position = [0, this.getWorldTop() + 0.2, 0];
						this.player.acceleration = [0.06, -0.06, 0];
						// this.player.acceleration = [ 0, -0.06, 0 ];
						this.player.mass = 400;
						this.player.drag = 0.985;
						this.arrivalScaleTarget = 1.0;
						this.enableParticles = true;
						this.introOnEndCallback = _callback;
				}
		}, {
				key: 'updateIntro',
				value: function updateIntro() {

						// Apply force towars the target when intro is active.

						if (this.intro) {

								var arrivapPosition = [this.arrival.position.x, this.arrival.position.y, this.arrival.position.z];
								var force = vec3.sub(vec3.create(), arrivapPosition, this.player.position);
								var dist = vec3.length(force);
								vec3.normalize(force, force);
								var mag = 1.0 / Math.pow(dist + 1.0, 2);
								vec3.scale(force, force, mag * 5);
								if (!this.introEnd) this.player.applyForce(force);

								// Check if ended

								if (dist < 0.3 && !this.introEnd) {

										this.arrivalScaleTarget = 0.000001;
										this.player.drag = 0.98;
										this.endCircleScaleTarget = this.getWorldTop() > this.getWorldRight() ? this.getWorldTop() * 2 : this.getWorldRight() * 2;
										this.endCircleAlphaTarget = 0.0;
										this.introEnd = true;

										if (this.introOnEndCallback) this.introOnEndCallback();
								}
						}

						// Update the target

						this.arrival.scale.x += (this.arrivalScaleTarget - this.arrival.scale.x) * 0.08;
						this.arrival.scale.y += (this.arrivalScaleTarget - this.arrival.scale.y) * 0.08;

						// Update the end circle

						this.endCircleMaterial.uniforms.scale.value += (this.endCircleScaleTarget - this.endCircleMaterial.uniforms.scale.value) * 0.05;
						this.endCircleMaterial.uniforms.alpha.value += (this.endCircleAlphaTarget - this.endCircleMaterial.uniforms.alpha.value) * 0.05;

						// Check disabled objects

						if (this.arrival.scale.x < 0.001) {

								this.arrival.visible = false;
						} else {

								this.arrival.visible = true;
						}

						if (this.endCircleMaterial.uniforms.alpha.value < 0.001) {

								this.endCircle.visible = false;
						} else {

								this.endCircle.visible = true;
						}
				}
		}, {
				key: 'initMainMenu',
				value: function initMainMenu() {

						this.intro = false;
						this.mainMenu = true;
						this.gravity = false;
						this.electric = false;
						this.gravityElectric = false;

						this.enableParticles = true;
						this.player.drag = 0.99;
						this.player.mass = 400;
						this.playerScaleTarget = 0.13;
						this.player.scale = [this.playerScaleTarget, this.playerScaleTarget, this.playerScaleTarget];
						this.forcePosition = [0, 0, 0];
						this.resetForceTimeout = null;
						this.canResetForcePosition = true;
				}
		}, {
				key: 'updateMainMenu',
				value: function updateMainMenu() {

						if (this.mainMenu) {

								if (this.canResetForcePosition) {

										this.forcePosition = [(Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, 0.0];
										this.canResetForcePosition = false;

										this.resetForceTimeout = setTimeout(function () {

												this.canResetForcePosition = true;
										}.bind(this), 2000);
								}

								var force = vec3.sub([0, 0, 0], this.forcePosition, this.player.position);
								var dist = vec3.length(force);
								vec3.normalize(force, force);
								var mag = 1.0 / Math.pow(dist + 1.0, 2) * 4;
								this.player.applyForce(vec3.scale(force, force, mag));

								if (dist < 0.3) {

										clearTimeout(this.resetForceTimeout);
										this.canResetForcePosition = true;
								}

								// Check edges

								this.mirrorEdges();
						}
				}
		}, {
				key: 'initGravity',
				value: function initGravity() {

						this.intro = false;
						this.mainMenu = false;
						this.gravity = true;
						this.electric = false;
						this.gravityElectric = false;
						this.forcePosition = [0, 0, 0];
						this.resetForceTimeout = null;
						this.canResetForcePosition = true;
						this.player.drag = 0.98;

						if (!this.massDrawer) {

								this.massDrawer = new _PhysicalElement.PhysicalElement({

										position: this.getRandomEdgePosition(),
										mass: 400,
										drag: 0.98,
										acceleration: [(Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0],
										enabled: true

								});
						}

						if (!this.massesPoints) {

								this.massesGeometry = new THREE.BufferGeometry();
								this.massesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.nMasses * 3), 3));
								this.massesMaterial = new THREE.ShaderMaterial({

										vertexShader: _shaderHelper.shaderHelper.introGenericCirclePoint.vertex,
										fragmentShader: _shaderHelper.shaderHelper.introGenericCirclePoint.fragment,

										uniforms: {

												solidColor: { value: [0.8, 0.8, 0.8, 1] },
												texture: { value: this.genericTexture }

										},

										blending: THREE.MultiplyBlending,
										transparent: true

								});

								this.massesPoints = new THREE.Points(this.massesGeometry, this.massesMaterial);
								this.scene.add(this.massesPoints);
								this.massesMaterial.extensions.derivatives = true;
						}

						if (this.genericTexture) {

								this.canDrawMasses = true;
						}
				}
		}, {
				key: 'updateGravity',
				value: function updateGravity() {

						if (this.gravity) {

								if (this.canDrawMasses && this.masses.length < this.nMasses) {

										var rS = Math.random() * 0.5 + 0.5;

										this.canDrawMasses = false;

										this.masses.push(new _PhysicalElement.PhysicalElement({

												position: this.massDrawer.position,
												scale: [0, 0, 0],
												drag: 0.9,
												acceleration: [(Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, 0],
												enabled: true,
												targetScale: [rS, rS, rS],
												canDye: true,
												lifeSpan: 5000

										}));

										setTimeout(function () {

												this.canDrawMasses = true;
										}.bind(this), 30);
								}

								// Update mass drawer

								if (this.canResetForcePosition) {

										this.forcePosition = [(Math.random() - 0.5) * 4.0, (Math.random() - 0.5) * 4.0, 0.0];
										this.canResetForcePosition = false;

										this.resetForceTimeout = setTimeout(function () {

												this.canResetForcePosition = true;
										}.bind(this), 2000);
								}

								var force = vec3.sub([0, 0, 0], this.forcePosition, this.massDrawer.position);
								var dist = vec3.length(force);
								vec3.normalize(force, force);
								var mag = 1.0 / Math.pow(dist + 1.0, 2) * 4;
								this.massDrawer.applyForce(vec3.scale(force, force, mag));

								if (dist < 0.3) {

										clearTimeout(this.resetForceTimeout);
										this.canResetForcePosition = true;
								}

								this.massDrawer.update();
								this.mirrorEdges(this.massDrawer.position);

								// Update masses

								this.mirrorEdges();
						}

						if (this.masses.length > 0) {

								this.massesPoints.visible = true;

								for (var i = this.nMasses - 4; i >= 0; i--) {

										var bufferIndex = i * 3;

										if (i < this.masses.length) {

												var _force = vec3.sub([0, 0, 0], this.masses[i].position, this.player.position);
												var _dist = vec3.length(_force);
												var minDist = (this.masses[i].scale[0] * this.masses[i].lifePercent + this.player.scale[0]) * 0.5;
												vec3.normalize(_force, _force);
												var _mag2 = 1.0 / Math.pow(_dist + 1.0, 2.0) * 0.2;

												if (_dist < minDist) {

														this.emitParticles(50, 0.1);
														this.player.position = this.getRandomEdgePosition();
														this.player.velocity = [(Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0];
												}

												this.player.applyForce(vec3.scale(_force, _force, _mag2));

												if (this.masses[i].isDead()) {

														this.masses.splice(i, 1);
												} else {

														this.masses[i].scale[0] += (this.masses[i].targetScale[0] - this.masses[i].scale[0]) * 0.1;
														this.masses[i].scale[1] += (this.masses[i].targetScale[1] - this.masses[i].scale[1]) * 0.1;
														this.masses[i].update();

														this.massesGeometry.attributes.position.array[bufferIndex + 0] = this.masses[i].position[0];
														this.massesGeometry.attributes.position.array[bufferIndex + 1] = this.masses[i].position[1];
														this.massesGeometry.attributes.position.array[bufferIndex + 2] = this.masses[i].scale[0] * this.renderer.getPixelRatio() * 100 * this.masses[i].lifePercent;
												}
										} else {

												this.massesGeometry.attributes.position.array[bufferIndex + 0] = 0;
												this.massesGeometry.attributes.position.array[bufferIndex + 1] = 0;
												this.massesGeometry.attributes.position.array[bufferIndex + 2] = 0;
										}
								}

								this.massesGeometry.attributes.position.needsUpdate = true;
						} else {

								if (this.massesPoints) this.massesPoints.visible = false;
						}
				}
		}, {
				key: 'initElectric',
				value: function initElectric() {

						this.intro = false;
						this.mainMenu = false;
						this.gravity = false;
						this.electric = true;
						this.gravityElectric = false;
						this.canCreateCharge = false;
						this.player.mass = 800;
						this.player.drag = 0.9855;

						if (this.genericTexture) {

								this.canCreateCharge = true;
						}
				}
		}, {
				key: 'updateElectric',
				value: function updateElectric() {

						if (this.electric) {

								// Create charges

								if (this.charges.length < this.nCharges - 1 && this.canCreateCharge) {

										this.canCreateCharge = false;

										var newCharge = new _ElectricParticle.ElectricParticle({

												position: [(Math.random() - 0.5) * 4.0, (Math.random() - 0.5) * 4.0, 0],
												maxRadius: 1.6,
												targetRadius: 1.0 * Math.random() + 0.6,
												drag: 0.98,
												canDye: true,
												lifeSpan: 8000 * Math.random() + 5000,
												enabled: true

										});

										this.charges.push(newCharge);

										var chargeMaterial = new THREE.ShaderMaterial({

												vertexShader: _shaderHelper.shaderHelper.introGenericCircle.vertex,
												fragmentShader: _shaderHelper.shaderHelper.introGenericCircle.fragment,

												uniforms: {

														texture: { value: this.genericTexture },
														solidColor: { value: [0, 0, 0, 1] }

												},

												transparent: true

										});

										var chargeMesh = new THREE.Mesh(this.quadGeometry, chargeMaterial);
										chargeMesh.renderOrder = 0;
										this.chargesMeshes.push(chargeMesh);
										this.scene.add(chargeMesh);
										chargeMaterial.extensions.derivatives = true;

										setTimeout(function () {

												this.canCreateCharge = true;
										}.bind(this), Math.random() * 1500);
								}

								// Check edges.

								this.mirrorEdges();
						} else {

								for (var i = 0; i < this.charges.length; i++) {

										this.charges[i].kill();
								}
						}

						// Update charges

						for (var _i = this.charges.length - 1; _i >= 0; _i--) {

								for (var j = this.charges.length - 1; j >= 0; j--) {

										if (j != _i) {

												var _force2 = vec3.sub([0, 0, 0], this.charges[_i].position, this.charges[j].position);
												var _dist2 = vec3.length(_force2);
												var _minDist = (this.charges[_i].scale[0] + this.charges[j].scale[0]) * 0.5;

												if (_dist2 < _minDist) {

														var _mag3 = Math.pow(_minDist - _dist2, 3);
														vec3.normalize(_force2, _force2);
														this.charges[_i].applyForce(vec3.scale(_force2, _force2, _mag3));
												}
										}
								}

								this.charges[_i].update();
								this.chargesMeshes[_i].position.set(this.charges[_i].position[0], this.charges[_i].position[1], this.charges[_i].position[2]);
								this.chargesMeshes[_i].scale.set(this.charges[_i].scale[0], this.charges[_i].scale[1], this.charges[_i].scale[2]);
								this.chargesMeshes[_i].material.uniforms.solidColor.value = this.charges[_i].color;

								// Update the player

								var force = vec3.sub([0, 0, 0], this.charges[_i].position, this.player.position);
								var dist = vec3.length(force);
								var minDist = (this.charges[_i].scale[0] + this.player.scale[0]) * 0.5;
								vec3.normalize(force, force);
								var mag = 1.0 / Math.pow(dist + 1.0, 2.0) * 1000.0 * this.charges[_i].charge;

								if (dist < minDist) {

										this.emitParticles(50, 0.1);
										this.player.position = this.getRandomEdgePosition();
										this.player.velocity = [(Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0];
								} else {

										this.player.applyForce(vec3.scale(force, force, mag));
								}

								if (this.checkEdges(this.charges[_i].position, this.charges[_i].scale[0] * 0.5)) this.charges[_i].kill();

								if (this.charges[_i].isDead()) {

										this.charges[_i].kill();

										if (this.charges[_i].color[3] < 0.001) {

												this.charges.splice(_i, 1);
												this.scene.remove(this.chargesMeshes[_i]);
												this.chargesMeshes.splice(_i, 1);
										}
								}
						}
				}
		}, {
				key: 'initGravityElectric',
				value: function initGravityElectric() {

						this.intro = false;
						this.mainMenu = false;
						this.gravity = false;
						this.electric = false;
						this.gravityElectric = true;
						this.canCreateCharge = false;
						this.player.mass = 800;
						this.player.drag = 0.9855;
						this.planetsAlphaTarget = 1.0;
						this.canChangeCharge = true;

						if (this.electricPlanetsMaterial) {

								this.electricPlanetsMaterial.uniforms.solidColor.value[3] = 0;
						}

						if (!this.electricPlanets) {

								this.nElectricPlanets = 3;
								this.electricPlanets = [];

								this.electricPlanetsMeshes = [];

								this.electricPlanetsMaterial = new THREE.ShaderMaterial({

										vertexShader: _shaderHelper.shaderHelper.introElectricPlanet.vertex,
										fragmentShader: _shaderHelper.shaderHelper.introElectricPlanet.fragment,

										uniforms: {

												texture: { value: this.genericTexture },
												solidColor: { value: [0.8, 0.8, 0.8, 0.0] }

										},

										transparent: true

								});

								this.electricPlanetsMaterial.extensions.derivatives = true;

								// Create planets and charges.

								var layers = [1, 5, 10, 20];
								this.nChargesPerPlanet = 0;
								this.planetCharges = [];

								for (var i = 0; i < this.nElectricPlanets; i++) {

										var rS = Math.random() + 3;

										var newElectricPlanet = new _Planet.Planet({

												position: [(Math.random() - 0.5) * this.getWorldRight() * 2.0, (Math.random() - 0.5) * this.getWorldTop() * 2.0, 0],
												scale: [rS, rS, rS],
												drag: 0.7,
												enabled: true

										});

										this.electricPlanets.push(newElectricPlanet);

										// Create charges

										for (var j = 0; j < layers.length; j++) {

												this.nChargesPerPlanet += layers[j];

												for (var k = 0; k < layers[j]; k++) {

														var step = Math.PI * 2.0 / layers[j];
														var angle = step * k; // + ( Math.random() - 0.5 ) * 0.2;
														var dist = newElectricPlanet.scale[0] * 0.25 / (layers.length - 1) * j;

														newElectricPlanet.charges.push(new _ElectricParticle.ElectricParticle({

																position: vec3.fromValues(newElectricPlanet.position[0] + Math.cos(angle) * dist, newElectricPlanet.position[1] + Math.sin(angle) * dist, 0.0),
																targetRadius: 0.2 + Math.random() * 0.13,
																mass: 400,
																drag: 0.95,
																enabled: true

														}));
												}
										}

										var newMesh = new THREE.Mesh(this.quadGeometry, this.electricPlanetsMaterial);
										this.electricPlanetsMeshes.push(newMesh);
										this.scene.add(newMesh);
								}

								this.planetChargesGeometry = new THREE.BufferGeometry();
								this.planetChargesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.nPlanets * this.nChargesPerPlanet * 3), 3));
								this.planetChargesGeometry.addAttribute('rgbaColor', new THREE.BufferAttribute(new Float32Array(this.nPlanets * this.nChargesPerPlanet * 4), 4));
								this.planetChargesMaterial = new THREE.ShaderMaterial({

										vertexShader: _shaderHelper.shaderHelper.introGenericCircleElectricPlanet.vertex,
										fragmentShader: _shaderHelper.shaderHelper.introGenericCircleElectricPlanet.fragment,

										uniforms: {

												texture: { value: this.genericTexture },
												globalAlpha: { value: 0.0 }

										},

										transparent: true

								});

								this.planetChargesMaterial.extensions.derivatives = true;

								this.planetChargesPoints = new THREE.Points(this.planetChargesGeometry, this.planetChargesMaterial);
								this.scene.add(this.planetChargesPoints);
						}

						this.planetChargesAlphaTarget = 1.0;
				}
		}, {
				key: 'updateGravityElectric',
				value: function updateGravityElectric() {

						if (this.gravityElectric) {

								// Update electric planets

								if (this.canChangeCharge) {

										this.canChangeCharge = false;

										for (var i = 0; i < this.electricPlanets.length; i++) {

												this.electricPlanets[i].targetCharge = (Math.random() - 0.5) * 50;
												this.electricPlanets[i].sign = Math.random() > 0.5 ? 1 : -1;
										}

										setTimeout(function () {

												this.canChangeCharge = true;
										}.bind(this), 3000);
								}

								for (var _i2 = 0; _i2 < this.electricPlanets.length; _i2++) {

										this.electricPlanets[_i2].update();

										this.electricPlanetsMeshes[_i2].position.set(this.electricPlanets[_i2].position[0], this.electricPlanets[_i2].position[1], this.electricPlanets[_i2].position[2]);
										this.electricPlanetsMeshes[_i2].scale.set(this.electricPlanets[_i2].scale[0], this.electricPlanets[_i2].scale[1], this.electricPlanets[_i2].scale[2]);

										if (this.electricPlanetsMaterial.uniforms.solidColor.value[3] >= 0.001) {

												this.electricPlanetsMeshes[_i2].visible = true;
										}

										var gForce = vec3.sub([0, 0, 0], this.electricPlanets[_i2].position, this.player.position);
										var dist = vec3.length(gForce);
										var minDist = (this.electricPlanets[_i2].scale[0] + this.player.scale[0]) * 0.5;
										vec3.normalize(gForce, gForce);
										var mag = 1.0 / Math.pow(dist + 1.0, 2) * 6;

										this.player.applyForce(vec3.scale(gForce, gForce, mag));

										var eMag = 1.0 / Math.pow(dist + 1.0, 2) * this.electricPlanets[_i2].charge;
										this.player.applyForce(vec3.scale([0, 0, 0], gForce, eMag));

										for (var j = 0; j < this.electricPlanets.length; j++) {

												if (j != _i2) {

														var force = vec3.sub([0, 0, 0], this.electricPlanets[_i2].position, this.electricPlanets[j].position);
														var _dist3 = vec3.length(force);
														var _minDist2 = (this.electricPlanets[_i2].scale[0] + this.electricPlanets[j].scale[0]) * 0.5;
														vec3.normalize(force, force);

														if (_dist3 < _minDist2) {

																this.electricPlanets[_i2].applyForce(vec3.scale(force, force, Math.pow(_minDist2 - _dist3, 2))) * 0.001;
														}
												}
										}

										if (dist < minDist - 0.1) {

												this.emitParticles(50, 0.1);
												this.player.position = this.getRandomEdgePosition();
										}

										var charges = this.electricPlanets[_i2].charges;

										for (var _j = 0; _j < charges.length; _j++) {

												var planetForce = vec3.sub([0, 0, 0], this.electricPlanets[_i2].position, charges[_j].position);
												var _dist4 = vec3.length(planetForce);
												vec3.normalize(planetForce, planetForce);
												var _mag4 = 1.0 / Math.pow(_dist4 + 1.0, 2.0) * 2;

												if (_j != 0) charges[_j].applyForce(vec3.scale(planetForce, planetForce, _mag4));
												if (_j == 0) charges[_j].position = this.electricPlanets[_i2].position;

												for (var k = 0; k < charges.length; k++) {

														if (k != _j) {

																var _force3 = vec3.sub([0, 0, 0], charges[_j].position, charges[k].position);
																var _dist5 = vec3.length(_force3);
																var _minDist3 = (charges[k].scale[0] + charges[_i2].scale[0]) * 0.65;
																vec3.normalize(_force3, _force3);

																if (_dist5 < _minDist3) {

																		if (_j != 0) charges[_j].applyForce(vec3.scale(_force3, _force3, Math.pow(_minDist3 - _dist5, 2) * 100.0));
																}
														}
												}

												charges[_j].update();

												var bufferPositionIndex = _i2 * this.nChargesPerPlanet * 3 + _j * 3;
												var bufferColorIndex = _i2 * this.nChargesPerPlanet * 4 + _j * 4;

												// console.log(bufferPositionIndex);

												this.planetChargesGeometry.attributes.position.array[bufferPositionIndex + 0] = charges[_j].position[0];
												this.planetChargesGeometry.attributes.position.array[bufferPositionIndex + 1] = charges[_j].position[1];
												this.planetChargesGeometry.attributes.position.array[bufferPositionIndex + 2] = charges[_j].scale[0] * this.renderer.getPixelRatio() * 100;

												this.planetChargesGeometry.attributes.rgbaColor.array[bufferColorIndex + 0] = charges[_j].color[0];
												this.planetChargesGeometry.attributes.rgbaColor.array[bufferColorIndex + 1] = charges[_j].color[1];
												this.planetChargesGeometry.attributes.rgbaColor.array[bufferColorIndex + 2] = charges[_j].color[2];
												this.planetChargesGeometry.attributes.rgbaColor.array[bufferColorIndex + 3] = charges[_j].color[3];
										}
								}

								this.planetChargesGeometry.attributes.position.needsUpdate = true;
								this.planetChargesGeometry.attributes.rgbaColor.needsUpdate = true;

								if (this.planetChargesMaterial.uniforms.globalAlpha.value > 0.001) {

										this.planetChargesPoints.visible = true;
								}

								// update player

								this.mirrorEdges();
						} else {

								this.planetsAlphaTarget = 0;
								this.planetChargesAlphaTarget = 0;

								if (this.electricPlanetsMaterial && this.electricPlanetsMaterial.uniforms.solidColor.value[3] < 0.001) {

										for (var _i3 = 0; _i3 < this.electricPlanetsMeshes.length; _i3++) {

												this.electricPlanetsMeshes[_i3].visible = false;
										}
								}

								if (this.planetChargesMaterial && this.planetChargesMaterial.uniforms.globalAlpha.value < 0.001) {

										this.planetChargesPoints.visible = false;
								}
						}

						if (this.electricPlanetsMaterial) {

								this.electricPlanetsMaterial.uniforms.solidColor.value[3] += (this.planetsAlphaTarget - this.electricPlanetsMaterial.uniforms.solidColor.value[3]) * 0.05;
								this.planetChargesMaterial.uniforms.globalAlpha.value += (this.planetChargesAlphaTarget - this.planetChargesMaterial.uniforms.globalAlpha.value) * 0.05;
						}
				}
		}, {
				key: 'updatePlayer',
				value: function updatePlayer() {

						this.player.update();
						this.player.scale[0] += (this.playerScaleTarget - this.player.scale[0]) * 0.1;
						this.player.scale[1] += (this.playerScaleTarget - this.player.scale[1]) * 0.1;
						this.playerMesh.position.set(this.player.position[0], this.player.position[1], this.player.position[2]);
						this.playerMesh.scale.set(this.player.scale[0], this.player.scale[1], this.player.scale[2]);
				}
		}, {
				key: 'getRandomEdgePosition',
				value: function getRandomEdgePosition() {

						var offset = 0.5;

						if (Math.random() > 0.5) {

								if (Math.random() > 0.5) {

										return [this.getWorldRight() + offset, (Math.random() - 0.5) * this.getWorldTop() * 4.0, 0.0];
								} else {

										return [this.getWorldLeft() - offset, (Math.random() - 0.5) * this.getWorldTop() * 4.0, 0.0];
								}
						} else {

								if (Math.random() > 0.5) {

										return [(Math.random() - 0.5) * this.getWorldRight() * 4.0, this.getWorldTop() + offset, 0.0];
								} else {

										return [(Math.random() - 0.5) * this.getWorldRight() * 4.0, this.getWorldBottom() - offset, 0.0];
								}
						}
				}
		}, {
				key: 'checkEdges',
				value: function checkEdges(_position, _offset) {

						_offset = _offset || 0;

						if (_position[0] > this.getWorldRight() + _offset || _position[0] < this.getWorldLeft() - _offset || _position[1] > this.getWorldTop() + _offset || _position[1] < this.getWorldBottom() - _offset) return true;
						return false;
				}
		}, {
				key: 'mirrorEdges',
				value: function mirrorEdges(_position) {

						var offset = 0.1;

						if (_position) {

								if (_position[0] > this.getWorldRight() + offset) {

										_position[0] = this.getWorldLeft() - offset;
								} else if (_position[0] < this.getWorldLeft() - offset) {

										_position[0] = this.getWorldRight() + offset;
								} else if (_position[1] > this.getWorldTop() + offset) {

										_position[1] = this.getWorldBottom() - offset;
								} else if (_position[1] < this.getWorldBottom() - offset) {

										_position[1] = this.getWorldTop() + offset;
								}
						} else {

								if (this.player.position[0] > this.getWorldRight() + offset) {

										this.player.position[0] = this.getWorldLeft() - offset;
								} else if (this.player.position[0] < this.getWorldLeft() - offset) {

										this.player.position[0] = this.getWorldRight() + offset;
								} else if (this.player.position[1] > this.getWorldTop() + offset) {

										this.player.position[1] = this.getWorldBottom() - offset;
								} else if (this.player.position[1] < this.getWorldBottom() - offset) {

										this.player.position[1] = this.getWorldTop() + offset;
								}
						}
				}
		}, {
				key: 'emitParticles',
				value: function emitParticles(_num, _mag) {

						if (_num > 2) {

								this.soundManager.play('Hit_sound_' + Math.floor(Math.random() * 4), { volume: 1.0 });
								this.soundManager.play('Gong_sound_' + Math.floor(Math.random() * 4), { volume: 0.2 });
								this.soundManager.play('Explosion_sound_' + Math.floor(Math.random() * 3), { volume: 0.1 });
						}

						// Add particles

						if (this.particles.length < this.nParticles) {

								for (var i = 0; i < (_num || 2); i++) {

										this.particles.push(new _PhysicalElement.PhysicalElement({

												position: this.player.position,
												scale: [Math.random() * 10 * this.renderer.getPixelRatio() + 1.0, 0, 0],
												acceleration: [(Math.random() - 0.5) * (_mag || 0.02), (Math.random() - 0.5) * (_mag || 0.02), 0],
												velocity: vec3.scale(vec3.create(), this.player.velocity, 0.2),
												canDye: true,
												lifeSpan: 1000 * Math.random(),
												mass: 700 * Math.random() + 700,
												enabled: true,
												drag: 0.99

										}));
								}
						}
				}
		}, {
				key: 'updateParticles',
				value: function updateParticles() {

						// Update the particles & the geometry used to render them.

						for (var i = this.nParticles - 4; i >= 0; i--) {

								var bufferIndex = i * 3;

								if (i < this.particles.length) {

										var force = vec3.sub([0, 0, 0], this.player.position, this.particles[i].position);
										var dist = vec3.length(force);
										vec3.normalize(force, force);
										var mag = 1.0 / Math.pow(dist + 1.0, 2.0) * 1.0;

										this.particles[i].applyForce(vec3.scale(force, force, mag));
										this.particles[i].update();

										this.particlesGeometry.attributes.position.array[bufferIndex + 0] = this.particles[i].position[0];
										this.particlesGeometry.attributes.position.array[bufferIndex + 1] = this.particles[i].position[1];
										this.particlesGeometry.attributes.position.array[bufferIndex + 2] = this.particles[i].scale[0] * this.particles[i].lifePercent;

										if (this.particles[i].isDead()) {

												this.particles.splice(i, 1);
										}
								} else {

										this.particlesGeometry.attributes.position.array[bufferIndex + 0] = 0;
										this.particlesGeometry.attributes.position.array[bufferIndex + 1] = 0;
										this.particlesGeometry.attributes.position.array[bufferIndex + 2] = 0;
								}
						}

						this.particlesGeometry.attributes.position.needsUpdate = true;
				}
		}]);

		return IntroScene;
}();

},{"./GameElements/ElectricParticle":56,"./GameElements/PhysicalElement":64,"./GameElements/Planet":65,"./GameElements/shaderHelper":69,"three-bmfont-text/shaders/sdf":45}],72:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
        value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SoundManager = exports.SoundManager = function () {
        function SoundManager() {
                _classCallCheck(this, SoundManager);

                var instances = {};

                var audioPath = "./resources/sounds/";
                var sounds = [{ id: "Back_sound_0", src: "Back_long_sound_0.mp3" }, { id: "Back_sound_1", src: "Back_long_sound_1.mp3" }, { id: "Back_sound_2", src: "Back_long_sound_2.mp3" }, { id: "Back_sound_3", src: "Back_long_sound_3.mp3" }, { id: "Goal_sound_0", src: "Goal_sound_0.mp3" }, { id: "Goal_sound_1", src: "Goal_sound_1.mp3" }, { id: "Goal_sound_2", src: "Goal_sound_2.mp3" }, { id: "Goal_sound_3", src: "Goal_sound_3.mp3" }, { id: "Hit_sound_0", src: "Hit_sound_0.mp3" }, { id: "Hit_sound_1", src: "Hit_sound_1.mp3" }, { id: "Hit_sound_2", src: "Hit_sound_2.mp3" }, { id: "Hit_sound_3", src: "Hit_sound_3.mp3" }, { id: "Hit_sound_4", src: "Hit_sound_4.mp3" }, { id: "Explosion_sound_0", src: "Explosion_sound_0.mp3" }, { id: "Explosion_sound_1", src: "Explosion_sound_1.mp3" }, { id: "Explosion_sound_2", src: "Explosion_sound_2.mp3" }, { id: "Gong_sound_0", src: "Gong_sound_0.mp3" }, { id: "Gong_sound_1", src: "Gong_sound_1.mp3" }, { id: "Gong_sound_2", src: "Gong_sound_2.mp3" }, { id: "Gong_sound_3", src: "Gong_sound_3.mp3" }, { id: "Triangle_sound_0", src: "Triangle_sound_0.mp3" }, { id: "Triangle_sound_1", src: "Triangle_sound_1.mp3" }, { id: "Player_sound_0", src: "Player_sound_0.mp3" }];

                // if initializeDefaultPlugins returns false, we cannot play sound in this browser
                if (!createjs.Sound.initializeDefaultPlugins()) {
                        return;
                }

                createjs.Sound.alternateExtensions = ["mp3"];
                createjs.Sound.addEventListener("fileload", handleLoad);
                createjs.Sound.registerSounds(sounds, audioPath);

                var self = this;
                var numSounds = Object.keys(sounds).length;

                function handleLoad(event) {

                        instances[event.id] = event;

                        if (Object.keys(instances).length == numSounds) {

                                if (self.onLoadCallback) self.onLoadCallback();
                        }
                }
        }

        _createClass(SoundManager, [{
                key: "getInstance",
                value: function getInstance(_id) {

                        return instances[_id];
                }
        }, {
                key: "play",
                value: function play(_id, _options) {

                        return createjs.Sound.play(_id, _options || {});
                }
        }, {
                key: "stop",
                value: function stop() {

                        createjs.Sound.stop();
                }
        }, {
                key: "volume",
                value: function volume(_volume) {

                        createjs.Sound.volume = _volume;
                }
        }, {
                key: "onLoad",
                value: function onLoad(_callback) {

                        this.onLoadCallback = _callback;
                }
        }]);

        return SoundManager;
}();

},{}],73:[function(require,module,exports){
"use strict";

var _resourcesList = require("./resourcesList");

var _GameManager = require("./GameManager");

var _SoundManager = require("./SoundManager");

var _utils = require("./utils");

var _levels = require("./levels");

var _IntroScene = require("./IntroScene");

// Loop utility

var loop = require('raf-loop');

(function () {

		function init(_soundManager) {

				setTimeout(function () {

						// backSound.volume = 1.0;

				}, 1000);

				// Cross browser variables

				var performance = window.performance || {};
				performance.now = function () {

						var _now = Date.now();
						return performance.now || performance.webkitNow || performance.msNow || performance.oNow || performance.mozNow || function () {
								return Date.now() - _now;
						};
				}();

				window.performance = performance;

				if (!window.requestAnimationFrame) {

						window.requestAnimationFrame = function () {

								return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function ( /* function FrameRequestCallback */callback, /* DOMElement Element */element) {

										window.setTimeout(callback, 1000 / 60);
								};
						}();
				}

				// Build GUI

				var isRuning = false;
				var pagesStack = [];
				var backPage = null;
				var backAction = false;
				var pages = document.querySelectorAll('.page');
				var mainMenu = document.querySelector('#main-menu');
				var loadingPanel = document.querySelector('#loading-panel');
				var loadingLevelPanel = document.querySelector('#loading-level-panel');

				// update levels

				for (var level in _levels.levels) {

						for (var n in _levels.levels[level]) {

								_levels.levels[level][n]['levelIndex'] = parseInt(n) + 1;
						}
				}

				// Set events on the buttons.

				for (var i = 0; i < pages.length; i++) {

						var buttons = pages[i].querySelectorAll('.button');

						for (var j = 0; j < buttons.length; j++) {

								if (WURFL.is_mobile === true) {

										(function (button) {

												button.addEventListener('touchstart', function () {

														var onMouseUp = function onMouseUp() {

																if (button.attributes.target) {

																		var target = button.attributes.target.value;
																		var currentPage = document.querySelector('.page-active');
																		setPageActive(document.querySelector('#' + target));
																		backPage = currentPage;
																		button.removeEventListener('touchend', onMouseUp);

																		if (button.attributes.chapter) {

																				var chapter = button.attributes.chapter.value;
																				var _level = button.attributes.level.value;

																				loadingLevelPanel.style.opacity = 1;
																				loadingLevelPanel.style.pointerEvents = 'auto';

																				setTimeout(function () {

																						gameManager.startLevel(_levels.levels[chapter][_level], function () {

																								isRuning = true;

																								setTimeout(function () {

																										loadingLevelPanel.style.opacity = 0;
																										loadingLevelPanel.style.pointerEvents = 'none';
																								}, 500);
																						});
																				}, 500);
																		}
																}
														};

														button.addEventListener('touchend', onMouseUp);
												});
										})(buttons[j]);
								} else {

										(function (button) {

												button.addEventListener('mousedown', function () {

														var onMouseUp = function onMouseUp() {

																if (button.attributes.target) {

																		var target = button.attributes.target.value;
																		var currentPage = document.querySelector('.page-active');
																		setPageActive(document.querySelector('#' + target));
																		backPage = currentPage;
																		button.removeEventListener('mouseup', onMouseUp);

																		if (button.attributes.chapter) {

																				var chapter = button.attributes.chapter.value;
																				var _level2 = button.attributes.level.value;

																				loadingLevelPanel.style.opacity = 1;
																				loadingLevelPanel.style.pointerEvents = 'auto';

																				setTimeout(function () {

																						gameManager.startLevel(_levels.levels[chapter][_level2], function () {

																								isRuning = true;

																								setTimeout(function () {

																										loadingLevelPanel.style.opacity = 0;
																										loadingLevelPanel.style.pointerEvents = 'none';
																								}, 500);
																						});
																				}, 500);
																		}
																}
														};

														button.addEventListener('mouseup', onMouseUp);
												});
										})(buttons[j]);
								}
						}
				}

				// setPageActive ( mainMenu );

				function setPageActive(_page, _onTransitionEnd) {

						var activePage = document.querySelector('.page-active');

						if (activePage) {

								if (!backAction) pagesStack.push(activePage);
								backAction = false;
								setPageUnactive(activePage);
						}

						if (!_page.className.match(/(?:^|\s)page-active(?!\S)/)) {

								switch (_page.id) {

										case 'main-menu':

												setTimeout(function () {

														introScene.initMainMenu();
												}, 500);

												break;

										case 'gravity-levels':

												setTimeout(function () {

														introScene.initGravity();
												}, 500);

												break;

										case 'electric-levels':

												setTimeout(function () {

														introScene.initElectric();
												}, 500);

												break;

										case 'gravity-electric-levels':

												setTimeout(function () {

														introScene.initGravityElectric();
												}, 500);

												break;

								}

								_page.className += ' page-active';

								if (_page.attributes.back) {

										backPage = document.querySelector('#' + _page.attributes.back.value);
								} else {

										backPage = null;
								}

								if (_onTransitionEnd) {

										(0, _utils.addEvent)(_page, 'transitionend', function () {

												var onTransitionEnd = function onTransitionEnd() {

														_onTransitionEnd();
														(0, _utils.removeEvent)({ elem: _page, event: 'transitionend', handler: onTransitionEnd });
												};

												(0, _utils.addEvent)(_page, 'transitionend', onTransitionEnd);
										});
								}
						}

						if (backPage) {

								backButton.style.opacity = 1;
								backButton.style.pointerEvents = 'auto';
						} else {

								backButton.style.opacity = 0;
								backButton.style.pointerEvents = 'none';
						}
				}

				function setPageUnactive(_page, _onTransitionEnd) {

						if (_page.className.match(/(?:^|\s)page-active(?!\S)/)) {

								_page.className = _page.className.replace(/(?:^|\s)page-active(?!\S)/g, '');

								if (_onTransitionEnd) {

										var onTransitionEnd = function onTransitionEnd() {

												_onTransitionEnd();
												(0, _utils.removeEvent)({ elem: _page, event: 'transitionend', handler: onTransitionEnd });
										};

										(0, _utils.addEvent)(_page, 'transitionend', onTransitionEnd);
								}
						}
				}

				function setAllPagesUnactive() {

						var pages = document.querySelectorAll('.pages');
						for (var _i = 0; _i < pages.length; _i++) {

								setPageUnactive(page[_i]);
						}
				}

				// Top Bar

				var backButton = document.querySelector('#back-button');

				if (WURFL.is_mobile === true) {

						backButton.addEventListener('touchstart', function () {

								var onMouseUp = function onMouseUp() {

										backAction = true;
										setPageActive(backPage);
										isRuning = false;
										backButton.removeEventListener('touchend', onMouseUp);
								};

								backButton.addEventListener('touchend', onMouseUp);
						});
				} else {

						backButton.addEventListener('mousedown', function () {

								var onMouseUp = function onMouseUp() {

										backAction = true;
										setPageActive(backPage);
										isRuning = false;
										backButton.removeEventListener('mouseup', onMouseUp);
								};

								backButton.addEventListener('mouseup', onMouseUp);
						});
				}

				var reloadButton = document.querySelector('#reload-button');
				(0, _utils.addEvent)(reloadButton, 'click', function () {

						gameManager.reloadLevel();
				});

				// General

				var renderer = new THREE.WebGLRenderer();
				var gl = renderer.getContext();

				var devicePixelRatio = window.devicePixelRatio;
				if (devicePixelRatio > 1.5) {

						devicePixelRatio = 1.5;
				}

				renderer.setPixelRatio(devicePixelRatio);
				renderer.setSize(window.innerWidth, window.innerHeight);

				var rendererElement = renderer.domElement;
				rendererElement.className = 'main-canvas';
				document.body.appendChild(rendererElement);

				var stats = new Stats();
				stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
				// document.body.appendChild( stats.dom );

				// Events

				var down = false;
				var lastPos = vec2.create();

				// Cross mouse & touch

				(0, _utils.addEvent)(rendererElement, 'click', function (event) {

						var pos = vec2.fromValues(event.clientX, event.clientY);
						gameManager.onClick(vec2.fromValues(event.clientX, event.clientY));
						lastPos = pos;
				});

				(0, _utils.addEvent)(window, 'dbclick', function (event) {

						event.preventDefault ? event.preventDefault() : event.returnValue = false;
				});

				// Mouse

				(0, _utils.addEvent)(rendererElement, 'mousedown', function (event) {

						down = true;
						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						var pos = vec2.fromValues(event.clientX, event.clientY);
						gameManager.onDown(vec2.fromValues(event.clientX, event.clientY));
						lastPos = pos;
				});

				(0, _utils.addEvent)(rendererElement, 'mouseup', function (event) {

						down = false;
						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						gameManager.onUp(lastPos);
				});

				(0, _utils.addEvent)(rendererElement, 'mousemove', function (event) {

						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						var pos = vec2.fromValues(event.clientX, event.clientY);
						gameManager.onMove(vec2.fromValues(event.clientX, event.clientY));

						if (down) {

								gameManager.onDrag(vec2.fromValues(event.clientX, event.clientY));
						}

						lastPos = pos;
				});

				// Touch

				(0, _utils.addEvent)(rendererElement, 'touchstart', function (event) {

						down = true;
						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						var pos = vec2.fromValues(event.touches[0].clientX, event.touches[0].clientY);
						gameManager.onDown(pos);
						lastPos = pos;
				});

				(0, _utils.addEvent)(rendererElement, 'touchend', function (event) {

						down = false;
						event.preventDefault ? event.preventDefault() : event.returnValue = false;

						gameManager.onUp(lastPos);
				});

				(0, _utils.addEvent)(window, 'touchmove', function (event) {

						event.preventDefault ? event.preventDefault() : event.returnValue = false;
				});

				(0, _utils.addEvent)(rendererElement, 'touchmove', function (event) {

						event.preventDefault ? event.preventDefault() : event.returnValue = false;
						var pos = vec2.fromValues(event.touches[0].clientX, event.touches[0].clientY);
						gameManager.onMove(pos);

						if (down) {

								gameManager.onDrag(pos);
						}

						lastPos = pos;
				});

				// Window events

				(0, _utils.addEvent)(window, 'resize', function () {

						gameManager.onResize();
						introScene.onResize();
				});

				// Game

				var gameManager = new _GameManager.GameManager({ renderer: renderer, soundManager: _soundManager });

				gameManager.onWin(function (levelFile) {

						(function (chapter, level) {

								var winPage = null;

								switch (chapter) {

										case 'gravity':

												winPage = document.querySelector('#gravity-end');

												break;

										case 'electric':

												winPage = document.querySelector('#electric-end');

												break;

										case 'gravity-electric':

												winPage = document.querySelector('#gravity-electric-end');

												break;

								}

								var content = winPage.querySelector('.content');
								var levelInfo = content.querySelector('.level-info');
								levelInfo.innerHTML = 'Level ' + level + ' completed!';
								var nextLevel = content.querySelector('.next-level');

								if (nextLevel) content.removeChild(nextLevel);

								var newNextLevelButton = document.createElement('div');
								newNextLevelButton.className = 'next-level';
								newNextLevelButton.innerHTML = 'Next level';
								newNextLevelButton.style.cursor = 'pointer';
								newNextLevelButton.style.zIndex = '1000';
								newNextLevelButton.style.padding = '20px';

								var nextLevelFile = _levels.levels[chapter][level] || _levels.levels[chapter][0];

								newNextLevelButton.addEventListener('mousedown', function () {

										var onMouseUp = function onMouseUp() {

												setPageActive(document.querySelector('#' + chapter + '-blank'));
												backPage = document.querySelector('#' + chapter + '-levels');;
												loadingLevelPanel.style.opacity = 1;
												loadingLevelPanel.style.pointerEvents = 'auto';

												setTimeout(function () {

														gameManager.startLevel(nextLevelFile, function () {

																isRuning = true;

																setTimeout(function () {

																		loadingLevelPanel.style.opacity = 0;
																		loadingLevelPanel.style.pointerEvents = 'none';
																}, 500);
														});
												}, 500);

												newNextLevelButton.removeEventListener('mouseup', onMouseUp);
										};

										newNextLevelButton.addEventListener('mouseup', onMouseUp);
								});

								content.appendChild(newNextLevelButton);

								setTimeout(function () {

										setPageActive(winPage);
								}, 300);
						})(levelFile.chapter, levelFile.levelIndex);
				});

				// Create intro scene

				var introScene = new _IntroScene.IntroScene({ renderer: renderer, soundManager: _soundManager });
				var mainBackgroundSound = null;
				var mainPlayerSound = _soundManager.play('Player_sound_0', { loop: -1, volume: 0 });

				// Delay all transition in order to prevent overloading the gpu.

				introScene.build(function () {

						setTimeout(function () {

								setPageUnactive(loadingPanel, function () {

										setTimeout(function () {

												// Init the intro scene and set a callback that will be fired when the players hit the target.

												introScene.initIntro(function () {

														_soundManager.play('Gong_sound_3', { volume: 0.2 });
														_soundManager.play('Gong_sound_1', { volume: 0.2 });
														_soundManager.play('Triangle_sound_1', { volume: 0.2 });
														_soundManager.play('Hit_sound_' + Math.floor(Math.random() * 5), { volume: 0.1 });
														mainBackgroundSound = _soundManager.play('Back_sound_' + Math.floor(Math.random() * 4), { loop: -1 });

														setTimeout(function () {

																// setPageActive ( document.querySelector('#gravity-end') );
																setPageActive(mainMenu);
														}, 100);
												});
										}, 100);
								});
						}, 300);
				});

				function update(_deltaTime) {

						if (isRuning) {

								gameManager.update(_deltaTime);
								mainPlayerSound.volume += (0.0 - mainPlayerSound.volume) * 0.03;
								if (mainBackgroundSound) mainBackgroundSound.volume += (0.0 - mainBackgroundSound.volume) * 0.08;
						} else {

								introScene.update();
								mainPlayerSound.volume += (0.15 - mainPlayerSound.volume) * 0.03;
								if (mainBackgroundSound) mainBackgroundSound.volume += (1.0 - mainBackgroundSound.volume) * 0.08;
						}
				}

				function render(_deltaTime) {

						if (isRuning) {

								gameManager.render(_deltaTime);
						} else {

								introScene.render();
						}
				}

				var mainLoop = loop(function (deltaTime) {

						stats.begin();

						update(deltaTime);
						render(deltaTime);

						stats.end();
				}).start();
		}

		var soundManager = new _SoundManager.SoundManager();
		soundManager.onLoad(function () {

				init(this);
				soundManager.volume(0.0);
		});
})();

},{"./GameManager":70,"./IntroScene":71,"./SoundManager":72,"./levels":74,"./resourcesList":75,"./utils":76,"raf-loop":38}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
						value: true
});

var _fixedCharges, _fixedCharges2, _fixedCharges3, _fixedCharges4;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var levels = {

						gravity: {

												0: {

																		chapter: 'gravity',
																		textIntro: '- G -\n\n1\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
																		playerDrag: 0.9855,
																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'planet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										blanding: 'NormalBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								blackMatter: {

																														elementType: 'BlackMatter',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 108,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'blackMatter',
																																										blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'blackMatterScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'blackMatterInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												1: {

																		chapter: 'gravity',
																		textIntro: '- G -\n\n2\n\nDrag on the screen to place objects along the particles stream to change its trajectory \n\nTry to direct it to the target\n\nClick to start',
																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'planet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										infoPointIndex: 16 * 7 + 3,
																																										enabled: true,
																																										position: [-2, 0, 0],
																																										radius: 4,
																																										mass: 500000,
																																										scale: [1.8, 1.8, 1.8],
																																										color: [255 / 255, 222 / 255, 40 / 255, 1],
																																										rotation: [0, 0, 0]

																																				}

																														}

																								},

																								blackMatter: {

																														elementType: 'BlackMatter',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 108,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'blackMatter',
																																										blending: 'MultiplyBlending',
																																										// blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'blackMatterScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'blackMatterInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												2: {

																		chapter: 'gravity',
																		textIntro: '- G -\n\n3\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'planet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										infoPointIndex: 16 * 7 + 5,
																																										position: [1.8, 0, 0],
																																										radius: 2,
																																										mass: 10000,
																																										scale: [0.6, 0.6, 0.6],
																																										color: [245 / 255, 30 / 255, 30 / 255, 1]

																																				},

																																				2: {

																																										infoPointIndex: 16 * 7 + 3,
																																										position: [-1.5, 1.5, 0],
																																										radius: 2,
																																										mass: 1000000,
																																										scale: [1.0, 1.0, 1.0],
																																										color: [180 / 255, 180 / 255, 180 / 255, 1]

																																				},

																																				3: {

																																										infoPointIndex: 16 * 7 + 1,
																																										position: [-1.8, -1.8, 0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [0.4, 0.4, 0.4],
																																										color: [245 / 255, 30 / 255, 30 / 255, 1]

																																				}

																														}

																								},

																								blackMatter: {

																														elementType: 'BlackMatter',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 108,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'blackMatter',
																																										blending: 'MultiplyBlending',
																																										// blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'blackMatterScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'blackMatterInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												3: {

																		chapter: 'gravity',
																		textIntro: '- G -\n\n4\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'planet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										infoPointIndex: 16 * 7 + 3,
																																										position: [0, 0, 0],
																																										radius: 2,
																																										mass: 10000,
																																										scale: [0.6, 0.6, 0.6],
																																										color: [255 / 255, 222 / 255, 40 / 255, 1]

																																				},

																																				1: {

																																										infoPointIndex: 16 * 7 + 5,
																																										position: [1.8, -1.8, 0],
																																										radius: 2,
																																										mass: 500000,
																																										scale: [1.0, 1.0, 1.0],
																																										color: [229 / 255, 36 / 255, 31 / 255, 1]

																																				},

																																				2: {

																																										infoPointIndex: 16 * 7 + 1,
																																										position: [-1.8, 1.8, 0],
																																										radius: 2,
																																										mass: 500000,
																																										scale: [1.0, 1.0, 1.0],
																																										color: [229 / 255, 36 / 255, 31 / 255, 1]

																																				}

																														}

																								},

																								blackMatter: {

																														elementType: 'BlackMatter',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 108,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'blackMatter',
																																										blending: 'MultiplyBlending',
																																										// blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'blackMatterScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'blackMatterInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												4: {

																		chapter: 'gravity',
																		textIntro: '- G -\n\n5\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'planet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										infoPointIndex: 16 * 7 + 1,
																																										position: [-2.0, 0, 0],
																																										radius: 2,
																																										mass: 600000,
																																										scale: [2.5, 2.5, 2.5],
																																										color: [229 / 255, 36 / 255, 31 / 255, 1]

																																				},

																																				1: {

																																										infoPointIndex: 16 * 7 + 5,
																																										position: [0.5, 0, 0],
																																										radius: 2,
																																										mass: 50000,
																																										scale: [0.6, 0.6, 0.6],
																																										color: [255 / 255, 222 / 255, 40 / 255, 1]

																																				}

																														}

																								},

																								blackMatter: {

																														elementType: 'BlackMatter',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 108,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'blackMatter',
																																										blending: 'MultiplyBlending',
																																										// blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'blackMatterScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'blackMatterInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												}

						},

						electric: {

												0: {

																		chapter: 'electric',
																		textIntro: '- E -\n\n1\n\nClick and drag up or down to change the attractors polarity\n\nTry to direct the particles stream to the target by adding some attractors\n\nClick to start',
																		playerDrag: 0.9855,
																		elements: {

																								fixedCharges: (_fixedCharges = {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 20,
																														renderOrder: 2,
																														drawInfos: true
																								}, _defineProperty(_fixedCharges, 'maxInstancesNum', 3), _defineProperty(_fixedCharges, 'textAlign', 'bottom'), _defineProperty(_fixedCharges, 'shaders', {

																														main: null,

																														normal: {

																																				name: 'fixedElectricCharge',
																																				blending: 'MultiplyBlending',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														scan: {

																																				name: 'fixedElectricChargeScan',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														infos: {

																																				name: 'fixedElectricChargeInfo',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														}

																								}), _defineProperty(_fixedCharges, 'instances', {

																														// 0: {

																														// 	infoPointIndex: 16 * 7 + 2,
																														// 	enabled: false,
																														// 	fixedRadius: true,
																														//                       position: [ -2, 0, 0 ],
																														//                       radius: 0,
																														//                       targetRadius: 0.5,
																														//                       sign: -1,
																														//                       mass: 500000,
																														//                       rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

																														//                   },

																														//                   1: {

																														// 	infoPointIndex: 16 * 7 + 4,
																														// 	enabled: false,
																														// 	fixedRadius: true,
																														//                       position: [ 2, 0, 0 ],
																														//                       radius: 0,
																														//                       targetRadius: 0.5,
																														//                       sign: 1,
																														//                       mass: 500000,
																														//                       rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

																														//                   },

																								}), _fixedCharges),

																								charges: {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 20,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										transparent: true,
																																										blending: 'MultiplyBlending',
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricChargeScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricChargeInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 2,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												1: {

																		chapter: 'electric',
																		textIntro: '- E -\n\n2\n\nClick and drag up or down to change the attractors polarity and balace the forces emittet by the static attractors\n\nTry to direct the particles stream to the target\n\nClick to start',

																		elements: {

																								fixedCharges: (_fixedCharges2 = {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 1,
																														renderOrder: 2,
																														drawInfos: true
																								}, _defineProperty(_fixedCharges2, 'maxInstancesNum', 3), _defineProperty(_fixedCharges2, 'textAlign', 'bottom'), _defineProperty(_fixedCharges2, 'shaders', {

																														main: null,

																														normal: {

																																				name: 'fixedElectricCharge',
																																				blending: 'MultiplyBlending',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														scan: {

																																				name: 'fixedElectricChargeScan',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														infos: {

																																				name: 'fixedElectricChargeInfo',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														}

																								}), _defineProperty(_fixedCharges2, 'instances', {

																														0: {

																																				infoPointIndex: 16 * 7 + 3,
																																				enabled: false,
																																				position: [0, 0, 0],
																																				radius: 0,
																																				targetRadius: 0.6,
																																				sign: 1,
																																				mass: 500000,
																																				rotation: [0, 0, Math.random() * Math.PI * 2]

																														}

																								}), _fixedCharges2),

																								charges: {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 20,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										transparent: true,
																																										blending: 'MultiplyBlending',
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricChargeScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricChargeInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 2,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: null,

																																				infos: null

																														},

																														instances: {}

																								}

																		}

												},

												2: {

																		chapter: 'electric',
																		textIntro: '- E -\n\n3\n\nClick and drag up or down to change the attractors polarity\n\nTry to direct the particles stream to the target and avoid obstacles\n\nClick to start',

																		elements: {

																								fixedCharges: {

																														elementType: 'ElectricParticle',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 1,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'fixedElectricCharge',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: null,

																																				infos: null

																														},

																														instances: {

																																				1: {

																																										infoPointIndex: 19 * 7 + 3,
																																										hack: true,
																																										position: [-100, -100, 0.0],
																																										radius: 2,
																																										mass: 0,
																																										scale: [1.0, 0.12, 0.1],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				}

																														}

																								},

																								charges: {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 20,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										transparent: true,
																																										blending: 'MultiplyBlending',
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricChargeScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricChargeInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 2,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										position: [0.63, 0, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.012, 0.12, 0.1],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				},

																																				2: {

																																										position: [-0.63, 0, 0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.012, 0.12, 0.6],
																																										rotation: [0, 0, Math.PI * 0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				}

																														}

																								}

																		}

												},

												3: {

																		chapter: 'electric',
																		textIntro: '- E -\n\n4\n\nClick and drag up or down to change the attractors polarity and balace the forces emittet by the static attractors\n\nTry to direct the particles stream to the target and avoid obstacles\n\nClick to start',

																		elements: {

																								fixedCharges: (_fixedCharges3 = {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 1,
																														renderOrder: 2,
																														drawInfos: true
																								}, _defineProperty(_fixedCharges3, 'maxInstancesNum', 3), _defineProperty(_fixedCharges3, 'textAlign', 'bottom'), _defineProperty(_fixedCharges3, 'shaders', {

																														main: null,

																														normal: {

																																				name: 'fixedElectricCharge',
																																				blending: 'MultiplyBlending',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														scan: {

																																				name: 'fixedElectricChargeScan',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														infos: {

																																				name: 'fixedElectricChargeInfo',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														}
																								}), _defineProperty(_fixedCharges3, 'instances', {

																														0: {

																																				infoPointIndex: 16 * 7 + 3,
																																				enabled: false,
																																				position: [0, 0, 0],
																																				radius: 0,
																																				targetRadius: 0.6,
																																				sign: -1,
																																				mass: 500000,
																																				rotation: [0, 0, Math.random() * Math.PI * 2]

																														}

																								}), _fixedCharges3),

																								charges: {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 20,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										transparent: true,
																																										blending: 'MultiplyBlending',
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricChargeScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricChargeInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 4,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										position: [0, -1, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.0, 0.12, 0.1],
																																										rotation: [0, 0, 0],
																																										color: [0.9, 0.9, 0.9, 1]

																																				},

																																				2: {

																																										position: [0, 1, 0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [0.5, 0.12, 0.6],
																																										rotation: [0, 0, 0],
																																										color: [0.9, 0.9, 0.9, 1]

																																				}

																														}

																								}

																		}

												},

												4: {

																		chapter: 'electric',
																		textIntro: '- E -\n\n5\n\nClick and drag up or down to change the attractors polarity\n\nTry to direct the particles stream to the target and avoid obstacles\n\nClick to start',

																		elements: {

																								charges: {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 20,
																														renderOrder: 3,
																														drawInfos: true,
																														mainInfoPointIndex: 3, // 0 - 8

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										transparent: true,
																																										blending: 'MultiplyBlending',
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricChargeScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricChargeInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								fixedCharges: (_fixedCharges4 = {

																														elementType: 'ElectricParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 1,
																														renderOrder: 2,
																														drawInfos: true
																								}, _defineProperty(_fixedCharges4, 'maxInstancesNum', 1), _defineProperty(_fixedCharges4, 'textAlign', 'bottom'), _defineProperty(_fixedCharges4, 'shaders', {

																														main: null,

																														normal: {

																																				name: 'fixedElectricCharge',
																																				blending: 'MultiplyBlending',
																																				transparent: true,
																																				textureUrl: './resources/textures/generic_circle_sdf.png',
																																				uniforms: {}

																														},

																														scan: null,

																														infos: null
																								}), _defineProperty(_fixedCharges4, 'instances', {

																														0: {

																																				hack: true,
																																				infoPointIndex: 19 * 7 + 3,
																																				enabled: true,
																																				position: [-100, -100, 0],
																																				radius: 0,
																																				targetRadius: 0.6,
																																				sign: -1,
																																				mass: 0,
																																				rotation: [0, 0, Math.random() * Math.PI * 2]

																														}

																								}), _fixedCharges4),

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 4,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										position: [2, -2, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [2.0, 0.12, 0.1],
																																										rotation: [0, 0, 0],
																																										color: [0.7, 0.7, 0.7, 1]

																																				},

																																				2: {

																																										position: [2, 2, 0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [2.0, 0.12, 0.6],
																																										rotation: [0, 0, 0],
																																										color: [0.7, 0.7, 0.7, 1]

																																				},

																																				3: {

																																										position: [-2, -2, 0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [2.5, 0.12, 0.6],
																																										rotation: [0, 0, Math.PI * 0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				},

																																				4: {

																																										position: [-2, 2, 0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [2.5, 0.12, 0.6],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				}

																														}

																								}

																		}

												}

						},

						'gravity-electric': {

												0: {

																		chapter: 'gravity-electric',
																		textIntro: '- G & E -\n\n1\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',

																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 2,
																																										particles: [1, 3, 6, 12],
																																										position: [-2, 0, 0],
																																										radius: 4,
																																										mass: 10000,
																																										scale: [1.3, 1.3, 1.3],
																																										color: [0.8, 0.8, 0.8, 1],
																																										charge: 25

																																				},

																																				1: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 4,
																																										particles: [1, 3, 6, 12],
																																										position: [2, 0, 0],
																																										radius: 3.5,
																																										mass: 10000,
																																										scale: [1.3, 1.3, 1.3],
																																										color: [0.8, 0.8, 0.8, 1]

																																				}

																														}

																								},

																								charges: {

																														elementType: 'ElectricPlanetParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 200,
																														renderOrder: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricParticlePlanetScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricParticlePlanetInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												1: {

																		chapter: 'gravity-electric',
																		textIntro: '- G & E -\n\n2\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',

																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 3,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 4,
																																										particles: [1, 3, 6, 12, 12],
																																										position: [2, 0, 0],
																																										radius: 3.5,
																																										mass: 1000000,
																																										scale: [1.8, 1.8, 1.8],
																																										color: [0.8, 0.8, 0.8, 1]

																																				}

																														}

																								},

																								charges: {

																														elementType: 'ElectricPlanetParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 200,
																														renderOrder: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricParticlePlanetScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricParticlePlanetInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								}

																		}

												},

												2: {

																		chapter: 'gravity-electric',
																		textIntro: '- G & E -\n\n3\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',

																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 4,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 1,
																																										particles: [1, 3, 6, 7],
																																										position: [-2, -2, 0],
																																										radius: 3.5,
																																										mass: 10000,
																																										charge: 10,
																																										sign: -1,
																																										scale: [1, 1, 1],
																																										color: [0.8, 0.8, 0.8, 1]

																																				},

																																				1: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 2,
																																										particles: [1, 3, 6, 16],
																																										position: [-2, 2, 0],
																																										radius: 3.5,
																																										mass: 1000000,
																																										charge: 25,
																																										scale: [1.4, 1.4, 1.4],
																																										color: [0.8, 0.8, 0.8, 1]

																																				}

																														}

																								},

																								charges: {

																														elementType: 'ElectricPlanetParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 150,
																														renderOrder: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricParticlePlanetScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricParticlePlanetInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 2,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										position: [-2, 0, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [2.5, 0.12, 0.1],
																																										rotation: [0, 0, 0],
																																										color: [0.7, 0.7, 0.7, 1]

																																				}

																														}

																								}

																		}

												},

												3: {

																		chapter: 'gravity-electric',
																		textIntro: '- G & E -\n\n4\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',

																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 4,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 4,
																																										particles: [1, 3, 6, 7],
																																										position: [2, -2, 0],
																																										radius: 3.5,
																																										mass: 10000,
																																										charge: 15,
																																										maxCharge: 30,
																																										sign: -1,
																																										scale: [1, 1, 1],
																																										color: [0.8, 0.8, 0.8, 1]

																																				},

																																				1: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 2,
																																										particles: [1, 3, 6, 7],
																																										position: [-2, 2, 0],
																																										radius: 3.5,
																																										mass: 1000000,
																																										charge: 25,
																																										sign: -1,
																																										scale: [1, 1, 1],
																																										color: [0.8, 0.8, 0.8, 1]

																																				}

																														}

																								},

																								charges: {

																														elementType: 'ElectricPlanetParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 150,
																														renderOrder: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricParticlePlanetScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricParticlePlanetInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 2,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										position: [1, 1, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.4, 0.12, 0.1],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				},

																																				2: {

																																										position: [-1, -1, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.4, 0.12, 0.1],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				}

																														}

																								}

																		}

												},

												4: {

																		chapter: 'gravity-electric',
																		textIntro: '- G & E -\n\n5\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',

																		elements: {

																								planets: {

																														elementType: 'Planet',
																														static: true,
																														manualMode: false,
																														transparent: true,
																														renderOrder: 1,
																														buildFromInstances: true,
																														drawInfos: true,
																														maxInstancesNum: 4,
																														textAlign: 'bottom',

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'scanPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'infoPlanet',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				0: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 4,
																																										particles: [1, 3, 6, 7],
																																										position: [2, -2, 0],
																																										radius: 3.5,
																																										mass: 10000,
																																										charge: 15,
																																										maxCharge: 30,
																																										sign: -1,
																																										scale: [1, 1, 1],
																																										color: [0.8, 0.8, 0.8, 1]

																																				},

																																				1: {

																																										name: 'electricPlanet',
																																										infoPointIndex: 16 * 7 + 2,
																																										particles: [1, 3, 6, 7],
																																										position: [-2, 2, 0],
																																										radius: 3.5,
																																										mass: 1000000,
																																										charge: 25,
																																										sign: -1,
																																										scale: [1, 1, 1],
																																										color: [0.8, 0.8, 0.8, 1]

																																				}

																														}

																								},

																								charges: {

																														elementType: 'ElectricPlanetParticle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 150,
																														renderOrder: 3,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'electricCharge',
																																										blending: 'MultiplyBlending',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'electricParticlePlanetScan',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'electricParticlePlanetInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_circle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {}

																								},

																								obstacles: {

																														elementType: 'Obstacle',
																														static: false,
																														manualMode: false,
																														transparent: true,
																														individual: false,
																														maxInstancesNum: 2,
																														buildFromInstances: true,
																														renderOrder: 2,

																														shaders: {

																																				main: null,

																																				normal: {

																																										name: 'obstacle',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				},

																																				scan: {

																																										name: 'obstacleScan',
																																										transparent: true,
																																										uniforms: {}

																																				},

																																				infos: {

																																										name: 'obstacleInfo',
																																										transparent: true,
																																										textureUrl: './resources/textures/generic_obstacle_sdf.png',
																																										uniforms: {}

																																				}

																														},

																														instances: {

																																				1: {

																																										position: [1, 1, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.4, 0.12, 0.1],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				},

																																				2: {

																																										position: [-1, -1, 0.0],
																																										radius: 2,
																																										mass: 100000,
																																										scale: [1.4, 0.12, 0.1],
																																										rotation: [0, 0, Math.PI * -0.25],
																																										color: [0.7, 0.7, 0.7, 1]

																																				}

																														}

																								}

																		}

												}

						}

};

exports.levels = levels;

},{}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var resourcesList = {

	generic_circle: {

		type: 'img',
		url: './resources/textures/generic_circle_sdf.png'

	},

	generic_obstacle: {

		type: 'img',
		url: './resources/textures/generic_obstacle_sdf.png'

	},

	generic_player: {

		type: 'img',
		url: './resources/textures/generic_player_sdf.png'

	},

	smoke: {

		type: 'img',
		url: './resources/textures/smoke.png'

	},

	smoke_2: {

		type: 'img',
		url: './resources/textures/smoke_2.png'

	}

};

exports.resourcesList = resourcesList;

},{}],76:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.addEvent = addEvent;
exports.removeEvent = removeEvent;
exports.ajax = ajax;
exports.guid = guid;
exports.hslToRgb = hslToRgb;
exports.getColorFromVertices = getColorFromVertices;
exports.getColorsFromVertices = getColorsFromVertices;
exports.clamp = clamp;
exports.contains = contains;
exports.Float32Concat = Float32Concat;
exports.clone = clone;
function addEvent(elem, event, fn) {

    // avoid memory overhead of new anonymous functions for every event handler that's installed
    // by using local functions

    function listenHandler(e) {

        var ret = fn.apply(this, arguments);

        if (ret === false) {

            e.stopPropagation();
            e.preventDefault();
        }

        return ret;
    }

    function attachHandler() {

        // set the this pointer same as addEventListener when fn is called
        // and make sure the event is passed to the fn also so that works the same too

        var ret = fn.call(elem, window.event);

        if (ret === false) {

            window.event.returnValue = false;
            window.event.cancelBubble = true;
        }

        return ret;
    }

    if (elem.addEventListener) {

        elem.addEventListener(event, listenHandler, true);
        return { elem: elem, handler: listenHandler, event: event };
    } else {

        elem.attachEvent("on" + event, attachHandler);
        return { elem: elem, handler: attachHandler, event: event };
    }
}

function removeEvent(token) {

    if (token.elem.removeEventListener) {

        token.elem.removeEventListener(token.event, token.handler, true);
    } else {

        token.elem.detachEvent("on" + token.event, token.handler);
    }
}

function ajax(_url, _callback) {

    var request = new XMLHttpRequest();
    request.open('GET', _url, true);
    request.onload = function () {

        if (request.status < 200 || request.status > 299) {

            _callback('Error: Http status' + request.status + ' on resource ' + _url);
        } else {

            _callback(null, request);
        }
    };

    request.send();
}

function guid() {

    function s4() {

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function hslToRgb(h, s, l) {

    var r, g, b;

    if (s == 0) {

        r = g = b = l; // achromatic
    } else {

        var hue2rgb = function hue2rgb(p, q, t) {

            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
}

function getColorFromVertices(_vertices, _color) {

    var colors = [];

    for (var i = 0; i < _vertices.length; i += 3) {

        colors.push(_color[0]);
        colors.push(_color[1]);
        colors.push(_color[2]);
        colors.push(_color[3]);
    }

    return colors;
}

function getColorsFromVertices(_vertices, _colors) {

    var colors = [];

    for (var i = 0; i < _vertices.length; i += 3) {

        var randomIndexColor = Math.floor(Math.random() * _colors.length);

        var l = (Math.random() - 0.5) * 0.1;

        colors.push(_colors[randomIndexColor][0] + l);
        colors.push(_colors[randomIndexColor][1] + l);
        colors.push(_colors[randomIndexColor][2] + l);
        colors.push(_colors[randomIndexColor][3]);
    }

    return colors;
}

function clamp(val, min, max) {

    return Math.min(Math.max(val, min), max);
};

function contains(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function indexOf(needle) {
            var i = -1,
                index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if (findNaN && item !== item || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function Float32Concat(first, second) {

    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != (typeof obj === "undefined" ? "undefined" : _typeof(obj))) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

},{}]},{},[73]);
