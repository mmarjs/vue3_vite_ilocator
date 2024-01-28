import { ref, computed, onMounted} from 'vue';
import * as d3 from 'd3';


//
// Main function to draw the chart
// Implementation is based on Observable LineChart function
// Source: https://observablehq.com/@d3/line-with-tooltip
//

export const LineChart = (id, data, {
  x = ([x]) => x, // given d in data, returns the (temporal) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  z = () => 1, // given d in data, returns the (categorical) z-value
  defined, // for gaps in data
  curve = d3.curveLinear, // method of interpolation between points
  marginTop = 30, // top margin, in pixels
  marginRight = 20, // right margin, in pixels
  marginBottom = 70, // bottom margin, in pixels
  marginLeft = 20, // left margin, in pixels
  width = 400, // outer width, in pixels
  height = 280, // outer height, in pixels
  xType = d3.scaleUtc, // type of x-scale |
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = d3.scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  zDomain, // array of z-values
  colors = d3.schemeCategory10, // stroke color of line, as a constant or a function of *z*
  strokeLinecap = 'round', // stroke line cap of line
  strokeLinejoin = 'round', // stroke line join of line
  strokeWidth = 2, // stroke width of line
  strokeOpacity, // stroke opacity of line
  mixBlendMode = 'multiply', // blend mode of lines
} = {}) => {

  // Compute values.
  const X = d3.map(data, x).map(d => new Date(d));
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);
  const O = d3.map(data, d => d);
  if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
  const D = d3.map(data, defined);

  // Compute default domains, and unique the z-domain.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = [0, d3.max(Y, d => typeof d === 'string' ? +d : d)];
  if (zDomain === undefined) zDomain = Z;
  zDomain = new d3.InternSet(zDomain);

  // Omit any data not present in the z-domain.
  const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const color = d3.scaleOrdinal(zDomain, colors);
  const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

  // Construct a line generator.
  const line = d3.line()
    .defined(i => D[i])
    .curve(curve)
    .x(i => xScale(X[i]))
    .y(i => yScale(Y[i]));

  // Create SVG.
  const svg = d3.select(`#${id}`)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
    .style('-webkit-tap-highlight-color', 'transparent')
    .style('overflow', 'visible')
    .on('pointerenter pointermove', pointermoved)
    .on('pointerleave', pointerleft)
    .on('touchstart', event => event.preventDefault());

  // Add X axis
  svg.append('g')
    .call(xAxis)
    .attr('transform', `translate(0,${height - marginBottom})`)
    .attr('class', 'text-body-2')
    // Ticks
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line')
      .attr('stroke', '#C4C4C4'));

  // Add Y axis
  svg.append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(yAxis)
    .attr('class', 'text-body-2')
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line')
      .attr('stroke', '#C4C4C4')
      .attr('x1', width - marginLeft - marginRight))
    // Axis title
    .call(g => g.append('text')
      .text(yLabel)
      .attr('x', -17)
      .attr('y', 12)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start'));

  // Lines
  svg.append('g')
    .attr('fill', 'none')
    .attr('stroke-linecap', strokeLinecap)
    .attr('stroke-linejoin', strokeLinejoin)
    .attr('stroke-width', strokeWidth)
    .attr('stroke-opacity', strokeOpacity)
    .selectAll('path')
    .data(d3.group(I, i => Z[i]))
    .join('path')
      .style('mix-blend-mode', mixBlendMode)
      .attr('stroke', typeof color === 'function' ? ([z]) => color(z) : null)
      .attr('d', ([, I]) => line(I));

  // Points
  // svg.append('g')
  //   .selectAll('circle')
  //   .data(I)
  //   .join('circle')
  //   .attr('cx', i => xScale(X[i]))
  //   .attr('cy', i => yScale(Y[i]))
  //   .attr('r', 4)
  //   .attr('fill', i => color(Z[i]));

  // Create tooltip
  const tooltip = svg.append('g')
    .style('pointer-events', 'none')
    .attr('id', 'legend');

  d3.select('#legend')
    .append('g')
    .attr('id', 'legend-circles');

  // Create pointer
  svg.append('line')
    .attr('id', 'pointer-line');

  svg.append('g')
    .attr('id', 'pointer-points');


  // Tooltip
  function pointermoved(event) {

    // Compute chart data.
    const i = d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0]));    
    const date = X[i].toISOString().slice(0,10);
    const oSelect = O.filter(i => i.date === date);
    const iSelect = oSelect.map(i => O.indexOf(i));

    // Compute custom titles.
    const formatDate = xScale.tickFormat(null, '%Y');
    const formatText = oSelect.map(i => `${i.adminUnit}, ${d3.format(".1%")(i.value)}`);
    const title = `Jahr ${formatDate(X[i])}\n${formatText.join('\n')}`;

    const text = tooltip.selectAll('text')
      .data([,])
      .join('text')
      .attr('class', 'text-body-2')
      .attr('transform', 'translate(12,0)')
      .call(text => text
        .selectAll('tspan')
        .data(title.split(/\n/))
        .join('tspan')
          .attr('x', 0)
          .attr('y', (_, i) => `${i * 1.45}em`)
          .attr('font-weight', (_, i) => i ? null : '500')
          .text(d => d));


    tooltip.select('#legend-circles')
      .selectAll('circle')
      .data(iSelect)
      .join('circle')
      .attr('cx', 0)
      .attr('cy', (_, i) => `${i * 1.25}em`)
      .attr('r', 6)
      .attr('fill', i => color(Z[i]))
      .attr('shape-rendering', 'geometricPrecision')
      .attr('transform', 'translate(0,16)');

    // Pointer
    svg.select('#pointer-line')
      .attr('x1', xScale(X[i]))
      .attr('y1', marginTop)
      .attr('x2', xScale(X[i]))
      .attr('y2', height - marginBottom)
      .attr('stroke-width', 1)
      .attr('stroke', '#C4C4C4')
      .attr('stroke-dasharray', '4')
      .style('fill', 'none');

    svg.select('#pointer-points')
      .selectAll('circle')
      .data(iSelect)
      .join('circle')
      .attr('cx', xScale(X[i]))
      .attr('cy', i => yScale(Y[i]))
      .attr('r', 4)
      .attr('fill', i => color(Z[i]));
      
    const xPosition = xScale(X[i]) > width*0.75 ? xScale(X[i]) - 110 : xScale(X[i]);
    tooltip.attr('transform', `translate(${xPosition},${260})`);
    
    const {x, y, width: w, height: h} = text.node().getBBox();
    //text.attr('transform', `translate(${-w / 2},${15 - y})`);
    //path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    svg.property('value', O[i]).dispatch('input', {bubbles: true});
  }

  function pointerleft() {
    //tooltip.style('display', 'none');
    svg.node().value = null;
    svg.dispatch('input', {bubbles: true});
  }
}
