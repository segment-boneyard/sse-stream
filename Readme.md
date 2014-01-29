
# sse-stream

  A [Server-Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/) transform stream.

  [![build status](https://secure.travis-ci.org/segmentio/sse-stream.png)](http://travis-ci.org/segmentio/sse-stream)

## Installation

```bash
$ npm install segmentio/sse-stream
```

## Example

  Transform a random object stream into sse format and stream it over http:

```js
var http = require('http');
var sse = require('sse-stream');
var Readable = require('stream').Readable;

http.createServer(function(req, res){
  objectStream().pipe(sse()).pipe(res);
}).listen(3000);

function objectStream(){
  var stream = new Readable({ objectMode: true });
  var i = 0;
  stream._read = function(){
    this.push({
      foo: ++i
    });
    if (i == 3) this.push(null);
  }
  return stream;
}
```

```bash
$ curl http://localhost:3000
data: {"foo":1}

data: {"foo":2}

data: {"foo":3}

$
```

## API

### sse(opts)

  Create a new stream that transforms data into the server-sent events format. It accepts (multiline) strings, numbers, buffers and objects as inputs. `error` events are emitted when functions or circular object structures are written to it.

  Options:

  - `retry:number` How many milliseconds the browser should wait in between reconnects

## License

  MIT.
