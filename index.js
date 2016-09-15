var Directory = require('native-readdir')
var Readable = require('readable-stream').Readable
var inherits = require('util').inherits

module.exports = ReaddirStream

function ReaddirStream (path) {
  if (!(this instanceof ReaddirStream)) {
    return new ReaddirStream(path)
  }

  var self = this
  self._directory = new Directory(path)
  self._directory.open(function (error) {
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

inherits(ReaddirStream, Readable)

ReaddirStream.prototype._read = function () {
  var self = this
  if (self.opened) {
    self._readEntries()
  } else {
    self.once('opened', function () {
      self._readEntries()
    })
  }
}

ReaddirStream.prototype._readEntries = function () {
  var self = this
  self._directory.read(function (error, entry) {
    if (error) {
      self.emit('error', error)
      self._close()
    } else {
      if (entry === null) {
        self.push(null)
        self._close()
      } else {
        var keepPushing = self.push(entry)
        if (keepPushing) {
          self._readEntries() // Recurse.
        }
      }
    }
  })
}

ReaddirStream.prototype._close = function () {
  var self = this
  self._directory.close(function (error) {
    if (error) {
      self.emit('error', error)
    }
  })
}
