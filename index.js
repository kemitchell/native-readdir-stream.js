var NativeStream = require('native-readdir')
var Readable = require('readable-stream').Readable
var inherits = require('util').inherits

module.exports = NativeReaddirStream

function NativeReaddirStream (path) {
  if (!(this instanceof NativeReaddirStream)) {
    return new NativeReaddirStream(path)
  }

  var self = this
  self._nativeStream = new NativeStream(path)
  self._nativeStream.open(function (error) {
    if (error) {
      self.emit('error', error)
    } else {
      self._opened = true
      self.emit('opened')
    }
  })

  Readable.call(this, {
    objectMode: true
  })
}

inherits(NativeReaddirStream, Readable)

NativeReaddirStream.prototype._read = function () {
  var self = this
  if (self._opened) {
    self._readEntry()
  } else {
    self.once('opened', function () {
      self._readEntry()
    })
  }
}

NativeReaddirStream.prototype._readEntry = function () {
  var self = this
  self._nativeStream.read(function (error, entry) {
    if (error) {
      self.emit('error', error)
      self._closeNativeStream()
    } else {
      if (entry === null) {
        self.push(null)
        self._closeNativeStream()
      } else {
        self.push(entry)
      }
    }
  })
}

NativeReaddirStream.prototype._closeNativeStream = function () {
  var self = this
  self._nativeStream.close(function (error) {
    if (error) {
      self.emit('error', error)
    }
  })
}
