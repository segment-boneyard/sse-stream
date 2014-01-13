var http = require('http');
var sse = require('./');
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
