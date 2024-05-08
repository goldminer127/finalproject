import './ProfitLineGraph.css';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";

const {csv,select,scaleLinear,map,scaleBand,axisBottom,axisLeft,bin,max,range,format,selectAll,line,bisect} = d3;
const margin = {top:20,bottom:20,right:10,left:40}
const width = window.innerWidth * .4
const height = window.innerHeight * .5



function ProfitLineGraph({categoryNames,vooData, allData}) {
    const svgRef = useRef();
    useEffect(() => {
        if(allData!==undefined && allData[0]!==undefined){
            console.log(categoryNames)
            console.log(vooData)
            console.log(allData)
        }
    })
    return(
        <>
            <svg ref={svgRef}></svg>
        </>
    )
}

export default ProfitLineGraph;