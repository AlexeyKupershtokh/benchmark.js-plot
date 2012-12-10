
/**
 * Module dependencies.
 */

var Benchmark = require('benchmark')
  , Canvas = require('canvas')
  , fs = require('fs');

/**
 * Library version.
 */

exports.version = '0.1.0';

/**
 * Default color map.
 */

exports.colors = {
    'background': '#FFFFFF'
  , 'chart.background': '#e8eef6'
  , 'chart.bar.background': '#8da7d2'
  , 'chart.bar.highlight': '#99B1D8'
  , 'chart.border': '#eee'
  , 'chart.label.font': '12px Helvetica'
  , 'chart.label.color': '#888'
  , 'chart.label.highlight': '#C3D4EE'
};

/**
 * Options:
 *
 *   - `path`  png output path defaulting to "./out.png"
 *   - `size`  canvas size (height) defaulting to 400 
 *
 * @param {Object} data
 * @param {Object} options
 * @api public
 */
module.exports.plot = function(suite, options) {
  var options = options || {}
    , path = options.path || 'out.png'
    , size = options.size || 400;

  var data = {};
  suite.forEach(function(bench) {
    //console.log(bench);
    var hz = bench.hz;
    data[bench.name] = hz.toFixed(hz < 100 ? 2 : 0);
    //return bench;
  });

  var canvas = render(data, size);
  fs.writeFile(path, canvas.toBuffer());
}

function pad(str, width) {
  return Array(width - str.length).join(' ') + str;
}

/**
 * Return the ops/s sorted descending.
 *
 * @param {Object} data
 * @return {Number}
 * @api private
 */

function sort(data) {
  return Object.keys(data).map(function(key){
    return data[key];
  }).sort(function(a, b){
    return b - a;
  });
}

/**
 * Humanize the given `n`.
 *
 * @param {Number} n
 * @return {String}
 * @api private
 */

function humanize(n) {
  var n = String(n).split('.')
  n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return n.join('.')
}

/**
 * Render the given benchmark `data` with
 * the given canvas `size`.
 *
 * @param {Object} data
 * @param {Number} size
 * @api private
 */

function render(data, size) {
  var keys = Object.keys(data)
    , len = keys.length
    , ops = sort(data)
    , high = ops[0]
    , low = ops[ops.length - 1]
    , pad = 40
    , bw = 80
    , bp = 10.5
    , canvas = new Canvas(pad * 2 + (bw + bp)  * len - bp, size)
    , ctx = canvas.getContext('2d')
    , w = canvas.width
    , h = canvas.height;

  // background
  ctx.fillStyle = exports.colors['background'];
  ctx.fillRect(0, 0, w, h);

  // border
  ctx.strokeStyle = exports.colors['chart.border'];
  ctx.strokeRect(pad + .5, pad + .5, w - pad * 2, h - pad * 2);

  // chart background
  ctx.fillStyle = exports.colors['chart.background'];
  ctx.fillRect(pad + 2, pad + 2, w - pad * 2 - 3, h - pad * 2 - 3);

  // bars
  var x = pad
    , max = size - pad * 2 - pad / 2
    , n = 0;
  keys.forEach(function(key){
    n++;
    var ops = data[key]
      , bh = max * (ops / high)
      , bx = x + bp
      , by = h - pad - bh - bp;

    // highlights
    ctx.strokeStyle = exports.colors['chart.bar.highlight'];
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    ctx.moveTo(bx + 1, by);
    ctx.lineTo(bx + 1, by + bh);
    ctx.stroke();

    // bar
    ctx.fillStyle = exports.colors['chart.bar.background'];
    ctx.fillRect(bx, by + 1, bw, bh);

    // ops/s label
    ctx.font = exports.colors['chart.label.font'];
    ctx.fillStyle = exports.colors['chart.label.highlight'];
    ops = humanize(ops);
    var width = ctx.measureText(ops).width;
    ctx.fillText(ops, bx + bw / 2 - width / 2, (bh < 25) ? by - 5 : by + 14);

    // label
    ctx.fillStyle = exports.colors['chart.label.color'];
    var width = ctx.measureText(key).width
      , em = ctx.measureText('M').width;
    ctx.fillText(key, bx + bw / 2 - width / 2, h - pad / 2 + ((n % 2 == 0) * 1.4 - 0.7) * em);

    x += bw + 1.5;
  });

  return canvas;
}