"use strict";

var Buffer = require("buffer").Buffer;
var SlowBuffer = require("buffer").SlowBuffer;

module.exports = bufferEq;

function bufferEq(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  var c = 0;
  for (var i = 0; i < a.length; i++) {
    c |= a[i] ^ b[i];
  }

  return c === 0;
}

var origBufEqual = Buffer.prototype.equal;
var origSlowBufEqual = SlowBuffer && SlowBuffer.prototype.equal;

bufferEq.install = function install() {
  Buffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };

  if (SlowBuffer) {
    SlowBuffer.prototype.equal = Buffer.prototype.equal;
  }
};

bufferEq.restore = function restore() {
  Buffer.prototype.equal = origBufEqual;

  if (SlowBuffer) {
    SlowBuffer.prototype.equal = origSlowBufEqual;
  }
};
