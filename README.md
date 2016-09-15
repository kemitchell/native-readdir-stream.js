```javascript
var Reader = require('native-readdir-stream')
var fs = require('fs')
var path = require('path')
var assert = require('assert')

// Create a directory.
var directory = '/tmp/example-' + new Date().toISOString()
fs.mkdirSync(directory)

// Write some files in it.
fs.writeFileSync(path.join(directory, 'a'), 'Apple')
fs.writeFileSync(path.join(directory, 'b'), 'Banana')

// Create a readdir object.  Unfortunately, this object encapsulates
// magic:  The POSIX `DIR` pointer from `opendir(3)`.
var entries = []
new Reader(directory)
.on('data', function (entry) {
  entries.push(entry)
})
.once('end', function () {
  assert.deepEqual(entries.sort(), ['.', '..', 'a', 'b'])
})
```
