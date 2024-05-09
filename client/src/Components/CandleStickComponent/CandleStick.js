import * as d3 from 'd3';
import './ScatterPlot.css'
import { useEffect, useRef } from "react";

const CandleStick = ({ data, width, height, xAxisLabel, yAxisLabel, xTicks, yTicks}) => {
    const svgRef = useRef();

    useEffect(() => {
        //Data[1] contains [high,low,open,close] values in that index order
        if (Array.isArray(data)) {
            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .style('overflow', 'visible');

            svg.selectAll('*').remove();

            const x = d3.scaleBand()
                .domain(data.map(entry => entry[0]))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([Math.min.apply(Math, data.map(entry => entry[1][1])), Math.max.apply(Math, data.map(entry => entry[1][0]))])
                .range([height, 0]);

            const xAxis = d3.axisBottom(x).ticks(data.length).ticks((xTicks === undefined) ? 10 : xTicks);
            const yAxis = d3.axisLeft(y).ticks((yTicks === undefined) ? 10 : yTicks);
            svg.append('g')
                .call(xAxis)
                .attr('transform', 'translate(0,' + height + ')');
            svg.append('g')
                .call(yAxis);
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + 35)
                .attr('fill', 'white')
                .text(xAxisLabel);
            svg.append('text')
                .attr('transform', 'rotate(270)')
                .attr('y', -33)
                .attr('x', -height / 2)
                .attr('fill', 'white')
                .text(yAxisLabel);
            svg.append('text')
                .attr('x', width / 2 - 20)
                .attr('y', -10)
                .attr('fill', 'white')
                .text('Candle Stick Plot');

            // Show the main vertical line
            svg
                .append("line")
                .data(data)
                .attr("x1", entry => x(entry[0]))
                .attr("x2", entry => x(entry[0]))
                .attr("y1", entry => y(entry[1][0]))
                .attr("y2", entry => y(entry[1][1]))
                .attr("stroke", "white")

            // Show the box
            svg
                .append("rect")
                .data(data)
                .attr("x", entry => x(entry[0]) - 10/2)
                .attr("y", entry => x(entry[1][3]))
                .attr("height", entry => Math.abs(y(entry[1][2]) - y(entry[1][3])))
                .attr("width", 10)
                .attr("stroke", "white")
                .style("fill", "#69b3a2")

            // show median, min and max horizontal lines
            svg
                .selectAll("toto")
                .data(data)
                .enter()
                .append("line")
                .attr("y1", entry => y(entry[1][0]))
                .attr("y2", entry => y(entry[1][1]))
                .attr("stroke", "white")
        }
    }, [data]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
            <svg ref={svgRef} />
        </div>
    );
}

export default CandleStick;