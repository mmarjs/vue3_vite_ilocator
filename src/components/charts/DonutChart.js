import * as d3 from 'd3';

//
// Main function to draw the chart
// Implementation is based on Observable DonutChart function
// Source: https://observablehq.com/@d3/donut-chart
//

export const DonutChart = (id, data, {
  name = ([x]) => x,  // given d in data, returns the (ordinal) label
  value = ([, y]) => y, // given d in data, returns the (quantitative) value
  title, // given d in data, returns the title text
  width = 100, // outer width, in pixels
  height = 100, // outer height, in pixels
  innerRadius = Math.min(width, height) / 2.6, // inner radius of pie, in pixels (non-zero for donut)
  outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
  labelRadius = (innerRadius + outerRadius) / 2, // center radius of labels
  format = ',', // a format specifier for values (in the label)
  names, // array of names (the domain of the color scale)
  colors, // array of colors for names
  stroke = 'none', // innerRadius > 0 ? 'none' : 'white' | stroke separating widths
  strokeWidth = 0, // width of stroke separating wedges
  strokeLinejoin = 'round', // line join of stroke separating wedges
  padAngle = stroke === 'none' ? 1 / outerRadius : 0, // angular separation between wedges
} = {}) => {
  // Compute values.
  const N = d3.map(data, name);
  const V = d3.map(data, value);
  const I = d3.range(N.length).filter(i => !isNaN(V[i]));

  // Unique the names.
  if (names === undefined) names = N;
  names = new d3.InternSet(names);

  // Chose a default color scheme based on cardinality.
  if (colors === undefined) colors = d3.schemeSpectral[names.size];
  if (colors === undefined) colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);

  // Construct scales.
  const color = d3.scaleOrdinal(names, colors);

  // Compute titles.
  if (title === undefined) {
    const formatValue = d3.format(format);
    title = i => `${N[i]}\n${formatValue(V[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }

  // Construct arcs.
  const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
  
  // Create svg
  const svg = d3.select(`#${id}`)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

  // Arcs
  svg.append('g')
    .attr('stroke', stroke)
    .attr('stroke-width', strokeWidth)
    .attr('stroke-linejoin', strokeLinejoin)
    .selectAll('path')
    .data(arcs)
    .join('path')
    .attr('fill', d => color(N[d.data]))
    .attr('d', arc);

  // Total value
  svg.append('g')
    .append('text')
    .text(d3.sum(V))
    .attr('text-anchor', 'middle')
    .attr('class', 'text-body-2');

  // Total title
  svg.append('g')
    .append('text')
    .text('Total')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.25em')
    .attr('class', 'text-caption');

  //return Object.assign(svg.node(), {scales: {color}});
}

