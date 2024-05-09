import * as d3 from 'd3';
import './ScatterPlot.css'
import { useEffect, useRef } from "react";
import VarDropdownMenu from '../VarDropdownMenu';

const ScatterPlot = ({ data, width, height, xAxisLabel, yAxisLabel, xTicks, yTicks, attributes, attributeState, selectionHandler, rerenderTrigger }) => {
    const svgRef = useRef();
    const margin = {top:10,bottom:50,right:1,left:60}

    useEffect(() => {
        if (Array.isArray(data)) {
            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .style('overflow', 'visible');

            svg.selectAll('*').remove();

            const x = d3.scaleLinear()
                .domain([Math.min.apply(Math, data.map(entry => entry[0])), Math.max.apply(Math, data.map(entry => entry[0]))])
                .range([0, width]);
            const y = d3.scaleLinear()
                .domain([Math.min.apply(Math, data.map(entry => entry[1])), Math.max.apply(Math, data.map(entry => entry[1]))])
                .range([height, 0]);
            const xAxis = d3.axisBottom(x).ticks(data.length).ticks((xTicks === undefined) ? 10 : xTicks);
            const yAxis = d3.axisLeft(y).ticks((yTicks === undefined) ? 10 : yTicks);
            if(xAxisLabel === "Volume") {
                xAxis.tickFormat(d3.format(".0e"))
            }
            if (yAxisLabel === "Volume") {
                yAxis.tickFormat(d3.format(".0e"))
            }
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
                .attr('x', width/2 - 20)
                .attr('y', margin.top)
                .attr('fill', 'white')
                .text('Scatter Plot');

            svg.selectAll()
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', entry => x(entry[0]))
                .attr('cy', entry => y(entry[1]))
                .attr('r', 2)
                .attr('fill', 'white');
        }
    }, [data]);

    return (
        <div style={{display:'flex', flexDirection: 'column', justifyContent:'center', alignItems:'center', marginTop:'30px'}}>
            <svg ref={svgRef} />
            <div style={{marginTop:'12%', background: 'lightgray', width: '90%', padding: '1%', display: 'flex', justifyContent:'center', alignItems:'center', borderRadius:'25px'}}>
                <div className='drop-menu'>
                    <VarDropdownMenu variables={attributes} displayText="x-axis" onChange={selectionHandler} axisControl={"x"} selectedAttr={attributeState} rerenderTrigger={rerenderTrigger}/>
                </div>
                <div className='drop-menu'>
                    <VarDropdownMenu variables={attributes} displayText="y-axis" onChange={selectionHandler} axisControl={"y"} selectedAttr={attributeState} rerenderTrigger={rerenderTrigger}/>
                </div>
            </div>
        </div>
    );
}

export default ScatterPlot;