import { formatNumber } from '../../components/charts/localeExtD3.js';
import * as d3 from 'd3';


//
// Main function to draw the chart
// Implementation is based on Observable BarChart function
// Source: https://observablehq.com/@d3/bar-chart
//

export const BarChart = (id, data, {
  x = (d, i) => i, // given d in data, returns the (ordinal) x-value
  y = d => d, // given d in data, returns the (quantitative) y-value
  z = () => 1, // given d in data, returns the (categorical) z-value
  title, // given d in data, returns the title text
  marginTop = 25, // top margin, in pixels
  marginRight = 5, // right margin, in pixels
  marginBottom = 100, // bottom margin, in pixels
  marginLeft = 25, // left margin, in pixels
  width = 400, // outer width, in pixels
  height = 310, // outer height, in pixels
  xDomain, // an array of (ordinal) x-values
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = d3.scaleLinear, // y-scale type
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  xPadding = 0.1, // amount of x-range to reserve to separate bars
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  colors = d3.schemeCategory10, // bar fill color, as a constant or a function of *z*
  zDomain
} = {}) => {

  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);
  const O = d3.map(data, d => d);

  // Compute default domains, and unique the x-domain.
  if (xDomain === undefined) xDomain = X;
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  xDomain = new d3.InternSet(xDomain);
  if (zDomain === undefined) zDomain = Z;
  zDomain = new d3.InternSet(zDomain);

  // Omit any data not present in the x-domain.
  const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

  // Construct scales, axes, and formats.
  const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
  const yScale = yType(yDomain, yRange);
  const color = d3.scaleOrdinal(zDomain, colors);
  const xTickValues = d3.range(0, X.length, 2).map(e => X[e]);
  const xAxis = d3.axisBottom(xScale).tickValues(xTickValues);
  const yAxis = d3.axisLeft(yScale).ticks(5, yFormat);

  // Compute titles.
  if (title === undefined) {
    const formatValue = yScale.tickFormat(100, yFormat);
    title = i => `${X[i]}\n${formatValue(Y[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }

  // Select SVG
  const svg = d3.select(`#${id}`)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .on('pointerenter pointermove', pointermoved)
    .on('pointerleave', pointerleft)
    .on('touchstart', event => event.preventDefault())
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

  // Add Y axis.
  svg.append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(yAxis)
    .attr('class', 'text-body-2')
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line')
      .attr('stroke', '#C4C4C4')
      .attr('x1', width - marginLeft - marginRight))
      .call(g => g.append('text')
          .attr('x', -marginLeft)
          .attr('y', 12)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text(yLabel));
  
  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .attr('class', 'text-body-2')
    // Ticks
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line')
      .attr('stroke', '#C4C4C4'));;

  // Add bars
  svg.append('g')
    .selectAll('rect')
    .data(I)
    .join('rect')
    .attr('x', i => xScale(X[i]))
    .attr('y', i => yScale(Y[i]))
    .attr('fill', i => color(Z[i]))
    .attr('height', i => yScale(0) - yScale(Y[i]))
    .attr('width', xScale.bandwidth())

  // Create tooltip
  const tooltip = svg.append('g')
    .style('pointer-events', 'none')
    .attr('id', `${id}Legend`);

  // Create pointer
  svg.append('line')
    .attr('id', `${id}PointerLine`);

  svg.append('g')
    .attr('id', `${id}PointerRect`);

  // Pattern
  svg
  .append('defs')
  .append('pattern')
    .attr('id', 'diagonalHatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
  .append('path')
    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
    .attr('stroke', '#FFFFFF')
    .attr('stroke-width', 0.5);

  // Tooltip
  function pointermoved(event) {

    // Compute chart data.
    const invertXScale = (p) => {
      // Invert d3 scale band
      let i = Math.floor((p - marginLeft) / xScale.step());
      // Adjust i if i not in range [0, X.length]
      i = (i < 0) ? 0 : (i >= X.length) ? X.length - 1 : i
      return i
    };

    const i = invertXScale(d3.pointer(event)[0]);
    const range = X[i];
    const oSelect = O.filter(i => i.rangeMin === range);
    const iSelect = oSelect.map(i => O.indexOf(i));

    const path = tooltip.selectAll('path')
      .data(iSelect)
      .join('path')
        .attr('shape-rendering', 'geometricPrecision')
        .attr('stroke', color(Z[i]))
        .attr('fill', color(Z[i]))
        .attr('stroke-width', 1);

    // Compute custom titles.
    const title = `Preis\nCHF ${oSelect[0].rangeMin}—${oSelect[0].rangeMax}\n${oSelect[0].quantity} offers`;

    const text = tooltip.selectAll('text')
      .data(iSelect)
      .join('text')
      .attr('class', 'text-body-2')
      //.attr('transform', 'translate(12,0)')
      .call(text => text
        .selectAll('tspan')
        .data(title.split(/\n/))
        .join('tspan')
          .attr('x', 0)
          .attr('y', (_, i) => i!==1 ? `${i * 1.45}em` : `${i * 1.3}em`)
          .attr('class', (_, i) => i===1 ? 'text-body-1' : 'text-body-2')
          .text(d => d));
          
    // Pointer
    svg.select(`#${id}PointerLine`)
      .attr('x1', xScale(X[i]) + xScale.step()*0.4)
      .attr('y1', marginTop)
      .attr('x2', xScale(X[i]) + xScale.step()*0.4)
      .attr('y2', height - marginBottom)
      .attr('stroke-width', 1)
      .attr('stroke', color(Z[i]))
      .attr('stroke-dasharray', '4')
      .style('fill', 'none');

    svg.select(`#${id}PointerRect`)
      .selectAll('rect')
      .data(iSelect)
      .join('rect')
      .attr('x', xScale(X[i]))
      .attr('y', i => yScale(Y[i]))
      .attr('height', i => yScale(0) - yScale(Y[i]))
      .attr('width', xScale.bandwidth())
      .attr('fill', '#FFFFFF')
      .attr('stroke', i => color(Z[i]))
      .attr('stroke-width', 0.5)
      .attr('fill', 'url(#diagonalHatch)');

    tooltip.attr('transform', `translate(${xScale(X[i])},${260})`);
    const {x, y, width: w, height: h} = text.node().getBBox();
    text.attr('transform', `translate(${-w / 2},${0})`);
    path
      .attr('transform', `translate(0,${-18})`)
      .attr('d', `M ${-w/2} 0 H ${w/2} M ${x} 0 L ${x+5} -5 L ${x+10} 0 L ${x} 0`);
      //.attr('d', `M ${-w/2} 0 H ${w/2}`)
      //.attr('d', `M ${x} 0 L ${x+5} -5 L ${x+10} 0 L ${x} 0`);
    svg.property('value', O[i]).dispatch('input', {bubbles: true});
  }

  function pointerleft() {
    // tooltip.style('display', 'none');
    svg.node().value = null;
    svg.dispatch('input', { bubbles: true });
  }
}
