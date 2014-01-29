var assert = require('assert');
var sse = require('..');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

describe('sse', function(){
  it('should add data: to strings', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push('foo');
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      assert.equal(chunk, 'data: foo\n\n');
      done()
    };
    
    read.pipe(sse()).pipe(write);
  });
  
  it('should pass through numbers', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push(3);
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      assert.equal(chunk, 'data: 3\n\n');
      done()
    };
    
    read.pipe(sse()).pipe(write);
  });
  
  it('should fail on functions', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push(function(){});
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      done(new Error);
    };
    
    var stream = sse();
    stream.on('error', function(err){
      done();
    });
    
    read.pipe(stream).pipe(write);
  });
  
  it('should stringify buffers', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push(new Buffer('foo'));
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      assert.equal(chunk, 'data: foo\n\n');
      done()
    };
    
    read.pipe(sse()).pipe(write);
  });
  
  it('should stringify objects', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push({ foo: 'bar' });
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      assert.equal(chunk, 'data: {"foo":"bar"}\n\n');
      done()
    };
    
    read.pipe(sse()).pipe(write);
  });
  
  it('should fail on circular structures', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      var o = {};
      o.o = o;
      this.push(o);
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      done(new Error);
    };
    
    var stream = sse();
    stream.on('error', function(err){
      done();
    });
    
    read.pipe(stream).pipe(write);
  });
  
  it('should handle new lines', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push('foo\nbar');
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    write._write = function(chunk){
      assert.equal(chunk, 'data: foo\ndata: bar\n\n');
      done()
    };
    
    read.pipe(sse()).pipe(write);
  });
  
  it('should send retry header', function(done){
    var read = new Readable({ objectMode: true });
    read._read = function(){
      this.push('foo\nbar');
      this.push(null);
    };
    
    var write = new Writable({ objectMode: true });
    var first = true;
    write._write = function(chunk, _, cb){
      if (first) {
        assert.equal(chunk, 'retry: 5000\n');
        first = false;
      } else {
        assert.equal(chunk, 'data: foo\ndata: bar\n\n');
        done();
      }
      cb();
    };
    
    read.pipe(sse({ retry: 5000 })).pipe(write);
  });
});