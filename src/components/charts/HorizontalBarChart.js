
import { formatNumber } from '../../components/charts/localeExtD3.js';
import * as d3 from 'd3';

//
// Main function to draw the chart
// Implementation is based on Observable BarChart function
// Source: https://observablehq.com/@d3/horizontal-bar-chart
//

export const HorizontalBarChart = (id, data, {
  x = d => d, // given d in data, returns the (quantitative) x-value
  y = (d, i) => i, // given d in data, returns the (ordinal) y-value
  title, // given d in data, returns the title text
  marginTop = 20, // the top margin, in pixels
  marginRight = 0, // the right margin, in pixels
  marginBottom = 0, // the bottom margin, in pixels
  marginLeft = 0, // the left margin, in pixels
  width = 400, // the outer width of the chart, in pixels
  height = (35 * data.length) + 20, // outer height, in pixels
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  xFormat, // a format specifier string for the x-axis
  yPadding = 0.1, // amount of y-range to reserve to separate bars
  yDomain, // an array of (ordinal) y-values
  yRange, // [top, bottom]
  color // bar fill color
  } = {}) => {

  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);

  // Compute default domains, and unique the y-domain.
  if (xDomain === undefined) xDomain = [0, d3.max(X)];
  if (yDomain === undefined) yDomain = Y;
  yDomain = new d3.InternSet(yDomain);

  // Omit any data not present in the y-domain.
  const I = d3.range(X.length).filter(i => yDomain.has(Y[i]));

  // Compute the default height.
  if (height === undefined) height = Math.ceil((yDomain.size + yPadding) * 25) + marginTop + marginBottom;
  if (yRange === undefined) yRange = [marginTop, height - marginBottom];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = d3.scaleBand(yDomain, yRange).padding(yPadding);

  // Compute titles.
  if (title === undefined) {
    const formatValue = xScale.tickFormat(100, xFormat);
    title = i => `${formatValue(X[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => formatNumber(T(O[i], i, data));
  }

  // Create SVG
  const svg = d3.select(`#${id}`)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('shape-rendering', 'geometricPrecision')
    .attr('style', 'max-width: 100%; height: intrinsic; height: auto;');

  // Background bars
  svg.append('g')
    .selectAll('rect')
    .data(I)
    .join('rect')
      .attr('fill', '#C4C4C4')
      .attr('x', xScale(0))
      .attr('y', i => yScale(Y[i]))
      .attr('width', width)
      .attr('height', 6)
      // For tooltip
      .attr('class', 'main-bars')
      .attr('x-value', i => X[i])
      .attr('y-value', i => Y[i]);
  
  // Main bars
  svg.append('g')
    .selectAll('rect')
    .data(I)
    .join('rect')
      .attr('fill', color)
      .attr('x', xScale(0))
      .attr('y', i => yScale(Y[i]))
      .attr('width', i => xScale(X[i]) - xScale(0))
      .attr('height', 6)
      // For tooltip
      .attr('class', 'main-bars')
      .attr('x-value', i => X[i])
      .attr('y-value', i => Y[i]);

  // Titles text
  svg.append('g')
    .selectAll('text')
    .data(I)
    .join('text')
      .attr('text-anchor', 'start')
      .attr('class', 'text-body-2')
      .attr('x', 0)
      .attr('y', i => yScale(Y[i]) + yScale.bandwidth() / 2)
      .text(i => Y[i])
      .attr('dy', -22)
      .attr('dx', 0);

  // Titles values
  svg.append('g')
    .selectAll('text')
    .data(I)
    .join('text')
      .attr('text-anchor', 'start')
      .attr('class', 'text-body-2')
      .attr('x', width*0.83)
      .attr('y', i => yScale(Y[i]) + yScale.bandwidth() / 2)
      .text(title)
      .attr('dy', -22)
      .attr('dx', 0);
  };