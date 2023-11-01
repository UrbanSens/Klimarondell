import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HistogramPlot = ({ data }) => {
  const plotRef = useRef(null);

  useEffect(() => {
    // Clear existing plot
    d3.select(plotRef.current).select('g').remove();

    if (data && data.length > 0) {
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = 300 - margin.left - margin.right;
      const height = 150 - margin.top - margin.bottom;

      const svg = d3.select(plotRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([0, width]);

      const bins = d3.histogram().domain(x.domain()).thresholds(x.ticks(40))(data);

      const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append('g')
        .call(d3.axisLeft(y));

      svg.selectAll('rect')
        .data(bins)
        .enter().append('rect')
        .attr('x', 1)
        .attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`)
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => height - y(d.length))
        .style('fill', '#69b3a2');
    }
  }, [data]);

  return (
    <svg ref={plotRef} style={{ position: 'absolute', right: 0, bottom: 0 }}></svg>
  );
};

export default HistogramPlot;
