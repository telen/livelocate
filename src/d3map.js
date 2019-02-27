/* global $ */

import * as d3 from 'd3';

const width = window.innerWidth;
const height = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;

const projection = d3.geo.mercator()
  .scale(800)
  .translate([(0.7 * width - 1686), (width === height ? 1119 : 960)]);

const path = d3.geo.path()
  .projection(projection);

const zoom = d3.behavior.zoom()
  .translate(projection.translate())
  .scale(projection.scale())
  .scaleExtent([800, 11 * height])
  .on('zoom', zoomed);

const svg = d3.select('#graph').append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g')
  .call(zoom);

g.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height);


d3.json('../geomapdata/china.json', (error, china) => {
  if (error) throw error;

  g.append('g')
    .attr('id', 'states')
    .selectAll('path')
    .data(china.features)
    .enter()
    .append('path')
    .attr('d', path);
});


// function clicked(d) {
//     var centroid = path.centroid(d),
//         translate = projection.translate();

//     projection.translate([
//         translate[0] - centroid[0] + width / 2,
//         translate[1] - centroid[1] + height / 2
//     ]);

//     zoom.translate(projection.translate());

//     g.selectAll("path").transition()
//         .duration(700)
//         .attr("d", path);
// }

function zoomed() {
  projection.translate(d3.event.translate).scale(d3.event.scale);
  g.selectAll('path').attr('d', path);
  $(g).trigger('zoom');
  // console.log(cnt++, d3.event.translate, d3.event.scale, window.innerWidth);
}

// g.on('mousemove', function() {
//     console.log(d3.mouse(this), projection.invert(d3.mouse(this)));
// });

export default {
  projection,
  svg,
  g,
};
// --endof d3map--
