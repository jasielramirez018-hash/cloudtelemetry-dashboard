(function () {
  'use strict';
  function clamp(n) { return Math.max(0, Math.min(100, n)); }
  function smoothPath(points) {
    var d = 'M' + points[0][0] + ',' + points[0][1];
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i - 1] || points[i];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6;
      var c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
      var c2x = p2[0] - (p3[0] - p1[0]) / 6;
      var c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
      d += ' C' + c1x.toFixed(2) + ',' + c1y.toFixed(2) + ' ' +
           c2x.toFixed(2) + ',' + c2y.toFixed(2) + ' ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2);
    }
    return d;
  }

  function pointsOf(series) {
    var step = 100 / (series.length - 1);
    return series.map(function (v, i) { return [i * step, 100 - v]; });
  }

  function draw(svg) {
    var series = svg.getAttribute('data-series').split(',').map(Number);
    var pts = pointsOf(series);
    var line = smoothPath(pts);
    svg.querySelector('.chart-line').setAttribute('d', line);
    svg.querySelector('.chart-area').setAttribute('d', line + ' L100,100 L0,100 Z');
    var plot = svg.parentElement;
    var markers = plot.querySelectorAll('.chart-marker[data-index]');
    for (var i = 0; i < markers.length; i++) {
      var p = pts[Number(markers[i].getAttribute('data-index'))];
      if (!p) continue;
      markers[i].style.setProperty('--x', p[0] + '%');
      markers[i].style.setProperty('--y', p[1] + '%');
    }
  }

  document.querySelectorAll('svg[data-series]').forEach(draw);
})();
