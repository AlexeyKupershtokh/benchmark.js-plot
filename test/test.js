var Benchmark = require('benchmark');
var plot = require('..').plot;


var options = { maxTime: 1 }

// add tests
var suite = new Benchmark.Suite
suite.add('RegExp#test', function() {
  /o/.test('Hello World!');
}, options)
.add('String#indexOf', function() {
  'Hello World!'.indexOf('o') > -1;
}, options)
.add('String#match', function() {
  !!'Hello World!'.match(/o/);
}, options)
//.setOptions(options)
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  plot(this, { path: 'out.png' });
})
.run();
